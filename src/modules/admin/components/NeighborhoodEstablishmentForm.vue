<script setup lang="ts">
import { ref, watch } from 'vue'
import type { Establishment } from '@/shared/services/establishmentService'
import {
  associateNeighborhoodEstablishments,
  type AssociateEstablishmentsResult,
  type Neighborhood,
} from '@/shared/services/neighborhoodService'

const props = defineProps<{
  neighborhood: Neighborhood
  establishments: Establishment[]
}>()

const selectedIds = ref<number[]>([])
const error = ref<string | null>(null)

watch(
  () => props.neighborhood.id,
  () => {
    selectedIds.value = []
    error.value = null
  },
)

async function submit(): Promise<AssociateEstablishmentsResult> {
  error.value = null
  const result = await associateNeighborhoodEstablishments(props.neighborhood.id, selectedIds.value)
  if (!result.ok) error.value = result.error.message
  return result
}

defineExpose({ submit })
</script>

<template>
  <v-form
    class="flex flex-col gap-1"
    data-test-id="neighborhood-establishment-form"
    @submit.prevent
  >
    <v-text-field
      data-test-id="neighborhood-establishment-neighborhood"
      disabled
      label="Neighborhood"
      :model-value="neighborhood.name"
      variant="outlined"
    />
    <div
      id="neighborhood-establishment-form"
      class="flex flex-col"
      data-test-id="neighborhood-establishment-list"
    >
      <v-checkbox
        v-for="establishment in establishments"
        :key="establishment.id"
        v-model="selectedIds"
        color="primary"
        density="compact"
        hide-details
        :label="establishment.name"
        :value="establishment.id"
        :data-test-id="`neighborhood-establishment-${establishment.id}`"
      />
    </div>
    <p v-if="error" class="text-sm text-flame" data-test-id="neighborhood-establishment-error">
      {{ error }}
    </p>
  </v-form>
</template>

<style scoped>
#neighborhood-establishment-form {
  max-height: 250px;
  overflow-y: auto;
}
</style>
