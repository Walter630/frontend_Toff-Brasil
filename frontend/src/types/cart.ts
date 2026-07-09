export type CartItemResponse = {
  id: string
  productId?: string
  produtoId?: string
  name?: string
  image?: string | null
  price?: number
  quantity?: number
  quantidade?: number
  unitPrice?: number
  precoUnitario?: number
  total?: number
  subtotal?: number
  product?: {
    id?: string
    name?: string
    image?: string | null
    price?: number
  }
  produto?: {
    id?: string
    name?: string
    image?: string | null
    price?: number
  }
}

export type CartResponse = {
  id: string
  items: CartItemResponse[]
  valorTotal: number
}
