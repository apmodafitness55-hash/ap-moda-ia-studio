/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;

// Set high body payload limit for base64 image uploads
app.use(express.json({ limit: '10mb' }));

// Lazy-initialized Gemini Client to prevent crashes during container start
const aiClientsMap = new Map<string, GoogleGenAI>();
function getGeminiClient(customApiKey?: string): GoogleGenAI {
  const apiKey = customApiKey || process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('A chave de API GEMINI_API_KEY ou VITE_GEMINI_API_KEY não foi configurada nas variáveis de ambiente. Defina-a em no painel Ajustes > Segredos do AI Studio.');
  }
  let client = aiClientsMap.get(apiKey);
  if (!client) {
    client = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
    aiClientsMap.set(apiKey, client);
  }
  return client;
}

// Helper to convert images (Base64 data URIs or hosted ImgBB URLs) into Gemini-friendly inline format
async function fetchImageAsBase64(url: string): Promise<{ mimeType: string; data: string }> {
  if (url.startsWith('data:image/')) {
    const matches = url.match(/^data:(image\/[a-zA-Z0-9.-]+);base64,(.+)$/);
    if (matches && matches.length === 3) {
      return { mimeType: matches[1], data: matches[2] };
    }
    throw new Error('Formato do arquivo de imagem base64 inválido.');
  }

  // Fetch the remote image (e.g., hosted on ImgBB)
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Falha ao obter imagem da nuvem: ${url}`);
    }
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const data = buffer.toString('base64');
    const contentType = response.headers.get('content-type') || 'image/jpeg';
    return { mimeType: contentType, data };
  } catch (error: any) {
    throw new Error(`Erro ao buscar imagem no link externo (${url}): ${error.message}`);
  }
}

// Helper to clean up cryptically raw Gemini JSON errors
function cleanGeminiError(error: any): string {
  const errStr = String(error?.message || error || '');
  try {
    if (errStr.trim().startsWith('{')) {
      const parsed = JSON.parse(errStr);
      if (parsed.error && parsed.error.message) {
        return parsed.error.message;
      }
    }
  } catch (ex) {}

  if (errStr.includes('503') || errStr.toLowerCase().includes('unavailable') || errStr.toLowerCase().includes('high demand') || errStr.toLowerCase().includes('overloaded')) {
    return 'O servidor do Gemini está com alta demanda temporária neste momento. Por favor, aguarde alguns instantes e clique no botão novamente.';
  }
  return errStr;
}

// Wrapper to perform Gemini model generation with a robust retry mechanism (backoff)
async function generateContentWithRetry(params: { model: string; contents: any }, customApiKey?: string): Promise<any> {
  const ai = getGeminiClient(customApiKey);
  const maxRetries = 3;
  let delay = 600;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await ai.models.generateContent(params);
      return response;
    } catch (error: any) {
      const errStr = String(error?.message || error || '');
      const is503 = errStr.includes('503') || errStr.toLowerCase().includes('unavailable') || errStr.toLowerCase().includes('high demand') || errStr.toLowerCase().includes('resource_exhausted') || errStr.toLowerCase().includes('overloaded');
      
      console.warn(`[Gemini Retry Alert] Tentativa ${attempt} de geração falhou. Erro:`, errStr);
      
      if (is503 && attempt < maxRetries) {
        console.log(`[Gemini Retry System] Aguardando ${delay}ms devido a alta demanda (503), e tentando novamente...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        delay *= 2; // exponential backoff
        continue;
      }
      throw error;
    }
  }
}

// API Routes

const CONFIG_FILE_PATH = path.join(process.cwd(), 'supabase_config.json');

// GET unified Supabase configuration for all devices
app.get('/api/supabase-config', (req, res) => {
  try {
    if (fs.existsSync(CONFIG_FILE_PATH)) {
      const data = fs.readFileSync(CONFIG_FILE_PATH, 'utf-8');
      const config = JSON.parse(data);
      return res.json(config);
    }
  } catch (err) {
    console.error('[Config Server] Erro ao ler arquivo de configuração do Supabase:', err);
  }

  // Fallback to environment variables (Vite-prefixed, standard or anon key) or defaults
  const fallbackUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || 'https://ckrwmdaocoyigpmzpdyz.supabase.co';
  const fallbackKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_KEY || process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNrcndtZGFvY295aWdwbXpwZHl6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE1NDk2NzMsImV4cCI6MjA5NzEyNTY3M30.20vJ4pjavzl06v1dOIbx9rkxf7kc_72ApGgD6jCRiss';
  
  res.json({ url: fallbackUrl, key: fallbackKey });
});

// POST unified Supabase configuration from any admin device
app.post('/api/supabase-config', (req, res) => {
  try {
    const { url, key } = req.body;
    if (!url || !key) {
      return res.status(400).json({ error: 'Parâmetros url e key são obrigatórios.' });
    }

    const config = { url: url.trim(), key: key.trim() };
    fs.writeFileSync(CONFIG_FILE_PATH, JSON.stringify(config, null, 2), 'utf-8');
    
    console.log('[Supabase Central Config] Configuração unificada salva com sucesso pelo painel do usuário:', url);
    res.json({ success: true, url });
  } catch (err: any) {
    console.error('[Config Server] Erro ao gravar arquivo de configuração unificado:', err);
    res.status(500).json({ error: 'Erro ao gravar persistência central das chaves.' });
  }
});

