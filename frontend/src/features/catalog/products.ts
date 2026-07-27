import type { Product } from '../../types/product'

type MockProduct = Omit<Product, 'ativo' | 'createdAt' | 'updatedAt'>

const mockImageBase = '/products/mock'
const stockImageBase = '/products/toffco-stock'

const mockProducts: MockProduct[] = [
  {
    id: 'sku-231010013-pla-rainbow',
    name: 'Masterprint PLA Rainbow 1KG',
    description:
      'MP-FILAMENTO 3D - PLA RAINBOW - 1KG (1.75MM). SKU 231010013. Pedido Maycon: 5 un.',
    price: 60.53,
    image: `${mockImageBase}/pla-milkshake.jpg`,
    categoria: 'FILAMENTOS',
    estoque: 5,
  },
  {
    id: 'sku-231010023-pla-laranja',
    name: 'Masterprint PLA Laranja 1KG',
    description:
      'MP-FILAMENTO 3D - PLA LARANJA - 1KG (1.75MM). SKU 231010023. Pedido Maycon: 6 un.',
    price: 58.8,
    image: `${mockImageBase}/pla-laranja.jpg`,
    categoria: 'FILAMENTOS',
    estoque: 6,
  },
  {
    id: 'sku-231010030-pla-marrom',
    name: 'Masterprint PLA Marrom 1KG',
    description:
      'MP-FILAMENTO 3D - PLA MARROM 1KG (1.75MM). SKU 231010030. Pedidos Bruno: 12 un. e Maycon: 6 un.',
    price: 58.8,
    image: `${mockImageBase}/pla-madeira-masterprint.jpg`,
    categoria: 'FILAMENTOS',
    estoque: 18,
  },
  {
    id: 'sku-231010032-pla-roxo',
    name: 'Masterprint PLA Roxo 1KG',
    description:
      'MP-FILAMENTO 3D - PLA ROXO 1KG (1.75MM). SKU 231010032. Pedido Maycon: 3 un.',
    price: 58.81,
    image: `${mockImageBase}/pla-roxo-glitter.jpg`,
    categoria: 'FILAMENTOS',
    estoque: 3,
  },
  {
    id: 'sku-231010033-pla-roxo-claro',
    name: 'Masterprint PLA Roxo Claro 1KG',
    description:
      'MP-FILAMENTO 3D - PLA ROXO CLARO 1KG (1.75MM). SKU 231010033. Pedido Maycon: 3 un.',
    price: 65.11,
    image: `${mockImageBase}/pla-roxo-glitter.jpg`,
    categoria: 'FILAMENTOS',
    estoque: 3,
  },
  {
    id: 'sku-231010035-pla-fosforescente-natural-azul',
    name: 'Masterprint PLA Fosforescente Natural/Azul 1KG',
    description:
      'MP-FILAMENTO 3D - PLA FOSFORESCENTE NATURAL/AZUL 1KG (1.75MM). SKU 231010035. Pedido Maycon: 6 un.',
    price: 67.42,
    image: `${mockImageBase}/pla-masterprint-ice.jpg`,
    categoria: 'FILAMENTOS',
    estoque: 6,
  },
  {
    id: 'sku-231010042-pla-silk-roxo',
    name: 'Masterprint PLA Silk Roxo 1KG',
    description:
      'MP-FILAMENTO 3D - PLA SILK ROXO 1KG (1.75MM). SKU 231010042. Pedido Bruno: 12 un.',
    price: 45.92,
    image: `${mockImageBase}/pla-roxo-glitter.jpg`,
    categoria: 'FILAMENTOS',
    estoque: 12,
  },
  {
    id: 'sku-231010049-pla-ice-cream',
    name: 'Masterprint PLA Ice Cream 1KG',
    description:
      'MP-FILAMENTO 3D - PLA ICE CREAM 1KG (1.75MM). SKU 231010049. Pedido Maycon: 4 un.',
    price: 58.81,
    image: `${mockImageBase}/pla-masterprint-ice.jpg`,
    categoria: 'FILAMENTOS',
    estoque: 4,
  },
  {
    id: 'sku-231010052-pla-verde-escuro',
    name: 'Masterprint PLA Verde Escuro 1KG',
    description:
      'MP-FILAMENTO 3D - PLA VERDE ESCURO 1KG (1.75MM). SKU 231010052. Pedido Bruno: 12 un.',
    price: 45.92,
    image: `${mockImageBase}/pla-verde-masterprint.jpg`,
    categoria: 'FILAMENTOS',
    estoque: 12,
  },
  {
    id: 'sku-231010053-pla-cafe',
    name: 'Masterprint PLA Cafe 1KG',
    description:
      'MP-FILAMENTO 3D - PLA CAFE 1KG (1.75MM). SKU 231010053. Pedido Maycon: 3 un.',
    price: 58.81,
    image: `${mockImageBase}/pla-madeira-masterprint.jpg`,
    categoria: 'FILAMENTOS',
    estoque: 3,
  },
  {
    id: 'sku-231010054-pla-marrom-escuro',
    name: 'Masterprint PLA Marrom Escuro 1KG',
    description:
      'MP-FILAMENTO 3D - PLA MARROM ESCURO 1KG (1.75MM). SKU 231010054. Pedido Maycon: 4 un.',
    price: 58.81,
    image: `${mockImageBase}/pla-madeira-masterprint.jpg`,
    categoria: 'FILAMENTOS',
    estoque: 4,
  },
  {
    id: 'sku-231010055-pla-fibra-carbono',
    name: 'Masterprint PLA Fibra de Carbono 1KG',
    description:
      'MP-FILAMENTO 3D - PLA FIBRA DE CARBONO 1KG (1.75MM). SKU 231010055. Pedido Maycon: 1 un.',
    price: 84.7,
    image: `${mockImageBase}/abs-preto.jpg`,
    categoria: 'FILAMENTOS',
    estoque: 1,
  },
  {
    id: 'sku-231010056-pla-cinza-metalico',
    name: 'Masterprint PLA Cinza Metalico 1KG',
    description:
      'MP-FILAMENTO 3D - PLA CINZA METALICO 1KG (1.75MM). SKU 231010056. Pedido Maycon: 7 un.',
    price: 65.72,
    image: `${stockImageBase}/fulljoy-pla-metal-silver.jpeg`,
    categoria: 'FILAMENTOS',
    estoque: 7,
  },
  {
    id: 'sku-231010058-pla-silk-azul-lago',
    name: 'Masterprint PLA Silk Azul Lago 1KG',
    description:
      'MP-FILAMENTO 3D - PLA SILK AZUL LAGO 1KG (1.75MM). SKU 231010058. Pedido Maycon: 1 un.',
    price: 58.81,
    image: `${stockImageBase}/fusionx-pla-high-speed-sky-blue.jpeg`,
    categoria: 'FILAMENTOS',
    estoque: 1,
  },
  {
    id: 'sku-231010059-pla-silk-azul-tiffany',
    name: 'Masterprint PLA Silk Azul Tiffany 1KG',
    description:
      'MP-FILAMENTO 3D - PLA SILK AZUL TIFFANY 1KG (1.75MM). SKU 231010059. Pedidos Bruno: 12 un. e Maycon: 3 un.',
    price: 58.81,
    image: `${stockImageBase}/fusionx-pla-high-speed-sea-green.jpeg`,
    categoria: 'FILAMENTOS',
    estoque: 15,
  },
  {
    id: 'sku-231010061-pla-silk-laranja-preto',
    name: 'Masterprint PLA Silk Laranja/Preto 1KG',
    description:
      'MP-FILAMENTO 3D - PLA SILK LARANJA/PRETO 1KG (1.75MM). SKU 231010061. Pedido Maycon: 1 un.',
    price: 65.72,
    image: `${mockImageBase}/pla-silk-dourado.jpg`,
    categoria: 'FILAMENTOS',
    estoque: 1,
  },
  {
    id: 'sku-231010069-pla-peacock-blue',
    name: 'Masterprint PLA Peacock Blue 1KG',
    description:
      'MP-FILAMENTO 3D - PLA PEACOCK BLUE 1KG (1.75MM). SKU 231010069. Pedido Maycon: 2 un.',
    price: 58.81,
    image: `${stockImageBase}/elegoo-pla-silk-blue-purple-black.jpeg`,
    categoria: 'FILAMENTOS',
    estoque: 2,
  },
  {
    id: 'sku-231010070-pla-dragon-fruit',
    name: 'Masterprint PLA Dragon Fruit 1KG',
    description:
      'MP-FILAMENTO 3D - PLA DRAGON FRUIT 1KG (1.75MM). SKU 231010070. Pedido Maycon: 3 un.',
    price: 58.81,
    image: `${mockImageBase}/pla-pink.jpg`,
    categoria: 'FILAMENTOS',
    estoque: 3,
  },
  {
    id: 'sku-231010074-pla-silk-prata-glitter',
    name: 'PLA Silk Prata com Glitter Etiqueta Neutra 1KG',
    description:
      'FILAMENTO 3D - PLA SILK PRATA COM GLITTER ETIQUETA NEUTRA 1KG (1.75MM). SKU 231010074. Pedido Maycon: 7 un.',
    price: 60.5,
    image: `${stockImageBase}/fulljoy-pla-metal-silver.jpeg`,
    categoria: 'FILAMENTOS',
    estoque: 7,
  },
  {
    id: 'sku-231010084-pla-transparente',
    name: 'Masterprint PLA Transparente 1KG',
    description:
      'MP-FILAMENTO 3D - PLA TRANSPARENTE 1KG (1.75MM). SKU 231010084. Pedido Maycon: 1 un.',
    price: 58.81,
    image: `${stockImageBase}/elegoo-pla-translucent.jpeg`,
    categoria: 'FILAMENTOS',
    estoque: 1,
  },
  {
    id: 'sku-231020001-petg',
    name: 'Masterprint PETG 1KG',
    description:
      'MP-FILAMENTO 3D - PETG 1KG (1.75MM). SKU 231020001. Pedido Bruno: 24 un.',
    price: 32.35,
    image: `${mockImageBase}/petg-fusionx-light-green.jpg`,
    categoria: 'FILAMENTOS',
    estoque: 24,
  },
  {
    id: 'sku-231020030-petg-translucido-verde',
    name: 'Masterprint PETG Translucido Verde 1KG',
    description:
      'MP-FILAMENTO 3D - PETG TRANSLUCIDO VERDE 1KG (1.75MM). SKU 231020030. Pedido Maycon: 3 un.',
    price: 41.51,
    image: `${mockImageBase}/petg-fusionx-light-green.jpg`,
    categoria: 'FILAMENTOS',
    estoque: 3,
  },
  {
    id: 'sku-231030003-abs-azul',
    name: 'Masterprint ABS Azul 1KG',
    description:
      'MP-FILAMENTO 3D - ABS AZUL 1KG (1.75MM). SKU 231030003. Pedido Maycon: 3 un.',
    price: 47.71,
    image: `${stockImageBase}/fusionx-pla-high-speed-sky-blue.jpeg`,
    categoria: 'FILAMENTOS',
    estoque: 3,
  },
  {
    id: 'sku-231030007-abs-natural',
    name: 'Masterprint ABS Natural 1KG',
    description:
      'MP-FILAMENTO 3D - ABS NATURAL 1KG (1.75MM). SKU 231030007. Pedido Maycon: 3 un.',
    price: 47.71,
    image: `${mockImageBase}/abs-branco.jpg`,
    categoria: 'FILAMENTOS',
    estoque: 3,
  },
  {
    id: 'sku-231050001-tpu-branco',
    name: 'Masterprint TPU Branco 1KG',
    description:
      'MP-FILAMENTO 3D - TPU BRANCO 1KG (1.75MM). SKU 231050001. Pedido Maycon: 3 un.',
    price: 78.72,
    image: `${mockImageBase}/tpu-branco.jpg`,
    categoria: 'FILAMENTOS',
    estoque: 3,
  },
  {
    id: 'sku-231050003-tpu-cinza',
    name: 'Masterprint TPU Cinza 1KG',
    description:
      'MP-FILAMENTO 3D - TPU CINZA 1KG (1.75MM). SKU 231050003. Pedido Maycon: 3 un.',
    price: 78.72,
    image: `${stockImageBase}/fusionx-pla-matte-gray.jpeg`,
    categoria: 'FILAMENTOS',
    estoque: 3,
  },
  {
    id: 'sku-231050004-tpu-natural-transparente',
    name: 'Masterprint TPU Natural Transparente 1KG',
    description:
      'MP-FILAMENTO 3D - TPU NATURAL TRANSPARENTE 1KG (1.75MM). SKU 231050004. Pedido Maycon: 3 un.',
    price: 78.72,
    image: `${stockImageBase}/elegoo-pla-translucent.jpeg`,
    categoria: 'FILAMENTOS',
    estoque: 3,
  },
  {
    id: 'fusionx-pla-high-speed-sea-green',
    name: 'FusionX PLA High Speed Sea Green 1KG',
    description:
      'Filamento FusionX PLA High Speed Sea Green 1KG (1.75MM). Quantidade do print: 5 un.',
    price: 110,
    image: `${stockImageBase}/fusionx-pla-high-speed-sea-green.jpeg`,
    categoria: 'FILAMENTOS',
    estoque: 5,
  },
  {
    id: 'fusionx-pla-high-speed-sky-blue',
    name: 'FusionX PLA High Speed Sky Blue 1KG',
    description:
      'Filamento FusionX PLA High Speed Sky Blue 1KG (1.75MM). Quantidade do print: 5 un.',
    price: 110,
    image: `${stockImageBase}/fusionx-pla-high-speed-sky-blue.jpeg`,
    categoria: 'FILAMENTOS',
    estoque: 5,
  },
  {
    id: 'fusionx-pla-high-speed-marble-white',
    name: 'FusionX PLA High Speed Marble White 1KG',
    description:
      'Filamento FusionX PLA High Speed Marble White 1KG (1.75MM). Quantidade do print: 5 un.',
    price: 110,
    image: `${stockImageBase}/fusionx-pla-high-speed-marble-white.jpeg`,
    categoria: 'FILAMENTOS',
    estoque: 5,
  },
  {
    id: 'fusionx-pla-matte-light-gray',
    name: 'FusionX PLA Matte Light Gray 1KG',
    description:
      'Filamento FusionX PLA Matte Light Gray 1KG (1.75MM). Quantidade do print: 3 un.',
    price: 110,
    image: `${stockImageBase}/fusionx-pla-matte-light-gray.jpeg`,
    categoria: 'FILAMENTOS',
    estoque: 3,
  },
  {
    id: 'fusionx-pla-matte-moss-green',
    name: 'FusionX PLA Matte Moss Green 1KG',
    description:
      'Filamento FusionX PLA Matte Moss Green 1KG (1.75MM). Quantidade do print: 10 un.',
    price: 110,
    image: `${stockImageBase}/fusionx-pla-matte-moss-green.jpeg`,
    categoria: 'FILAMENTOS',
    estoque: 10,
  },
  {
    id: 'fusionx-pla-matte-gray',
    name: 'FusionX PLA Matte Gray 1KG',
    description:
      'Filamento FusionX PLA Matte Gray 1KG (1.75MM). Quantidade do print: 1 un.',
    price: 110,
    image: `${stockImageBase}/fusionx-pla-matte-gray.jpeg`,
    categoria: 'FILAMENTOS',
    estoque: 1,
  },
  {
    id: 'fusionx-pla-matte-dark-gray',
    name: 'FusionX PLA Matte Dark Gray 1KG',
    description:
      'Filamento FusionX PLA Matte Dark Gray 1KG (1.75MM). Quantidade do print: 3 un.',
    price: 110,
    image: `${stockImageBase}/fusionx-pla-matte-dark-gray.jpeg`,
    categoria: 'FILAMENTOS',
    estoque: 3,
  },
  {
    id: 'fusionx-pla-ultra-silk-blue',
    name: 'FusionX PLA Ultra Silk Azul 1KG',
    description:
      'Filamento FusionX PLA Ultra Silk Azul 1KG (1.75MM). Quantidade do print: 5 un.',
    price: 125,
    image: `${stockImageBase}/fusionx-pla-high-speed-sky-blue.jpeg`,
    categoria: 'FILAMENTOS',
    estoque: 5,
  },
  {
    id: 'fusionx-pla-ultra-silk-green',
    name: 'FusionX PLA Ultra Silk Verde 1KG',
    description:
      'Filamento FusionX PLA Ultra Silk Verde 1KG (1.75MM). Quantidade do print: 5 un.',
    price: 125,
    image: `${stockImageBase}/fusionx-pla-high-speed-sea-green.jpeg`,
    categoria: 'FILAMENTOS',
    estoque: 5,
  },
  {
    id: 'fusionx-pla-ultra-silk-gold',
    name: 'FusionX PLA Ultra Silk Dourado 1KG',
    description:
      'Filamento FusionX PLA Ultra Silk Dourado 1KG (1.75MM). Quantidade do print: 5 un.',
    price: 125,
    image: `${mockImageBase}/pla-silk-dourado.jpg`,
    categoria: 'FILAMENTOS',
    estoque: 5,
  },
  {
    id: 'elegoo-pla-translucent',
    name: 'Elegoo PLA Translucent 1KG',
    description:
      'Filamento Elegoo PLA Translucent 1KG (1.75MM). Quantidade do print: 5 un.',
    price: 120,
    image: `${stockImageBase}/elegoo-pla-translucent.jpeg`,
    categoria: 'FILAMENTOS',
    estoque: 5,
  },
  {
    id: 'elegoo-pla-silk-blue-purple-black',
    name: 'Elegoo PLA Silk Blue Purple Black 1KG',
    description:
      'Filamento Elegoo PLA Silk Blue Purple Black 1KG (1.75MM). Quantidade do print: 5 un.',
    price: 125,
    image: `${stockImageBase}/elegoo-pla-silk-blue-purple-black.jpeg`,
    categoria: 'FILAMENTOS',
    estoque: 5,
  },
  {
    id: 'elegoo-pla-silk-red',
    name: 'Elegoo PLA Silk Red 1KG',
    description:
      'Filamento Elegoo PLA Silk Red 1KG (1.75MM). Quantidade do print: 5 un.',
    price: 125,
    image: `${stockImageBase}/elegoo-pla-silk-red.jpeg`,
    categoria: 'FILAMENTOS',
    estoque: 5,
  },
  {
    id: 'tinmorry-pla-silk-red',
    name: 'Tinmorry PLA Silk Red 1KG',
    description:
      'Filamento Tinmorry PLA Silk Red 1KG (1.75MM). Quantidade do print: 5 un.',
    price: 125,
    image: `${stockImageBase}/tinmorry-pla-silk-red.jpeg`,
    categoria: 'FILAMENTOS',
    estoque: 5,
  },
  {
    id: 'fulljoy-pla-metal-radiant-rose-red',
    name: 'Fulljoy PLA+ Metal Radiant Rose Red 1KG',
    description:
      'Filamento Fulljoy PLA+ Metal Radiant Rose Red 1KG (1.75MM). Quantidade do print: 5 un.',
    price: 125,
    image: `${stockImageBase}/fulljoy-pla-metal-radiant-rose-red.jpeg`,
    categoria: 'FILAMENTOS',
    estoque: 5,
  },
  {
    id: 'fulljoy-pla-metal-iron-green',
    name: 'Fulljoy PLA+ Metal Iron Green 1KG',
    description:
      'Filamento Fulljoy PLA+ Metal Iron Green 1KG (1.75MM). Quantidade do print: 5 un.',
    price: 125,
    image: `${stockImageBase}/fulljoy-pla-metal-iron-green.jpeg`,
    categoria: 'FILAMENTOS',
    estoque: 5,
  },
  {
    id: 'fulljoy-pla-metal-midnight-blue',
    name: 'Fulljoy PLA+ Metal Midnight Blue 1KG',
    description:
      'Filamento Fulljoy PLA+ Metal Midnight Blue 1KG (1.75MM). Quantidade do print: 5 un.',
    price: 125,
    image: `${stockImageBase}/fulljoy-pla-metal-midnight-blue.jpeg`,
    categoria: 'FILAMENTOS',
    estoque: 5,
  },
  {
    id: 'fulljoy-pla-metal-pearl-white',
    name: 'Fulljoy PLA+ Metal Pearl White 1KG',
    description:
      'Filamento Fulljoy PLA+ Metal Pearl White 1KG (1.75MM). Quantidade do print: 5 un.',
    price: 125,
    image: `${stockImageBase}/fulljoy-pla-metal-pearl-white.jpeg`,
    categoria: 'FILAMENTOS',
    estoque: 5,
  },
  {
    id: 'fulljoy-pla-metal-silver',
    name: 'Fulljoy PLA+ Metal Silver 1KG',
    description:
      'Filamento Fulljoy PLA+ Metal Silver 1KG (1.75MM). Quantidade do print: 5 un.',
    price: 125,
    image: `${stockImageBase}/fulljoy-pla-metal-silver.jpeg`,
    categoria: 'FILAMENTOS',
    estoque: 5,
  },
  {
    id: 'fulljoy-pla-metal-titanium',
    name: 'Fulljoy PLA+ Metal Titanium 1KG',
    description:
      'Filamento Fulljoy PLA+ Metal Titanium 1KG (1.75MM). Quantidade do print: 5 un.',
    price: 125,
    image: `${stockImageBase}/fulljoy-pla-metal-titanium.jpeg`,
    categoria: 'FILAMENTOS',
    estoque: 5,
  },
  {
    id: 'fulljoy-pla-mech-grey',
    name: 'Fulljoy PLA+ Mech Grey 1KG',
    description:
      'Filamento Fulljoy PLA+ Mech Grey 1KG (1.75MM). Quantidade do print: 5 un.',
    price: 125,
    image: `${stockImageBase}/fulljoy-pla-mech-grey.jpeg`,
    categoria: 'FILAMENTOS',
    estoque: 5,
  },
]

