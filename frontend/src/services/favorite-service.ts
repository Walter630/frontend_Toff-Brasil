const FAVORITES_KEY = 'toffbr:favorites'

/**
 * Favoritos ficam no navegador enquanto o backend não oferece uma rota própria.
 * A página pode migrar para uma API futuramente sem alterar os componentes.
 */
export const favoriteService = {
  list(): string[] {
    try {
      return JSON.parse(localStorage.getItem(FAVORITES_KEY) ?? '[]') as string[]
    } catch {
      return []
    }
  },

  toggle(productId: string) {
    const favorites = this.list()
    const next = favorites.includes(productId)
      ? favorites.filter((id) => id !== productId)
      : [...favorites, productId]

    localStorage.setItem(FAVORITES_KEY, JSON.stringify(next))
    return next
  },
}
