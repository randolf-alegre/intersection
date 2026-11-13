<script setup lang="ts">
import { ref, watch } from 'vue'
import type { VForm } from 'vuetify/components'
import { useConfirmDelete } from '@/modules/admin/composables/useConfirmDelete'
import { useEstablishmentCategoryStore } from '@/modules/admin/stores/establishmentCategoryStore'
import type {
  EstablishmentCategory,
  EstablishmentCategoryFields,
} from '@/shared/services/establishmentCategoryService'

const props = defineProps<{
  category?: EstablishmentCategory | null
}>()

const emit = defineEmits<{
  deleted: []
}>()

const categoryStore = useEstablishmentCategoryStore()
const { confirmingDelete, deleting, deleteError, resetDelete, confirmDelete } = useConfirmDelete(
  () => props.category?.id,
  (id) => categoryStore.removeCategory(id),
  () => emit('deleted'),
)
const name = ref('')
const form = ref<VForm | null>(null)

const required = (value: string) => value.trim().length > 0 || 'Name is required'

watch(
  () => props.category,
  (category) => {
    name.value = category?.name ?? ''
    resetDelete()
  },
  { immediate: true },
)

async function submit(): Promise<EstablishmentCategoryFields | null> {
  const result = await form.value?.validate()
  if (!result?.valid) return null

  return { name: name.value.trim() }
}

defineExpose({ submit })
</script>

<template>
  <div class="mb-4 flex items-center justify-between gap-3">
    <h2 class="text-2xl leading-tight font-extrabold text-flame">
      {{ category ? 'Update category' : 'Create category' }}
    </h2>
    <v-btn
      v-if="category"
      aria-label="Delete category"
      data-test-id="establishment-category-delete"
      icon
      variant="text"
      @click="confirmingDelete = true"
    >
      <v-icon color="primary" icon="mdi-delete" />
    </v-btn>
  </div>
  <v-form
    ref="form"
    class="flex flex-col gap-1"
    data-test-id="establishment-category-form"
    @submit.prevent
  >
    <v-text-field
      v-model="name"
      data-test-id="establishment-category-name"
      label="Name"
      :rules="[required]"
      variant="outlined"
    />
  </v-form>

  <v-dialog v-model="confirmingDelete" max-width="420">
    <v-card data-test-id="establishment-category-delete-dialog">
      <v-card-title class="pt-5 text-2xl font-extrabold text-flame">Delete category</v-card-title>
      <v-card-text class="text-base leading-normal text-ink">
        Delete {{ category?.name }}?
        <p
          v-if="deleteError"
          class="mt-3 text-sm text-flame"
          data-test-id="establishment-category-delete-error"
        >
          {{ deleteError }}
        </p>
      </v-card-text>
      <v-card-actions class="px-4 pt-0 pb-4">
        <v-spacer />
        <v-btn
          data-test-id="establishment-category-delete-cancel"
          variant="text"
          @click="confirmingDelete = false"
        >
          Cancel
        </v-btn>
        <v-btn
          class="!rounded-[10px] !font-extrabold !tracking-[0.04em] !uppercase hover:!bg-flame-dark"
          color="primary"
          data-test-id="establishment-category-delete-confirm"
          :loading="deleting"
          @click="confirmDelete"
        >
          Okay
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
