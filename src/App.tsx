/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Menu, 
  X, 
  Bell, 
  Search, 
  Instagram, 
  Clock, 
  TrendingUp, 
  RefreshCw,
  Sliders,
  DollarSign,
  Package,
  ShoppingBag,
  Sun,
  Moon,
  CloudLightning
} from 'lucide-react';

import { ActiveTab, Product, Sale, Client, Transaction } from './types';
import { INITIAL_PRODUCTS, INITIAL_CLIENTS, INITIAL_SALES, INITIAL_TRANSACTIONS } from './data/mockData';

import Sidebar from './components/Sidebar';
import DashboardOverview from './components/DashboardOverview';
import DashboardExecutive from './components/DashboardExecutive';
import PDVTerminal from './components/PDVTerminal';
import CatalogInventory from './components/CatalogInventory';
import CustomersCRM from './components/CustomersCRM';
import FinanceCashflow from './components/FinanceCashflow';
import OrdersLogistics from './components/OrdersLogistics';
import LojaOnline from './components/LojaOnline';
import SettingsSystem from './components/SettingsSystem';
import AIAgentsHub from './components/AIAgentsHub';
import SalesGoalSimulator from './components/SalesGoalSimulator';
import VendasList from './components/VendasList';
import DriverAppPortal from './components/DriverAppPortal';
import GoogleWorkspace from './components/GoogleWorkspace';

import PublicCatalog from './components/PublicCatalog';
import LoginScreen from './components/LoginScreen';
import PartnerPortal from './components/PartnerPortal';
import CustomerPortal from './components/CustomerPortal';
import SuppliersManagement from './components/SuppliersManagement';
import StorefrontPaymentConfig from './components/StorefrontPaymentConfig';
import { 
  getSupabaseConfig, 
  initializeSupabaseConfig,
  fetchTeamMembersFromSupabase, 
  syncBulkTeamMembersToSupabase,
  pingSupabaseOnLogin,
  fetchProductsFromSupabase,
  syncBulkProductsToSupabase,
  fetchClientsFromSupabase,
  syncBulkClientsToSupabase,
  fetchSalesFromSupabase,
  syncBulkSalesToSupabase,
  fetchTransactionsFromSupabase,
  syncBulkTransactionsToSupabase,
  fetchOnlineOrdersFromSupabase,
  syncBulkOnlineOrdersToSupabase,
  syncSystemConfigsWithSupabase
} from './supabase';

