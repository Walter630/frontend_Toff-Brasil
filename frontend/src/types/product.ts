export type Product = {
  id: string
  ativo: boolean
  name: string
  description: string
  price: number
  image: string
  images?: string[]
  featured?: boolean
  categoria: string
  marca?: string
  brand?: string
  type?: string
  estoque: number
  status?:
    | 'DISPONIVEL'
    | 'SEM_ESTOQUE'
    | 'EM_PRODUCAO'
    | 'EM_BREVE'
    | 'PRE_VENDA'
  availableAt?: string
  statusMessage?: string
  codigoBarras?: string
  barcode?: string
  createdAt: string
  updatedAt: string
}
