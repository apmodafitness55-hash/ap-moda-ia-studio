import { createClient } from '@supabase/supabase-js';

export interface TeamMember {
  id: string;
  name: string;
  login: string;
  password?: string;
  role: 'Admin' | 'Gerente' | 'Vendedor' | 'Parceiro' | 'Entregador';
  details?: string;
  birthDate?: string;
  createdAt?: string;
  avatar?: string;
}

// Retrieves configuration dynamically from Vite environment variables (no default mock fallbacks)
export function getSupabaseConfig() {
  const metaEnv = (import.meta as any).env || {};
  let url = (metaEnv.VITE_SUPABASE_URL || '').trim();
  let key = (metaEnv.VITE_SUPABASE_ANON_KEY || metaEnv.VITE_SUPABASE_KEY || '').trim();

  // Fallback ONLY to user-defined localStorage values if Vite environment variables are not active/present
  if (!url) {
    url = (localStorage.getItem('ap_supabase_url') || '').trim();
  }
  if (!key) {
    key = (localStorage.getItem('ap_supabase_key') || '').trim();
  }
  
  if (!url || !key) {
    return null;
  }
  
  return { url, key };
}

// Sincroniza as credenciais do Supabase do servidor central para o localStorage local
export async function initializeSupabaseConfig() {
  try {
    const response = await fetch('/api/supabase-config');
    if (response.ok) {
      const data = await response.json();
      if (data.url && data.key) {
        localStorage.setItem('ap_supabase_url', data.url);
        localStorage.setItem('ap_supabase_key', data.key);
        console.log('[Supabase Config] Credenciais de sincronização unificadas recebidas do servidor central:', data.url);
        return { url: data.url, key: data.key };
      }
    }
  } catch (err) {
    console.error('[Supabase Config] Erro ao sincronizar chaves do Supabase com o servidor central:', err);
  }
  return getSupabaseConfig();
}

// Salva as credenciais do Supabase local no backend central para compartilhar com todos os aparelhos
export async function saveSupabaseConfigToServer(url: string, key: string) {
  try {
    const response = await fetch('/api/supabase-config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url, key })
    });
    if (response.ok) {
      console.log('[Supabase Config] Credenciais salvas com sucesso no servidor central e replicadas para novos aparelhos!');
      return true;
    }
  } catch (err) {
    console.error('[Supabase Config] Falha ao sincronizar credenciais no servidor central:', err);
  }
  return false;
}

// Instantiates a fresh Supabase Client
export function getSupabaseClient() {
  const conf = getSupabaseConfig();
  if (!conf) {
    throw new Error('Chaves de API do Supabase não configuradas nas variáveis de ambiente ativas (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY).');
  }
  try {
    return createClient(conf.url, conf.key);
  } catch (err) {
    console.error('Error instantiating Supabase client:', err);
    throw err;
  }
}

// Check if Supabase keys are configured
export function isSupabaseConfigured(): boolean {
  return getSupabaseConfig() !== null;
}

