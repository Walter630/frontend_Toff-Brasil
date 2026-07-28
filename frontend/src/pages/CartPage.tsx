import {
  ArrowRight,
  CheckCircle2,
  LoaderCircle,
  LockKeyhole,
  MessageCircle,
  Minus,
  PackageOpen,
  Plus,
  ShieldCheck,
  ShoppingCart,
  Trash2,
} from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'

import { DashboardLayout } from '../components/layout/DashboardLayout'
import { Button } from '../components/ui/Button'
import {
  consumePendingCartProduct,
  consumePendingCartQuantity,
} from '../lib/cart-auth'
import { notifyCartUpdated } from '../lib/cart-events'
import { getApiErrorMessage } from '../lib/api-error'
import { stripBrandFromName } from '../lib/product-display'
import { getCartWhatsappUrl } from '../lib/whatsapp'
import { cartService } from '../services/cart-service'
import { productService } from '../services/product-service'
import type { CartItemResponse, CartResponse } from '../types/cart'

const currency = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
})

function getItemProduct(item: CartItemResponse) {
  return item.product ?? item.produto
}

function getItemProductId(item: CartItemResponse) {
  return item.productId ?? item.produtoId ?? getItemProduct(item)?.id
}

function getItemTitle(item: CartItemResponse, index: number) {
  const title =
    item.name ??
    getItemProduct(item)?.name ??
    item.productId ??
    item.produtoId ??
    `Item ${index + 1}`

  return stripBrandFromName(title)
}

function getItemImage(item: CartItemResponse) {
  return item.image ?? getItemProduct(item)?.image
}

function getItemBrand(item: CartItemResponse) {
  const brand =
    item.marcaProduto ??
    item.marca ??
    item.brand ??
    getItemProduct(item)?.marca ??
    getItemProduct(item)?.brand

  return brand && brand !== '—' ? brand : undefined
}

function getItemQuantity(item: CartItemResponse) {
  return item.quantity ?? item.quantidade ?? 1
}

function getItemUnitPrice(item: CartItemResponse) {
  return (
    item.unitPrice ??
    item.precoUnitario ??
    item.price ??
    getItemProduct(item)?.price
  )
}

function getItemTotal(item: CartItemResponse) {
  const quantity = getItemQuantity(item)
  const unitPrice = getItemUnitPrice(item)

  return item.total ?? item.subtotal ?? (unitPrice ?? 0) * quantity
}

function getCartTotal(cart: CartResponse) {
  const itemsTotal = cart.items.reduce(
    (total, item) => total + getItemTotal(item),
    0,
  )

  return cart.valorTotal > 0 ? cart.valorTotal : itemsTotal
}

function getCartUnitCount(cart: CartResponse) {
  return cart.items.reduce((total, item) => total + getItemQuantity(item), 0)
}

async function enrichCartImages(cart: CartResponse) {
  const items = await Promise.all(
    cart.items.map(async (item) => {
      if (getItemImage(item) && getItemBrand(item)) {
        return item
      }

      const productId = getItemProductId(item)

      if (!productId) {
        return item
      }

      try {
        const product = await productService.findById(productId)

        return {
          ...item,
          name: item.name ?? product.name,
          marcaProduto:
            item.marcaProduto ??
            item.marca ??
            item.brand ??
            product.marca ??
            product.brand,
          price: item.price ?? product.price,
          image: item.image ?? product.image,
        }
      } catch {
        return item
      }
    }),
  )

  return {
    ...cart,
    items,
  }
}

