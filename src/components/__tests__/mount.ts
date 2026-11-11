import { mount, type MountingOptions, type VueWrapper } from '@vue/test-utils'
import { createPinia, setActivePinia, type Pinia } from 'pinia'
import { createMemoryHistory, createRouter, type Router } from 'vue-router'
import type { Component } from 'vue'
import vuetify from '@/plugins/vuetify'

export function mountComponent(
  component: Component,
  options: MountingOptions<Component> = {},
  path = '/',
) {
  const pinia = createPinia()
  setActivePinia(pinia)
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/', component: { template: '<div />' } },
      { path: '/about', component: { template: '<div />' } },
      { path: '/login', component: { template: '<div />' } },
      { path: '/properties/:property_id', component: { template: '<div />' } },
      {
        path: '/properties/:property_id/neighborhoods/:neighborhood_id/establishments',
        component: { template: '<div />' },
      },
    ],
  })

  const wrapper = mount(component, {
    ...options,
    global: {
      ...options.global,
      plugins: [vuetify, pinia, router, ...(options.global?.plugins ?? [])],
    },
  })

  return { wrapper, pinia, router, ready: router.push(path).then(() => router.isReady()) }
}

export type Mounted = {
  wrapper: VueWrapper
  pinia: Pinia
  router: Router
}
