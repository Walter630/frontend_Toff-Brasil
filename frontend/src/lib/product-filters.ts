import type { Product } from '../types/product'

export const productMaterialOptions = [
  { label: 'PLA', value: 'PLA' },
  { label: 'PETG', value: 'PETG' },
  { label: 'ABS', value: 'ABS' },
  { label: 'TPU', value: 'TPU' },
] as const

export const productBrandOptions = [
  { label: 'Masterprint', value: 'MASTERPRINT' },
  { label: 'FusionX', value: 'FUSIONX' },
  { label: 'Elegoo', value: 'ELEGOO' },
  { label: 'Fulljoy', value: 'FULLJOY' },
  { label: 'Tinmory', value: 'TINMORY' },
] as const

export const productTypeOptions = [
  { label: 'Basico', value: 'BASICO' },
  { label: 'High Speed', value: 'HIGH SPEED' },
  { label: 'Matte', value: 'MATTE' },
  { label: 'Silk', value: 'SILK' },
  { label: 'Metal', value: 'METAL' },
  { label: 'Translucido', value: 'TRANSLUCIDO' },
] as const

export type ProductFilterValue =
  | 'Todos'
  | (typeof productMaterialOptions)[number]['value']
  | (typeof productBrandOptions)[number]['value']
  | (typeof productTypeOptions)[number]['value']

function normalizeText(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase()
}

function productText(product: Product) {
  return normalizeText(`${product.name} ${product.description}`)
}

export function filterProductsByDetails(
  products: Product[],
  material: ProductFilterValue,
  brand: ProductFilterValue,
  type: ProductFilterValue,
) {
  return products.filter((product) => {
    const text = productText(product)
    const matchesMaterial = material === 'Todos' || text.includes(material)
    const matchesBrand =
      brand === 'Todos' ||
      text.includes(brand) ||
      (brand === 'TINMORY' && text.includes('TINMORRY'))
    const matchesType =
      type === 'Todos' ||
      (type === 'BASICO'
        ? ![
            'HIGH SPEED',
            'MATTE',
            'SILK',
            'METAL',
            'TRANSLUCIDO',
            'GLITTER',
            'DUAL',
            'TRICOLOR',
          ].some((variant) => text.includes(variant))
        : text.includes(type))

    return matchesMaterial && matchesBrand && matchesType
  })
}
