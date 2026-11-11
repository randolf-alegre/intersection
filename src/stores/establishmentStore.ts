import { ref } from 'vue'
import { defineStore } from 'pinia'
import { fetchEstablishments, type Establishment } from '@/services/establishmentService'

export const useEstablishmentStore = defineStore('establishmentStore', () => {
  const establishments = ref<Establishment[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function loadEstablishments(propertyId: number | string, neighborhoodId: number | string) {
    loading.value = true
    error.value = null

    try {
      const result = await fetchEstablishments(propertyId, neighborhoodId)
      if (!result.ok) {
        establishments.value = []
        error.value = result.error.message
        return
      }

      establishments.value = result.establishments
    } finally {
      loading.value = false
    }
  }

  return {
    establishments,
    loading,
    error,
    loadEstablishments,
  }
})
