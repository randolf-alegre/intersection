import { describe, expect, it, vi } from 'vitest'
import NeighborhoodPropertyForm from '@/modules/admin/components/NeighborhoodPropertyForm.vue'
import type { Neighborhood } from '@/shared/services/neighborhoodService'
import type { PropertyNeighborhoodResult } from '@/shared/services/propertyNeighborhoodService'
import type { Property } from '@/shared/services/propertiesService'
import { mountComponent } from '@/test/mount'

const associateNeighborhoodProperties = vi.fn()

vi.mock('@/shared/services/propertyNeighborhoodService', () => ({
  associateNeighborhoodProperties: (...args: unknown[]) => associateNeighborhoodProperties(...args),
}))

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

const properties: Property[] = [
  {
    id: 4,
    name: 'Hatchobori',
    description: 'A quiet stay',
    address: '1 Main Street',
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 8,
    name: 'Kiyosumi',
    description: 'Along the river',
    address: '2 Canal Street',
    createdAt: '2026-01-02T00:00:00Z',
    updatedAt: '2026-01-02T00:00:00Z',
  },
]

function submit(wrapper: { vm: object }) {
  return (wrapper.vm as { submit: () => Promise<PropertyNeighborhoodResult> }).submit()
}

describe('NeighborhoodPropertyForm', () => {
  it('shows the neighborhood name as disabled and lists every property', () => {
    const { wrapper } = mountComponent(NeighborhoodPropertyForm, {
      props: { neighborhood, properties },
    })
    const field = wrapper.get('[data-test-id="neighborhood-property-neighborhood"] input')

    expect((field.element as HTMLInputElement).value).toBe('Monzen-nakacho')
    expect((field.element as HTMLInputElement).disabled).toBe(true)
    expect(wrapper.text()).toContain('Hatchobori')
    expect(wrapper.text()).toContain('Kiyosumi')
  })

  it('submits the neighborhood id and the selected property ids', async () => {
    associateNeighborhoodProperties.mockResolvedValue({ ok: true })
    const { wrapper } = mountComponent(NeighborhoodPropertyForm, {
      props: { neighborhood, properties },
    })

    await wrapper.get('[data-test-id="neighborhood-property-4"] input').setValue(true)
    await wrapper.get('[data-test-id="neighborhood-property-8"] input').setValue(true)

    expect(await submit(wrapper)).toEqual({ ok: true })
    expect(associateNeighborhoodProperties).toHaveBeenCalledWith(3, [4, 8])
  })
})
