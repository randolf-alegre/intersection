<script setup lang="ts">
import { reactive, ref, watch } from 'vue'
import type { VForm } from 'vuetify/components'
import { useConfirmDelete } from '@/modules/admin/composables/useConfirmDelete'
import { useNeighborhoodStore } from '@/modules/guest/stores/neighborhoodStore'
import type { Neighborhood, NeighborhoodFields } from '@/shared/services/neighborhoodService'

export type NeighborhoodFormValues = NeighborhoodFields

const props = defineProps<{
  neighborhood?: Neighborhood | null
}>()

const emit = defineEmits<{
  deleted: []
}>()

const neighborhoodStore = useNeighborhoodStore()
const { confirmingDelete, deleting, deleteError, resetDelete, confirmDelete } = useConfirmDelete(
  () => props.neighborhood?.id,
  (id) => neighborhoodStore.removeNeighborhood(id),
  () => emit('deleted'),
)

const fields = reactive<NeighborhoodFields>({
  name: '',
  hashtag: '',
  description: '',
  hashtagDescription: '',
  city: '',
  tags: '',
})
const form = ref<VForm | null>(null)

const required = (label: string) => (value: string) =>
  value.trim().length > 0 || `${label} is required`

watch(
  () => props.neighborhood,
  (neighborhood) => {
    fields.name = neighborhood?.name ?? ''
    fields.hashtag = neighborhood?.hashtag ?? ''
    fields.description = neighborhood?.description ?? ''
    fields.hashtagDescription = neighborhood?.hashtagDescription ?? ''
    fields.city = neighborhood?.city ?? ''
    fields.tags = neighborhood?.tags ?? ''
    resetDelete()
  },
  { immediate: true },
)

async function submit(): Promise<NeighborhoodFormValues | null> {
  const result = await form.value?.validate()
  if (!result?.valid) return null

  return {
    name: fields.name.trim(),
    hashtag: fields.hashtag.trim(),
    description: fields.description.trim(),
    hashtagDescription: fields.hashtagDescription.trim(),
    city: fields.city.trim(),
    tags: fields.tags.trim(),
  }
}

defineExpose({ submit })
</script>

<template>
  <div class="mb-4 flex items-center justify-between gap-3">
    <h2 class="text-2xl leading-tight font-extrabold text-flame">
      {{ neighborhood ? 'Update neighborhood' : 'Create neighborhood' }}
    </h2>
    <v-btn
      v-if="neighborhood"
      aria-label="Delete neighborhood"
      data-test-id="neighborhood-delete"
      icon
      variant="text"
      @click="confirmingDelete = true"
    >
      <v-icon color="primary" icon="mdi-delete" />
    </v-btn>
  </div>
  <v-form ref="form" class="flex flex-col gap-1" data-test-id="neighborhood-form" @submit.prevent>
    <v-text-field
      v-model="fields.name"
      data-test-id="neighborhood-name"
      label="Name"
      :rules="[required('Name')]"
      variant="outlined"
    />
    <v-text-field
      v-model="fields.hashtag"
      data-test-id="neighborhood-hashtag"
      label="Hashtag"
      :rules="[required('Hashtag')]"
      variant="outlined"
    />
    <v-textarea
      v-model="fields.description"
      data-test-id="neighborhood-description"
      label="Description"
      :rules="[required('Description')]"
      variant="outlined"
    />
    <v-textarea
      v-model="fields.hashtagDescription"
      data-test-id="neighborhood-hashtag-description"
      label="Hashtag description"
      :rules="[required('Hashtag description')]"
      variant="outlined"
    />
    <v-text-field
      v-model="fields.city"
      data-test-id="neighborhood-city"
      label="City"
      :rules="[required('City')]"
      variant="outlined"
    />
    <v-text-field
      v-model="fields.tags"
      data-test-id="neighborhood-tags"
      label="Tags"
      :rules="[required('Tags')]"
      variant="outlined"
    />
  </v-form>

  <v-dialog v-model="confirmingDelete" max-width="420">
    <v-card data-test-id="neighborhood-delete-dialog">
      <v-card-title class="pt-5 text-2xl font-extrabold text-flame"
        >Delete neighborhood</v-card-title
      >
      <v-card-text class="text-base leading-normal text-ink">
        Delete {{ neighborhood?.name }}?
        <p
          v-if="deleteError"
          class="mt-3 text-sm text-flame"
          data-test-id="neighborhood-delete-error"
        >
          {{ deleteError }}
        </p>
      </v-card-text>
      <v-card-actions class="px-4 pt-0 pb-4">
        <v-spacer />
        <v-btn
          data-test-id="neighborhood-delete-cancel"
          variant="text"
          @click="confirmingDelete = false"
        >
          Cancel
        </v-btn>
        <v-btn
          class="!rounded-[10px] !font-extrabold !tracking-[0.04em] !uppercase hover:!bg-flame-dark"
          color="primary"
          data-test-id="neighborhood-delete-confirm"
          :loading="deleting"
          @click="confirmDelete"
        >
          Okay
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
