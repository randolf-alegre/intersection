<script setup lang="ts">
import { ref } from 'vue'
import AdminToast from '@/modules/admin/components/AdminToast.vue'
import EstablishmentCategoryDashboardView from '@/modules/admin/views/EstablishmentCategoryDashboardView.vue'
import EstablishmentDashboardView from '@/modules/admin/views/EstablishmentDashboardView.vue'
import NeighborhoodDashboardView from '@/modules/admin/views/NeighborhoodDashboardView.vue'
import PropertyDashboardView from '@/modules/admin/views/PropertyDashboardView.vue'

const tab = ref('properties')
</script>

<template>
  <section data-test-id="admin-dashboard">
    <p class="text-[0.95rem] font-extrabold tracking-[0.08em] text-flame uppercase">Admin</p>
    <h1
      class="text-[clamp(2.75rem,7vw,4.5rem)] leading-[0.92] font-black tracking-[-0.035em] text-flame"
    >
      Dashboard
    </h1>

    <v-card class="mt-8 overflow-hidden">
      <v-tabs v-model="tab" color="primary" grow slider-color="primary">
        <v-tab
          class="!font-extrabold !tracking-[0.04em] !uppercase"
          data-test-id="admin-tab-properties"
          value="properties"
        >
          Properties
        </v-tab>
        <v-tab
          class="!font-extrabold !tracking-[0.04em] !uppercase"
          data-test-id="admin-tab-neighborhoods"
          value="neighborhoods"
        >
          Neighborhoods
        </v-tab>
        <v-tab
          class="!font-extrabold !tracking-[0.04em] !uppercase"
          data-test-id="admin-tab-categories"
          value="categories"
        >
          Categories
        </v-tab>
        <v-tab
          class="!font-extrabold !tracking-[0.04em] !uppercase"
          data-test-id="admin-tab-establishments"
          value="establishments"
        >
          Establishments
        </v-tab>
      </v-tabs>

      <v-card-text class="px-4 pt-6 pb-4">
        <v-tabs-window v-model="tab">
          <v-tabs-window-item value="properties">
            <PropertyDashboardView />
          </v-tabs-window-item>
          <v-tabs-window-item value="neighborhoods">
            <NeighborhoodDashboardView />
          </v-tabs-window-item>
          <v-tabs-window-item value="categories">
            <EstablishmentCategoryDashboardView />
          </v-tabs-window-item>
          <v-tabs-window-item value="establishments">
            <EstablishmentDashboardView />
          </v-tabs-window-item>
        </v-tabs-window>
      </v-card-text>
    </v-card>
    <AdminToast />
  </section>
</template>
