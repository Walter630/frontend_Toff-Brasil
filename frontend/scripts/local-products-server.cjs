const http = require('node:http')
const fs = require('node:fs')
const path = require('node:path')
const crypto = require('node:crypto')

const port = Number(process.env.TOFFCO_PRODUCTS_PORT || 8787)
const dbPath = path.resolve(__dirname, '..', '.local-products-db.json')

function sendJson(response, status, payload) {
  response.writeHead(status, {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
    'Content-Type': 'application/json; charset=utf-8',
  })
  response.end(JSON.stringify(payload))
}

function readProducts() {
  if (!fs.existsSync(dbPath)) {
    return null
  }

  try {
    return JSON.parse(fs.readFileSync(dbPath, 'utf8'))
  } catch {
    return []
  }
}

function writeProducts(products) {
  const tempPath = `${dbPath}.tmp`
  fs.writeFileSync(tempPath, JSON.stringify(products, null, 2), 'utf8')
  fs.renameSync(tempPath, dbPath)
}

function readBody(request) {
  return new Promise((resolve, reject) => {
    let body = ''

    request.on('data', (chunk) => {
      body += chunk

      if (body.length > 25 * 1024 * 1024) {
        reject(new Error('Payload muito grande.'))
        request.destroy()
      }
    })
    request.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {})
      } catch {
        reject(new Error('JSON invalido.'))
      }
    })
    request.on('error', reject)
  })
}

function createProductId(name) {
  const slug = String(name || 'produto')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 50)

  return `shared-${slug || 'produto'}-${crypto.randomUUID().slice(0, 8)}`
}

function productFromPayload(payload) {
  const now = new Date().toISOString()

  return {
    id: createProductId(payload.name),
    ativo: true,
    name: String(payload.name || '').trim(),
    description: String(payload.description || '').trim(),
    price: Number(payload.price),
    image: String(payload.image || ''),
    categoria: String(payload.categoria || 'FILAMENTOS'),
    estoque: Number(payload.estoque),
    status: payload.status || 'DISPONIVEL',
    createdAt: now,
    updatedAt: now,
  }
}

const server = http.createServer(async (request, response) => {
  if (request.method === 'OPTIONS') {
    sendJson(response, 204, {})
    return
  }

  const url = new URL(request.url, `http://${request.headers.host}`)

  try {
    if (request.method === 'GET' && url.pathname === '/health') {
      sendJson(response, 200, { ok: true })
      return
    }

    if (request.method === 'GET' && url.pathname === '/products') {
      const products = readProducts()
      sendJson(response, 200, {
        initialized: Array.isArray(products),
        products: products ?? [],
      })
      return
    }

    if (request.method === 'PUT' && url.pathname === '/products/seed') {
      const currentProducts = readProducts()

      if (Array.isArray(currentProducts) && currentProducts.length > 0) {
        sendJson(response, 200, { products: currentProducts })
        return
      }

      const body = await readBody(request)
      const products = Array.isArray(body.products) ? body.products : []

      writeProducts(products)
      sendJson(response, 200, { products })
      return
    }

    if (request.method === 'POST' && url.pathname === '/products') {
      const body = await readBody(request)
      const products = readProducts() ?? []
      const product = productFromPayload(body)

      if (!product.name || !product.description || !product.image) {
        sendJson(response, 400, {
          message: 'Nome, descricao e imagem sao obrigatorios.',
        })
        return
      }

      if (!Number.isFinite(product.price) || product.price <= 0) {
        sendJson(response, 400, { message: 'Preco invalido.' })
        return
      }

      if (!Number.isInteger(product.estoque) || product.estoque < 0) {
        sendJson(response, 400, { message: 'Estoque invalido.' })
        return
      }

      writeProducts([product, ...products])
      sendJson(response, 201, product)
      return
    }

    const productIdMatch = url.pathname.match(/^\/products\/([^/]+)$/)

    if (productIdMatch && request.method === 'PUT') {
      const id = decodeURIComponent(productIdMatch[1])
      const body = await readBody(request)
      const products = readProducts() ?? []
      const index = products.findIndex((product) => product.id === id)

      if (index === -1) {
        sendJson(response, 404, { message: 'Produto nao encontrado.' })
        return
      }

      products[index] = {
        ...products[index],
        name: String(body.name || '').trim(),
        description: String(body.description || '').trim(),
        price: Number(body.price),
        image: String(body.image || ''),
        categoria: String(body.categoria || 'FILAMENTOS'),
        estoque: Number(body.estoque),
        status: body.status || 'DISPONIVEL',
        updatedAt: new Date().toISOString(),
      }

      writeProducts(products)
      sendJson(response, 200, products[index])
      return
    }

    if (productIdMatch && request.method === 'DELETE') {
      const id = decodeURIComponent(productIdMatch[1])
      const products = readProducts() ?? []
      const nextProducts = products.filter((product) => product.id !== id)

      if (nextProducts.length === products.length) {
        sendJson(response, 404, { message: 'Produto nao encontrado.' })
        return
      }

      writeProducts(nextProducts)
      sendJson(response, 200, { ok: true })
      return
    }

    sendJson(response, 404, { message: 'Rota nao encontrada.' })
  } catch (error) {
    sendJson(response, 500, {
      message:
        error instanceof Error
          ? error.message
          : 'Falha inesperada no servidor local.',
    })
  }
})

server.listen(port, '0.0.0.0', () => {
  console.log(`ToffCo local product sync running on http://0.0.0.0:${port}`)
})
