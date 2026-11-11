import { isAxiosError, isCancel } from 'axios'
import { api } from '@/shared/services/api'
import { errorMessage } from '@/shared/services/common'

export interface Establishment {
  id: number
  name: string
  establishmentCategoryId: number | null
  short: string
  long: string
  maps: string
  string: string | null
  coverImage: string
  tags: string
  createdAt: string
  updatedAt: string
}

export type EstablishmentFields = {
  name: string
  establishmentCategoryId: number | null
  short: string
  long: string
  maps: string
  coverImage: string
  tags: string
}

export type EstablishmentsFailure = {
  message: string
  status: number
}

export type EstablishmentsResult =
  { ok: true; establishments: Establishment[] } | { ok: false; error: EstablishmentsFailure }

export type EstablishmentResult =
  { ok: true; establishment: Establishment } | { ok: false; error: EstablishmentsFailure }

export type DeleteEstablishmentResult = { ok: true } | { ok: false; error: EstablishmentsFailure }

export function fetchEstablishments(propertyId: number | string, neighborhoodId: number | string) {
  return requestEstablishments(propertyId, neighborhoodId)
}

function establishmentsFailure(message: string, status: number): EstablishmentsResult {
  return { ok: false, error: { message, status } }
}

function establishmentFailure(message: string, status: number): EstablishmentResult {
  return { ok: false, error: { message, status } }
}

function deleteEstablishmentFailure(message: string, status: number): DeleteEstablishmentResult {
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

export async function getAllEstablishments(): Promise<EstablishmentsResult> {
  try {
    const response = await api.get('/establishments/all')
    return readEstablishments(
      response.status,
      response.data as Establishment[],
      'Unable to load establishments',
    )
  } catch (error) {
    return establishmentsRequestFailure(error, 'Unable to load establishments')
  }
}

export async function createEstablishment(
  fields: EstablishmentFields,
): Promise<EstablishmentResult> {
  try {
    const response = await api.post('/establishments', establishmentBody(fields))
    return readEstablishment(
      response.status,
      response.data as Establishment,
      'Unable to create the establishment',
    )
  } catch (error) {
    return establishmentRequestFailure(error, 'Unable to create the establishment')
  }
}

export async function updateEstablishment(
  establishmentId: number,
  fields: EstablishmentFields,
): Promise<EstablishmentResult> {
  try {
    const response = await api.put(`/establishments/${establishmentId}`, establishmentBody(fields))
    return readEstablishment(
      response.status,
      response.data as Establishment,
      'Unable to update the establishment',
    )
  } catch (error) {
    return establishmentRequestFailure(error, 'Unable to update the establishment')
  }
}

export async function deleteEstablishment(
  establishmentId: number,
): Promise<DeleteEstablishmentResult> {
  try {
    const response = await api.delete(`/establishments/${establishmentId}`)
    if (response.status === 404) {
      return deleteEstablishmentFailure(
        errorMessage(response.data, 'Unable to delete the establishment'),
        response.status,
      )
    }

    return { ok: true }
  } catch (error) {
    if (isCancel(error)) return deleteEstablishmentFailure('Session expired', 401)
    if (!isAxiosError(error) || !error.response) {
      return deleteEstablishmentFailure('Unable to reach the establishments service', 0)
    }

    return deleteEstablishmentFailure(
      errorMessage(error.response.data, 'Unable to delete the establishment'),
      error.response.status,
    )
  }
}

function establishmentBody(fields: EstablishmentFields) {
  return {
    establishment: {
      name: fields.name,
      establishment_category_id: fields.establishmentCategoryId,
      short: fields.short,
      long: fields.long,
      maps: fields.maps,
      cover_image: fields.coverImage,
      tags: fields.tags,
    },
  }
}

function readEstablishments(
  status: number,
  data: Establishment[],
  fallback: string,
): EstablishmentsResult {
  if (status === 404) return establishmentsFailure(errorMessage(data, fallback), status)
  return { ok: true, establishments: data }
}

function readEstablishment(
  status: number,
  data: Establishment,
  fallback: string,
): EstablishmentResult {
  if (status === 404) return establishmentFailure(errorMessage(data, fallback), status)
  return { ok: true, establishment: data }
}

function establishmentsRequestFailure(error: unknown, fallback: string): EstablishmentsResult {
  if (isCancel(error)) return establishmentsFailure('Session expired', 401)
  if (!isAxiosError(error) || !error.response) {
    return establishmentsFailure('Unable to reach the establishments service', 0)
  }

  return establishmentsFailure(errorMessage(error.response.data, fallback), error.response.status)
}

function establishmentRequestFailure(error: unknown, fallback: string): EstablishmentResult {
  if (isCancel(error)) return establishmentFailure('Session expired', 401)
  if (!isAxiosError(error) || !error.response) {
    return establishmentFailure('Unable to reach the establishments service', 0)
  }

  return establishmentFailure(errorMessage(error.response.data, fallback), error.response.status)
}
