<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import NeighborhoodList from '@/components/NeighborhoodList.vue'
import { useNeighborhoodStore } from '@/stores/neighborhoodStore'
import { usePropertiesStore } from '@/stores/propertiesStore'

const route = useRoute()
const neighborhoodStore = useNeighborhoodStore()
const propertiesStore = usePropertiesStore()

const propertyId = computed(() => {
  const id = route.params.property_id
  return typeof id === 'string' ? id : ''
})

const propertyName = computed(() => {
  const property = propertiesStore.properties.find(
    (item) => String(item.id) === propertyId.value,
  )
  return property?.name ?? 'Property'
})

const breadcrumbs = computed(() => [
  { title: 'Home', to: '/' },
  { title: propertyName.value, disabled: true },
])

onMounted(() => {
  if (!propertyId.value) return
  if (propertiesStore.properties.length === 0) void propertiesStore.loadProperties()
  void neighborhoodStore.loadNeighborhoods(propertyId.value)
})
</script>

<template>
  <v-breadcrumbs
    class="mb-6 px-0 pt-0 text-sm [&_a]:text-flame [&_a]:no-underline [&_.v-breadcrumbs-item--disabled]:text-ink [&_.v-breadcrumbs-item--disabled]:opacity-100"
    :items="breadcrumbs"
  />
  <div v-if="neighborhoodStore.loading">
    <v-progress-circular indeterminate color="primary" size="24" />
  </div>
  <div v-else-if="neighborhoodStore.error">
    <p class="text-lg text-ink">{{ neighborhoodStore.error }}</p>
  </div>
  <div v-else>
    <NeighborhoodList :neighborhoods="neighborhoodStore.neighborhoods" />
  </div>
</template>
