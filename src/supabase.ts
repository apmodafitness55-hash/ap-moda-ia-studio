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

// Retrieves configuration dynamically from localStorage, falling back to default shared credentials, and self-heals placeholder text
export function getSupabaseConfig() {
  let url = localStorage.getItem('ap_supabase_url');
  let key = localStorage.getItem('ap_supabase_key');
  
  const defaultUrl = 'https://ckrwmdaocoyigpmzpdyz.supabase.co';
  const defaultKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNrcndtZGFvY295aWdwbXpwZHl6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE1NDk2NzMsImV4cCI6MjA5NzEyNTY3M30.20vJ4pjavzl06v1dOIbx9rkxf7kc_72ApGgD6jCRiss';
  
  if (!url || url.includes('suachave') || url.includes('sua-url') || url.trim() === '') {
    url = defaultUrl;
    localStorage.setItem('ap_supabase_url', defaultUrl);
  }
  
  if (!key || key.includes('suachave') || key.includes('suashare') || key.trim() === '') {
    key = defaultKey;
    localStorage.setItem('ap_supabase_key', defaultKey);
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
  if (!conf) return null;
  try {
    return createClient(conf.url, conf.key);
  } catch (err) {
    console.error('Error instantiating Supabase client:', err);
    return null;
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
  birthDate TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  createdAt TEXT,
  avatar TEXT
);

-- Garante que a coluna avatar exista se a tabela ja foi criada anteriormente
ALTER TABLE ap_team_members ADD COLUMN IF NOT EXISTS avatar TEXT;

-- 2. Criação da Tabela de Catálogo de Produtos
CREATE TABLE IF NOT EXISTS ap_products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  sku TEXT UNIQUE NOT NULL,
  category TEXT NOT NULL,
  price NUMERIC NOT NULL,
  cost NUMERIC NOT NULL,
  stock INTEGER NOT NULL,
  minStock INTEGER NOT NULL,
  image TEXT NOT NULL,
  images JSONB,
  salesCount INTEGER DEFAULT 0,
  description TEXT,
  videoUrl TEXT,
  colors JSONB,
  sizes JSONB,
  size_colors JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Garante que a coluna size_colors exista se a tabela ja foi criada anteriormente
ALTER TABLE ap_products ADD COLUMN IF NOT EXISTS size_colors JSONB;

-- 3. Criação da Tabela de Cadastro de Clientes
CREATE TABLE IF NOT EXISTS ap_clients (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  cpf TEXT,
  birthDate TEXT,
  whatsapp TEXT,
  addressStreet TEXT,
  addressNum TEXT,
  addressComp TEXT,
  addressBairro TEXT,
  addressCidade TEXT,
  addressEstado TEXT,
  addressCep TEXT,
  channel TEXT NOT NULL,
  npsScore INTEGER,
  totalSpent NUMERIC DEFAULT 0,
  ordersCount INTEGER DEFAULT 0,
  cashbackBalance NUMERIC DEFAULT 0,
  busto NUMERIC,
  cintura NUMERIC,
  quadril NUMERIC,
  coxa NUMERIC,
  altura NUMERIC,
  peso NUMERIC,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Criação da Tabela de Vendas Realizadas (PDV e Canais)
CREATE TABLE IF NOT EXISTS ap_sales (
  id TEXT PRIMARY KEY,
  clientName TEXT NOT NULL,
  clientDoc TEXT,
  channel TEXT NOT NULL,
  items JSONB NOT NULL,
  total NUMERIC NOT NULL,
  costTotal NUMERIC NOT NULL,
  status TEXT NOT NULL,
  createdAt TEXT NOT NULL,
  payments JSONB,
  salesperson TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Criação da Tabela de Transações de Fluxo de Caixa (Financeiro)
CREATE TABLE IF NOT EXISTS ap_transactions (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL CHECK (type IN ('Inflow', 'Outflow')),
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  date TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Criação da Tabela de Pedidos Online / Encomendas da Vitrine
CREATE TABLE IF NOT EXISTS ap_online_orders (
  id TEXT PRIMARY KEY,
  clientName TEXT NOT NULL,
  total NUMERIC NOT NULL,
  status TEXT NOT NULL,
  items JSONB NOT NULL,
  createdAt TEXT NOT NULL,
  phone TEXT,
  address TEXT,
  paymentMethod TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Criação da Tabela de Configurações do Sistema Geral (Google Workspace, Dados da Loja, Logo, etc.)
CREATE TABLE IF NOT EXISTS ap_system_configs (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Habilitar Row Level Security (RLS) para todas as tabelas
ALTER TABLE ap_team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE ap_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE ap_clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE ap_sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE ap_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE ap_online_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE ap_system_configs ENABLE ROW LEVEL SECURITY;

-- Apagar políticas antigas para evitar sobreposições
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

-- 1. Políticas de Segurança para ap_team_members (Funcionários)
CREATE POLICY "Leitura de Equipes para Login" ON ap_team_members FOR SELECT USING (true);
CREATE POLICY "Escrita de Equipes apenas para Admin e Gerente" ON ap_team_members FOR ALL USING (
  coalesce(current_setting('request.jwt.claims', true)::jsonb ->> 'role', '') IN ('service_role', 'admin')
  OR EXISTS (
    SELECT 1 FROM ap_team_members
    WHERE login = coalesce(current_setting('request.jwt.claims', true)::jsonb ->> 'email', '')
    AND role IN ('Admin', 'Gerente')
  )
) WITH CHECK (true);

-- 2. Políticas de Segurança para ap_products (Produtos)
CREATE POLICY "Visualização pública de produtos" ON ap_products FOR SELECT USING (true);
CREATE POLICY "Gerenciamento de produtos restrito a Admin e Gerente" ON ap_products FOR ALL USING (
  coalesce(current_setting('request.jwt.claims', true)::jsonb ->> 'role', '') IN ('service_role', 'admin')
  OR EXISTS (
    SELECT 1 FROM ap_team_members
    WHERE login = coalesce(current_setting('request.jwt.claims', true)::jsonb ->> 'email', '')
    AND role IN ('Admin', 'Gerente')
  )
) WITH CHECK (true);

-- 3. Políticas de Segurança para ap_clients (Clientes CRM)
CREATE POLICY "Segurança no cadastro de clientes" ON ap_clients FOR ALL USING (
  coalesce(current_setting('request.jwt.claims', true)::jsonb ->> 'role', '') IN ('service_role', 'admin')
  OR EXISTS (
    SELECT 1 FROM ap_team_members
    WHERE login = coalesce(current_setting('request.jwt.claims', true)::jsonb ->> 'email', '')
    AND role IN ('Admin', 'Gerente', 'Vendedor')
  )
  OR id = coalesce(current_setting('request.jwt.claims', true)::jsonb ->> 'sub', '')
) WITH CHECK (true);

-- 4. Políticas de Segurança para ap_sales (Vendas)
CREATE POLICY "Segurança avançada de vendas" ON ap_sales FOR ALL USING (
  coalesce(current_setting('request.jwt.claims', true)::jsonb ->> 'role', '') IN ('service_role', 'admin')
  OR EXISTS (
    SELECT 1 FROM ap_team_members
    WHERE login = coalesce(current_setting('request.jwt.claims', true)::jsonb ->> 'email', '')
    AND role IN ('Admin', 'Gerente', 'Vendedor')
  )
  -- Clientes só recebem atualizações de suas próprias compras
  OR clientName = coalesce(current_setting('request.jwt.claims', true)::jsonb -> 'user_metadata' ->> 'name', '')
  OR clientDoc = coalesce(current_setting('request.jwt.claims', true)::jsonb -> 'user_metadata' ->> 'cpf', '')
) WITH CHECK (true);

-- 5. Políticas de Segurança para ap_transactions (Financeiro)
CREATE POLICY "Fluxo de caixa restrito a Admin e Gerente" ON ap_transactions FOR ALL USING (
  coalesce(current_setting('request.jwt.claims', true)::jsonb ->> 'role', '') IN ('service_role', 'admin')
  OR EXISTS (
    SELECT 1 FROM ap_team_members
    WHERE login = coalesce(current_setting('request.jwt.claims', true)::jsonb ->> 'email', '')
    AND role IN ('Admin', 'Gerente')
  )
) WITH CHECK (true);

-- 6. Políticas de Segurança para ap_online_orders (Pedidos Online)
CREATE POLICY "Segurança em pedidos de logística" ON ap_online_orders FOR ALL USING (
  coalesce(current_setting('request.jwt.claims', true)::jsonb ->> 'role', '') IN ('service_role', 'admin')
  OR EXISTS (
    SELECT 1 FROM ap_team_members
    WHERE login = coalesce(current_setting('request.jwt.claims', true)::jsonb ->> 'email', '')
    AND role IN ('Admin', 'Gerente', 'Vendedor')
  )
  -- Entregadores apenas de suas entregas
  OR motoboy = coalesce(current_setting('request.jwt.claims', true)::jsonb -> 'user_metadata' ->> 'name', '')
  -- Clientes apenas de seus próprios pedidos
  OR clientName = coalesce(current_setting('request.jwt.claims', true)::jsonb -> 'user_metadata' ->> 'name', '')
) WITH CHECK (true);

-- 7. Políticas de Segurança para ap_system_configs (Configurações)
CREATE POLICY "Leitura de configurações gerais" ON ap_system_configs FOR SELECT USING (true);
CREATE POLICY "Escrita de configurações apenas Admin e Gerente" ON ap_system_configs FOR ALL USING (
  coalesce(current_setting('request.jwt.claims', true)::jsonb ->> 'role', '') IN ('service_role', 'admin')
  OR EXISTS (
    SELECT 1 FROM ap_team_members
    WHERE login = coalesce(current_setting('request.jwt.claims', true)::jsonb ->> 'email', '')
    AND role IN ('Admin', 'Gerente')
  )
) WITH CHECK (true);

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
      return null;
    }
    return (data || []).map((item: any) => ({
      id: item.id,
      name: item.name,
      login: item.login,
      password: item.password,
      role: item.role as any,
      details: item.details || '',
      birthDate: item.birthDate || '',
      createdAt: item.createdAt || item.created_at || (new Date().toISOString()),
      avatar: item.avatar || ''
    }));
  } catch (err) {
    console.error('Failed to download members:', err);
    return null;
  }
}

export async function syncBulkTeamMembersToSupabase(members: TeamMember[]): Promise<boolean> {
  const client = getSupabaseClient();
  if (!client) return false;
  try {
    const payloads = members.map(m => ({
      id: m.id,
      name: m.name,
      login: m.login.toLowerCase().trim().replace(/\s+/g, ''),
      password: m.password || '123',
      role: m.role,
      details: m.details || '',
      birthDate: m.birthDate || '',
      createdAt: m.createdAt || new Date().toISOString(),
      avatar: m.avatar || ''
    }));
    const { error } = await client
      .from('ap_team_members')
      .upsert(payloads, { onConflict: 'id' });
    if (error) {
      handleSchemaError(error, 'ap_team_members');
      return false;
    }
    return true;
  } catch (err) {
    console.error('Failed bulk team sync:', err);
    return false;
  }
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
      return null;
    }
    return (data || []).map((p: any) => ({
      id: p.id,
      name: p.name,
      sku: p.sku,
      category: p.category,
      price: Number(p.price),
      cost: Number(p.cost),
      stock: p.stock,
      minStock: p.minStock,
      image: p.image,
      images: Array.isArray(p.images) ? p.images : [],
      salesCount: p.salesCount || 0,
      description: p.description || '',
      videoUrl: p.videoUrl || '',
      colors: Array.isArray(p.colors) ? p.colors : [],
      sizes: Array.isArray(p.sizes) ? p.sizes : [],
      sizeColors: p.size_colors || {}
    }));
  } catch (err) {
    console.error('Failed fetching products:', err);
    return null;
  }
}

export async function syncBulkProductsToSupabase(products: any[]): Promise<boolean> {
  const client = getSupabaseClient();
  if (!client || products.length === 0) return false;
  try {
    const payloadsWithCol = products.map(p => ({
      id: p.id,
      name: p.name,
      sku: p.sku,
      category: p.category,
      price: p.price,
      cost: p.cost,
      stock: p.stock,
      minStock: p.minStock,
      image: p.image,
      images: p.images || [],
      salesCount: p.salesCount || 0,
      description: p.description || '',
      videoUrl: p.videoUrl || '',
      colors: p.colors || [],
      sizes: p.sizes || [],
      size_colors: p.sizeColors || {}
    }));
    const { error } = await client.from('ap_products').upsert(payloadsWithCol, { onConflict: 'id' });
    if (error) {
      // Se a coluna ainda nao existe no Supabase, tenta enviar sem ela para nao quebrar a sincronizacao
      if (error.message && (error.message.includes('size_colors') || error.message.includes('does not exist') || error.code === '42703')) {
        console.warn('[Supabase Sync] Coluna size_colors nao encontrada, reenviando sem ela...');
        const payloadsWithoutCol = products.map(p => ({
          id: p.id,
          name: p.name,
          sku: p.sku,
          category: p.category,
          price: p.price,
          cost: p.cost,
          stock: p.stock,
          minStock: p.minStock,
          image: p.image,
          images: p.images || [],
          salesCount: p.salesCount || 0,
          description: p.description || '',
          videoUrl: p.videoUrl || '',
          colors: p.colors || [],
          sizes: p.sizes || []
        }));
        const { error: retryError } = await client.from('ap_products').upsert(payloadsWithoutCol, { onConflict: 'id' });
        if (retryError) {
          handleSchemaError(retryError, 'ap_products');
          return false;
        }
        return true;
      }
      handleSchemaError(error, 'ap_products');
      return false;
    }
    return true;
  } catch (err) {
    console.error('Failed bulk products sync:', err);
    return false;
  }
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
      return null;
    }
    return (data || []).map((c: any) => ({
      id: c.id,
      name: c.name,
      email: c.email || '',
      phone: c.phone || '',
      cpf: c.cpf || '',
      birthDate: c.birthDate || '',
      whatsapp: c.whatsapp || '',
      addressStreet: c.addressStreet || '',
      addressNum: c.addressNum || '',
      addressComp: c.addressComp || '',
      addressBairro: c.addressBairro || '',
      addressCidade: c.addressCidade || '',
      addressEstado: c.addressEstado || '',
      addressCep: c.addressCep || '',
      channel: c.channel || 'Balcão',
      npsScore: c.npsScore || 0,
      totalSpent: Number(c.totalSpent || 0),
      ordersCount: c.ordersCount || 0,
      createdAt: c.created_at || new Date().toISOString(),
      cashbackBalance: Number(c.cashbackBalance || 0),
      busto: c.busto ? Number(c.busto) : undefined,
      cintura: c.cintura ? Number(c.cintura) : undefined,
      quadril: c.quadril ? Number(c.quadril) : undefined,
      coxa: c.coxa ? Number(c.coxa) : undefined,
      altura: c.altura ? Number(c.altura) : undefined,
      peso: c.peso ? Number(c.peso) : undefined
    }));
  } catch (err) {
    console.error('Failed fetching clients:', err);
    return null;
  }
}

