import { describe, expect, it, vi } from 'vitest'
import NeighborhoodEstablishmentForm from '@/modules/admin/components/NeighborhoodEstablishmentForm.vue'
import type { Establishment } from '@/shared/services/establishmentService'
import type {
  AssociateEstablishmentsResult,
  Neighborhood,
} from '@/shared/services/neighborhoodService'
import { mountComponent } from '@/test/mount'

const associateNeighborhoodEstablishments = vi.fn()

vi.mock('@/shared/services/neighborhoodService', async () => {
  const actual = await vi.importActual<typeof import('@/shared/services/neighborhoodService')>(
    '@/shared/services/neighborhoodService',
  )
  return {
    ...actual,
    associateNeighborhoodEstablishments: (...args: unknown[]) =>
      associateNeighborhoodEstablishments(...args),
  }
})

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

const establishments: Establishment[] = [
  {
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
  },
  {
    id: 8,
    name: 'Bakery',
    establishmentCategoryId: 1,
    short: 'Bread',
    long: 'A bakery',
    maps: 'https://maps.example/bakery',
    string: null,
    coverImage: 'https://example.com/bakery.jpg',
    tags: 'bread',
    createdAt: '2026-01-02T00:00:00Z',
    updatedAt: '2026-01-02T00:00:00Z',
  },
]

function submit(wrapper: { vm: object }) {
  return (wrapper.vm as { submit: () => Promise<AssociateEstablishmentsResult> }).submit()
}

describe('NeighborhoodEstablishmentForm', () => {
  it('shows the neighborhood name as disabled and lists every establishment', () => {
    const { wrapper } = mountComponent(NeighborhoodEstablishmentForm, {
      props: { neighborhood, establishments },
    })
    const field = wrapper.get('[data-test-id="neighborhood-establishment-neighborhood"] input')

    expect((field.element as HTMLInputElement).value).toBe('Monzen-nakacho')
    expect((field.element as HTMLInputElement).disabled).toBe(true)
    expect(wrapper.text()).toContain('Cafe')
    expect(wrapper.text()).toContain('Bakery')
  })

  it('submits the neighborhood id and the selected establishment ids', async () => {
    associateNeighborhoodEstablishments.mockResolvedValue({ ok: true })
    const { wrapper } = mountComponent(NeighborhoodEstablishmentForm, {
      props: { neighborhood, establishments },
    })

    await wrapper.get('[data-test-id="neighborhood-establishment-7"] input').setValue(true)
    await wrapper.get('[data-test-id="neighborhood-establishment-8"] input').setValue(true)

    expect(await submit(wrapper)).toEqual({ ok: true })
    expect(associateNeighborhoodEstablishments).toHaveBeenCalledWith(3, [7, 8])
  })
})
