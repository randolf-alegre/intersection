<template>
  <v-app class="bg-linen font-sans text-ink">
    <v-app-bar
      class="px-0 [&_.v-toolbar__content]:!px-0 [&_.v-toolbar__content]:w-full"
      color="primary"
      flat
      height="88"
    >
      <div
        class="grid h-full w-full grid-cols-1 items-center lg:grid-cols-[minmax(0,3fr)_minmax(0,4fr)_minmax(0,3fr)]"
      >
        <div class="hidden lg:block" />
        <div class="flex min-w-0 items-center px-4 lg:px-6">
          <RouterLink
            class="inline-flex h-10 items-center rounded-[10px] bg-linen px-3.5 text-[0.95rem] font-black tracking-[0.06em] text-flame no-underline uppercase"
            to="/"
          >
            InterSection
          </RouterLink>

          <MenuList />
        </div>
      </div>
    </v-app-bar>

    <v-main>
      <div
        class="grid w-full grid-cols-1 py-10 pb-14 lg:grid-cols-[minmax(0,3fr)_minmax(0,4fr)_minmax(0,3fr)]"
      >
        <div class="hidden lg:block" />
        <div class="min-w-0 px-4 lg:px-6">
          <RouterView />
        </div>
      </div>
    </v-main>

    <v-footer class="px-0" color="primary">
      <div
        class="grid w-full grid-cols-1 py-4 lg:grid-cols-[minmax(0,3fr)_minmax(0,4fr)_minmax(0,3fr)]"
      >
        <div class="hidden lg:block" />
        <div class="flex min-w-0 flex-col justify-between gap-4 px-4 sm:flex-row lg:px-6">
          <div>
            <p class="m-0 text-xl font-extrabold">Section L</p>
            <p class="mt-1 text-cream/90">Part of Eave Hospitality</p>
          </div>
        </div>
      </div>
    </v-footer>
  </v-app>
</template>

<script setup lang="ts">
import { useAuthStore } from '@/stores/authStore'
import MenuList from '@/components/MenuList.vue'

const auth = useAuthStore()
</script>
