<script setup lang="ts">
import { useAdminToastStore } from '@/modules/admin/stores/adminToastStore'

const toast = useAdminToastStore()
</script>

<template>
  <v-snackbar
    v-model="toast.visible"
    color="primary"
    data-test-id="admin-toast"
    location="top right"
    timeout="3000"
  >
    {{ toast.message }}
  </v-snackbar>
</template>
