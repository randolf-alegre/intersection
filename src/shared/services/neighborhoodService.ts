import { isAxiosError, isCancel } from 'axios'
import { api } from '@/shared/services/api'
import { errorMessage } from '@/shared/services/common'

export interface Neighborhood {
  id: number
  name: string
  hashtag: string
  description: string
  hashtagDescription: string
  city: string
  tags: string
  createdAt: string
  updatedAt: string
  propertyId?: number
}

export type NeighborhoodsFailure = {
  message: string
  status: number
}

export type NeighborhoodFields = {
  name: string
  hashtag: string
  description: string
  hashtagDescription: string
  city: string
  tags: string
}

export type NeighborhoodsResult =
  { ok: true; neighborhoods: Neighborhood[] } | { ok: false; error: NeighborhoodsFailure }

export type NeighborhoodResult =
  { ok: true; neighborhood: Neighborhood } | { ok: false; error: NeighborhoodsFailure }

export type DeleteNeighborhoodResult = { ok: true } | { ok: false; error: NeighborhoodsFailure }

export type AssociateEstablishmentsResult =
  { ok: true } | { ok: false; error: NeighborhoodsFailure }

export function fetchNeighborhoods(propertyId: number | string) {
  return requestNeighborhoods(propertyId)
}

function neighborhoodsFailure(message: string, status: number): NeighborhoodsResult {
  return { ok: false, error: { message, status } }
}

function neighborhoodFailure(message: string, status: number): NeighborhoodResult {
  return { ok: false, error: { message, status } }
}

function deleteNeighborhoodFailure(message: string, status: number): DeleteNeighborhoodResult {
  return { ok: false, error: { message, status } }
}

export async function requestNeighborhoods(
  propertyId: number | string,
): Promise<NeighborhoodsResult> {
  try {
    const response = await api.get(`/properties/${propertyId}/neighborhoods`)
    if (response.status === 404) {
      return neighborhoodsFailure(
        errorMessage(response.data, 'Unable to load neighborhoods'),
        response.status,
      )
    }

    return { ok: true, neighborhoods: (response.data as Neighborhood[]) || [] }
  } catch (error) {
    if (isCancel(error)) return neighborhoodsFailure('Session expired', 401)
    if (!isAxiosError(error) || !error.response) {
      return neighborhoodsFailure('Unable to reach the neighborhoods service', 0)
    }

    return neighborhoodsFailure(
      errorMessage(error.response.data, 'Unable to load neighborhoods'),
      error.response.status,
    )
  }
}

export async function createNeighborhood(fields: NeighborhoodFields): Promise<NeighborhoodResult> {
  try {
    const response = await api.post(`/neighborhoods`, neighborhoodBody(fields))
    return readNeighborhood(
      response.status,
      response.data as Neighborhood,
      'Unable to create the neighborhood',
    )
  } catch (error) {
    return neighborhoodRequestFailure(error, 'Unable to create the neighborhood')
  }
}

export async function getAllNeighborhoods(): Promise<NeighborhoodsResult> {
  try {
    const response = await api.get<unknown>(`/neighborhoods/all`)
    if (response.status === 404) {
      return neighborhoodsFailure(
        errorMessage(response.data, 'Unable to load all neighborhoods'),
        response.status,
      )
    }

    return { ok: true, neighborhoods: (response.data as Neighborhood[]) || [] }
  } catch (error) {
    if (isCancel(error)) return neighborhoodsFailure('Session expired', 401)
    if (!isAxiosError(error) || !error.response) {
      return neighborhoodsFailure('Unable to reach the neighborhoods service', 0)
    }

    return neighborhoodsFailure(
      errorMessage(error.response.data, 'Unable to load all neighborhoods'),
      error.response.status,
    )
  }
}

export async function updateNeighborhood(
  neighborhoodId: number,
  fields: NeighborhoodFields,
): Promise<NeighborhoodResult> {
  try {
    const response = await api.put(`/neighborhoods/${neighborhoodId}`, neighborhoodBody(fields))
    return readNeighborhood(response.status, response.data, 'Unable to update the neighborhood')
  } catch (error) {
    return neighborhoodRequestFailure(error, 'Unable to update the neighborhood')
  }
}

export async function associateNeighborhoodEstablishments(
  neighborhoodId: number,
  establishmentIds: number[],
): Promise<AssociateEstablishmentsResult> {
  try {
    const response = await api.post('/neighborhoods/associate_establishments', {
      neighborhood: neighborhoodId,
      establishment_ids: establishmentIds,
    })
    if (response.status === 404) {
      return {
        ok: false,
        error: {
          message: errorMessage(response.data, 'Unable to associate establishments'),
          status: response.status,
        },
      }
    }

    return { ok: true }
  } catch (error) {
    if (isCancel(error)) return { ok: false, error: { message: 'Session expired', status: 401 } }
    if (!isAxiosError(error) || !error.response) {
      return {
        ok: false,
        error: { message: 'Unable to reach the neighborhoods service', status: 0 },
      }
    }

    return {
      ok: false,
      error: {
        message: errorMessage(error.response.data, 'Unable to associate establishments'),
        status: error.response.status,
      },
    }
  }
}

export async function deleteNeighborhood(
  neighborhoodId: number,
): Promise<DeleteNeighborhoodResult> {
  try {
    const response = await api.delete(`/neighborhoods/${neighborhoodId}`)
    if (response.status === 404) {
      return deleteNeighborhoodFailure(
        errorMessage(response.data, 'Unable to delete the neighborhood'),
        response.status,
      )
    }

    return { ok: true }
  } catch (error) {
    if (isCancel(error)) return deleteNeighborhoodFailure('Session expired', 401)
    if (!isAxiosError(error) || !error.response) {
      return deleteNeighborhoodFailure('Unable to reach the neighborhoods service', 0)
    }

    return deleteNeighborhoodFailure(
      errorMessage(error.response.data, 'Unable to delete the neighborhood'),
      error.response.status,
    )
  }
}

function neighborhoodBody(fields: NeighborhoodFields) {
  return {
    neighborhood: {
      name: fields.name,
      hashtag: fields.hashtag,
      description: fields.description,
      hashtag_description: fields.hashtagDescription,
      city: fields.city,
      tags: fields.tags,
    },
  }
}

function readNeighborhood(
  status: number,
  data: Neighborhood,
  fallback: string,
): NeighborhoodResult {
  if (status === 404) return neighborhoodFailure(errorMessage(data, fallback), status)
  return { ok: true, neighborhood: data }
}

function neighborhoodRequestFailure(error: unknown, fallback: string): NeighborhoodResult {
  if (isCancel(error)) return neighborhoodFailure('Session expired', 401)
  if (!isAxiosError(error) || !error.response) {
    return neighborhoodFailure('Unable to reach the neighborhoods service', 0)
  }

  return neighborhoodFailure(errorMessage(error.response.data, fallback), error.response.status)
}
