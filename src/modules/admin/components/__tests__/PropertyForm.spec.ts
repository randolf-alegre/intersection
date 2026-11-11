import { describe, expect, it } from 'vitest'
import PropertyForm from '@/modules/admin/components/PropertyForm.vue'
import type { Property, PropertyFields } from '@/shared/services/propertiesService'
import { mountComponent } from '@/test/mount'

const property: Property = {
  id: 4,
  name: 'Hatchobori',
  description: 'A quiet stay',
  address: '1 Main Street',
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
}

function formValues(wrapper: { vm: object }) {
  return (wrapper.vm as { submit: () => Promise<PropertyFields | null> }).submit()
}

describe('PropertyForm', () => {
  it('starts empty so it can create a property', () => {
    const { wrapper } = mountComponent(PropertyForm)

    expect(wrapper.find('[data-test-id="property-delete"]').exists()).toBe(false)

    expect(
      (wrapper.get('[data-test-id="property-name"]').find('input').element as HTMLInputElement)
        .value,
    ).toBe('')
    expect(
      (wrapper.get('[data-test-id="property-address"]').find('input').element as HTMLInputElement)
        .value,
    ).toBe('')
    expect(
      (
        wrapper.get('[data-test-id="property-description"]').find('textarea')
          .element as HTMLTextAreaElement
      ).value,
    ).toBe('')
  })

  it('fills the fields from an existing property', () => {
    const { wrapper } = mountComponent(PropertyForm, { props: { property } })

    expect(wrapper.get('[data-test-id="property-delete"]').attributes('aria-label')).toBe(
      'Delete property',
    )

    expect(
      (wrapper.get('[data-test-id="property-name"]').find('input').element as HTMLInputElement)
        .value,
    ).toBe('Hatchobori')
    expect(
      (wrapper.get('[data-test-id="property-address"]').find('input').element as HTMLInputElement)
        .value,
    ).toBe('1 Main Street')
    expect(
      (
        wrapper.get('[data-test-id="property-description"]').find('textarea')
          .element as HTMLTextAreaElement
      ).value,
    ).toBe('A quiet stay')
  })

  it('requires a name, address, and description', async () => {
    const { wrapper } = mountComponent(PropertyForm)

    expect(await formValues(wrapper)).toBeNull()
    expect(wrapper.text()).toContain('Name is required')
    expect(wrapper.text()).toContain('Address is required')
    expect(wrapper.text()).toContain('Description is required')
  })

  it('returns the trimmed fields when they are filled', async () => {
    const { wrapper } = mountComponent(PropertyForm, { props: { property } })

    await wrapper.get('[data-test-id="property-name"] input').setValue('  Renamed  ')

    expect(await formValues(wrapper)).toEqual({
      name: 'Renamed',
      address: '1 Main Street',
      description: 'A quiet stay',
    })
  })
})
