import { DOMWrapper, flushPromises, type VueWrapper } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import PropertyDashboardView from '@/modules/admin/views/PropertyDashboardView.vue'
import { useAdminToastStore } from '@/modules/admin/stores/adminToastStore'
import type { Neighborhood } from '@/shared/services/neighborhoodService'
import type { Property } from '@/shared/services/propertiesService'
import { mountComponent } from '@/test/mount'

const property: Property = {
  id: 4,
  name: 'Hatchobori',
  description: 'A quiet stay',
  address: '1 Main Street',
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
}

const {
  updateProperty,
  createProperty,
  deleteProperty,
  getAllNeighborhoods,
  associatePropertyNeighborhoods,
} = vi.hoisted(() => ({
  updateProperty: vi.fn(),
  createProperty: vi.fn(),
  deleteProperty: vi.fn(),
  getAllNeighborhoods: vi.fn(async () => ({ ok: true, neighborhoods: [] as Neighborhood[] })),
  associatePropertyNeighborhoods: vi.fn(),
}))

vi.mock('@/shared/services/neighborhoodService', async () => {
  const actual = await vi.importActual<typeof import('@/shared/services/neighborhoodService')>(
    '@/shared/services/neighborhoodService',
  )
  return {
    ...actual,
    getAllNeighborhoods,
  }
})

vi.mock('@/shared/services/propertyNeighborhoodService', () => ({
  associatePropertyNeighborhoods,
}))

vi.mock('@/shared/services/propertiesService', async () => {
  const actual = await vi.importActual<typeof import('@/shared/services/propertiesService')>(
    '@/shared/services/propertiesService',
  )
  return {
    ...actual,
    fetchProperties: vi.fn(async () => ({
      ok: true,
      properties: [property],
      hasNextPage: false,
    })),
    updateProperty,
    createProperty,
    deleteProperty,
  }
})

function activeDialog() {
  return document.body.querySelector('.v-overlay--active [data-test-id="property-dialog"]')
}