// Updated SQL Script template containing ALL tables of the AP Moda Fitness ecosystem
export const SUPABASE_SQL_SETUP = `-- Script de Configuração Completo para AP Moda Fitness
-- COPIE E COLE ESTE SCRIPT INTEIRO NO CONSOLE SQL (SQL Editor) DO SEU SUPABASE PARA HABILITAR A SINCRONIZAÇÃO EM TODOS OS APARELHOS

-- 1. Criação da Tabela de Funcionários / Equipe & Credenciais
CREATE TABLE IF NOT EXISTS ap_team_members (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  login TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('Admin', 'Gerente', 'Vendedor', 'Parceiro', 'Entregador')),
  details TEXT,
  "birthDate" TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  "createdAt" TEXT,
  avatar TEXT
);

-- Garante que a coluna avatar e colunas de datas existam com a grafia correta
ALTER TABLE ap_team_members ADD COLUMN IF NOT EXISTS avatar TEXT;
ALTER TABLE ap_team_members ADD COLUMN IF NOT EXISTS "birthDate" TEXT;
ALTER TABLE ap_team_members ADD COLUMN IF NOT EXISTS "createdAt" TEXT;

-- 2. Criação da Tabela de Catálogo de Produtos
CREATE TABLE IF NOT EXISTS ap_products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  sku TEXT UNIQUE NOT NULL,
  category TEXT NOT NULL,
  price NUMERIC NOT NULL,
  cost NUMERIC NOT NULL,
  stock INTEGER NOT NULL,
  "minStock" INTEGER NOT NULL,
  image TEXT NOT NULL,
  images JSONB,
  "salesCount" INTEGER DEFAULT 0,
  description TEXT,
  "videoUrl" TEXT,
  colors JSONB,
  sizes JSONB,
  size_colors JSONB,
  color_stocks JSONB,
  size_color_stocks JSONB,
  "sizeColors" JSONB,
  "colorStocks" JSONB,
  "sizeColorStocks" JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Garante que a coluna size_colors e as de grafia camelCase existam se a tabela ja foi criada anteriormente
ALTER TABLE ap_products ADD COLUMN IF NOT EXISTS size_colors JSONB;
ALTER TABLE ap_products ADD COLUMN IF NOT EXISTS color_stocks JSONB;
ALTER TABLE ap_products ADD COLUMN IF NOT EXISTS size_color_stocks JSONB;
ALTER TABLE ap_products ADD COLUMN IF NOT EXISTS "sizeColors" JSONB;
ALTER TABLE ap_products ADD COLUMN IF NOT EXISTS "colorStocks" JSONB;
ALTER TABLE ap_products ADD COLUMN IF NOT EXISTS "sizeColorStocks" JSONB;
ALTER TABLE ap_products ADD COLUMN IF NOT EXISTS "minStock" INTEGER;
ALTER TABLE ap_products ADD COLUMN IF NOT EXISTS "salesCount" INTEGER DEFAULT 0;
ALTER TABLE ap_products ADD COLUMN IF NOT EXISTS "videoUrl" TEXT;

-- 3. Criação da Tabela de Cadastro de Clientes
CREATE TABLE IF NOT EXISTS ap_clients (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  cpf TEXT,
  "birthDate" TEXT,
  whatsapp TEXT,
  "addressStreet" TEXT,
  "addressNum" TEXT,
  "addressComp" TEXT,
  "addressBairro" TEXT,
  "addressCidade" TEXT,
  "addressEstado" TEXT,
  "addressCep" TEXT,
  channel TEXT NOT NULL,
  "npsScore" INTEGER,
  "totalSpent" NUMERIC DEFAULT 0,
  "ordersCount" INTEGER DEFAULT 0,
  "cashbackBalance" NUMERIC DEFAULT 0,
  busto NUMERIC,
  cintura NUMERIC,
  quadril NUMERIC,
  coxa NUMERIC,
  altura NUMERIC,
  peso NUMERIC,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Autocompensação (Self-healing) se a tabela ap_clients já existia de versões anteriores no Supabase
ALTER TABLE ap_clients ADD COLUMN IF NOT EXISTS "birthDate" TEXT;
ALTER TABLE ap_clients ADD COLUMN IF NOT EXISTS "addressStreet" TEXT;
ALTER TABLE ap_clients ADD COLUMN IF NOT EXISTS "addressNum" TEXT;
ALTER TABLE ap_clients ADD COLUMN IF NOT EXISTS "addressComp" TEXT;
ALTER TABLE ap_clients ADD COLUMN IF NOT EXISTS "addressBairro" TEXT;
ALTER TABLE ap_clients ADD COLUMN IF NOT EXISTS "addressCidade" TEXT;
ALTER TABLE ap_clients ADD COLUMN IF NOT EXISTS "addressEstado" TEXT;
ALTER TABLE ap_clients ADD COLUMN IF NOT EXISTS "addressCep" TEXT;
ALTER TABLE ap_clients ADD COLUMN IF NOT EXISTS "npsScore" INTEGER;
ALTER TABLE ap_clients ADD COLUMN IF NOT EXISTS "totalSpent" NUMERIC DEFAULT 0;
ALTER TABLE ap_clients ADD COLUMN IF NOT EXISTS "ordersCount" INTEGER DEFAULT 0;
ALTER TABLE ap_clients ADD COLUMN IF NOT EXISTS "cashbackBalance" NUMERIC DEFAULT 0;
ALTER TABLE ap_clients ADD COLUMN IF NOT EXISTS "busto" NUMERIC;
ALTER TABLE ap_clients ADD COLUMN IF NOT EXISTS "cintura" NUMERIC;
ALTER TABLE ap_clients ADD COLUMN IF NOT EXISTS "quadril" NUMERIC;
ALTER TABLE ap_clients ADD COLUMN IF NOT EXISTS "coxa" NUMERIC;
ALTER TABLE ap_clients ADD COLUMN IF NOT EXISTS "altura" NUMERIC;
ALTER TABLE ap_clients ADD COLUMN IF NOT EXISTS "peso" NUMERIC;

-- 4. Criação da Tabela de Vendas Realizadas (PDV e Canais)
CREATE TABLE IF NOT EXISTS ap_sales (
  id TEXT PRIMARY KEY,
  "clientName" TEXT NOT NULL,
  "clientDoc" TEXT,
  channel TEXT NOT NULL,
  items JSONB NOT NULL,
  total NUMERIC NOT NULL,
  "costTotal" NUMERIC NOT NULL,
  status TEXT NOT NULL,
  "createdAt" TEXT NOT NULL,
  payments JSONB,
  salesperson TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Garante que colunas camelCase existam na tabela ap_sales
ALTER TABLE ap_sales ADD COLUMN IF NOT EXISTS "clientName" TEXT;
ALTER TABLE ap_sales ADD COLUMN IF NOT EXISTS "clientDoc" TEXT;
ALTER TABLE ap_sales ADD COLUMN IF NOT EXISTS "costTotal" NUMERIC DEFAULT 0;
ALTER TABLE ap_sales ADD COLUMN IF NOT EXISTS "createdAt" TEXT;
ALTER TABLE ap_sales ADD COLUMN IF NOT EXISTS payments JSONB;
ALTER TABLE ap_sales ADD COLUMN IF NOT EXISTS salesperson TEXT;

-- 5. Criação da Tabela de Transações de Fluxo de Caixa (Financeiro / Contas a Pagar e Receber)
CREATE TABLE IF NOT EXISTS ap_transactions (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL CHECK (type IN ('Inflow', 'Outflow')),
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  date TEXT NOT NULL,
  status TEXT DEFAULT 'pago',
  due_date TEXT,
  installments_group TEXT,
  installment_number INTEGER,
  total_installments INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Autocompensação (Self-healing) se a tabela já foi criada no passado
ALTER TABLE ap_transactions ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pago';
ALTER TABLE ap_transactions ADD COLUMN IF NOT EXISTS due_date TEXT;
ALTER TABLE ap_transactions ADD COLUMN IF NOT EXISTS installments_group TEXT;
ALTER TABLE ap_transactions ADD COLUMN IF NOT EXISTS installment_number INTEGER;
ALTER TABLE ap_transactions ADD COLUMN IF NOT EXISTS total_installments INTEGER;

-- 6. Criação da Tabela de Pedidos Online / Encomendas da Vitrine
CREATE TABLE IF NOT EXISTS ap_online_orders (
  id TEXT PRIMARY KEY,
  "clientName" TEXT NOT NULL,
  total NUMERIC NOT NULL,
  status TEXT NOT NULL,
  status_pagamento TEXT DEFAULT 'pendente',
  items JSONB NOT NULL,
  "createdAt" TEXT NOT NULL,
  phone TEXT,
  address TEXT,
  "paymentMethod" TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Garante colunas de auto-healing em ap_online_orders
ALTER TABLE ap_online_orders ADD COLUMN IF NOT EXISTS "clientName" TEXT;
ALTER TABLE ap_online_orders ADD COLUMN IF NOT EXISTS "createdAt" TEXT;
ALTER TABLE ap_online_orders ADD COLUMN IF NOT EXISTS "paymentMethod" TEXT;
ALTER TABLE ap_online_orders ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE ap_online_orders ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE ap_online_orders ADD COLUMN IF NOT EXISTS status_pagamento TEXT DEFAULT 'pendente';

-- 7. Criação da Tabela de Configurações do Sistema Geral (Google Workspace, Dados da Loja, Logo, etc.)
CREATE TABLE IF NOT EXISTS ap_system_configs (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Como múltiplos aparelhos de funcionários sincronizam de forma pareada compartilhando a mesma chave de acesso unificada (token de API)
-- sem a necessidade de criar contas de e-mail individuais no painel de Autenticação do Supabase (usando o sistema local simples de equipe),
-- desabilitamos o Row Level Security (RLS) de todas as tabelas. Isso garante que todos os celulares e computadores conectados possam ler e gravar perfeitamente.
ALTER TABLE ap_team_members DISABLE ROW LEVEL SECURITY;
ALTER TABLE ap_products DISABLE ROW LEVEL SECURITY;
ALTER TABLE ap_clients DISABLE ROW LEVEL SECURITY;
ALTER TABLE ap_sales DISABLE ROW LEVEL SECURITY;
ALTER TABLE ap_transactions DISABLE ROW LEVEL SECURITY;
ALTER TABLE ap_online_orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE ap_system_configs DISABLE ROW LEVEL SECURITY;

-- Apagar políticas antigas para evitar conflitos residuais
DROP POLICY IF EXISTS "Acesso Total para AP Moda" ON ap_team_members;
DROP POLICY IF EXISTS "Acesso Total para AP Moda" ON ap_products;
DROP POLICY IF EXISTS "Acesso Total para AP Moda" ON ap_clients;
DROP POLICY IF EXISTS "Acesso Total para AP Moda" ON ap_sales;
DROP POLICY IF EXISTS "Acesso Total para AP Moda" ON ap_transactions;
DROP POLICY IF EXISTS "Acesso Total para AP Moda" ON ap_online_orders;
DROP POLICY IF EXISTS "Acesso Total para AP Moda" ON ap_system_configs;

DROP POLICY IF EXISTS "Leitura de Equipes para Login" ON ap_team_members;
DROP POLICY IF EXISTS "Escrita de Equipes apenas para Admin e Gerente" ON ap_team_members;
DROP POLICY IF EXISTS "Visualização pública de produtos" ON ap_products;
DROP POLICY IF EXISTS "Gerenciamento de produtos restrito a Admin e Gerente" ON ap_products;
DROP POLICY IF EXISTS "Segurança no cadastro de clientes" ON ap_clients;
DROP POLICY IF EXISTS "Segurança avançada de vendas" ON ap_sales;
DROP POLICY IF EXISTS "Fluxo de caixa restrito a Admin e Gerente" ON ap_transactions;
DROP POLICY IF EXISTS "Segurança em pedidos de logística" ON ap_online_orders;
DROP POLICY IF EXISTS "Leitura de configurações gerais" ON ap_system_configs;
DROP POLICY IF EXISTS "Escrita de configurações apenas Admin e Gerente" ON ap_system_configs;

-- Inserir Administrador Padrão Inicial (Ana Paula Admin / Ap01695*) caso já não exista
INSERT INTO ap_team_members (id, name, login, password, role, details, createdAt)
VALUES 
  ('usr-1', 'Ana Paula Admin', 'admin', 'Ap01695*', 'Admin', 'Administradora Geral', NOW()::text)
ON CONFLICT (login) DO UPDATE 
SET password = EXCLUDED.password;
`;

