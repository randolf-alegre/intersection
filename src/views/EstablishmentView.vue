<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import EstablishmentList from '@/components/EstablishmentList.vue'
import { useEstablishmentStore } from '@/stores/establishmentStore'
import { useNeighborhoodStore } from '@/stores/neighborhoodStore'
import { usePropertiesStore } from '@/stores/propertiesStore'

const route = useRoute()
const establishmentStore = useEstablishmentStore()
const neighborhoodStore = useNeighborhoodStore()
const propertiesStore = usePropertiesStore()

const propertyId = computed(() => {
  const id = route.params.property_id
  return typeof id === 'string' ? id : ''
})

const neighborhoodId = computed(() => {
  const id = route.params.neighborhood_id
  return typeof id === 'string' ? id : ''
})

const propertyName = computed(() => {
  const property = propertiesStore.properties.find((item) => String(item.id) === propertyId.value)
  return property?.name ?? 'Property'
})

const neighborhoodName = computed(() => {
  const neighborhood = neighborhoodStore.neighborhoods.find(
    (item) => String(item.id) === neighborhoodId.value,
  )
  return neighborhood?.name ?? 'Neighborhood'
})

const breadcrumbs = computed(() => [
  { title: 'Home', to: '/' },
  { title: propertyName.value, to: `/properties/${propertyId.value}` },
  { title: neighborhoodName.value, disabled: true },
])

onMounted(() => {
  if (!propertyId.value || !neighborhoodId.value) return

  if (propertiesStore.properties.length === 0) void propertiesStore.loadProperties()
  const neighborhoodLoaded = neighborhoodStore.neighborhoods.some(
    (item) => String(item.id) === neighborhoodId.value,
  )
  if (!neighborhoodLoaded) void neighborhoodStore.loadNeighborhoods(propertyId.value)

  void establishmentStore.loadEstablishments(propertyId.value, neighborhoodId.value)
})
</script>

<template>
  <v-breadcrumbs
    class="mb-6 px-0 pt-0 text-sm [&_a]:text-flame [&_a]:no-underline [&_.v-breadcrumbs-item--disabled]:text-ink [&_.v-breadcrumbs-item--disabled]:opacity-100"
    :items="breadcrumbs"
  />
  <div v-if="establishmentStore.loading">
    <v-progress-circular indeterminate color="primary" size="24" />
  </div>
  <div v-else-if="establishmentStore.error">
    <p class="text-lg text-ink">{{ establishmentStore.error }}</p>
  </div>
  <EstablishmentList v-else :establishments="establishmentStore.establishments" />
</template>
