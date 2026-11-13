import { ref, type Ref } from 'vue'

type ActionResult = { ok: true } | { ok: false; error: { message: string } }

export function useRecordDialog<T>() {
  const open = ref(false)
  const saving = ref(false)
  const formError = ref<string | null>(null)
  const editing = ref(null) as Ref<T | null>

  function openRecord(record: T | null) {
    editing.value = record
    formError.value = null
    open.value = true
  }

  function closeRecord() {
    open.value = false
    formError.value = null
  }

  async function saveRecord<Fields>(
    submit: () => Promise<Fields | null | undefined> | undefined,
    persist: (fields: Fields, current: T | null) => Promise<ActionResult>,
  ) {
    const fields = await submit()
    if (!fields) return

    const current = editing.value
    saving.value = true
    formError.value = null
    try {
      const result = await persist(fields, current)
      if (!result.ok) {
        formError.value = result.error.message
        return
      }

      open.value = false
    } finally {
      saving.value = false
    }
  }

  return { open, saving, formError, editing, openRecord, closeRecord, saveRecord }
}
