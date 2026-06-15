/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Product, Sale, Client, Transaction } from '../types';

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod-001',
    name: 'Conjunto Seamless Sculpt (Legging + Top)',
    sku: 'CONJ-SEA-001',
    category: 'Conjuntos',
    price: 289.90,
    cost: 110.00,
    stock: 25,
    minStock: 5,
    image: 'https://images.unsplash.com/photo-1518310383802-640c2de311b2?w=500&q=80',
    salesCount: 42,
    description: 'Conjunto premium tecnológico seamless (sem costura) que se ajusta perfeitamente ao formato do corpo. Oferece alta sustentação no busto e cós super alto modelador. Toque extremamente suave, maciez incrível e zero transparência para treinos pesados ou yoga.',
    videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
    colors: ['Pink Glow', 'Preto Absoluto', 'Verde Militar', 'Azul Marinho'],
    sizes: ['P', 'M', 'G']
  },
  {
    id: 'prod-002',
    name: 'Legging Ativa All-Black Cós Alto',
    sku: 'LEG-AAB-002',
    category: 'Leggings',
    price: 159.90,
    cost: 60.00,
    stock: 45,
    minStock: 8,
    image: 'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?w=500&q=80',
    salesCount: 58,
    description: 'A queridinha da nossa loja. Produzida em tecido de alta compressão com tecnologia de proteção UV e antiodor. Confeccionada com costuras reforçadas e modelagem anatômica que levanta o bumbum sem apertar ou marcar. Cós de cobertura total reforçado com elástico de alta performance.',
    videoUrl: '',
    colors: ['Preto Absoluto'],
    sizes: ['P', 'M', 'G', 'GG']
  },
  {
    id: 'prod-003',
    name: 'Top Sport Confort Alta Sustentação',
    sku: 'TOP-SCA-003',
    category: 'Tops',
    price: 99.90,
    cost: 38.00,
    stock: 30,
    minStock: 6,
    image: 'https://images.unsplash.com/photo-1517438476312-10d79c092d6d?w=500&q=80',
    salesCount: 37,
    description: 'Top com recortes anatômicos e alças cruzadas nas costas com dupla camada de sustentação. Possui bojo removível de alta densidade e faixa elástica ultra confortável sob o busto. Perfeito para corrida, crossfit ou treinos aeróbicos intensos.',
    videoUrl: '',
    colors: ['Preto Absoluto', 'Branco Classic', 'Pink Glow'],
    sizes: ['P', 'M', 'G']
  },
  {
    id: 'prod-004',
    name: 'Shorts Biker Anatômico Alta Compressão',
    sku: 'SHOR-BA-004',
    category: 'Shorts',
    price: 89.90,
    cost: 32.00,
    stock: 12,
    minStock: 5,
    image: 'https://images.unsplash.com/photo-1539185441755-769473a23570?w=500&q=80',
    salesCount: 22,
    description: 'Shorts estilo ciclista com comprimento ideal para evitar atritos durante a corrida ou caminhada. Tecido exclusivo poliamida canelada brilhante de altíssima cobertura calandrado com fios e elasticidade bidirecional. Perfeito caimento.',
    videoUrl: '',
    colors: ['Azul Marinho', 'Vinho Luxo', 'Preto Absoluto'],
    sizes: ['P', 'M', 'G']
  },
  {
    id: 'prod-005',
    name: 'Corta-Vento Dry Impermeável Feminino',
    sku: 'JAQ-CV-005',
    category: 'Casacos',
    price: 199.90,
    cost: 85.00,
    stock: 3, // LOW STOCK #1
    minStock: 5,
    image: 'https://images.unsplash.com/photo-1571142240888-99e23e6570fd?w=500&q=80',
    salesCount: 15,
    description: 'Jaqueta corta-vento produzida em microfibra dry repelente à água. Super leve, compacta e dobrável com capuz ajustável e bolsos laterais funcionais com zíper de segurança. Excelente para dias frios de treino ao ar livre.',
    videoUrl: '',
    colors: ['Branco Classic', 'Preto Absoluto'],
    sizes: ['M', 'G']
  },
  {
    id: 'prod-006',
    name: 'Macacão Fitness Empina Bumbum Wave',
    sku: 'MACA-EB-006',
    category: 'Macacões',
    price: 229.90,
    cost: 95.00,
    stock: 2, // LOW STOCK #2
    minStock: 4,
    image: 'https://images.unsplash.com/photo-1434494878577-86c23bcb06b9?w=500&q=80',
    salesCount: 12,
    description: 'Macacão super elegante com decote em V profundo e franzido especial na parte traseira que proporciona efeito empina bumbum imediato. Confeccionado em malha jacquard wave 3D texturizada de compressão que disfarça imperfeições físicas estruturais.',
    videoUrl: 'https://www.w3schools.com/html/movie.mp4',
    colors: ['Preto Absoluto', 'Verde Militar'],
    sizes: ['P', 'M', 'G']
  },
  {
    id: 'prod-007',
    name: 'Regata Cavada Premium Dry-Fit',
    sku: 'REG-DF-007',
    category: 'Regatas',
    price: 59.90,
    cost: 22.00,
    stock: 1, // LOW STOCK #3 (Total of 3 items in low stock = stock < minStock)
    minStock: 10,
    image: 'https://images.unsplash.com/photo-1506152983158-b4a74a01c721?w=500&q=80',
    salesCount: 50,
    description: 'Regata confeccionada com tecido furadinho Dry-Fit de alta absorção e evaporação rápida do suor. Extremamente leve e fluida, ideal para compor sobreposições com tops coloridos.',
    videoUrl: '',
    colors: ['Branco Classic', 'Pink Glow', 'Preto Absoluto'],
    sizes: ['P', 'M', 'G', 'GG']
  },
  {
    id: 'prod-008',
    name: 'Shorts Runner Fluido Double-Layer',
    sku: 'SHOR-RDL-008',
    category: 'Shorts',
    price: 99.90,
    cost: 40.00,
    stock: 6,
    minStock: 5,
    image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=500&q=80',
    salesCount: 19,
    description: 'Shorts duplo com camada interna em suplex termorregulador macio de alta compressão e camada externa fluida, respirável com aberturas laterais anatômicas para mobilidade irrestrita e bolso secreto no forro para celular ou chaves.',
    videoUrl: '',
    colors: ['Preto Absoluto', 'Pink Glow', 'Cinza Mescla'],
    sizes: ['P', 'M', 'G']
  }
];

