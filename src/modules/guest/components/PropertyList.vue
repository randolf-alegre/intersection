<script setup lang="ts">
import type { Property } from '@/shared/services/propertiesService'

defineProps<{
  properties: Property[]
}>()
</script>

<template>
  <TransitionGroup
    tag="div"
    name="property"
    class="mt-10 flex flex-col gap-4 md:mt-16"
    data-test-id="property-list"
  >
    <RouterLink
      v-for="property in properties"
      :key="property.id"
      class="block text-inherit no-underline"
      :data-test-id="`property-${property.id}`"
      :to="`/properties/${property.id}`"
    >
      <v-card class="px-1 py-2 pb-3" color="peach">
        <v-card-title
          class="text-[1.75rem] leading-[1.1] font-extrabold whitespace-normal text-flame"
        >
          {{ property.name }}
        </v-card-title>
        <v-card-text class="text-base leading-normal text-ink">
          <p>{{ property.description }}</p>
          <p class="mt-2 text-muted">{{ property.address }}</p>
        </v-card-text>
      </v-card>
    </RouterLink>
  </TransitionGroup>
</template>

<style scoped>
.property-enter-active {
  transition:
    opacity 0.35s ease,
    transform 0.35s ease;
}

.property-enter-from {
  opacity: 0;
  transform: translateY(12px);
}

@media (prefers-reduced-motion: reduce) {
  .property-enter-active {
    transition: none;
  }
}
</style>
