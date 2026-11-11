import { DOMWrapper, flushPromises, type VueWrapper } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import NeighborhoodDashboardView from '@/modules/admin/views/NeighborhoodDashboardView.vue'
import { useAdminToastStore } from '@/modules/admin/stores/adminToastStore'
import type { Establishment } from '@/shared/services/establishmentService'
import type { Neighborhood } from '@/shared/services/neighborhoodService'
import type { Property } from '@/shared/services/propertiesService'
import { mountComponent } from '@/test/mount'

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

const {
  updateNeighborhood,
  createNeighborhood,
  deleteNeighborhood,
  getAllNeighborhoods,
  fetchProperties,
  associateNeighborhoodProperties,
  associateNeighborhoodEstablishments,
  getAllEstablishments,
} = vi.hoisted(() => ({
  updateNeighborhood: vi.fn(),
  createNeighborhood: vi.fn(),
  deleteNeighborhood: vi.fn(),
  getAllNeighborhoods: vi.fn(async () => ({
    ok: true,
    neighborhoods: [neighborhood],
  })),
  fetchProperties: vi.fn(async () => ({
    ok: true,
    properties: [] as Property[],
    hasNextPage: false,
  })),
  associateNeighborhoodProperties: vi.fn(),
  associateNeighborhoodEstablishments: vi.fn(),
  getAllEstablishments: vi.fn(async () => ({
    ok: true,
    establishments: [] as Establishment[],
  })),
}))

vi.mock('@/shared/services/propertiesService', async () => {
  const actual = await vi.importActual<typeof import('@/shared/services/propertiesService')>(
    '@/shared/services/propertiesService',
  )
  return {
    ...actual,
    fetchProperties,
  }
})

vi.mock('@/shared/services/propertyNeighborhoodService', () => ({
  associateNeighborhoodProperties,
}))

vi.mock('@/shared/services/neighborhoodService', async () => {
  const actual = await vi.importActual<typeof import('@/shared/services/neighborhoodService')>(
    '@/shared/services/neighborhoodService',
  )
  return {
    ...actual,
    getAllNeighborhoods,
    updateNeighborhood,
    createNeighborhood,
    deleteNeighborhood,
    associateNeighborhoodEstablishments,
  }
})

vi.mock('@/shared/services/establishmentService', async () => {
  const actual = await vi.importActual<typeof import('@/shared/services/establishmentService')>(
    '@/shared/services/establishmentService',
  )
  return {
    ...actual,
    getAllEstablishments,
  }
})

function activeDialog() {
  return document.body.querySelector('.v-overlay--active [data-test-id="neighborhood-dialog"]')
}

