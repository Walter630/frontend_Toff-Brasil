import type { Product } from '../types/product'

const knownBrandNames = [
  'Masterprint',
  'FusionX',
  'Elegoo',
  'Fulljoy',
  'Tinmory',
  'Tinmorry',
]

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

export function stripBrandFromName(name: string) {
  return knownBrandNames
    .reduce((currentName, brand) => {
      const brandPattern = new RegExp(`\\b${escapeRegExp(brand)}\\b`, 'gi')

      return currentName.replace(brandPattern, '')
    }, name)
    .replace(/\s{2,}/g, ' ')
    .replace(/\s+([,./-])/g, '$1')
    .trim()
}

export function getProductPublicName(product: Product) {
  return stripBrandFromName(product.name) || product.name
}

export function getProductBrand(product: Product) {
  const explicitBrand = product.marca ?? product.brand

  if (explicitBrand) {
    return explicitBrand
  }

  const searchableText = `${product.name} ${product.description}`.toUpperCase()
  const brand = knownBrandNames.find((knownBrand) =>
    searchableText.includes(knownBrand.toUpperCase()),
  )

  return brand === 'Tinmorry' ? 'Tinmory' : brand
}
