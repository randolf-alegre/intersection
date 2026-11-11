import { isAxiosError, isCancel } from 'axios'
import { api } from '@/shared/services/api'
import { errorMessage } from '@/shared/services/common'

export interface Property {
  id: number
  address: string
  description: string
  createdAt: string
  updatedAt: string
  name: string
}

export type PropertiesFailure = {
  message: string
  status: number
}

export type PropertyFields = {
  name: string
  address: string
  description: string
}

export type PropertiesResult =
  | { ok: true; properties: Property[]; hasNextPage: boolean }
  | { ok: false; error: PropertiesFailure }

export type PropertyResult =
  { ok: true; property: Property } | { ok: false; error: PropertiesFailure }

export type DeletePropertyResult = { ok: true } | { ok: false; error: PropertiesFailure }

function propertiesFailure(message: string, status: number): PropertiesResult {
  return { ok: false, error: { message, status } }
}

function propertyFailure(message: string, status: number): PropertyResult {
  return { ok: false, error: { message, status } }
}

function deleteFailure(message: string, status: number): DeletePropertyResult {
  return { ok: false, error: { message, status } }
}

export async function requestSearchProperties(name: string): Promise<PropertiesResult> {
  try {
    const response = await api.get<{ properties: Property[]; hasNextPage: boolean }>(
      '/properties/search',
      { params: { name } },
    )
    if (response.status === 404) {
      return propertiesFailure(
        errorMessage(response.data, 'Unable to load properties'),
        response.status,
      )
    }

    return {
      ok: true,
      properties: response.data.properties,
      hasNextPage: response.data.hasNextPage,
    }
  } catch (error) {
    if (isCancel(error)) return propertiesFailure('Session expired', 401)
    if (!isAxiosError(error) || !error.response) {
      return propertiesFailure('Unable to reach the properties service', 0)
    }

    return propertiesFailure(
      errorMessage(error.response.data, 'Unable to load properties'),
      error.response.status,
    )
  }
}

export async function fetchProperties(page?: number): Promise<PropertiesResult> {
  try {
    const response = await api.get<{ properties: Property[]; hasNextPage: boolean }>(
      '/properties',
      {
        params: { page: page ?? 1 },
      },
    )
    if (response.status === 404) {
      return propertiesFailure(
        errorMessage(response.data, 'Unable to load properties'),
        response.status,
      )
    }
    return {
      ok: true,
      properties: response.data.properties,
      hasNextPage: response.data.hasNextPage,
    }
  } catch (error) {
    if (isCancel(error)) return propertiesFailure('Session expired', 401)
    if (!isAxiosError(error) || !error.response) {
      return propertiesFailure('Unable to reach the properties service', 0)
    }

    return propertiesFailure(
      errorMessage(error.response.data, 'Unable to load properties'),
      error.response.status,
    )
  }
}

export async function createProperty(fields: PropertyFields): Promise<PropertyResult> {
  try {
    const response = await api.post('/properties', propertyBody(fields))
    if (response.status === 404) {
      return propertyFailure(
        errorMessage(response.data, 'Unable to create the property'),
        response.status,
      )
    }
    return { ok: true, property: response.data as Property }
  } catch (error) {
    if (isCancel(error)) return propertyFailure('Session expired', 401)
    if (!isAxiosError(error) || !error.response) {
      return propertyFailure('Unable to reach the properties service', 0)
    }

    return propertyFailure(
      errorMessage(error.response.data, 'Unable to create the property'),
      error.response.status,
    )
  }
}

export async function updateProperty(id: number, fields: PropertyFields): Promise<PropertyResult> {
  try {
    const response = await api.put(`/properties/${id}`, propertyBody(fields))
    if (response.status === 404) {
      return propertyFailure(
        errorMessage(response.data, 'Unable to update the property'),
        response.status,
      )
    }

    return { ok: true, property: response.data as Property }
  } catch (error) {
    if (isCancel(error)) return propertyFailure('Session expired', 401)
    if (!isAxiosError(error) || !error.response) {
      return propertyFailure('Unable to reach the properties service', 0)
    }

    return propertyFailure(
      errorMessage(error.response.data, 'Unable to update the property'),
      error.response.status,
    )
  }
}

export async function deleteProperty(id: number): Promise<DeletePropertyResult> {
  try {
    const response = await api.delete(`/properties/${id}`)
    if (response.status === 404) {
      return deleteFailure(
        errorMessage(response.data, 'Unable to delete the property'),
        response.status,
      )
    }

    return { ok: true }
  } catch (error) {
    if (isCancel(error)) return deleteFailure('Session expired', 401)
    if (!isAxiosError(error) || !error.response) {
      return deleteFailure('Unable to reach the properties service', 0)
    }

    return deleteFailure(
      errorMessage(error.response.data, 'Unable to delete the property'),
      error.response.status,
    )
  }
}

function propertyBody(fields: PropertyFields) {
  return {
    property: {
      name: fields.name,
      address: fields.address,
      description: fields.description,
    },
  }
}
