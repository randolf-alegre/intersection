<script setup lang="ts" generic="T extends { id: number }">
defineProps<{
  columns: { title: string; key: keyof T & string }[]
  rows: T[]
  testId: string
}>()

const emit = defineEmits<{
  select: [row: T]
}>()
</script>

<template>
  <v-table :data-test-id="`${testId}-table`">
    <thead>
      <tr>
        <th v-for="column in columns" :key="column.key" class="text-left font-extrabold">
          {{ column.title }}
        </th>
      </tr>
    </thead>
    <tbody>
      <tr
        v-for="(row, index) in rows"
        :key="row.id"
        class="cursor-pointer"
        :class="index % 2 === 0 ? 'row-cream' : 'row-peach'"
        :data-test-id="`${testId}-row-${row.id}`"
        @click="emit('select', row)"
      >
        <td v-for="column in columns" :key="column.key">{{ row[column.key] }}</td>
      </tr>
    </tbody>
  </v-table>
</template>

<style scoped>
.row-cream :deep(td) {
  background-color: var(--color-cream) !important;
}

.row-peach :deep(td) {
  background-color: var(--color-peach) !important;
}
</style>
