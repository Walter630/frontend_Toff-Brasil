import type { Product } from '../types/product'
import { getProductBrand } from './product-display'

export const productMaterialOptions = [
  { label: 'PLA', value: 'PLA' },
  { label: 'PETG', value: 'PETG' },
  { label: 'ABS', value: 'ABS' },
  { label: 'TPU', value: 'TPU' },
] as const

export type MaterialQuickFilter =
  | 'Todos'
  | (typeof productMaterialOptions)[number]['value']
  | 'PRE_VENDA'

export const productBrandOptions = [
  { label: 'Masterprint', value: 'MASTERPRINT' },
  { label: 'FusionX', value: 'FUSIONX' },
  { label: 'Elegoo', value: 'ELEGOO' },
  { label: 'Fulljoy', value: 'FULLJOY' },
  { label: 'Tinmory', value: 'TINMORY' },
] as const

export const productTypeOptions = [
  { label: 'Matte', value: 'MATTE' },
  { label: 'Cores sólidas', value: 'BASICO' },
  { label: 'Fibra de carbono', value: 'FIBRA DE CARBONO' },
  { label: 'Ultra Silk', value: 'ULTRA SILK' },
  { label: 'Duo Color', value: 'DUO COLOR' },
  { label: 'Tri Color', value: 'TRI COLOR' },
  { label: 'Rainbow', value: 'RAINBOW' },
  { label: 'Translúcido', value: 'TRANSLUCIDO' },
  { label: 'High Speed', value: 'HIGH SPEED' },
  { label: 'Silk', value: 'SILK' },
  { label: 'Metal', value: 'METAL' },
] as const

export const productGroupOptions = [
  { label: 'Filamentos', value: 'FILAMENTOS' },
  { label: 'Acessórios', value: 'ACESSORIOS' },
  { label: 'Impressoras', value: 'IMPRESSORAS' },
] as const

export type ProductGroupFilterValue =
  | 'Todos'
  | (typeof productGroupOptions)[number]['value']

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
  return normalizeText(
    `${product.name} ${product.description} ${product.marca ?? ''} ${
      product.brand ?? ''
    }`,
  )
}

export function filterProductsByGroup(
  products: Product[],
  group: ProductGroupFilterValue,
) {
  if (group === 'Todos') {
    return products
  }

  return products.filter((product) => {
    const category = normalizeText(product.categoria)

    if (group === 'ACESSORIOS') {
      return category.includes('ACESSORIO') || category.includes('PECA')
    }

    if (group === 'FILAMENTOS') {
      return category.includes('FILAMENTO')
    }

    return category.includes('IMPRESSORA')
  })
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
    const productBrand = getProductBrand(product)
    const normalizedProductBrand = productBrand
      ? normalizeText(productBrand)
      : undefined
    const matchesBrand =
      brand === 'Todos' ||
      normalizedProductBrand === brand ||
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
            'DUO COLOR',
            'TRI COLOR',
            'TRICOLOR',
            'RAINBOW',
            'CARBONO',
            'CARBON FIBER',
            'FIBRA DE CARBONO',
          ].some((variant) => text.includes(variant))
        : type === 'FIBRA DE CARBONO'
          ? ['FIBRA DE CARBONO', 'CARBON FIBER', 'CARBONO'].some((variant) =>
              text.includes(variant),
            )
          : type === 'DUO COLOR'
            ? ['DUO COLOR', 'DUAL COLOR', 'DUAL'].some((variant) =>
                text.includes(variant),
              )
            : type === 'TRI COLOR'
              ? ['TRI COLOR', 'TRICOLOR'].some((variant) =>
                  text.includes(variant),
                )
              : text.includes(type))

    return matchesMaterial && matchesBrand && matchesType
  })
}

export function filterProductsByMaterialQuick(
  products: Product[],
  quick: MaterialQuickFilter,
) {
  if (quick === 'Todos') return products
  if (quick === 'PRE_VENDA') {
    return products.filter((product) => product.status === 'PRE_VENDA')
  }
  return products.filter((product) => {
    const text = normalizeText(
      `${product.name} ${product.description} ${product.marca ?? ''} ${product.brand ?? ''}`,
    )
    return text.includes(quick)
  })
}
