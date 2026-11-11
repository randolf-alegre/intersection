<script setup lang="ts">
import { reactive, ref, watch } from 'vue'
import type { VForm } from 'vuetify/components'
import { useEstablishmentStore } from '@/modules/guest/stores/establishmentStore'
import type { EstablishmentCategory } from '@/shared/services/establishmentCategoryService'
import type { Establishment, EstablishmentFields } from '@/shared/services/establishmentService'

export type EstablishmentFormValues = EstablishmentFields

const props = defineProps<{
  establishment?: Establishment | null
  categories: EstablishmentCategory[]
}>()

const emit = defineEmits<{
  deleted: []
}>()

const establishmentStore = useEstablishmentStore()
const confirmingDelete = ref(false)
const deleting = ref(false)
const deleteError = ref<string | null>(null)

const fields = reactive<EstablishmentFields>({
  name: '',
  establishmentCategoryId: null,
  short: '',
  long: '',
  maps: '',
  coverImage: '',
  tags: '',
})
const form = ref<VForm | null>(null)

const required = (label: string) => (value: string) =>
  value.trim().length > 0 || `${label} is required`

const url = (label: string) => (value: string) => {
  try {
    const parsed = new URL(value.trim())
    return parsed.protocol === 'http:' || parsed.protocol === 'https:' || `${label} must be a URL`
  } catch {
    return `${label} must be a URL`
  }
}

watch(
  () => props.establishment,
  (establishment) => {
    fields.name = establishment?.name ?? ''
    fields.establishmentCategoryId = establishment?.establishmentCategoryId ?? null
    fields.short = establishment?.short ?? ''
    fields.long = establishment?.long ?? ''
    fields.maps = establishment?.maps ?? ''
    fields.coverImage = establishment?.coverImage ?? ''
    fields.tags = establishment?.tags ?? ''
    confirmingDelete.value = false
    deleteError.value = null
  },
  { immediate: true },
)

async function confirmDelete() {
  const establishment = props.establishment
  if (!establishment) return

  deleting.value = true
  deleteError.value = null
  try {
    const result = await establishmentStore.removeEstablishment(establishment.id)
    if (!result.ok) {
      deleteError.value = result.error.message
      return
    }

    confirmingDelete.value = false
    emit('deleted')
  } finally {
    deleting.value = false
  }
}

async function submit(): Promise<EstablishmentFormValues | null> {
  const result = await form.value?.validate()
  if (!result?.valid) return null

  return {
    name: fields.name.trim(),
    establishmentCategoryId: fields.establishmentCategoryId,
    short: fields.short.trim(),
    long: fields.long.trim(),
    maps: fields.maps.trim(),
    coverImage: fields.coverImage.trim(),
    tags: fields.tags.trim(),
  }
}

defineExpose({ submit })
</script>

<template>
  <div class="mb-4 flex items-center justify-between gap-3">
    <h2 class="text-2xl leading-tight font-extrabold text-flame">
      {{ establishment ? 'Update establishment' : 'Create establishment' }}
    </h2>
    <v-btn
      v-if="establishment"
      aria-label="Delete establishment"
      data-test-id="establishment-delete"
      icon
      variant="text"
      @click="confirmingDelete = true"
    >
      <v-icon color="primary" icon="mdi-delete" />
    </v-btn>
  </div>
  <v-form ref="form" class="flex flex-col gap-1" data-test-id="establishment-form" @submit.prevent>
    <v-text-field
      v-model="fields.name"
      data-test-id="establishment-name"
      label="Name"
      :rules="[required('Name')]"
      variant="outlined"
    />
    <v-select
      v-model="fields.establishmentCategoryId"
      clearable
      data-test-id="establishment-category"
      item-title="name"
      item-value="id"
      :items="categories"
      label="Category"
      variant="outlined"
    />
    <v-text-field
      v-model="fields.short"
      data-test-id="establishment-short"
      label="Short"
      :rules="[required('Short')]"
      variant="outlined"
    />
    <v-textarea
      v-model="fields.long"
      data-test-id="establishment-long"
      label="Long"
      :rules="[required('Long')]"
      variant="outlined"
    />
    <v-text-field
      v-model="fields.maps"
      data-test-id="establishment-maps"
      label="Maps"
      :rules="[required('Maps'), url('Maps')]"
      variant="outlined"
    />
    <v-text-field
      v-model="fields.coverImage"
      data-test-id="establishment-cover-image"
      label="Cover image"
      :rules="[required('Cover image'), url('Cover image')]"
      variant="outlined"
    />
    <v-text-field
      v-model="fields.tags"
      data-test-id="establishment-tags"
      label="Tags"
      variant="outlined"
    />
  </v-form>

  <v-dialog v-model="confirmingDelete" max-width="420">
    <v-card data-test-id="establishment-delete-dialog">
      <v-card-title class="pt-5 text-2xl font-extrabold text-flame"
        >Delete establishment</v-card-title
      >
      <v-card-text class="text-base leading-normal text-ink">
        Delete {{ establishment?.name }}?
        <p
          v-if="deleteError"
          class="mt-3 text-sm text-flame"
          data-test-id="establishment-delete-error"
        >
          {{ deleteError }}
        </p>
      </v-card-text>
      <v-card-actions class="px-4 pt-0 pb-4">
        <v-spacer />
        <v-btn
          data-test-id="establishment-delete-cancel"
          variant="text"
          @click="confirmingDelete = false"
        >
          Cancel
        </v-btn>
        <v-btn
          class="!rounded-[10px] !font-extrabold !tracking-[0.04em] !uppercase hover:!bg-flame-dark"
          color="primary"
          data-test-id="establishment-delete-confirm"
          :loading="deleting"
          @click="confirmDelete"
        >
          Okay
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
