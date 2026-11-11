import { DOMWrapper, flushPromises, type VueWrapper } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import EstablishmentCategoryDashboardView from '@/modules/admin/views/EstablishmentCategoryDashboardView.vue'
import type { EstablishmentCategory } from '@/shared/services/establishmentCategoryService'
import { mountComponent } from '@/test/mount'

const category: EstablishmentCategory = {
  id: 2,
  name: 'Food',
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
}

const {
  fetchEstablishmentCategories,
  createEstablishmentCategory,
  updateEstablishmentCategory,
  deleteEstablishmentCategory,
} = vi.hoisted(() => ({
  fetchEstablishmentCategories: vi.fn(async () => ({
    ok: true,
    categories: [category],
  })),
  createEstablishmentCategory: vi.fn(),
  updateEstablishmentCategory: vi.fn(),
  deleteEstablishmentCategory: vi.fn(),
}))

vi.mock('@/shared/services/establishmentCategoryService', async () => {
  const actual = await vi.importActual<
    typeof import('@/shared/services/establishmentCategoryService')
  >('@/shared/services/establishmentCategoryService')
  return {
    ...actual,
    fetchEstablishmentCategories,
    createEstablishmentCategory,
    updateEstablishmentCategory,
    deleteEstablishmentCategory,
  }
})

function activeDialog() {
  return document.body.querySelector(
    '.v-overlay--active [data-test-id="establishment-category-dialog"]',
  )
}

describe('EstablishmentCategoryDashboardView', () => {
  let wrapper: VueWrapper | undefined

  beforeEach(() => {
    createEstablishmentCategory.mockReset()
    updateEstablishmentCategory.mockReset()
    deleteEstablishmentCategory.mockReset()
    vi.stubGlobal('visualViewport', {
      width: 1024,
      height: 768,
      offsetLeft: 0,
      offsetTop: 0,
      pageLeft: 0,
      pageTop: 0,
      scale: 1,
      addEventListener: () => {},
      removeEventListener: () => {},
    })
  })

  afterEach(() => {
    wrapper?.unmount()
  })

  it('loads categories and lists them', async () => {
    wrapper = mountComponent(EstablishmentCategoryDashboardView).wrapper
    await flushPromises()

    expect(wrapper.get('[data-test-id="establishment-category-row-2"]').text()).toContain('Food')
  })

  it('updates the selected category from the modal', async () => {
    const updated = { ...category, name: 'Dining' }
    updateEstablishmentCategory.mockResolvedValue({ ok: true, category: updated })
    wrapper = mountComponent(EstablishmentCategoryDashboardView, {
      attachTo: document.body,
    }).wrapper
    await flushPromises()

    await wrapper.get('[data-test-id="establishment-category-row-2"]').trigger('click')
    await flushPromises()

    const dialog = activeDialog()
    expect(dialog?.textContent).toContain('Update category')
    await new DOMWrapper(
      dialog!.querySelector('[data-test-id="establishment-category-name"] input')!,
    ).setValue('Dining')
    await new DOMWrapper(
      dialog!.querySelector('[data-test-id="establishment-category-form-submit"]')!,
    ).trigger('click')
    await flushPromises()

    expect(updateEstablishmentCategory).toHaveBeenCalledWith(2, { name: 'Dining' })
    expect(wrapper.text()).toContain('Dining')
    expect(activeDialog()).toBeNull()
  })

  it('creates a category from the add button', async () => {
    const created = { ...category, id: 8, name: 'Shopping' }
    createEstablishmentCategory.mockResolvedValue({ ok: true, category: created })
    wrapper = mountComponent(EstablishmentCategoryDashboardView, {
      attachTo: document.body,
    }).wrapper
    await flushPromises()

    await wrapper.get('[data-test-id="add-establishment-category"]').trigger('click')
    await flushPromises()

    const dialog = activeDialog()
    expect(dialog?.textContent).toContain('Create category')
    await new DOMWrapper(
      dialog!.querySelector('[data-test-id="establishment-category-name"] input')!,
    ).setValue('Shopping')
    await new DOMWrapper(
      dialog!.querySelector('[data-test-id="establishment-category-form-submit"]')!,
    ).trigger('click')
    await flushPromises()

    expect(createEstablishmentCategory).toHaveBeenCalledWith({ name: 'Shopping' })
    expect(wrapper.text()).toContain('Shopping')
    expect(activeDialog()).toBeNull()
  })

  it('deletes the category after confirmation', async () => {
    deleteEstablishmentCategory.mockResolvedValue({ ok: true })
    wrapper = mountComponent(EstablishmentCategoryDashboardView, {
      attachTo: document.body,
    }).wrapper
    await flushPromises()

    await wrapper.get('[data-test-id="establishment-category-row-2"]').trigger('click')
    await flushPromises()
    await new DOMWrapper(
      activeDialog()!.querySelector('[data-test-id="establishment-category-delete"]')!,
    ).trigger('click')
    await flushPromises()

    const confirmation = document.body.querySelector(
      '.v-overlay--active [data-test-id="establishment-category-delete-dialog"]',
    )
    expect(confirmation?.textContent).toContain('Delete Food?')
    await new DOMWrapper(
      confirmation!.querySelector('[data-test-id="establishment-category-delete-confirm"]')!,
    ).trigger('click')
    await flushPromises()

    expect(deleteEstablishmentCategory).toHaveBeenCalledWith(2)
    expect(wrapper.text()).not.toContain('Food')
    expect(activeDialog()).toBeNull()
  })
})
