/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { 
  ShoppingBag, 
  Truck, 
  RefreshCcw, 
  Bookmark, 
  MessageCircle, 
  Plus, 
  Check, 
  Clock, 
  User, 
  MapPin, 
  DollarSign, 
  Calendar,
  AlertCircle,
  TrendingUp,
  FileText
} from 'lucide-react';
import { Product, Sale, Client } from '../types';

interface OrdersLogisticsProps {
  products: Product[];
  clients: Client[];
  sales: Sale[];
  onAddSale: (newSale: Sale) => void;
  onlineOrders: any[];
  setOnlineOrders: React.Dispatch<React.SetStateAction<any[]>>;
  onUpdateOnlineOrderStatus: (orderId: string, status: any) => void;
  activeSubTab?: 'pedidos' | 'trocas_crediario' | 'logistica';
  setActiveSubTab?: (subTab: 'pedidos' | 'trocas_crediario' | 'logistica') => void;
}

interface OnlineOrder {
  id: string;
  clientName: string;
  phone: string;
  items: { productName: string; quantity: number; price: number }[];
  total: number;
  status: 'Pendente' | 'Separando' | 'Pronto' | 'Saiu para Entrega' | 'Entregue';
  createdAt: string;
  address: string;
  deliveryFee: number;
  motoboy?: string;
  notes?: string;
}

interface Reserva {
  id: string;
  clientName: string;
  productName: string;
  quantity: number;
  total: number;
  validUntil: string;
  status: 'Ativa' | 'Retirada' | 'Expirada';
}

interface CrediarioItem {
  id: string;
  clientName: string;
  totalLimit: number;
  usedAmount: number;
  lastPaymentDate?: string;
  status: 'Regular' | 'Atrasado';
}

interface TrocaItem {
  id: string;
  clientName: string;
  productReturned: string;
  productTaken: string;
  differenceAmount: number; // Positive if client paid more, negative if store owes/credit given
  date: string;
  reason: string;
}

