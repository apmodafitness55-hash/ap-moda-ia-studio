/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export enum ActiveTab {
  DASHBOARD = 'DASHBOARD',
  DASHBOARD_EXECUTIVO = 'DASHBOARD_EXECUTIVO',
  GOOGLE_WORKSPACE = 'GOOGLE_WORKSPACE', // Integrações do Google Workspace (Tarefas, Docs, Agenda, Gmail, Planilhas, Drive)
  VENDAS = 'VENDAS', // Aba específica para histórico e gestão de vendas
  PDV = 'PDV', // Ponto de Venda / Registro de Vendas
  PEDIDOS = 'PEDIDOS', // Pedidos Online, Logística e Trocas
  PRODUTOS = 'PRODUTOS', // Catálogo, Estoque, Combos e Fornecedores
  FORNECEDORES = 'FORNECEDORES', // Cadastro de Fornecedores e Vínculo de Compras
  CLIENTES = 'CLIENTES', // CRM, Funil de Vendas e Follow-ups
  FINANCEIRO = 'FINANCEIRO', // Caixa, Contas a Pagar/Receber e Fiscal NFC-e
  LOJA_ONLINE = 'LOJA_ONLINE', // Loja Online, Vitrine e Cupons
  CONFIGURACOES = 'CONFIGURACOES', // Supabase, Webhooks, ImgBB, Auditoria e Usuários
  METODOS_PAGAMENTO = 'METODOS_PAGAMENTO', // Configuração de Métodos de Pagamento da Vitrine
  AGENTES_IA = 'AGENTES_IA', // Agentes e Assistentes de IA
  METAS = 'METAS', // Simulador de Metas de Vendas
}

export type SalesChannel = 'Instagram' | 'WhatsApp' | 'E-commerce' | 'Loja Física' | 'Outros';

export interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  price: number;
  cost: number;
  stock: number;
  minStock: number;
  image: string;
  images?: string[];
  salesCount: number;
  description?: string;
  videoUrl?: string;
  colors?: string[];
  sizes?: string[];
}

export interface SaleItem {
  productId: string;
  name: string;
  quantity: number;
  price: number;
  cost: number;
}

export interface Sale {
  id: string;
  clientName: string;
  clientDoc?: string;
  channel: SalesChannel;
  items: SaleItem[];
  total: number;
  costTotal: number;
  status: 'Concluída' | 'Pendente' | 'Cancelada';
  createdAt: string;
  payments?: { method: string; amount: number }[];
  salesperson?: string;
}

export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  cpf?: string;
  birthDate?: string;
  whatsapp?: string;
  addressStreet?: string;
  addressNum?: string;
  addressComp?: string;
  addressBairro?: string;
  addressCidade?: string;
  addressEstado?: string;
  addressCep?: string;
  channel: SalesChannel;
  npsScore?: number;
  totalSpent: number;
  ordersCount: number;
  createdAt: string;
}

export interface Transaction {
  id: string;
  type: 'Inflow' | 'Outflow';
  category: string; // 'Venda', 'Fornecedores', 'Marketing', 'Aluguel', 'Insumos', etc.
  description: string;
  amount: number;
  date: string;
}