const legacyProducts: MockProduct[] = [
  {
    id: 'mock-abs-branco',
    name: 'ABS BRANCO',
    description: 'Filamento ABS branco para impressao 3D.',
    price: 85,
    image: `${mockImageBase}/abs-branco.jpg`,
    categoria: 'FILAMENTOS',
    estoque: 0,
    status: 'SEM_ESTOQUE',
    statusMessage: 'Sem estoque no momento. Botao bloqueado ate reposicao.',
  },
  {
    id: 'mock-abs-preto',
    name: 'ABS PRETO',
    description: 'Filamento ABS preto Masterprint.',
    price: 85,
    image: `${mockImageBase}/abs-preto.jpg`,
    categoria: 'FILAMENTOS',
    estoque: 1,
    status: 'EM_PRODUCAO',
    statusMessage: 'Em producao para reposicao.',
  },
  {
    id: 'mock-petg-masterprint-rosa',
    name: 'PETG MASTERPRINT ROSA',
    description: 'Filamento PETG Masterprint rosa.',
    price: 85,
    image: `${mockImageBase}/petg-masterprint-rosa.jpg`,
    categoria: 'FILAMENTOS',
    estoque: 1,
  },
  {
    id: 'mock-petg-verde-masterprint',
    name: 'PETG VERDE MASTERPRINT',
    description: 'Filamento PETG verde Masterprint.',
    price: 85,
    image: `${mockImageBase}/petg-verde-masterprint.jpg`,
    categoria: 'FILAMENTOS',
    estoque: 1,
  },
  {
    id: 'mock-petg-vermelho-masterprint',
    name: 'PETG VERMELHO MASTERPRINT',
    description: 'Filamento PETG vermelho Masterprint.',
    price: 85,
    image: `${mockImageBase}/petg-vermelho-masterprint.jpg`,
    categoria: 'FILAMENTOS',
    estoque: 1,
  },
  {
    id: 'mock-petg-madeira-masterprint',
    name: 'PETG MADEIRA MASTERPRINT',
    description: 'Filamento PETG madeira Masterprint.',
    price: 85,
    image: `${mockImageBase}/petg-madeira-masterprint.jpg`,
    categoria: 'FILAMENTOS',
    estoque: 1,
  },
  {
    id: 'mock-petg-masterprint-skin',
    name: 'PETG MASTERPRINT SKIN',
    description: 'Filamento PETG Masterprint cor de pele.',
    price: 85,
    image: `${mockImageBase}/petg-masterprint-skin.jpg`,
    categoria: 'FILAMENTOS',
    estoque: 1,
  },
  {
    id: 'mock-petg-masterprint-laranja',
    name: 'PETG MASTERPRINT LARANJA',
    description: 'Filamento PETG Masterprint laranja.',
    price: 85,
    image: `${mockImageBase}/petg-masterprint-laranja.jpg`,
    categoria: 'FILAMENTOS',
    estoque: 1,
  },
  {
    id: 'mock-petg-fusionx-skin',
    name: 'PETG FUSIONX SKIN',
    description: 'Filamento PETG FusionX cor de pele.',
    price: 90,
    image: `${mockImageBase}/petg-fusionx-skin.jpg`,
    categoria: 'FILAMENTOS',
    estoque: 1,
  },
  {
    id: 'mock-petg-fusionx-amarelo',
    name: 'PETG FUSIONX AMARELO',
    description: 'Filamento PETG FusionX amarelo.',
    price: 90,
    image: `${mockImageBase}/petg-fusionx-amarelo.jpg`,
    categoria: 'FILAMENTOS',
    estoque: 1,
  },
  {
    id: 'mock-petg-fusionx-light-green',
    name: 'PETG FUSIONX LIGHT GREEN',
    description: 'Filamento PETG FusionX verde claro.',
    price: 90,
    image: `${mockImageBase}/petg-fusionx-light-green.jpg`,
    categoria: 'FILAMENTOS',
    estoque: 1,
  },
  {
    id: 'mock-petg-masterprint-dourado',
    name: 'PETG MASTERPRINT DOURADO',
    description: 'Filamento PETG Masterprint dourado.',
    price: 90,
    image: `${mockImageBase}/petg-masterprint-dourado.jpg`,
    categoria: 'FILAMENTOS',
    estoque: 1,
  },
  {
    id: 'mock-pla-amarelo-masterprint',
    name: 'PLA AMARELO MASTERPRINT',
    description: 'Filamento PLA amarelo Masterprint.',
    price: 95,
    image: `${mockImageBase}/pla-amarelo-masterprint.jpg`,
    categoria: 'FILAMENTOS',
    estoque: 1,
  },
  {
    id: 'mock-pla-verde-masterprint',
    name: 'PLA VERDE MASTERPRINT',
    description: 'Filamento PLA verde Masterprint.',
    price: 95,
    image: `${mockImageBase}/pla-verde-masterprint.jpg`,
    categoria: 'FILAMENTOS',
    estoque: 1,
  },
  {
    id: 'mock-pla-skin-masterprint',
    name: 'PLA SKIN MASTERPRINT',
    description: 'Filamento PLA Skin Masterprint.',
    price: 95,
    image: `${mockImageBase}/pla-skin-masterprint.jpg`,
    categoria: 'FILAMENTOS',
    estoque: 1,
  },
  {
    id: 'mock-pla-vermelho-masterprint',
    name: 'PLA VERMELHO MASTERPRINT',
    description: 'Filamento PLA vermelho Masterprint.',
    price: 95,
    image: `${mockImageBase}/pla-vermelho-masterprint.jpg`,
    categoria: 'FILAMENTOS',
    estoque: 1,
  },
  {
    id: 'mock-pla-masterprint-ice',
    name: 'PLA MASTERPRINT ICE',
    description: 'Filamento PLA Masterprint Ice.',
    price: 95,
    image: `${mockImageBase}/pla-masterprint-ice.jpg`,
    categoria: 'FILAMENTOS',
    estoque: 1,
  },
  {
    id: 'mock-pla-madeira-masterprint',
    name: 'PLA MADEIRA MASTERPRINT',
    description: 'Filamento PLA madeira Masterprint.',
    price: 95,
    image: `${mockImageBase}/pla-madeira-masterprint.jpg`,
    categoria: 'FILAMENTOS',
    estoque: 1,
  },
  {
    id: 'mock-pla-roxo-glitter',
    name: 'PLA ROXO C/ GLITTER',
    description: 'Filamento PLA roxo com glitter.',
    price: 100,
    image: `${mockImageBase}/pla-roxo-glitter.jpg`,
    categoria: 'FILAMENTOS',
    estoque: 1,
  },
  {
    id: 'mock-pla-elegoo-laranja',
    name: 'PLA ELEGOO LARANJA',
    description: 'Filamento PLA Elegoo laranja.',
    price: 110,
    image: `${mockImageBase}/pla-elegoo-laranja.jpg`,
    categoria: 'FILAMENTOS',
    estoque: 1,
  },
  {
    id: 'mock-pla-elegoo-azul',
    name: 'PLA ELEGOO AZUL',
    description: 'Filamento PLA Elegoo azul.',
    price: 110,
    image: `${mockImageBase}/pla-elegoo-azul.jpg`,
    categoria: 'FILAMENTOS',
    estoque: 1,
  },
  {
    id: 'mock-pla-elegoo-branco',
    name: 'PLA ELEGOO BRANCO',
    description: 'Filamento PLA Elegoo branco.',
    price: 110,
    image: `${mockImageBase}/pla-elegoo-branco.jpg`,
    categoria: 'FILAMENTOS',
    estoque: 1,
  },
  {
    id: 'mock-pla-elegoo-verde',
    name: 'PLA ELEGOO VERDE',
    description: 'Filamento PLA Elegoo verde.',
    price: 110,
    image: `${mockImageBase}/pla-elegoo-verde.jpg`,
    categoria: 'FILAMENTOS',
    estoque: 1,
  },
  {
    id: 'mock-pla-elegoo-amarelo',
    name: 'PLA ELEGOO AMARELO',
    description: 'Filamento PLA Elegoo amarelo.',
    price: 110,
    image: `${mockImageBase}/pla-elegoo-amarelo.jpg`,
    categoria: 'FILAMENTOS',
    estoque: 1,
  },
  {
    id: 'mock-pla-elegoo-vermelho',
    name: 'PLA ELEGOO VERMELHO',
    description: 'Filamento PLA Elegoo vermelho.',
    price: 110,
    image: `${mockImageBase}/pla-elegoo-vermelho.jpg`,
    categoria: 'FILAMENTOS',
    estoque: 1,
  },
  {
    id: 'mock-pla-milkshake',
    name: 'PLA MILKSHAKE',
    description: 'Filamento PLA Milkshake.',
    price: 110,
    image: `${mockImageBase}/pla-milkshake.jpg`,
    categoria: 'FILAMENTOS',
    estoque: 1,
  },
  {
    id: 'mock-pla-branco',
    name: 'PLA BRANCO',
    description: 'Filamento PLA branco.',
    price: 110,
    image: `${mockImageBase}/pla-branco.jpg`,
    categoria: 'FILAMENTOS',
    estoque: 1,
  },
  {
    id: 'mock-pla-verde-mar',
    name: 'PLA VERDE MAR',
    description: 'Filamento PLA verde mar.',
    price: 110,
    image: `${mockImageBase}/pla-verde-mar.jpg`,
    categoria: 'FILAMENTOS',
    estoque: 1,
  },
  {
    id: 'mock-pla-vermelho',
    name: 'PLA VERMELHO',
    description: 'Filamento PLA vermelho.',
    price: 110,
    image: `${mockImageBase}/pla-vermelho.jpg`,
    categoria: 'FILAMENTOS',
    estoque: 1,
  },
  {
    id: 'mock-pla-rosa',
    name: 'PLA ROSA',
    description: 'Filamento PLA rosa.',
    price: 110,
    image: `${mockImageBase}/pla-rosa.jpg`,
    categoria: 'FILAMENTOS',
    estoque: 1,
  },
  {
    id: 'mock-pla-rosa-claro',
    name: 'PLA ROSA CLARO',
    description: 'Filamento PLA rosa claro.',
    price: 110,
    image: `${mockImageBase}/pla-rosa-claro.jpg`,
    categoria: 'FILAMENTOS',
    estoque: 1,
  },
  {
    id: 'mock-pla-pink',
    name: 'PLA PINK',
    description: 'Filamento PLA pink.',
    price: 110,
    image: `${mockImageBase}/pla-pink.jpg`,
    categoria: 'FILAMENTOS',
    estoque: 1,
  },
  {
    id: 'mock-pla-amarelo',
    name: 'PLA AMARELO',
    description: 'Filamento PLA amarelo.',
    price: 110,
    image: `${mockImageBase}/pla-amarelo.jpg`,
    categoria: 'FILAMENTOS',
    estoque: 1,
  },
  {
    id: 'mock-pla-matte-coccinellin',
    name: 'PLA MATTE COCCINELLIN',
    description: 'Filamento PLA matte Coccinellin.',
    price: 110,
    image: `${mockImageBase}/pla-matte-coccinellin.jpg`,
    categoria: 'FILAMENTOS',
    estoque: 1,
  },
  {
    id: 'mock-pla-translucido-laranja',
    name: 'PLA TRANSLUCIDO LARANJA',
    description: 'Filamento PLA translucido laranja.',
    price: 120,
    image: `${mockImageBase}/pla-translucido-laranja.jpg`,
    categoria: 'FILAMENTOS',
    estoque: 1,
  },
  {
    id: 'mock-pla-silk-dourado',
    name: 'PLA SILK DOURADO',
    description: 'Filamento PLA Silk dourado.',
    price: 125,
    image: `${mockImageBase}/pla-silk-dourado.jpg`,
    categoria: 'FILAMENTOS',
    estoque: 1,
  },
  {
    id: 'mock-pla-silk-verde-outlet',
    name: 'PLA SILK VERDE OUTLET',
    description: 'Filamento PLA Silk verde outlet.',
    price: 125,
    image: `${mockImageBase}/pla-silk-verde-outlet.jpg`,
    categoria: 'FILAMENTOS',
    estoque: 1,
  },
  {
    id: 'mock-protetor-silicone-a1',
    name: 'Protetor Silicone A1 e A1 MINI',
    description: 'Protetor de silicone caution hot para Bambu Lab A1 e A1 Mini.',
    price: 10,
    image: `${mockImageBase}/protetor-silicone-a1.jpg`,
    categoria: 'PECAS',
    estoque: 1,
  },
  {
    id: 'mock-bico-06-a1-mini',
    name: 'Bico 0.6 A1 e A1 MINI',
    description: 'Bico 0.6 para Bambu Lab A1 e A1 Mini.',
    price: 28,
    image: `${mockImageBase}/bico-06-a1-mini.jpg`,
    categoria: 'PECAS',
    estoque: 1,
  },
  {
    id: 'mock-hub-ams-a1-mini',
    name: 'HUB AMS A1 e A1 MINI',
    description: 'Hub adaptador AMS para Bambu Lab A1 e A1 Mini.',
    price: 70,
    image: `${mockImageBase}/hub-ams-a1-mini.jpg`,
    categoria: 'PECAS',
    estoque: 1,
  },
  {
    id: 'mock-kit-hotend-bico-04-a1',
    name: 'Kit Hotend c/ bico 0.4 A1',
    description: 'Kit hotend completo com bico 0.4 para Bambu Lab A1.',
    price: 80,
    image: `${mockImageBase}/kit-hotend-bico-04-a1.jpg`,
    categoria: 'PECAS',
    estoque: 1,
  },
  {
    id: 'mock-kit-hotend-bico-02-a1',
    name: 'Kit Hotend c/ bico 0.2 A1',
    description: 'Kit hotend com bico 0.2 para Bambu Lab A1.',
    price: 80,
    image: `${mockImageBase}/kit-hotend-bico-02-a1.jpg`,
    categoria: 'PECAS',
    estoque: 1,
  },
  {
    id: 'mock-lubrificante-m3d-5ml',
    name: 'Lubrificante M3D 5ml',
    description: 'Lubrificante M3D para manutencao de impressoras 3D.',
    price: 80,
    image: `${mockImageBase}/lubrificante-m3d-5ml.jpg`,
    categoria: 'PECAS',
    estoque: 1,
  },
  {
    id: 'mock-placa-pei-a1-mini',
    name: 'Placa Pei A1 Mini',
    description: 'Placa PEI texturizada para Bambu Lab A1 Mini.',
    price: 90,
    image: `${mockImageBase}/placa-pei-a1-mini.jpg`,
    categoria: 'PECAS',
    estoque: 1,
  },
  {
    id: 'mock-placa-smooth-peo-pet',
    name: 'Placa Smooth PEO/PET',
    description: 'Placa dupla PET smooth e PEO smooth para impressao 3D.',
    price: 100,
    image: `${mockImageBase}/placa-smooth-peo-pet.jpg`,
    categoria: 'PECAS',
    estoque: 1,
  },
  {
    id: 'mock-placa-pei-a1',
    name: 'Placa Pei A1',
    description: 'Placa PEI texturizada dupla face para Bambu Lab A1.',
    price: 130,
    image: `${mockImageBase}/placa-pei-a1.jpg`,
    categoria: 'PECAS',
    estoque: 1,
  },
  {
    id: 'mock-placa-fria-a1-mini',
    name: 'Placa Fria A1 Mini',
    description: 'Placa fria para Bambu Lab A1 Mini com baixa temperatura.',
    price: 135,
    image: `${mockImageBase}/placa-fria-a1-mini.jpg`,
    categoria: 'PECAS',
    estoque: 1,
  },
  {
    id: 'mock-hotend-aquecimento-a1',
    name: 'Hotend Aquecimento A1',
    description: 'Hotend de aquecimento para Bambu Lab A1.',
    price: 140,
    image: `${mockImageBase}/hotend-aquecimento-a1.jpg`,
    categoria: 'PECAS',
    estoque: 1,
  },
  {
    id: 'mock-bambu-lab-a1-mini',
    name: 'BAMBU LAB A1 MINI',
    description: 'Impressora 3D Bambu Lab A1 Mini por encomenda.',
    price: 2400,
    image: `${mockImageBase}/bambu-lab-a1-mini.jpg`,
    categoria: 'IMPRESSORAS',
    estoque: 0,
    status: 'EM_BREVE',
    availableAt: '2026-07-15',
  },
  {
    id: 'mock-bambu-lab-a1',
    name: 'BAMBU LAB A1',
    description: 'Impressora 3D Bambu Lab A1 por encomenda.',
    price: 3380,
    image: `${mockImageBase}/bambu-lab-a1.jpg`,
    categoria: 'IMPRESSORAS',
    estoque: 1,
  },
  {
    id: 'mock-bambu-lab-a1-mini-combo',
    name: 'BAMBU LAB A1 MINI COMBO',
    description: 'Impressora 3D Bambu Lab A1 Mini Combo por encomenda.',
    price: 4020,
    image: `${mockImageBase}/bambu-lab-a1-mini-combo.jpg`,
    categoria: 'IMPRESSORAS',
    estoque: 1,
  },
  {
    id: 'mock-bambu-lab-a1-combo',
    name: 'BAMBU LAB A1 COMBO',
    description: 'Impressora 3D Bambu Lab A1 Combo por encomenda.',
    price: 4990,
    image: `${mockImageBase}/bambu-lab-a1-combo.jpg`,
    categoria: 'IMPRESSORAS',
    estoque: 0,
    status: 'EM_BREVE',
    statusMessage: 'Em breve no catalogo.',
  },
]

