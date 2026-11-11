<script setup lang="ts">
import { onMounted, ref } from 'vue'
import EstablishmentForm from '@/modules/admin/components/EstablishmentForm.vue'
import type { EstablishmentFormValues } from '@/modules/admin/components/EstablishmentForm.vue'
import { useEstablishmentCategoryStore } from '@/modules/admin/stores/establishmentCategoryStore'
import { useEstablishmentStore } from '@/modules/guest/stores/establishmentStore'
import IntersectionTable from '@/shared/components/IntersectionTable.vue'
import type { Establishment } from '@/shared/services/establishmentService'

const establishmentStore = useEstablishmentStore()
const categoryStore = useEstablishmentCategoryStore()
const open = ref(false)
const saving = ref(false)
const formError = ref<string | null>(null)
const editing = ref<Establishment | null>(null)
const establishmentForm = ref<{ submit: () => Promise<EstablishmentFormValues | null> } | null>(
  null,
)

const establishmentColumns: { title: string; key: 'name' | 'short' | 'tags' }[] = [
  { title: 'Name', key: 'name' },
  { title: 'Short', key: 'short' },
  { title: 'Tags', key: 'tags' },
]

onMounted(() => {
  void establishmentStore.loadAllEstablishments()
  void categoryStore.loadCategories()
})

function openEstablishment(establishment: Establishment | null) {
  editing.value = establishment
  formError.value = null
  open.value = true
}

function closeEstablishment() {
  open.value = false
  formError.value = null
}

async function saveEstablishment() {
  const values = await establishmentForm.value?.submit()
  if (!values) return

  const establishment = editing.value
  saving.value = true
  formError.value = null
  try {
    const result = establishment
      ? await establishmentStore.saveEstablishment(establishment.id, values)
      : await establishmentStore.addEstablishment(values)
    if (!result.ok) {
      formError.value = result.error.message
      return
    }

    open.value = false
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <section data-test-id="admin-establishments">
    <div class="flex items-center justify-between gap-4">
      <h2 class="text-2xl leading-tight font-extrabold text-flame">Establishments</h2>
      <v-btn
        class="!rounded-[10px] !font-extrabold !tracking-[0.04em] !uppercase hover:!bg-flame-dark"
        color="primary"
        data-test-id="add-establishment"
        @click="openEstablishment(null)"
      >
        Add Establishment
      </v-btn>
    </div>
    <p class="mt-2 text-base leading-normal text-ink">
      Manage the places listed in each neighborhood.
    </p>

    <div
      v-if="establishmentStore.loading && establishmentStore.establishments.length === 0"
      class="mt-6"
    >
      <v-progress-circular indeterminate color="primary" size="24" />
    </div>
    <p
      v-else-if="establishmentStore.error && establishmentStore.establishments.length === 0"
      class="mt-6 text-base text-ink"
    >
      {{ establishmentStore.error }}
    </p>
    <div v-else class="mt-6">
      <IntersectionTable
        :columns="establishmentColumns"
        :rows="establishmentStore.establishments"
        test-id="establishment"
        @select="openEstablishment"
      />
      <p v-if="establishmentStore.error" class="mt-4 text-base text-ink">
        {{ establishmentStore.error }}
      </p>
    </div>

    <v-dialog v-model="open" max-width="560">
      <v-card data-test-id="establishment-dialog">
        <v-card-text class="pt-5">
          <EstablishmentForm
            v-if="open"
            ref="establishmentForm"
            :categories="categoryStore.categories"
            :establishment="editing"
            @deleted="closeEstablishment"
          />
          <p v-if="formError" class="text-sm text-flame" data-test-id="establishment-form-error">
            {{ formError }}
          </p>
        </v-card-text>
        <v-card-actions class="px-4 pt-0 pb-4">
          <v-spacer />
          <v-btn data-test-id="establishment-form-cancel" variant="text" @click="closeEstablishment">
            Cancel
          </v-btn>
          <v-btn
            class="!rounded-[10px] !font-extrabold !tracking-[0.04em] !uppercase hover:!bg-flame-dark"
            color="primary"
            data-test-id="establishment-form-submit"
            :loading="saving"
            @click="saveEstablishment"
          >
            Submit
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </section>
</template>