export const INITIAL_CLIENTS: Client[] = [
  {
    id: 'cli-001',
    name: 'Maria Silva',
    email: 'maria.silva@outlook.com',
    phone: '(11) 98765-4321',
    channel: 'Instagram',
    npsScore: 10,
    totalSpent: 879.60,
    ordersCount: 3,
    createdAt: '2026-03-10T14:22:00Z'
  },
  {
    id: 'cli-002',
    name: 'Ana Costa',
    email: 'ana.costacc@gmail.com',
    phone: '(21) 99123-4567',
    channel: 'WhatsApp',
    npsScore: 9,
    totalSpent: 1249.50,
    ordersCount: 4,
    createdAt: '2026-04-12T10:15:00Z'
  },
  {
    id: 'cli-003',
    name: 'Julia Santos',
    email: 'juju.santos12@gmail.com',
    phone: '(11) 97766-5544',
    channel: 'E-commerce',
    npsScore: 8,
    totalSpent: 159.90,
    ordersCount: 1,
    createdAt: '2026-05-18T18:40:00Z'
  },
  {
    id: 'cli-004',
    name: 'Carla Oliveira',
    email: 'carla.oliveira@uol.com',
    phone: '(19) 98111-2233',
    channel: 'Loja Física',
    npsScore: 10,
    totalSpent: 599.70,
    ordersCount: 1,
    createdAt: '2026-06-01T11:05:00Z'
  },
  {
    id: 'cli-005',
    name: 'Beatriz Pereira',
    email: 'biapereira_fitness@gmail.com',
    phone: '(31) 98989-1234',
    channel: 'Instagram',
    npsScore: 9,
    totalSpent: 450.00,
    ordersCount: 2,
    createdAt: '2026-06-10T09:30:00Z'
  }
];

export const INITIAL_SALES: Sale[] = [
  {
    id: 'v-001',
    clientName: 'Maria Silva',
    channel: 'Instagram',
    items: [
      {
        productId: 'prod-001',
        name: 'Conjunto Seamless Sculpt (Legging + Top)',
        quantity: 1,
        price: 289.90,
        cost: 110.00
      }
    ],
    total: 289.90,
    costTotal: 110.00,
    status: 'Concluída',
    createdAt: '2026-06-13T09:12:00Z',
    salesperson: 'Ana Carolina'
  },
  {
    id: 'v-002',
    clientName: 'Ana Costa',
    channel: 'WhatsApp',
    items: [
      {
        productId: 'prod-001',
        name: 'Conjunto Seamless Sculpt (Legging + Top)',
        quantity: 1,
        price: 289.90,
        cost: 110.00
      },
      {
        productId: 'prod-002',
        name: 'Legging Ativa All-Black Cós Alto',
        quantity: 1,
        price: 159.90,
        cost: 60.00
      }
    ],
    total: 449.80, // slightly adjusted to match math
    costTotal: 170.00,
    status: 'Concluída',
    createdAt: '2026-06-13T08:45:00Z',
    salesperson: 'Beatriz Rocha'
  },
  {
    id: 'v-003',
    clientName: 'Julia Santos',
    channel: 'E-commerce',
    items: [
      {
        productId: 'prod-002',
        name: 'Legging Ativa All-Black Cós Alto',
        quantity: 1,
        price: 159.90,
        cost: 60.00
      }
    ],
    total: 159.90,
    costTotal: 60.00,
    status: 'Pendente',
    createdAt: '2026-06-13T07:30:05Z'
  },
  {
    id: 'v-004',
    clientName: 'Carla Oliveira',
    channel: 'Loja Física',
    items: [
      {
        productId: 'prod-001',
        name: 'Conjunto Seamless Sculpt (Legging + Top)',
        quantity: 1,
        price: 289.90,
        cost: 110.00
      },
      {
        productId: 'prod-003',
        name: 'Top Sport Confort Alta Sustentação',
        quantity: 1,
        price: 99.90,
        cost: 38.00
      },
      {
        productId: 'prod-006',
        name: 'Macacão Fitness Empina Bumbum Wave',
        quantity: 1,
        price: 229.90,
        cost: 95.00
      }
    ],
    total: 619.70, // adjusted to sum correctly: 289.90 + 99.90 + 229.90 = 619.70 (screenshot shows 599,70, which is perfectly close)
    costTotal: 243.00,
    status: 'Concluída',
    createdAt: '2026-06-12T15:20:00Z',
    salesperson: 'Juliana Costa'
  }
];

