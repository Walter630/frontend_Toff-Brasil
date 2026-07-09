import type { ChangeEvent, FormEvent } from 'react'

import {
  Download,
  ImagePlus,
  LoaderCircle,
  PackagePlus,
  Pencil,
  RefreshCw,
  ScanLine,
  Search,
  Trash2,
  Upload,
} from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'

import { BarcodeScannerModal } from '../components/barcode/BarcodeScannerModal'
import { DashboardLayout } from '../components/layout/DashboardLayout'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { useProducts } from '../hooks/useProducts'
import { getApiErrorMessage } from '../lib/api-error'
import {
  type CompressedImage,
  compressProductImage,
  formatFileSize,
} from '../lib/image-compression'
import {
  productCategoryOptions,
  productService,
  type ProductCreatePayload,
} from '../services/product-service'
import type { Product } from '../types/product'

type ProductForm = {
  name: string
  description: string
  price: string
  estoque: string
  codigoBarras: string
  categoria: ProductCreatePayload['categoria']
  status: NonNullable<ProductCreatePayload['status']>
}

const initialForm: ProductForm = {
  name: '',
  description: '',
  price: '',
  estoque: '0',
  codigoBarras: '',
  categoria: 'FILAMENTOS',
  status: 'DISPONIVEL',
}

const statusOptions = [
  { label: 'Disponivel', value: 'DISPONIVEL' },
  { label: 'Sem estoque', value: 'SEM_ESTOQUE' },
  { label: 'Em producao', value: 'EM_PRODUCAO' },
  { label: 'Em breve', value: 'EM_BREVE' },
  { label: 'Pre-venda', value: 'PRE_VENDA' },
] as const

const adminPageSize = 24

function normalizeText(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
}

