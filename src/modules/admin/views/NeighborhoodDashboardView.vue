<script setup lang="ts">
import { onMounted, ref } from 'vue'
import NeighborhoodEstablishmentForm from '@/modules/admin/components/NeighborhoodEstablishmentForm.vue'
import NeighborhoodForm from '@/modules/admin/components/NeighborhoodForm.vue'
import type { NeighborhoodFormValues } from '@/modules/admin/components/NeighborhoodForm.vue'
import NeighborhoodPropertyForm from '@/modules/admin/components/NeighborhoodPropertyForm.vue'
import { useAdminToastStore } from '@/modules/admin/stores/adminToastStore'
import { useEstablishmentStore } from '@/modules/guest/stores/establishmentStore'
import { useNeighborhoodStore } from '@/modules/guest/stores/neighborhoodStore'
import { usePropertiesStore } from '@/modules/guest/stores/propertiesStore'
import IntersectionTable from '@/shared/components/IntersectionTable.vue'
import type { AssociateEstablishmentsResult } from '@/shared/services/neighborhoodService'
import type { PropertyNeighborhoodResult } from '@/shared/services/propertyNeighborhoodService'
import {
  createNeighborhood,
  updateNeighborhood,
  type Neighborhood,
} from '@/shared/services/neighborhoodService'

const neighborhoodStore = useNeighborhoodStore()
const propertiesStore = usePropertiesStore()
const establishmentStore = useEstablishmentStore()
const toast = useAdminToastStore()
const open = ref(false)
const saving = ref(false)
const formError = ref<string | null>(null)
const editing = ref<Neighborhood | null>(null)
const formTab = ref('details')
const neighborhoodForm = ref<{ submit: () => Promise<NeighborhoodFormValues | null> } | null>(null)
const savingAssociation = ref(false)
const propertyForm = ref<{ submit: () => Promise<PropertyNeighborhoodResult> } | null>(null)
const establishmentForm = ref<{ submit: () => Promise<AssociateEstablishmentsResult> } | null>(null)

const neighborhoodColumns: { title: string; key: 'name' | 'city' | 'hashtag' }[] = [
  { title: 'Name', key: 'name' },
  { title: 'City', key: 'city' },
  { title: 'Hashtag', key: 'hashtag' },
]

onMounted(async () => {
  await neighborhoodStore.loadAllNeighborhoods()
  if (propertiesStore.properties.length === 0) await propertiesStore.loadProperties()
  while (propertiesStore.hasNextPage && !propertiesStore.error) {
    await propertiesStore.loadProperties()
  }
  await establishmentStore.loadAllEstablishments()
})

function openNeighborhood(neighborhood: Neighborhood | null) {
  editing.value = neighborhood
  formError.value = null
  formTab.value = 'details'
  open.value = true
}

function closeNeighborhood() {
  open.value = false
  formError.value = null
}

async function saveNeighborhood() {
  const values = await neighborhoodForm.value?.submit()
  if (!values) return

  const neighborhood = editing.value
  saving.value = true
  formError.value = null
  try {
    const result = neighborhood
      ? await updateNeighborhood(neighborhood.id, values)
      : await createNeighborhood(values)
    if (!result.ok) {
      formError.value = result.error.message
      return
    }

    const saved = result.neighborhood
    if (neighborhood) {
      const index = neighborhoodStore.neighborhoods.findIndex((item) => item.id === saved.id)
      if (index >= 0) neighborhoodStore.neighborhoods[index] = saved
    } else {
      neighborhoodStore.neighborhoods.push(saved)
    }
    open.value = false
  } finally {
    saving.value = false
  }
}

async function saveProperties() {
  savingAssociation.value = true
  try {
    const result = await propertyForm.value?.submit()
    if (result?.ok) {
      open.value = false
      await toast.show('Properties associated successfully')
    }
  } finally {
    savingAssociation.value = false
  }
}

async function saveEstablishments() {
  savingAssociation.value = true
  try {
    const result = await establishmentForm.value?.submit()
    if (result?.ok) {
      open.value = false
      await toast.show('Establishments associated successfully')
    }
  } finally {
    savingAssociation.value = false
  }
}
</script>

