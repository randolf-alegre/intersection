<script setup lang="ts">
import { onMounted } from 'vue'
import PropertyList from '@/modules/guest/components/PropertyList.vue'
import { usePropertiesStore } from '@/modules/guest/stores/propertiesStore'
import SearchForm from '@/shared/components/SearchForm.vue'

const propertiesStore = usePropertiesStore()

onMounted(() => {
  void propertiesStore.loadProperties()
})

async function onSearchProperties(name: string) {
  const query = name.trim()
  if (!query) {
    await propertiesStore.loadProperties()
    return
  }

  await propertiesStore.searchProperties(query)
}
</script>

<template>
  <section>
    <p class="text-[0.95rem] font-extrabold tracking-[0.08em] text-flame uppercase">
      Explore the best of Tokyo at your fingertips.
    </p>
    <h1
      class="text-[clamp(2.75rem,7vw,4.5rem)] leading-[0.92] font-black tracking-[-0.035em] text-flame"
    >
      Discover Tokyo's hidden gems.
    </h1>
    <p class="text-lg leading-normal text-ink">
      Live like a local in Tokyo. InterSection combines apartment space with hotel ease, for stays
      as short or as long as you need.
    </p>
  </section>
  <search-form :label="'Search for a property'" :on-search="onSearchProperties" />
  <p v-if="propertiesStore.errorSearchProperties" class="mt-4 text-lg text-ink text-center">
    {{ propertiesStore.errorSearchProperties }}
  </p>
  <div v-if="propertiesStore.loading">
    <v-progress-circular indeterminate color="primary" size="24" />
  </div>
  <div v-else-if="propertiesStore.error && propertiesStore.properties.length === 0">
    <p class="text-lg text-ink">{{ propertiesStore.error }}</p>
  </div>
  <div v-else>
    <PropertyList :properties="propertiesStore.properties" />
    <p v-if="propertiesStore.error" class="mt-4 text-lg text-ink">
      {{ propertiesStore.error }}
    </p>
    <v-btn
      v-if="propertiesStore.hasNextPage"
      block
      color="primary"
      class="mt-4"
      :loading="propertiesStore.loadingMore"
      @click="propertiesStore.loadProperties"
    >
      Load more
    </v-btn>
  </div>
</template>