// GET & POST automatic payment Webhook for Pix/Gateways (Mercado Pago, Asaas, etc)
app.post('/api/webhook/payment', async (req, res) => {
  try {
    const orderId = req.body.orderId || req.query.orderId || req.body.externalReference || req.body.payment?.externalReference || req.body.external_reference || req.body.data?.external_reference || req.body.id;
    
    if (!orderId) {
      console.warn('[Webhook Warning] Notificação de Webhook recebida sem ID de pedido legível:', req.body);
      return res.status(400).json({ error: 'Nenhum identificador de pedido (orderId, externalReference, etc) encontrado no payload do webhook.' });
    }

    console.log(`[Webhook Web] Iniciando processamento de pagamento para o pedido: ${orderId}`);

    // Instancia o cliente do Supabase
    const CONFIG_FILE_PATH = path.join(process.cwd(), 'supabase_config.json');
    let url = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || 'https://ckrwmdaocoyigpmzpdyz.supabase.co';
    let key = process.env.VITE_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_KEY || process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_KEY || '';

    if (fs.existsSync(CONFIG_FILE_PATH)) {
      try {
        const data = fs.readFileSync(CONFIG_FILE_PATH, 'utf-8');
        const config = JSON.parse(data);
        if (config.url && config.key) {
          url = config.url;
          key = config.key;
        }
      } catch (err) {}
    }

    const supabase = createClient(url, key);

    // 1. Busca o pedido online
    const { data: order, error: fetchError } = await supabase
      .from('ap_online_orders')
      .select('*')
      .eq('id', orderId)
      .single();

    if (fetchError || !order) {
      console.log(`[Webhook Info] Pedido ${orderId} não encontrado no Supabase. Pode ser uma notificação teste ou ping do gateway.`);
      return res.json({ success: false, message: `Pedido ${orderId} não localizado na tabela ap_online_orders.` });
    }

    // 2. Verifica se já está pago
    const currentStatus = String(order.status || '').toLowerCase();
    const currentStatusPag = String(order.status_pagamento || '').toLowerCase();
    if (currentStatus === 'pago' || currentStatusPag === 'pago') {
      console.log(`[Webhook Success] Pedido ${orderId} já estava marcado como pago anteriormente.`);
      return res.json({ success: true, message: `O pedido ${orderId} já constava como pago.` });
    }

    // 3. Atualiza o status do pedido para 'Pago'
    const { error: updateError } = await supabase
      .from('ap_online_orders')
      .update({ status: 'Pago', status_pagamento: 'pago' })
      .eq('id', orderId);

    if (updateError) {
      console.error(`[Webhook Error] Erro ao atualizar status do pedido no Supabase:`, updateError);
      return res.status(500).json({ error: 'Erro ao atualizar o status do pedido no banco de dados.' });
    }

    // 4. DISPARO DE ESTOQUE: Baixa de produtos no estoque
    const items = Array.isArray(order.items) ? order.items : [];
    const stockUpdates: any[] = [];

    for (const item of items) {
      let productId = item.productId;
      let productName = item.productName || '';
      let quantityToDeduct = Number(item.quantity || 1);

      let product = null;
      if (productId) {
        const { data } = await supabase.from('ap_products').select('*').eq('id', productId).single();
        product = data;
      } else if (productName) {
        // Fallback por correspondência de nome (se o pedido veio sem ID de produto de versões antigas do catálogo)
        const cleanName = productName.split(' (')[0].trim();
        const { data } = await supabase.from('ap_products').select('*').ilike('name', cleanName).limit(1);
        if (data && data.length > 0) {
          product = data[0];
        }
      }

      if (product) {
        const oldStock = Number(product.stock || 0);
        const newStock = Math.max(0, oldStock - quantityToDeduct);

        let updatedColorStocks = product.color_stocks || product.colorStocks || {};
        let updatedSizeColorStocks = product.size_color_stocks || product.sizeColorStocks || {};

        const sz = item.size;
        const col = item.color;

        if (sz && col && updatedSizeColorStocks[sz] && updatedSizeColorStocks[sz][col] !== undefined) {
          updatedSizeColorStocks[sz][col] = Math.max(0, Number(updatedSizeColorStocks[sz][col]) - quantityToDeduct);
        }
        if (col && updatedColorStocks[col] !== undefined) {
          updatedColorStocks[col] = Math.max(0, Number(updatedColorStocks[col]) - quantityToDeduct);
        }

        const { error: prodUpdateError } = await supabase
          .from('ap_products')
          .update({
            stock: newStock,
            salesCount: Number(product.salesCount || 0) + quantityToDeduct,
            color_stocks: updatedColorStocks,
            colorStocks: updatedColorStocks,
            size_color_stocks: updatedSizeColorStocks,
            sizeColorStocks: updatedSizeColorStocks
          })
          .eq('id', product.id);

        if (!prodUpdateError) {
          stockUpdates.push({
            id: product.id,
            name: product.name,
            oldStock,
            newStock
          });
        }
      }
    }

    // 5. Registra transação de entrada financeira
    const txId = `t-web-${Date.now()}`;
    await supabase.from('ap_transactions').insert([{
      id: txId,
      type: 'Inflow',
      category: 'Venda',
      description: `Pix Automático Webhook: Pedido ${orderId.toUpperCase()} de ${order.clientName}`,
      amount: Number(order.total || 0),
      date: new Date().toISOString(),
      status: 'pago'
    }]);

    console.log(`[Webhook Success] Pedido ${orderId} processado e estoque deduzido para:`, stockUpdates);

    return res.json({
      success: true,
      message: 'Webhook processado com sucesso! Status do pedido atualizado para Pago e estoque deduzido.',
      orderId,
      updatedProducts: stockUpdates,
      transactionId: txId
    });

  } catch (err: any) {
    console.error('[Webhook Critical Error] Erro ao executar processamento de webhook:', err);
    return res.status(500).json({ error: 'Erro interno durante o processamento do webhook.' });
  }
});

// Helper to initialize Supabase on Server with bypass capabilities (service_role if available)
function getSupabaseServerClient() {
  const CONFIG_FILE_PATH = path.join(process.cwd(), 'supabase_config.json');
  let url = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || 'https://ckrwmdaocoyigpmzpdyz.supabase.co';
  let key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_KEY || process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_KEY || '';

  if (fs.existsSync(CONFIG_FILE_PATH)) {
    try {
      const data = fs.readFileSync(CONFIG_FILE_PATH, 'utf-8');
      const config = JSON.parse(data);
      if (config.url && config.key) {
        url = config.url;
        key = config.service_role_key || config.key;
      }
    } catch (err) {}
  }
  return createClient(url, key);
}

// ------------------- SUPABASE SECURE PROXY ROUTING -------------------

// Upload de imagens diretamente no Supabase Storage Bucket (Substitui ImgBB)
app.post('/api/proxy/upload-image', async (req, res) => {
  try {
    const { file, name } = req.body;
    if (!file || !name) {
      return res.status(400).json({ error: 'Arquivo e nome são obrigatórios.' });
    }

    const match = file.match(/^data:(.+);base64,(.+)$/);
    if (!match) {
      return res.status(400).json({ error: 'Formato Base64 inválido.' });
    }

    const contentType = match[1];
    const base64Data = match[2];
    const buffer = Buffer.from(base64Data, 'base64');

    const supabase = getSupabaseServerClient();

    // Tenta criar o bucket 'ap_images' caso não exista
    try {
      await supabase.storage.createBucket('ap_images', {
        public: true,
        fileSizeLimit: 10485760 // 10MB
      });
    } catch (e) {}

    // Gera um nome único para o arquivo
    const sanitizedName = name.replace(/[^a-zA-Z0-9.]/g, '_');
    const fileName = `${Date.now()}_${sanitizedName}`;

    // Upload para o bucket
    const { data, error } = await supabase.storage.from('ap_images').upload(fileName, buffer, {
      contentType,
      upsert: true
    });

    if (error) {
      throw error;
    }

    // Retorna a URL pública
    const { data: publicUrlData } = supabase.storage.from('ap_images').getPublicUrl(fileName);
    if (!publicUrlData || !publicUrlData.publicUrl) {
      throw new Error('Falha ao gerar URL pública da imagem.');
    }

    res.json({ success: true, url: publicUrlData.publicUrl });
  } catch (err: any) {
    console.error('[Proxy Upload Image] Erro:', err);
    res.status(500).json({ error: err.message || 'Erro durante o upload da imagem.' });
  }
});

// Proxy for Clients CRM
app.get('/api/proxy/clients', async (req, res) => {
  try {
    const supabase = getSupabaseServerClient();
    const { data, error } = await supabase.from('ap_clients').select('*');
    if (error) throw error;
    res.json(data || []);
  } catch (err: any) {
    console.error('[Proxy Clients GET] Erro:', err);
    res.status(500).json({ error: err.message || 'Erro ao consultar clientes.' });
  }
});

app.post('/api/proxy/clients', async (req, res) => {
  try {
    const supabase = getSupabaseServerClient();
    const payloads = req.body;
    const { error } = await supabase.from('ap_clients').upsert(payloads, { onConflict: 'id' });
    if (error) throw error;
    res.json({ success: true });
  } catch (err: any) {
    console.error('[Proxy Clients POST] Erro:', err);
    res.status(500).json({ error: err.message || 'Erro ao sincronizar clientes.' });
  }
});