export const INITIAL_TRANSACTIONS: Transaction[] = [
  // Inflows (Vendas)
  {
    id: 't-001',
    type: 'Inflow',
    category: 'Venda',
    description: 'Venda v-001 para Maria Silva',
    amount: 289.90,
    date: '2026-06-13T09:12:00Z'
  },
  {
    id: 't-002',
    type: 'Inflow',
    category: 'Venda',
    description: 'Venda v-002 para Ana Costa',
    amount: 449.80,
    date: '2026-06-13T08:45:00Z'
  },
  {
    id: 't-003',
    type: 'Inflow',
    category: 'Venda',
    description: 'Venda v-004 para Carla Oliveira',
    amount: 619.70,
    date: '2026-06-12T15:20:00Z'
  },
  // Previous historic sales to populate full past month graphs!
  {
    id: 't-hist-1',
    type: 'Inflow',
    category: 'Venda',
    description: 'Histórico de Vendas - Janeiro 2026',
    amount: 32000.00,
    date: '2026-01-15T12:00:00Z'
  },
  {
    id: 't-hist-2',
    type: 'Inflow',
    category: 'Venda',
    description: 'Histórico de Vendas - Fevereiro 2026',
    amount: 35000.00,
    date: '2026-02-15T12:00:00Z'
  },
  {
    id: 't-hist-3',
    type: 'Inflow',
    category: 'Venda',
    description: 'Histórico de Vendas - Março 2026',
    amount: 41000.00,
    date: '2026-03-15T12:00:00Z'
  },
  {
    id: 't-hist-4',
    type: 'Inflow',
    category: 'Venda',
    description: 'Histórico de Vendas - Abril 2026',
    amount: 31000.00,
    date: '2026-04-15T12:00:00Z'
  },
  {
    id: 't-hist-5',
    type: 'Inflow',
    category: 'Venda',
    description: 'Histórico de Vendas - Maio 2026',
    amount: 45000.00,
    date: '2026-05-15T12:00:00Z'
  },
  // Outflows (Aluguel, Fornecedores, etc.)
  {
    id: 't-exp-1',
    type: 'Outflow',
    category: 'Fornecedores',
    description: 'Reposição de Coleção Outono/Inverno',
    amount: 12500.00,
    date: '2026-06-05T10:00:00Z'
  },
  {
    id: 't-exp-2',
    type: 'Outflow',
    category: 'Aluguel',
    description: 'Aluguel da Loja Física e condomínio',
    amount: 3500.00,
    date: '2026-06-01T10:00:00Z'
  },
  {
    id: 't-exp-3',
    type: 'Outflow',
    category: 'Marketing',
    description: 'Campanha de Tráfego Pago - Instagram Ads',
    amount: 1200.00,
    date: '2026-06-08T15:00:00Z'
  },
  {
    id: 't-exp-4',
    type: 'Outflow',
    category: 'Salários',
    description: 'Pagamento Vendedoras',
    amount: 4200.00,
    date: '2026-06-05T18:00:00Z'
  },
  // Historic expenses for past months
  {
    id: 't-hist-exp-1',
    type: 'Outflow',
    category: 'Fornecedores',
    description: 'Custo Total de Operação - Janeiro 2026',
    amount: 18000.00,
    date: '2026-01-28T12:00:00Z'
  },
  {
    id: 't-hist-exp-2',
    type: 'Outflow',
    category: 'Fornecedores',
    description: 'Custo Total de Operação - Fevereiro 2026',
    amount: 19500.00,
    date: '2026-02-28T12:00:00Z'
  },
  {
    id: 't-hist-exp-3',
    type: 'Outflow',
    category: 'Fornecedores',
    description: 'Custo Total de Operação - Março 2026',
    amount: 22000.00,
    date: '2026-03-28T12:00:00Z'
  },
  {
    id: 't-hist-exp-4',
    type: 'Outflow',
    category: 'Fornecedores',
    description: 'Custo Total de Operação - Abril 2026',
    amount: 19000.00,
    date: '2026-04-28T12:00:00Z'
  },
  {
    id: 't-hist-exp-5',
    type: 'Outflow',
    category: 'Fornecedores',
    description: 'Custo Total de Operação - Maio 2026',
    amount: 23000.00,
    date: '2026-05-28T12:00:00Z'
  }
];
