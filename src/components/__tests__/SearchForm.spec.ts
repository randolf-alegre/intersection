import { afterEach, describe, expect, it, vi } from 'vitest'
import SearchForm from '@/components/SearchForm.vue'
import { mountComponent } from './mount'

describe('SearchForm', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it('shows the label', () => {
    const { wrapper } = mountComponent(SearchForm, {
      props: { label: 'Search for a property', onSearch: vi.fn() },
    })

    expect(wrapper.text()).toContain('Search for a property')
    expect(wrapper.get('[data-test-id="search-input"]').exists()).toBe(true)
  })

  it('calls onSearch with the field text after the typing pause', async () => {
    vi.useFakeTimers()
    const onSearch = vi.fn()
    const { wrapper } = mountComponent(SearchForm, {
      props: { label: 'Search', onSearch },
    })

    await wrapper.get('input').setValue('Hatchobori')

    expect(onSearch).not.toHaveBeenCalled()

    await vi.advanceTimersByTimeAsync(299)
    expect(onSearch).not.toHaveBeenCalled()

    await vi.advanceTimersByTimeAsync(1)
    expect(onSearch).toHaveBeenCalledOnce()
    expect(onSearch).toHaveBeenCalledWith('Hatchobori')
  })

  it('sends only the latest text when typing continues', async () => {
    vi.useFakeTimers()
    const onSearch = vi.fn()
    const { wrapper } = mountComponent(SearchForm, {
      props: { label: 'Search', onSearch },
    })

    await wrapper.get('input').setValue('Hat')
    await vi.advanceTimersByTimeAsync(200)
    await wrapper.get('input').setValue('Hatchobori')
    await vi.advanceTimersByTimeAsync(300)

    expect(onSearch).toHaveBeenCalledOnce()
    expect(onSearch).toHaveBeenCalledWith('Hatchobori')
  })
})
