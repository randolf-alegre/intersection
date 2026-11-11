import { describe, expect, it } from 'vitest'
import EstablishmentList from '@/components/EstablishmentList.vue'
import type { Establishment } from '@/services/establishmentService'
import { mountComponent } from './mount'

const establishment: Establishment = {
  id: 8,
  name: 'Coffee Stand',
  establishmentCategoryId: 2,
  short: 'Small cups',
  long: 'A counter facing the street',
  maps: 'https://www.google.com/maps/search/?api=1&query=Coffee%20Stand',
  string: null,
  coverImage: 'https://example.com/cover.jpg',
  tags: 'coffee',
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
}

describe('EstablishmentList', () => {
  it('renders the cover, details, and a closed map', () => {
    const { wrapper } = mountComponent(EstablishmentList, {
      props: { establishments: [establishment] },
    })

    expect(wrapper.text()).toContain('Coffee Stand')
    expect(wrapper.text()).toContain('Short: Small cups')
    expect(wrapper.text()).toContain('A counter facing the street')
    expect(wrapper.text()).toContain('Tags: coffee')
    expect(wrapper.getComponent({ name: 'VImg' }).props('src')).toBe(
      'https://example.com/cover.jpg',
    )
    expect(wrapper.get('.v-img').attributes('aria-label')).toBe('Coffee Stand')
    expect(wrapper.find('iframe').exists()).toBe(false)
    expect(wrapper.get('[data-test-id="establishment-8"]').exists()).toBe(true)
    expect(wrapper.get('[data-test-id="establishment-map-toggle-8"]').exists()).toBe(true)
    expect(wrapper.text()).toContain('Show map')
  })

  it('opens the map embed and hides it again', async () => {
    const { wrapper } = mountComponent(EstablishmentList, {
      props: { establishments: [establishment] },
    })

    await wrapper.get('button').trigger('click')

    const frame = wrapper.get('[data-test-id="establishment-map-8"]')
    expect(frame.attributes('src')).toBe(
      'https://maps.google.com/maps?q=Coffee%20Stand&output=embed',
    )
    expect(wrapper.text()).toContain('Show map')

    await frame.trigger('load')

    expect(wrapper.text()).toContain('Hide map')

    await wrapper.get('button').trigger('click')

    expect(wrapper.find('iframe').exists()).toBe(false)
    expect(wrapper.text()).toContain('Show map')
  })
})