// Proxy for Sales Records
app.get('/api/proxy/sales', async (req, res) => {
  try {
    const supabase = getSupabaseServerClient();
    const { data, error } = await supabase.from('ap_sales').select('*');
    if (error) throw error;
    res.json(data || []);
  } catch (err: any) {
    console.error('[Proxy Sales GET] Erro:', err);
    res.status(500).json({ error: err.message || 'Erro ao consultar vendas.' });
  }
});

app.post('/api/proxy/sales', async (req, res) => {
  try {
    const supabase = getSupabaseServerClient();
    const payloads = req.body;
    const { error } = await supabase.from('ap_sales').upsert(payloads, { onConflict: 'id' });
    if (error) throw error;
    res.json({ success: true });
  } catch (err: any) {
    console.error('[Proxy Sales POST] Erro:', err);
    res.status(500).json({ error: err.message || 'Erro ao sincronizar vendas.' });
  }
});

app.delete('/api/proxy/sales/:id', async (req, res) => {
  try {
    const supabase = getSupabaseServerClient();
    const { error } = await supabase.from('ap_sales').delete().eq('id', req.params.id);
    if (error) throw error;
    res.json({ success: true });
  } catch (err: any) {
    console.error('[Proxy Sales DELETE] Erro:', err);
    res.status(500).json({ error: err.message || 'Erro ao deletar venda.' });
  }
});

// Proxy for Finance Transactions
app.get('/api/proxy/transactions', async (req, res) => {
  try {
    const supabase = getSupabaseServerClient();
    const { data, error } = await supabase.from('ap_transactions').select('*');
    if (error) throw error;
    res.json(data || []);
  } catch (err: any) {
    console.error('[Proxy Transactions GET] Erro:', err);
    res.status(500).json({ error: err.message || 'Erro ao consultar transações.' });
  }
});

app.post('/api/proxy/transactions', async (req, res) => {
  try {
    const supabase = getSupabaseServerClient();
    const payloads = req.body;
    const { error } = await supabase.from('ap_transactions').upsert(payloads, { onConflict: 'id' });
    if (error) throw error;
    res.json({ success: true });
  } catch (err: any) {
    console.error('[Proxy Transactions POST] Erro:', err);
    res.status(500).json({ error: err.message || 'Erro ao sincronizar transações.' });
  }
});

// Proxy for Online Orders
app.get('/api/proxy/online-orders', async (req, res) => {
  try {
    const supabase = getSupabaseServerClient();
    const { data, error } = await supabase.from('ap_online_orders').select('*');
    if (error) throw error;
    res.json(data || []);
  } catch (err: any) {
    console.error('[Proxy Online Orders GET] Erro:', err);
    res.status(500).json({ error: err.message || 'Erro ao consultar pedidos.' });
  }
});

app.post('/api/proxy/online-orders', async (req, res) => {
  try {
    const supabase = getSupabaseServerClient();
    const payloads = req.body;
    const { error } = await supabase.from('ap_online_orders').upsert(payloads, { onConflict: 'id' });
    if (error) throw error;
    res.json({ success: true });
  } catch (err: any) {
    console.error('[Proxy Online Orders POST] Erro:', err);
    res.status(500).json({ error: err.message || 'Erro ao sincronizar pedidos.' });
  }
});

// Proxy for Abandoned Checkouts
app.get('/api/proxy/checkouts', async (req, res) => {
  try {
    const supabase = getSupabaseServerClient();
    const { data, error } = await supabase.from('ap_checkouts').select('*');
    if (error) throw error;
    res.json(data || []);
  } catch (err: any) {
    console.error('[Proxy Checkouts GET] Erro:', err);
    res.status(500).json({ error: err.message || 'Erro ao consultar checkouts.' });
  }
});

app.post('/api/proxy/checkouts', async (req, res) => {
  try {
    const supabase = getSupabaseServerClient();
    const payloads = req.body;
    const { error } = await supabase.from('ap_checkouts').upsert(payloads, { onConflict: 'id' });
    if (error) throw error;
    res.json({ success: true });
  } catch (err: any) {
    console.error('[Proxy Checkouts POST] Erro:', err);
    res.status(500).json({ error: err.message || 'Erro ao sincronizar checkouts.' });
  }
});

// Proxy for Team Members
app.get('/api/proxy/team-members', async (req, res) => {
  try {
    const supabase = getSupabaseServerClient();
    const { data, error } = await supabase.from('ap_team_members').select('*');
    if (error) throw error;
    res.json(data || []);
  } catch (err: any) {
    console.error('[Proxy Team GET] Erro:', err);
    res.status(500).json({ error: err.message || 'Erro ao consultar equipe.' });
  }
});

app.post('/api/proxy/team-members', async (req, res) => {
  try {
    const supabase = getSupabaseServerClient();
    const payloads = req.body;
    const { error } = await supabase.from('ap_team_members').upsert(payloads, { onConflict: 'id' });
    if (error) throw error;
    res.json({ success: true });
  } catch (err: any) {
    console.error('[Proxy Team POST] Erro:', err);
    res.status(500).json({ error: err.message || 'Erro ao sincronizar equipe.' });
  }
});

app.delete('/api/proxy/team-members/:id', async (req, res) => {
  try {
    const supabase = getSupabaseServerClient();
    const { error } = await supabase.from('ap_team_members').delete().eq('id', req.params.id);
    if (error) throw error;
    res.json({ success: true });
  } catch (err: any) {
    console.error('[Proxy Team DELETE] Erro:', err);
    res.status(500).json({ error: err.message || 'Erro ao remover integrante.' });
  }
});

// Proxy for Products (Write Operations only)
app.post('/api/proxy/products', async (req, res) => {
  try {
    const supabase = getSupabaseServerClient();
    const payloads = req.body;
    const { error } = await supabase.from('ap_products').upsert(payloads, { onConflict: 'id' });
    if (error) throw error;
    res.json({ success: true });
  } catch (err: any) {
    console.error('[Proxy Products POST] Erro:', err);
    res.status(500).json({ error: err.message || 'Erro ao sincronizar produtos.' });
  }
});

app.delete('/api/proxy/products/:id', async (req, res) => {
  try {
    const supabase = getSupabaseServerClient();
    const { error } = await supabase.from('ap_products').delete().eq('id', req.params.id);
    if (error) throw error;
    res.json({ success: true });
  } catch (err: any) {
    console.error('[Proxy Products DELETE] Erro:', err);
    res.status(500).json({ error: err.message || 'Erro ao deletar produto.' });
  }
});

// Proxy for System Configs
app.get('/api/proxy/system-configs', async (req, res) => {
  try {
    const supabase = getSupabaseServerClient();
    const { data, error } = await supabase.from('ap_system_configs').select('key, value');
    if (error) throw error;
    res.json(data || []);
  } catch (err: any) {
    console.error('[Proxy Configs GET] Erro:', err);
    res.status(500).json({ error: err.message || 'Erro ao consultar configurações.' });
  }
});

app.post('/api/proxy/system-configs', async (req, res) => {
  try {
    const supabase = getSupabaseServerClient();
    const payloads = req.body;
    const { error } = await supabase.from('ap_system_configs').upsert(payloads, { onConflict: 'key' });
    if (error) throw error;
    res.json({ success: true });
  } catch (err: any) {
    console.error('[Proxy Configs POST] Erro:', err);
    res.status(500).json({ error: err.message || 'Erro ao sincronizar configurações.' });
  }
});