export async function syncBulkClientsToSupabase(clientsList: any[]): Promise<boolean> {
  const client = getSupabaseClient();
  if (!client || clientsList.length === 0) return false;
  try {
    const payloads = clientsList.map(c => ({
      id: c.id,
      name: c.name,
      email: c.email || '',
      phone: c.phone || '',
      cpf: c.cpf || '',
      birthDate: c.birthDate || '',
      whatsapp: c.whatsapp || '',
      addressStreet: c.addressStreet || '',
      addressNum: c.addressNum || '',
      addressComp: c.addressComp || '',
      addressBairro: c.addressBairro || '',
      addressCidade: c.addressCidade || '',
      addressEstado: c.addressEstado || '',
      addressCep: c.addressCep || '',
      channel: c.channel || 'Balcão',
      npsScore: c.npsScore || 0,
      totalSpent: c.totalSpent || 0,
      ordersCount: c.ordersCount || 0,
      cashbackBalance: c.cashbackBalance || 0,
      busto: c.busto || null,
      cintura: c.cintura || null,
      quadril: c.quadril || null,
      coxa: c.coxa || null,
      altura: c.altura || null,
      peso: c.peso || null
    }));
    const { error } = await client.from('ap_clients').upsert(payloads, { onConflict: 'id' });
    if (error) {
      handleSchemaError(error, 'ap_clients');
      return false;
    }
    return true;
  } catch (err) {
    console.error('Failed bulk clients sync:', err);
    return false;
  }
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
      return null;
    }
    return (data || []).map((s: any) => ({
      id: s.id,
      clientName: s.clientName,
      clientDoc: s.clientDoc || '',
      channel: s.channel,
      items: Array.isArray(s.items) ? s.items : [],
      total: Number(s.total),
      costTotal: Number(s.costTotal || 0),
      status: s.status,
      createdAt: s.createdAt,
      payments: Array.isArray(s.payments) ? s.payments : [],
      salesperson: s.salesperson || ''
    }));
  } catch (err) {
    console.error('Failed fetching sales:', err);
    return null;
  }
}