const legacyProductsReplacedByNew = new Set([
  'mock-pla-laranja',
  'mock-tpu-branco',
])

const catalogProducts = [
  ...legacyProducts.filter(
    (product) => !legacyProductsReplacedByNew.has(product.id),
  ),
  ...mockProducts,
]

function getPublicFilamentType(productName: string) {
  const normalizedName = productName
    .replace(/\b(Masterprint|FusionX|Elegoo|Tinmorry|Fulljoy)\b/gi, '')
    .replace(/\s+/g, ' ')
    .trim()

  return normalizedName || productName
}

function getPublicDescription(product: MockProduct) {
  const shouldRewriteDescription =
    product.id.startsWith('sku-') ||
    product.description.includes('Quantidade do print')

  if (!shouldRewriteDescription) {
    return product.description
  }

  return `Tipo: ${getPublicFilamentType(product.name)}. Quantidade: ${
    product.estoque
  } un.`
}

function normalizeCatalogText(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase()
}

const masterprintPricesBySku = new Map([
  ['231010013', 110],
  ['231010023', 100],
  ['231010030', 100],
  ['231010032', 100],
  ['231010033', 100],
  ['231010035', 105],
  ['231010042', 105],
  ['231010049', 100],
  ['231010052', 100],
  ['231010053', 100],
  ['231010054', 100],
  ['231010055', 150],
  ['231010056', 105],
  ['231010058', 105],
  ['231010059', 105],
  ['231010061', 110],
  ['231010069', 100],
  ['231010070', 100],
  ['231010074', 110],
  ['231010084', 100],
  ['231020001', 90],
  ['231020030', 95],
  ['231030003', 95],
  ['231030007', 95],
  ['231050001', 140],
  ['231050003', 140],
  ['231050004', 140],
])