<template>
  <section data-test-id="admin-neighborhoods">
    <div class="flex items-center justify-between gap-4">
      <h2 class="text-2xl leading-tight font-extrabold text-flame">Neighborhoods</h2>
      <v-btn
        class="!rounded-[10px] !font-extrabold !tracking-[0.04em] !uppercase hover:!bg-flame-dark"
        color="primary"
        data-test-id="add-neighborhood"
        @click="openNeighborhood(null)"
      >
        Add Neighborhood
      </v-btn>
    </div>
    <p class="mt-2 text-base leading-normal text-ink">
      Manage the neighborhoods around each property.
    </p>

    <div
      v-if="neighborhoodStore.loading && neighborhoodStore.neighborhoods.length === 0"
      class="mt-6"
    >
      <v-progress-circular indeterminate color="primary" size="24" />
    </div>
    <p
      v-else-if="neighborhoodStore.error && neighborhoodStore.neighborhoods.length === 0"
      class="mt-6 text-base text-ink"
    >
      {{ neighborhoodStore.error }}
    </p>
    <div v-else class="mt-6">
      <IntersectionTable
        :columns="neighborhoodColumns"
        :rows="neighborhoodStore.neighborhoods"
        test-id="neighborhood"
        @select="openNeighborhood"
      />
      <p v-if="neighborhoodStore.error" class="mt-4 text-base text-ink">
        {{ neighborhoodStore.error }}
      </p>
    </div>

    <v-dialog v-model="open" max-width="560">
      <v-card data-test-id="neighborhood-dialog">
        <v-tabs v-if="editing" v-model="formTab" color="primary" slider-color="primary">
          <v-tab
            class="!font-extrabold !tracking-[0.04em] !uppercase"
            data-test-id="neighborhood-tab-details"
            value="details"
          >
            Neighborhood
          </v-tab>
          <v-tab
            class="!font-extrabold !tracking-[0.04em] !uppercase"
            data-test-id="neighborhood-tab-properties"
            value="properties"
          >
            Properties
          </v-tab>
          <v-tab
            class="!font-extrabold !tracking-[0.04em] !uppercase"
            data-test-id="neighborhood-tab-establishments"
            value="establishments"
          >
            Establishments
          </v-tab>
        </v-tabs>
        <v-card-text class="pt-5">
          <div v-show="!editing || formTab === 'details'">
            <NeighborhoodForm
              v-if="open"
              ref="neighborhoodForm"
              :neighborhood="editing"
              @deleted="closeNeighborhood"
            />
            <p v-if="formError" class="text-sm text-flame" data-test-id="neighborhood-form-error">
              {{ formError }}
            </p>
          </div>
          <div v-if="editing" v-show="formTab === 'properties'">
            <h2 class="mb-4 text-2xl leading-tight font-extrabold text-flame">
              Associate properties
            </h2>
            <NeighborhoodPropertyForm
              v-if="open"
              ref="propertyForm"
              :neighborhood="editing"
              :properties="propertiesStore.properties"
            />
          </div>
          <div v-if="editing" v-show="formTab === 'establishments'">
            <h2 class="mb-4 text-2xl leading-tight font-extrabold text-flame">
              Associate establishments
            </h2>
            <NeighborhoodEstablishmentForm
              v-if="open"
              ref="establishmentForm"
              :establishments="establishmentStore.establishments"
              :neighborhood="editing"
            />
          </div>
        </v-card-text>
        <v-card-actions class="px-4 pt-0 pb-4">
          <v-spacer />
          <v-btn data-test-id="neighborhood-form-cancel" variant="text" @click="closeNeighborhood">
            Cancel
          </v-btn>
          <v-btn
            v-if="!editing || formTab === 'details'"
            class="!rounded-[10px] !font-extrabold !tracking-[0.04em] !uppercase hover:!bg-flame-dark"
            color="primary"
            data-test-id="neighborhood-form-submit"
            :loading="saving"
            @click="saveNeighborhood"
          >
            Submit
          </v-btn>
          <v-btn
            v-else-if="formTab === 'properties'"
            class="!rounded-[10px] !font-extrabold !tracking-[0.04em] !uppercase hover:!bg-flame-dark"
            color="primary"
            data-test-id="neighborhood-property-submit"
            :loading="savingAssociation"
            @click="saveProperties"
          >
            Submit
          </v-btn>
          <v-btn
            v-else
            class="!rounded-[10px] !font-extrabold !tracking-[0.04em] !uppercase hover:!bg-flame-dark"
            color="primary"
            data-test-id="neighborhood-establishment-submit"
            :loading="savingAssociation"
            @click="saveEstablishments"
          >
            Submit
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </section>
</template>
