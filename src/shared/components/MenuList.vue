<script setup lang="ts">
import { computed } from 'vue'
import { useAuthStore } from '@/shared/stores/authStore'

const auth = useAuthStore()
const homePath = computed(() => (auth.admin ? '/admin' : '/'))
</script>

<template>
  <div id="nav-links-container" class="ml-auto flex items-center" data-test-id="nav-links">
    <v-btn
      v-if="auth.isAuthenticated"
      class="!font-medium !tracking-normal !text-cream !normal-case active-link:!bg-linen active-link:!text-flame"
      data-test-id="nav-home"
      exact
      :to="homePath"
      variant="text"
    >
      Home
    </v-btn>
    <v-btn
      class="!font-medium !tracking-normal !text-cream !normal-case active-link:!bg-linen active-link:!text-flame"
      data-test-id="nav-about"
      to="/about"
      variant="text"
    >
      About
    </v-btn>
    <v-btn
      v-if="auth.isAuthenticated"
      class="!font-medium !tracking-normal !text-cream !normal-case"
      data-test-id="nav-logout"
      variant="text"
      @click="auth.logout()"
    >
      Logout
    </v-btn>
    <v-btn
      v-else
      class="!font-medium !tracking-normal !text-cream !normal-case active-link:!bg-linen active-link:!text-flame"
      data-test-id="nav-login"
      to="/login"
      variant="text"
    >
      Login
    </v-btn>
  </div>
</template>
