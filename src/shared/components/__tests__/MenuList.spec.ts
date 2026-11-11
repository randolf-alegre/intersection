import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useAuthStore } from '@/shared/stores/authStore'
import MenuList from '@/shared/components/MenuList.vue'
import { mountComponent } from '@/test/mount'

describe('MenuList', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('shows Login when there is no session', async () => {
    const mounted = mountComponent(MenuList)
    await mounted.ready

    expect(mounted.wrapper.text()).toContain('About')
    expect(mounted.wrapper.text()).toContain('Login')
    expect(mounted.wrapper.get('[data-test-id="nav-login"]').exists()).toBe(true)
    expect(mounted.wrapper.get('[data-test-id="nav-about"]').exists()).toBe(true)
    expect(mounted.wrapper.text()).not.toContain('Home')
    expect(mounted.wrapper.text()).not.toContain('Logout')
  })

  it('shows Home and Logout when a session is saved', async () => {
    const mounted = mountComponent(MenuList)
    const auth = useAuthStore()
    auth.token = 'token'
    auth.refreshToken = 'refresh'
    await mounted.ready
    await mounted.wrapper.vm.$nextTick()

    expect(mounted.wrapper.text()).toContain('Home')
    expect(mounted.wrapper.text()).toContain('About')
    expect(mounted.wrapper.text()).toContain('Logout')
    expect(mounted.wrapper.get('[data-test-id="nav-home"]').exists()).toBe(true)
    expect(mounted.wrapper.get('[data-test-id="nav-logout"]').exists()).toBe(true)
    expect(mounted.wrapper.text()).not.toContain('Login')
  })

  it('logs out from the Logout button', async () => {
    const mounted = mountComponent(MenuList)
    const auth = useAuthStore()
    auth.token = 'token'
    auth.refreshToken = 'refresh'
    const logout = vi.spyOn(auth, 'logout').mockResolvedValue()
    await mounted.ready
    await mounted.wrapper.vm.$nextTick()

    const button = mounted.wrapper.findAll('button').find((item) => item.text() === 'Logout')
    expect(button).toBeTruthy()
    await button?.trigger('click')

    expect(logout).toHaveBeenCalledOnce()
  })
})
