import { flushPromises } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import AdminToast from '@/modules/admin/components/AdminToast.vue'
import { useAdminToastStore } from '@/modules/admin/stores/adminToastStore'
import { mountComponent } from '@/test/mount'

describe('AdminToast', () => {
  beforeEach(() => {
    vi.stubGlobal('visualViewport', {
      width: 1024,
      height: 768,
      offsetLeft: 0,
      offsetTop: 0,
      pageLeft: 0,
      pageTop: 0,
      scale: 1,
      addEventListener: () => {},
      removeEventListener: () => {},
    })
  })

  it('shows the message passed to show', async () => {
    const { wrapper } = mountComponent(AdminToast, { attachTo: document.body })
    await useAdminToastStore().show('Neighborhoods associated successfully')
    await flushPromises()

    expect(document.body.textContent).toContain('Neighborhoods associated successfully')
    wrapper.unmount()
  })
})