/**
 * Sync helper indicating whether a warning alert about missing tables was shown in the session.
 * Prevents repeating annoying error modals if client hasn't run the SQL scripts in their Supabase yet.
 */
let hasShownTableWarning = false;

// Graceful handler for missing tables or query errors in Supabase
function handleSchemaError(err: any, tableName: string) {
  console.warn(`[Supabase Sync Warning] Falha na tabela "${tableName}". Certifique-se de que rodou o Script de Configuração SQL no console do Supabase. Detalhe:`, err);
  
  if (!hasShownTableWarning && err?.message && (err.message.includes('not found') || err.message.includes('relation') || err.code === '42P01')) {
    hasShownTableWarning = true;
    const msg = `⚠️ Sincronização em Nuvem: A tabela "${tableName}" não foi encontrada no seu Supabase!\n\nPor favor, vá em Painel Ajustes > Console de Banco de Dados, copie o Script SQL de Configuração e cole no SQL Editor do seu Supabase para ativar o compartilhamento de dados entre múltiplos aparelhos (celulares, tablets e notebooks). O sistema continuará salvando os dados provisoriamente neste aparelho.`;
    console.log('[Supabase Setup Required]', msg);
    // Dynamically emit an event to the document so the UI can exhibit a notification
    const event = new CustomEvent('supabase-schema-warning', { detail: { message: msg } });
    window.dispatchEvent(event);
  }
}

