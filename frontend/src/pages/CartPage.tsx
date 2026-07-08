import {
  ArrowRight,
  LoaderCircle,
  MessageCircle,
  PackageOpen,
  ShoppingCart,
  Trash2,
} from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'

import { DashboardLayout } from '../components/layout/DashboardLayout'
import { Button } from '../components/ui/Button'
import { consumePendingCartProduct } from '../lib/cart-auth'
import { getApiErrorMessage } from '../lib/api-error'
import { getCartWhatsappUrl } from '../lib/whatsapp'
import { cartService } from '../services/cart-service'
import type { CartItemResponse, CartResponse } from '../types/cart'

const currency = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
})

function getItemProduct(item: CartItemResponse) {
  return item.product ?? item.produto
}

function getItemTitle(item: CartItemResponse, index: number) {
  return (
    getItemProduct(item)?.name ??
    item.productId ??
    item.produtoId ??
    `Item ${index + 1}`
  )
}

function getItemImage(item: CartItemResponse) {
  return getItemProduct(item)?.image
}

function getItemQuantity(item: CartItemResponse) {
  return item.quantity ?? item.quantidade ?? 1
}

function getItemUnitPrice(item: CartItemResponse) {
  return item.unitPrice ?? item.precoUnitario ?? getItemProduct(item)?.price
}

function getItemTotal(item: CartItemResponse) {
  const quantity = getItemQuantity(item)
  const unitPrice = getItemUnitPrice(item)

  return item.total ?? item.subtotal ?? (unitPrice ? unitPrice * quantity : null)
}

export function CartPage() {
  const [cart, setCart] = useState<CartResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [removingItemId, setRemovingItemId] = useState('')
  const [message, setMessage] = useState('')

  const whatsappUrl = useMemo(
    () => (cart && cart.items.length ? getCartWhatsappUrl(cart) : ''),
    [cart],
  )

  async function loadCart() {
    setMessage('')
    setLoading(true)

    try {
      const pendingProductId = consumePendingCartProduct()

      if (pendingProductId) {
        await cartService.addItem(pendingProductId)
        setMessage('Produto adicionado ao carrinho.')
      }

      setCart(await cartService.getMyCart())
    } catch (error) {
      setMessage(getApiErrorMessage(error, 'Nao foi possivel carregar o carrinho.'))
    } finally {
      setLoading(false)
    }
  }

  async function handleRemoveItem(itemId: string) {
    setMessage('')
    setRemovingItemId(itemId)

    try {
      await cartService.removeItem(itemId)
      setCart(await cartService.getMyCart())
    } catch (error) {
      setMessage(getApiErrorMessage(error, 'Nao foi possivel remover o item.'))
    } finally {
      setRemovingItemId('')
    }
  }

  useEffect(() => {
    void loadCart()
  }, [])

  return (
    <DashboardLayout>
      <main className="p-5 sm:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-brand-orange">
              Compra autenticada
            </p>
            <h1 className="mt-1 text-3xl font-bold text-brand-navy">
              Meu carrinho
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              O login so e solicitado quando voce adiciona produtos ou acessa o
              carrinho.
            </p>
          </div>
          <Link
            to="/catalogo"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 text-sm font-semibold text-brand-navy transition hover:bg-slate-50"
          >
            Continuar comprando
            <ArrowRight className="size-4" />
          </Link>
        </div>

        {message && (
          <p className="mt-6 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-brand-navy">
            {message}
          </p>
        )}

        {loading ? (
          <div className="mt-10 grid min-h-72 place-items-center rounded-2xl border bg-white">
            <LoaderCircle className="size-9 animate-spin text-brand-orange" />
          </div>
        ) : cart && cart.items.length ? (
          <section className="mt-8 grid gap-6 xl:grid-cols-[1fr_360px]">
            <div className="space-y-4">
              {cart.items.map((item, index) => {
                const itemTotal = getItemTotal(item)
                const itemImage = getItemImage(item)
                const unitPrice = getItemUnitPrice(item)

                return (
                  <article
                    key={item.id}
                    className="flex flex-col gap-4 rounded-2xl border bg-white p-4 sm:flex-row sm:items-center"
                  >
                    <div className="grid size-24 shrink-0 place-items-center rounded-xl bg-slate-50">
                      {itemImage ? (
                        <img
                          src={itemImage}
                          alt={getItemTitle(item, index)}
                          className="max-h-20 max-w-20 object-contain"
                        />
                      ) : (
                        <ShoppingCart className="size-8 text-slate-300" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h2 className="font-bold text-brand-navy">
                        {getItemTitle(item, index)}
                      </h2>
                      <p className="mt-1 text-sm text-slate-500">
                        Quantidade: {getItemQuantity(item)}
                      </p>
                      {unitPrice && (
                        <p className="mt-1 text-sm text-slate-500">
                          Unitario: {currency.format(unitPrice)}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center justify-between gap-4 sm:flex-col sm:items-end">
                      <strong className="text-lg text-brand-orange">
                        {itemTotal ? currency.format(itemTotal) : 'A calcular'}
                      </strong>
                      <button
                        type="button"
                        onClick={() => void handleRemoveItem(item.id)}
                        disabled={removingItemId === item.id}
                        className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-red-100 px-3 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:pointer-events-none disabled:opacity-50"
                      >
                        {removingItemId === item.id ? (
                          <LoaderCircle className="size-4 animate-spin" />
                        ) : (
                          <Trash2 className="size-4" />
                        )}
                        Remover
                      </button>
                    </div>
                  </article>
                )
              })}
            </div>

            <aside className="h-fit rounded-2xl border bg-white p-6">
              <div className="flex items-center gap-3">
                <div className="grid size-11 place-items-center rounded-xl bg-orange-50 text-brand-orange">
                  <ShoppingCart className="size-5" />
                </div>
                <div>
                  <h2 className="font-bold text-brand-navy">Resumo</h2>
                  <p className="text-xs text-slate-500">
                    {cart.items.length} item(ns)
                  </p>
                </div>
              </div>
              <div className="mt-6 flex items-center justify-between border-t pt-5">
                <span className="text-sm text-slate-500">Total</span>
                <strong className="text-2xl text-brand-orange">
                  {currency.format(cart.valorTotal)}
                </strong>
              </div>
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-6 inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-green-600 px-5 text-sm font-semibold text-white transition hover:bg-green-700"
              >
                <MessageCircle className="size-4" />
                Finalizar pelo WhatsApp
              </a>
              <p className="mt-4 text-xs leading-5 text-slate-500">
                Checkout online, pagamento e Odoo ficam para a proxima etapa de
                integracoes.
              </p>
            </aside>
          </section>
        ) : (
          <div className="mt-8 rounded-2xl border border-dashed bg-white p-14 text-center">
            <PackageOpen className="mx-auto size-10 text-slate-300" />
            <h2 className="mt-5 font-bold text-brand-navy">
              Seu carrinho esta vazio
            </h2>
            <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-slate-500">
              Explore o catalogo publico e adicione produtos quando quiser
              comprar.
            </p>
            <Button className="mt-6" onClick={() => void loadCart()}>
              Atualizar carrinho
            </Button>
          </div>
        )}
      </main>
    </DashboardLayout>
  )
}
