/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  BarChart3, 
  ShoppingBag, 
  Package, 
  Users, 
  DollarSign, 
  Menu, 
  X,
  Sparkles,
  Percent,
  CheckSquare,
  Truck,
  HelpCircle,
  TrendingUp,
  Sliders,
  BadgeAlert,
  Bot,
  Target,
  Search,
  Star,
  Gift,
  Compass,
  Award,
  Calendar,
  RefreshCcw,
  Instagram,
  Coins,
  FileText,
  MessageCircle,
  Sun
} from 'lucide-react';
import { ActiveTab } from '../types';

interface SidebarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  lowStockCount: number;
  onOpenDriverPortal?: () => void;
  themeAccent: 'neon' | 'verde' | 'roxo' | 'rosa';
  setThemeAccent: (accent: 'neon' | 'verde' | 'roxo' | 'rosa') => void;
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
}

export default function Sidebar({ 
  activeTab, 
  setActiveTab, 
  isOpen, 
  setIsOpen, 
  lowStockCount, 
  onOpenDriverPortal,
  themeAccent,
  setThemeAccent,
  darkMode,
  setDarkMode
}: SidebarProps) {
  const [logoUrl, setLogoUrl] = useState(() => {
    return localStorage.getItem('ap_store_logo') || '';
  });

  useEffect(() => {
    const checkLogo = () => {
      const currentLogo = localStorage.getItem('ap_store_logo') || '';
      if (currentLogo !== logoUrl) {
        setLogoUrl(currentLogo);
      }
    };
    window.addEventListener('storage', checkLogo);
    const interval = setInterval(checkLogo, 1000);
    return () => {
      window.removeEventListener('storage', checkLogo);
      clearInterval(interval);
    };
  }, [logoUrl]);

  const [searchTerm, setSearchTerm] = useState('');

  const menuItems = [
    {
      group: 'PRINCIPAL',
      items: [
        { id: ActiveTab.DASHBOARD, label: 'Dashboard Geral', icon: LayoutDashboard, keywords: 'painel index geral metricas graficos' },
        { id: ActiveTab.DASHBOARD_EXECUTIVO, label: 'Painel Executivo / BI', icon: BarChart3, keywords: 'bi executivo dashboard relatorios' },
        { id: ActiveTab.METAS, label: 'Simulador de Metas', icon: Target, keywords: 'metas simulador simulacao' }
      ]
    },
    {
      group: 'OPERAÇÕES & VENDAS',
      items: [
        { id: ActiveTab.PRODUTOS, label: 'Estoque & Catálogo', icon: Package, badge: lowStockCount > 0 ? lowStockCount : undefined, keywords: 'produtos estoque catalogo fornecedores sku mercadorias' },
        { id: ActiveTab.VENDAS, label: 'Histórico de Vendas', icon: Percent, keywords: 'vendas cupons descontos historico relatorio' },
        { id: ActiveTab.PDV, label: 'Ponto de Venda / PDV', icon: DollarSign, keywords: 'pdv caixa registrar venda balcao terminal' },
        { id: ActiveTab.PEDIDOS, label: 'Pedidos & Logística', icon: Truck, keywords: 'pedidos logistica entregas trocas' }
      ]
    },
    {
      group: 'RELACIONAMENTO & FINANCEIRO',
      items: [
        { id: ActiveTab.CLIENTES, label: 'Clientes / CRM', icon: Users, keywords: 'clientes crm compradores contatos follow-up' },
        { id: ActiveTab.FINANCEIRO, label: 'Contas & Caixa', icon: Sliders, keywords: 'financeiro contas caixa transacoes' },
        { id: ActiveTab.LOJA_ONLINE, label: 'Loja Online / Vitrine', icon: ShoppingBag, keywords: 'site e-commerce vitrine loja online' }
      ]
    },
    {
      group: 'TECNOLOGIA & IA',
      items: [
        { id: ActiveTab.AGENTES_IA, label: 'Copilotos & Agentes IA', icon: Bot, keywords: 'ia inteligente agentes robo whatsapp bot assistente' },
        { id: ActiveTab.GOOGLE_WORKSPACE, label: 'Workspace Google', icon: Calendar, keywords: 'google agenda gmail docs spreadsheets drive tasks tarefas planilhas workspace' },
        { id: ActiveTab.CONFIGURACOES, label: 'Configurações & API', icon: Sliders, keywords: 'configuracoes api integracao webhook token database' }
      ]
    }
  ];

  const filteredMenuItems = menuItems.map(group => {
    const items = group.items.filter(item => {
      const term = searchTerm.toLowerCase();
      const matchLabel = item.label.toLowerCase().includes(term);
      const matchGroup = group.group.toLowerCase().includes(term);
      const matchKeywords = item.keywords ? item.keywords.toLowerCase().includes(term) : false;
      return matchLabel || matchGroup || matchKeywords;
    });
    return { ...group, items };
  }).filter(group => group.items.length > 0);

  const handleTabClick = (tabId: string) => {
    if (Object.values(ActiveTab).includes(tabId as ActiveTab)) {
      setActiveTab(tabId as ActiveTab);
      if (window.innerWidth < 1024) {
        setIsOpen(false);
      }
    }
  };

  const selectColorTheme = (theme: 'neon' | 'verde' | 'roxo' | 'rosa') => {
    setThemeAccent(theme);
    setDarkMode(true);
  };

  const selectLightTheme = () => {
    setDarkMode(false);
    setThemeAccent('rosa');
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          id="sidebar-backdrop"
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside 
        id="app-sidebar"
        className={`fixed inset-y-0 left-0 w-64 bg-slate-900 border-r border-slate-800 flex flex-col z-50 transition-all duration-300 transform 
          ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 overflow-y-auto scrollbar-thin`}
      >
        {/* Sidebar Header */}
        <div className="p-4 border-b border-slate-800 shrink-0">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-pink-600 flex items-center justify-center text-white font-bold text-lg shadow-md shadow-pink-500/20 overflow-hidden">
                {logoUrl ? (
                  <img 
                    src={logoUrl} 
                    alt="Logo AP Moda Fitness" 
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                      const parent = (e.target as HTMLElement).parentElement;
                      if (parent) {
                        parent.innerHTML = '<span class="font-bold text-lg text-white">AP</span>';
                      }
                    }}
                  />
                ) : (
                  "AP"
                )}
              </div>
              <div className="min-w-0">
                <h1 className="text-white font-bold text-sm tracking-wide truncate">AP Moda Fitness</h1>
                <p className="text-slate-400 text-[9px] font-mono tracking-wider font-semibold uppercase truncate">Gestão Completa</p>
              </div>
            </div>
            <button 
              id="close-sidebar-btn"
              onClick={() => setIsOpen(false)}
              className="lg:hidden p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-md transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Slogan */}
          <div className="text-[8px] text-slate-500 font-extrabold font-mono tracking-wider mb-3 leading-tight select-none uppercase">
            Onde o seu limite vira ponto de partida
          </div>

          {/* Dynamic Theme row matching video: Neon, Verde, Roxo, Claro */}
          <div className="grid grid-cols-4 gap-1.5 pt-1">
            <button 
              onClick={() => selectColorTheme('neon')}
              className={`flex flex-col items-center justify-center py-1 px-1 rounded bg-slate-950/30 border text-[9px] font-sans font-bold transition-all cursor-pointer ${
                themeAccent === 'neon' && darkMode
                  ? 'border-cyan-500/80 bg-cyan-500/10 text-cyan-400 shadow-sm' 
                  : 'border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 mb-1" />
              <span>Neon</span>
            </button>
            <button 
              onClick={() => selectColorTheme('verde')}
              className={`flex flex-col items-center justify-center py-1 px-1 rounded bg-slate-950/30 border text-[9px] font-sans font-bold transition-all cursor-pointer ${
                themeAccent === 'verde' && darkMode
                  ? 'border-emerald-500/80 bg-emerald-500/10 text-emerald-400 shadow-sm' 
                  : 'border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mb-1" />
              <span>Verde</span>
            </button>
            <button 
              onClick={() => selectColorTheme('roxo')}
              className={`flex flex-col items-center justify-center py-1 px-1 rounded bg-slate-950/30 border text-[9px] font-sans font-bold transition-all cursor-pointer ${
                themeAccent === 'roxo' && darkMode
                  ? 'border-purple-500/80 bg-purple-500/10 text-purple-400 shadow-sm' 
                  : 'border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-purple-400 mb-1" />
              <span>Roxo</span>
            </button>
            <button 
              onClick={selectLightTheme}
              className={`flex flex-col items-center justify-center py-1 px-1 rounded bg-slate-950/30 border text-[9px] font-sans font-bold transition-all cursor-pointer ${
                !darkMode 
                  ? 'border-amber-400/80 bg-amber-400/10 text-amber-500 shadow-sm' 
                  : 'border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mb-1" />
              <span>Claro</span>
            </button>
          </div>
        </div>

        {/* Intelligent Search Input */}
        <div className="px-3 pt-3 pb-2 border-b border-slate-800/40 shrink-0">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-500" />
            <input
              type="text"
              placeholder="Buscar aba ou recurso..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-950/45 text-slate-200 placeholder-slate-500 text-[11px] font-sans pl-8 pr-7 py-1.5 rounded-lg border border-slate-800 focus:border-pink-500/50 focus:bg-slate-950/90 focus:ring-0 transition-all outline-none"
            />
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 top-2 text-[10px] text-slate-500 hover:text-slate-350 font-bold uppercase tracking-wider bg-transparent border-0 outline-none"
              >
                Limpar
              </button>
            )}
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-3 py-3 space-y-4 overflow-y-auto min-h-0">
          {filteredMenuItems.map((group, gIdx) => (
            <div key={gIdx} className="space-y-1">
              <span className="px-3 text-[9px] font-bold text-slate-500 tracking-wider font-sans uppercase">
                {group.group}
              </span>
              <ul className="space-y-0.5">
                {group.items.map((item) => {
                  const isActive = activeTab === item.id;

                  return (
                    <li key={item.id}>
                      <button
                        id={`sidebar-btn-${item.id}`}
                        onClick={() => handleTabClick(item.id)}
                        className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs font-semibold font-sans transition-all duration-250 group cursor-pointer border-0 text-left outline-none bg-transparent
                          ${isActive 
                            ? 'bg-pink-600 text-white shadow-sm shadow-pink-500/10 font-bold' 
                            : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                          }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <item.icon size={15} className={isActive ? 'text-white' : 'text-slate-400 group-hover:text-pink-400 transition-colors'} />
                          <span>{item.label}</span>
                        </div>

                        {(item as any).badge !== undefined && (
                          <span className="bg-amber-500/20 text-amber-400 font-bold px-1.5 py-0.5 rounded-full text-[10px] animate-pulse">
                            {(item as any).badge}
                          </span>
                        )}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}

          {filteredMenuItems.length === 0 && (
            <div className="px-3 py-10 text-center">
              <p className="text-slate-500 text-xs font-medium mb-2">Nenhuma aba corresponde à busca</p>
              <button 
                onClick={() => setSearchTerm('')}
                className="text-pink-500 hover:text-pink-400 text-[10px] font-bold uppercase tracking-wider underline cursor-pointer bg-transparent border-0"
              >
                Ver Todas as Abas
              </button>
            </div>
          )}
        </nav>

        {/* Isolated Driver Mode Gateway Button */}
        {onOpenDriverPortal && (
          <div className="px-3 pb-3">
            <button
              onClick={onOpenDriverPortal}
              className="w-full py-2.5 px-3 bg-pink-700 hover:bg-pink-800 text-white font-extrabold text-[11px] rounded-lg tracking-wide shadow-md shadow-pink-900/40 flex items-center justify-center gap-1.5 transition-all text-center cursor-pointer hover:shadow-lg active:scale-95 border-0"
            >
              <span>🏍️ MODO ENTREGADOR APP</span>
            </button>
          </div>
        )}

        {/* User Footer / Pro Brand */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/30">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-pink-400 font-bold text-xs ring-2 ring-slate-800">
              SUP
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-xs font-semibold truncate leading-tight">Painel Corporativo</p>
              <p className="text-slate-500 text-[10px] truncate leading-tight font-mono">Suplementação Inteligente</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