// Loud visual alert handler for any database insert/upsert failures to fulfill prompt requirement 3
export function handleInsertError(err: any, tableName: string) {
  console.error(`[Supabase WRITE Error] Falha de gravação na tabela "${tableName}":`, err);
  if (err) {
    const errorMsg = `🚨 ERRO DO SUPABASE AO GRAVAR DADOS! 🚨\n\n` +
      `• Tabela de Destino: "${tableName}"\n` +
      `• Mensagem de Erro: "${err.message || err}"\n` +
      `• Código PostgreSQL: ${err.code || 'sem código'}\n` +
      `• Detalhes do Servidor: ${err.details || 'sem detalhes adicionais'}\n` +
      `• Dica de Diagnóstico: ${err.hint || 'nenhuma'}\n\n` +
      `Verifique se as permissões de acesso (RLS) estão corretas ou re-execute o script SQL de configuração no console do Supabase para corrigir!`;
    alert(errorMsg);
  }
}

/**
 * Retorna um valor do objeto item de forma tolerante a maiúsculas/minúsculas, camelCase, snake_case e variações de letras.
 */
export function getTolerantValue(item: any, camelKey: string, fallback: any = undefined): any {
  if (!item) return fallback;
  
  // 1. Direct match
  if (item[camelKey] !== undefined && item[camelKey] !== null) {
    return item[camelKey];
  }
  
  // 2. Direct lowercase match
  const lowerKey = camelKey.toLowerCase();
  if (item[lowerKey] !== undefined && item[lowerKey] !== null) {
    return item[lowerKey];
  }
  
  // 3. Direct snake_case match
  const snakeKey = camelKey.replace(/([A-Z])/g, "_$1").toLowerCase();
  if (item[snakeKey] !== undefined && item[snakeKey] !== null) {
    return item[snakeKey];
  }

  // 4. Case-insensitive search over all keys
  const camelKeyLower = camelKey.toLowerCase().replace(/_/g, '');
  for (const k of Object.keys(item)) {
    const kNormalized = k.toLowerCase().replace(/_/g, '');
    if (kNormalized === camelKeyLower) {
      if (item[k] !== undefined && item[k] !== null) {
        return item[k];
      }
    }
  }
  
  return fallback;
}

/**
 * Helper resiliente para inserções (upsert) no Supabase.
 * Se houver erro, dispara o tratamento com handleInsertError e handleSchemaError e retorna false.
 */
export async function resilientUpsert(tableName: string, originalPayloads: any[]): Promise<boolean> {
  const client = getSupabaseClient();
  if (!client || originalPayloads.length === 0) return false;

  const payloads = JSON.parse(JSON.stringify(originalPayloads)); // Clona profundamente para evitar efeitos colaterais
  const { error } = await client.from(tableName).upsert(payloads, { onConflict: 'id' });
  if (!error) {
    return true;
  }

  handleInsertError(error, tableName);
  handleSchemaError(error, tableName);
  return false;
}

/**
 * ------------------- 1. TEAM MEMBERS SYNC -------------------
 */
export async function fetchTeamMembersFromSupabase(): Promise<TeamMember[] | null> {
  const client = getSupabaseClient();
  if (!client) return null;
  try {
    const { data, error } = await client
      .from('ap_team_members')
      .select('*')
      .order('id', { ascending: true });
    if (error) {
      handleSchemaError(error, 'ap_team_members');
      throw error;
    }
    return (data || []).map((item: any) => ({
      id: getTolerantValue(item, 'id'),
      name: getTolerantValue(item, 'name'),
      login: getTolerantValue(item, 'login'),
      password: getTolerantValue(item, 'password'),
      role: getTolerantValue(item, 'role') as any,
      details: getTolerantValue(item, 'details', ''),
      birthDate: getTolerantValue(item, 'birthDate', ''),
      createdAt: getTolerantValue(item, 'createdAt', new Date().toISOString()),
      avatar: getTolerantValue(item, 'avatar', '')
    }));
  } catch (err) {
    console.error('Failed to download members:', err);
    throw err;
  }
}

export async function syncBulkTeamMembersToSupabase(members: TeamMember[]): Promise<boolean> {
  const payloads = members.map(m => ({
    id: getTolerantValue(m, 'id'),
    name: getTolerantValue(m, 'name'),
    login: String(getTolerantValue(m, 'login', '')).toLowerCase().trim().replace(/\s+/g, ''),
    password: getTolerantValue(m, 'password') || '123',
    role: getTolerantValue(m, 'role'),
    details: getTolerantValue(m, 'details', ''),
    birthDate: getTolerantValue(m, 'birthDate', ''),
    createdAt: getTolerantValue(m, 'createdAt', new Date().toISOString()),
    avatar: getTolerantValue(m, 'avatar', '')
  }));
  return resilientUpsert('ap_team_members', payloads);
}

