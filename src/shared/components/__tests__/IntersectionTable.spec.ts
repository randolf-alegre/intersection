import { describe, expect, it } from 'vitest'
import IntersectionTable from '@/shared/components/IntersectionTable.vue'
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

const columns = [
  { title: 'Name', key: 'name' as const },
  { title: 'Address', key: 'address' as const },
  { title: 'Description', key: 'description' as const },
]

describe('IntersectionTable', () => {
  it('renders an empty table when there are no rows', () => {
    const { wrapper } = mountComponent(IntersectionTable, {
      props: { columns, rows: [], testId: 'property' },
    })

    expect(wrapper.get('[data-test-id="property-table"]').findAll('tbody tr')).toHaveLength(0)
  })

  it('lists each row from the given columns', () => {
    const { wrapper } = mountComponent(IntersectionTable, {
      props: { columns, rows: properties, testId: 'property' },
    })

    expect(wrapper.text()).toContain('Hatchobori')
    expect(wrapper.text()).toContain('A quiet stay')
    expect(wrapper.text()).toContain('1 Main Street')
    expect(wrapper.text()).toContain('Kiyosumi')
    expect(wrapper.get('[data-test-id="property-row-4"]').classes()).toContain('row-cream')
    expect(wrapper.get('[data-test-id="property-row-9"]').classes()).toContain('row-peach')
  })

  it('emits the property when a row is selected', async () => {
    const { wrapper } = mountComponent(IntersectionTable, {
      props: { columns, rows: properties, testId: 'property' },
    })

    await wrapper.get('[data-test-id="property-row-4"]').trigger('click')

    expect(wrapper.emitted('select')?.[0]).toEqual([properties[0]])
  })
})
