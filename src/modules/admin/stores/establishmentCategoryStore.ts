import { ref } from 'vue'
import { defineStore } from 'pinia'
import {
  deleteEstablishmentCategory,
  fetchEstablishmentCategories,
  type EstablishmentCategory,
} from '@/shared/services/establishmentCategoryService'

export const useEstablishmentCategoryStore = defineStore('establishmentCategoryStore', () => {
  const categories = ref<EstablishmentCategory[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function loadCategories() {
    loading.value = true
    error.value = null

    try {
      const result = await fetchEstablishmentCategories()
      if (!result.ok) {
        categories.value = []
        error.value = result.error.message
        return
      }

      categories.value = result.categories
    } finally {
      loading.value = false
    }
  }

  async function removeCategory(id: number) {
    const result = await deleteEstablishmentCategory(id)
    if (result.ok) {
      categories.value = categories.value.filter((category) => category.id !== id)
    }
    return result
  }

  return {
    categories,
    loading,
    error,
    loadCategories,
    removeCategory,
  }
})
