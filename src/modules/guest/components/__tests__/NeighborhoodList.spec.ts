import { describe, expect, it } from 'vitest'
import NeighborhoodList from '@/modules/guest/components/NeighborhoodList.vue'
import type { Neighborhood } from '@/shared/services/neighborhoodService'
import { mountComponent } from '@/test/mount'

const neighborhoods: Neighborhood[] = [
  {
    id: 3,
    name: 'Monzen-nakacho',
    hashtag: '#local',
    description: 'Temple streets',
    hashtagDescription: 'Walk the back lanes',
    city: 'Tokyo',
    tags: 'temple, food',
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  },
]

describe('NeighborhoodList', () => {
  it('shows an empty message when there are no neighborhoods', () => {
    const { wrapper } = mountComponent(NeighborhoodList, { props: { neighborhoods: [] } })

    expect(wrapper.text()).toContain('No Neighborhood Found')
    expect(wrapper.get('[data-test-id="neighborhood-empty"]').exists()).toBe(true)
  })

  it('links a neighborhood card to its establishments', async () => {
    const mounted = mountComponent(NeighborhoodList, { props: { neighborhoods } }, '/properties/12')
    await mounted.ready

    expect(mounted.wrapper.text()).toContain('Monzen-nakacho')
    expect(mounted.wrapper.text()).toContain('Temple streets')
    expect(mounted.wrapper.text()).toContain('Walk the back lanes')
    expect(mounted.wrapper.text()).toContain('#local')
    expect(mounted.wrapper.text()).toContain('City: Tokyo')
    expect(mounted.wrapper.text()).toContain('Tags: temple, food')
    expect(mounted.wrapper.text()).toContain('View hidden gems')
    expect(mounted.wrapper.get('a').attributes('href')).toBe(
      '/properties/12/neighborhoods/3/establishments',
    )
    expect(mounted.wrapper.get('a').attributes('data-test-id')).toBe('neighborhood-3')
  })
})
