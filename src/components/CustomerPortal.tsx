/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { 
  User, 
  Coins, 
  Award, 
  History, 
  Sparkles, 
  Ruler, 
  Scale, 
  Save, 
  LogOut, 
  QrCode, 
  ShoppingBag, 
  Percent, 
  Heart, 
  Gift, 
  RefreshCw, 
  Phone, 
  Mail, 
  Tag, 
  Check, 
  ArrowRight,
  TrendingUp,
  FileText
} from 'lucide-react';
import { Client, Sale, Product } from '../types';

interface CustomerPortalProps {
  currentUser: {
    name: string;
    role: 'Cliente';
    details: Client;
  };
  onLogout: () => void;
  sales: Sale[];
  products: Product[];
  clients: Client[];
  onUpdateClients: (updatedList: Client[]) => void;
}

export default function CustomerPortal({
  currentUser,
  onLogout,
  sales = [],
  products = [],
  clients = [],
  onUpdateClients
}: CustomerPortalProps) {
  // Find the fresh live client object in case of updates
  const clientData = useMemo(() => {
    const found = clients.find(c => c.id === currentUser.details?.id);
    return found || currentUser.details;
  }, [clients, currentUser.details]);

  // States for sizes/measurements form
  const [busto, setBusto] = useState<string>(clientData.busto?.toString() || '');
  const [cintura, setCintura] = useState<string>(clientData.cintura?.toString() || '');
  const [quadril, setQuadril] = useState<string>(clientData.quadril?.toString() || '');
  const [coxa, setCoxa] = useState<string>(clientData.coxa?.toString() || '');
  const [altura, setAltura] = useState<string>(clientData.altura?.toString() || '');
  const [peso, setPeso] = useState<string>(clientData.peso?.toString() || '');

  const [savingMeasurements, setSavingMeasurements] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState<'vip' | 'compras' | 'medidas' | 'regras'>('vip');

  // Filter sales for this client
  const clientSales = useMemo(() => {
    return sales.filter(s => {
      // Match by exact client name or client document (CPF)
      const nameMatch = s.clientName?.toLowerCase().trim() === clientData.name?.toLowerCase().trim();
      const docMatch = s.clientDoc && clientData.cpf && 
        s.clientDoc.replace(/\D/g, '') === clientData.cpf.replace(/\D/g, '');
      return nameMatch || docMatch;
    });
  }, [sales, clientData]);

  // Compute stats
  const totalPurchasesAmount = useMemo(() => {
    return clientSales
      .filter(s => s.status === 'Concluída')
      .reduce((sum, s) => sum + s.total, 0);
  }, [clientSales]);

  const formattingBRL = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  // Handle measurement save
  const handleSaveMeasurements = (e: React.FormEvent) => {
    e.preventDefault();
    setSavingMeasurements(true);
    setSaveSuccess(false);

    const updatedClient: Client = {
      ...clientData,
      busto: busto ? Number(busto) : undefined,
      cintura: cintura ? Number(cintura) : undefined,
      quadril: quadril ? Number(quadril) : undefined,
      coxa: coxa ? Number(coxa) : undefined,
      altura: altura ? Number(altura) : undefined,
      peso: peso ? Number(peso) : undefined,
    };

    const nextClients = clients.map(c => c.id === clientData.id ? updatedClient : c);
    
    // Simulate real network delay for luxury feel
    setTimeout(() => {
      onUpdateClients(nextClients);
      setSavingMeasurements(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    }, 800);
  };

  // Generate Referral Code
  const referralCode = useMemo(() => {
    const firstName = clientData.name.split(' ')[0] || 'VIP';
    return `${firstName.toUpperCase()}-FIT-10`;
  }, [clientData.name]);

  // Compute VIP Tier/Status based on total spent
  const vipTier = useMemo(() => {
    const spent = totalPurchasesAmount;
    if (spent >= 1500) {
      return {
        name: 'Black Platinum VIP',
        cashbackRate: '15%',
        bgClass: 'bg-gradient-to-br from-slate-900 via-purple-950 to-pink-900 border-purple-500/40 text-white',
        tagColor: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
        progressBarColor: 'bg-purple-500',
        nextTier: 'Nível Máximo de Fidelidade Atingido!'
      };
    } else if (spent >= 600) {
      return {
        name: 'Ouro Gold VIP',
        cashbackRate: '10%',
        bgClass: 'bg-gradient-to-br from-amber-950/90 via-slate-900 to-pink-950 border-amber-500/30 text-white',
        tagColor: 'bg-amber-400/20 text-amber-300 border-amber-400/30',
        progressBarColor: 'bg-amber-500',
        nextTier: 'Faltam R$ ' + (1500 - spent).toFixed(2) + ' para se tornar Black Platinum (15% Cashback)'
      };
    } else {
      return {
        name: 'Bronze Starter VIP',
        cashbackRate: '5%',
        bgClass: 'bg-gradient-to-br from-slate-900 via-rose-950/40 to-slate-900 border-slate-800 text-white',
        tagColor: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
        progressBarColor: 'bg-rose-500',
        nextTier: 'Faltam R$ ' + (600 - spent).toFixed(2) + ' para se tornar Ouro Gold (10% Cashback)'
      };
    }
  }, [totalPurchasesAmount]);

  return (
    <div id="customer-vip-portal-root" className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans select-none selection:bg-pink-600 selection:text-white">
      {/* Background ambient light */}
      <div className="absolute top-0 left-0 right-0 h-96 bg-[radial-gradient(ellipse_at_top,rgba(219,39,119,0.12),transparent_70%)] pointer-events-none" />

      {/* Top Header Navigation */}
      <header id="customer-header" className="sticky top-0 z-10 backdrop-blur-md bg-slate-950/80 border-b border-slate-800/80 px-4 py-3 md:px-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-pink-600 rounded-xl flex items-center justify-center font-extrabold text-white text-base shadow-lg shadow-pink-500/20">
              AP
            </div>
            <div>
              <h1 className="text-sm font-bold tracking-wide">AP Moda Fitness</h1>
              <p className="text-[10px] text-pink-400 font-mono font-medium uppercase tracking-widest">VIP Club Portal</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-semibold leading-none text-slate-200">{clientData.name}</p>
              <span className="text-[9px] text-slate-400 font-mono">ID: {clientData.id}</span>
            </div>
            <button
              id="customer-logout-btn"
              type="button"
              onClick={onLogout}
              className="p-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-rose-400 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 text-xs font-semibold"
            >
              <LogOut size={14} />
              <span className="hidden sm:inline">Sair do Portal</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main id="customer-main-content" className="flex-1 max-w-6xl w-full mx-auto px-4 py-6 md:py-8 space-y-6 relative">
        
        {/* Welcome Block */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/60 border border-slate-800 p-5 rounded-2xl">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h2 className="text-lg md:text-xl font-bold tracking-tight text-white">Olá, {clientData.name.split(' ')[0]}!</h2>
              <span className="animate-pulse flex h-2 w-2 rounded-full bg-green-500" />
            </div>
            <p className="text-xs text-slate-400">É um imenso prazer ter você no nosso clube de fidelidade exclusivo. Veja seus bônus acumulados abaixo.</p>
          </div>
          <div className="flex items-center gap-3.5 bg-slate-950 p-3 rounded-xl border border-slate-850/60 self-start md:self-auto font-mono">
            <div className="text-center px-1">
              <p className="text-[9px] text-slate-500 uppercase font-bold tracking-wider">Compras</p>
              <p className="text-sm font-extrabold text-blue-400">{clientSales.length}</p>
            </div>
            <div className="h-6 w-px bg-slate-800" />
            <div className="text-center px-1">
              <p className="text-[9px] text-slate-500 uppercase font-bold tracking-wider">Investidos</p>
              <p className="text-sm font-extrabold text-pink-400">{formattingBRL(totalPurchasesAmount)}</p>
            </div>
          </div>
        </div>

        {/* Dynamic Navigation Tabs inside VIP Dashboard */}
        <div className="flex bg-slate-950 border border-slate-850 p-1.5 rounded-xl gap-1">
          <button
            id="tab-vip"
            onClick={() => setActiveTab('vip')}
            className={`flex-1 py-2.5 rounded-lg flex items-center justify-center gap-1.5 text-xs font-bold transition-all cursor-pointer border-0 outline-none
              ${activeTab === 'vip' 
                ? 'bg-gradient-to-r from-pink-600 to-rose-600 text-white shadow-md' 
                : 'text-slate-400 hover:text-white hover:bg-slate-900/40'}`}
          >
            <Coins size={14} />
            VIP & Cashback
          </button>
          <button
            id="tab-compras"
            onClick={() => setActiveTab('compras')}
            className={`flex-1 py-2.5 rounded-lg flex items-center justify-center gap-1.5 text-xs font-bold transition-all cursor-pointer border-0 outline-none
              ${activeTab === 'compras' 
                ? 'bg-gradient-to-r from-pink-600 to-rose-600 text-white shadow-md' 
                : 'text-slate-400 hover:text-white hover:bg-slate-900/40'}`}
          >
            <History size={14} />
            Minhas Compras ({clientSales.length})
          </button>
          <button
            id="tab-medidas"
            onClick={() => setActiveTab('medidas')}
            className={`flex-1 py-2.5 rounded-lg flex items-center justify-center gap-1.5 text-xs font-bold transition-all cursor-pointer border-0 outline-none
              ${activeTab === 'medidas' 
                ? 'bg-gradient-to-r from-pink-600 to-rose-600 text-white shadow-md' 
                : 'text-slate-400 hover:text-white hover:bg-slate-900/40'}`}
          >
            <Ruler size={14} />
            Biometria (Meu Tamanho)
          </button>
          <button
            id="tab-regras"
            onClick={() => setActiveTab('regras')}
            className={`flex-1 py-2.5 rounded-lg flex items-center justify-center gap-1.5 text-xs font-bold transition-all cursor-pointer border-0 outline-none
              ${activeTab === 'regras' 
                ? 'bg-gradient-to-r from-pink-600 to-rose-600 text-white shadow-md' 
                : 'text-slate-400 hover:text-white hover:bg-slate-900/40'}`}
          >
            <FileText size={14} />
            Fidelidade VIP
          </button>
        </div>

        {/* Tab 1: VIP Dashboard & Cashback Card */}
        {activeTab === 'vip' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Glowing VIP Membership Card */}
            <div className="lg:col-span-7 space-y-6">
              
              <div id="glowing-vip-card" className={`relative p-6 rounded-3xl border shadow-2xl overflow-hidden transition-all duration-300 transform hover:scale-[1.01] ${vipTier.bgClass}`}>
                {/* Visual patterns on background */}
                <div className="absolute right-0 bottom-0 top-0 w-1/2 bg-[radial-gradient(circle_at_bottom_right,rgba(219,39,119,0.3),transparent_75%)] pointer-events-none" />
                <div className="absolute left-10 top-10 w-40 h-40 bg-pink-500/10 rounded-full filter blur-3xl pointer-events-none" />
                
                {/* Card header */}
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <span className={`inline-flex px-2.5 py-0.5 text-[9px] font-black tracking-widest uppercase border rounded-full ${vipTier.tagColor}`}>
                      {vipTier.name}
                    </span>
                    <h3 className="text-xl font-black font-sans uppercase tracking-tight text-white mt-1">AP VIP CLUB</h3>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center font-extrabold text-white text-base border border-white/20 select-none">
                    VIP
                  </div>
                </div>

                {/* Cashback balance main focus */}
                <div className="mt-8 space-y-1">
                  <span className="text-[10px] uppercase tracking-wider text-slate-300 font-semibold font-mono">SALDO DE CASHBACK DISPONÍVEL</span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl md:text-5xl font-black tracking-tighter font-mono text-white">
                      {formattingBRL(clientData.cashbackBalance || 0)}
                    </span>
                    <span className="text-xs bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-1.5 py-0.5 rounded-lg font-bold font-mono">
                      Liberado
                    </span>
                  </div>
                </div>

                {/* Barcode representation with client ID */}
                <div className="mt-8 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 border-t border-white/10 pt-4">
                  <div>
                    <p className="text-[9px] text-slate-400 font-medium">TITULAR DO CLUBE VIP</p>
                    <p className="text-xs font-bold text-white tracking-wide uppercase">{clientData.name}</p>
                    <p className="text-[9px] text-slate-300/80 font-mono mt-0.5">Bônus Permanente: {vipTier.cashbackRate} de volta</p>
                  </div>
                  <div className="self-stretch sm:self-auto bg-slate-950/20 backdrop-blur-sm border border-white/10 px-3 py-1.5 rounded-xl flex items-center gap-2 text-center">
                    <div id="barcode-line-art" className="flex items-center gap-[1px] h-6 bg-white/10 p-1 rounded">
                      <div className="w-[3px] h-full bg-white" />
                      <div className="w-[1px] h-full bg-white" />
                      <div className="w-[2px] h-full bg-white" />
                      <div className="w-[1px] h-full bg-white" />
                      <div className="w-[4px] h-full bg-white" />
                      <div className="w-[1px] h-full bg-white" />
                      <div className="w-[2px] h-full bg-white" />
                    </div>
                    <span className="text-[9.5px] font-mono font-bold tracking-widest text-slate-300 uppercase">{clientData.id}</span>
                  </div>
                </div>
              </div>

              {/* Progress to next level card */}
              <div className="bg-slate-900/60 border border-slate-800 p-5 rounded-2xl space-y-4">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400 font-bold uppercase tracking-wider text-[9px]">Sua Jornada de Compras</span>
                  <span className="font-mono text-slate-200 font-bold bg-slate-950 px-2 py-0.5 rounded-lg border border-slate-800">{formattingBRL(totalPurchasesAmount)} acumulados</span>
                </div>

                <div className="space-y-1.5">
                  <div className="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${vipTier.progressBarColor}`}
                      style={{ 
                        width: `${Math.min(100, Math.max(12, (totalPurchasesAmount / 1500) * 100))}%` 
                      }} 
                    />
                  </div>
                  <p className="text-[10px] text-slate-400 leading-normal flex items-center gap-1.5">
                    <Sparkles size={11} className="text-yellow-500 animate-spin" />
                    {vipTier.nextTier}
                  </p>
                </div>

                {/* Brief milestone description */}
                <div className="grid grid-cols-3 gap-2.5 pt-2 border-t border-slate-850/60 text-center font-mono">
                  <div className={`p-2 rounded-xl text-[9px] border ${totalPurchasesAmount < 600 ? 'bg-rose-950/20 border-rose-900/30 text-rose-300' : 'bg-slate-950 border-slate-850 text-slate-400'}`}>
                    <p className="font-bold">BRONZE VIP</p>
                    <p className="text-slate-550 text-[8px] mt-0.5">Até R$ 599</p>
                    <p className="font-extrabold text-[8.5px] mt-1 text-slate-300">5% Cashback</p>
                  </div>
                  <div className={`p-2 rounded-xl text-[9px] border ${totalPurchasesAmount >= 600 && totalPurchasesAmount < 1500 ? 'bg-amber-950/20 border-amber-900/30 text-amber-300 font-bold' : 'bg-slate-950 border-slate-850 text-slate-400'}`}>
                    <p className="font-bold">OURO GOLD</p>
                    <p className="text-slate-550 text-[8px] mt-0.5">R$ 600 a R$ 1499</p>
                    <p className="font-extrabold text-[8.5px] mt-1 text-slate-300">10% Cashback</p>
                  </div>
                  <div className={`p-2 rounded-xl text-[9px] border ${totalPurchasesAmount >= 1500 ? 'bg-purple-950/20 border-purple-900/30 text-purple-300 font-bold animate-pulse' : 'bg-slate-950 border-slate-850 text-slate-400'}`}>
                    <p className="font-bold">BLACK PLATINUM</p>
                    <p className="text-slate-550 text-[8px] mt-0.5">Acima de R$ 1500</p>
                    <p className="font-extrabold text-[8.5px] mt-1 text-slate-300">15% Cashback</p>
                  </div>
                </div>
              </div>

            </div>

            {/* Offline redemption QR Code and Coupon options */}
            <div className="lg:col-span-5 space-y-6">
              
              {/* Check-in QR code */}
              <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-2xl flex flex-col items-center justify-center text-center space-y-4">
                <div className="mx-auto w-12 h-12 bg-pink-100/10 rounded-full flex items-center justify-center text-pink-400">
                  <QrCode size={22} />
                </div>
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wide text-white">Resgate em Loja Física</h4>
                  <p className="text-[10px] text-slate-400 max-w-xs mt-0.5 leading-normal">Apresente este QR Code de fidelidade no caixa ao finalizar suas compras para resgatar seu saldo de cashback.</p>
                </div>
                
                {/* Simulated high quality QR code container */}
                <div className="p-3 bg-white rounded-2xl shadow-xl shadow-slate-950/30 border border-slate-800/20 relative group">
                  <div className="w-32 h-32 flex flex-col items-center justify-center p-1 relative">
                    {/* Placeholder for QR Code */}
                    <svg viewBox="0 0 100 100" className="w-full h-full text-slate-950">
                      <path fill="currentColor" d="M10,10 h20 v20 h-20 z M15,15 h10 v10 h-10 z M70,10 h20 v20 h-20 z M75,15 h10 v10 h-10 z M10,70 h20 v20 h-20 z M15,75 h10 v10 h-10 z M42,10 h16 v6 h-16 z M42,22 h6 v6 h-6 z M52,22 h10 v6 h-10 z M10,42 h6 v16 h-6 z M22,42 h10 v6 h-10 z M22,54 h6 v10 h-6 z M42,42 h10 v10 h-10 z M58,42 h6 v6 h-6 z M70,42 h20 v6 h-20 z M70,54 h6 v16 h-6 z M82,54 h8 v10 h-8 z M42,58 h16 v6 h-16 z M42,70 h6 v20 h-6 z M54,70 h20 v6 h-20 z M82,70 h8 v6 h-8 z M54,82 h10 v8 h-10 z M70,82 h20 v8 h-20 z" />
                    </svg>
                    {/* Small inner logo */}
                    <div className="absolute inset-x-0 inset-y-0 m-auto w-7 h-7 bg-white rounded-lg flex items-center justify-center shadow">
                      <span className="text-[8px] font-black text-pink-650 tracking-tighter">AP</span>
                    </div>
                  </div>
                  <div className="text-[8px] font-bold text-slate-500 font-mono mt-1 text-center select-all">
                    CODE: {clientData.id}
                  </div>
                </div>
              </div>

              {/* Referral & Recommendation bonus */}
              <div className="bg-slate-900 border border-pink-900/30 p-5 rounded-2xl relative overflow-hidden">
                <div className="absolute right-0 top-0 bg-pink-950/20 border-l border-b border-pink-850/40 text-pink-400 font-mono text-[8px] font-bold tracking-widest px-2.5 py-1 px-1.5 uppercase rounded-bl-xl flex items-center gap-1">
                  <Gift size={9} /> Bônus Ativo
                </div>
                
                <h4 className="text-xs font-bold text-slate-100 flex items-center gap-1.5 uppercase tracking-wide">
                  <Percent size={14} className="text-pink-500" /> Indique e Ganhe 10%
                </h4>
                <p className="text-[10px] text-slate-400 mt-1 leading-normal">
                  Seus amigos ganham <strong>10% OFF</strong> no primeiro pedido online com seu cupom, e você recebe <strong>R$ 15,00 em saldo de cashback</strong> para compras após o faturamento bem-sucedido deles!
                </p>

                <div className="mt-4 flex items-center bg-slate-950 p-2.5 rounded-xl border border-slate-850 px-2 select-all">
                  <div className="flex-1 truncate">
                    <span className="text-[8.5px] uppercase font-bold text-slate-500 block leading-none font-mono">SEU CUPOM DE INDICAÇÃO</span>
                    <span className="text-xs font-bold text-pink-400 font-mono mt-1 block">{referralCode}</span>
                  </div>
                  <span className="bg-pink-950/40 text-pink-300 font-bold px-2 py-1 rounded-lg text-[9px] border border-pink-900/30 uppercase tracking-wider font-mono">
                    Compartilhar
                  </span>
                </div>
              </div>

            </div>

          </div>
        )}

        {/* Tab 2: Purchase History */}
        {activeTab === 'compras' && (
          <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-5 md:p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-850 pb-3">
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Histórico de Compras Registradas</h3>
                <p className="text-[10px] text-slate-400 mt-0.5">Visualize todos os seus pedidos presenciais e online integrados na nossa central.</p>
              </div>
              <span className="bg-blue-950 text-blue-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-blue-900/35 font-mono">
                {clientSales.length} Pedidos
              </span>
            </div>

            {clientSales.length === 0 ? (
              <div className="text-center py-12 space-y-3.5">
                <div className="w-12 h-12 bg-slate-950 border border-slate-850 rounded-full flex items-center justify-center mx-auto text-slate-500">
                  <ShoppingBag size={18} />
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-bold text-slate-300">Nenhuma compra faturada encontrada</p>
                  <p className="text-[10px] text-slate-500 max-w-sm mx-auto">Logo que sua primeira compra for processada no caixa físico ou catálogo, ela será sincronizada e listada aqui em tempo real.</p>
                </div>
              </div>
            ) : (
              <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                {clientSales.map((sale) => {
                  const saleIdShort = sale.id.slice(-6).toUpperCase();
                  const dateFormatted = new Date(sale.createdAt).toLocaleDateString('pt-BR', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric'
                  });

                  return (
                    <div 
                      key={sale.id}
                      className="bg-slate-950 border border-slate-850 rounded-2xl p-4 hover:border-slate-800 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
                    >
                      {/* Left Block: ID & Products */}
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold bg-slate-900 text-slate-300 border border-slate-800 px-2 py-0.5 rounded-md font-mono">
                            ID: #{saleIdShort}
                          </span>
                          <span className="text-[10.5px] text-slate-400 font-mono">{dateFormatted}</span>
                          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md uppercase font-mono 
                            ${sale.status === 'Concluída' 
                              ? 'bg-green-950/55 text-green-400 border border-green-900/30' 
                              : sale.status === 'Pendente'
                              ? 'bg-amber-950/35 text-amber-300 border border-amber-900/30'
                              : 'bg-rose-950/35 text-rose-400 border border-rose-900/30'}`}
                          >
                            {sale.status}
                          </span>
                        </div>

                        {/* List items representation */}
                        <div className="space-y-1 pl-1">
                          {sale.items?.map((item, idx) => (
                            <p key={idx} className="text-xs text-slate-300 leading-normal font-sans">
                              🌸 <span className="font-bold">{item.name}</span> <span className="text-[10px] text-slate-405 font-mono">({formattingBRL(item.price)} × {item.quantity})</span>
                            </p>
                          ))}
                        </div>
                      </div>

                      {/* Right Block: Total value & commissions info */}
                      <div className="md:text-right border-t md:border-t-0 border-slate-850 pt-2.5 md:pt-0 flex md:flex-col justify-between items-center md:items-end gap-1.5 font-mono">
                        <div>
                          <p className="text-[8px] text-slate-500 uppercase tracking-widest leading-none font-bold">TOTAL DO PEDIDO</p>
                          <p className="text-sm font-extrabold text-white mt-1">{formattingBRL(sale.total)}</p>
                        </div>
                        {sale.payments && sale.payments.length > 0 && (
                          <div className="flex items-center gap-1.5 mt-0.5">
                            {sale.payments.map((p, pIdx) => (
                              <span key={pIdx} className="bg-slate-900 text-[8.5px] text-slate-400 border border-slate-800 px-1.5 py-0.5 rounded">
                                {p.method}
                              </span>
                            ))}
                          </div>
                        )}
                        {sale.salesperson && (
                          <p className="text-[9px] text-slate-500 font-sans mt-1">Vendido por: <strong className="text-pink-400">{sale.salesperson}</strong></p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Biometric measurements self-service */}
        {activeTab === 'medidas' && (
          <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-5 md:p-6">
            <div className="border-b border-slate-850 pb-3 flex justify-between items-center">
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Perfil Biométrico de Medidas</h3>
                <p className="text-[10px] text-slate-400 mt-0.5">Edite e mantenha suas medidas atualizadas para receber as melhores recomendações de tamanhos da nossa equipe.</p>
              </div>
              <span className="bg-rose-950 text-rose-300 border border-rose-900/35 px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono">
                Fit Perfeito
              </span>
            </div>

            <form onSubmit={handleSaveMeasurements} className="mt-6 space-y-6">
              
              {/* Informative advice banner */}
              <div className="p-3 bg-pink-950/20 border border-pink-905/30 rounded-2xl flex items-start gap-2.5">
                <Ruler size={16} className="text-pink-400 shrink-0 mt-0.5 animate-bounce" />
                <p className="text-[10.5px] text-pink-300 leading-normal">
                  <strong>Por que preencher suas medidas?</strong> Nossa consultoria usa suas dimensões (busto, cintura, quadril) para comparar com as tabelas de elasticidade de leggings, tops e conjuntos esportivos, garantindo o caimento sublime sem apertar ou marcar!
                </p>
              </div>

              {/* Grid values */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
                
                {/* Busto */}
                <div className="space-y-1.5 text-left">
                  <label className="text-[9.5px] text-slate-400 uppercase font-black tracking-wider block">Busto (cm)</label>
                  <div className="relative">
                    <input
                      type="number"
                      value={busto}
                      onChange={(e) => setBusto(e.target.value)}
                      placeholder="Ex: 92"
                      className="w-full bg-slate-950 border border-slate-850 rounded-xl p-3 text-white font-medium focus:outline-none focus:border-pink-500 transition-all font-mono"
                    />
                    <span className="absolute right-3 top-3 text-[9px] font-bold text-slate-500 font-mono">cm</span>
                  </div>
                </div>

                {/* Cintura */}
                <div className="space-y-1.5 text-left">
                  <label className="text-[9.5px] text-slate-400 uppercase font-black tracking-wider block">Cintura (cm)</label>
                  <div className="relative">
                    <input
                      type="number"
                      value={cintura}
                      onChange={(e) => setCintura(e.target.value)}
                      placeholder="Ex: 68"
                      className="w-full bg-slate-950 border border-slate-850 rounded-xl p-3 text-white font-medium focus:outline-none focus:border-pink-500 transition-all font-mono"
                    />
                    <span className="absolute right-3 top-3 text-[9px] font-bold text-slate-500 font-mono">cm</span>
                  </div>
                </div>

                {/* Quadril */}
                <div className="space-y-1.5 text-left">
                  <label className="text-[9.5px] text-slate-400 uppercase font-black tracking-wider block">Quadril (cm)</label>
                  <div className="relative">
                    <input
                      type="number"
                      value={quadril}
                      onChange={(e) => setQuadril(e.target.value)}
                      placeholder="Ex: 98"
                      className="w-full bg-slate-950 border border-slate-850 rounded-xl p-3 text-white font-medium focus:outline-none focus:border-pink-500 transition-all font-mono"
                    />
                    <span className="absolute right-3 top-3 text-[9px] font-bold text-slate-500 font-mono">cm</span>
                  </div>
                </div>

                {/* Coxa */}
                <div className="space-y-1.5 text-left">
                  <label className="text-[9.5px] text-slate-400 uppercase font-black tracking-wider block">Coxa (cm)</label>
                  <div className="relative">
                    <input
                      type="number"
                      value={coxa}
                      onChange={(e) => setCoxa(e.target.value)}
                      placeholder="Ex: 58"
                      className="w-full bg-slate-950 border border-slate-850 rounded-xl p-3 text-white font-medium focus:outline-none focus:border-pink-500 transition-all font-mono"
                    />
                    <span className="absolute right-3 top-3 text-[9px] font-bold text-slate-500 font-mono">cm</span>
                  </div>
                </div>

                {/* Altura */}
                <div className="space-y-1.5 text-left">
                  <label className="text-[9.5px] text-slate-400 uppercase font-black tracking-wider block">Altura (cm)</label>
                  <div className="relative">
                    <input
                      type="number"
                      value={altura}
                      onChange={(e) => setAltura(e.target.value)}
                      placeholder="Ex: 165"
                      className="w-full bg-slate-950 border border-slate-850 rounded-xl p-3 text-white font-medium focus:outline-none focus:border-pink-500 transition-all font-mono"
                    />
                    <span className="absolute right-3 top-3 text-[9px] font-bold text-slate-500 font-mono">cm</span>
                  </div>
                </div>

                {/* Peso */}
                <div className="space-y-1.5 text-left">
                  <label className="text-[9.5px] text-slate-400 uppercase font-black tracking-wider block">Peso (kg)</label>
                  <div className="relative">
                    <input
                      type="number"
                      value={peso}
                      onChange={(e) => setPeso(e.target.value)}
                      placeholder="Ex: 62"
                      className="w-full bg-slate-950 border border-slate-850 rounded-xl p-3 text-white font-medium focus:outline-none focus:border-pink-500 transition-all font-mono"
                    />
                    <span className="absolute right-3 top-3 text-[9px] font-bold text-slate-500 font-mono">kg</span>
                  </div>
                </div>

              </div>

              {/* Confirm / Save action */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-t border-slate-850 pt-5 gap-3">
                <p className="text-[9px] text-slate-500 font-mono leading-normal">
                  Última sincronização com banco de dados de CRM: {clientData.createdAt ? new Date(clientData.createdAt).toLocaleDateString('pt-BR') : 'Hoje'}
                </p>

                <div className="flex items-center gap-3">
                  {saveSuccess && (
                    <span className="text-[11px] font-bold text-green-400 flex items-center gap-1">
                      <Check size={14} /> Medidas salvas com sucesso no CRM!
                    </span>
                  )}
                  <button
                    id="submit-measurements-btn"
                    type="submit"
                    disabled={savingMeasurements}
                    className="px-6 py-3 cursor-pointer bg-pink-600 hover:bg-pink-700 disabled:opacity-50 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md shadow-pink-600/10 flex items-center gap-1.5 border-0"
                  >
                    {savingMeasurements ? (
                      <>
                        <RefreshCw size={13} className="animate-spin" />
                        Salvando...
                      </>
                    ) : (
                      <>
                        <Save size={13} />
                        Slavar Minhas Medidas
                      </>
                    )}
                  </button>
                </div>
              </div>

            </form>
          </div>
        )}

        {/* Tab 4: Rules / Regras */}
        {activeTab === 'regras' && (
          <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-5 md:p-6 space-y-6">
            <div className="border-b border-slate-850 pb-3">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Regulamento do Clube de Fidelidade VIP</h3>
              <p className="text-[10px] text-slate-400 mt-0.5">Entenda as diretrizes fundamentais de resgates, acúmulos, vigências de créditos.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs font-sans leading-relaxed text-slate-300">
              <div className="space-y-4">
                <h4 className="font-extrabold text-white flex items-center gap-1.5 uppercase text-[11px] tracking-wider">
                  <Coins size={14} className="text-pink-500" /> Acúmulo de Bônus (Cashback)
                </h4>
                <ul className="space-y-2.5 list-disc pl-4 text-slate-400">
                  <li>O bônus de cashback é gerado automaticamente sobre o valor real pago em faturamentos faturados pela loja (físicos ou catálogo).</li>
                  <li>O percentual de cashback varia conforme sua categoria de fidelidade do mês corrente: <strong>Bronze Starter (5% de volta)</strong>, <strong>Ouro Gold (10% de volta)</strong>, <strong>Black Platinum (15% de volta)</strong>.</li>
                  <li>Não acumulam créditos: taxas de entrega de motoboys e produtos promocionais em ofertas líquidas específicas.</li>
                </ul>
              </div>

              <div className="space-y-4">
                <h4 className="font-extrabold text-white flex items-center gap-1.5 uppercase text-[11px] tracking-wider">
                  <History size={14} className="text-pink-500" /> Resgate e Validade
                </h4>
                <ul className="space-y-2.5 list-disc pl-4 text-slate-400">
                  <li>Seu saldo de cashback acumulado é válido pelo prazo de **180 dias corridos** após a data da compra faturada que originou o bônus.</li>
                  <li>O resgate de bônus pode ser utilizado em pagamentos de até <strong>50% do valor total</strong> do seu novo carrinho de compras.</li>
                  <li>O desconto de cashback só pode ser validado mediante confirmação do documento (CPF) cadastrado do titular da conta de fidelidade.</li>
                </ul>
              </div>
            </div>

            <div className="p-4 bg-slate-950 border border-slate-850 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="space-y-1.5 text-center sm:text-left">
                <h4 className="text-xs font-bold text-white flex items-center justify-center sm:justify-start gap-1.5 uppercase">
                  <Phone size={13} className="text-pink-500" /> Atendimento de Suporte VIP
                </h4>
                <p className="text-[10px] text-slate-405 leading-relaxed max-w-lg">Ficou com alguma dúvida sobre seu saldo, notas de faturamento ou deseja agendar um provador condicional especializado? Fale conosco no chat direto.</p>
              </div>
              <div className="flex gap-2 font-mono">
                <span className="bg-slate-900 border border-slate-800 text-[10px] font-bold text-slate-300 px-3 py-1.5 rounded-xl flex items-center gap-1 select-all">
                  <Phone size={12} /> (11) 98765-4321
                </span>
              </div>
            </div>
          </div>
        )}

      </main>

      {/* Mini Brand Footer */}
      <footer id="customer-vip-footer" className="bg-slate-950 border-t border-slate-900/60 py-6 text-center text-slate-500 text-[10px] font-mono select-none space-y-1">
        <p>AP VIP LOYALTY ENGINE • SEGURANÇA SSL CRIPTOGRAFADO</p>
        <p className="text-slate-650">© 2026 AP MODA FITNESS. TODOS OS DIREITOS RESERVADOS.</p>
      </footer>
    </div>
  );
}
