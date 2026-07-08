import type { Product } from '../types/product'

const stockReservationsKey = 'toffco-stock-reservations'
export const stockReservationsEvent = 'toffco-stock-reservations-change'

function readReservations(): Record<string, number> {
  if (typeof window === 'undefined') {
    return {}
  }

  try {
    const storedValue = window.localStorage.getItem(stockReservationsKey)
    return storedValue ? (JSON.parse(storedValue) as Record<string, number>) : {}
  } catch {
    return {}
  }
}

function writeReservations(reservations: Record<string, number>) {
  window.localStorage.setItem(stockReservationsKey, JSON.stringify(reservations))
  window.dispatchEvent(new Event(stockReservationsEvent))
}

export function applyLocalStockReservations(products: Product[]) {
  const reservations = readReservations()

  return products.map((product) => {
    const reservedQuantity = reservations[product.id] ?? 0
    const estoque = Math.max(0, product.estoque - reservedQuantity)

    return {
      ...product,
      estoque,
    }
  })
}

export function reserveLocalProductStock(product: Product, quantity = 1) {
  if (typeof window === 'undefined' || product.estoque < quantity) {
    return false
  }

  const reservations = readReservations()
  reservations[product.id] = (reservations[product.id] ?? 0) + quantity
  writeReservations(reservations)

  return true
}
