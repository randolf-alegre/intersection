<script setup lang="ts">
import { ref, watch } from 'vue'
import { associatePropertyNeighborhoods } from '@/shared/services/propertyNeighborhoodService'
import type { Neighborhood } from '@/shared/services/neighborhoodService'
import type { Property } from '@/shared/services/propertiesService'
import type { PropertyNeighborhoodResult } from '@/shared/services/propertyNeighborhoodService'

const props = defineProps<{
  property: Property
  neighborhoods: Neighborhood[]
}>()

const selectedIds = ref<number[]>([])
const error = ref<string | null>(null)

watch(
  () => props.property.id,
  () => {
    selectedIds.value = []
    error.value = null
  },
)

async function submit(): Promise<PropertyNeighborhoodResult> {
  error.value = null
  const result = await associatePropertyNeighborhoods(props.property.id, selectedIds.value)
  if (!result.ok) error.value = result.error.message
  return result
}

defineExpose({ submit })
</script>

<template>
  <v-form class="flex flex-col gap-1" data-test-id="property-neighborhood-form" @submit.prevent>
    <v-text-field
      data-test-id="property-neighborhood-property"
      disabled
      label="Property"
      :model-value="property.name"
      variant="outlined"
    />
    <div
      class="flex flex-col"
      data-test-id="property-neighborhood-list"
      id="property-neighborhood-form"
    >
      <v-checkbox
        v-for="neighborhood in neighborhoods"
        :key="neighborhood.id"
        v-model="selectedIds"
        color="primary"
        density="compact"
        hide-details
        :label="neighborhood.name"
        :value="neighborhood.id"
        :data-test-id="`property-neighborhood-${neighborhood.id}`"
      />
    </div>
    <p v-if="error" class="text-sm text-flame" data-test-id="property-neighborhood-error">
      {{ error }}
    </p>
  </v-form>
</template>
<style scoped>
#property-neighborhood-form {
  max-height: 250px;
  overflow-y: auto;
}
</style>