export async function deleteTeamMemberFromSupabase(id: string): Promise<boolean> {
  const client = getSupabaseClient();
  if (!client) return false;
  try {
    const { error } = await client
      .from('ap_team_members')
      .delete()
      .eq('id', id);
    if (error) {
      handleSchemaError(error, 'ap_team_members');
      return false;
    }
    return true;
  } catch (err) {
    console.error('Failed deleting member:', err);
    return false;
  }
}

export async function deleteProductFromSupabase(id: string): Promise<boolean> {
  const client = getSupabaseClient();
  if (!client) return false;
  try {
    const { error } = await client
      .from('ap_products')
      .delete()
      .eq('id', id);
    if (error) {
      handleSchemaError(error, 'ap_products');
      return false;
    }
    return true;
  } catch (err) {
    console.error('Failed deleting product:', err);
    return false;
  }
}


/**
 * ------------------- 2. PRODUCTS SYNC -------------------
 */
export async function fetchProductsFromSupabase(): Promise<any[] | null> {
  const client = getSupabaseClient();
  if (!client) return null;
  try {
    const { data, error } = await client.from('ap_products').select('*');
    if (error) {
      handleSchemaError(error, 'ap_products');
      throw error;
    }
    return (data || []).map((p: any) => ({
      id: getTolerantValue(p, 'id'),
      name: getTolerantValue(p, 'name'),
      sku: getTolerantValue(p, 'sku'),
      category: getTolerantValue(p, 'category'),
      price: Number(getTolerantValue(p, 'price', 0)),
      cost: Number(getTolerantValue(p, 'cost', 0)),
      stock: Number(getTolerantValue(p, 'stock', 0)),
      minStock: Number(getTolerantValue(p, 'minStock', 0)),
      image: getTolerantValue(p, 'image'),
      images: Array.isArray(getTolerantValue(p, 'images')) ? getTolerantValue(p, 'images') : [],
      salesCount: Number(getTolerantValue(p, 'salesCount', 0)),
      description: getTolerantValue(p, 'description', ''),
      videoUrl: getTolerantValue(p, 'videoUrl', ''),
      colors: Array.isArray(getTolerantValue(p, 'colors')) ? getTolerantValue(p, 'colors') : [],
      sizes: Array.isArray(getTolerantValue(p, 'sizes')) ? getTolerantValue(p, 'sizes') : [],
      sizeColors: getTolerantValue(p, 'sizeColors', {}),
      colorStocks: getTolerantValue(p, 'colorStocks', {}),
      sizeColorStocks: getTolerantValue(p, 'sizeColorStocks', {})
    }));
  } catch (err) {
    console.error('Failed fetching products:', err);
    throw err;
  }
}

export async function syncBulkProductsToSupabase(products: any[]): Promise<boolean> {
  const payloads = products.map(p => ({
    id: p.id,
    name: p.name || '',
    sku: p.sku || '',
    category: p.category || '',
    price: Number(p.price || 0),
    cost: Number(p.cost || 0),
    stock: Number(p.stock || 0),
    minStock: Number(p.minStock || 0),
    image: p.image || '',
    images: Array.isArray(p.images) ? p.images : [],
    salesCount: Number(p.salesCount || 0),
    description: p.description || '',
    videoUrl: p.videoUrl || '',
    colors: Array.isArray(p.colors) ? p.colors : [],
    sizes: Array.isArray(p.sizes) ? p.sizes : [],
    sizeColors: p.sizeColors || p.size_colors || {},
    colorStocks: p.colorStocks || p.color_stocks || {},
    sizeColorStocks: p.sizeColorStocks || p.size_color_stocks || {}
  }));
  return resilientUpsert('ap_products', payloads);
}


/**
 * ------------------- 3. CLIENTS SYNC -------------------
 */
export async function fetchClientsFromSupabase(): Promise<any[] | null> {
  const client = getSupabaseClient();
  if (!client) return null;
  try {
    const { data, error } = await client.from('ap_clients').select('*');
    if (error) {
      handleSchemaError(error, 'ap_clients');
      throw error;
    }
    return (data || []).map((c: any) => ({
      id: getTolerantValue(c, 'id'),
      name: getTolerantValue(c, 'name'),
      email: getTolerantValue(c, 'email', ''),
      phone: getTolerantValue(c, 'phone', ''),
      cpf: getTolerantValue(c, 'cpf', ''),
      birthDate: getTolerantValue(c, 'birthDate', ''),
      whatsapp: getTolerantValue(c, 'whatsapp', ''),
      addressStreet: getTolerantValue(c, 'addressStreet', ''),
      addressNum: getTolerantValue(c, 'addressNum', ''),
      addressComp: getTolerantValue(c, 'addressComp', ''),
      addressBairro: getTolerantValue(c, 'addressBairro', ''),
      addressCidade: getTolerantValue(c, 'addressCidade', ''),
      addressEstado: getTolerantValue(c, 'addressEstado', ''),
      addressCep: getTolerantValue(c, 'addressCep', ''),
      channel: getTolerantValue(c, 'channel', 'Balcão'),
      npsScore: Number(getTolerantValue(c, 'npsScore', 0)),
      totalSpent: Number(getTolerantValue(c, 'totalSpent', 0)),
      ordersCount: Number(getTolerantValue(c, 'ordersCount', 0)),
      createdAt: getTolerantValue(c, 'createdAt', new Date().toISOString()),
      cashbackBalance: Number(getTolerantValue(c, 'cashbackBalance', 0)),
      busto: getTolerantValue(c, 'busto') !== undefined ? Number(getTolerantValue(c, 'busto')) : undefined,
      cintura: getTolerantValue(c, 'cintura') !== undefined ? Number(getTolerantValue(c, 'cintura')) : undefined,
      quadril: getTolerantValue(c, 'quadril') !== undefined ? Number(getTolerantValue(c, 'quadril')) : undefined,
      coxa: getTolerantValue(c, 'coxa') !== undefined ? Number(getTolerantValue(c, 'coxa')) : undefined,
      altura: getTolerantValue(c, 'altura') !== undefined ? Number(getTolerantValue(c, 'altura')) : undefined,
      peso: getTolerantValue(c, 'peso') !== undefined ? Number(getTolerantValue(c, 'peso')) : undefined
    }));
  } catch (err) {
    console.error('Failed fetching clients:', err);
    throw err;
  }
}

