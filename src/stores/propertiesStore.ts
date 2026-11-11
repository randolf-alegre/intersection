import { ref } from 'vue'
import { defineStore } from 'pinia'
import {
  fetchProperties,
  requestSearchProperties,
  type Property,
} from '@/services/propertiesService'

export const usePropertiesStore = defineStore('propertiesStore', () => {
  const properties = ref<Property[]>([])
  const loadingSearchProperties = ref(false)
  const errorSearchProperties = ref<string | null>(null)
  const loading = ref(false)
  const loadingMore = ref(false)
  const error = ref<string | null>(null)
  const hasNextPage = ref(false)
  const page = ref(1)
  let searchRequest = 0

  async function searchProperties(name: string) {
    const requestId = ++searchRequest
    loadingSearchProperties.value = true
    errorSearchProperties.value = null

    try {
      const result = await requestSearchProperties(name)
      if (requestId !== searchRequest) return

      if (!result.ok) {
        errorSearchProperties.value = result.error.message
        return
      }

      properties.value = result.properties
    } finally {
      if (requestId === searchRequest) loadingSearchProperties.value = false
    }
  }

  async function loadProperties() {
    if (loading.value || loadingMore.value) return

    const appending = page.value > 1
    searchRequest += 1
    if (appending) loadingMore.value = true
    else loading.value = true
    error.value = null
    errorSearchProperties.value = null

    try {
      const result = await fetchProperties(page.value)
      if (!result.ok) {
        if (!appending) properties.value = []
        error.value = result.error.message
        return
      }

      properties.value = [...properties.value, ...result.properties]
      hasNextPage.value = result.hasNextPage
      if (hasNextPage.value) page.value++
    } finally {
      loading.value = false
      loadingMore.value = false
    }
  }

  return {
    properties,
    loading,
    loadingMore,
    error,
    loadingSearchProperties,
    errorSearchProperties,
    hasNextPage,
    loadProperties,
    searchProperties,
  }
})
