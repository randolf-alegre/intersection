import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useAuthStore } from '@/shared/stores/authStore'
import GuestLoginForm from '@/modules/guest/components/GuestLoginForm.vue'
import { mountComponent } from '@/test/mount'

describe('GuestLoginForm', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('shows the keycard field and a login error', async () => {
    const mounted = mountComponent(GuestLoginForm)
    const auth = useAuthStore()
    auth.error = 'Keycard was not recognized'
    await mounted.ready
    await mounted.wrapper.vm.$nextTick()

    expect(mounted.wrapper.text()).toContain('Keycard #')
    expect(mounted.wrapper.text()).toContain('Continue')
    expect(mounted.wrapper.get('[data-test-id="guest-keycard"]').exists()).toBe(true)
    expect(mounted.wrapper.get('[data-test-id="guest-continue"]').exists()).toBe(true)
    expect(mounted.wrapper.get('[data-test-id="guest-login-error"]').text()).toContain(
      'Keycard was not recognized',
    )
  })

  it('asks for a keycard before logging in', async () => {
    const mounted = mountComponent(GuestLoginForm)
    const auth = useAuthStore()
    const loginAsGuest = vi.spyOn(auth, 'loginAsGuest').mockResolvedValue(null)
    await mounted.ready

    await mounted.wrapper.get('form').trigger('submit')
    await mounted.wrapper.vm.$nextTick()

    expect(mounted.wrapper.text()).toContain('Keycard # is required')
    expect(loginAsGuest).not.toHaveBeenCalled()
  })

  it('rejects a keycard with characters other than letters, numbers, hyphens, and slashes', async () => {
    const mounted = mountComponent(GuestLoginForm)
    const auth = useAuthStore()
    const loginAsGuest = vi.spyOn(auth, 'loginAsGuest').mockResolvedValue(null)
    await mounted.ready

    await mounted.wrapper.get('input').setValue('abc_1')
    await mounted.wrapper.get('form').trigger('submit')
    await mounted.wrapper.vm.$nextTick()

    expect(mounted.wrapper.text()).toContain(
      'Keycard # must be letters, numbers, hyphens, and slashes only',
    )
    expect(loginAsGuest).not.toHaveBeenCalled()
  })

  it('accepts a keycard that includes hyphens and slashes', async () => {
    const mounted = mountComponent(GuestLoginForm)
    const auth = useAuthStore()
    const loginAsGuest = vi.spyOn(auth, 'loginAsGuest').mockResolvedValue(null)
    await mounted.ready

    await mounted.wrapper.get('input').setValue('ab-1/2')
    await mounted.wrapper.get('form').trigger('submit')
    await mounted.wrapper.vm.$nextTick()

    expect(loginAsGuest).toHaveBeenCalledWith('ab-1/2')
  })

  it('logs in with a trimmed keycard', async () => {
    const mounted = mountComponent(GuestLoginForm)
    const auth = useAuthStore()
    const loginAsGuest = vi.spyOn(auth, 'loginAsGuest').mockResolvedValue(null)
    await mounted.ready

    await mounted.wrapper.get('input').setValue('Ab12')
    await mounted.wrapper.get('form').trigger('submit')
    await mounted.wrapper.vm.$nextTick()

    expect(loginAsGuest).toHaveBeenCalledWith('Ab12')
  })
})
