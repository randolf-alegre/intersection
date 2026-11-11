<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import type { Neighborhood } from '@/shared/services/neighborhoodService'

defineProps<{
  neighborhoods: Neighborhood[]
}>()

const route = useRoute()
const propertyId = computed(() => {
  const id = route.params.property_id
  return typeof id === 'string' ? id : ''
})
</script>

<template>
  <p
    v-if="neighborhoods.length === 0"
    class="flex min-h-[calc(100vh-12rem)] items-center justify-center text-center text-lg text-ink"
    data-test-id="neighborhood-empty"
  >
    No Neighborhood Found
  </p>
  <div v-else class="flex flex-col gap-4" data-test-id="neighborhood-list">
    <RouterLink
      v-for="neighborhood in neighborhoods"
      :key="neighborhood.id"
      class="block text-inherit no-underline"
      :data-test-id="`neighborhood-${neighborhood.id}`"
      :to="`/properties/${propertyId}/neighborhoods/${neighborhood.id}/establishments`"
    >
      <v-card class="px-1 py-2 pb-3" color="white">
        <v-card-title
          class="text-[1.75rem] leading-[1.1] font-extrabold whitespace-normal text-flame"
        >
          {{ neighborhood.name }}
        </v-card-title>
        <v-card-text class="text-base leading-normal text-ink">
          <p class="mt-2">{{ neighborhood.description }}</p>
          <p class="mt-2">{{ neighborhood.hashtagDescription }}</p>
          <p>{{ neighborhood.hashtag }}</p>
          <p class="mt-2 text-muted">City: {{ neighborhood.city }}</p>
          <p class="mt-2 text-muted">Tags: {{ neighborhood.tags }}</p>
          <v-btn
            block
            class="!rounded-[10px] !font-medium !tracking-[0.04em] !uppercase hover:!bg-flame-dark"
            color="primary"
            size="large"
          >
            View hidden gems
          </v-btn>
        </v-card-text>
      </v-card>
    </RouterLink>
  </div>
</template>
