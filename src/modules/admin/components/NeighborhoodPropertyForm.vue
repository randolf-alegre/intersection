<script setup lang="ts">
import { useIdSelection } from '@/modules/admin/composables/useIdSelection'
import type { Neighborhood } from '@/shared/services/neighborhoodService'
import { associateNeighborhoodProperties } from '@/shared/services/propertyNeighborhoodService'
import type { Property } from '@/shared/services/propertiesService'

const props = defineProps<{
  neighborhood: Neighborhood
  properties: Property[]
}>()

const { selectedIds, error, submit } = useIdSelection(
  () => props.neighborhood.id,
  (id, ids) => associateNeighborhoodProperties(id, ids),
)

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
