import { describe, expect, it, vi } from 'vitest'
import PropertyNeighborhoodForm from '@/modules/admin/components/PropertyNeighborhoodForm.vue'
import type { Neighborhood } from '@/shared/services/neighborhoodService'
import type { Property } from '@/shared/services/propertiesService'
import type { PropertyNeighborhoodResult } from '@/shared/services/propertyNeighborhoodService'
import { mountComponent } from '@/test/mount'

const associatePropertyNeighborhoods = vi.fn()

vi.mock('@/shared/services/propertyNeighborhoodService', () => ({
  associatePropertyNeighborhoods: (...args: unknown[]) => associatePropertyNeighborhoods(...args),
}))

const property: Property = {
  id: 4,
  name: 'Hatchobori',
  description: 'A quiet stay',
  address: '1 Main Street',
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
}

const neighborhoods: Neighborhood[] = [
  {
    id: 3,
    name: 'Monzen-nakacho',
    hashtag: '#local',
    description: 'A walkable neighborhood',
    hashtagDescription: 'Close to the station',
    city: 'Tokyo',
    tags: 'food',
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 9,
    name: 'Kiyosumi',
    hashtag: '#canal',
    description: 'Along the river',
    hashtagDescription: 'Quiet streets',
    city: 'Tokyo',
    tags: 'walk',
    createdAt: '2026-01-02T00:00:00Z',
    updatedAt: '2026-01-02T00:00:00Z',
  },
]

function submit(wrapper: { vm: object }) {
  return (wrapper.vm as { submit: () => Promise<PropertyNeighborhoodResult> }).submit()
}

describe('PropertyNeighborhoodForm', () => {
  it('shows the property name as disabled and lists every neighborhood', () => {
    const { wrapper } = mountComponent(PropertyNeighborhoodForm, {
      props: { property, neighborhoods },
    })
    const field = wrapper.get('[data-test-id="property-neighborhood-property"] input')

    expect((field.element as HTMLInputElement).value).toBe('Hatchobori')
    expect((field.element as HTMLInputElement).disabled).toBe(true)
    expect(wrapper.text()).toContain('Monzen-nakacho')
    expect(wrapper.text()).toContain('Kiyosumi')
  })

  it('submits the property id and the selected neighborhood ids', async () => {
    associatePropertyNeighborhoods.mockResolvedValue({ ok: true })
    const { wrapper } = mountComponent(PropertyNeighborhoodForm, {
      props: { property, neighborhoods },
    })

    await wrapper.get('[data-test-id="property-neighborhood-3"] input').setValue(true)
    await wrapper.get('[data-test-id="property-neighborhood-9"] input').setValue(true)

    expect(await submit(wrapper)).toEqual({ ok: true })
    expect(associatePropertyNeighborhoods).toHaveBeenCalledWith(4, [3, 9])
  })
})
