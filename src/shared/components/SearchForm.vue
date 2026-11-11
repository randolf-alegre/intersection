<script setup lang="ts">
import { onBeforeUnmount } from 'vue'

const props = defineProps<{
  label: string
  onSearch: (query: string) => void
}>()

let searchTimer: ReturnType<typeof setTimeout> | undefined

function onInput(value: string | null) {
  const query = value ?? ''
  if (searchTimer) clearTimeout(searchTimer)

  searchTimer = setTimeout(() => {
    props.onSearch(query)
  }, 300)
}

onBeforeUnmount(() => {
  if (searchTimer) clearTimeout(searchTimer)
})
</script>

<template>
  <v-text-field
    data-test-id="search-input"
    density="compact"
    hide-details
    :label="props.label"
    type="search"
    variant="outlined"
    @update:model-value="onInput"
  />
</template>
