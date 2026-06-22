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
}

// Retrieves configuration dynamically from localStorage
export function getSupabaseConfig() {
  const url = localStorage.getItem('ap_supabase_url') || '';
  const key = localStorage.getItem('ap_supabase_key') || '';
  
  if (!url || !key || url.includes('suachave') || key.includes('suachave')) {
    return null;
  }
  return { url, key };
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

// SQL Script template to configure the table in Supabase
export const SUPABASE_SQL_SETUP = `-- Script de Configuração para AP Moda Fitness
-- COPIE E COLE ESTE SCRIPT NO CONSOLE SQL DO SUPABASE (SQL Editor)

-- 1. Criação do Diretório de Funcionários / Equipe & Credenciais
CREATE TABLE IF NOT EXISTS ap_team_members (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  login TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('Admin', 'Gerente', 'Vendedor', 'Parceiro', 'Entregador')),
  details TEXT,
  birthDate TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  createdAt TEXT
);

-- Habilitar acesso público / RLS para testes rápidos ou regras flexíveis
ALTER TABLE ap_team_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Acesso Total para AP Moda" ON ap_team_members 
  FOR ALL USING (true) WITH CHECK (true);

-- 2. Inserir Administrador Inicial Administrador Padrão (Ana Paula Admin / Ap01695*)
INSERT INTO ap_team_members (id, name, login, password, role, details, createdAt)
VALUES 
  ('usr-1', 'Ana Paula Admin', 'admin', 'Ap01695*', 'Admin', 'Administradora Geral', NOW()::text)
ON CONFLICT (login) DO UPDATE 
SET password = EXCLUDED.password;
`;

/**
 * Downloads all team members from Supabase.
 * Returns null if Supabase is offline or the table is not found.
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
      console.warn('Error downloading from Supabase table "ap_team_members":', error);
      return null;
    }
    
    if (data) {
      return data.map((item: any) => ({
        id: item.id,
        name: item.name,
        login: item.login,
        password: item.password,
        role: item.role as any,
        details: item.details || '',
        birthDate: item.birthDate || '',
        createdAt: item.createdAt || item.created_at || (new Date().toISOString())
      }));
    }
    return [];
  } catch (err) {
    console.error('Failed to download from Supabase:', err);
    return null;
  }
}

/**
 * Upserts a single user/credential to Supabase.
 */
export async function upsertTeamMemberToSupabase(member: TeamMember): Promise<boolean> {
  const client = getSupabaseClient();
  if (!client) return false;
  
  try {
    const payload = {
      id: member.id,
      name: member.name,
      login: member.login.toLowerCase().trim().replace(/\s+/g, ''),
      password: member.password || '123',
      role: member.role,
      details: member.details || '',
      birthDate: member.birthDate || '',
      createdAt: member.createdAt || new Date().toISOString()
    };
    
    const { error } = await client
      .from('ap_team_members')
      .upsert(payload, { onConflict: 'id' });
      
    if (error) {
      console.error('Error upserting member to Supabase:', error);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Failed to upsert to Supabase:', err);
    return false;
  }
}

/**
 * Deletes a team member in Supabase
 */
export async function deleteTeamMemberFromSupabase(id: string): Promise<boolean> {
  const client = getSupabaseClient();
  if (!client) return false;
  
  try {
    const { error } = await client
      .from('ap_team_members')
      .delete()
      .eq('id', id);
      
    if (error) {
      console.error('Error deleting member from Supabase:', error);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Failed to delete to Supabase:', err);
    return false;
  }
}

/**
 * Perform full bulk synchronization of all team members.
 */
export async function syncBulkTeamMembersToSupabase(members: TeamMember[]): Promise<boolean> {
  const client = getSupabaseClient();
  if (!client) return false;
  
  try {
    // Upsert multiple
    const payloads = members.map(m => ({
      id: m.id,
      name: m.name,
      login: m.login.toLowerCase().trim().replace(/\s+/g, ''),
      password: m.password || '123',
      role: m.role,
      details: m.details || '',
      birthDate: m.birthDate || '',
      createdAt: m.createdAt || new Date().toISOString()
    }));
    
    const { error } = await client
      .from('ap_team_members')
      .upsert(payloads, { onConflict: 'id' });
      
    if (error) {
      console.error('Bulk sync to Supabase failed:', error);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Failed bulk sync to Supabase:', err);
    return false;
  }
}
