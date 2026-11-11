import { isAxiosError, isCancel } from 'axios'
import { api } from '@/shared/services/api'
import { errorMessage } from '@/shared/services/common'

export interface EstablishmentCategory {
  id: number
  name: string
  createdAt: string
  updatedAt: string
}

export type EstablishmentCategoryFields = {
  name: string
}

export type EstablishmentCategoriesFailure = {
  message: string
  status: number
}

export type EstablishmentCategoriesResult =
  | { ok: true; categories: EstablishmentCategory[] }
  | { ok: false; error: EstablishmentCategoriesFailure }

export type EstablishmentCategoryResult =
  | { ok: true; category: EstablishmentCategory }
  | { ok: false; error: EstablishmentCategoriesFailure }

export type DeleteEstablishmentCategoryResult =
  { ok: true } | { ok: false; error: EstablishmentCategoriesFailure }

export async function fetchEstablishmentCategories(): Promise<EstablishmentCategoriesResult> {
  try {
    const response = await api.get('/establishment_categories')
    if (response.status === 404) {
      return categoriesFailure(
        errorMessage(response.data, 'Unable to load categories'),
        response.status,
      )
    }

    return { ok: true, categories: response.data as EstablishmentCategory[] }
  } catch (error) {
    return categoriesRequestFailure(error, 'Unable to load categories')
  }
}

export async function createEstablishmentCategory(
  fields: EstablishmentCategoryFields,
): Promise<EstablishmentCategoryResult> {
  try {
    const response = await api.post('/establishment_categories', categoryBody(fields))
    return readCategory(
      response.status,
      response.data as EstablishmentCategory,
      'Unable to create the category',
    )
  } catch (error) {
    return categoryRequestFailure(error, 'Unable to create the category')
  }
}

export async function updateEstablishmentCategory(
  id: number,
  fields: EstablishmentCategoryFields,
): Promise<EstablishmentCategoryResult> {
  try {
    const response = await api.put(`/establishment_categories/${id}`, categoryBody(fields))
    return readCategory(
      response.status,
      response.data as EstablishmentCategory,
      'Unable to update the category',
    )
  } catch (error) {
    return categoryRequestFailure(error, 'Unable to update the category')
  }
}

export async function deleteEstablishmentCategory(
  id: number,
): Promise<DeleteEstablishmentCategoryResult> {
  try {
    const response = await api.delete(`/establishment_categories/${id}`)
    if (response.status === 404) {
      return {
        ok: false,
        error: {
          message: errorMessage(
            response.data as EstablishmentCategory,
            'Unable to delete the category',
          ),
          status: response.status,
        },
      }
    }

    return { ok: true }
  } catch (error) {
    if (isCancel(error)) return { ok: false, error: { message: 'Session expired', status: 401 } }
    if (!isAxiosError(error) || !error.response) {
      return { ok: false, error: { message: 'Unable to reach the categories service', status: 0 } }
    }

    return {
      ok: false,
      error: {
        message: errorMessage(error.response.data, 'Unable to delete the category'),
        status: error.response.status,
      },
    }
  }
}

function categoryBody(fields: EstablishmentCategoryFields) {
  return { establishment_category: { name: fields.name } }
}

function categoriesFailure(message: string, status: number): EstablishmentCategoriesResult {
  return { ok: false, error: { message, status } }
}

function categoryFailure(message: string, status: number): EstablishmentCategoryResult {
  return { ok: false, error: { message, status } }
}

function readCategory(
  status: number,
  data: EstablishmentCategory,
  fallback: string,
): EstablishmentCategoryResult {
  if (status === 404) return categoryFailure(errorMessage(data, fallback), status)

  return { ok: true, category: data }
}

function categoriesRequestFailure(error: unknown, fallback: string): EstablishmentCategoriesResult {
  if (isCancel(error)) return categoriesFailure('Session expired', 401)
  if (!isAxiosError(error) || !error.response) {
    return categoriesFailure('Unable to reach the categories service', 0)
  }

  return categoriesFailure(errorMessage(error.response.data, fallback), error.response.status)
}

function categoryRequestFailure(error: unknown, fallback: string): EstablishmentCategoryResult {
  if (isCancel(error)) return categoryFailure('Session expired', 401)
  if (!isAxiosError(error) || !error.response) {
    return categoryFailure('Unable to reach the categories service', 0)
  }

  return categoryFailure(errorMessage(error.response.data, fallback), error.response.status)
}
