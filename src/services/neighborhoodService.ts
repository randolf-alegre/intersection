import { isAxiosError, isCancel } from 'axios'
import { api } from '@/services/api'
import { errorMessage } from '@/services/common'

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
}

export type NeighborhoodsFailure = {
  message: string
  status: number
}

export type NeighborhoodsResult =
  { ok: true; neighborhoods: Neighborhood[] } | { ok: false; error: NeighborhoodsFailure }

export function fetchNeighborhoods(propertyId: number | string) {
  return requestNeighborhoods(propertyId)
}

function neighborhoodsFailure(message: string, status: number): NeighborhoodsResult {
  return { ok: false, error: { message, status } }
}

export async function requestNeighborhoods(
  propertyId: number | string,
): Promise<NeighborhoodsResult> {
  try {
    const response = await api.get<unknown>(`/properties/${propertyId}/neighborhoods`)
    if (response.status === 404) {
      return neighborhoodsFailure(
        errorMessage(response.data, 'Unable to load neighborhoods'),
        response.status,
      )
    }
    if (!Array.isArray(response.data) || !response.data.every(isNeighborhood)) {
      return neighborhoodsFailure('Neighborhoods response was incomplete', response.status)
    }

    return { ok: true, neighborhoods: response.data }
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

function isNeighborhood(value: unknown): value is Neighborhood {
  if (!value || typeof value !== 'object') return false

  const neighborhood = value as Record<string, unknown>
  return (
    typeof neighborhood.id === 'number' &&
    typeof neighborhood.name === 'string' &&
    typeof neighborhood.hashtag === 'string' &&
    typeof neighborhood.description === 'string' &&
    typeof neighborhood.hashtagDescription === 'string' &&
    typeof neighborhood.city === 'string' &&
    typeof neighborhood.tags === 'string' &&
    typeof neighborhood.createdAt === 'string' &&
    typeof neighborhood.updatedAt === 'string'
  )
}