export default function OrdersLogistics({ 
  products, 
  clients, 
  sales, 
  onAddSale, 
  onlineOrders, 
  setOnlineOrders, 
  onUpdateOnlineOrderStatus,
  activeSubTab: propActiveSubTab,
  setActiveSubTab: propSetActiveSubTab
}: OrdersLogisticsProps) {
  const [internalActiveSubTab, setInternalActiveSubTab] = useState<'pedidos' | 'trocas_crediario' | 'logistica'>('pedidos');
  const activeSubTab = propActiveSubTab || internalActiveSubTab;
  const setActiveSubTab = propSetActiveSubTab || setInternalActiveSubTab;

  const [reservas, setReservas] = useState<Reserva[]>([
    {
      id: 'res-101',
      clientName: 'Carla Oliveira',
      productName: 'Macacão Fitness Empina Bumbum Wave - M',
      quantity: 1,
      total: 229.90,
      validUntil: '2026-06-18',
      status: 'Ativa'
    },
    {
      id: 'res-102',
      clientName: 'Julia Santos',
      productName: 'Conjunto Seamless Sculpt - P',
      quantity: 1,
      total: 289.90,
      validUntil: '2026-06-15',
      status: 'Ativa'
    }
  ]);

  const [crediario, setCrediario] = useState<CrediarioItem[]>([
    { id: 'cred-1', clientName: 'Ana Costa', totalLimit: 1500.00, usedAmount: 430.00, lastPaymentDate: '2026-06-01', status: 'Regular' },
    { id: 'cred-2', clientName: 'Maria Silva', totalLimit: 2000.00, usedAmount: 840.00, lastPaymentDate: '2026-05-15', status: 'Regular' },
    { id: 'cred-3', clientName: 'Gabriela Souza', totalLimit: 1000.00, usedAmount: 580.00, lastPaymentDate: '2026-04-10', status: 'Atrasado' }
  ]);

  const [trocas, setTrocas] = useState<TrocaItem[]>([
    { id: 'trc-1', clientName: 'Maria Silva', productReturned: 'Regata Cavada Premium (M)', productTaken: 'Legging All-Black (M)', differenceAmount: 100.00, date: '2026-06-10T11:00:00Z', reason: 'Ficou apertado nas costas' }
  ]);

  // Delivery riders
  const motoboys = ['Bruno Ramos (Moto 1)', 'Lucas Correia (Moto 2)', 'Thales Silva (Bike/Região Central)', 'Cláudio Santos (Parceiro Envio Rápido)'];

  // Form States for Reserva creation
  const [reservaClient, setReservaClient] = useState('');
  const [reservaProd, setReservaProd] = useState('');
  const [reservaQty, setReservaQty] = useState(1);
  const [reservaDays, setReservaDays] = useState(5);

  // Form States for Troca creation
  const [trocaClient, setTrocaClient] = useState('');
  const [trocaReturned, setTrocaReturned] = useState('');
  const [trocaTaken, setTrocaTaken] = useState('');
  const [trocaDiff, setTrocaDiff] = useState(0);
  const [trocaReason, setTrocaReason] = useState('Ajuste de tamanho');

  // Form States for Crediario Payment/Adjustment
  const [credClientSelected, setCredClientSelected] = useState('');
  const [credPayVal, setCredPayVal] = useState(100);

  // Stats summaries
  const totalReservasAtivas = useMemo(() => reservas.filter(r => r.status === 'Ativa').length, [reservas]);
  const totalCrediarioDevido = useMemo(() => crediario.reduce((sum, c) => sum + c.usedAmount, 0), [crediario]);
  const pendingShipmentsCount = useMemo(() => onlineOrders.filter(o => o.status !== 'Entregue').length, [onlineOrders]);

  // Form states for manual delivery order registration (E-commerce / WhatsApp)
  const [newOrderClient, setNewOrderClient] = useState('');
  const [newOrderPhone, setNewOrderPhone] = useState('');
  const [newOrderAddress, setNewOrderAddress] = useState('');
  const [newOrderProdId, setNewOrderProdId] = useState('');
  const [newOrderQty, setNewOrderQty] = useState(1);
  const [newOrderFee, setNewOrderFee] = useState(12);
  const [newOrderRider, setNewOrderRider] = useState('');
  const [newOrderNotes, setNewOrderNotes] = useState('');

  // Actions
  const handleUpdateOrderStatus = (orderId: string, newStatus: OnlineOrder['status']) => {
    onUpdateOnlineOrderStatus(orderId, newStatus);
  };

  const handleCreateOnlineOrderSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOrderClient || !newOrderAddress || !newOrderProdId) {
      alert('Favor preencher o Nome do Cliente, Endereço de Entrega e o Produto.');
      return;
    }

    const matchedProd = products.find(p => p.id === newOrderProdId);
    if (!matchedProd) return;

    const price = matchedProd.price;
    const total = price * newOrderQty;

    const newOrder: OnlineOrder = {
      id: `ped-web-${(onlineOrders.length + 1).toString().padStart(2, '0')}`,
      clientName: newOrderClient,
      phone: newOrderPhone || '(11) 99999-9999',
      items: [{ productName: matchedProd.name, quantity: newOrderQty, price }],
      total,
      status: 'Pendente',
      createdAt: new Date().toISOString(),
      address: newOrderAddress,
      deliveryFee: Number(newOrderFee),
      motoboy: newOrderRider || undefined,
      notes: newOrderNotes || undefined
    };

    setOnlineOrders(prev => [newOrder, ...prev]);

    // Reset Form
    setNewOrderClient('');
    setNewOrderPhone('');
    setNewOrderAddress('');
    setNewOrderProdId('');
    setNewOrderQty(1);
    setNewOrderFee(12);
    setNewOrderRider('');
    setNewOrderNotes('');

    alert(`Pedido registrado com sucesso! ID Gerado: ${newOrder.id.toUpperCase()}`);
  };

  const handleAssignMotoboy = (orderId: string, rider: string) => {
    setOnlineOrders(prev => prev.map(o => {
      if (o.id === orderId) {
        return { ...o, motoboy: rider, status: o.status === 'Pendente' ? 'Separando' : o.status };
      }
      return o;
    }));
  };

  const handleSendWhatsAppOrder = (order: OnlineOrder) => {
    const itemsText = order.items.map(it => `• ${it.quantity}x ${it.productName}`).join('\n');
    const msg = `Olá, ${order.clientName}! 🌸\n\nSomos do suporte da *AP Moda Fitness*. Seu pedido *${order.id.toUpperCase()}* está no status: *${order.status}*!\n\n🛍️ *Seus Itens:*\n${itemsText}\n\n📍 *Endereço de Entrega:*\n${order.address}\n\n💵 *Total:* ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(order.total + order.deliveryFee)} (já incluindo entrega).\n\n${order.status === 'Saiu para Entrega' ? `🏍️ Entregador encarregado: *${order.motoboy || 'Próprio'}*. Já estamos a caminho!` : 'Qualquer dúvida estamos à disposição!'}`;
    
    // Safely fallback since inside sandboxed frame
    try {
      const url = `https://api.whatsapp.com/send?phone=${order.phone.replace(/\D/g, '')}&text=${encodeURIComponent(msg)}`;
      window.open(url, '_blank');
    } catch {
      alert(`Mensagem gerada para WhatsApp:\n\n${msg}`);
    }
  };

  const handleCreateReservaSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reservaClient || !reservaProd) {
      alert('Favor preencher o Cliente e selecionar o Produto.');
      return;
    }

    const matchedProd = products.find(p => p.id === reservaProd);
    const prodName = matchedProd ? matchedProd.name : 'Produto Selecionado';
    const prodPrice = matchedProd ? matchedProd.price : 100;

    const limitDate = new Date();
    limitDate.setDate(limitDate.getDate() + Number(reservaDays));

    const newReserva: Reserva = {
      id: `res-${Date.now().toString().slice(-4)}`,
      clientName: reservaClient,
      productName: prodName,
      quantity: reservaQty,
      total: prodPrice * reservaQty,
      validUntil: limitDate.toISOString().split('T')[0],
      status: 'Ativa'
    };

    setReservas(prev => [newReserva, ...prev]);
    setReservaClient('');
    setReservaProd('');
    setReservaQty(1);
    alert('Reserva efetuada com sucesso no sistema! O estoque deste item fica pré-reservado até a data selecionada.');
  };

  const handleCreateTrocaSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!trocaClient || !trocaReturned || !trocaTaken) {
      alert('Favor preencher todos os campos da troca.');
      return;
    }

    const newTroca: TrocaItem = {
      id: `trc-${Date.now().toString().slice(-4)}`,
      clientName: trocaClient,
      productReturned: trocaReturned,
      productTaken: trocaTaken,
      differenceAmount: Number(trocaDiff),
      date: new Date().toISOString(),
      reason: trocaReason
    };

    setTrocas(prev => [newTroca, ...prev]);

    // If there is difference to receive, we can optionally register a transaction
    if (Number(trocaDiff) > 0) {
      alert(`Troca registrada! Cliente pagou diferença de R$ ${Number(trocaDiff).toFixed(2)}.`);
    } else if (Number(trocaDiff) < 0) {
      alert(`Troca registrada! Foi gerado um vale-crédito no valor de R$ ${Math.abs(Number(trocaDiff)).toFixed(2)} para a cliente.`);
    } else {
      alert('Troca registrada com sucesso (Valores casados, sem diferença financeira)!');
    }

    setTrocaClient('');
    setTrocaReturned('');
    setTrocaTaken('');
    setTrocaDiff(0);
  };

  const handlePayCrediario = (e: React.FormEvent) => {
    e.preventDefault();
    const credItem = crediario.find(c => c.id === credClientSelected);
    if (!credItem) return;

    const val = Number(credPayVal);
    if (val <= 0) return;

    setCrediario(prev => prev.map(c => {
      if (c.id === credClientSelected) {
        return {
          ...c,
          usedAmount: Math.max(0, c.usedAmount - val),
          lastPaymentDate: new Date().toISOString().split('T')[0]
        };
      }
      return c;
    }));

    alert(`Baixa no crediário efetuada! Cliente realizou pagamento de R$ ${val.toFixed(2)}.`);
    setCredClientSelected('');
    setCredPayVal(100);
  };

  return (
    <div className="space-y-6">
      {/* Page Title & KPI Mini row */}
      <div className="flex flex-col lg:flex-row justify-between lg:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold font-sans text-slate-800 tracking-tight">Comercial, Pedidos & Logística</h2>
          <p className="text-slate-400 text-sm">Gerencie faturamento online, controle motoboys, registre trocas das clientes e reservas de estoque</p>
        </div>

        {/* Operational pills */}
        <div className="flex gap-2">
          <div className="bg-white border border-slate-100 rounded-xl px-4 py-2 flex items-center gap-2.5 shadow-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <div className="text-left leading-none">
              <span className="text-[9px] font-bold text-slate-400 font-sans uppercase">Entregas Ativas</span>
              <p className="text-sm font-bold text-slate-800 tracking-tight mt-0.5">{pendingShipmentsCount}</p>
            </div>
          </div>
          <div className="bg-white border border-slate-100 rounded-xl px-4 py-2 flex items-center gap-2.5 shadow-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-pink-500" />
            <div className="text-left leading-none">
              <span className="text-[9px] font-bold text-slate-400 font-sans uppercase">Em Crediário</span>
              <p className="text-sm font-bold text-slate-800 tracking-tight mt-0.5">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalCrediarioDevido)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Primary Sub-menus */}
      <div className="flex border-b border-slate-100">
        <button
          type="button"
          onClick={() => setActiveSubTab('pedidos')}
          className={`px-4 py-2.5 font-sans text-xs font-bold transition-all border-b-2 flex items-center gap-2 cursor-pointer
            ${activeSubTab === 'pedidos' 
              ? 'border-pink-600 text-pink-600' 
              : 'border-transparent text-slate-450 hover:text-slate-700'}`}
        >
          <ShoppingBag size={14} />
          <span>Pedidos Online & Reservas</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveSubTab('trocas_crediario')}
          className={`px-4 py-2.5 font-sans text-xs font-bold transition-all border-b-2 flex items-center gap-2 cursor-pointer
            ${activeSubTab === 'trocas_crediario' 
              ? 'border-pink-600 text-pink-600' 
              : 'border-transparent text-slate-450 hover:text-slate-700'}`}
        >
          <RefreshCcw size={14} />
          <span>Trocas, Devoluções & Crediário</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveSubTab('logistica')}
          className={`px-4 py-2.5 font-sans text-xs font-bold transition-all border-b-2 flex items-center gap-2 cursor-pointer
            ${activeSubTab === 'logistica' 
              ? 'border-pink-600 text-pink-600' 
              : 'border-transparent text-slate-450 hover:text-slate-700'}`}
        >
          <Truck size={14} />
          <span>Acompanhamento & Motoboys</span>
        </button>
      </div>

      {/* Tab 1: Pedidos Online & Reservas */}
      {activeSubTab === 'pedidos' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Main List of Orders */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white border border-slate-100 rounded-2xl shadow-xs overflow-hidden">
              <div className="p-4 border-b border-slate-50 flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-800">Fila de Separação de Pedidos da Loja (E-commerce / Whats)</h3>
                <span className="text-[10px] bg-blue-50 text-blue-600 font-bold px-2 py-0.5 rounded-full">Sincronizado</span>
              </div>

              <div className="divide-y divide-slate-100">
                {onlineOrders.map(order => (
                  <div key={order.id} className="p-4 hover:bg-slate-50/50 transition-colors">
                    <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold font-mono text-slate-800 bg-slate-100 px-2 py-0.5 rounded uppercase">
                          {order.id}
                        </span>
                        <div className="text-[10px] text-slate-400 font-sans flex items-center gap-1">
                          <Clock size={11} />
                          <span>{new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                      </div>

                      {/* Status selectors */}
                      <div className="flex items-center gap-1.5">
                        <select
                          className="bg-slate-50 border border-slate-200 text-[10px] font-bold font-sans rounded px-2 py-1 text-slate-700 outline-hidden cursor-pointer"
                          value={order.status}
                          onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value as OnlineOrder['status'])}
                        >
                          <option value="Pendente">Aguardando Separação (Pendente)</option>
                          <option value="Separando">Em Separação</option>
                          <option value="Pronto">Pronto para Enviar</option>
                          <option value="Saiu para Entrega">Saiu para Entrega</option>
                          <option value="Entregue">Pedido Entregue</option>
                        </select>

                        <button
                          type="button"
                          onClick={() => handleSendWhatsAppOrder(order)}
                          title="Enviar atualização de status via WhatsApp"
                          className="p-1 px-2.5 bg-green-50 hover:bg-green-100 text-green-600 border border-green-200/20 rounded font-bold text-[10px] flex items-center gap-1 cursor-pointer transition-colors"
                        >
                          <MessageCircle size={12} />
                          <span className="hidden sm:inline">WhatsApp</span>
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-sans text-slate-650 mt-1">
                      <div>
                        <p className="font-semibold text-slate-800">{order.clientName}</p>
                        <p className="text-slate-400 text-[11px] flex items-center gap-1 mt-0.5">
                          <MapPin size={11} className="text-slate-400 shrink-0" />
                          <span className="truncate">{order.address}</span>
                        </p>
                        {order.notes && <p className="text-blue-600 bg-blue-50/40 text-[10px] px-1.5 py-0.5 rounded mt-1.5 border border-blue-100/50">📝 OBS: {order.notes}</p>}
                      </div>

                      <div className="md:text-right flex flex-col md:justify-between md:items-end">
                        <div className="space-y-0.5">
                          {order.items.map((item, idx) => (
                            <p key={idx} className="font-medium text-slate-700">
                              {item.quantity}x {item.productName} ({new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.price)})
                            </p>
                          ))}
                        </div>
                        <div className="mt-2 pt-1 border-t border-slate-100 md:border-none flex justify-between md:block w-full">
                          <span className="text-slate-400 text-[11px] mr-1.5">Total c/ Entrega:</span>
                          <span className="font-bold text-pink-600 font-mono text-sm">
                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(order.total + order.deliveryFee)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Rider Assign segment */}
                    <div className="mt-3 bg-slate-50/50 p-2.5 rounded-xl border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs font-sans">
                      <div className="flex items-center gap-2 text-slate-450">
                        <Truck size={13} className="text-pink-500" />
                        <span>Entregador encarregado:</span>
                        <span className="font-semibold text-slate-700">{order.motoboy || 'Nenhum designado'}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] text-slate-400">Alterar:</span>
                        <select
                          className="bg-white border border-slate-200 text-[10px] font-sans rounded px-2 py-1 text-slate-600 outline-hidden cursor-pointer"
                          value={order.motoboy || ''}
                          onChange={(e) => handleAssignMotoboy(order.id, e.target.value)}
                        >
                          <option value="">-- Escolha um Motoboy --</option>
                          {motoboys.map(r => (
                            <option key={r} value={r}>{r}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Sidebar: Reservas Panel */}
          <div className="space-y-6">
            
            {/* Create Reservation Form */}
            <div className="bg-white border border-slate-100 rounded-2xl shadow-xs p-4">
              <div className="flex items-center gap-2 mb-3 border-b border-slate-50 pb-2">
                <Bookmark size={15} className="text-pink-600" />
                <h3 className="text-xs font-bold font-sans uppercase text-slate-700 tracking-wider">Criar Reserva de Peça</h3>
              </div>
              <form onSubmit={handleCreateReservaSubmit} className="space-y-3.5 text-xs font-sans">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Nome da Cliente VIP</label>
                  <input
                    type="text"
                    required={true}
                    placeholder="Ex: Beatriz Pereira"
                    value={reservaClient}
                    onChange={(e) => setReservaClient(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-150 rounded-lg p-2 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Peça Desejada</label>
                  <select
                    required={true}
                    value={reservaProd}
                    onChange={(e) => setReservaProd(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-150 rounded-lg p-2 focus:outline-hidden"
                  >
                    <option value="">-- Escolha o Produto --</option>
                    {products.map(p => (
                      <option key={p.id} value={p.id}>{p.name} (Disponível: {p.stock})</option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">Quantidade</label>
                    <input
                      type="number"
                      min={1}
                      value={reservaQty}
                      onChange={(e) => setReservaQty(Math.max(1, Number(e.target.value)))}
                      className="w-full bg-slate-50 border border-slate-150 rounded-lg p-2 focus:outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">Prazo (Dias)</label>
                    <input
                      type="number"
                      min={1}
                      max={15}
                      value={reservaDays}
                      onChange={(e) => setReservaDays(Math.max(1, Number(e.target.value)))}
                      className="w-full bg-slate-50 border border-slate-150 rounded-lg p-2 focus:outline-hidden"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2 bg-pink-600 hover:bg-pink-700 text-white font-bold rounded-lg text-xs transition-colors cursor-pointer"
                >
                  Confirmar Reserva no Sistema
                </button>
              </form>
            </div>

            {/* Registrar Pedido de Entrega Moto Form */}
            <div className="bg-white border border-slate-100 rounded-2xl shadow-xs p-4">
              <div className="flex items-center gap-2 mb-3 border-b border-slate-50 pb-2">
                <Truck size={15} className="text-pink-600" />
                <h3 className="text-xs font-bold font-sans uppercase text-slate-700 tracking-wider">Despachar Pedido c/ Motoboy</h3>
              </div>
              <form onSubmit={handleCreateOnlineOrderSubmit} className="space-y-3 text-xs font-sans">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Nome do Cliente</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Ana Costa"
                    value={newOrderClient}
                    onChange={(e) => setNewOrderClient(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-150 rounded-lg p-2 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">WhatsApp/Telefone</label>
                  <input
                    type="text"
                    placeholder="Ex: (11) 99999-9999"
                    value={newOrderPhone}
                    onChange={(e) => setNewOrderPhone(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-150 rounded-lg p-2 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Endereço Completo de Entrega</label>
                  <input
                    type="text"
                    required
                    placeholder="Rua, Número, Bairro, Cidade - UF"
                    value={newOrderAddress}
                    onChange={(e) => setNewOrderAddress(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-150 rounded-lg p-3 focus:outline-hidden text-[11px]"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Peça Vendida</label>
                  <select
                    required
                    value={newOrderProdId}
                    onChange={(e) => setNewOrderProdId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-150 rounded-lg p-2 focus:outline-hidden"
                  >
                    <option value="">-- Escolha o Produto --</option>
                    {products.map(p => (
                      <option key={p.id} value={p.id}>{p.name} (R$ {p.price})</option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">Qtd</label>
                    <input
                      type="number"
                      min={1}
                      value={newOrderQty}
                      onChange={(e) => setNewOrderQty(Math.max(1, Number(e.target.value)))}
                      className="w-full bg-slate-50 border border-slate-150 rounded-lg p-2 focus:outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">Taxa Entrega (R$)</label>
                    <input
                      type="number"
                      min={0}
                      value={newOrderFee}
                      onChange={(e) => setNewOrderFee(Math.max(0, Number(e.target.value)))}
                      className="w-full bg-slate-50 border border-slate-150 rounded-lg p-2 focus:outline-hidden"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Designar Motoboy Inicial (Opcional)</label>
                  <select
                    value={newOrderRider}
                    onChange={(e) => setNewOrderRider(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-150 rounded-lg p-2 focus:outline-hidden"
                  >
                    <option value="">-- Deixar em Aberto --</option>
                    {motoboys.map(r => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Observações de Rota</label>
                  <input
                    type="text"
                    placeholder="Ex: Próximo ao metrô Lorena"
                    value={newOrderNotes}
                    onChange={(e) => setNewOrderNotes(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-150 rounded-lg p-2 focus:outline-hidden"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2 bg-slate-800 hover:bg-slate-900 border border-slate-800 text-white font-extrabold rounded-lg text-xs transition-colors cursor-pointer"
                >
                  Confirmar e Despachar Rota
                </button>
              </form>
            </div>

            {/* List Active reservations */}
            <div className="bg-white border border-slate-100 rounded-2xl shadow-xs p-4">
              <h3 className="text-xs font-bold font-sans uppercase text-slate-500 tracking-wider mb-2.5 font-bold">Reservas Ativas ({totalReservasAtivas})</h3>
              <div className="space-y-2.5">
                {reservas.map(res => (
                  <div key={res.id} className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs font-sans">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-bold text-slate-800">{res.clientName}</span>
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${res.status === 'Ativa' ? 'bg-amber-100 text-amber-800' : 'bg-slate-150 text-slate-500'}`}>
                        {res.status}
                      </span>
                    </div>
                    <p className="text-slate-650 font-medium">{res.quantity}x {res.productName}</p>
                    <div className="flex justify-between items-center mt-2 pt-1 border-t border-slate-150/50 text-[10px] text-slate-400">
                      <span>Expira em: <strong className="text-slate-500">{res.validUntil}</strong></span>
                      <span className="font-bold text-pink-600 font-mono">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(res.total)}</span>
                    </div>
                    <div className="flex gap-2.5 mt-2.5 pt-0.5">
                      <button
                        type="button"
                        onClick={() => {
                          setReservas(prev => prev.map(r => r.id === res.id ? {...r, status: 'Retirada'} : r));
                          alert('Reserva faturada com sucesso! Lembre-se de lançar a venda correspondente no PDV.');
                        }}
                        className="flex-1 py-1 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 transition-colors text-[9px] font-bold rounded"
                      >
                        Faturada / Retirada
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setReservas(prev => prev.filter(r => r.id !== res.id));
                          alert('Reserva excluída e estoque liberado.');
                        }}
                        className="py-1 px-2 text-rose-600 hover:bg-rose-50 rounded transition-colors text-[9px] font-semibold"
                      >
                        Excluir
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Tab 2: Trocas, Devoluções & Crediário */}
      {activeSubTab === 'trocas_crediario' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Main Trocas registration */}
          <div className="lg:col-span-8 space-y-6">
            <div className="bg-white border border-slate-100 rounded-2xl shadow-xs p-4">
              <h3 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-1.5">
                <RefreshCcw size={15} className="text-pink-600" />
                <span>Registrar Troca ou Devolução de Mercadoria</span>
              </h3>
              
              <form onSubmit={handleCreateTrocaSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-4 text-xs font-sans">
                <div className="lg:col-span-4">
                  <label className="block text-slate-450 font-semibold mb-1">Cliente Solicitante</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Maria Silva"
                    value={trocaClient}
                    onChange={(e) => setTrocaClient(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-150 rounded-lg p-2 focus:outline-hidden"
                  />
                </div>
                <div className="lg:col-span-4">
                  <label className="block text-slate-450 font-semibold mb-1">Peça Devolvida</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Legging Azul Wave (P)"
                    value={trocaReturned}
                    onChange={(e) => setTrocaReturned(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-150 rounded-lg p-2 focus:outline-hidden"
                  />
                </div>
                <div className="lg:col-span-4">
                  <label className="block text-slate-450 font-semibold mb-1">Peça Levada</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Legging Preta Sculpt (P) ou Cr-Vale"
                    value={trocaTaken}
                    onChange={(e) => setTrocaTaken(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-150 rounded-lg p-2 focus:outline-hidden"
                  />
                </div>

                <div className="lg:col-span-4">
                  <label className="block text-slate-450 font-semibold mb-1">Diferença Financeira (R$)</label>
                  <input
                    type="number"
                    value={trocaDiff}
                    onChange={(e) => setTrocaDiff(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-150 rounded-lg p-2 focus:outline-hidden"
                    placeholder="Positivo para cliente paga, Negativo para crédito"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">Insira positivo caso a cliente esteja pagando a maior, e negativo gerando reembolso/vale.</p>
                </div>
                <div className="lg:col-span-5">
                  <label className="block text-slate-450 font-semibold mb-1">Motivo / Categoria</label>
                  <input
                    type="text"
                    value={trocaReason}
                    onChange={(e) => setTrocaReason(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-150 rounded-lg p-2 focus:outline-hidden"
                  />
                </div>
                <div className="lg:col-span-3 flex items-end">
                  <button
                    type="submit"
                    className="w-full py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-lg transition-colors cursor-pointer text-center"
                  >
                    Registrar Troca
                  </button>
                </div>
              </form>
            </div>

            {/* List of past Trocas */}
            <div className="bg-white border border-slate-100 rounded-2xl shadow-xs p-4">
              <h3 className="text-xs font-bold font-sans uppercase text-slate-500 tracking-wider mb-2.5">Histórico Recente de Trocas</h3>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs font-sans">
                  <thead>
                    <tr className="bg-slate-50/70 border-b border-slate-50 text-slate-400 font-bold uppercase text-[9px] tracking-wider select-none">
                      <th className="p-3">Data</th>
                      <th className="p-3">Cliente</th>
                      <th className="p-3">Item Devolvido</th>
                      <th className="p-3">Item Entregue</th>
                      <th className="p-3">Diferença</th>
                      <th className="p-3">Motivo</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 text-slate-700">
                    {trocas.map(tr => (
                      <tr key={tr.id} className="hover:bg-slate-50/40">
                        <td className="p-3 font-mono text-[10px]">{new Date(tr.date).toLocaleDateString()}</td>
                        <td className="p-3 font-bold">{tr.clientName}</td>
                        <td className="p-3 text-red-600 bg-red-50/10 font-medium">{tr.productReturned}</td>
                        <td className="p-3 text-emerald-600 bg-emerald-50/10 font-medium">{tr.productTaken}</td>
                        <td className="p-3 font-mono font-bold">
                          {tr.differenceAmount > 0 ? (
                            <span className="text-emerald-600">+{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(tr.differenceAmount)}</span>
                          ) : tr.differenceAmount < 0 ? (
                            <span className="text-amber-600">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(tr.differenceAmount)}</span>
                          ) : (
                            <span className="text-slate-400">R$ 0,00</span>
                          )}
                        </td>
                        <td className="p-3 text-slate-450 italic">{tr.reason}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Crediario sidebar box */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Pay Crediario Form */}
            <div className="bg-white border border-slate-100 rounded-2xl shadow-xs p-4">
              <div className="flex items-center gap-2 mb-3 border-b border-slate-50 pb-2">
                <DollarSign size={15} className="text-pink-600" />
                <h3 className="text-xs font-bold font-sans uppercase text-slate-700 tracking-wider">Quitar / Amortizar Crediário</h3>
              </div>
              <form onSubmit={handlePayCrediario} className="space-y-3.5 text-xs font-sans">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Selecionar Caderneta</label>
                  <select
                    required
                    value={credClientSelected}
                    onChange={(e) => setCredClientSelected(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-150 rounded-lg p-2 focus:outline-hidden"
                  >
                    <option value="">-- Selecione a Ficha --</option>
                    {crediario.map(c => (
                      <option key={c.id} value={c.id}>{c.clientName} (Saldo: R$ {c.usedAmount.toFixed(2)})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Valor do Pagamento (R$)</label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={credPayVal}
                    onChange={(e) => setCredPayVal(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-150 rounded-lg p-2 focus:outline-hidden"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2 bg-pink-600 hover:bg-pink-700 text-white font-bold rounded-lg text-xs transition-colors cursor-pointer"
                >
                  Registrar Pagamento de Carnê
                </button>
              </form>
            </div>

            {/* List Crediario entries */}
            <div className="bg-white border border-slate-100 rounded-2xl shadow-xs p-4">
              <h3 className="text-xs font-bold font-sans uppercase text-slate-500 tracking-wider mb-2.5">Faturamento em Aberto (Crediário)</h3>
              <div className="space-y-3">
                {crediario.map(cred => (
                  <div key={cred.id} className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs font-sans">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-bold text-slate-800">{cred.clientName}</span>
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${cred.status === 'Regular' ? 'bg-green-100 text-green-800' : 'bg-red-150 text-red-800 animate-pulse'}`}>
                        {cred.status}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-slate-500 mt-1.5">
                      <span>Limite Usado:</span>
                      <span className="font-bold text-slate-800">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(cred.usedAmount)} / {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(cred.totalLimit)}</span>
                    </div>
                    <div className="w-full bg-slate-200 h-1.5 rounded-full mt-1.5 overflow-hidden">
                      <div className="bg-pink-600 h-1.5 rounded-full" style={{ width: `${Math.min(100, (cred.usedAmount / cred.totalLimit) * 100)}%` }} />
                    </div>
                    {cred.lastPaymentDate && (
                      <p className="text-[10px] text-slate-400 mt-2 font-sans">Último pagamento em: <strong className="text-slate-500">{cred.lastPaymentDate}</strong></p>
                    )}
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Tab 3: Logística & Motoboys */}
      {activeSubTab === 'logistica' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Motoboy Status Dashboard */}
          <div className="lg:col-span-2 space-y-6 text-xs font-sans">
            <div className="bg-white border border-slate-100 rounded-2xl shadow-xs p-4">
              <h3 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-1.5">
                <Truck size={15} className="text-pink-600" />
                <span>Gestão Logística de Encomendas & Motoboys</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <span className="text-slate-400 font-bold block">Faturamento Envio</span>
                  <span className="text-lg font-bold text-slate-800 mt-0.5">R$ 45,00</span>
                  <p className="text-[9px] text-slate-400 mt-1">Taxas de entregas coletadas ontem/hoje</p>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <span className="text-slate-400 font-bold block">Média Tempo de Entrega</span>
                  <span className="text-lg font-bold text-slate-800 mt-0.5">32 minutos</span>
                  <p className="text-[9px] text-slate-400 mt-1">Desde a expedição até o recebimento</p>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <span className="text-slate-400 font-bold block">Modos Disponíveis</span>
                  <span className="text-lg font-bold text-slate-800 mt-0.5">Motoboy VIP, Correios</span>
                  <p className="text-[9px] text-slate-400 mt-1">Disponíveis para checkout no e-commerce</p>
                </div>
              </div>

              {/* Delivery Riders statuses */}
              <h4 className="font-bold text-slate-700 mb-2">Status dos Entregadores Parceiros</h4>
              <div className="space-y-2.5">
                {[
                  { name: 'Bruno Ramos (Moto 1)', status: 'Fazendo Entrega', region: 'Zona Sul / Copacabana', salesAssigned: 1 },
                  { name: 'Lucas Correia (Moto 2)', status: 'Disponível', region: 'Centro / Floresta', salesAssigned: 0 },
                  { name: 'Thales Silva (Bike)', status: 'Completado', region: 'Vila Madalena / Jardins', salesAssigned: 2 },
                ].map((m, idx) => (
                  <div key={idx} className="p-3 bg-white border border-slate-150 rounded-xl hover:shadow-xs transition-shadow flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-pink-50 text-pink-600 font-bold flex items-center justify-center">
                        <User size={13} />
                      </div>
                      <div>
                        <p className="font-bold text-slate-800">{m.name}</p>
                        <p className="text-slate-400 text-[10px] mt-0.5">Região preferencial: {m.region}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full inline-block
                        ${m.status === 'Disponível' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800 animate-pulse'}`}>
                        {m.status}
                      </span>
                      {m.salesAssigned > 0 && <p className="text-slate-400 text-[9px] mt-1">{m.salesAssigned} entrega(s) pendente</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Zone/neighborhood pricing list */}
          <div className="space-y-6 text-xs font-sans">
            <div className="bg-white border border-slate-100 rounded-2xl shadow-xs p-4">
              <div className="flex items-center gap-2 mb-3 border-b border-slate-50 pb-2">
                <MapPin size={15} className="text-pink-600" />
                <h3 className="text-xs font-bold font-sans uppercase text-slate-700 tracking-wider">Calculadora de Frete Local (Motoboy)</h3>
              </div>
              
              <div className="space-y-2 text-slate-650">
                <div className="flex justify-between items-center p-2 bg-slate-50 rounded">
                  <span className="font-medium">Região Central / Próximo à Loja</span>
                  <span className="font-bold text-slate-800">R$ 10,00</span>
                </div>
                <div className="flex justify-between items-center p-2 bg-slate-50 rounded">
                  <span className="font-medium">Zona Sul / Bairros Vizinhos (7-15km)</span>
                  <span className="font-bold text-slate-800">R$ 15,00</span>
                </div>
                <div className="flex justify-between items-center p-2 bg-slate-50 rounded">
                  <span className="font-medium">Zona Norte / Periferias (15-25km)</span>
                  <span className="font-bold text-slate-800">R$ 20,00</span>
                </div>
                <div className="flex justify-between items-center p-2 bg-slate-50 rounded">
                  <span className="font-medium">Região Metropolitana (Correios PAC)</span>
                  <span className="font-bold text-slate-800">R$ 25,00</span>
                </div>
              </div>

              <div className="mt-4 p-3 bg-pink-50/30 rounded-xl border border-pink-100/50 text-[11px] leading-relaxed text-pink-900/80">
                💡 <strong>Dica de Vendedor:</strong> Ofereça <strong>Frete Grátis</strong> para compras acima de <strong>R$ 399,00</strong>! Isso aumenta seu Ticket Médio e induz compras combinadas de legging + top!
              </div>
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