function getLegacyMasterprintPrice(product: MockProduct) {
  const text = normalizeCatalogText(product.name)

  if (text === 'ABS BRANCO' || text === 'ABS PRETO') {
    return 95
  }

  if (
    text.includes('PETG MASTERPRINT ROSA') ||
    text.includes('PETG VERDE MASTERPRINT') ||
    text.includes('PETG VERMELHO MASTERPRINT') ||
    text.includes('PETG MADEIRA MASTERPRINT') ||
    text.includes('PETG MASTERPRINT SKIN') ||
    text.includes('PETG MASTERPRINT LARANJA') ||
    text.includes('PETG MASTERPRINT DOURADO')
  ) {
    return 90
  }

  if (
    text.includes('PLA AMARELO MASTERPRINT') ||
    text.includes('PLA VERDE MASTERPRINT') ||
    text.includes('PLA SKIN MASTERPRINT') ||
    text.includes('PLA VERMELHO MASTERPRINT') ||
    text.includes('PLA MASTERPRINT ICE') ||
    text.includes('PLA MADEIRA MASTERPRINT')
  ) {
    return 100
  }

  if (text.includes('PLA ROXO C/ GLITTER')) {
    return 105
  }

  if (
    text === 'PLA BRANCO' ||
    text === 'PLA VERMELHO' ||
    text === 'PLA ROSA' ||
    text === 'PLA ROSA CLARO' ||
    text === 'PLA AMARELO'
  ) {
    return 100
  }

  if (
    text.includes('PLA SILK DOURADO') ||
    text.includes('PLA SILK VERDE OUTLET')
  ) {
    return 105
  }

  return null
}

