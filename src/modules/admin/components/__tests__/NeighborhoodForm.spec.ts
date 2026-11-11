import { describe, expect, it } from 'vitest'
import NeighborhoodForm from '@/modules/admin/components/NeighborhoodForm.vue'
import type { NeighborhoodFormValues } from '@/modules/admin/components/NeighborhoodForm.vue'
import type { Neighborhood } from '@/shared/services/neighborhoodService'
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

function formValues(wrapper: { vm: object }) {
  return (wrapper.vm as { submit: () => Promise<NeighborhoodFormValues | null> }).submit()
}

function inputValue(
  wrapper: { get: (selector: string) => { find: (selector: string) => { element: Element } } },
  testId: string,
) {
  return (wrapper.get(`[data-test-id="${testId}"]`).find('input').element as HTMLInputElement).value
}

describe('NeighborhoodForm', () => {
  it('starts empty so it can create a neighborhood', () => {
    const { wrapper } = mountComponent(NeighborhoodForm)

    expect(wrapper.text()).toContain('Create neighborhood')
    expect(wrapper.find('[data-test-id="neighborhood-delete"]').exists()).toBe(false)
    expect(inputValue(wrapper, 'neighborhood-name')).toBe('')
    expect(inputValue(wrapper, 'neighborhood-city')).toBe('')
  })

  it('fills the fields from an existing neighborhood', () => {
    const { wrapper } = mountComponent(NeighborhoodForm, { props: { neighborhood } })

    expect(wrapper.text()).toContain('Update neighborhood')
    expect(wrapper.get('[data-test-id="neighborhood-delete"]').attributes('aria-label')).toBe(
      'Delete neighborhood',
    )
    expect(inputValue(wrapper, 'neighborhood-name')).toBe('Monzen-nakacho')
    expect(inputValue(wrapper, 'neighborhood-hashtag')).toBe('#local')
    expect(inputValue(wrapper, 'neighborhood-city')).toBe('Tokyo')
    expect(inputValue(wrapper, 'neighborhood-tags')).toBe('food')
  })

  it('requires the neighborhood fields', async () => {
    const { wrapper } = mountComponent(NeighborhoodForm)

    expect(await formValues(wrapper)).toBeNull()
    expect(wrapper.text()).toContain('Name is required')
    expect(wrapper.text()).toContain('Hashtag is required')
  })

  it('returns the trimmed fields when they are filled', async () => {
    const { wrapper } = mountComponent(NeighborhoodForm, { props: { neighborhood } })

    await wrapper.get('[data-test-id="neighborhood-name"] input').setValue('  Renamed  ')

    expect(await formValues(wrapper)).toEqual({
      name: 'Renamed',
      hashtag: '#local',
      description: 'A walkable neighborhood',
      hashtagDescription: 'Close to the station',
      city: 'Tokyo',
      tags: 'food',
    })
  })
})
