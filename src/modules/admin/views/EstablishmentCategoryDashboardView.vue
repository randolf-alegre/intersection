<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRecordDialog } from '@/modules/admin/composables/useRecordDialog'
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
const { open, saving, formError, editing, openRecord, closeRecord, saveRecord } =
  useRecordDialog<EstablishmentCategory>()
const categoryForm = ref<{ submit: () => Promise<EstablishmentCategoryFields | null> } | null>(null)

const categoryColumns: { title: string; key: 'name' }[] = [{ title: 'Name', key: 'name' }]

onMounted(() => categoryStore.loadCategories())

function openCategory(category: EstablishmentCategory | null) {
  openRecord(category)
}

function closeCategory() {
  closeRecord()
}

async function saveCategory() {
  await saveRecord(
    () => categoryForm.value?.submit(),
    async (values, category) => {
      const result = category
        ? await updateEstablishmentCategory(category.id, values)
        : await createEstablishmentCategory(values)
      if (!result.ok) return result

      if (category) {
        const index = categoryStore.categories.findIndex((item) => item.id === result.category.id)
        if (index >= 0) categoryStore.categories[index] = result.category
      } else {
        categoryStore.categories.push(result.category)
      }
      return { ok: true }
    },
  )
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
