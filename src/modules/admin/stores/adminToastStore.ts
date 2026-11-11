import { nextTick, ref } from 'vue'
import { defineStore } from 'pinia'

export const useAdminToastStore = defineStore('adminToast', () => {
  const message = ref('')
  const visible = ref(false)

  async function show(text: string) {
    visible.value = false
    message.value = text
    await nextTick()
    visible.value = true
  }

  return { message, visible, show }
})
