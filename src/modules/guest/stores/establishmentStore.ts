import { ref } from 'vue'
import { defineStore } from 'pinia'
import {
  createEstablishment,
  deleteEstablishment,
  fetchEstablishments,
  getAllEstablishments,
  updateEstablishment,
  type Establishment,
  type EstablishmentFields,
} from '@/shared/services/establishmentService'

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

  async function loadAllEstablishments() {
    loading.value = true
    error.value = null

    try {
      const result = await getAllEstablishments()
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

  async function addEstablishment(fields: EstablishmentFields) {
    const result = await createEstablishment(fields)
    if (result.ok) establishments.value.push(result.establishment)
    return result
  }

  async function saveEstablishment(id: number, fields: EstablishmentFields) {
    const result = await updateEstablishment(id, fields)
    if (result.ok) {
      const index = establishments.value.findIndex((establishment) => establishment.id === id)
      if (index >= 0) establishments.value[index] = result.establishment
    }
    return result
  }

  async function removeEstablishment(id: number) {
    const result = await deleteEstablishment(id)
    if (result.ok) {
      establishments.value = establishments.value.filter((establishment) => establishment.id !== id)
    }
    return result
  }

  return {
    establishments,
    loading,
    error,
    loadEstablishments,
    loadAllEstablishments,
    addEstablishment,
    saveEstablishment,
    removeEstablishment,
  }
})