describe('PropertyDashboardView', () => {
  let wrapper: VueWrapper | undefined

  beforeEach(() => {
    updateProperty.mockReset()
    createProperty.mockReset()
    deleteProperty.mockReset()
    associatePropertyNeighborhoods.mockReset()
    getAllNeighborhoods.mockReset()
    getAllNeighborhoods.mockResolvedValue({ ok: true, neighborhoods: [] })
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

  it('updates the selected property from the modal and closes it', async () => {
    const updated = { ...property, name: 'Renamed' }
    updateProperty.mockResolvedValue({ ok: true, property: updated })
    wrapper = mountComponent(PropertyDashboardView, { attachTo: document.body }).wrapper
    await flushPromises()

    await wrapper.get('[data-test-id="property-row-4"]').trigger('click')
    await flushPromises()

    const dialog = activeDialog()
    expect(dialog?.textContent).toContain('Update property')
    expect(
      dialog?.querySelector<HTMLInputElement>('[data-test-id="property-name"] input')?.value,
    ).toBe('Hatchobori')

    await new DOMWrapper(dialog!.querySelector('[data-test-id="property-form-cancel"]')!).trigger(
      'click',
    )
    await flushPromises()
    expect(activeDialog()).toBeNull()

    await wrapper.get('[data-test-id="property-row-4"]').trigger('click')
    await flushPromises()
    const name = new DOMWrapper(
      activeDialog()!.querySelector('[data-test-id="property-name"] input')!,
    )
    await name.setValue('Renamed')
    await new DOMWrapper(
      activeDialog()!.querySelector('[data-test-id="property-form-submit"]')!,
    ).trigger('click')
    await flushPromises()

    expect(updateProperty).toHaveBeenCalledWith(4, {
      name: 'Renamed',
      address: '1 Main Street',
      description: 'A quiet stay',
    })
    expect(wrapper.text()).toContain('Renamed')
    expect(activeDialog()).toBeNull()
  })

  it('keeps the modal open and shows the service error', async () => {
    updateProperty.mockResolvedValue({
      ok: false,
      error: { message: 'Unable to update the property', status: 500 },
    })
    wrapper = mountComponent(PropertyDashboardView, { attachTo: document.body }).wrapper
    await flushPromises()

    await wrapper.get('[data-test-id="property-row-4"]').trigger('click')
    await flushPromises()
    await new DOMWrapper(
      activeDialog()!.querySelector('[data-test-id="property-form-submit"]')!,
    ).trigger('click')
    await flushPromises()

    expect(activeDialog()?.textContent).toContain('Unable to update the property')
    expect(activeDialog()).not.toBeNull()
  })

  it('creates a property from the add button', async () => {
    const created: Property = {
      id: 12,
      name: 'Inn',
      description: 'A place to stay',
      address: '2 River Road',
      createdAt: '2026-01-03T00:00:00Z',
      updatedAt: '2026-01-03T00:00:00Z',
    }
    createProperty.mockResolvedValue({ ok: true, property: created })
    wrapper = mountComponent(PropertyDashboardView, { attachTo: document.body }).wrapper
    await flushPromises()

    await wrapper.get('[data-test-id="add-property"]').trigger('click')
    await flushPromises()

    const dialog = activeDialog()
    expect(dialog?.textContent).toContain('Create property')
    expect(
      dialog?.querySelector<HTMLInputElement>('[data-test-id="property-name"] input')?.value,
    ).toBe('')

    await new DOMWrapper(dialog!.querySelector('[data-test-id="property-name"] input')!).setValue(
      'Inn',
    )
    await new DOMWrapper(
      dialog!.querySelector('[data-test-id="property-address"] input')!,
    ).setValue('2 River Road')
    await new DOMWrapper(
      dialog!.querySelector('[data-test-id="property-description"] textarea')!,
    ).setValue('A place to stay')
    await new DOMWrapper(dialog!.querySelector('[data-test-id="property-form-submit"]')!).trigger(
      'click',
    )
    await flushPromises()

    expect(createProperty).toHaveBeenCalledWith({
      name: 'Inn',
      address: '2 River Road',
      description: 'A place to stay',
    })
    expect(updateProperty).not.toHaveBeenCalled()
    expect(wrapper.text()).toContain('Inn')
    expect(activeDialog()).toBeNull()
  })

  it('deletes the property after confirmation and removes it from the list', async () => {
    deleteProperty.mockResolvedValue({ ok: true })
    wrapper = mountComponent(PropertyDashboardView, { attachTo: document.body }).wrapper
    await flushPromises()

    await wrapper.get('[data-test-id="property-row-4"]').trigger('click')
    await flushPromises()
    await new DOMWrapper(
      activeDialog()!.querySelector('[data-test-id="property-delete"]')!,
    ).trigger('click')
    await flushPromises()

    const confirmation = document.body.querySelector(
      '.v-overlay--active [data-test-id="property-delete-dialog"]',
    )
    expect(confirmation?.textContent).toContain('Delete Hatchobori?')

    await new DOMWrapper(
      confirmation!.querySelector('[data-test-id="property-delete-confirm"]')!,
    ).trigger('click')
    await flushPromises()

    expect(deleteProperty).toHaveBeenCalledWith(4)
    expect(wrapper.text()).not.toContain('Hatchobori')
    expect(activeDialog()).toBeNull()
  })

  it('associates neighborhoods from the associate tab', async () => {
    const neighborhood: Neighborhood = {
      id: 3,
      name: 'Monzen-nakacho',
      hashtag: '#local',
      description: 'A walkable neighborhood',
      hashtagDescription: 'Close to the station',
      city: 'Tokyo',
      tags: 'food',
      createdAt: '2026-01-01T00:00:00Z',
      updatedAt: '2026-01-01T00:00:00Z',
    }
    getAllNeighborhoods.mockResolvedValue({ ok: true, neighborhoods: [neighborhood] })
    associatePropertyNeighborhoods.mockResolvedValue({ ok: true })
    wrapper = mountComponent(PropertyDashboardView, { attachTo: document.body }).wrapper
    await flushPromises()

    await wrapper.get('[data-test-id="property-row-4"]').trigger('click')
    await flushPromises()

    const dialog = activeDialog()
    expect(dialog?.querySelector('[data-test-id="property-tab-neighborhoods"]')).not.toBeNull()
    await new DOMWrapper(
      dialog!.querySelector('[data-test-id="property-tab-neighborhoods"]')!,
    ).trigger('click')
    await flushPromises()

    const neighborhoods = activeDialog()
    expect(neighborhoods?.textContent).toContain('Associate neighborhoods')
    expect(
      neighborhoods?.querySelector<HTMLInputElement>(
        '[data-test-id="property-neighborhood-property"] input',
      )?.value,
    ).toBe('Hatchobori')

    await new DOMWrapper(
      neighborhoods!.querySelector('[data-test-id="property-neighborhood-3"] input')!,
    ).setValue(true)
    await new DOMWrapper(
      activeDialog()!.querySelector('[data-test-id="property-neighborhood-submit"]')!,
    ).trigger('click')
    await flushPromises()

    expect(associatePropertyNeighborhoods).toHaveBeenCalledWith(4, [3])
    expect(updateProperty).not.toHaveBeenCalled()
    expect(activeDialog()).toBeNull()
    expect(useAdminToastStore().message).toBe('Neighborhoods associated successfully')
    expect(useAdminToastStore().visible).toBe(true)
  })
})
