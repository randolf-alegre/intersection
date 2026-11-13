<script setup lang="ts">
import { useIdSelection } from '@/modules/admin/composables/useIdSelection'
import type { Establishment } from '@/shared/services/establishmentService'
import {
  associateNeighborhoodEstablishments,
  type Neighborhood,
} from '@/shared/services/neighborhoodService'

const props = defineProps<{
  neighborhood: Neighborhood
  establishments: Establishment[]
}>()

const { selectedIds, error, submit } = useIdSelection(
  () => props.neighborhood.id,
  (id, ids) => associateNeighborhoodEstablishments(id, ids),
)

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
