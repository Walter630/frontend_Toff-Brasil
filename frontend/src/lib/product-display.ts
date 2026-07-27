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

export function getProductCategoryLabel(product: Product) {
  const category = product.categoria
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase()

  if (category.includes('PECA') || category.includes('ACESSORIO')) {
    return 'Acessórios'
  }

  if (category.includes('IMPRESSORA')) {
    return 'Impressoras'
  }

  if (category.includes('FILAMENTO')) {
    return 'Filamentos'
  }

  return product.categoria
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

export function getProductMaterial(product: Product) {
  const searchableText = `${product.name} ${product.description}`
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase()

  return ['PETG', 'PLA', 'ABS', 'TPU'].find((material) =>
    searchableText.includes(material),
  )
}

const filamentFinishPatterns = [
  'FIBRA DE CARBONO',
  'HIGH SPEED',
  'ULTRA SILK',
  'DUO COLOR',
  'TRI COLOR',
  'TRANSLÚCIDO',
  'TRANSLUCIDO',
  'FOSFORESCENTE',
  'FLUORESCENTE',
  'METÁLICO',
  'METALICO',
  'RAINBOW',
  'SPARKLY',
  'CAMALEÃO',
  'CAMALEAO',
  'MARBLE',
  'MÁRMORE',
  'MARMORE',
  'MATTE',
  'SILK',
]

function normalizeProductLabel(value: string) {
  return value
    .replace(/\([^)]*\)/g, ' ')
    .replace(/\b\d+(?:[.,]\d+)?\s*(?:KG|G|MM)\b/gi, ' ')
    .replace(/\bFILAMENTO(?:\s+3D)?\b/gi, ' ')
    .replace(/\s{2,}/g, ' ')
    .trim()
}

function getProductFinish(product: Product) {
  const explicitType = normalizeProductLabel(product.type ?? '')
  const material = getProductMaterial(product)

  if (
    explicitType &&
    explicitType.toUpperCase() !== material?.toUpperCase() &&
    explicitType.toUpperCase() !== product.categoria.toUpperCase()
  ) {
    const finishWithoutMaterial = material
      ? explicitType.replace(
          new RegExp(`\\b${escapeRegExp(material)}\\b`, 'gi'),
          ' ',
        )
      : explicitType

    return finishWithoutMaterial.replace(/\s{2,}/g, ' ').trim() || undefined
  }

  const normalizedName = normalizeProductLabel(getProductPublicName(product))
  const searchableName = normalizedName
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase()

  return filamentFinishPatterns.find((finish) =>
    searchableName.includes(
      finish
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toUpperCase(),
    ),
  )
}

export function getProductLineName(product: Product) {
  if (getProductCategoryLabel(product) !== 'Filamentos') {
    return getProductPublicName(product)
  }

  const material = getProductMaterial(product)
  const finish = getProductFinish(product)
  const parts = [material, finish].filter(Boolean)

  return parts.length
    ? Array.from(new Set(parts.map((part) => part?.toUpperCase()))).join(' ')
    : getProductPublicName(product)
}

export function getProductColorName(product: Product) {
  if (getProductCategoryLabel(product) !== 'Filamentos') {
    return getProductPublicName(product)
  }

  const material = getProductMaterial(product)
  const finish = getProductFinish(product)
  let color = normalizeProductLabel(getProductPublicName(product))

  for (const removable of [material, finish]) {
    if (!removable) continue
    color = color.replace(
      new RegExp(`\\b${escapeRegExp(removable)}\\b`, 'gi'),
      ' ',
    )
  }

  color = color.replace(/\s{2,}/g, ' ').trim()
  return (color || getProductPublicName(product)).toUpperCase()
}
