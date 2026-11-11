import { describe, expect, it } from 'vitest'
import EstablishmentCategoryForm from '@/modules/admin/components/EstablishmentCategoryForm.vue'
import type {
  EstablishmentCategory,
  EstablishmentCategoryFields,
} from '@/shared/services/establishmentCategoryService'
import { mountComponent } from '@/test/mount'

const category: EstablishmentCategory = {
  id: 2,
  name: 'Food',
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
}

function formValues(wrapper: { vm: object }) {
  return (wrapper.vm as { submit: () => Promise<EstablishmentCategoryFields | null> }).submit()
}

describe('EstablishmentCategoryForm', () => {
  it('starts empty so it can create a category', () => {
    const { wrapper } = mountComponent(EstablishmentCategoryForm)

    expect(wrapper.text()).toContain('Create category')
    expect(wrapper.find('[data-test-id="establishment-category-delete"]').exists()).toBe(false)
    expect(
      (
        wrapper.get('[data-test-id="establishment-category-name"]').find('input')
          .element as HTMLInputElement
      ).value,
    ).toBe('')
  })

  it('fills the name from an existing category', () => {
    const { wrapper } = mountComponent(EstablishmentCategoryForm, { props: { category } })

    expect(wrapper.text()).toContain('Update category')
    expect(
      wrapper.get('[data-test-id="establishment-category-delete"]').attributes('aria-label'),
    ).toBe('Delete category')
    expect(
      (
        wrapper.get('[data-test-id="establishment-category-name"]').find('input')
          .element as HTMLInputElement
      ).value,
    ).toBe('Food')
  })

  it('requires a name', async () => {
    const { wrapper } = mountComponent(EstablishmentCategoryForm)

    expect(await formValues(wrapper)).toBeNull()
    expect(wrapper.text()).toContain('Name is required')
  })

  it('returns the trimmed name', async () => {
    const { wrapper } = mountComponent(EstablishmentCategoryForm, { props: { category } })

    await wrapper.get('[data-test-id="establishment-category-name"] input').setValue('  Dining  ')

    expect(await formValues(wrapper)).toEqual({ name: 'Dining' })
  })
})
