<script setup lang="ts">
import { onMounted, ref } from 'vue'
import PropertyForm from '@/modules/admin/components/PropertyForm.vue'
import PropertyNeighborhoodForm from '@/modules/admin/components/PropertyNeighborhoodForm.vue'
import IntersectionTable from '@/shared/components/IntersectionTable.vue'
import { useAdminToastStore } from '@/modules/admin/stores/adminToastStore'
import { useNeighborhoodStore } from '@/modules/guest/stores/neighborhoodStore'
import { usePropertiesStore } from '@/modules/guest/stores/propertiesStore'
import type { PropertyNeighborhoodResult } from '@/shared/services/propertyNeighborhoodService'
import {
  createProperty,
  updateProperty,
  type Property,
  type PropertyFields,
} from '@/shared/services/propertiesService'

const propertyColumns: { title: string; key: 'name' | 'address' | 'description' }[] = [
  { title: 'Name', key: 'name' },
  { title: 'Address', key: 'address' },
  { title: 'Description', key: 'description' },
]

const propertiesStore = usePropertiesStore()
const neighborhoodStore = useNeighborhoodStore()
const toast = useAdminToastStore()
const open = ref(false)
const saving = ref(false)
const formError = ref<string | null>(null)
const editing = ref<Property | null>(null)
const formTab = ref('details')
const propertyForm = ref<{ submit: () => Promise<PropertyFields | null> } | null>(null)
const savingAssociation = ref(false)
const neighborhoodForm = ref<{ submit: () => Promise<PropertyNeighborhoodResult> } | null>(null)

onMounted(async () => {
  do {
    await propertiesStore.loadProperties()
  } while (propertiesStore.hasNextPage && !propertiesStore.error)
  await neighborhoodStore.loadAllNeighborhoods()
})

function openProperty(property: Property | null) {
  editing.value = property
  formError.value = null
  formTab.value = 'details'
  open.value = true
}

function closeProperty() {
  open.value = false
  formError.value = null
}

async function saveProperty() {
  const fields = await propertyForm.value?.submit()
  if (!fields) return

  const property = editing.value
  saving.value = true
  formError.value = null
  try {
    const result = property
      ? await updateProperty(property.id, fields)
      : await createProperty(fields)
    if (!result.ok) {
      formError.value = result.error.message
      return
    }

    if (property) {
      const index = propertiesStore.properties.findIndex((item) => item.id === result.property.id)
      if (index >= 0) propertiesStore.properties[index] = result.property
    } else {
      propertiesStore.properties.push(result.property)
    }
    open.value = false
  } finally {
    saving.value = false
  }
}

async function saveNeighborhoods() {
  savingAssociation.value = true
  try {
    const result = await neighborhoodForm.value?.submit()
    if (result?.ok) {
      open.value = false
      await toast.show('Neighborhoods associated successfully')
    }
  } finally {
    savingAssociation.value = false
  }
}
</script>

<template>
  <section data-test-id="admin-properties">
    <div class="flex items-center justify-between gap-4">
      <h2 class="text-2xl leading-tight font-extrabold text-flame">Properties</h2>
      <v-btn
        class="!rounded-[10px] !font-extrabold !tracking-[0.04em] !uppercase hover:!bg-flame-dark"
        color="primary"
        data-test-id="add-property"
        @click="openProperty(null)"
      >
        Add Property
      </v-btn>
    </div>
    <p class="mt-2 text-base leading-normal text-ink">Manage the places guests can stay.</p>

    <div v-if="propertiesStore.loading && propertiesStore.properties.length === 0" class="mt-6">
      <v-progress-circular indeterminate color="primary" size="24" />
    </div>
    <p
      v-else-if="propertiesStore.error && propertiesStore.properties.length === 0"
      class="mt-6 text-base text-ink"
    >
      {{ propertiesStore.error }}
    </p>
    <div v-else class="mt-6">
      <IntersectionTable
        :columns="propertyColumns"
        :rows="propertiesStore.properties"
        test-id="property"
        @select="openProperty"
      />
      <p v-if="propertiesStore.error" class="mt-4 text-base text-ink">
        {{ propertiesStore.error }}
      </p>
    </div>

    <v-dialog v-model="open" max-width="560">
      <v-card data-test-id="property-dialog">
        <v-tabs v-if="editing" v-model="formTab" color="primary" slider-color="primary">
          <v-tab
            class="!font-extrabold !tracking-[0.04em] !uppercase"
            data-test-id="property-tab-details"
            value="details"
          >
            Property
          </v-tab>
          <v-tab
            class="!font-extrabold !tracking-[0.04em] !uppercase"
            data-test-id="property-tab-neighborhoods"
            value="neighborhoods"
          >
            Neighborhoods
          </v-tab>
        </v-tabs>
        <v-card-text class="pt-5">
          <div v-show="!editing || formTab === 'details'">
            <PropertyForm
              v-if="open"
              ref="propertyForm"
              :property="editing"
              @deleted="closeProperty"
            />
            <p v-if="formError" class="text-sm text-flame" data-test-id="property-form-error">
              {{ formError }}
            </p>
          </div>
          <div v-if="editing" v-show="formTab === 'neighborhoods'">
            <h2 class="mb-4 text-2xl leading-tight font-extrabold text-flame">
              Associate neighborhoods
            </h2>
            <PropertyNeighborhoodForm
              v-if="open"
              ref="neighborhoodForm"
              :neighborhoods="neighborhoodStore.neighborhoods"
              :property="editing"
            />
          </div>
        </v-card-text>
        <v-card-actions class="px-4 pt-0 pb-4">
          <v-spacer />
          <v-btn data-test-id="property-form-cancel" variant="text" @click="closeProperty">
            Cancel
          </v-btn>
          <v-btn
            v-if="!editing || formTab === 'details'"
            class="!rounded-[10px] !font-extrabold !tracking-[0.04em] !uppercase hover:!bg-flame-dark"
            color="primary"
            data-test-id="property-form-submit"
            :loading="saving"
            @click="saveProperty"
          >
            Submit
          </v-btn>
          <v-btn
            v-else
            class="!rounded-[10px] !font-extrabold !tracking-[0.04em] !uppercase hover:!bg-flame-dark"
            color="primary"
            data-test-id="property-neighborhood-submit"
            :loading="savingAssociation"
            @click="saveNeighborhoods"
          >
            Submit
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </section>
</template>
<style scoped>
#property-dialog {
  padding: 20px;
}
</style>