app.post('/api/proxy/clear-all', async (req, res) => {
  try {
    const supabase = getSupabaseServerClient();
    await supabase.from('ap_products').delete().neq('id', 'dummy_nonexistent_id_value');
    await supabase.from('ap_clients').delete().neq('id', 'dummy_nonexistent_id_value');
    await supabase.from('ap_sales').delete().neq('id', 'dummy_nonexistent_id_value');
    await supabase.from('ap_transactions').delete().neq('id', 'dummy_nonexistent_id_value');
    await supabase.from('ap_online_orders').delete().neq('id', 'dummy_nonexistent_id_value');
    await supabase.from('ap_checkouts').delete().neq('id', 'dummy_nonexistent_id_value');
    await supabase.from('ap_team_members').delete().neq('role', 'Admin');
    res.json({ success: true });
  } catch (err: any) {
    console.error('[Proxy Clear All] Erro:', err);
    res.status(500).json({ error: err.message || 'Erro ao limpar dados.' });
  }
});

// 1. Product Description Generator Agent
app.post('/api/gemini/generate-description', async (req, res) => {
  try {
    const { image, name, materials, style, extraInstructions } = req.body;

    const parts: any[] = [];

    // Add image if provided
    if (image) {
      try {
        const imagePart = await fetchImageAsBase64(image);
        parts.push({
          inlineData: {
            mimeType: imagePart.mimeType,
            data: imagePart.data
          }
        });
      } catch (imgErr: any) {
        console.error('Image processing failure, continuing with text:', imgErr);
        // Do not fail if image is unreachable, try text-only fallback
      }
    }

    const textPrompt = `Analise os dados fornecidos da nova peça de vestuário fitness da marca "AP Moda Fitness" e gere uma descrição comercial premium.

ESPECIFICAÇÕES:
- Nome inicial do produto: ${name || 'Peça Premium'}
- Materiais e Tecidos: ${materials && materials.length > 0 ? materials.join(', ') : 'Não informados (assumir Poliamida premium com Elastano Lybra se necessário)'}
- Tipo de Modelagem/Estilo: ${style || 'Treino, Compressão e Conforto'}
- Toque e Ajustes adicionais solicitados: ${extraInstructions || 'Foco em valorizar as curvas e dar conforto em treinos intensivos.'}

INSTRUÇÕES DE ESCRITA (Tom de Voz: Sofisticado, Apaixonante, Empoderador, Focado no público feminino fitness):
1. Crie um Título Comercial de Luxo para a peça (ex: "Legging Alta Performance Sculp Emana").
2. Escreva um parágrafo introdutório que use "gatilhos de desejo" da moda fitness (durabilidade, caimento perfeito, tecnologia que não fica transparente, toque gelado, zero odor, modelagem empina-bumbum ou proteção UV).
3. Adicione uma Ficha Técnica com a composição (ex: 88% Poliamida, 12% Elastano) e tecnologia têxtil destacada em tópicos de bullet points.
4. Finalize com um parágrafo curto de "Dicas de Estilo & Coordenação" (ex: "Combina perfeitamente com nosso Top Confort ou um Cropped Dry-Fit nos tons neutros para treinos de corrida ou musculação").

Por favor, gere e retorne APENAS a descrição estruturada com formatação Markdown linda, limpa e bem espaçada. Não inclua observações fora do Markdown.`;

    parts.push({ text: textPrompt });

    const clientKey = req.headers['x-gemini-api-key'] as string;
    const response = await generateContentWithRetry({
      model: 'gemini-3.5-flash',
      contents: { parts }
    }, clientKey);

    res.json({ success: true, text: response.text });
  } catch (error: any) {
    console.error('Gemini generate-description error:', error);
    res.status(500).json({ success: false, error: cleanGeminiError(error) });
  }
});

// 2. Trend Hunter & Estilista Virtual Lookbook Agent
app.post('/api/gemini/trends-lookbook', async (req, res) => {
  try {
    const { products, styleTone } = req.body;

    const productNames = (products || []).map((p: any) => `${p.name} (SKU: ${p.sku})`).join(', ');

    const prompt = `Você é a Estilista Principal da "AP Moda Fitness", expert em moda ativa premium.
Com base nestes produtos atualmente disponíveis em nosso estoque:
👉 ${productNames || 'Calças legging, tops, regatas dry-fit, e shorts de compressão.'}

Tonalidade / Vibração do Lookbook desejado: ${styleTone || 'Sustentável urbano, alto-brilho glam, ou performance extrema'}

Sua tarefa é criar 2 ideias criativas de Combos/Looks Coordenados.
Para cada Combo/Look, responda em formato Markdown contendo:
1. **Nome do Look**: Algo marcante (ex: "Look Intense Neon", "Chic Cozy Aeróbico").
2. **Peças Recomendadas**: Quais itens combinar do estoque ou cores correlatas.
3. **Ponto de Destaque da Combinação**: Por que esse look funciona visualmente e funcionalmente (ex: contraste de cores, proporções de silhueta, conforto).
4. **Copy de Venda (Instagram / Reels)**: Um roteiro ou texto pronto para divulgar esses produtos combinados no Feed do Instagram com hashtags e tom convidativo!

Retorne os dois looks divididos de forma elegante com divisórias Markdown.`;

    const clientKey = req.headers['x-gemini-api-key'] as string;
    const response = await generateContentWithRetry({
      model: 'gemini-3.5-flash',
      contents: prompt
    }, clientKey);

    res.json({ success: true, text: response.text });
  } catch (error: any) {
    console.error('Gemini lookbook error:', error);
    res.status(500).json({ success: false, error: cleanGeminiError(error) });
  }
});

// 3. WhatsApp and Instagram SAC outreach Agent
app.post('/api/gemini/whatsapp-script', async (req, res) => {
  try {
    const { scenario, clientName, productDetails } = req.body;

    const prompt = `Você é a Gerente de Relacionamento da "AP Moda Fitness". Escreva um script de atendimento via WhatsApp altamente humanizado, educado, e focado em conversão.

CENÁRIO: ${scenario || 'Recuperação de carrinho abandonado'}
CLIENTE: ${clientName || 'Cliente Especial'}
PRODUTO CITADO: ${productDetails || 'Peça Fitness'}

REGRAS:
- Use emojis moderadamente e que combinem com moda/fitness (🌸, 💪, 🛍️, ✨).
- Crie um senso de simpatia genuína, sem soar robótica.
- Ofereça uma chamada para ação clara, como oferecer ajuda com o tamanho, solicitar foto do look ou enviar link do catálogo simplificado.
- Evite parágrafos gigantes; use quebras de linha para facilitar a leitura rápida no celular.

Retorne duas versões do script:
- **Versão 1 (Curta e Prática)**: Perfeita para contatos rápidos e diretos.
- **Versão 2 (Boutique Personalizada)**: Um atendimento mais detalhado, sugerindo novidades complementares ou cuidado VIP.`;

    const clientKey = req.headers['x-gemini-api-key'] as string;
    const response = await generateContentWithRetry({
      model: 'gemini-3.5-flash',
      contents: prompt
    }, clientKey);

    res.json({ success: true, text: response.text });
  } catch (error: any) {
    console.error('Gemini whatsapp-script error:', error);
    res.status(500).json({ success: false, error: cleanGeminiError(error) });
  }
});

