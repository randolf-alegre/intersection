import { describe, expect, it } from 'vitest'
import PropertyList from '@/modules/guest/components/PropertyList.vue'
import type { Property } from '@/shared/services/propertiesService'
import { mountComponent } from '@/test/mount'

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
    id: 9,
    name: 'Kiyosumi',
    description: 'Near the garden',
    address: '2 River Road',
    createdAt: '2026-01-02T00:00:00Z',
    updatedAt: '2026-01-02T00:00:00Z',
  },
]

describe('PropertyList', () => {
  it('renders nothing when there are no properties', () => {
    const { wrapper } = mountComponent(PropertyList, { props: { properties: [] } })

    expect(wrapper.findAll('a')).toHaveLength(0)
  })

  it('links each property card to its page', async () => {
    const mounted = mountComponent(PropertyList, { props: { properties } })
    await mounted.ready

    expect(mounted.wrapper.text()).toContain('Hatchobori')
    expect(mounted.wrapper.text()).toContain('A quiet stay')
    expect(mounted.wrapper.text()).toContain('1 Main Street')
    expect(mounted.wrapper.text()).toContain('Kiyosumi')

    const links = mounted.wrapper.findAll('a')
    expect(links[0]?.attributes('href')).toBe('/properties/4')
    expect(links[0]?.attributes('data-test-id')).toBe('property-4')
    expect(links[1]?.attributes('href')).toBe('/properties/9')
    expect(links[1]?.attributes('data-test-id')).toBe('property-9')
  })
})
