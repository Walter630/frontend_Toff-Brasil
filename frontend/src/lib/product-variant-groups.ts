/**
 * Mapa de grupos de variantes para produtos de peças/placas.
 * Como o backend não armazena esse campo, ele é definido aqui no frontend
 * com base nos IDs reais dos produtos de produção.
 *
 * Para adicionar novos grupos: inclua os IDs da API e defina o variantLabel
 * que aparecerá no botão de seleção.
 */
type VariantGroupEntry = {
  variantGroup: string
  variantLabel: string
}

export const productVariantGroupMap = new Map<string, VariantGroupEntry>([
  // ── Placas PEI ──────────────────────────────────────────────────────────
  [
    'acf1b880-8214-42ea-8fe3-e2397428a3f2', // Placa Pei A1 Mini — R$90
    { variantGroup: 'placa-pei-a1', variantLabel: 'A1 Mini' },
  ],
  [
    'b576759c-a477-4cb8-9038-bd4d3ea4410f', // Placa Pei A1 — R$130
    { variantGroup: 'placa-pei-a1', variantLabel: 'A1' },
  ],

  // ── Placas Holográficas PEO/PET ─────────────────────────────────────────
  [
    '7ca4e8ce-c83c-4209-ad55-5ede0e888faa', // Placa A1 mini Holográfica PEO/PET — R$100
    { variantGroup: 'placa-holografica-a1', variantLabel: 'A1 Mini' },
  ],
  [
    '4dc209e7-c6bb-4aa4-9574-0c9254c5b877', // Placa A1 Holografica PEO/PET — R$160
    { variantGroup: 'placa-holografica-a1', variantLabel: 'A1' },
  ],

  // ── Placas Frias ────────────────────────────────────────────────────────
  [
    '5a6b962c-abe8-4a65-8f71-3943bd008b48', // Placa Fria A1 Mini — R$135
    { variantGroup: 'placa-fria-a1', variantLabel: 'A1 Mini' },
  ],
  [
    '5bef746a-d6c9-4c0f-982b-4514be9a19d0', // Placa Fria A1 — R$185
    { variantGroup: 'placa-fria-a1', variantLabel: 'A1' },
  ],

  // ── Kit Hotend ──────────────────────────────────────────────────────────
  [
    '8e9d5e36-fb84-4fe7-9ffa-0c38c96e32cd', // Kit Hotend c/ bico 0.4 A1 — R$80
    { variantGroup: 'kit-hotend-a1', variantLabel: 'Bico 0.4' },
  ],
  [
    '58c9ca3d-4738-44d5-93fe-706d79b670f2', // Kit Hotend c/ bico 0.2 A1 — R$80
    { variantGroup: 'kit-hotend-a1', variantLabel: 'Bico 0.2' },
  ],
])

/**
 * Aplica variantGroup e variantLabel em um produto caso ele esteja no mapa.
 * Não modifica produtos que já possuem variantGroup definido.
 */
export function applyVariantGroup<T extends { id: string; variantGroup?: string; variantLabel?: string }>(
  product: T,
): T {
  if (product.variantGroup) return product

  const entry = productVariantGroupMap.get(product.id)
  if (!entry) return product

  return { ...product, ...entry }
}