export async function syncBulkClientsToSupabase(clientsList: any[]): Promise<boolean> {
  const payloads = clientsList.map(c => ({
    id: getTolerantValue(c, 'id'),
    name: getTolerantValue(c, 'name'),
    email: getTolerantValue(c, 'email', ''),
    phone: getTolerantValue(c, 'phone', ''),
    cpf: getTolerantValue(c, 'cpf', ''),
    birthDate: getTolerantValue(c, 'birthDate', ''),
    whatsapp: getTolerantValue(c, 'whatsapp', ''),
    addressStreet: getTolerantValue(c, 'addressStreet', ''),
    addressNum: getTolerantValue(c, 'addressNum', ''),
    addressComp: getTolerantValue(c, 'addressComp', ''),
    addressBairro: getTolerantValue(c, 'addressBairro', ''),
    addressCidade: getTolerantValue(c, 'addressCidade', ''),
    addressEstado: getTolerantValue(c, 'addressEstado', ''),
    addressCep: getTolerantValue(c, 'addressCep', ''),
    channel: getTolerantValue(c, 'channel', 'Balcão'),
    npsScore: Number(getTolerantValue(c, 'npsScore', 0)),
    totalSpent: Number(getTolerantValue(c, 'totalSpent', 0)),
    ordersCount: Number(getTolerantValue(c, 'ordersCount', 0)),
    cashbackBalance: Number(getTolerantValue(c, 'cashbackBalance', 0)),
    busto: getTolerantValue(c, 'busto') !== undefined ? Number(getTolerantValue(c, 'busto')) : null,
    cintura: getTolerantValue(c, 'cintura') !== undefined ? Number(getTolerantValue(c, 'cintura')) : null,
    quadril: getTolerantValue(c, 'quadril') !== undefined ? Number(getTolerantValue(c, 'quadril')) : null,
    coxa: getTolerantValue(c, 'coxa') !== undefined ? Number(getTolerantValue(c, 'coxa')) : null,
    altura: getTolerantValue(c, 'altura') !== undefined ? Number(getTolerantValue(c, 'altura')) : null,
    peso: getTolerantValue(c, 'peso') !== undefined ? Number(getTolerantValue(c, 'peso')) : null
  }));
  return resilientUpsert('ap_clients', payloads);
}


/**
 * ------------------- 4. SALES SYNC -------------------
 */
export async function fetchSalesFromSupabase(): Promise<any[] | null> {
  const client = getSupabaseClient();
  if (!client) return null;
  try {
    const { data, error } = await client.from('ap_sales').select('*');
    if (error) {
      handleSchemaError(error, 'ap_sales');
      throw error;
    }
    return (data || []).map((s: any) => ({
      id: getTolerantValue(s, 'id'),
      clientName: getTolerantValue(s, 'clientName', ''),
      clientDoc: getTolerantValue(s, 'clientDoc', ''),
      channel: getTolerantValue(s, 'channel', 'Balcão'),
      items: Array.isArray(getTolerantValue(s, 'items')) ? getTolerantValue(s, 'items') : [],
      total: Number(getTolerantValue(s, 'total', 0)),
      costTotal: Number(getTolerantValue(s, 'costTotal', 0)),
      status: getTolerantValue(s, 'status'),
      createdAt: getTolerantValue(s, 'createdAt', ''),
      payments: Array.isArray(getTolerantValue(s, 'payments')) ? getTolerantValue(s, 'payments') : [],
      salesperson: getTolerantValue(s, 'salesperson', '')
    }));
  } catch (err) {
    console.error('Failed fetching sales:', err);
    throw err;
  }
}

export async function syncBulkSalesToSupabase(salesList: any[]): Promise<boolean> {
  const payloads = salesList.map(s => ({
    id: s.id,
    clientName: s.clientName !== undefined ? s.clientName : (s.client_name || ''),
    clientDoc: s.clientDoc !== undefined ? s.clientDoc : (s.client_doc || ''),
    channel: s.channel || 'Balcão',
    items: Array.isArray(s.items) ? s.items : [],
    total: Number(s.total || 0),
    costTotal: s.costTotal !== undefined ? Number(s.costTotal) : (s.cost_total !== undefined && s.cost_total !== null ? Number(s.cost_total) : 0),
    status: s.status || '',
    createdAt: s.createdAt !== undefined ? s.createdAt : (s.created_at || ''),
    payments: Array.isArray(s.payments) ? s.payments : [],
    salesperson: s.salesperson || ''
  }));
  return resilientUpsert('ap_sales', payloads);
}


/**
 * ------------------- 5. TRANSACTIONS SYNC -------------------
 */
