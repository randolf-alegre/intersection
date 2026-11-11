<script setup lang="ts">
import { ref, watch } from 'vue'
import GuestLoginForm from '@/modules/guest/components/GuestLoginForm.vue'
import { useAuthStore } from '@/shared/stores/authStore'

const tab = ref('guest')
const email = ref('')
const password = ref('')
const auth = useAuthStore()

watch(tab, () => {
  auth.error = null
})

function submitMember() {
  return auth.loginAsMember(email.value.trim(), password.value)
}
</script>

<template>
  <section>
    <p class="text-[0.95rem] font-extrabold tracking-[0.08em] text-flame uppercase">Log in</p>
    <h1
      class="text-[clamp(2.75rem,7vw,4.5rem)] leading-[0.92] font-black tracking-[-0.035em] text-flame"
    >
      Welcome back
    </h1>
    <v-card class="mt-8 overflow-hidden">
      <v-tabs v-model="tab" color="primary" grow slider-color="primary">
        <v-tab class="!font-extrabold !tracking-[0.04em] !uppercase" value="guest">Guest</v-tab>
        <v-tab class="!font-extrabold !tracking-[0.04em] !uppercase" value="members">
          Members
        </v-tab>
      </v-tabs>

      <v-card-text class="px-4 pt-6 pb-4">
        <v-tabs-window v-model="tab">
          <v-tabs-window-item value="guest">
            <p class="mb-4 text-base leading-normal text-ink">
              Enter the keycard number from your stay.
            </p>
            <GuestLoginForm />
          </v-tabs-window-item>

          <v-tabs-window-item value="members">
            <p class="mb-4 text-base leading-normal text-ink">
              Sign in for member rates and offers when you book direct.
            </p>
            <v-form class="flex flex-col gap-1" @submit.prevent="submitMember">
              <v-text-field
                v-model="email"
                autocomplete="email"
                label="Email"
                type="email"
                variant="outlined"
              />
              <v-text-field
                v-model="password"
                autocomplete="current-password"
                label="Password"
                type="password"
                variant="outlined"
              />
              <p v-if="auth.error" class="mb-2 text-sm text-flame">{{ auth.error }}</p>
              <v-btn
                block
                class="!rounded-[10px] !font-extrabold !tracking-[0.04em] !uppercase hover:!bg-flame-dark"
                color="primary"
                :loading="auth.loading"
                size="large"
                type="submit"
              >
                Log in
              </v-btn>
            </v-form>
          </v-tabs-window-item>
        </v-tabs-window>
      </v-card-text>
    </v-card>
  </section>
</template>