export async function syncBulkSalesToSupabase(salesList: any[]): Promise<boolean> {
  const client = getSupabaseClient();
  if (!client || salesList.length === 0) return false;
  try {
    const payloads = salesList.map(s => ({
      id: s.id,
      clientName: s.clientName,
      clientDoc: s.clientDoc || '',
      channel: s.channel,
      items: s.items || [],
      total: s.total,
      costTotal: s.costTotal || 0,
      status: s.status,
      createdAt: s.createdAt,
      payments: s.payments || [],
      salesperson: s.salesperson || ''
    }));
    const { error } = await client.from('ap_sales').upsert(payloads, { onConflict: 'id' });
    if (error) {
      handleSchemaError(error, 'ap_sales');
      return false;
    }
    return true;
  } catch (err) {
    console.error('Failed bulk sales sync:', err);
    return false;
  }
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
      return null;
    }
    return (data || []).map((t: any) => ({
      id: t.id,
      type: t.type,
      category: t.category,
      description: t.description,
      amount: Number(t.amount),
      date: t.date
    }));
  } catch (err) {
    console.error('Failed fetching transactions:', err);
    return null;
  }
}

export async function syncBulkTransactionsToSupabase(transactionsList: any[]): Promise<boolean> {
  const client = getSupabaseClient();
  if (!client || transactionsList.length === 0) return false;
  try {
    const payloads = transactionsList.map(t => ({
      id: t.id,
      type: t.type,
      category: t.category,
      description: t.description,
      amount: t.amount,
      date: t.date
    }));
    const { error } = await client.from('ap_transactions').upsert(payloads, { onConflict: 'id' });
    if (error) {
      handleSchemaError(error, 'ap_transactions');
      return false;
    }
    return true;
  } catch (err) {
    console.error('Failed bulk transactions sync:', err);
    return false;
  }
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
      return null;
    }
    return (data || []).map((o: any) => ({
      id: o.id,
      clientName: o.clientName,
      total: Number(o.total),
      status: o.status,
      items: Array.isArray(o.items) ? o.items : [],
      createdAt: o.createdAt,
      phone: o.phone || '',
      address: o.address || '',
      paymentMethod: o.paymentMethod || ''
    }));
  } catch (err) {
    console.error('Failed fetching online orders:', err);
    return null;
  }
}

export async function syncBulkOnlineOrdersToSupabase(ordersList: any[]): Promise<boolean> {
  const client = getSupabaseClient();
  if (!client || ordersList.length === 0) return false;
  try {
    const payloads = ordersList.map(o => ({
      id: o.id,
      clientName: o.clientName,
      total: o.total,
      status: o.status,
      items: o.items || [],
      createdAt: o.createdAt,
      phone: o.phone || '',
      address: o.address || '',
      paymentMethod: o.paymentMethod || ''
    }));
    const { error } = await client.from('ap_online_orders').upsert(payloads, { onConflict: 'id' });
    if (error) {
      handleSchemaError(error, 'ap_online_orders');
      return false;
    }
    return true;
  } catch (err) {
    console.error('Failed bulk online orders sync:', err);
    return false;
  }
}


/**
 * ------------------- 7. SYSTEM CONFIGS SYNC (Google Workspace keys, Store specs, logo, slide assets, rates etc.) -------------------
 */
const CRITICAL_CONFIG_KEYS = [
  'ap_store_name',
  'ap_store_cnpj',
  'ap_store_address',
  'ap_store_phone',
  'ap_store_footer',
  'ap_store_logo',
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