export function CartPage() {
  const [cart, setCart] = useState<CartResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [removingItemId, setRemovingItemId] = useState('')
  const [updatingItemId, setUpdatingItemId] = useState('')
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
      let addedPendingProduct = false

      if (pendingProductId) {
        await cartService.addItem(
          pendingProductId,
          consumePendingCartQuantity(),
        )
        addedPendingProduct = true
        setMessage('Produto adicionado ao carrinho.')
      }

      const loadedCart = await cartService.getMyCart()

      if (addedPendingProduct) {
        notifyCartUpdated({ cart: loadedCart })
      }

      setCart(await enrichCartImages(loadedCart))
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
      const updatedCart = await cartService.getMyCart()
      notifyCartUpdated({ cart: updatedCart })
      setCart(await enrichCartImages(updatedCart))
    } catch (error) {
      setMessage(getApiErrorMessage(error, 'Nao foi possivel remover o item.'))
    } finally {
      setRemovingItemId('')
    }
  }

  async function handleQuantityChange(item: CartItemResponse, nextQuantity: number) {
    setMessage('')

    if (nextQuantity < 1) {
      await handleRemoveItem(item.id)
      return
    }

    const productId = getItemProductId(item)

    if (!productId) {
      setMessage('Nao foi possivel identificar o produto deste item.')
      return
    }

    setUpdatingItemId(item.id)

    try {
      await cartService.updateItemQuantity(productId, nextQuantity)
      const updatedCart = await cartService.getMyCart()
      notifyCartUpdated({ cart: updatedCart })
      setCart(await enrichCartImages(updatedCart))
    } catch (error) {
      setMessage(
        getApiErrorMessage(
          error,
          'Nao foi possivel atualizar a quantidade do item.',
        ),
      )
    } finally {
      setUpdatingItemId('')
    }
  }

  useEffect(() => {
    void loadCart()
  }, [])

  return (
    <DashboardLayout>
      <main className="container-store py-6 sm:py-10">
        <header className="relative overflow-hidden rounded-[2rem] border border-black/[0.05] bg-white px-5 py-7 text-slate-950 shadow-[0_20px_60px_rgba(15,23,42,.09)] sm:px-8 sm:py-9">
          <div className="absolute -top-24 right-0 size-64 rounded-full bg-orange-100 blur-3xl" />
          <div className="relative flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[10px] font-black tracking-[0.18em] text-brand-orange uppercase">
                Sua seleção
              </p>
              <h1 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl">
              Meu carrinho
              </h1>
              <p className="mt-2 text-sm text-slate-500">
                Confira quantidades e valores antes de finalizar.
              </p>
            </div>
            <Link
              to="/catalogo"
              className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-brand-orange px-5 text-sm font-bold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-brand-orange-dark sm:w-auto"
            >
              Continuar comprando
              <ArrowRight className="size-4" />
            </Link>
          </div>
          <div className="relative mt-7 grid grid-cols-3 gap-2 text-[10px] font-bold sm:max-w-xl sm:text-xs">
            {[
              ['1', 'Carrinho'],
              ['2', 'Identificação'],
              ['3', 'Finalização'],
            ].map(([step, label], index) => (
              <div
                key={step}
                className={`flex items-center gap-2 rounded-xl px-2 py-2 ${
                  index === 0
                    ? 'bg-orange-50 text-slate-900'
                    : 'bg-slate-50 text-slate-400'
                }`}
              >
                <span
                  className={`grid size-6 shrink-0 place-items-center rounded-full ${
                    index === 0
                      ? 'bg-brand-orange text-white'
                      : 'bg-white text-slate-400 ring-1 ring-slate-200'
                  }`}
                >
                  {step}
                </span>
                <span className="truncate">{label}</span>
              </div>
            ))}
          </div>
        </header>

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
          <section className="mt-7 grid gap-6 xl:grid-cols-[minmax(0,1fr)_390px]">
            <div className="space-y-3 sm:space-y-4">
              {cart.items.map((item, index) => {
                const itemTotal = getItemTotal(item)
                const itemImage = getItemImage(item)
                const itemBrand = getItemBrand(item)
                const productId = getItemProductId(item)
                const unitPrice = getItemUnitPrice(item)
                const quantity = getItemQuantity(item)
                const isUpdating = updatingItemId === item.id
                const isRemoving = removingItemId === item.id

                return (
                  <article
                    key={item.id}
                    className="overflow-hidden rounded-[1.4rem] border border-black/[0.05] bg-white shadow-[0_12px_38px_rgba(15,23,42,.07)]"
                  >
                    <div className="grid grid-cols-[96px_minmax(0,1fr)] gap-4 p-4 sm:grid-cols-[142px_minmax(0,1fr)] sm:p-5">
                      <div className="grid aspect-square place-items-center overflow-hidden rounded-2xl border border-slate-100 bg-white p-2 sm:p-3">
                        {itemImage ? (
                          <img
                            src={itemImage}
                            alt={getItemTitle(item, index)}
                            className="max-h-full max-w-full scale-[1.03] object-contain"
                            onError={(event) => {
                              event.currentTarget.src =
                                '/products/dragao-articulado.webp'
                            }}
                          />
                        ) : (
                          <ShoppingCart className="size-9 text-slate-300" />
                        )}
                      </div>

                      <div className="min-w-0">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                          <div className="min-w-0">
                            <h2 className="line-clamp-2 text-base leading-snug font-bold text-slate-700 sm:text-lg">
                              {productId ? (
                                <Link
                                  to={`/produtos/${encodeURIComponent(productId)}`}
                                  className="transition hover:text-brand-orange hover:underline"
                                >
                                  {getItemTitle(item, index)}
                                </Link>
                              ) : (
                                getItemTitle(item, index)
                              )}
                            </h2>
                            {itemBrand && (
                              <p className="mt-1 text-xs font-semibold text-brand-orange">
                                Marca: {itemBrand}
                              </p>
                            )}
                            <p className="mt-1 hidden text-xs text-slate-400 sm:block">
                              {productId ? (
                                <Link
                                  to={`/produtos/${encodeURIComponent(productId)}`}
                                  className="font-semibold text-brand-orange hover:underline"
                                >
                                  Ver detalhes do produto
                                </Link>
                              ) : (
                                'Produto sem página vinculada'
                              )}
                            </p>
                          </div>
                          <strong className="text-lg font-black text-slate-950 sm:text-xl">
                            {currency.format(itemTotal)}
                          </strong>
                        </div>

                        <div className="mt-4 grid gap-3 md:grid-cols-[1fr_auto] md:items-end">
                          <div>
                            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                              Quantidade
                            </p>
                            <div className="mt-2 inline-flex h-10 items-center overflow-hidden rounded-xl border bg-white sm:h-11">
                              <button
                                type="button"
                                onClick={() =>
                                  void handleQuantityChange(item, quantity - 1)
                                }
                                disabled={isUpdating || isRemoving}
                                className="grid h-full w-10 place-items-center text-brand-navy transition hover:bg-slate-50 disabled:pointer-events-none disabled:opacity-50 sm:w-11"
                                aria-label="Diminuir quantidade"
                              >
                                {isUpdating ? (
                                  <LoaderCircle className="size-4 animate-spin" />
                                ) : (
                                  <Minus className="size-4" />
                                )}
                              </button>
                              <span className="grid h-full min-w-10 place-items-center border-x px-3 text-sm font-bold text-brand-navy sm:min-w-12 sm:px-4">
                                {quantity}
                              </span>
                              <button
                                type="button"
                                onClick={() =>
                                  void handleQuantityChange(item, quantity + 1)
                                }
                                disabled={isUpdating || isRemoving}
                                className="grid h-full w-10 place-items-center text-brand-navy transition hover:bg-slate-50 disabled:pointer-events-none disabled:opacity-50 sm:w-11"
                                aria-label="Aumentar quantidade"
                              >
                                <Plus className="size-4" />
                              </button>
                            </div>
                          </div>

                          <div className="flex flex-col gap-2 sm:items-end">
                            <p className="text-xs text-slate-500 sm:text-sm">
                              Unitario:{' '}
                              <span className="font-semibold text-brand-navy">
                                {currency.format(unitPrice ?? 0)}
                              </span>
                            </p>
                            <button
                              type="button"
                              onClick={() => void handleRemoveItem(item.id)}
                              disabled={isRemoving || isUpdating}
                              className="inline-flex h-9 w-fit items-center justify-center gap-2 rounded-xl border border-red-100 px-3 text-xs font-semibold text-red-600 transition hover:bg-red-50 disabled:pointer-events-none disabled:opacity-50 sm:h-10 sm:text-sm"
                            >
                              {isRemoving ? (
                                <LoaderCircle className="size-4 animate-spin" />
                              ) : (
                                <Trash2 className="size-4" />
                              )}
                              Excluir
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </article>
                )
              })}
            </div>

            <aside className="sticky bottom-24 h-fit overflow-hidden rounded-[1.6rem] bg-white shadow-[0_18px_55px_rgba(15,23,42,.12)] ring-1 ring-black/[0.05] sm:p-0 xl:bottom-auto xl:top-28">
              <div className="border-b border-slate-100 bg-slate-50 p-5 text-slate-900 sm:p-6">
                <div className="flex items-center gap-3">
                  <span className="grid size-11 place-items-center rounded-xl bg-orange-100 text-brand-orange">
                    <ShieldCheck className="size-5" />
                  </span>
                  <div>
                    <h2 className="font-bold">Resumo do pedido</h2>
                    <p className="text-xs text-slate-400">
                      {cart.items.length} produto(s), {getCartUnitCount(cart)} un.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-5 sm:p-6">
                <div className="space-y-3 text-sm">
                  <div className="flex items-center justify-between text-slate-500">
                    <span>Subtotal</span>
                    <span className="font-semibold text-brand-navy">
                      {currency.format(getCartTotal(cart))}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-slate-500">
                    <span>Entrega</span>
                    <span className="rounded-full bg-orange-50 px-2 py-0.5 text-xs font-bold text-brand-orange">A combinar</span>
                  </div>
                  <div className="flex items-center justify-between border-t pt-4">
                    <span className="font-bold text-brand-navy">Total</span>
                    <strong className="text-2xl font-black text-slate-950">
                      {currency.format(getCartTotal(cart))}
                    </strong>
                  </div>
                </div>

                <Link
                  to="/checkout"
                  className="mt-6 inline-flex h-13 w-full items-center justify-center gap-2 rounded-xl bg-brand-orange px-5 text-sm font-bold text-white shadow-lg shadow-orange-200/70 transition hover:-translate-y-0.5 hover:bg-brand-orange-dark"
                >
                  <LockKeyhole className="size-4" />
                  Ir para finalização
                </Link>
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-3 inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 text-sm font-bold text-white transition hover:bg-emerald-700"
                >
                  <MessageCircle className="size-4" />
                  Enviar pelo WhatsApp
                </a>
                <p className="mt-4 flex items-center justify-center gap-2 text-[10px] font-semibold text-slate-400">
                  <CheckCircle2 className="size-3.5 text-emerald-500" />
                  Seus itens ficam reservados durante a finalização
                </p>
              </div>
            </aside>
          </section>
        ) : (
          <div className="mt-8 rounded-[2rem] border border-dashed bg-white p-8 text-center shadow-sm sm:p-14">
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