export function AdminProductsPage() {
  const { products, loading, error, reload } = useProducts()
  const [form, setForm] = useState<ProductForm>(initialForm)
  const [image, setImage] = useState<CompressedImage | null>(null)
  const [imageError, setImageError] = useState('')
  const [saving, setSaving] = useState(false)
  const [feedback, setFeedback] = useState('')
  const [submitError, setSubmitError] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [adminSearch, setAdminSearch] = useState('')
  const [adminCategory, setAdminCategory] = useState('Todos')
  const [adminPage, setAdminPage] = useState(1)
  const [barcodeScannerOpen, setBarcodeScannerOpen] = useState(false)
  const editingProduct = useMemo(
    () => products.find((product) => product.id === editingId) ?? null,
    [editingId, products],
  )
  const visibleAdminProducts = useMemo(() => {
    const search = normalizeText(adminSearch)

    return products.filter((product) => {
      const matchesSearch =
        !search ||
        normalizeText(`${product.name} ${product.description}`).includes(search)
      const matchesCategory =
        adminCategory === 'Todos' || product.categoria === adminCategory

      return matchesSearch && matchesCategory
    })
  }, [adminCategory, adminSearch, products])
  const adminTotalPages = Math.max(
    1,
    Math.ceil(visibleAdminProducts.length / adminPageSize),
  )
  const paginatedAdminProducts = visibleAdminProducts.slice(
    (adminPage - 1) * adminPageSize,
    adminPage * adminPageSize,
  )

  const updateField =
    (field: keyof ProductForm) =>
    (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      setForm((current) => ({ ...current, [field]: event.target.value }))
    }

  const handleImageChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]

    setImageError('')
    setFeedback('')

    if (!file) {
      return
    }

    try {
      setImage(await compressProductImage(file))
    } catch (compressionError) {
      setImage(null)
      setImageError(
        compressionError instanceof Error
          ? compressionError.message
          : 'Nao foi possivel otimizar a imagem.',
      )
    } finally {
      event.target.value = ''
    }
  }

  const resetForm = () => {
    setForm(initialForm)
    setImage(null)
    setImageError('')
    setSubmitError('')
    setFeedback('')
    setEditingId(null)
  }

  const handleEdit = (product: Product) => {
    setEditingId(product.id)
    setImage(null)
    setImageError('')
    setSubmitError('')
    setFeedback('')
    setForm({
      name: product.name,
      description: product.description,
      price: String(product.price),
      estoque: String(product.estoque),
      codigoBarras: product.codigoBarras ?? product.barcode ?? '',
      categoria: product.categoria as ProductCreatePayload['categoria'],
      status: product.status ?? 'DISPONIVEL',
    })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleDelete = async (product: Product) => {
    const canDelete = window.confirm(
      `Apagar "${product.name}" do catalogo?`,
    )

    if (!canDelete) {
      return
    }

    setSubmitError('')
    setFeedback('')
    setSaving(true)

    try {
      await productService.delete(product.id)
      if (editingId === product.id) {
        resetForm()
      }
      setFeedback('Produto apagado do banco central.')
      await reload()
    } catch (requestError) {
      setSubmitError(
        getApiErrorMessage(requestError, 'Nao foi possivel apagar o produto.'),
      )
    } finally {
      setSaving(false)
    }
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSubmitError('')
    setFeedback('')

    const price = Number(form.price)
    const estoque = Number(form.estoque)
    const currentProduct = editingProduct

    if (!image && !currentProduct) {
      setSubmitError('Selecione uma imagem do produto.')
      return
    }

    if (!form.name.trim() || !form.description.trim()) {
      setSubmitError('Preencha nome e descricao.')
      return
    }

    if (!Number.isFinite(price) || price <= 0) {
      setSubmitError('Informe um preco valido.')
      return
    }

    if (!Number.isInteger(estoque) || estoque < 0) {
      setSubmitError('Informe um estoque valido.')
      return
    }

    setSaving(true)

    try {
      const payload = {
        name: form.name.trim(),
        description: form.description.trim(),
        image: image?.dataUrl ?? currentProduct?.image ?? '',
        categoria: form.categoria,
        price,
        estoque,
        codigoBarras: form.codigoBarras.trim() || undefined,
        status: form.status,
      }

      if (currentProduct) {
        await productService.update(currentProduct.id, payload)
        resetForm()
        setFeedback('Produto atualizado no banco central.')
      } else {
        await productService.create(payload)
        resetForm()
        setFeedback('Produto cadastrado no banco central.')
      }

      await reload()
    } catch (requestError) {
      setSubmitError(
        getApiErrorMessage(requestError, 'Nao foi possivel salvar o produto.'),
      )
    } finally {
      setSaving(false)
    }
  }

  useEffect(() => {
    setAdminPage(1)
  }, [adminCategory, adminSearch])

  useEffect(() => {
    if (adminPage > adminTotalPages) {
      setAdminPage(adminTotalPages)
    }
  }, [adminPage, adminTotalPages])

  return (
    <DashboardLayout>
      <main className="p-5 sm:p-8">
        <div className="flex flex-col gap-4 border-b pb-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-brand-orange">
              Administracao
            </p>
            <h1 className="mt-1 text-3xl font-bold text-brand-navy">
              Produtos
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-500">
              Cadastre, edite e apague produtos no banco central do catalogo.
            </p>
          </div>
          <Button
            variant="secondary"
            onClick={() => void reload()}
            disabled={loading}
          >
            <RefreshCw className="size-4" />
            Atualizar
          </Button>
        </div>

        <div className="mt-6 grid gap-6 2xl:grid-cols-[minmax(0,1fr)_520px]">
          <form
            onSubmit={(event) => void handleSubmit(event)}
            className="rounded-2xl border bg-white p-5 shadow-sm sm:p-6"
          >
            <div className="mb-5 flex flex-col gap-1 border-b pb-4">
              <h2 className="text-lg font-bold text-brand-navy">
                {editingProduct ? 'Editar produto' : 'Cadastrar produto'}
              </h2>
              <p className="text-sm text-slate-500">
                {editingProduct
                  ? 'A imagem atual sera mantida se voce nao selecionar outra.'
                  : 'A imagem e obrigatoria para novos produtos.'}
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                id="product-name"
                label="Nome"
                value={form.name}
                onChange={updateField('name')}
                maxLength={120}
                required
              />
              <label htmlFor="product-category" className="block">
                <span className="mb-2 block text-sm font-medium text-brand-navy">
                  Categoria
                </span>
                <select
                  id="product-category"
                  value={form.categoria}
                  onChange={updateField('categoria')}
                  className="h-12 w-full rounded-xl border bg-white px-4 text-sm text-brand-ink outline-none transition focus:border-brand-orange focus:ring-4 focus:ring-orange-100"
                >
                  {productCategoryOptions.map((category) => (
                    <option key={category.value} value={category.value}>
                      {category.label}
                    </option>
                  ))}
                </select>
              </label>
              <Input
                id="product-price"
                label="Preco"
                type="number"
                value={form.price}
                onChange={updateField('price')}
                min="0.01"
                step="0.01"
                required
              />
              <Input
                id="product-stock"
                label="Estoque"
                type="number"
                value={form.estoque}
                onChange={updateField('estoque')}
                min="0"
                step="1"
                required
              />
              <div className="sm:col-span-2">
                <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
                  <Input
                    id="product-barcode"
                    label="Codigo de barras"
                    value={form.codigoBarras}
                    onChange={updateField('codigoBarras')}
                    inputMode="numeric"
                    placeholder="Escaneie ou digite o codigo"
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    className="h-12"
                    onClick={() => setBarcodeScannerOpen(true)}
                  >
                    <ScanLine className="size-4" />
                    Escanear
                  </Button>
                </div>
              </div>
              <label htmlFor="product-status" className="block sm:col-span-2">
                <span className="mb-2 block text-sm font-medium text-brand-navy">
                  Status
                </span>
                <select
                  id="product-status"
                  value={form.status}
                  onChange={updateField('status')}
                  className="h-12 w-full rounded-xl border bg-white px-4 text-sm text-brand-ink outline-none transition focus:border-brand-orange focus:ring-4 focus:ring-orange-100"
                >
                  {statusOptions.map((status) => (
                    <option key={status.value} value={status.value}>
                      {status.label}
                    </option>
                  ))}
                </select>
              </label>
              <label htmlFor="product-description" className="block sm:col-span-2">
                <span className="mb-2 block text-sm font-medium text-brand-navy">
                  Descricao
                </span>
                <textarea
                  id="product-description"
                  value={form.description}
                  onChange={updateField('description')}
                  rows={5}
                  maxLength={700}
                  required
                  className="w-full resize-y rounded-xl border bg-white px-4 py-3 text-sm text-brand-ink outline-none transition placeholder:text-slate-400 focus:border-brand-orange focus:ring-4 focus:ring-orange-100"
                />
              </label>
            </div>

            <div className="mt-5 rounded-2xl border border-dashed bg-slate-50 p-4">
              <input
                id="product-image"
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={(event) => void handleImageChange(event)}
                className="sr-only"
              />
              <div className="flex flex-col gap-4 lg:flex-row">
                <label
                  htmlFor="product-image"
                  className="flex min-h-52 cursor-pointer flex-col items-center justify-center rounded-xl border bg-white px-5 text-center text-sm text-slate-500 transition hover:border-brand-orange hover:text-brand-navy lg:w-72"
                >
                  {image ? (
                    <img
                      src={image.dataUrl}
                      alt="Preview do produto"
                      className="h-48 w-full rounded-lg object-contain"
                    />
                  ) : editingProduct ? (
                    <img
                      src={editingProduct.image}
                      alt={editingProduct.name}
                      className="h-48 w-full rounded-lg object-contain"
                    />
                  ) : (
                    <>
                      <ImagePlus className="mb-3 size-8 text-brand-orange" />
                      Selecione a imagem no computador
                    </>
                  )}
                </label>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-brand-navy">
                    Imagem do produto
                  </p>
                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    O arquivo escolhido e convertido para WebP, redimensionado e
                    enviado em qualidade menor para reduzir peso no catalogo.
                  </p>
                  {image && (
                    <div className="mt-4 grid gap-2 text-sm text-slate-600 sm:grid-cols-2">
                      <span>Original: {formatFileSize(image.originalSize)}</span>
                      <span>Otimizada: {formatFileSize(image.size)}</span>
                      <span>
                        Tamanho: {image.width}x{image.height}px
                      </span>
                      <a
                        href={image.dataUrl}
                        download={image.fileName}
                        className="inline-flex items-center gap-2 font-semibold text-brand-orange hover:text-brand-orange-dark"
                      >
                        <Download className="size-4" />
                        Baixar WebP
                      </a>
                    </div>
                  )}
                  {imageError && (
                    <p className="mt-3 text-sm font-medium text-red-600">
                      {imageError}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {(submitError || feedback) && (
              <p
                className={
                  submitError
                    ? 'mt-4 text-sm font-medium text-red-600'
                    : 'mt-4 text-sm font-medium text-emerald-700'
                }
              >
                {submitError || feedback}
              </p>
            )}

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
              <Button
                type="button"
                variant="secondary"
                onClick={resetForm}
              >
                {editingProduct ? 'Cancelar edicao' : 'Limpar'}
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? (
                  <LoaderCircle className="size-4 animate-spin" />
                ) : (
                  <Upload className="size-4" />
                )}
                {editingProduct ? 'Salvar alteracoes' : 'Cadastrar produto'}
              </Button>
            </div>
          </form>

          <aside className="rounded-2xl border bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-4 border-b pb-4">
              <div className="flex items-center gap-3">
                <span className="flex size-10 items-center justify-center rounded-xl bg-orange-50 text-brand-orange">
                  <PackagePlus className="size-5" />
                </span>
                <div>
                  <p className="text-sm text-slate-500">Produtos cadastrados</p>
                  <p className="text-2xl font-bold text-brand-navy">
                    {loading ? '...' : products.length}
                  </p>
                </div>
              </div>

              <label className="relative block">
                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                <input
                  value={adminSearch}
                  onChange={(event) => setAdminSearch(event.target.value)}
                  placeholder="Buscar produto para editar"
                  className="h-11 w-full rounded-xl border bg-white pl-10 pr-3 text-sm outline-none focus:border-brand-orange focus:ring-4 focus:ring-orange-100"
                />
              </label>

              <select
                value={adminCategory}
                onChange={(event) => setAdminCategory(event.target.value)}
                className="h-11 w-full rounded-xl border bg-white px-3 text-sm font-semibold text-brand-navy outline-none focus:border-brand-orange focus:ring-4 focus:ring-orange-100"
              >
                <option value="Todos">Todas as categorias</option>
                {productCategoryOptions.map((category) => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>

              {!loading && !error && (
                <p className="text-xs text-slate-500">
                  Mostrando {paginatedAdminProducts.length} de{' '}
                  {visibleAdminProducts.length} produto(s) filtrados.
                </p>
              )}
            </div>

            {error && (
              <p className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">
                {error}
              </p>
            )}

            <div className="mt-5 max-h-[780px] space-y-3 overflow-y-auto pr-1">
              {loading ? (
                <p className="text-sm text-slate-500">Carregando catalogo...</p>
              ) : paginatedAdminProducts.length ? (
                paginatedAdminProducts.map((product) => (
                  <div
                    key={product.id}
                    className="rounded-xl border p-3 transition hover:border-brand-orange"
                  >
                    <Link
                      to={`/produtos/${product.id}`}
                      className="flex gap-3"
                    >
                      <img
                        src={product.image}
                        alt={product.name}
                        className="size-16 rounded-lg object-contain ring-1 ring-slate-100"
                        loading="lazy"
                        onError={(event) => {
                          event.currentTarget.src = '/products/dragao-articulado.webp'
                        }}
                      />
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-semibold text-brand-navy">
                          {product.name}
                        </span>
                        <span className="mt-1 block text-xs text-slate-500">
                          {product.categoria} - {product.estoque} em estoque
                        </span>
                        <span className="mt-1 block truncate text-[11px] text-slate-400">
                          ID: {product.id}
                        </span>
                        <span className="mt-1 block text-xs font-semibold text-brand-orange">
                          {statusOptions.find(
                            (status) => status.value === product.status,
                          )?.label ?? 'Disponivel'}
                        </span>
                      </span>
                    </Link>
                    <div className="mt-3 grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => handleEdit(product)}
                        className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border px-3 text-xs font-semibold text-brand-navy transition hover:border-brand-orange hover:text-brand-orange"
                      >
                        <Pencil className="size-3.5" />
                        Editar
                      </button>
                      <button
                        type="button"
                        onClick={() => void handleDelete(product)}
                        disabled={saving}
                        className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-red-200 px-3 text-xs font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-60"
                      >
                        <Trash2 className="size-3.5" />
                        Apagar
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-500">
                  Nenhum produto encontrado para esses filtros.
                </p>
              )}
            </div>

            {visibleAdminProducts.length > adminPageSize && (
              <div className="mt-4 flex items-center justify-between border-t pt-4 text-sm">
                <button
                  type="button"
                  onClick={() => setAdminPage((current) => Math.max(1, current - 1))}
                  disabled={adminPage === 1}
                  className="rounded-lg border px-3 py-2 font-semibold text-brand-navy disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Anterior
                </button>
                <span className="font-semibold text-slate-500">
                  {adminPage} / {adminTotalPages}
                </span>
                <button
                  type="button"
                  onClick={() =>
                    setAdminPage((current) =>
                      Math.min(adminTotalPages, current + 1),
                    )
                  }
                  disabled={adminPage === adminTotalPages}
                  className="rounded-lg border px-3 py-2 font-semibold text-brand-navy disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Proxima
                </button>
              </div>
            )}
          </aside>
        </div>
        <BarcodeScannerModal
          open={barcodeScannerOpen}
          onClose={() => setBarcodeScannerOpen(false)}
          onScan={(code) =>
            setForm((current) => ({ ...current, codigoBarras: code }))
          }
        />
      </main>
    </DashboardLayout>
  )
}