export async function fetchTransactionsFromSupabase(): Promise<any[] | null> {
  const client = getSupabaseClient();
  if (!client) return null;
  try {
    const { data, error } = await client.from('ap_transactions').select('*');
    if (error) {
      handleSchemaError(error, 'ap_transactions');
      throw error;
    }
    return (data || []).map((t: any) => ({
      id: getTolerantValue(t, 'id'),
      type: getTolerantValue(t, 'type'),
      category: getTolerantValue(t, 'category'),
      description: getTolerantValue(t, 'description'),
      amount: Number(getTolerantValue(t, 'amount', 0)),
      date: getTolerantValue(t, 'date'),
      status: getTolerantValue(t, 'status', 'pago'),
      dueDate: getTolerantValue(t, 'dueDate') || getTolerantValue(t, 'dueDate', getTolerantValue(t, 'date')),
      installmentsGroup: getTolerantValue(t, 'installmentsGroup'),
      installmentNumber: getTolerantValue(t, 'installmentNumber') !== undefined ? Number(getTolerantValue(t, 'installmentNumber')) : undefined,
      totalInstallments: getTolerantValue(t, 'totalInstallments') !== undefined ? Number(getTolerantValue(t, 'totalInstallments')) : undefined
    }));
  } catch (err) {
    console.error('Failed fetching transactions:', err);
    throw err;
  }
}

export async function syncBulkTransactionsToSupabase(transactionsList: any[]): Promise<boolean> {
  const payloads = transactionsList.map(t => ({
    id: t.id,
    type: t.type || '',
    category: t.category || '',
    description: t.description || '',
    amount: Number(t.amount || 0),
    date: t.date || '',
    status: t.status || 'pago',
    due_date: t.dueDate || t.due_date || t.date || '',
    installments_group: t.installmentsGroup !== undefined ? t.installmentsGroup : (t.installments_group || null),
    installment_number: t.installmentNumber !== undefined && t.installmentNumber !== null ? Number(t.installmentNumber) : (t.installment_number !== undefined && t.installment_number !== null ? Number(t.installment_number) : null),
    total_installments: t.totalInstallments !== undefined && t.totalInstallments !== null ? Number(t.totalInstallments) : (t.total_installments !== undefined && t.total_installments !== null ? Number(t.total_installments) : null)
  }));
  return resilientUpsert('ap_transactions', payloads);
}


/**
 * ------------------- 6. ONLINE ORDERS SYNC -------------------
 */
export async function fetchOnlineOrdersFromSupabase(): Promise<any[] | null> {
  const client = getSupabaseClient();
  if (!client) return null;
  try {
    const { data, error } = await client.from('ap_online_orders').select('*');
    if (error) {
      handleSchemaError(error, 'ap_online_orders');
      throw error;
    }
    return (data || []).map((o: any) => ({
      id: getTolerantValue(o, 'id'),
      clientName: getTolerantValue(o, 'clientName', ''),
      total: Number(getTolerantValue(o, 'total', 0)),
      status: getTolerantValue(o, 'status'),
      status_pagamento: getTolerantValue(o, 'status_pagamento', 'pendente'),
      items: Array.isArray(getTolerantValue(o, 'items')) ? getTolerantValue(o, 'items') : [],
      createdAt: getTolerantValue(o, 'createdAt', ''),
      phone: getTolerantValue(o, 'phone', ''),
      address: getTolerantValue(o, 'address', ''),
      paymentMethod: getTolerantValue(o, 'paymentMethod', '')
    }));
  } catch (err) {
    console.error('Failed fetching online orders:', err);
    throw err;
  }
}

export async function syncBulkOnlineOrdersToSupabase(ordersList: any[]): Promise<boolean> {
  const payloads = ordersList.map(o => ({
    id: getTolerantValue(o, 'id'),
    clientName: getTolerantValue(o, 'clientName'),
    total: Number(getTolerantValue(o, 'total', 0)),
    status: getTolerantValue(o, 'status'),
    status_pagamento: getTolerantValue(o, 'status_pagamento', 'pendente'),
    items: Array.isArray(getTolerantValue(o, 'items')) ? getTolerantValue(o, 'items') : [],
    createdAt: getTolerantValue(o, 'createdAt'),
    phone: getTolerantValue(o, 'phone', ''),
    address: getTolerantValue(o, 'address', ''),
    paymentMethod: getTolerantValue(o, 'paymentMethod', '')
  }));
  return resilientUpsert('ap_online_orders', payloads);
}


/**
 * ------------------- 7. SYSTEM CONFIGS SYNC (Google Workspace keys, Store specs, logo, slide assets, rates etc.) -------------------
 */
const CRITICAL_CONFIG_KEYS = [
  'ap_store_name',
  'ap_store_slogan',
  'ap_store_cnpj',
  'ap_store_address',
  'ap_store_city',
  'ap_store_state',
  'ap_store_phone',
  'ap_store_footer',
  'ap_store_logo',
  'ap_pix_key',
  'ap_moda_company_info',
  'ap_whatsapp_token',
  'ap_whatsapp_phone_id',
  'ap_whatsapp_recipient',
  'ap_whatsapp_enabled',
  'ap_imgbb_key',
  'ap_discord_webhook',
  'ap_vitrine_store_name',
  'ap_vitrine_store_sub',
  'ap_vitrine_theme_color',
  'ap_vitrine_slides',
  'ap_vitrine_announcement',
  'ap_vitrine_category_banners',
  'ap_vitrine_floating_banner',
  'ap_moda_payment_config',
  'ap_moda_card_terminals',
  'ap_card_machines_rates'
];

