import { isAxiosError, isCancel } from 'axios'
import { api } from '@/shared/services/api'
import { errorMessage } from '@/shared/services/common'

export type PropertyNeighborhoodAssociation = {
  property: number
  neighborhood_ids: number[]
}

export type PropertyNeighborhoodFailure = {
  message: string
  status: number
}

export type PropertyNeighborhoodResult =
  { ok: true } | { ok: false; error: PropertyNeighborhoodFailure }

export type NeighborhoodPropertyAssociation = {
  neighborhood: number
  property_ids: number[]
}

export async function associateNeighborhoodProperties(
  neighborhood: number,
  propertyIds: number[],
): Promise<PropertyNeighborhoodResult> {
  const payload: NeighborhoodPropertyAssociation = {
    neighborhood,
    property_ids: propertyIds,
  }

  try {
    const response = await api.post('neighborhoods/associate_properties', payload)
    if (response.status === 404) {
      return {
        ok: false,
        error: {
          message: errorMessage(response.data, 'Unable to associate properties'),
          status: response.status,
        },
      }
    }

    return { ok: true }
  } catch (error) {
    if (isCancel(error)) return { ok: false, error: { message: 'Session expired', status: 401 } }
    if (!isAxiosError(error) || !error.response) {
      return { ok: false, error: { message: 'Unable to reach the association service', status: 0 } }
    }

    return {
      ok: false,
      error: {
        message: errorMessage(error.response.data, 'Unable to associate properties'),
        status: error.response.status,
      },
    }
  }
}

export async function associatePropertyNeighborhoods(
  property: number,
  neighborhoodIds: number[],
): Promise<PropertyNeighborhoodResult> {
  const payload: PropertyNeighborhoodAssociation = {
    property,
    neighborhood_ids: neighborhoodIds,
  }

  try {
    const response = await api.post('properties/associate_neighborhoods', payload)
    if (response.status === 404) {
      return {
        ok: false,
        error: {
          message: errorMessage(response.data, 'Unable to associate neighborhoods'),
          status: response.status,
        },
      }
    }

    return { ok: true }
  } catch (error) {
    if (isCancel(error)) return { ok: false, error: { message: 'Session expired', status: 401 } }
    if (!isAxiosError(error) || !error.response) {
      return { ok: false, error: { message: 'Unable to reach the association service', status: 0 } }
    }

    return {
      ok: false,
      error: {
        message: errorMessage(error.response.data, 'Unable to associate neighborhoods'),
        status: error.response.status,
      },
    }
  }
}
