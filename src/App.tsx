/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
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
  Moon
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

export default function App() {
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
    if (saved) return JSON.parse(saved);
    return [
      { id: 'usr-1', name: 'Ana Paula Admin', login: 'admin', role: 'Admin', password: 'admin123', details: 'Administradora Geral', createdAt: '2026-06-15T12:00:00Z' },
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

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('ap_moda_products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('ap_moda_clients', JSON.stringify(clients));
  }, [clients]);

  useEffect(() => {
    localStorage.setItem('ap_moda_sales', JSON.stringify(sales));
  }, [sales]);

  useEffect(() => {
    localStorage.setItem('ap_moda_transactions', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('ap_moda_online_orders', JSON.stringify(onlineOrders));
  }, [onlineOrders]);

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
    const adminPassword = adminUser ? adminUser.password : 'admin123';
    
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
            onUpdateTeamMembers={setTeamMembers}
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
        onLogin={(user) => {
          setCurrentUser(user);
          if (user.role === 'Vendedor') {
            setActiveTab(ActiveTab.VENDAS); // or ActiveTab.PDV
            setActiveTab(ActiveTab.PDV);
          } else if (user.role === 'Cliente') {
            // Handled automatically by the CustomerPortal intercept below
          } else {
            setActiveTab(ActiveTab.DASHBOARD);
          }
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
    </div>
  );
}