// 3.5. Intelligent Abandoned Cart Recovery Message Agent
app.post('/api/gemini/recovery-message', async (req, res) => {
  try {
    const { clientName, cartItems, total } = req.body;

    const formattedTotal = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(total || 0);
    const itemsText = Array.isArray(cartItems) 
      ? cartItems.map((it: any) => `${it.quantity || it.quantityToDeduct || 1}x ${it.productName || it.product?.name || it.name}`).join(', ')
      : String(cartItems || 'Peças Premium');

    const prompt = `Você é a Consultora de Estilo e Relacionamento da "AP Moda Fitness", uma marca de roupas de ginástica feminina sofisticada e elegante.
Escreva uma mensagem de abordagem de WhatsApp super simpática, descontraída e calorosa para recuperar um carrinho abandonado.

DADOS DA CLIENTE E CARRINHO:
- Primeiro Nome: ${clientName || 'Linda'}
- Produtos esquecidos no carrinho: ${itemsText}
- Valor Total do Carrinho: ${formattedTotal}

DIRETRIZES DE ESTILO DO TEXTO (MUITO IMPORTANTE):
1. Use o primeiro nome da cliente de forma calorosa e afetiva (ex: "Oi Lu!", "Olá Carol, tudo bem, lindeza?").
2. Evite um tom corporativo engessado ou robótico. Seja como uma amiga que notou que ela esqueceu de finalizar as comprinhas.
3. Demonstre entusiasmo com as peças que ela escolheu (ex: diga que aquele conjunto é incrível, que tem um caimento de tirar o fôlego, ou que é super tecnológico).
4. Ofereça ajuda com tamanhos ou dúvidas de caimento.
5. Deixe claro que as peças ficam reservadas por pouquíssimo tempo no sistema porque a marca tem coleções limitadas e esgota rápido!
6. Forneça um incentivo delicado, como frete grátis ou um cupom surpresa, se ela quiser concluir agora pelo WhatsApp.
7. Escreva de forma espaçada, usando emojis delicados de moda e estilo de forma sutil, sem excesso de texto corporativo.

Retorne APENAS o texto da mensagem persuasiva pronta para ser enviada no WhatsApp. Não inclua nenhuma observação técnica ou introduções comerciais adicionais.`;

    const clientKey = req.headers['x-gemini-api-key'] as string;
    const response = await generateContentWithRetry({
      model: 'gemini-3.5-flash',
      contents: prompt
    }, clientKey);

    res.json({ success: true, text: response.text });
  } catch (error: any) {
    console.error('Gemini recovery-message error:', error);
    res.status(500).json({ success: false, error: cleanGeminiError(error) });
  }
});

// 4. Stock & Profit Sentinel Analyzer Agent
app.post('/api/gemini/stock-sentinel', async (req, res) => {
  try {
    const { productsList } = req.body;

    // Serialize catalog parameters to keep payload light but smart
    const serializedProducts = (productsList || []).map((p: any) => ({
      name: p.name,
      category: p.category,
      stock: p.stock,
      minStock: p.minStock,
      price: p.price,
      salesCount: p.salesCount
    }));

    const prompt = `Você é o "Sentinela de Estoque IA", consultor de inteligência de negócios para a AP Moda Fitness.
Analise os seguintes dados do catálogo atual (estoque, vendas acumuladas e metas mínimas):
${JSON.stringify(serializedProducts, null, 2)}

Elabore um Relatório Executivo Analítico rápido em Markdown. Sua análise deve apontar objetivamente:
1. **Sinal Vermelho (Urgência)**: Quais produtos correm risco crítico de ruptura (estoque abaixo do mínimo) e qual o volume sugerido de reposição imediata.
2. **Estrela das Vendas (Oportunidades)**: Os campeões de vendas e como aproveitá-los mais (ex: aumento de margem, combos recomendados).
3. **Ações de Líquida / Outlet**: Produtos que estão parados no estoque (baixo giro) e estratégias de marketing/desconto sugeridas para girar esse capital de giro.
4. **Conclusão Estratégica**: Uma recomendação gerencial geral baseada nos números para melhorar o fluxo de caixa.

Por favor, seja direto, profissional, analítico e use tabelas Markdown para facilitar a leitura.`;

    const clientKey = req.headers['x-gemini-api-key'] as string;
    const response = await generateContentWithRetry({
      model: 'gemini-3.5-flash',
      contents: prompt
    }, clientKey);

    res.json({ success: true, text: response.text });
  } catch (error: any) {
    console.error('Gemini stock-sentinel error:', error);
    res.status(500).json({ success: false, error: cleanGeminiError(error) });
  }
});

// 5. Campaign Marketing & Slogans Core Agent
app.post('/api/gemini/marketing-campaign', async (req, res) => {
  try {
    const { theme, discount, focusCategory, targetAudience } = req.body;

    const prompt = `Você é o "Diretor de Marketing e Branding IA" no ecossistema "AP Moda Fitness", com foco em vestuário esportivo feminino de luxo.
Gere um planejamento expresso de campanha promocional de alta conversão.

MATRIZ DA CAMPANHA:
- Tema / Data Comemorativa: ${theme || 'Lançamento de Estação'}
- Benefício / Desconto Comercial: ${discount || '15% de Desconto com Cupom FIT15'}
- Categoria / Peças Foco: ${focusCategory || 'Todas as Leggings e Conjuntos'}
- Perfil do Público-Alvo: ${targetAudience || 'Mulheres praticantes de musculação, funcional, corrida e pilates que buscam sofisticação'}

REQUISITOS DO PLANEJAMENTO (Responda em formato Markdown elegante):
1. **Nome da Campanha & Slogan**: Crie um nome cativante de impacto e um slogan poderoso que inspire empoderamento e movimento.
2. **Gatilhos de Marketing & Posicionamento**: Quais ganchos emocionais e racionais usar para essa promoção específica.
3. **Copy de Post Principal (Instagram/TikTok)**: Escreva uma legenda irresistível e estilizada com espaçamentos, emojis discretos de boutique e hashtags.
4. **Cupom de Desconto Exclusivo**: Gere uma palavra-chave/código promocional criativo e estimule o senso de urgência.
5. **Sugestão de Reels / Vídeo Curto**: Descreva o roteiro visual de um vídeo rápido de 15 segundos para stories ou feed que gere engajamento instantâneo.`;

    const clientKey = req.headers['x-gemini-api-key'] as string;
    const response = await generateContentWithRetry({
      model: 'gemini-3.5-flash',
      contents: prompt
    }, clientKey);

    res.json({ success: true, text: response.text });
  } catch (error: any) {
    console.error('Gemini marketing-campaign error:', error);
    res.status(500).json({ success: false, error: cleanGeminiError(error) });
  }
});

