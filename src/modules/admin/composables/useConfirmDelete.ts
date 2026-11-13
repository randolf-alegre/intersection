import { ref } from 'vue'

type DeleteResult = { ok: true } | { ok: false; error: { message: string } }

export function useConfirmDelete(
  recordId: () => number | null | undefined,
  remove: (id: number) => Promise<DeleteResult>,
  onDeleted: () => void,
) {
  const confirmingDelete = ref(false)
  const deleting = ref(false)
  const deleteError = ref<string | null>(null)

  function resetDelete() {
    confirmingDelete.value = false
    deleteError.value = null
  }

  async function confirmDelete() {
    const id = recordId()
    if (id == null) return

    deleting.value = true
    deleteError.value = null
    try {
      const result = await remove(id)
      if (!result.ok) {
        deleteError.value = result.error.message
        return
      }

      confirmingDelete.value = false
      onDeleted()
    } finally {
      deleting.value = false
    }
  }

  return { confirmingDelete, deleting, deleteError, resetDelete, confirmDelete }
}
