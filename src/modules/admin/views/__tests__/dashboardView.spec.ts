import { describe, expect, it } from 'vitest'
import DashboardView from '@/modules/admin/views/dashboardView.vue'
import { mountComponent } from '@/test/mount'

describe('DashboardView', () => {
  it('shows a property, neighborhood, category, and establishment tab', async () => {
    const { wrapper } = mountComponent(DashboardView)

    expect(wrapper.get('[data-test-id="admin-properties"]').text()).toContain('Properties')

    await wrapper.get('[data-test-id="admin-tab-neighborhoods"]').trigger('click')
    expect(wrapper.get('[data-test-id="admin-neighborhoods"]').isVisible()).toBe(true)

    await wrapper.get('[data-test-id="admin-tab-categories"]').trigger('click')
    expect(wrapper.get('[data-test-id="admin-establishment-categories"]').isVisible()).toBe(true)

    await wrapper.get('[data-test-id="admin-tab-establishments"]').trigger('click')
    expect(wrapper.get('[data-test-id="admin-establishments"]').isVisible()).toBe(true)
  })
})