// 6. Color Harmony & Pattern Consultant Agent
app.post('/api/gemini/color-consultant', async (req, res) => {
  try {
    const { primaryColor, fabricTexture, usageVibe } = req.body;

    const prompt = `Você é a "Personal Stylist e Specialist em Colorimetria Têxtil IA" da boutique "AP Moda Fitness".
Analise as propriedades físicas e estéticas da cor e textura inseridas e construa um Guia de Coordenação Cromática.

ESPECIFICAÇÕES DE PROMPT:
- Cor Principal da Peça: ${primaryColor || 'Rosa Magenta Chic'}
- Tipo / Textura do Tecido: ${fabricTexture || 'Suplex Cirrê de Alto Brilho'}
- Vibe / Ocasião de Uso: ${usageVibe || 'Treinos Noturnos e Atividades Urbanas Premium'}

RETORNE (Em formato Markdown com formatação impecável):
1. **Análise de Psicologia da Cor**: O que a cor e brilho/textura transmitem e como afetam o humor das clientes no look fitness.
2. **Combinações Monocromáticas & Análogas (Tom sobre Tom)**: Cores exatas para compor um look monocromático luxuoso (ex: Magenta com Rosê ou Violeta) apresentando as hashtags e termos de desejo da moda.
3. **Combinações Complementares & Triádicas (Contraste Moderno)**: Quais recortes ou peças casadas contrastantes oferecer (ex: acessórios neon, pretos profundos, brancos off-white).
4. **Paleta de Cores Recomendada (Visão Pantone Express)**: Descreva de forma textual com blocos de emojis pretos/coloridos simulando a escala de cores ideal para a AP Moda.
5. **Aconselhamento de Modelagem**: Dicas para valorizar a silhueta de quem veste essa textura específica.`;

    const clientKey = req.headers['x-gemini-api-key'] as string;
    const response = await generateContentWithRetry({
      model: 'gemini-3.5-flash',
      contents: prompt
    }, clientKey);

    res.json({ success: true, text: response.text });
  } catch (error: any) {
    console.error('Gemini color-consultant error:', error);
    res.status(500).json({ success: false, error: cleanGeminiError(error) });
  }
});

// 7. Global Fashion Translator Agent
app.post('/api/gemini/fashion-translator', async (req, res) => {
  try {
    const { textToTranslate, targetLanguage } = req.body;

    const prompt = `Você é o "Tradutor Sênior Especializado em Moda Ativa Premium, E-commerce de Luxo e Tecnologia Têxtil".
Sua função é traduzir a descrição de produto fornecida para o idioma selecionado, mantendo toda a sofisticação, precisão técnica têxtil e sensualidade/empoderamento próprios da marca "AP Moda Fitness".

IDIOMA DE DESTINO: ${targetLanguage || 'Inglês (E-commerce EUA)'}
TEXTO ORIGINAL EM PORTUGUÊS:
"${textToTranslate || 'Gere uma tradução padrão de uma legging de alta performance empina-bumbum zero transparência.'}"

INSTRUÇÕES DE TRADUÇÃO:
- Traduza termos característicos da moda fitness nacional de maneira chique e correta no exterior (ex: "empina-bumbum" traduzir como "booty-lifting", "scrunch detail" ou "ruched detailing"; "cós largo duplo" como "high-rise double-layer waistband"; "Fio Emana" como "Emana active infrared technology fabric"; "suplex" como "premium high-compression interlock fabric").
- Garanta que a descrição permaneça fluida, vendedora e atraente para clientes de e-commerce internacional de alto padrão.
- Retorne a tradução estruturada e com espaçamentos limpos em Markdown. Do lado do título traduzido de cada seção, coloque uma pequena flag emoji representativa do idioma.`;

    const clientKey = req.headers['x-gemini-api-key'] as string;
    const response = await generateContentWithRetry({
      model: 'gemini-3.5-flash',
      contents: prompt
    }, clientKey);

    res.json({ success: true, text: response.text });
  } catch (error: any) {
    console.error('Gemini fashion-translator error:', error);
    res.status(500).json({ success: false, error: cleanGeminiError(error) });
  }
});

// 8. Custom Manufacturing Cost & Pricing Analyzer Agent
app.post('/api/gemini/analyze-pricing', async (req, res) => {
  try {
    const { productName, category, costFabric, costLabor, costAccessories, costBranding, fixedOverhead, profitStrategy } = req.body;

    const sumCosts = Number(costFabric || 0) + Number(costLabor || 0) + Number(costAccessories || 0) + Number(costBranding || 0);

    const prompt = `Você é o "Precificador Estratégico IA" da boutique "AP Moda Fitness", especializado em vestuário esportivo feminino premium.
Sua missão é calcular o custo base total de fabricação, analisar a estratégia de margem de lucro ideal adaptada ao nicho de mercado fitwear no Brasil e sugerir o preço de venda ótimo.

DADOS DE CUSTO FORNECIDOS (por peça):
- Nome do Produto: ${productName || 'Nova Peça'}
- Categoria: ${category || 'Vestuário'}
- Custo de Tecidos/Submatérias: R$ ${costFabric || 0}
- Custo de Mão de Obra/Costura/Labor: R$ ${costLabor || 0}
- Custo de Aviamento/Acessórios (elásticos, zíperes, recortes, etc.): R$ ${costAccessories || 0}
- Custo de Embalagem/Tags/Branding Premium: R$ ${costBranding || 0}
- Custos Operacionais / Impostos de Venda Estimados (%): ${fixedOverhead || 10}%
- Estratégia de Precificação sugerida: ${
      profitStrategy === 'popular' ? 'Giro Rápido/Popular (Preços de penetração mais baixos, markup moderado, focado em alto giro de estoque)' :
      profitStrategy === 'premium' ? 'Exclusividade/Luxo Premium (Posicionamento de alto valor, foco em tecidos tecnológicos como cirrê/emana, maior margem, embalagem premium)' :
      'Boutique Padrão (Excelente caimento, markup intermediário equilibrado, alta percepção de valor)'
    }

Sua resposta DEVE ser um relatório financeiro de consultoria profissional e moderno em Markdown:

1. 📊 **Resumo Detalhado dos Custos**:
   - Apresente a soma analítica de custos diretos (Soma dos Insumos Fornecidos: R$ ${sumCosts.toFixed(2)}).
   - Calcule o impacto dos Custos Operacionais/Impostos (${fixedOverhead}%) para determinar o Custo Real Efetivo Unitário.

2. 📈 **Combinação de Preços de Venda Sugeridos**:
   - Defina o **Preço de Venda ideal (PVS)** em destaque para a peça com base na estratégia refinada.
   - Forneça o cálculo detalhado de Lucro Bruto e Margem de Lucro Real (%) sobre o PVS recomendado.
   - Apresente uma tabela Markdown comparativa com 3 faixas de preços (Penetração competitiva, Preço Ideal Recomendado, e Preço de Posicionamento Premium).

3. 🚴‍♀️ **Posicionamento no Nicho Fitness & Percepção de Valor**:
   - Forneça conselhos de como os tecidos tecnológicos (poliamida de alta cobertura, proteção UV, fios inteligentes) elevam o valor percebido das clientes.
   - Defina a Persona Alvo para esta peça (Ex: Mulheres ativas, frequentadoras de estúdios premium).

4. 💎 **Roteiro de Vendas & Objeções de Preço**:
   - Dê 3 "Argumentações de Ouro" ou justificativas táticas que a equipe de vendas da AP Moda Fitness pode usar para converter clientes que questionam o preço.

Use formatação Markdown linda, profissional, tabelas limpas e com formatação de moeda em Real (R$). Seja preciso e direto.`;

    const clientKey = req.headers['x-gemini-api-key'] as string;
    const response = await generateContentWithRetry({
      model: 'gemini-3.5-flash',
      contents: prompt
    }, clientKey);

    res.json({ success: true, text: response.text });
  } catch (error: any) {
    console.error('Gemini analyze-pricing error:', error);
    res.status(500).json({ success: false, error: cleanGeminiError(error) });
  }
});

