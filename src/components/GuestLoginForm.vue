<script setup lang="ts">
import { ref } from 'vue'
import type { VForm } from 'vuetify/components'
import { useAuthStore } from '@/stores/authStore'

const keycard = ref('')
const form = ref<VForm | null>(null)
const auth = useAuthStore()

const required = (value: string) => value.trim().length > 0 || 'Keycard # is required'

const keycardCharacters = (value: string) =>
  value.trim().length === 0 ||
  /^[A-Za-z0-9/-]+$/.test(value) ||
  'Keycard # must be letters, numbers, hyphens, and slashes only'

async function submit() {
  const result = await form.value?.validate()
  if (!result?.valid) return

  await auth.loginAsGuest(keycard.value.trim())
}
</script>

<template>
  <v-form
    ref="form"
    class="flex flex-col gap-1"
    data-test-id="guest-login-form"
    @submit.prevent="submit"
  >
    <v-text-field
      v-model="keycard"
      :rules="[required, keycardCharacters]"
      autocomplete="off"
      data-test-id="guest-keycard"
      label="Keycard #"
      pattern="[A-Za-z0-9/-]+"
      required
      variant="outlined"
    />
    <p v-if="auth.error" class="mb-2 text-sm text-flame" data-test-id="guest-login-error">
      {{ auth.error }}
    </p>
    <v-btn
      block
      class="!rounded-[10px] !font-extrabold !tracking-[0.04em] !uppercase hover:!bg-flame-dark"
      color="primary"
      data-test-id="guest-continue"
      :loading="auth.loading"
      size="large"
      type="submit"
    >
      Continue
    </v-btn>
  </v-form>
</template>
