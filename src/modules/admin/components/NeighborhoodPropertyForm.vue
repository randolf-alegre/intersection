<script setup lang="ts">
import { ref, watch } from 'vue'
import type { Neighborhood } from '@/shared/services/neighborhoodService'
import {
  associateNeighborhoodProperties,
  type PropertyNeighborhoodResult,
} from '@/shared/services/propertyNeighborhoodService'
import type { Property } from '@/shared/services/propertiesService'

const props = defineProps<{
  neighborhood: Neighborhood
  properties: Property[]
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

async function submit(): Promise<PropertyNeighborhoodResult> {
  error.value = null
  const result = await associateNeighborhoodProperties(props.neighborhood.id, selectedIds.value)
  if (!result.ok) error.value = result.error.message
  return result
}

defineExpose({ submit })
</script>

<template>
  <v-form class="flex flex-col gap-1" data-test-id="neighborhood-property-form" @submit.prevent>
    <v-text-field
      data-test-id="neighborhood-property-neighborhood"
      disabled
      label="Neighborhood"
      :model-value="neighborhood.name"
      variant="outlined"
    />
    <div
      class="flex flex-col"
      data-test-id="neighborhood-property-list"
      id="neighborhood-property-form"
    >
      <v-checkbox
        v-for="property in properties"
        :key="property.id"
        v-model="selectedIds"
        color="primary"
        density="compact"
        hide-details
        :label="property.name"
        :value="property.id"
        :data-test-id="`neighborhood-property-${property.id}`"
      />
    </div>
    <p v-if="error" class="text-sm text-flame" data-test-id="neighborhood-property-error">
      {{ error }}
    </p>
  </v-form>
</template>

<style scoped>
#neighborhood-property-form {
  max-height: 250px;
  overflow-y: auto;
}
</style>
