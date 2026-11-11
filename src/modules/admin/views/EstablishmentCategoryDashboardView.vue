<script setup lang="ts">
import { onMounted, ref } from 'vue'
import EstablishmentCategoryForm from '@/modules/admin/components/EstablishmentCategoryForm.vue'
import { useEstablishmentCategoryStore } from '@/modules/admin/stores/establishmentCategoryStore'
import IntersectionTable from '@/shared/components/IntersectionTable.vue'
import {
  createEstablishmentCategory,
  updateEstablishmentCategory,
  type EstablishmentCategory,
  type EstablishmentCategoryFields,
} from '@/shared/services/establishmentCategoryService'

const categoryStore = useEstablishmentCategoryStore()
const open = ref(false)
const saving = ref(false)
const formError = ref<string | null>(null)
const editing = ref<EstablishmentCategory | null>(null)
const categoryForm = ref<{ submit: () => Promise<EstablishmentCategoryFields | null> } | null>(null)

const categoryColumns: { title: string; key: 'name' }[] = [{ title: 'Name', key: 'name' }]

onMounted(() => categoryStore.loadCategories())

function openCategory(category: EstablishmentCategory | null) {
  editing.value = category
  formError.value = null
  open.value = true
}

function closeCategory() {
  open.value = false
  formError.value = null
}

async function saveCategory() {
  const values = await categoryForm.value?.submit()
  if (!values) return

  const category = editing.value
  saving.value = true
  formError.value = null
  try {
    const result = category
      ? await updateEstablishmentCategory(category.id, values)
      : await createEstablishmentCategory(values)
    if (!result.ok) {
      formError.value = result.error.message
      return
    }

    if (category) {
      const index = categoryStore.categories.findIndex((item) => item.id === result.category.id)
      if (index >= 0) categoryStore.categories[index] = result.category
    } else {
      categoryStore.categories.push(result.category)
    }
    open.value = false
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <section data-test-id="admin-establishment-categories">
    <div class="flex items-center justify-between gap-4">
      <h2 class="text-2xl leading-tight font-extrabold text-flame">Establishment categories</h2>
      <v-btn
        class="!rounded-[10px] !font-extrabold !tracking-[0.04em] !uppercase hover:!bg-flame-dark"
        color="primary"
        data-test-id="add-establishment-category"
        @click="openCategory(null)"
      >
        Add Category
      </v-btn>
    </div>
    <p class="mt-2 text-base leading-normal text-ink">
      Manage the categories used to group establishments.
    </p>

    <div v-if="categoryStore.loading && categoryStore.categories.length === 0" class="mt-6">
      <v-progress-circular indeterminate color="primary" size="24" />
    </div>
    <p
      v-else-if="categoryStore.error && categoryStore.categories.length === 0"
      class="mt-6 text-base text-ink"
    >
      {{ categoryStore.error }}
    </p>
    <div v-else class="mt-6">
      <IntersectionTable
        :columns="categoryColumns"
        :rows="categoryStore.categories"
        test-id="establishment-category"
        @select="openCategory"
      />
      <p v-if="categoryStore.error" class="mt-4 text-base text-ink">
        {{ categoryStore.error }}
      </p>
    </div>

    <v-dialog v-model="open" max-width="560">
      <v-card data-test-id="establishment-category-dialog">
        <v-card-text class="pt-5">
          <EstablishmentCategoryForm
            v-if="open"
            ref="categoryForm"
            :category="editing"
            @deleted="closeCategory"
          />
          <p
            v-if="formError"
            class="text-sm text-flame"
            data-test-id="establishment-category-form-error"
          >
            {{ formError }}
          </p>
        </v-card-text>
        <v-card-actions class="px-4 pt-0 pb-4">
          <v-spacer />
          <v-btn
            data-test-id="establishment-category-form-cancel"
            variant="text"
            @click="closeCategory"
          >
            Cancel
          </v-btn>
          <v-btn
            class="!rounded-[10px] !font-extrabold !tracking-[0.04em] !uppercase hover:!bg-flame-dark"
            color="primary"
            data-test-id="establishment-category-form-submit"
            :loading="saving"
            @click="saveCategory"
          >
            Submit
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </section>
</template>