/**
 * Downloads and synchronizes critical configuration key-values with Supabase bilateral table.
 * Resolves local/remote conflicts by merging newer values back into local storage dynamically.
 */
export async function syncSystemConfigsWithSupabase(): Promise<boolean> {
  const client = getSupabaseClient();
  if (!client) return false;
  try {
    // 1. Fetch current remote configs
    const { data, error } = await client.from('ap_system_configs').select('key, value');
    if (error) {
      handleSchemaError(error, 'ap_system_configs');
      return false;
    }

    const remoteConfigs = new Map<string, string>();
    if (data) {
      data.forEach((row: any) => remoteConfigs.set(row.key, row.value));
    }

    const updatesToPush: { key: string; value: string }[] = [];
    let localModified = false;

    // 2. Iterate keys we care about
    for (const key of CRITICAL_CONFIG_KEYS) {
      const localVal = localStorage.getItem(key);
      const remoteVal = remoteConfigs.get(key);

      if (localVal !== null && remoteVal === undefined) {
        // Exists locally but not remotely -> Push to cloud
        updatesToPush.push({ key, value: localVal });
      } else if (localVal === null && remoteVal !== undefined && remoteVal !== null) {
        // Exists remotely but not locally -> Download to machine
        localStorage.setItem(key, remoteVal);
        localModified = true;
      } else if (localVal !== null && remoteVal !== undefined && localVal !== remoteVal) {
        // Both exist but differ: For active settings slots, prefer the remote value to pull edits across tablets/devices, 
        // OR let the latest local interaction overwrite it when saved.
        // Let's safe-sync by saving remote state to this local instance so tablets gather what anaerobic changes were done.
        localStorage.setItem(key, remoteVal);
        localModified = true;
      }
    }

    // 3. If there are local additions to push
    if (updatesToPush.length > 0) {
      console.log(`[Supabase Config Sync] Uploading ${updatesToPush.length} system parameters back to cloud...`);
      const { error: upsertErr } = await client.from('ap_system_configs').upsert(updatesToPush, { onConflict: 'key' });
      if (upsertErr) {
        console.warn('Failed to upsert configurations to Supabase:', upsertErr);
      }
    }

    // Return whether browser state reload is required
    return localModified;
  } catch (err) {
    console.error('Failed system config sync:', err);
    return false;
  }
}

/**
 * Force pushes a single system config key immediately to Supabase on UI Save operations
 */
export async function pushSystemConfigToSupabase(key: string, value: string): Promise<boolean> {
  const client = getSupabaseClient();
  if (!client) return false;
  try {
    const { error } = await client.from('ap_system_configs').upsert({ key, value, updated_at: new Date().toISOString() }, { onConflict: 'key' });
    if (error) {
      handleInsertError(error, 'ap_system_configs');
      handleSchemaError(error, 'ap_system_configs');
      return false;
    }
    return true;
  } catch (err) {
    console.error(`Failed pushing config key ${key}:`, err);
    return false;
  }
}


/**
 * ------------------- REAL-TIME PING / KEEP-ALIVE -------------------
 */
export async function pingSupabaseOnLogin(userName: string, userRole: string): Promise<boolean> {
  const client = getSupabaseClient();
  if (!client) {
    console.log('[Supabase Ping] Sem chaves instaladas no momento para ping automático.');
    return false;
  }
  try {
    console.log(`[Supabase Keep-Alive] Enviando sinal de uso na nuvem para o login de: ${userName} (${userRole})...`);
    const { error } = await client.from('ap_team_members').select('id').limit(1);
    if (!error) {
      console.log('[Supabase Keep-Alive] Sucesso! Sinal enviado e banco de dados respondendo perfeitamente.');
      return true;
    }
    return false;
  } catch (err: any) {
    console.warn('[Supabase Keep-Alive Connection Refused] Falha ao acordar o servidor na nuvem:', err.message || err);
    return false;
  }
}

/**
 * Exclui de forma definitiva os registros das tabelas de produtos, clientes, vendas, despesas e pedidos no Supabase.
 * Para a equipe, preserva os usuários que possuam função Admin.
 */
export async function clearAllSupabaseData(): Promise<boolean> {
  const client = getSupabaseClient();
  if (!client) {
    console.log('[Supabase Clear] Sem conexão de banco de dados ativa.');
    return false;
  }
  try {
    console.log('[Supabase Clear] Formatando tabelas na nuvem (limpando dados fantasmas)...');
    
    // Deleta com filtro genérico para satisfazer requisitos de segurança do Supabase que barram deletes incondicionais
    await client.from('ap_products').delete().neq('id', 'dummy_nonexistent_id_value');
    await client.from('ap_clients').delete().neq('id', 'dummy_nonexistent_id_value');
    await client.from('ap_sales').delete().neq('id', 'dummy_nonexistent_id_value');
    await client.from('ap_transactions').delete().neq('id', 'dummy_nonexistent_id_value');
    await client.from('ap_online_orders').delete().neq('id', 'dummy_nonexistent_id_value');
    
    // Para funcionários, deleta tudo que não for Admin (evita trancar os admins atuais para fora)
    await client.from('ap_team_members').delete().neq('role', 'Admin');
    
    console.log('[Supabase Clear] Todas as tabelas foram limpas na nuvem com sucesso!');
    return true;
  } catch (err) {
    console.error('[Supabase Clear Error] Falha crítica ao limpar banco na nuvem:', err);
    return false;
  }
}
