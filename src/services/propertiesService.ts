import { isAxiosError, isCancel } from 'axios'
import { api } from '@/services/api'
import { errorMessage } from '@/services/common'

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

export type PropertiesResult =
  | { ok: true; properties: Property[]; hasNextPage: boolean }
  | { ok: false; error: PropertiesFailure }

function propertiesFailure(message: string, status: number): PropertiesResult {
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