export default function App() {
  // Reference to force instant background custom pushes on changes
  const performSyncRef = useRef<(() => Promise<void>) | null>(null);

  // Sidebar toggler
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<ActiveTab>(ActiveTab.DASHBOARD);
  const [isDriverPortalOpen, setIsDriverPortalOpen] = useState(false);

  // Lifted subtab states for side navigation direct access
  const [ordersLogisticsSubTab, setOrdersLogisticsSubTab] = useState<'pedidos' | 'trocas_crediario' | 'logistica' | 'condicional'>('pedidos');
  const [customersCRMSubTab, setCustomersCRMSubTab] = useState<'diretorio' | 'funil' | 'followup' | 'parceiros' | 'fidelidade'>('diretorio');
  const [suppliersManagementSubTab, setSuppliersManagementSubTab] = useState<'fornecedores' | 'compras'>('fornecedores');
  const [productsSubTab, setProductsSubTab] = useState<'inventario' | 'restoque' | 'cadastro'>('inventario');
  const [lojaOnlineSubTab, setLojaOnlineSubTab] = useState<'compartilhar' | 'cupons' | 'vitrine'>('compartilhar');
  const [aiAgentsHubSubTab, setAiAgentsHubSubTab] = useState<'descritor' | 'estilista' | 'whatsapp' | 'sentinela' | 'campanha' | 'consultoria' | 'tradutor' | 'precificador'>('descritor');
  const [googleWorkspaceSubTab, setGoogleWorkspaceSubTab] = useState<'agenda' | 'tarefas' | 'docs' | 'gmail' | 'sheets' | 'drive' | 'config'>('config');
  const [settingsSystemSubTab, setSettingsSystemSubTab] = useState<'empresa' | 'integracoes' | 'seguranca' | 'roadmap' | 'vitrine'>('empresa');

  // Controle de Usuários e Acessos (Equipe)
  const [teamMembers, setTeamMembers] = useState<any[]>(() => {
    const saved = localStorage.getItem('ap_moda_team_users');
    let parsed = null;
    if (saved) {
      try {
        parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          // Auto-heal admin password on load to prevent cached localStorage mismatches
          parsed = parsed.map(m => {
            if (m.role === 'Admin' && m.login.toLowerCase() === 'admin') {
              return { ...m, password: 'Ap01695*' };
            }
            return m;
          });
        }
      } catch (err) {
        parsed = null;
      }
    }
    if (parsed) return parsed;
    return [
      { id: 'usr-1', name: 'Ana Paula Admin', login: 'admin', role: 'Admin', password: 'Ap01695*', details: 'Administradora Geral', createdAt: '2026-06-15T12:00:00Z' },
      { id: 'usr-2', name: 'Juliana Cardoso', login: 'juliana', role: 'Gerente', password: '123', details: 'Gerente de Vendas', createdAt: '2026-06-15T12:05:00Z' },
      { id: 'usr-3', name: 'Ana Carolina', login: 'ana', role: 'Vendedor', password: '123', details: 'Vendedora Sênior', createdAt: '2026-06-15T12:10:00Z' },
      { id: 'usr-4', name: 'Beatriz Rocha', login: 'beatriz', role: 'Vendedor', password: '123', details: 'Vendedora Diamante', createdAt: '2026-06-15T12:12:00Z' },
      { id: 'usr-5', name: 'Juliana Costa', login: 'julianacost', role: 'Vendedor', password: '123', details: 'Vendedora Prata', createdAt: '2026-06-15T12:13:00Z' },
      { id: 'usr-6', name: 'Bruna Oliveira', login: 'bruna', role: 'Vendedor', password: '123', details: 'Vendedora Bronze', createdAt: '2026-06-15T12:14:00Z' },
      { id: 'usr-7', name: 'Marina Fitness Coach', login: 'marina', role: 'Parceiro', password: '123', details: 'Influenciadora Fitness (@marina_fit)', createdAt: '2026-06-15T12:15:00Z' },
      { id: 'usr-8', name: 'Julia Rezende', login: 'jurezende', role: 'Parceiro', password: '123', details: 'Parceira de Estilo (@jurezendedm)', createdAt: '2026-06-15T12:17:00Z' },
      { id: 'usr-9', name: 'Amanda Runner', login: 'amanda', role: 'Parceiro', password: '123', details: 'Parceira Corrida (@amandarun)', createdAt: '2026-06-15T12:19:00Z' },
      { id: 'usr-10', name: 'Bruno Ramos (Moto 1)', login: 'bruno', role: 'Entregador', password: '123', details: 'Entregador Zona Sul', createdAt: '2026-06-15T12:20:00Z' },
      { id: 'usr-11', name: 'Lucas Correia (Moto 2)', login: 'lucas', role: 'Entregador', password: '123', details: 'Entregador Zona Norte', createdAt: '2026-06-15T12:22:00Z' },
      { id: 'usr-12', name: 'Thales Silva (Bike/Região Central)', login: 'thales', role: 'Entregador', password: '123', details: 'Entregador Centro', createdAt: '2026-06-15T12:24:00Z' },
      { id: 'usr-13', name: 'Cláudio Santos (Parceiro Envio Rápido)', login: 'claudio', role: 'Entregador', password: '123', details: 'Entregador Parcerias', createdAt: '2026-06-15T12:26:00Z' }
    ];
  });

  // Vendedores dinâmicos
  const [sellers, setSellers] = useState<string[]>(() => {
    const saved = localStorage.getItem('ap_moda_sellers');
    return saved ? JSON.parse(saved) : ['Ana Carolina', 'Beatriz Rocha', 'Juliana Costa', 'Bruna Oliveira'];
  });

  // Motoboys dinâmicos
  const [motoboys, setMotoboys] = useState<string[]>(() => {
    const saved = localStorage.getItem('ap_moda_motoboys');
    return saved ? JSON.parse(saved) : ['Bruno Ramos (Moto 1)', 'Lucas Correia (Moto 2)', 'Thales Silva (Bike/Região Central)', 'Cláudio Santos (Parceiro Envio Rápido)'];
  });

  // Keep sellers, motoboys, and partners in robust real-time synchrony with teamMembers
  useEffect(() => {
    localStorage.setItem('ap_moda_team_users', JSON.stringify(teamMembers));

    // Update sellers
    const extSellers = teamMembers.filter(m => m.role === 'Vendedor').map(m => m.name);
    setSellers(extSellers);
    localStorage.setItem('ap_moda_sellers', JSON.stringify(extSellers));

    // Update motoboys
    const extMotoboys = teamMembers.filter(m => m.role === 'Entregador').map(m => m.name);
    setMotoboys(extMotoboys);
    localStorage.setItem('ap_moda_motoboys', JSON.stringify(extMotoboys));

    // Update partners (influencers list) in localStorage
    try {
      const savedPartners = localStorage.getItem('ap_moda_partners');
      const currentPartnersList = savedPartners ? JSON.parse(savedPartners) : [];
      let changed = false;

      const teamPartners = teamMembers.filter(m => m.role === 'Parceiro');
      const updatedPartnersList = [...currentPartnersList];

      teamPartners.forEach(tp => {
        const index = updatedPartnersList.findIndex(p => p.name === tp.name);
        if (index === -1) {
          updatedPartnersList.push({
            id: tp.id,
            name: tp.name,
            instagram: tp.details || '@' + tp.login,
            couponCode: tp.login.toUpperCase() + '10',
            commissionRate: 10,
            salesCount: 0,
            totalGenerated: 0,
            availableBalance: 0
          });
          changed = true;
        }
      });

      // Prune partners that no longer exist in team
      const activePartnerNames = teamPartners.map(tp => tp.name);
      const filtered = updatedPartnersList.filter(p => activePartnerNames.includes(p.name));
      if (filtered.length !== currentPartnersList.length) {
        changed = true;
      }

      if (changed || currentPartnersList.length === 0) {
        localStorage.setItem('ap_moda_partners', JSON.stringify(filtered));
      }
    } catch (e) {
      console.error(e);
    }
  }, [teamMembers]);

  // Estado de login / Sessão do usuário
  const [currentUser, setCurrentUser] = useState<any | null>(() => {
    const saved = localStorage.getItem('ap_moda_current_user');
    return saved ? JSON.parse(saved) : null;
  });

  useEffect(() => {
    localStorage.setItem('ap_moda_sellers', JSON.stringify(sellers));
  }, [sellers]);

  useEffect(() => {
    localStorage.setItem('ap_moda_motoboys', JSON.stringify(motoboys));
  }, [motoboys]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('ap_moda_current_user', JSON.stringify(currentUser));
      // Se for entregador, força o redirecionamento direto para o DriverAppPortal
      if (currentUser.role === 'Entregador') {
        setIsDriverPortalOpen(true);
      }
    } else {
      localStorage.removeItem('ap_moda_current_user');
      setIsDriverPortalOpen(false);
    }
  }, [currentUser]);

  // Tema Escuro System Mode
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('ap_darkMode') === 'true';
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('ap_darkMode', 'true');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('ap_darkMode', 'false');
    }
  }, [darkMode]);

  // Tema de Acentuação ('neon' | 'verde' | 'roxo' | 'rosa')
  const [themeAccent, setThemeAccent] = useState<'neon' | 'verde' | 'roxo' | 'rosa'>(() => {
    return (localStorage.getItem('ap_themeAccent') as 'neon' | 'verde' | 'roxo' | 'rosa') || 'rosa';
  });

  useEffect(() => {
    document.body.classList.remove('theme-neon', 'theme-verde', 'theme-roxo', 'theme-rosa');
    document.body.classList.add(`theme-${themeAccent}`);
    localStorage.setItem('ap_themeAccent', themeAccent);
  }, [themeAccent]);

  // Check if visitor is an external customer loaded with deep link parameter ?view=catalog or ?catalog=true
  const [isCustomerView, setIsCustomerView] = useState(() => {
    return window.location.search.includes('catalog=true') || window.location.search.includes('view=catalog');
  });

  const [isSyncingNow, setIsSyncingNow] = useState(false);
  const isSyncingRef = useRef(false);

  const [isCloudSyncingOnLogin, setIsCloudSyncingOnLogin] = useState(false);
  const [syncProgress, setSyncProgress] = useState<{
    status: 'idle' | 'running' | 'success' | 'error';
    step: string;
    details: string;
    stepsCompleted: string[];
  }>({ status: 'idle', step: '', details: '', stepsCompleted: [] });

  // Helper functions for tracking unsynced/dirty local changes
  const getDirtyIds = useCallback((key: string): string[] => {
    try {
      const saved = localStorage.getItem(key);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  }, []);

  const saveDirtyIds = useCallback((key: string, ids: string[]) => {
    localStorage.setItem(key, JSON.stringify(ids));
  }, []);

  // States with persistent localStorage fallback
  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem('ap_moda_products');
    return saved ? JSON.parse(saved) : [];
  });

  // State for online orders synced across delivery components
  const [onlineOrders, setOnlineOrders] = useState(() => {
    const saved = localStorage.getItem('ap_moda_online_orders');
    return saved ? JSON.parse(saved) : [];
  });

  const [clients, setClients] = useState<Client[]>(() => {
    const saved = localStorage.getItem('ap_moda_clients');
    return saved ? JSON.parse(saved) : [];
  });

  const [sales, setSales] = useState<Sale[]>(() => {
    const saved = localStorage.getItem('ap_moda_sales');
    return saved ? JSON.parse(saved) : [];
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('ap_moda_transactions');
    return saved ? JSON.parse(saved) : [];
  });

  // State for notification dropdown
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: 1, title: 'Estoque Baixo!', detail: 'Regata Cavada Premium Dry-Fit tem apenas 1 peça.', read: false, type: 'stock' },
    { id: 2, title: 'Nova Venda Concluída', detail: 'Maria Silva finalizou compra via Instagram (R$ 289,90).', read: false, type: 'sale' },
    { id: 3, title: 'Meta Coletiva Quase Lá!', detail: 'Parabéns, você atingiu 84% de sua meta mensal de vendas! 🌟', read: false, type: 'goal' }
  ]);

  // Previous state refs for delta comparisons
  const prevProductsRef = useRef<Product[]>(products);
  const prevClientsRef = useRef<Client[]>(clients);
  const prevSalesRef = useRef<Sale[]>(sales);
  const prevTransactionsRef = useRef<Transaction[]>(transactions);
  const prevOnlineOrdersRef = useRef<any[]>(onlineOrders);
  const prevTeamMembersRef = useRef<any[]>(teamMembers);

  // Sync to localStorage & automatically track local mutations as dirty
  useEffect(() => {
    localStorage.setItem('ap_moda_products', JSON.stringify(products));
    if (!isSyncingRef.current) {
      const prevList = prevProductsRef.current || [];
      const prevMap = new Map(prevList.map(p => [p.id, p]));
      const dirtyIds = getDirtyIds('ap_dirty_products');
      let changed = false;

      for (const p of products) {
        const prevP = prevMap.get(p.id);
        if (!prevP || JSON.stringify(prevP) !== JSON.stringify(p)) {
          if (!dirtyIds.includes(p.id)) {
            dirtyIds.push(p.id);
            changed = true;
          }
        }
      }
      if (changed) {
        saveDirtyIds('ap_dirty_products', dirtyIds);
        setTimeout(() => { if (performSyncRef.current) performSyncRef.current(); }, 150);
      }
    }
    prevProductsRef.current = products;
  }, [products, getDirtyIds, saveDirtyIds]);

  useEffect(() => {
    localStorage.setItem('ap_moda_clients', JSON.stringify(clients));
    if (!isSyncingRef.current) {
      const prevList = prevClientsRef.current || [];
      const prevMap = new Map(prevList.map(c => [c.id, c]));
      const dirtyIds = getDirtyIds('ap_dirty_clients');
      let changed = false;

      for (const c of clients) {
        const prevC = prevMap.get(c.id);
        if (!prevC || JSON.stringify(prevC) !== JSON.stringify(c)) {
          if (!dirtyIds.includes(c.id)) {
            dirtyIds.push(c.id);
            changed = true;
          }
        }
      }
      if (changed) {
        saveDirtyIds('ap_dirty_clients', dirtyIds);
        setTimeout(() => { if (performSyncRef.current) performSyncRef.current(); }, 150);
      }
    }
    prevClientsRef.current = clients;
  }, [clients, getDirtyIds, saveDirtyIds]);

  useEffect(() => {
    localStorage.setItem('ap_moda_sales', JSON.stringify(sales));
    if (!isSyncingRef.current) {
      const prevList = prevSalesRef.current || [];
      const prevMap = new Map(prevList.map(s => [s.id, s]));
      const dirtyIds = getDirtyIds('ap_dirty_sales');
      let changed = false;

      for (const s of sales) {
        const prevS = prevMap.get(s.id);
        if (!prevS || JSON.stringify(prevS) !== JSON.stringify(s)) {
          if (!dirtyIds.includes(s.id)) {
            dirtyIds.push(s.id);
            changed = true;
          }
        }
      }
      if (changed) {
        saveDirtyIds('ap_dirty_sales', dirtyIds);
        setTimeout(() => { if (performSyncRef.current) performSyncRef.current(); }, 150);
      }
    }
    prevSalesRef.current = sales;
  }, [sales, getDirtyIds, saveDirtyIds]);

  useEffect(() => {
    localStorage.setItem('ap_moda_transactions', JSON.stringify(transactions));
    if (!isSyncingRef.current) {
      const prevList = prevTransactionsRef.current || [];
      const prevMap = new Map(prevList.map(t => [t.id, t]));
      const dirtyIds = getDirtyIds('ap_dirty_transactions');
      let changed = false;

      for (const t of transactions) {
        const prevT = prevMap.get(t.id);
        if (!prevT || JSON.stringify(prevT) !== JSON.stringify(t)) {
          if (!dirtyIds.includes(t.id)) {
            dirtyIds.push(t.id);
            changed = true;
          }
        }
      }
      if (changed) {
        saveDirtyIds('ap_dirty_transactions', dirtyIds);
        setTimeout(() => { if (performSyncRef.current) performSyncRef.current(); }, 150);
      }
    }
    prevTransactionsRef.current = transactions;
  }, [transactions, getDirtyIds, saveDirtyIds]);

  useEffect(() => {
    localStorage.setItem('ap_moda_online_orders', JSON.stringify(onlineOrders));
    if (!isSyncingRef.current) {
      const prevList = prevOnlineOrdersRef.current || [];
      const prevMap = new Map(prevList.map(o => [o.id, o]));
      const dirtyIds = getDirtyIds('ap_dirty_online_orders');
      let changed = false;

      for (const o of onlineOrders) {
        const prevO = prevMap.get(o.id);
        if (!prevO || JSON.stringify(prevO) !== JSON.stringify(o)) {
          if (!dirtyIds.includes(o.id)) {
            dirtyIds.push(o.id);
            changed = true;
          }
        }
      }
      if (changed) {
        saveDirtyIds('ap_dirty_online_orders', dirtyIds);
        setTimeout(() => { if (performSyncRef.current) performSyncRef.current(); }, 150);
      }
    }
    prevOnlineOrdersRef.current = onlineOrders;
  }, [onlineOrders, getDirtyIds, saveDirtyIds]);

  useEffect(() => {
    if (!isSyncingRef.current) {
      const prevList = prevTeamMembersRef.current || [];
      const prevMap = new Map(prevList.map(m => [m.id, m]));
      const dirtyIds = getDirtyIds('ap_dirty_team_members');
      let changed = false;

      for (const m of teamMembers || []) {
        const prevM = prevMap.get(m.id);
        if (!prevM || JSON.stringify(prevM) !== JSON.stringify(m)) {
          if (!dirtyIds.includes(m.id)) {
            dirtyIds.push(m.id);
            changed = true;
          }
        }
      }
      if (changed) {
        saveDirtyIds('ap_dirty_team_members', dirtyIds);
        setTimeout(() => { if (performSyncRef.current) performSyncRef.current(); }, 150);
      }
    }
    prevTeamMembersRef.current = teamMembers;
  }, [teamMembers, getDirtyIds, saveDirtyIds]);

  // Realiza um download completo, sequencial e forçado de todas as tabelas logo no login para evitar dados "picotados" ou atrasados
  const runFullSynchronousSetup = useCallback(async (user: any) => {
    if (!user) return;
    setIsCloudSyncingOnLogin(true);
    setSyncProgress({
      status: 'running',
      step: 'Conectando...',
      details: 'Conectando ao banco de dados seguro da AP Moda Fitness na nuvem...',
      stepsCompleted: []
    });

    isSyncingRef.current = true; // Lock standard background delta computations while writing initial database copies

    try {
      // 1. Acorda / testa o banco de dados
      await pingSupabaseOnLogin(user.name, user.role);

      setSyncProgress(prev => ({
        ...prev,
        step: 'Sincronizando Login...',
        details: 'Validando acessos e baixando logins da equipe comercial...',
        stepsCompleted: [...prev.stepsCompleted, 'Conectando...']
      }));

      // 2. Sincroniza logins da Equipe
      const dbMembers = await fetchTeamMembersFromSupabase();
      if (dbMembers && dbMembers.length > 0) {
        setTeamMembers(dbMembers);
        localStorage.setItem('ap_moda_team_users', JSON.stringify(dbMembers));
      }

      setSyncProgress(prev => ({
        ...prev,
        step: 'Sincronizando Produtos...',
        details: 'Baixando catálogo completo de mercadorias, tamanhos, cores e estoque...',
        stepsCompleted: [...prev.stepsCompleted, 'Sincronizando Login...']
      }));

      // 3. Sincroniza Catálogo de Produtos
      const dbProducts = await fetchProductsFromSupabase();
      if (dbProducts) {
        setProducts(dbProducts);
        localStorage.setItem('ap_moda_products', JSON.stringify(dbProducts));
      }

      setSyncProgress(prev => ({
        ...prev,
        step: 'Sincronizando Clientes...',
        details: 'Carregando lista completa do CRM, contatos e saldos de cashback...',
        stepsCompleted: [...prev.stepsCompleted, 'Sincronizando Produtos...']
      }));

      // 4. Sincroniza Clientes
      const dbClients = await fetchClientsFromSupabase();
      if (dbClients) {
        setClients(dbClients);
        localStorage.setItem('ap_moda_clients', JSON.stringify(dbClients));
      }

      setSyncProgress(prev => ({
        ...prev,
        step: 'Sincronizando Histórico de Vendas...',
        details: 'Sincronizando histórico de vendas realizadas em todos os caixas...',
        stepsCompleted: [...prev.stepsCompleted, 'Sincronizando Clientes...']
      }));

      // 5. Sincroniza Vendas
      const dbSales = await fetchSalesFromSupabase();
      if (dbSales) {
        setSales(dbSales);
        localStorage.setItem('ap_moda_sales', JSON.stringify(dbSales));
      }

      setSyncProgress(prev => ({
        ...prev,
        step: 'Sincronizando Financeiro...',
        details: 'Baixando os lançamentos de caixa, sangrias, aportes e despesas...',
        stepsCompleted: [...prev.stepsCompleted, 'Sincronizando Histórico de Vendas...']
      }));

      // 6. Sincroniza Lançamentos Financeiros
      const dbTransactions = await fetchTransactionsFromSupabase();
      if (dbTransactions) {
        setTransactions(dbTransactions);
        localStorage.setItem('ap_moda_transactions', JSON.stringify(dbTransactions));
      }

      setSyncProgress(prev => ({
        ...prev,
        step: 'Sincronizando Pedidos Online...',
        details: 'Carregando sacolas de compras pendentes na vitrine de atacado/varejo...',
        stepsCompleted: [...prev.stepsCompleted, 'Sincronizando Financeiro...']
      }));

      // 7. Sincroniza Pedidos Online
      const dbOrders = await fetchOnlineOrdersFromSupabase();
      if (dbOrders) {
        setOnlineOrders(dbOrders);
        localStorage.setItem('ap_moda_online_orders', JSON.stringify(dbOrders));
      }

      setSyncProgress(prev => ({
        ...prev,
        step: 'Sincronizando Configurações Globais...',
        details: 'Sincronizando dados institucionais, banners do carrossel da vitrine e taxas de juros...',
        stepsCompleted: [...prev.stepsCompleted, 'Sincronizando Pedidos Online...']
      }));

      // 8. Sincroniza Configurações Globais
      await syncSystemConfigsWithSupabase();

      // Zera chaves de modificação local temporária (sujeira) para evitar re-uploads redundantes
      localStorage.setItem('ap_dirty_team_members', JSON.stringify([]));
      localStorage.setItem('ap_dirty_products', JSON.stringify([]));
      localStorage.setItem('ap_dirty_clients', JSON.stringify([]));
      localStorage.setItem('ap_dirty_sales', JSON.stringify([]));
      localStorage.setItem('ap_dirty_transactions', JSON.stringify([]));
      localStorage.setItem('ap_dirty_online_orders', JSON.stringify([]));

      setSyncProgress(prev => ({
        ...prev,
        step: 'Pronto!',
        details: 'Aparelho pareado com sucesso! Todos os dados estão atualizados.',
        stepsCompleted: [...prev.stepsCompleted, 'Sincronizando Configurações Globais...']
      }));

      setTimeout(() => {
        setIsCloudSyncingOnLogin(false);
        setSyncProgress({ status: 'idle', step: '', details: '', stepsCompleted: [] });
        
        // Alerta de Bem-vinda
        setNotifications(prev => [
          {
            id: Date.now() + 9993,
            title: `Seja Bem-vindo(a), ${user.name}! 🌸`,
            detail: `Seu aparelho foi sincronizado com sucesso. Nível de acesso comercial: [${user.role}].`,
            read: false,
            type: 'goal' as const
          },
          ...prev
        ]);
      }, 1000);

    } catch (err: any) {
      console.error('Falha severa na sincronização preliminar de credenciais:', err);
      setSyncProgress(prev => ({
        ...prev,
        status: 'error',
        step: 'X',
        details: 'Ocorreu um erro ao carregar as informações na nuvem. Verifique sua conexão e tente novamente.'
      }));
    } finally {
      isSyncingRef.current = false;
    }
  }, []);

  // Dynamic refs to always hold fresh copies for syncing interval (strictly avoids infinite component rendering loops in React)
  const lastProductsRef = useRef(products);
  const lastClientsRef = useRef(clients);
  const lastSalesRef = useRef(sales);
  const lastTransactionsRef = useRef(transactions);
  const lastOnlineOrdersRef = useRef(onlineOrders);
  const lastTeamMembersRef = useRef(teamMembers);
  const currentUserRef = useRef(currentUser);
  const isCustomerViewRef = useRef(isCustomerView);
  const runFullSynchronousSetupRef = useRef<any>(null);

  useEffect(() => { lastProductsRef.current = products; }, [products]);
  useEffect(() => { lastClientsRef.current = clients; }, [clients]);
  useEffect(() => { lastSalesRef.current = sales; }, [sales]);
  useEffect(() => { lastTransactionsRef.current = transactions; }, [transactions]);
  useEffect(() => { lastOnlineOrdersRef.current = onlineOrders; }, [onlineOrders]);
  useEffect(() => { lastTeamMembersRef.current = teamMembers; }, [teamMembers]);
  useEffect(() => { currentUserRef.current = currentUser; }, [currentUser]);
  useEffect(() => { isCustomerViewRef.current = isCustomerView; }, [isCustomerView]);
  useEffect(() => { runFullSynchronousSetupRef.current = runFullSynchronousSetup; }, [runFullSynchronousSetup]);

  // Carregar usuários e credenciais do Supabase na inicialização, se houver
  useEffect(() => {
    async function initSupabaseSync() {
      // Primeiro sincroniza as credenciais do banco com o servidor central, garantindo que TODOS usem o mesmo banco de dados
      await initializeSupabaseConfig();

      const config = getSupabaseConfig();
      if (config) {
        console.log('Supabase configurado! Baixando logins e senhas em tempo real...');
        try {
          const dbMembers = await fetchTeamMembersFromSupabase();
          if (dbMembers && dbMembers.length > 0) {
            console.log(`Sucesso! ${dbMembers.length} logins baixados do Supabase.`);
            setTeamMembers(dbMembers);
          } else if (dbMembers === null) {
            console.warn('Tabela "ap_team_members" no Supabase não foi encontrada ou está vazia.');
          }
        } catch (err) {
          console.error('Erro de conexão Supabase na inicialização:', err);
        }

        // Se houver um usuário ativo na inicialização, faz o pull profundo imediatamente
        const savedUser = localStorage.getItem('ap_moda_current_user');
        if (savedUser) {
          try {
            const parsed = JSON.parse(savedUser);
            if (parsed) {
              runFullSynchronousSetup(parsed);
            }
          } catch (e) {}
        }
      }
    }
    initSupabaseSync();
  }, [runFullSynchronousSetup]);

  // Listen to table missing warnings from Supabase schemas and display advice
  useEffect(() => {
    const handleSchemaWarning = (e: any) => {
      const msgText = e.detail?.message || '';
      setNotifications(prev => {
        // Prevent duplicate notices
        if (prev.some(n => n.detail === msgText)) return prev;
        return [
          {
            id: Date.now() + Math.random(),
            title: 'Configurar Tabelas no Supabase ⚠️',
            detail: msgText,
            read: false,
            type: 'stock'
          },
          ...prev
        ];
      });
    };
    window.addEventListener('supabase-schema-warning', handleSchemaWarning);
    return () => window.removeEventListener('supabase-schema-warning', handleSchemaWarning);
  }, []);

  // Calculations for sidebar badge alerts
  const lowStockCount = products.filter(p => p.stock < p.minStock).length;

  const unreadNotificationsCount = notifications.filter(n => !n.read).length;

  // Estado de Conexão Offline Seguro & Simulação
  const [isOnline, setIsOnline] = useState(() => navigator.onLine);
  const [simulateOffline, setSimulateOffline] = useState(false);
  const [offlinePendingSync, setOfflinePendingSync] = useState<{ type: 'sale_completed' | 'stock_alert'; data: any }[]>(() => {
    const saved = localStorage.getItem('ap_moda_pending_sync');
    return saved ? JSON.parse(saved) : [];
  });

  const systemOffline = !isOnline || simulateOffline;

  useEffect(() => {
    localStorage.setItem('ap_moda_pending_sync', JSON.stringify(offlinePendingSync));
  }, [offlinePendingSync]);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Sincronização automática bilateral de TODO o ecossistema AP Moda Fitness com o Supabase
  const performSync = useCallback(async (isManual = false) => {
    if (isSyncingRef.current && !isManual) {
      console.log('[Supabase Sync] Sincronização concorrente ignorada para evitar colisões.');
      return;
    }

    if (systemOffline) {
      console.log('[Supabase Sync] Sistema offline. Sincronização suspensa.');
      if (isManual) {
        alert("Você está offline no momento. Ative a internet para realizar a sincronização na nuvem.");
      }
      return;
    }

    const prevUrl = localStorage.getItem('ap_supabase_url');
    const prevKey = localStorage.getItem('ap_supabase_key');

    // Sincroniza as credenciais de banco com o servidor central antes de qualquer sync, garantindo que TODOS usem o mesmo banco de dados se houver alteração em tempo real!
    await initializeSupabaseConfig();

    const config = getSupabaseConfig();
    if (!config) return;

    // Se houve alteração de banco no outro aparelho, recarrega os dados imediatamente
    const newUrl = localStorage.getItem('ap_supabase_url');
    const newKey = localStorage.getItem('ap_supabase_key');
    if (prevUrl !== newUrl || prevKey !== newKey) {
      console.log('[Supabase Sync] Detectado alteração nas credenciais em nuvem unificadas pelo servidor central!');
      // Reseta as flags de fila dirty locais para que não misturem dados de instâncias diferentes
      saveDirtyIds('ap_dirty_products', []);
      saveDirtyIds('ap_dirty_clients', []);
      saveDirtyIds('ap_dirty_sales', []);
      saveDirtyIds('ap_dirty_transactions', []);
      saveDirtyIds('ap_dirty_online_orders', []);
      saveDirtyIds('ap_dirty_team_members', []);

      if (currentUserRef.current) {
        // Se houver usuário ativo, força re-sincronização de tudo do novo banco
        await runFullSynchronousSetupRef.current(currentUserRef.current);
        return;
      } else if (isCustomerViewRef.current) {
        // Se for visão de cliente externo, puxa e carrega catálogo de produtos em massa do novo banco
        const dbProducts = await fetchProductsFromSupabase();
        if (dbProducts) {
          setProducts(dbProducts);
          localStorage.setItem('ap_moda_products', JSON.stringify(dbProducts));
        }
        return;
      }
    }

    if (isManual) {
      setIsSyncingNow(true);
    }

    // Set syncing flag so local change listener useEffects ignore these updates
    isSyncingRef.current = true;

    try {
      console.log('[Supabase Sync] Sincronizando dados bilateralmente com a nuvem Supabase...');

      let localStateModified = false;
      let remoteStateModified = false;

      // 1. Sincronização da Equipe (Logins e Cargos)
      const dbMembers = await fetchTeamMembersFromSupabase();
      if (dbMembers) {
        const dirtyMembers = getDirtyIds('ap_dirty_team_members');
        const currentMembers = lastTeamMembersRef.current || [];
        const localMap = new Map(currentMembers.map(m => [m.id, m]));
        const dbMap = new Map(dbMembers.map(m => [m.id, m]));
        let localModified = false;
        let remoteModified = false;
        const merged = [...currentMembers];

        for (const dbM of dbMembers) {
          const localM = localMap.get(dbM.id);
          if (!localM) {
            merged.push(dbM);
            localModified = true;
          } else if (!dirtyMembers.includes(dbM.id)) {
            if (JSON.stringify(localM) !== JSON.stringify(dbM)) {
              if (dbM.login === 'admin' && dbM.role === 'Admin') continue;
              const idx = merged.findIndex(x => x.id === dbM.id);
              if (idx >= 0) merged[idx] = dbM;
              localModified = true;
            }
          }
        }

        const toUpload = currentMembers.filter(lm => dirtyMembers.includes(lm.id));
        if (toUpload.length > 0) {
          const success = await syncBulkTeamMembersToSupabase(toUpload);
          if (success) {
            const remaining = getDirtyIds('ap_dirty_team_members').filter(id => !toUpload.some(u => u.id === id));
            saveDirtyIds('ap_dirty_team_members', remaining);
            remoteModified = true;
          }
        }

        if (localModified) {
          setTeamMembers(merged);
          localStateModified = true;
        }
        if (remoteModified || localModified) {
          remoteStateModified = true;
        }
      }

      // 2. Sincronização do Catálogo de Produtos da Boutique
      const dbProducts = await fetchProductsFromSupabase();
      if (dbProducts) {
        const dirtyProducts = getDirtyIds('ap_dirty_products');
        const currentProducts = lastProductsRef.current;
        const localMap = new Map(currentProducts.map(p => [p.id, p]));
        const dbMap = new Map(dbProducts.map(p => [p.id, p]));
        let localModified = false;
        let remoteModified = false;
        const merged = [...currentProducts];

        for (const dbP of dbProducts) {
          const localP = localMap.get(dbP.id);
          if (!localP) {
            merged.push(dbP);
            localModified = true;
          } else if (!dirtyProducts.includes(dbP.id)) {
            if (JSON.stringify(localP) !== JSON.stringify(dbP)) {
              const idx = merged.findIndex(x => x.id === dbP.id);
              if (idx >= 0) merged[idx] = dbP;
              localModified = true;
            }
          }
        }

        const toUpload = currentProducts.filter(lp => dirtyProducts.includes(lp.id));
        if (toUpload.length > 0) {
          const success = await syncBulkProductsToSupabase(toUpload);
          if (success) {
            const remaining = getDirtyIds('ap_dirty_products').filter(id => !toUpload.some(u => u.id === id));
            saveDirtyIds('ap_dirty_products', remaining);
            remoteModified = true;
          }
        }

        if (localModified) {
          setProducts(merged);
          localStateModified = true;
        }
        if (remoteModified || localModified) {
          remoteStateModified = true;
        }
      }

      // 3. Sincronização do CRM de Clientes
      const dbClients = await fetchClientsFromSupabase();
      if (dbClients) {
        const dirtyClients = getDirtyIds('ap_dirty_clients');
        const currentClients = lastClientsRef.current;
        const localMap = new Map(currentClients.map(c => [c.id, c]));
        const dbMap = new Map(dbClients.map(c => [c.id, c]));
        let localModified = false;
        let remoteModified = false;
        const merged = [...currentClients];

        for (const dbC of dbClients) {
          const localC = localMap.get(dbC.id);
          if (!localC) {
            merged.push(dbC);
            localModified = true;
          } else if (!dirtyClients.includes(dbC.id)) {
            if (JSON.stringify(localC) !== JSON.stringify(dbC)) {
              const idx = merged.findIndex(x => x.id === dbC.id);
              if (idx >= 0) merged[idx] = dbC;
              localModified = true;
            }
          }
        }

        const toUpload = currentClients.filter(lc => dirtyClients.includes(lc.id));
        if (toUpload.length > 0) {
          const success = await syncBulkClientsToSupabase(toUpload);
          if (success) {
            const remaining = getDirtyIds('ap_dirty_clients').filter(id => !toUpload.some(u => u.id === id));
            saveDirtyIds('ap_dirty_clients', remaining);
            remoteModified = true;
          }
        }

        if (localModified) {
          setClients(merged);
          localStateModified = true;
        }
        if (remoteModified || localModified) {
          remoteStateModified = true;
        }
      }

      // 4. Sincronização de Vendas Realizadas (PDV e Canais)
      const dbSales = await fetchSalesFromSupabase();
      if (dbSales) {
        const dirtySales = getDirtyIds('ap_dirty_sales');
        const currentSales = lastSalesRef.current;
        const localMap = new Map(currentSales.map(s => [s.id, s]));
        const dbMap = new Map(dbSales.map(s => [s.id, s]));
        let localModified = false;
        let remoteModified = false;
        const merged = [...currentSales];

        for (const dbS of dbSales) {
          const localS = localMap.get(dbS.id);
          if (!localS) {
            merged.push(dbS);
            localModified = true;
          } else if (!dirtySales.includes(dbS.id)) {
            if (JSON.stringify(localS) !== JSON.stringify(dbS)) {
              const idx = merged.findIndex(x => x.id === dbS.id);
              if (idx >= 0) merged[idx] = dbS;
              localModified = true;
            }
          }
        }

        const toUpload = currentSales.filter(ls => dirtySales.includes(ls.id));
        if (toUpload.length > 0) {
          const success = await syncBulkSalesToSupabase(toUpload);
          if (success) {
            const remaining = getDirtyIds('ap_dirty_sales').filter(id => !toUpload.some(u => u.id === id));
            saveDirtyIds('ap_dirty_sales', remaining);
            remoteModified = true;
          }
        }

        if (localModified) {
          setSales(merged);
          localStateModified = true;
        }
        if (remoteModified || localModified) {
          remoteStateModified = true;
        }
      }

      // 5. Sincronização Financeira (Lançamentos de Caixa)
      const dbTransactions = await fetchTransactionsFromSupabase();
      if (dbTransactions) {
        const dirtyTransactions = getDirtyIds('ap_dirty_transactions');
        const currentTransactions = lastTransactionsRef.current;
        const localMap = new Map(currentTransactions.map(t => [t.id, t]));
        const dbMap = new Map(dbTransactions.map(t => [t.id, t]));
        let localModified = false;
        let remoteModified = false;
        const merged = [...currentTransactions];

        for (const dbT of dbTransactions) {
          const localT = localMap.get(dbT.id);
          if (!localT) {
            merged.push(dbT);
            localModified = true;
          } else if (!dirtyTransactions.includes(dbT.id)) {
            if (JSON.stringify(localT) !== JSON.stringify(dbT)) {
              const idx = merged.findIndex(x => x.id === dbT.id);
              if (idx >= 0) merged[idx] = dbT;
              localModified = true;
            }
          }
        }

        const toUpload = currentTransactions.filter(lt => dirtyTransactions.includes(lt.id));
        if (toUpload.length > 0) {
          const success = await syncBulkTransactionsToSupabase(toUpload);
          if (success) {
            const remaining = getDirtyIds('ap_dirty_transactions').filter(id => !toUpload.some(u => u.id === id));
            saveDirtyIds('ap_dirty_transactions', remaining);
            remoteModified = true;
          }
        }

        if (localModified) {
          setTransactions(merged);
          localStateModified = true;
        }
        if (remoteModified || localModified) {
          remoteStateModified = true;
        }
      }

      // 6. Sincronização de Pedidos da Loja Online / Vitrine
      const dbOrders = await fetchOnlineOrdersFromSupabase();
      if (dbOrders) {
        const dirtyOrders = getDirtyIds('ap_dirty_online_orders');
        const currentOrders = lastOnlineOrdersRef.current;
        const localMap = new Map(currentOrders.map(o => [o.id, o]));
        const dbMap = new Map(dbOrders.map(o => [o.id, o]));
        let localModified = false;
        let remoteModified = false;
        const merged = [...currentOrders];

        for (const dbO of dbOrders) {
          const localO = localMap.get(dbO.id);
          if (!localO) {
            merged.push(dbO);
            localModified = true;
          } else if (!dirtyOrders.includes(dbO.id)) {
            if (JSON.stringify(localO) !== JSON.stringify(dbO)) {
              const idx = merged.findIndex(x => x.id === dbO.id);
              if (idx >= 0) merged[idx] = dbO;
              localModified = true;
            }
          }
        }

        const toUpload = currentOrders.filter(lo => dirtyOrders.includes(lo.id));
        if (toUpload.length > 0) {
          const success = await syncBulkOnlineOrdersToSupabase(toUpload);
          if (success) {
            const remaining = getDirtyIds('ap_dirty_online_orders').filter(id => !toUpload.some(u => u.id === id));
            saveDirtyIds('ap_dirty_online_orders', remaining);
            remoteModified = true;
          }
        }

        if (localModified) {
          setOnlineOrders(merged);
          localStateModified = true;
        }
        if (remoteModified || localModified) {
          remoteStateModified = true;
        }
      }

      // 7. Sincronização de Configurações Globais (Microsoft/Google Workspace keys, dados de loja, logo, bandeiras, etc.)
      const localConfigsChanged = await syncSystemConfigsWithSupabase();
      if (localConfigsChanged) {
        console.log('[Supabase Sync] Chaves de integração, logs e dados da loja atualizados a partir da nuvem!');
        
        // Dispara evento para o SettingsSystem e outros para recarregarem os dados do localStorage na tela
        window.dispatchEvent(new Event('ap-storage-synced'));
      }

      if (localStateModified || remoteStateModified) {
        setNotifications(prev => [
          {
            id: Date.now() + 800,
            title: isManual ? 'Nuvem Sincronizada ☁️✨' : 'Sincronização Concluída ✨',
            detail: 'Todos os produtos, vendas, clientes, Google/Microsoft Workspace, logotipo e configurações compartilhados com este aparelho!',
            read: false,
            type: 'goal' as const
          },
          ...prev
        ]);
      }
      
      if (isManual) {
        alert("✅ Conectado & Pareado!\n\nDados totalmente sincronizados em tempo real com todos os celulares e computadores conectados na nuvem AP Moda Fitness!");
      }
    } catch (e) {
      console.warn('[Supabase Sync Exception] Erro severo na sincronização periódica:', e);
      if (isManual) {
        alert("⚠️ Falha ao sincronizar: " + (e as any).message);
      }
    } finally {
      if (isManual) {
        setIsSyncingNow(false);
      }
      // Allow React to bundle and update state before disabling syncing lock
      setTimeout(() => {
        isSyncingRef.current = false;
      }, 300);
    }
  }, [systemOffline, getDirtyIds, saveDirtyIds]);

  // Agenda um loop a cada 7 segundos e escuta o foco da janela para sincronizar em tempo real no segundo plano ao trocar de aparelho
  useEffect(() => {
    performSyncRef.current = performSync;
  }, [performSync]);

  useEffect(() => {
    const config = getSupabaseConfig();
    if (!config) return;

    if (!systemOffline) {
      performSync();
    }

    const interval = setInterval(() => {
      if (!systemOffline) {
        performSync();
      }
    }, 7000);

    const handleFocus = () => {
      console.log('[Supabase Sync] Janela focada! Sincronizando alterações em segundo plano...');
      if (!systemOffline) {
        performSync();
      }
    };

    window.addEventListener('focus', handleFocus);

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', handleFocus);
    };
  }, [systemOffline, performSync]);

  // WhatsApp Business API triggers (com suporte a fila offline)
  const triggerWhatsAppAlert = async (type: 'sale_completed' | 'stock_alert', data: any, forceSync = false) => {
    // Se o sistema estiver offline e não for forçado, enfileira
    if (systemOffline && !forceSync) {
      setOfflinePendingSync(prev => [...prev, { type, data }]);
      const offlineNotify = {
        id: Date.now() + 200,
        title: 'Notificação Guardada (Offline)',
        detail: `Alerta do WhatsApp (${type === 'sale_completed' ? 'Venda realizada' : 'Estoque Baixo'}) salvo localmente e enfileirado para envio! 💾`,
        read: false,
        type: 'sale' as const
      };
      setNotifications(prev => [offlineNotify, ...prev]);
      return;
    }

    try {
      const token = localStorage.getItem('ap_whatsapp_token') || '';
      const phoneId = localStorage.getItem('ap_whatsapp_phone_id') || '';
      const recipient = localStorage.getItem('ap_whatsapp_recipient') || '';
      const enabled = localStorage.getItem('ap_whatsapp_enabled') !== 'false';

      if (!enabled) return;

      const response = await fetch('/api/whatsapp/notify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          token,
          phoneId,
          recipient,
          type,
          data
        })
      });

      const resData = await response.json();
      console.log('WhatsApp Alert result:', resData);
    } catch (err) {
      console.error('Failed to dispatch WhatsApp notification:', err);
    }
  };

  // Processa fila de notificações automaticamente quando restabelecer a conexão
  useEffect(() => {
    if (!systemOffline && offlinePendingSync.length > 0) {
      const syncMessages = async () => {
        const queueToProcess = [...offlinePendingSync];
        setOfflinePendingSync([]); // Limpa antes para evitar duplicated triggers na fila
        
        for (const item of queueToProcess) {
          await triggerWhatsAppAlert(item.type, item.data, true);
        }
        
        setNotifications(prev => [
          {
            id: Date.now() + 500,
            title: 'Sincronização Concluída! ⚡',
            detail: `Conexão restabelecida! ${queueToProcess.length} notificação(ões) pendente(s) do WhatsApp foram transmitidas com sucesso.`,
            read: false,
            type: 'sale' as const
          },
          ...prev
        ]);
      };
      syncMessages();
    }
  }, [systemOffline]);

  // Handlers
  const handleAddSale = (newSale: Sale) => {
    setSales(prev => [newSale, ...prev]);

    // Update product stock counts
    setProducts(prevProducts => {
      return prevProducts.map(prod => {
        const itemSold = newSale.items.find(it => it.productId === prod.id);
        if (itemSold) {
          return {
            ...prod,
            stock: Math.max(0, prod.stock - itemSold.quantity),
            salesCount: prod.salesCount + itemSold.quantity
          };
        }
        return prod;
      });
    });

    // Feed to cashflows / transactions
    const paymentDetailStr = newSale.payments && newSale.payments.length > 0
      ? ` (${newSale.payments.map(p => `${p.method}: ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(p.amount)}`).join(' + ')})`
      : '';

    const newTx: Transaction = {
      id: `t-${Date.now()}`,
      type: 'Inflow',
      category: 'Venda',
      description: `Venda ${newSale.id.toUpperCase()} para ${newSale.clientName}${paymentDetailStr}`,
      amount: newSale.total,
      date: newSale.createdAt
    };
    setTransactions(prev => [newTx, ...prev]);

    // Update Client spent bounds if they already exist
    setClients(prevClients => {
      return prevClients.map(cli => {
        if (cli.name.toLowerCase() === newSale.clientName.toLowerCase()) {
          return {
            ...cli,
            totalSpent: cli.totalSpent + newSale.total,
            ordersCount: cli.ordersCount + 1
          };
        }
        return cli;
      });
    });

    // Check affected products for stock alerts and trigger WhatsApp alerts
    const alertsToTrigger: any[] = [];
    newSale.items.forEach(item => {
      const prod = products.find(p => p.id === item.productId);
      if (prod) {
        const newStock = Math.max(0, prod.stock - item.quantity);
        // Only trigger if new stock is below minimum AND the old stock was above or equal to minimum
        if (newStock < prod.minStock && prod.stock >= prod.minStock) {
          alertsToTrigger.push({
            name: prod.name,
            stock: newStock,
            minStock: prod.minStock,
            sku: prod.sku
          });
        }
      }
    });

    // Send WhatsApp sale completed alert
    triggerWhatsAppAlert('sale_completed', {
      id: newSale.id,
      clientName: newSale.clientName,
      itemsCount: newSale.items.length,
      total: newSale.total
    });

    // Send WhatsApp stock alerts if any products crossed threshold
    alertsToTrigger.forEach((alertData, idx) => {
      // Delay slightly to prevent race condition or spam block on the receiver
      setTimeout(() => {
        triggerWhatsAppAlert('stock_alert', alertData);
      }, (idx + 1) * 1200);

      // Also append a visual notification in the system
      const stockNotify = {
        id: Date.now() + 10 + idx,
        title: 'Estoque Mínimo Atingido!',
        detail: `"${alertData.name}" caiu para ${alertData.stock} un. Notificação de estoque mínimo enviada p/ WhatsApp.`,
        read: false,
        type: 'stock'
      };
      setNotifications(prev => [stockNotify, ...prev]);
    });

    // Add immediate sale notification
    const newNotify = {
      id: Date.now(),
      title: 'Nova Venda Concluída',
      detail: `${newSale.clientName} comprou ${newSale.items.length} peça(s) via ${newSale.channel} (${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(newSale.total)}).`,
      read: false,
      type: 'sale'
    };
    setNotifications(prev => [newNotify, ...prev]);
  };

  const handleUpdateOnlineOrderStatus = (orderId: string, newStatus: any) => {
    setOnlineOrders(prev => prev.map(o => {
      if (o.id === orderId) {
        if (newStatus === 'Entregue' && o.status !== 'Entregue') {
          const matchedClient = clients.find(c => c.name.toLowerCase() === o.clientName.toLowerCase());
          
          const saleItems = o.items.map((it: any) => {
            const matchedProd = products.find(p => p.name.toLowerCase() === it.productName.toLowerCase());
            return {
              productId: matchedProd?.id || `p-ext-${Date.now()}`,
              name: it.productName,
              quantity: it.quantity,
              price: it.price,
              cost: matchedProd?.cost || Math.round(it.price * 0.45)
            };
          });

          const newSale: Sale = {
            id: `v-ent-${Date.now().toString().slice(-4)}`,
            clientName: o.clientName,
            channel: 'E-commerce',
            items: saleItems,
            total: o.total,
            costTotal: saleItems.reduce((currSum: number, it: any) => currSum + (it.cost * it.quantity), 0),
            status: 'Concluída',
            createdAt: new Date().toISOString(),
            payments: [{ method: 'Maquininha/Pix', amount: o.total + o.deliveryFee }],
            salesperson: o.motoboy || 'Entregador Parceiro'
          };

          // Automatically feed this completed shipment into our sales CRM logs
          setTimeout(() => {
            handleAddSale(newSale);
          }, 100);

          const driverDeliverNotification = {
            id: Date.now() + 50,
            title: 'Corrida Concluída! 🏍️',
            detail: `Encomenda #${orderId.toUpperCase()} foi entregue com sucesso para ${o.clientName}. Saldo de faturamento total adicionado no caixa!`,
            read: false,
            type: 'sale'
          };
          setNotifications(prevNot => [driverDeliverNotification, ...prevNot]);
        }
        return { ...o, status: newStatus };
      }
      return o;
    }));
  };

  const handleAddClient = (newClient: Client) => {
    setClients(prev => [newClient, ...prev]);
  };

  const handleAddProduct = (newProd: Product) => {
    setProducts(prev => [newProd, ...prev]);
  };

  const handleUpdateProduct = (updatedProd: Product) => {
    setProducts(prev => prev.map(p => p.id === updatedProd.id ? updatedProd : p));
  };

  const handleDeleteProduct = (productId: string) => {
    setProducts(prev => prev.filter(p => p.id !== productId));
  };

  const handleAddTransaction = (newTx: Transaction) => {
    setTransactions(prev => [newTx, ...prev]);
  };

  const handleClearAllData = () => {
    const adminUser = teamMembers.find(m => m.role === 'Admin');
    const adminPassword = adminUser ? adminUser.password : 'ApB1695*';
    
    const enteredPassword = prompt('Confirmação de Segurança: Por favor, insira a sua senha de ADMINISTRADOR para autorizar o reset e a formatação total dos dados fantasmas do Dashboard:');
    
    if (enteredPassword === null) {
      return; // cancellation
    }
    
    if (enteredPassword !== adminPassword) {
      alert('Acesso negado! A senha de administrador informada está incorreta. O reset foi cancelado por motivos de segurança.');
      return;
    }

    if (confirm('ATENÇÃO: Você confirmou a senha com sucesso! Deseja realmente apagar COMPLETAMENTE todos os produtos, clientes, vendas, despesas, caixa, equipe (mantendo apenas administradores) e pedidos do sistema para iniciar o trabalho do zero (Produção)?')) {
      const cleanTeam = teamMembers.filter(m => m.role === 'Admin');
      setTeamMembers(cleanTeam);
      localStorage.setItem('ap_moda_team_users', JSON.stringify(cleanTeam));

      localStorage.setItem('ap_moda_products', JSON.stringify([]));
      localStorage.setItem('ap_moda_clients', JSON.stringify([]));
      localStorage.setItem('ap_moda_sales', JSON.stringify([]));
      localStorage.setItem('ap_moda_transactions', JSON.stringify([]));
      localStorage.setItem('ap_moda_online_orders', JSON.stringify([]));
      localStorage.setItem('ap_moda_sellers', JSON.stringify([]));
      localStorage.setItem('ap_moda_motoboys', JSON.stringify([]));
      localStorage.setItem('ap_moda_opportunities', JSON.stringify([]));
      localStorage.setItem('ap_moda_followups', JSON.stringify([]));
      localStorage.setItem('ap_moda_partners', JSON.stringify([]));
      setProducts([]);
      setClients([]);
      setSales([]);
      setTransactions([]);
      setOnlineOrders([]);
      setSellers([]);
      setMotoboys([]);
      alert('Tudo limpo! O sistema está zerado e com todos os dados fantasmas excluídos, pronto para o seu uso oficial.');
      setActiveTab(ActiveTab.DASHBOARD);
    }
  };

  const handleLoadDemoData = () => {
    if (confirm('Isso irá substituir os dados atuais pelas mercadorias e vendas de testes para demonstração da loja de Moda Fitness. Deseja prosseguir?')) {
      localStorage.setItem('ap_moda_products', JSON.stringify(INITIAL_PRODUCTS));
      localStorage.setItem('ap_moda_clients', JSON.stringify(INITIAL_CLIENTS));
      localStorage.setItem('ap_moda_sales', JSON.stringify(INITIAL_SALES));
      localStorage.setItem('ap_moda_transactions', JSON.stringify(INITIAL_TRANSACTIONS));
      
      const defaultSellers = ['Ana Carolina', 'Beatriz Rocha', 'Juliana Costa', 'Bruna Oliveira'];
      const defaultMotoboys = ['Bruno Ramos (Moto 1)', 'Lucas Correia (Moto 2)', 'Thales Silva (Bike/Região Central)', 'Cláudio Santos (Parceiro Envio Rápido)'];
      localStorage.setItem('ap_moda_sellers', JSON.stringify(defaultSellers));
      localStorage.setItem('ap_moda_motoboys', JSON.stringify(defaultMotoboys));
      setSellers(defaultSellers);
      setMotoboys(defaultMotoboys);

      const demoOnlineOrders = [
        {
          id: 'ped-web-01',
          clientName: 'Ana Costa',
          phone: '(21) 99123-4567',
          items: [{ productName: 'Legging Ativa All-Black Cós Alto', quantity: 1, price: 159.90 }],
          total: 159.90,
          status: 'Pendente',
          createdAt: new Date().toISOString(),
          address: 'Av. Copacabana, 820 - Apto 402, Rio de Janeiro - RJ',
          deliveryFee: 15.00,
          notes: 'Entregar no período da tarde, se possível.'
        },
        {
          id: 'ped-web-02',
          clientName: 'Beatriz Pereira',
          phone: '(31) 98989-1234',
          items: [
            { productName: 'Top Sport Confort Alta Sustentação', quantity: 1, price: 99.90 },
            { productName: 'Shorts Biker Anatômico Alta Compressão', quantity: 1, price: 89.90 }
          ],
          total: 189.80,
          status: 'Separando',
          createdAt: new Date().toISOString(),
          address: 'Rua São Paulo, 1450 - Centro, Belo Horizonte - MG',
          deliveryFee: 18.00,
          motoboy: 'Lucas Correia',
          notes: 'Embalar para presente.'
        }
      ];
      localStorage.setItem('ap_moda_online_orders', JSON.stringify(demoOnlineOrders));

      const demoOpps = [
        { id: 'op-1', clientName: 'Gabriela Souza', value: 289.90, probability: 80, stage: 'Prospecção', itemInteresse: 'Conjunto Seamless Sculpt', notes: 'Quer para o aniversário dia 20.' },
        { id: 'op-2', clientName: 'Ana Costa', value: 159.90, probability: 50, stage: 'Foto Enviada', itemInteresse: 'Legging All-Black Cós Alto', notes: 'Gostou do cós alto anatômico.' },
        { id: 'op-3', clientName: 'Beatriz Pereira', value: 450.00, probability: 90, stage: 'Prova / Reserva', itemInteresse: 'Combo Macacão Wave + Tops', notes: 'Reserva expira amanhã.' }
      ];
      const demoFups = [
        { id: 'fup-1', clientName: 'Maria Silva', channel: 'WhatsApp', date: '2026-06-14', notes: 'Perguntar se gostou do tamanho M do Conjunto Seamless.', completed: false },
        { id: 'fup-2', clientName: 'Carla Oliveira', channel: 'Instagram', date: '2026-06-15', notes: 'Enviar as novidades de casaco corta-vento Dry.', completed: false },
        { id: 'fup-3', clientName: 'Julia Santos', channel: 'Call', date: '2026-06-13', notes: 'Ligar para acertar retirada de reserva.', completed: true }
      ];
      const demoPartners = [
        { id: 'part-1', name: 'Marina Fitness Coach', instagram: '@marina_fit', couponCode: 'MARINAFIT10', commissionRate: 10, salesCount: 15, totalGenerated: 4250.00 },
        { id: 'part-2', name: 'Julia Rezende', instagram: '@jurezendedm', couponCode: 'JU10', commissionRate: 8, salesCount: 8, totalGenerated: 1890.00 },
        { id: 'part-3', name: 'Amanda Runner', instagram: '@amandarun', couponCode: 'AMANDAPRO', commissionRate: 12, salesCount: 22, totalGenerated: 6200.00 }
      ];
      localStorage.setItem('ap_moda_opportunities', JSON.stringify(demoOpps));
      localStorage.setItem('ap_moda_followups', JSON.stringify(demoFups));
      localStorage.setItem('ap_moda_partners', JSON.stringify(demoPartners));

      setProducts(INITIAL_PRODUCTS);
      setClients(INITIAL_CLIENTS);
      setSales(INITIAL_SALES);
      setTransactions(INITIAL_TRANSACTIONS);
      setOnlineOrders(demoOnlineOrders);
      alert('Dados de demonstração carregados com sucesso! Sinta-se à vontade para navegar ou testar.');
      setActiveTab(ActiveTab.DASHBOARD);
    }
  };

  const handleResetData = () => {
    handleClearAllData();
  };

  const handleImportData = (imported: { products?: Product[]; sales?: Sale[]; clients?: Client[]; transactions?: Transaction[] }) => {
    if (imported.products) setProducts(imported.products);
    if (imported.clients) setClients(imported.clients);
    if (imported.sales) setSales(imported.sales);
    if (imported.transactions) setTransactions(imported.transactions);

    alert('Backup importado e restaurado com sucesso no sistema!');
    setActiveTab(ActiveTab.DASHBOARD);
  };

  const handleAddOnlineOrder = (newOrder: any) => {
    setOnlineOrders((prev: any[]) => {
      const orderExists = prev.some(o => o.id === newOrder.id);
      if (orderExists) return prev;
      return [newOrder, ...prev];
    });

    // Fire visual alert notification in management dashboard
    const newNotify = {
      id: Date.now(),
      title: 'Novo Pedido p/ WhatsApp! 🛍️',
      detail: `${newOrder.clientName} montou uma sacola no catálogo no valor de R$ ${newOrder.total.toFixed(2)}. Pedido guardado na aba de Logística.`,
      read: false,
      type: 'sale' as const
    };
    setNotifications((prev: any[]) => [newNotify, ...prev]);
  };

  // Render the currently selected tab/page view
  const renderCurrentView = () => {
    switch (activeTab) {
      case ActiveTab.DASHBOARD:
        return (
          <DashboardOverview 
            products={products}
            sales={sales}
            clients={clients}
            transactions={transactions}
            setActiveTab={setActiveTab}
          />
        );
      case ActiveTab.DASHBOARD_EXECUTIVO:
        return (
          <DashboardExecutive 
            products={products}
            sales={sales}
            clients={clients}
            transactions={transactions}
            sellers={sellers}
          />
        );
      case ActiveTab.VENDAS:
        return (
          <VendasList 
            products={products}
            setProducts={setProducts}
            sales={sales}
            setSales={setSales}
            setActiveTab={setActiveTab}
            onAddTransaction={handleAddTransaction}
          />
        );
      case ActiveTab.PDV:
        return (
          <PDVTerminal 
            products={products}
            clients={clients}
            onAddSale={handleAddSale}
            onUpdateClients={setClients}
            onAddClient={handleAddClient}
            setActiveTab={setActiveTab}
            sellers={sellers}
          />
        );
      case ActiveTab.PEDIDOS:
        return (
          <OrdersLogistics 
            products={products}
            sales={sales}
            clients={clients}
            onAddSale={handleAddSale}
            onlineOrders={onlineOrders}
            setOnlineOrders={setOnlineOrders}
            onUpdateOnlineOrderStatus={handleUpdateOnlineOrderStatus}
            activeSubTab={ordersLogisticsSubTab}
            setActiveSubTab={setOrdersLogisticsSubTab}
            sellers={sellers}
          />
        );
      case ActiveTab.PRODUTOS:
        return (
          <CatalogInventory 
            products={products}
            onAddProduct={handleAddProduct}
            onUpdateProduct={handleUpdateProduct}
            onDeleteProduct={handleDeleteProduct}
            activeSubTab={productsSubTab}
            setActiveSubTab={setProductsSubTab}
          />
        );
      case ActiveTab.CLIENTES:
        return (
          <CustomersCRM 
            clients={clients}
            sales={sales}
            onAddClient={handleAddClient}
            onUpdateClients={setClients}
            currentUser={currentUser}
            activeSubTab={customersCRMSubTab}
            setActiveSubTab={setCustomersCRMSubTab}
            teamMembers={teamMembers}
            onUpdateTeamMembers={setTeamMembers}
          />
        );
      case ActiveTab.FINANCEIRO:
        return (
          <FinanceCashflow 
            transactions={transactions}
            onAddTransaction={handleAddTransaction}
          />
        );
      case ActiveTab.LOJA_ONLINE:
        return (
          <LojaOnline 
            products={products}
            onEnterCustomerView={() => setIsCustomerView(true)}
          />
        );
      case ActiveTab.AGENTES_IA:
        return (
          <AIAgentsHub 
            products={products}
            clients={clients}
          />
        );
      case ActiveTab.GOOGLE_WORKSPACE:
        return (
          <GoogleWorkspace 
            products={products}
            sales={sales}
            clients={clients}
          />
        );
      case ActiveTab.METAS:
        return (
          <SalesGoalSimulator 
            sales={sales}
          />
        );
      case ActiveTab.CONFIGURACOES:
        return (
          <SettingsSystem 
            onResetData={handleResetData}
            onLoadDemoData={handleLoadDemoData}
            onClearAllData={handleClearAllData}
            products={products}
            sales={sales}
            clients={clients}
            transactions={transactions}
            onImportData={handleImportData}
            sellers={sellers}
            motoboys={motoboys}
            teamMembers={teamMembers}
            onUpdateTeamMembers={async (newList) => {
              setTeamMembers(newList);
              const config = getSupabaseConfig();
              if (config) {
                try {
                  await syncBulkTeamMembersToSupabase(newList);
                  console.log('Automated team users synchronization with Supabase complete.');
                } catch(e) {
                  console.error('Failed to sync updated list to Supabase:', e);
                }
              }
            }}
            onAddSeller={(name) => {
              if (!sellers.includes(name)) {
                const updated = [...sellers, name];
                setSellers(updated);
                localStorage.setItem('ap_moda_sellers', JSON.stringify(updated));
              }
            }}
            onDeleteSeller={(name) => {
              const updated = sellers.filter(s => s !== name);
              setSellers(updated);
              localStorage.setItem('ap_moda_sellers', JSON.stringify(updated));
            }}
            onAddMotoboy={(name) => {
              if (!motoboys.includes(name)) {
                const updated = [...motoboys, name];
                setMotoboys(updated);
                localStorage.setItem('ap_moda_motoboys', JSON.stringify(updated));
              }
            }}
            onDeleteMotoboy={(name) => {
              const updated = motoboys.filter(m => m !== name);
              setMotoboys(updated);
              localStorage.setItem('ap_moda_motoboys', JSON.stringify(updated));
            }}
          />
        );
      case ActiveTab.FORNECEDORES:
        return (
          <SuppliersManagement 
            products={products}
            onUpdateProduct={handleUpdateProduct}
            onAddTransaction={handleAddTransaction}
            activeSubTab={suppliersManagementSubTab}
            setActiveSubTab={setSuppliersManagementSubTab}
          />
        );
      case ActiveTab.METODOS_PAGAMENTO:
        return (
          <StorefrontPaymentConfig />
        );
      default:
        return (
          <DashboardOverview 
            products={products}
            sales={sales}
            clients={clients}
            transactions={transactions}
            setActiveTab={setActiveTab}
          />
        );
    }
  };

  if (!currentUser) {
    return (
      <LoginScreen 
        sellers={sellers}
        motoboys={motoboys}
        teamMembers={teamMembers}
        clients={clients}
        onLogin={async (user) => {
          setCurrentUser(user);
          await runFullSynchronousSetup(user);
        }}
      />
    );
  }

  if (isCustomerView) {
    return (
      <PublicCatalog 
        products={products}
        onAddOnlineOrder={handleAddOnlineOrder}
        clients={clients}
        onAddClient={handleAddClient}
        onUpdateClients={(updatedList) => setClients(updatedList)}
        onExitCustomerView={() => setIsCustomerView(false)}
      />
    );
  }

  if (currentUser?.role === 'Cliente') {
    return (
      <CustomerPortal 
        currentUser={currentUser}
        onLogout={() => setCurrentUser(null)}
        sales={sales}
        products={products}
        clients={clients}
        onUpdateClients={setClients}
      />
    );
  }

  if (currentUser?.role === 'Parceiro') {
    return (
      <PartnerPortal 
        currentUser={currentUser}
        onLogout={() => setCurrentUser(null)}
        onlineOrders={onlineOrders}
        sales={sales}
      />
    );
  }

  if (isDriverPortalOpen) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
        <DriverAppPortal 
          onlineOrders={onlineOrders}
          onUpdateOrderStatus={handleUpdateOnlineOrderStatus}
          onExitPortal={() => setIsDriverPortalOpen(false)}
          currentUser={currentUser}
          onLogout={() => setCurrentUser(null)}
        />
      </div>
    );
  }

  const showBlockingLoader = isCloudSyncingOnLogin && products.length === 0;

  if (showBlockingLoader) {
    const stepsList = [
      'Conectando...',
      'Sincronizando Login...',
      'Sincronizando Produtos...',
      'Sincronizando Clientes...',
      'Sincronizando Histórico de Vendas...',
      'Sincronizando Financeiro...',
      'Sincronizando Pedidos Online...',
      'Sincronizando Configurações Globais...'
    ];

    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-950 text-white font-sans p-6 overflow-y-auto">
        {/* Ambient high-tech neon details */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-pink-600/10 rounded-full blur-3xl p-1 pointer-events-none animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl p-1 pointer-events-none animate-pulse" />
        
        <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl relative z-10 text-center space-y-6">
          <div className="flex flex-col items-center">
            {/* Elegant glowing active loader logo */}
            {syncProgress.status === 'error' ? (
              <div className="w-16 h-16 rounded-full bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-500 mb-4 animate-bounce">
                <span className="font-bold text-2xl">!</span>
              </div>
            ) : (
              <div className="relative mb-4">
                <div className="w-16 h-16 rounded-full border-4 border-slate-800 border-t-pink-600 animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="inline-block w-3.5 h-3.5 bg-pink-500 rounded-full animate-ping" />
                </div>
              </div>
            )}
            
            <h2 className="text-xl font-bold tracking-tight text-white font-sans text-center">
              {syncProgress.status === 'error' ? 'Falha na Sincronização' : 'Sincronizando com a Nuvem'}
            </h2>
            <p className="text-xs text-slate-400 mt-1.5 leading-relaxed text-center">
              Olá, <strong className="text-pink-500">{currentUser?.name || 'Profissional'}</strong>. Estamos preparando e carregando todos os dados da loja em tempo real neste aparelho!
            </p>
          </div>

          {/* Steps Progress List */}
          <div className="bg-slate-950/50 border border-slate-800/80 rounded-xl p-4 text-left space-y-2.5 font-mono text-[11px]">
            {stepsList.map((stepItem, index) => {
              const isCompleted = syncProgress.stepsCompleted.includes(stepItem);
              const isActive = syncProgress.step === stepItem;
              
              let statusIndicator = <span className="w-1.5 h-1.5 rounded-full bg-slate-700 inline-block mr-2.5" />;
              let textColor = 'text-slate-500';
              
              if (isCompleted) {
                statusIndicator = <span className="text-emerald-500 font-bold mr-2 inline-block">✓</span>;
                textColor = 'text-slate-400 line-through decoration-slate-800';
              } else if (isActive) {
                statusIndicator = <span className="text-pink-500 font-bold mr-2 inline-block animate-pulse">➔</span>;
                textColor = 'text-pink-500 font-bold animate-pulse';
              }
              
              return (
                <div key={index} className={`flex items-center ${textColor}`}>
                  {statusIndicator}
                  <span>{stepItem}</span>
                </div>
              );
            })}
          </div>

          <div className="space-y-4">
            <p className="text-[11px] text-slate-400 italic bg-slate-850/40 p-3 rounded-lg border border-slate-800 text-center">
              "{syncProgress.details}"
            </p>

            {syncProgress.status === 'error' ? (
              <div className="flex gap-2">
                <button
                  onClick={() => runFullSynchronousSetup(currentUser)}
                  className="flex-1 py-2.5 bg-pink-600 hover:bg-pink-700 text-white text-xs font-bold rounded-xl transition duration-300 cursor-pointer border-none"
                >
                  Tentar Novamente
                </button>
                <button
                  onClick={() => setIsCloudSyncingOnLogin(false)}
                  className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white text-xs font-bold rounded-xl transition duration-300 cursor-pointer border-none"
                >
                  Entrar Offline
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex" id="main-app-container">
      {/* Sidebar navigation */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        isOpen={isSidebarOpen} 
        setIsOpen={setIsSidebarOpen}
        lowStockCount={lowStockCount}
        onOpenDriverPortal={() => setIsDriverPortalOpen(true)}
        themeAccent={themeAccent}
        setThemeAccent={setThemeAccent}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        currentUser={currentUser}
        onLogout={() => setCurrentUser(null)}
        onSetOrdersLogisticsSubTab={setOrdersLogisticsSubTab}
        onSetCustomersCRMSubTab={setCustomersCRMSubTab}
        onSetSuppliersManagementSubTab={setSuppliersManagementSubTab}
        onSetProductsSubTab={setProductsSubTab}
        onSetLojaOnlineSubTab={setLojaOnlineSubTab}
        onSetAiAgentsHubSubTab={setAiAgentsHubSubTab}
        onSetGoogleWorkspaceSubTab={setGoogleWorkspaceSubTab}
        onSetSettingsSystemSubTab={setSettingsSystemSubTab}
        activeOrdersLogisticsSubTab={ordersLogisticsSubTab}
        activeCustomersCRMSubTab={customersCRMSubTab}
        activeSuppliersManagementSubTab={suppliersManagementSubTab}
        activeProductsSubTab={productsSubTab}
        activeLojaOnlineSubTab={lojaOnlineSubTab}
        activeAiAgentsHubSubTab={aiAgentsHubSubTab}
        activeGoogleWorkspaceSubTab={googleWorkspaceSubTab}
        activeSettingsSystemSubTab={settingsSystemSubTab}
      />

      {/* Main Screen content block (shifted on desktop) */}
      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        
        {/* Top Sticky Header */}
        <header className="sticky top-0 bg-white border-b border-slate-100 z-30 px-4 md:px-6 h-16 flex items-center justify-between shadow-xs">
          
          {/* Mobile hamburger menu toggle */}
          <div className="flex items-center gap-3">
            <button 
              id="sidebar-toggle-btn"
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-1.5 text-slate-500 hover:text-pink-600 hover:bg-slate-55 rounded-md transition-all cursor-pointer"
            >
              <Menu size={20} />
            </button>

            {/* Quick stats indicator */}
            <div className="hidden sm:flex items-center gap-2 text-slate-400 text-xs font-medium">
              {systemOffline ? (
                <div className="flex items-center gap-1.5 bg-amber-500/10 text-amber-500 px-2.5 py-0.5 rounded-full border border-amber-500/30 font-bold text-[10px] animate-pulse" title="Você está operando offline. Todos os dados estão sendo salvos localmente!">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping" />
                  <span>Modo Offline Ativo ⚡</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2.5 py-0.5 rounded-full border border-emerald-500/20 font-bold text-[10px]" title="Conectado à internet com segurança. Sincronização em tempo real!">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Conexão Segura</span>
                </div>
              )}
              <span className="text-slate-200">|</span>
              <button 
                onClick={() => setIsCustomerView(true)}
                className="bg-pink-600 hover:bg-pink-700 active:scale-95 text-white flex items-center gap-1.5 font-bold text-xs px-3 py-1 bg-pink-600/90 rounded-full transition-all shadow-sm shadow-pink-600/20 cursor-pointer animate-pulse border-none"
                title="Navegar no catálogo moderno como se fosse sua cliente"
              >
                <ShoppingBag size={11} />
                <span>Ver Vitrine Cliente 🌸</span>
              </button>
              <span className="text-slate-200">|</span>
              <button 
                onClick={() => setIsDriverPortalOpen(true)}
                className="hover:text-pink-600 flex items-center gap-1 font-semibold text-slate-550 transition-colors cursor-pointer"
                title="Ativar modo App do Entregador isolado"
              >
                🏍️ App Entregador
              </button>
              <span className="text-slate-200">|</span>
              <button 
                onClick={() => setSimulateOffline(!simulateOffline)}
                title={simulateOffline ? "Reconectar sinal de Internet" : "Simular queda de Internet ou Energia"}
                className={`flex items-center gap-1.5 font-bold text-[11px] px-2 py-0.5 rounded-lg transition-all cursor-pointer ${
                  simulateOffline 
                    ? 'bg-amber-500/20 text-amber-600 dark:text-amber-400 animate-pulse' 
                    : 'text-slate-500 hover:text-amber-500 dark:hover:text-amber-400 hover:bg-amber-500/5'
                }`}
              >
                <span>🔌 {simulateOffline ? "Reconectar Internet" : "Simular Offline"}</span>
              </button>
              <span className="text-slate-200">|</span>
              <button 
                onClick={handleResetData}
                title="Restaurar dados originais"
                className="hover:text-pink-600 flex items-center gap-1 font-semibold transition-colors cursor-pointer"
              >
                <RefreshCw size={12} />
                Restaurar Fábrica
              </button>
            </div>
          </div>

          {/* Quick global search text & notification alerts */}
          <div className="flex items-center gap-4">
            
            {/* Manual Cloud Sync Button (Instantly connects multiple devices to the same data) */}
            <button 
              onClick={() => performSync(true)}
              disabled={isSyncingNow}
              className={`flex items-center gap-1.5 font-bold text-xs px-3.5 py-2.5 sm:py-2 rounded-xl border-none cursor-pointer transition-all active:scale-95 text-white shadow-md ${
                isSyncingNow 
                  ? 'bg-amber-500 hover:bg-amber-600 animate-pulse cursor-not-allowed shadow-amber-500/25' 
                  : systemOffline
                    ? 'bg-slate-400 hover:bg-slate-500 shadow-slate-450/25'
                    : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/25'
              }`}
              title="Clique para sincronizar, parear e compartilhar os dados em tempo real com todos os celulares e tablets conectados"
            >
              <CloudLightning size={14} className={isSyncingNow ? 'animate-spin text-white' : 'text-emerald-100'} />
              <span className="hidden sm:inline">{isSyncingNow ? 'Sincronizando...' : 'Sincronizar Vários Aparelhos ☁️'}</span>
              <span className="sm:hidden">{isSyncingNow ? 'Sincronizando...' : 'Sincronizar ☁️'}</span>
            </button>

            {/* Search mock bar */}
            <div className="relative hidden md:block w-64">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                <Search size={14} />
              </span>
              <input 
                id="global-search-input"
                type="text" 
                placeholder="Buscar produtos, clientes, vendas..." 
                className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-150 rounded-lg text-xs font-sans text-slate-650 placeholder-slate-400 focus:outline-hidden"
                onClick={() => alert("Dica: Use as buscas específicas de cada menu (PDV, Estoque ou CRM) para encontrar as informações com filtros avançados e fáceis!")}
              />
            </div>

            {/* Notifications ring with dropdown */}
            <div className="relative">
              <button 
                id="notification-bell-btn"
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                className="p-1.5 text-slate-500 hover:text-pink-600 hover:bg-slate-50 rounded-xl transition-all cursor-pointer relative"
              >
                <Bell size={18} />
                {unreadNotificationsCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-pink-600 text-[9px] font-bold text-white rounded-full flex items-center justify-center animate-bounce">
                    {unreadNotificationsCount}
                  </span>
                )}
              </button>

              {/* Notification bubble menu */}
              {isNotificationsOpen && (
                <div id="notifications-menu" className="absolute right-0 mt-3 bg-white border border-slate-100 rounded-xl shadow-xl w-72 p-3 z-50 text-xs space-y-2 text-left animate-in fade-in-50 duration-200">
                  <div className="flex justify-between items-center border-b border-slate-50 pb-2">
                    <span className="font-bold text-slate-800">Mensagens do Sistema</span>
                    <button 
                      onClick={() => setNotifications(prev => prev.map(n => ({...n, read: true})))}
                      className="text-pink-600 hover:text-pink-700 font-bold text-[10px] cursor-pointer"
                    >
                      Marcar Lidas
                    </button>
                  </div>
                  <div className="divide-y divide-slate-50 max-h-56 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <p className="py-4 text-center text-slate-400 text-[11px]">Nenhuma nova notificação</p>
                    ) : (
                      notifications.map(n => (
                        <div key={n.id} className={`py-2 text-slate-700 leading-tight ${!n.read ? 'bg-pink-50/20 px-1 py-1 rounded' : ''}`}>
                          <p className="font-semibold">{n.title}</p>
                          <p className="text-slate-400 text-[10px] mt-0.5">{n.detail}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Toggle Dark Mode Button */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-1.5 text-slate-500 hover:text-pink-600 hover:bg-slate-100 rounded-xl transition-all cursor-pointer flex items-center justify-center"
              title={darkMode ? "Ativar Modo Claro ☀️" : "Ativar Modo Escuro 🌙"}
            >
              {darkMode ? (
                <Sun size={18} className="text-amber-500 animate-[spin_8s_linear_infinite]" />
              ) : (
                <Moon size={18} className="text-slate-600" />
              )}
            </button>

            {/* User Profile matching screenshot */}
            <div className="flex items-center gap-2.5 pl-2 border-l border-slate-100 font-sans">
              <div className="w-8 h-8 rounded-lg bg-pink-100 text-pink-600 font-extrabold text-xs flex items-center justify-center uppercase">
                {currentUser?.name ? currentUser.name.slice(0, 2) : 'AP'}
              </div>
              <div className="hidden sm:block text-left select-none">
                <p className="text-xs font-bold text-slate-700 leading-none">{currentUser?.name || 'Administrador'}</p>
                <p className="text-[10px] text-slate-400 font-mono mt-0.5">{currentUser?.role || 'Acesso Geral'}</p>
              </div>
            </div>

          </div>
        </header>

        {systemOffline && (
          <div className="bg-amber-500 text-slate-950 font-sans px-4 py-2.5 text-xs flex flex-col md:flex-row justify-between items-center gap-2 font-bold shadow-inner relative z-20 transition-all duration-300 border-b border-amber-600">
            <div className="flex items-center gap-2">
              <span className="p-1.5 bg-amber-600 rounded-lg text-white font-mono text-[10px] shrink-0">⚡ OFFLINE</span>
              <p className="text-left leading-normal">
                MODO OFFLINE SEGURO: <span className="font-medium text-slate-900">Seu sinal caiu ou você ativou a simulação. Não se preocupe! O sistema está funcionando localmente. Novas vendas, caixa, estoque e clientes serão salvos no seu aparelho e sincronizados perfeitamente na próxima conexão.</span>
              </p>
            </div>
            {offlinePendingSync.length > 0 ? (
              <span className="bg-slate-900 text-amber-400 text-[10px] px-2.5 py-1 rounded-full shrink-0 flex items-center gap-1.5 animate-pulse">
                <span>🔄 Fila local: {offlinePendingSync.length} no WhatsApp</span>
              </span>
            ) : (
              <span className="bg-amber-600/30 text-amber-950 text-[10px] px-2.5 py-1 rounded-full shrink-0 font-extrabold uppercase">
                ✔️ Banco de Dados Local Ativo
              </span>
            )}
          </div>
        )}

        {/* Dynamic Page container */}
        <main className="flex-grow p-4 md:p-6 overflow-y-auto max-w-7xl mx-auto w-full">
          {renderCurrentView()}
        </main>
      </div>

      {/* Modern, non-blocking floating cloud synchronization widget in the bottom-right corner */}
      {isCloudSyncingOnLogin && products.length > 0 && (
        <div 
          style={{ transition: 'all 0.4s ease' }}
          className="fixed bottom-4 right-4 z-[9999] w-80 bg-slate-900 text-white font-sans rounded-2xl p-4 shadow-2xl border border-slate-800 flex flex-col gap-3 animate-fade-in"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="relative">
                <span className="w-2.5 h-2.5 rounded-full bg-pink-500 block animate-ping absolute inset-0" />
                <span className="w-2.5 h-2.5 rounded-full bg-pink-500 block relative" />
              </div>
              <span className="text-[10px] font-bold tracking-wide uppercase text-slate-400">
                Sincronização Ativa ☁️
              </span>
            </div>
            <button 
              onClick={() => setIsCloudSyncingOnLogin(false)}
              className="text-slate-400 hover:text-white hover:bg-slate-800 p-1 rounded-lg transition-colors border-none bg-transparent cursor-pointer text-xs"
              title="Ocultar painel"
            >
              ✕
            </button>
          </div>

          <div className="space-y-1.5 text-left">
            <p className="text-xs font-bold text-white flex items-center gap-1.5">
              <span className="inline-block w-3 h-3 rounded-full border-2 border-slate-700 border-t-pink-500 animate-spin" />
              {syncProgress.step}
            </p>
            <p className="text-[10px] text-slate-400 leading-relaxed italic">
              "{syncProgress.details}"
            </p>
          </div>

          <div className="flex items-center gap-2 justify-between border-t border-slate-800/80 pt-2.5">
            <div className="text-[9px] text-slate-500 font-mono">
              Processado: {syncProgress.stepsCompleted.length}/8 tabelas
            </div>
            <div className="flex gap-1 items-center">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[9px] text-emerald-400 font-mono font-bold uppercase animate-pulse">
                Segundo Plano
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
