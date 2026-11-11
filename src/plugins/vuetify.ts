import '@mdi/font/css/materialdesignicons.css'
import '@fontsource/outfit/400.css'
import '@fontsource/outfit/500.css'
import '@fontsource/outfit/800.css'
import '@fontsource/outfit/900.css'
import 'vuetify/styles'
import '@/styles/brand.css'

import { createVuetify } from 'vuetify'
import { aliases, mdi } from 'vuetify/iconsets/mdi'

const sectionL = {
  dark: false,
  colors: {
    background: '#FFF6EC',
    surface: '#FFFEFD',
    primary: '#E2552C',
    'primary-darken-1': '#D43E22',
    secondary: '#FBE5D9',
    peach: '#FBE5D9',
    linen: '#FFF6EC',
    error: '#E7000B',
    info: '#212121',
    success: '#2F6B4F',
    warning: '#E7784E',
    'on-background': '#212121',
    'on-surface': '#212121',
    'on-primary': '#FFFEFD',
    'on-secondary': '#E2552C',
  },
}

export default createVuetify({
  icons: {
    defaultSet: 'mdi',
    aliases,
    sets: { mdi },
  },
  theme: {
    defaultTheme: 'sectionL',
    themes: { sectionL },
  },
  defaults: {
    VCard: {
      elevation: 0,
      rounded: 'xl',
    },
    VBtn: {
      rounded: 'lg',
    },
  },
})