// 9. Automatic WhatsApp Business API Notifications (Sales and Inventory)
app.post('/api/whatsapp/notify', async (req, res) => {
  try {
    const { 
      token, 
      phoneId, 
      recipient, 
      type, 
      data 
    } = req.body;

    // Resolve credentials (use client override or default environment variables)
    const activeToken = token || process.env.WHATSAPP_API_TOKEN;
    const activePhoneId = phoneId || process.env.WHATSAPP_PHONE_NUMBER_ID;
    const activeRecipient = recipient || process.env.WHATSAPP_RECIPIENT_PHONE;

    // Build the message body based on type
    let messageText = '';
    
    if (type === 'sale_completed') {
      const { id, clientName, itemsCount, total } = data || {};
      const formattedTotal = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(total || 0);
      messageText = `🔔 *AP Moda Fitness - Venda Concluída!*\n\n` +
                    `🛍️ O cliente *${clientName || 'Cliente Especial'}* finalizou uma compra!\n` +
                    `🆔 *Código:* #${(id || '').toUpperCase()}\n` +
                    `📦 *Quantidade:* ${itemsCount || 0} peça(s)\n` +
                    `💰 *Valor Total:* ${formattedTotal}\n\n` +
                    `Status: Pago & Concluído ✅\n` +
                    `Desejamos ótimas vendas! ✨`;
    } else if (type === 'stock_alert') {
      const { name, stock, minStock, sku } = data || {};
      messageText = `🚨 *AP Moda Fitness - Alerta Crítico de Estoque!*\n\n` +
                    `⚠️ O produto *${name || 'Peça'}* atingiu o nível mínimo crítico!\n` +
                    `🏷️ *SKU:* ${sku || 'S/D'}\n` +
                    `📉 *Estoque Atual:* ${stock || 0} un.\n` +
                    `🛑 *Estoque Mínimo:* ${minStock || 0} un.\n\n` +
                    `Recomendamos contatar o fornecedor ou gerar reposição urgente no sistema! 🚚`;
    } else {
      messageText = `ℹ️ *AP Moda Fitness - Notificação Geral*\n\nEste é um disparo de teste automático de integração com o sistema de gestão.`;
    }

    const payload = {
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to: activeRecipient ? activeRecipient.replace(/\D/g, '') : '',
      type: "text",
      text: {
        preview_url: false,
        body: messageText
      }
    };

    // Check if we have active credentials to send to Meta API
    if (activeToken && activePhoneId && activeRecipient) {
      const cleanRecipient = activeRecipient.replace(/\D/g, '');
      const url = `https://graph.facebook.com/v19.0/${activePhoneId}/messages`;
      
      console.log(`[WHATSAPP API] Enviando notificação real para: ${cleanRecipient}`);
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${activeToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const resData = await response.json();
      
      if (!response.ok) {
        console.error('[WHATSAPP API ERROR]', resData);
        throw new Error(resData.error?.message || 'Erro durante envio de API no servidor Meta.');
      }

      res.json({
        success: true,
        simulated: false,
        recipient: cleanRecipient,
        message: 'Mensagem real disparada com sucesso via WhatsApp Cloud API!',
        apiResponse: resData,
        messageText
      });
    } else {
      // Graceful fallback: Perfect visual simulation sandbox
      console.log('--- [WHATSAPP BUSINESS API SIMULATION LOG] ---');
      console.log(`Para: ${activeRecipient || '(Sem destinatário configurado)'}`);
      console.log('Conteúdo da Notificação:');
      console.log(messageText);
      console.log('Payload Técnico de Disparo Meta:');
      console.log(JSON.stringify(payload, null, 2));
      console.log('-----------------------------------------------');

      res.json({
        success: true,
        simulated: true,
        recipient: activeRecipient || '(Simulação - Sem número)',
        message: 'Simulado com sucesso! Como as credenciais da Meta API não estão definidas, a mensagem foi direcionada ao Simulador de Negócios e gravada no console do servidor.',
        messageText,
        payload
      });
    }
  } catch (error: any) {
    console.error('WhatsApp notify error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 10. Google Workspace Manual OAuth integration Configuration & Flow Endpoints
const GOOGLE_CONFIG_PATH = path.join(process.cwd(), 'google-workspace-config.json');

// Interface for google workspace settings
interface GoogleWorkspaceConfig {
  clientId?: string;
  clientSecret?: string;
  redirectUriDev?: string;
  redirectCodeExchangeUri?: string;
}

// Endpoint to fetch current OAuth configuration (excluding secret for security)
app.get('/api/auth/google/config', (req, res) => {
  try {
    if (fs.existsSync(GOOGLE_CONFIG_PATH)) {
      const data = JSON.parse(fs.readFileSync(GOOGLE_CONFIG_PATH, 'utf-8'));
      res.json({
        success: true,
        clientId: data.clientId || '',
        hasClientSecret: !!data.clientSecret,
        redirectUriDev: data.redirectUriDev || '',
      });
    } else {
      res.json({ success: true, clientId: '', hasClientSecret: false });
    }
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Endpoint to save OAuth configuration
app.post('/api/auth/google/config', (req, res) => {
  try {
    const { clientId, clientSecret, redirectUriDev } = req.body;
    let existing: GoogleWorkspaceConfig = {};
    if (fs.existsSync(GOOGLE_CONFIG_PATH)) {
      try {
        existing = JSON.parse(fs.readFileSync(GOOGLE_CONFIG_PATH, 'utf-8'));
      } catch (e) {}
    }
    const updated = {
      ...existing,
      clientId: clientId !== undefined ? clientId : existing.clientId,
      clientSecret: clientSecret !== undefined ? clientSecret : existing.clientSecret,
      redirectUriDev: redirectUriDev !== undefined ? redirectUriDev : existing.redirectUriDev,
    };
    fs.writeFileSync(GOOGLE_CONFIG_PATH, JSON.stringify(updated, null, 2), 'utf-8');
    res.json({ success: true, message: 'Configuração do Google Workspace salva com sucesso!' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Endpoint to generate Google OAuth auth url
app.get('/api/auth/google/url', (req, res) => {
  try {
    if (!fs.existsSync(GOOGLE_CONFIG_PATH)) {
      return res.status(400).json({ success: false, error: 'O Google Client ID ainda não foi configurado.' });
    }
    const config = JSON.parse(fs.readFileSync(GOOGLE_CONFIG_PATH, 'utf-8'));
    if (!config.clientId) {
      return res.status(400).json({ success: false, error: 'O Google Client ID ainda não foi configurado.' });
    }

    const host = req.get('host') || '0.0.0.0:3000';
    const protocol = req.protocol === 'https' || req.headers['x-forwarded-proto'] === 'https' ? 'https' : 'http';
    const redirectUri = `${protocol}://${host}/api/auth/google/callback`;

    // Save this redirect_uri temporarily so callback can use it for code exchange
    config.redirectCodeExchangeUri = redirectUri;
    fs.writeFileSync(GOOGLE_CONFIG_PATH, JSON.stringify(config, null, 2), 'utf-8');

    const scopes = [
      'https://www.googleapis.com/auth/tasks',
      'https://www.googleapis.com/auth/documents',
      'https://www.googleapis.com/auth/calendar',
      'https://www.googleapis.com/auth/gmail.modify',
      'https://www.googleapis.com/auth/gmail.send',
      'https://www.googleapis.com/auth/spreadsheets',
      'https://www.googleapis.com/auth/drive.file',
      'https://www.googleapis.com/auth/userinfo.profile',
      'https://www.googleapis.com/auth/userinfo.email',
      'openid'
    ];

    const params = new URLSearchParams({
      client_id: config.clientId,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: scopes.join(' '),
      access_type: 'offline',
      prompt: 'consent',
    });

    const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
    res.json({ success: true, url: googleAuthUrl, redirectUri });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Endpoint to handle the OAuth redirect callback from Google
app.get('/api/auth/google/callback', async (req, res) => {
  const { code, error } = req.query;
  
  if (error) {
    return res.send(`
      <html>
        <head>
          <title>Erro na Autenticação</title>
          <style>
            body { font-family: -apple-system, sans-serif; text-align: center; padding: 50px; background-color: #0f172a; color: #f8fafc; }
            .card { background: #1e293b; padding: 30px; border-radius: 12px; display: inline-block; max-width: 500px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); }
            h2 { color: #f43f5e; }
          </style>
        </head>
        <body>
          <div class="card">
            <h2>Falha na Autenticação</h2>
            <p>Ocorreu um erro ao autorizar com o Google: ${error}</p>
            <button onclick="window.close()">Fechar Janela</button>
          </div>
        </body>
      </html>
    `);
  }

  if (!code) {
    return res.status(400).send('Código de autorização ausente.');
  }

  try {
    if (!fs.existsSync(GOOGLE_CONFIG_PATH)) {
      throw new Error('Configurações do Google Workspace não encontradas.');
    }
    const config = JSON.parse(fs.readFileSync(GOOGLE_CONFIG_PATH, 'utf-8'));
    if (!config.clientId || !config.clientSecret) {
      throw new Error('Client ID ou Client Secret ausente nas configurações.');
    }

    const redirectUri = config.redirectCodeExchangeUri;
    if (!redirectUri) {
      throw new Error('URI de redirecionamento correspondente não encontrado.');
    }

    // Exchange auth code for tokens
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code: code as string,
        client_id: config.clientId,
        client_secret: config.clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }).toString()
    });

    const tokenData = await tokenResponse.json();

    if (!tokenResponse.ok) {
      console.error('[GOOGLE OAUTH CALLBACK ERROR]', tokenData);
      throw new Error(tokenData.error_description || tokenData.error || 'Falha ao trocar código por tokens.');
    }

    // Get user profile info (name, email, avatar) using the access token
    let userProfile = { name: 'Usuário Google', email: '', picture: '' };
    try {
      const profileRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { 'Authorization': `Bearer ${tokenData.access_token}` }
      });
      if (profileRes.ok) {
        const profileData = await profileRes.json();
        userProfile = {
          name: profileData.name || 'Usuário Google',
          email: profileData.email || '',
          picture: profileData.picture || ''
        };
      }
    } catch (pErr) {
      console.error('Falha ao obter perfil do usuário:', pErr);
    }

    // Return the response to communicating with opener window and store tokens
    const avatarHtml = userProfile.picture 
      ? `<img src="${userProfile.picture}" alt="Avatar"/>` 
      : '<div style="width:36px;height:36px;border-radius:50%;background:#334155;color:#fff;display:flex;align-items:center;justify-content:center;font-weight:bold;">G</div>';

    res.send(`
      <html>
        <head>
          <title>Autenticado com Sucesso!</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; text-align: center; padding: 40px; background-color: #0f172a; color: #f8fafc; }
            .card { background: #1e293b; padding: 40px; border-radius: 16px; display: inline-block; max-width: 450px; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.3); border: 1px solid #334155; }
            h2 { color: #10b981; margin-top: 0; }
            .logo { font-size: 40px; margin-bottom: 20px; }
            p { font-size: 15px; color: #94a3b8; line-height: 1.5; }
            .user-info { display: flex; align-items: center; justify-content: center; gap: 12px; background: #0f172a; padding: 12px; border-radius: 8px; margin: 20px 0; border: 1px solid #1e293b; }
            .user-info img { width: 36px; height: 36px; border-radius: 50%; border: 2px solid #10b981; }
            .user-info .details { text-align: left; }
            .user-info .name { font-weight: bold; font-size: 13px; color: #f8fafc; }
            .user-info .email { font-size: 11px; color: #64748b; }
            button { background: #10b981; color: white; border: none; padding: 10px 20px; border-radius: 8px; font-weight: bold; cursor: pointer; transition: background 0.2s; }
            button:hover { background: #059669; }
          </style>
        </head>
        <body>
          <div class="card">
            <div class="logo">🌸</div>
            <h2>Conexão Estabelecida!</h2>
            <p>O sistema AP Moda Fitness conectou-se com sucesso à sua conta do Google Workspace.</p>
            
            <div class="user-info">
              ${avatarHtml}
              <div class="details">
                <div class="name">${userProfile.name}</div>
                <div class="email">${userProfile.email}</div>
              </div>
            </div>

            <p style="font-size: 12px;">Esta janela será fechada automaticamente em segundos...</p>
            <button onclick="sendAndClose()">Voltar ao Sistema</button>
          </div>

          <script>
            function sendAndClose() {
              if (window.opener) {
                window.opener.postMessage({
                  type: 'GOOGLE_AUTH_SUCCESS',
                  payload: {
                    accessToken: ${JSON.stringify(tokenData.access_token)},
                    refreshToken: ${JSON.stringify(tokenData.refresh_token || null)},
                    expiresIn: ${JSON.stringify(tokenData.expires_in)},
                    userProfile: ${JSON.stringify(userProfile)},
                    createdAt: Date.now()
                  }
                }, '*');
              }
              window.close();
            }
            
            // Auto close/send after 1.5 seconds representation
            setTimeout(sendAndClose, 1500);
          </script>
        </body>
      </html>
    `);
  } catch (error: any) {
    console.error('Google Callback Error:', error);
    res.status(500).send(`
      <html>
        <body style="font-family: sans-serif; text-align: center; padding: 50px; background: #0f172a; color: #ff6b6b;">
          <h2>Erro de Servidor na Autenticação</h2>
          <p>${error.message}</p>
          <button onclick="window.close()">Fechar</button>
        </body>
      </html>
    `);
  }
});

// Endpoint to refresh Google access tokens using the refresh token
app.post('/api/auth/google/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(400).json({ success: false, error: 'Refresh token ausente.' });
    }

    if (!fs.existsSync(GOOGLE_CONFIG_PATH)) {
      throw new Error('Configuração do Google Workspace não encontrada.');
    }
    const config = JSON.parse(fs.readFileSync(GOOGLE_CONFIG_PATH, 'utf-8'));
    if (!config.clientId || !config.clientSecret) {
      throw new Error('Client ID ou Client Secret ausentes.');
    }

    const refreshResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: config.clientId,
        client_secret: config.clientSecret,
        refresh_token: refreshToken,
        grant_type: 'refresh_token',
      }).toString()
    });

    const refreshData = await refreshResponse.json();

    if (!refreshResponse.ok) {
      throw new Error(refreshData.error_description || refreshData.error || 'Falha ao renovar o token Google.');
    }

    res.json({
      success: true,
      accessToken: refreshData.access_token,
      expiresIn: refreshData.expires_in,
    });
  } catch (error: any) {
    console.error('Google Refresh Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Vite Middleware integration for responsive assets delivery
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
    console.log('Vite middleware mounted for development.');
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
    console.log('Production static files mounted from dist.');
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Express custom server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