describe('NeighborhoodDashboardView', () => {
  let wrapper: VueWrapper | undefined

  beforeEach(() => {
    updateNeighborhood.mockReset()
    createNeighborhood.mockReset()
    deleteNeighborhood.mockReset()
    associateNeighborhoodProperties.mockReset()
    associateNeighborhoodEstablishments.mockReset()
    getAllEstablishments.mockReset()
    getAllEstablishments.mockResolvedValue({ ok: true, establishments: [] })
    fetchProperties.mockReset()
    fetchProperties.mockResolvedValue({ ok: true, properties: [], hasNextPage: false })
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

  it('loads neighborhoods through the store and lists them', async () => {
    wrapper = mountComponent(NeighborhoodDashboardView).wrapper
    await flushPromises()

    expect(wrapper.get('[data-test-id="neighborhood-row-3"]').text()).toContain('Monzen-nakacho')
    expect(wrapper.text()).toContain('Tokyo')
    expect(wrapper.text()).toContain('#local')
  })

  it('updates the selected neighborhood from the modal', async () => {
    const updated = { ...neighborhood, name: 'Renamed' }
    updateNeighborhood.mockResolvedValue({ ok: true, neighborhood: updated })
    wrapper = mountComponent(NeighborhoodDashboardView, { attachTo: document.body }).wrapper
    await flushPromises()

    await wrapper.get('[data-test-id="neighborhood-row-3"]').trigger('click')
    await flushPromises()

    const dialog = activeDialog()
    expect(dialog?.textContent).toContain('Update neighborhood')
    const name = new DOMWrapper(dialog!.querySelector('[data-test-id="neighborhood-name"] input')!)
    await name.setValue('Renamed')
    await new DOMWrapper(
      dialog!.querySelector('[data-test-id="neighborhood-form-submit"]')!,
    ).trigger('click')
    await flushPromises()

    expect(updateNeighborhood).toHaveBeenCalledWith(3, {
      name: 'Renamed',
      hashtag: '#local',
      description: 'A walkable neighborhood',
      hashtagDescription: 'Close to the station',
      city: 'Tokyo',
      tags: 'food',
    })
    expect(wrapper.text()).toContain('Renamed')
    expect(activeDialog()).toBeNull()
  })

  it('deletes the neighborhood after confirmation', async () => {
    deleteNeighborhood.mockResolvedValue({ ok: true })
    wrapper = mountComponent(NeighborhoodDashboardView, { attachTo: document.body }).wrapper
    await flushPromises()

    await wrapper.get('[data-test-id="neighborhood-row-3"]').trigger('click')
    await flushPromises()
    await new DOMWrapper(
      activeDialog()!.querySelector('[data-test-id="neighborhood-delete"]')!,
    ).trigger('click')
    await flushPromises()

    const confirmation = document.body.querySelector(
      '.v-overlay--active [data-test-id="neighborhood-delete-dialog"]',
    )
    expect(confirmation?.textContent).toContain('Delete Monzen-nakacho?')
    await new DOMWrapper(
      confirmation!.querySelector('[data-test-id="neighborhood-delete-confirm"]')!,
    ).trigger('click')
    await flushPromises()

    expect(deleteNeighborhood).toHaveBeenCalledWith(3)
    expect(wrapper.text()).not.toContain('Monzen-nakacho')
    expect(activeDialog()).toBeNull()
  })

  it('associates properties from the properties tab and shows a toast', async () => {
    const property: Property = {
      id: 4,
      name: 'Hatchobori',
      description: 'A quiet stay',
      address: '1 Main Street',
      createdAt: '2026-01-01T00:00:00Z',
      updatedAt: '2026-01-01T00:00:00Z',
    }
    fetchProperties.mockResolvedValue({ ok: true, properties: [property], hasNextPage: false })
    associateNeighborhoodProperties.mockResolvedValue({ ok: true })
    wrapper = mountComponent(NeighborhoodDashboardView, { attachTo: document.body }).wrapper
    await flushPromises()

    await wrapper.get('[data-test-id="neighborhood-row-3"]').trigger('click')
    await flushPromises()

    const dialog = activeDialog()
    await new DOMWrapper(
      dialog!.querySelector('[data-test-id="neighborhood-tab-properties"]')!,
    ).trigger('click')
    await flushPromises()

    const properties = activeDialog()
    expect(properties?.textContent).toContain('Associate properties')
    expect(
      properties?.querySelector<HTMLInputElement>(
        '[data-test-id="neighborhood-property-neighborhood"] input',
      )?.value,
    ).toBe('Monzen-nakacho')

    await new DOMWrapper(
      properties!.querySelector('[data-test-id="neighborhood-property-4"] input')!,
    ).setValue(true)
    await new DOMWrapper(
      activeDialog()!.querySelector('[data-test-id="neighborhood-property-submit"]')!,
    ).trigger('click')
    await flushPromises()

    expect(associateNeighborhoodProperties).toHaveBeenCalledWith(3, [4])
    expect(updateNeighborhood).not.toHaveBeenCalled()
    expect(activeDialog()).toBeNull()
    expect(useAdminToastStore().message).toBe('Properties associated successfully')
    expect(useAdminToastStore().visible).toBe(true)
  })

  it('associates establishments from the establishments tab and shows a toast', async () => {
    const establishment: Establishment = {
      id: 7,
      name: 'Cafe',
      establishmentCategoryId: null,
      short: 'Coffee',
      long: 'A small cafe',
      maps: 'https://maps.example/cafe',
      string: null,
      coverImage: 'https://example.com/cafe.jpg',
      tags: 'coffee',
      createdAt: '2026-01-01T00:00:00Z',
      updatedAt: '2026-01-01T00:00:00Z',
    }
    getAllEstablishments.mockResolvedValue({ ok: true, establishments: [establishment] })
    associateNeighborhoodEstablishments.mockResolvedValue({ ok: true })
    wrapper = mountComponent(NeighborhoodDashboardView, { attachTo: document.body }).wrapper
    await flushPromises()

    await wrapper.get('[data-test-id="neighborhood-row-3"]').trigger('click')
    await flushPromises()

    const dialog = activeDialog()
    await new DOMWrapper(
      dialog!.querySelector('[data-test-id="neighborhood-tab-establishments"]')!,
    ).trigger('click')
    await flushPromises()

    const establishments = activeDialog()
    expect(establishments?.textContent).toContain('Associate establishments')
    expect(
      establishments?.querySelector<HTMLInputElement>(
        '[data-test-id="neighborhood-establishment-neighborhood"] input',
      )?.value,
    ).toBe('Monzen-nakacho')

    await new DOMWrapper(
      establishments!.querySelector('[data-test-id="neighborhood-establishment-7"] input')!,
    ).setValue(true)
    await new DOMWrapper(
      activeDialog()!.querySelector('[data-test-id="neighborhood-establishment-submit"]')!,
    ).trigger('click')
    await flushPromises()

    expect(associateNeighborhoodEstablishments).toHaveBeenCalledWith(3, [7])
    expect(updateNeighborhood).not.toHaveBeenCalled()
    expect(activeDialog()).toBeNull()
    expect(useAdminToastStore().message).toBe('Establishments associated successfully')
    expect(useAdminToastStore().visible).toBe(true)
  })
})
