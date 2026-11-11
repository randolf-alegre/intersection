<script setup lang="ts">
import { ref } from 'vue'
import type { Establishment } from '@/services/establishmentService'

defineProps<{
  establishments: Establishment[]
}>()

const openMapIds = ref<number[]>([])
const loadingMapIds = ref<number[]>([])

function toggleMap(id: number) {
  if (loadingMapIds.value.includes(id)) return

  if (openMapIds.value.includes(id)) {
    openMapIds.value = openMapIds.value.filter((item) => item !== id)
    return
  }

  openMapIds.value = [...openMapIds.value, id]
  loadingMapIds.value = [...loadingMapIds.value, id]
}

function finishMapLoad(id: number) {
  loadingMapIds.value = loadingMapIds.value.filter((item) => item !== id)
}

function isMapOpen(id: number) {
  return openMapIds.value.includes(id)
}

function isMapLoading(id: number) {
  return loadingMapIds.value.includes(id)
}

function mapEmbedUrl(url: string) {
  try {
    const parsed = new URL(url)
    const query = parsed.searchParams.get('query') ?? parsed.searchParams.get('q')
    if (query) return `https://maps.google.com/maps?q=${encodeURIComponent(query)}&output=embed`
  } catch {
    return url
  }

  return url
}
</script>

<template>
  <div class="flex flex-col gap-4" data-test-id="establishment-list">
    <v-card
      v-for="establishment in establishments"
      :key="establishment.id"
      class="overflow-hidden"
      color="white"
      :data-test-id="`establishment-${establishment.id}`"
    >
      <v-img
        v-if="establishment.coverImage"
        :alt="establishment.name"
        cover
        :data-test-id="`establishment-cover-${establishment.id}`"
        height="220"
        :src="establishment.coverImage"
      />
      <v-card-title
        class="text-[1.75rem] leading-[1.1] font-extrabold whitespace-normal text-flame"
      >
        {{ establishment.name }}
      </v-card-title>
      <v-card-text class="text-base leading-normal text-ink">
        <p class="mt-2 text-muted italic">Short: {{ establishment.short }}</p>
        <p>{{ establishment.long }}</p>
        <p class="mt-2 text-muted">Tags: {{ establishment.tags }}</p>
        <v-btn
          class="mt-4 !rounded-[10px] !font-medium !tracking-[0.04em] !uppercase"
          color="primary"
          :data-test-id="`establishment-map-toggle-${establishment.id}`"
          :loading="isMapLoading(establishment.id)"
          variant="outlined"
          @click="toggleMap(establishment.id)"
        >
          {{
            isMapOpen(establishment.id) && !isMapLoading(establishment.id) ? 'Hide map' : 'Show map'
          }}
        </v-btn>
        <div v-if="isMapOpen(establishment.id)" class="mt-4 overflow-hidden rounded-[10px]">
          <iframe
            class="h-64 w-full border-0"
            :data-test-id="`establishment-map-${establishment.id}`"
            loading="lazy"
            referrerpolicy="no-referrer-when-downgrade"
            :src="mapEmbedUrl(establishment.maps)"
            :title="`${establishment.name} map`"
            @load="finishMapLoad(establishment.id)"
          />
        </div>
      </v-card-text>
    </v-card>
  </div>
</template>
