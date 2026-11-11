import { isAxiosError, isCancel } from 'axios'
import { api } from '@/services/api'
import { errorMessage } from '@/services/common'

export interface Establishment {
  id: number
  name: string
  establishmentCategoryId: number
  short: string
  long: string
  maps: string
  string: string | null
  coverImage: string
  tags: string
  createdAt: string
  updatedAt: string
}

export type EstablishmentsFailure = {
  message: string
  status: number
}

export type EstablishmentsResult =
  { ok: true; establishments: Establishment[] } | { ok: false; error: EstablishmentsFailure }

export function fetchEstablishments(propertyId: number | string, neighborhoodId: number | string) {
  return requestEstablishments(propertyId, neighborhoodId)
}

function establishmentsFailure(message: string, status: number): EstablishmentsResult {
  return { ok: false, error: { message, status } }
}

export async function requestEstablishments(
  propertyId: number | string,
  neighborhoodId: number | string,
): Promise<EstablishmentsResult> {
  try {
    const response = await api.get<Establishment[]>(
      `/properties/${propertyId}/neighborhoods/${neighborhoodId}/establishments`,
    )
    if (response.status === 404) {
      return establishmentsFailure(
        errorMessage(response.data, 'Unable to load establishments'),
        response.status,
      )
    }

    return { ok: true, establishments: response.data }
  } catch (error) {
    if (isCancel(error)) return establishmentsFailure('Session expired', 401)
    if (!isAxiosError(error) || !error.response) {
      return establishmentsFailure('Unable to reach the establishments service', 0)
    }

    return establishmentsFailure(
      errorMessage(error.response.data, 'Unable to load establishments'),
      error.response.status,
    )
  }
}
