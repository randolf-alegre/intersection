import { ref, watch } from 'vue'

type SelectionResult = { ok: true } | { ok: false; error: { message: string } }

export function useIdSelection(
  sourceId: () => number,
  associate: (id: number, selectedIds: number[]) => Promise<SelectionResult>,
) {
  const selectedIds = ref<number[]>([])
  const error = ref<string | null>(null)

  watch(sourceId, () => {
    selectedIds.value = []
    error.value = null
  })

  async function submit() {
    error.value = null
    const result = await associate(sourceId(), selectedIds.value)
    if (!result.ok) error.value = result.error.message
    return result
  }

  return { selectedIds, error, submit }
}
