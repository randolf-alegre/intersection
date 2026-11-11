<script setup lang="ts">
import { reactive, ref, watch } from 'vue'
import type { VForm } from 'vuetify/components'
import { usePropertiesStore } from '@/modules/guest/stores/propertiesStore'
import type { Property, PropertyFields } from '@/shared/services/propertiesService'

const props = defineProps<{
  property?: Property | null
}>()

const emit = defineEmits<{
  deleted: []
}>()

const propertiesStore = usePropertiesStore()
const confirmingDelete = ref(false)
const deleting = ref(false)
const deleteError = ref<string | null>(null)

const fields = reactive<PropertyFields>({
  name: '',
  address: '',
  description: '',
})
const form = ref<VForm | null>(null)

const required = (label: string) => (value: string) =>
  value.trim().length > 0 || `${label} is required`

watch(
  () => props.property,
  (property) => {
    fields.name = property?.name ?? ''
    fields.address = property?.address ?? ''
    fields.description = property?.description ?? ''
    confirmingDelete.value = false
    deleteError.value = null
  },
  { immediate: true },
)

async function confirmDelete() {
  if (!props.property) return

  deleting.value = true
  deleteError.value = null
  try {
    const result = await propertiesStore.removeProperty(props.property.id)
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

async function submit(): Promise<PropertyFields | null> {
  const result = await form.value?.validate()
  if (!result?.valid) return null

  return {
    name: fields.name.trim(),
    address: fields.address.trim(),
    description: fields.description.trim(),
  }
}

defineExpose({ submit })
</script>

<template>
  <div class="mb-4 flex items-center justify-between gap-3">
    <h2 class="text-2xl leading-tight font-extrabold text-flame">
      {{ property ? 'Update property' : 'Create property' }}
    </h2>
    <v-btn
      v-if="property"
      aria-label="Delete property"
      data-test-id="property-delete"
      icon
      variant="text"
      @click="confirmingDelete = true"
    >
      <v-icon color="primary" icon="mdi-delete" />
    </v-btn>
  </div>
  <v-form ref="form" class="flex flex-col gap-1" data-test-id="property-form" @submit.prevent>
    <v-text-field
      v-model="fields.name"
      data-test-id="property-name"
      label="Name"
      :rules="[required('Name')]"
      variant="outlined"
    />
    <v-text-field
      v-model="fields.address"
      data-test-id="property-address"
      label="Address"
      :rules="[required('Address')]"
      variant="outlined"
    />
    <v-textarea
      v-model="fields.description"
      data-test-id="property-description"
      label="Description"
      :rules="[required('Description')]"
      variant="outlined"
    />
  </v-form>

  <v-dialog v-model="confirmingDelete" max-width="420">
    <v-card data-test-id="property-delete-dialog">
      <v-card-title class="pt-5 text-2xl font-extrabold text-flame">Delete property</v-card-title>
      <v-card-text class="text-base leading-normal text-ink">
        Delete {{ property?.name }}?
        <p v-if="deleteError" class="mt-3 text-sm text-flame" data-test-id="property-delete-error">
          {{ deleteError }}
        </p>
      </v-card-text>
      <v-card-actions class="px-4 pt-0 pb-4">
        <v-spacer />
        <v-btn
          data-test-id="property-delete-cancel"
          variant="text"
          @click="confirmingDelete = false"
        >
          Cancel
        </v-btn>
        <v-btn
          class="!rounded-[10px] !font-extrabold !tracking-[0.04em] !uppercase hover:!bg-flame-dark"
          color="primary"
          data-test-id="property-delete-confirm"
          :loading="deleting"
          @click="confirmDelete"
        >
          Okay
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