function getMasterprintTablePrice(product: MockProduct) {
  const sku = product.description.match(/SKU (\d+)/)?.[1]
  const priceBySku = sku ? masterprintPricesBySku.get(sku) : undefined

  return priceBySku ?? getLegacyMasterprintPrice(product)
}

function getLaunchPrice(product: MockProduct) {
  const text = normalizeCatalogText(`${product.name} ${product.description}`)
  const masterprintPrice = getMasterprintTablePrice(product)

  if (masterprintPrice !== null) {
    return masterprintPrice
  }

  if (text.includes('FUSIONX')) {
    return text.includes('MARBLE') || text.includes('MARMORE') ? 130 : 110
  }

  if (text.includes('TINMORRY') || text.includes('TINMORY')) {
    return 130
  }

  if (text.includes('ELEGOO')) {
    return text.includes('TRANSPARENT') ||
      text.includes('TRANSPARENTE') ||
      text.includes('TRANSLUCENT') ||
      text.includes('TRANSLUCIDO')
      ? 115
      : 125
  }

  if (text.includes('FULLJOY')) {
    if (text.includes('METAL')) {
      return 125
    }

    if (text.includes('PLA+')) {
      return 115
    }
  }

  return product.price
}

function isLaunchPresaleProduct(product: MockProduct) {
  return (
    product.id.startsWith('sku-') ||
    product.description.includes('Quantidade do print')
  )
}

function getLaunchStatus(product: MockProduct): Product['status'] | undefined {
  return isLaunchPresaleProduct(product) ? 'PRE_VENDA' : product.status
}

export const products: Product[] = catalogProducts.map((product) => ({
  ...product,
  price: getLaunchPrice(product),
  description: getPublicDescription(product),
  ativo: true,
  status: getLaunchStatus(product),
  statusMessage: isLaunchPresaleProduct(product)
    ? 'Produto em pré-venda. Fale com o atendente para reservar.'
    : product.statusMessage,
  createdAt: '2026-07-03T00:00:00',
  updatedAt: '2026-07-03T00:00:00',
}))
