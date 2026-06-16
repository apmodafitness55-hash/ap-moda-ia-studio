/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from 'react';
import { 
  Users, 
  Search, 
  Plus, 
  Mail, 
  Phone, 
  Calendar, 
  Award, 
  Star,
  Instagram,
  Compass,
  Laptop,
  Store,
  MessageCircle,
  Eye,
  TrendingUp,
  Coins,
  ArrowRight,
  Sparkles,
  ClipboardList,
  Edit,
  Trash2,
  Gift
} from 'lucide-react';
import { Client, Sale, SalesChannel } from '../types';

interface CustomersCRMProps {
  clients: Client[];
  sales: Sale[];
  onAddClient: (newClient: Client) => void;
  onUpdateClients?: (updatedList: Client[]) => void;
  currentUser?: any;
}

interface Opportunity {
  id: string;
  clientName: string;
  value: number;
  probability: number; // e.g. 80 (%)
  stage: 'Prospecção' | 'Foto Enviada' | 'Prova / Reserva' | 'Fechado';
  itemInteresse: string;
  notes?: string;
}

interface FollowUp {
  id: string;
  clientName: string;
  channel: 'WhatsApp' | 'Instagram' | 'Call' | 'E-mail';
  date: string;
  notes: string;
  completed: boolean;
}

interface Partner {
  id: string;
  name: string;
  instagram: string;
  couponCode: string;
  commissionRate: number; // percentage, e.g. 10 (%)
  salesCount: number;
  totalGenerated: number;
}

export default function CustomersCRM({ clients, sales, onAddClient, currentUser }: CustomersCRMProps) {
  const [activeSubTab, setActiveSubTab] = useState<'diretorio' | 'funil' | 'followup' | 'parceiros'>('diretorio');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedClientDetail, setSelectedClientDetail] = useState<Client | null>(null);

  // Editing state
  const [editingClient, setEditingClient] = useState<Client | null>(null);

  // Form states for adding or editing
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newCpf, setNewCpf] = useState('');
  const [newBirthDate, setNewBirthDate] = useState('');
  const [newChannel, setNewChannel] = useState<SalesChannel>('Instagram');
  const [newNps, setNewNps] = useState<number>(10);

  // Interactive CRM states
  const [opportunities, setOpportunities] = useState<Opportunity[]>([
    { id: 'op-1', clientName: 'Gabriela Souza', value: 289.90, probability: 80, stage: 'Prospecção', itemInteresse: 'Conjunto Seamless Sculpt', notes: 'Quer para o aniversário dia 20.' },
    { id: 'op-2', clientName: 'Ana Costa', value: 159.90, probability: 50, stage: 'Foto Enviada', itemInteresse: 'Legging All-Black Cós Alto', notes: 'Gostou do cós alto anatômico.' },
    { id: 'op-3', clientName: 'Beatriz Pereira', value: 450.00, probability: 90, stage: 'Prova / Reserva', itemInteresse: 'Combo Macacão Wave + Tops', notes: 'Reserva expira amanhã.' }
  ]);

  const [followups, setFollowups] = useState<FollowUp[]>([
    { id: 'fup-1', clientName: 'Maria Silva', channel: 'WhatsApp', date: '2026-06-14', notes: 'Perguntar se gostou do tamanho M do Conjunto Seamless.', completed: false },
    { id: 'fup-2', clientName: 'Carla Oliveira', channel: 'Instagram', date: '2026-06-15', notes: 'Enviar as novidades de casaco corta-vento Dry.', completed: false },
    { id: 'fup-3', clientName: 'Julia Santos', channel: 'Call', date: '2026-06-13', notes: 'Ligar para acertar retirada de reserva.', completed: true }
  ]);

  const [partners, setPartners] = useState<Partner[]>(() => {
    try {
      const saved = localStorage.getItem('ap_moda_partners');
      if (saved) return JSON.parse(saved);
    } catch(e) {}
    return [
      { id: 'part-1', name: 'Marina Fitness Coach', instagram: '@marina_fit', couponCode: 'MARINAFIT10', commissionRate: 10, salesCount: 15, totalGenerated: 4250.00, availableBalance: 425.00 },
      { id: 'part-2', name: 'Julia Rezende', instagram: '@jurezendedm', couponCode: 'JU10', commissionRate: 8, salesCount: 8, totalGenerated: 1890.00, availableBalance: 151.20 },
      { id: 'part-3', name: 'Amanda Runner', instagram: '@amandarun', couponCode: 'AMANDAPRO', commissionRate: 12, salesCount: 22, totalGenerated: 6200.00, availableBalance: 744.00 }
    ];
  });

  useEffect(() => {
    localStorage.setItem('ap_moda_partners', JSON.stringify(partners));
  }, [partners]);

  // Form states for new Opportunity
  const [opClient, setOpClient] = useState('');
  const [opVal, setOpVal] = useState(150);
  const [opProb, setOpProb] = useState(70);
  const [opItem, setOpItem] = useState('');
  const [opNotes, setOpNotes] = useState('');

  // Form states for new Follow-up
  const [fClient, setFClient] = useState('');
  const [fChannel, setFChannel] = useState<'WhatsApp' | 'Instagram' | 'Call' | 'E-mail'>('WhatsApp');
  const [fDate, setFDate] = useState('2026-06-14');
  const [fNotes, setFNotes] = useState('');

  // Form states for new Partner
  const [partName, setPartName] = useState('');
  const [partInsta, setPartInsta] = useState('');
  const [partCoupon, setPartCoupon] = useState('');
  const [partRate, setPartRate] = useState(10);

  // CRM Analytics computations
  const averageNpsScore = useMemo(() => {
    const list = clients.map(c => c.npsScore || 10);
    if (list.length === 0) return 9.8;
    return Number((list.reduce((sum, val) => sum + val, 0) / list.length).toFixed(1));
  }, [clients]);

  const totalRevenueOpportunities = useMemo(() => {
    return opportunities
      .filter(o => o.stage !== 'Fechado')
      .reduce((sum, o) => sum + o.value, 0);
  }, [opportunities]);

  const filteredClients = useMemo(() => {
    return clients.filter(c => 
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.phone.includes(searchQuery) ||
      (c.cpf && c.cpf.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [clients, searchQuery]);

  const clientPurchaseHistory = useMemo(() => {
    if (!selectedClientDetail) return [];
    return sales.filter(s => s.clientName.toLowerCase() === selectedClientDetail.name.toLowerCase());
  }, [selectedClientDetail, sales]);

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newPhone.trim()) {
      alert('Nome e Telefone da cliente são obrigatórios!');
      return;
    }

    if (editingClient) {
      // Simulate/trigger editing of localized elements
      editingClient.name = newName.trim();
      editingClient.email = newEmail.trim() || 'cliente@exemplo.com';
      editingClient.phone = newPhone.trim();
      editingClient.cpf = newCpf.trim() || undefined;
      editingClient.birthDate = newBirthDate.trim() || undefined;
      editingClient.channel = newChannel;
      editingClient.npsScore = newNps;
      alert('Dados da cliente atualizados com sucesso no CRM!');
      setEditingClient(null);
    } else {
      const newClient: Client = {
        id: `cli-${Date.now()}`,
        name: newName.trim(),
        email: newEmail.trim() || 'cliente@exemplo.com',
        phone: newPhone.trim(),
        cpf: newCpf.trim() || undefined,
        birthDate: newBirthDate.trim() || undefined,
        channel: newChannel,
        npsScore: newNps,
        totalSpent: 0,
        ordersCount: 0,
        createdAt: new Date().toISOString()
      };
      onAddClient(newClient);
      alert('Nova cliente adicionada com sucesso no diretório!');
    }

    setIsAddModalOpen(false);
    resetForm();
  };

  const handleOpenEdit = (client: Client) => {
    setEditingClient(client);
    setNewName(client.name);
    setNewEmail(client.email);
    setNewPhone(client.phone);
    setNewCpf(client.cpf || '');
    setNewBirthDate(client.birthDate || '');
    setNewChannel(client.channel);
    setNewNps(client.npsScore || 10);
    setIsAddModalOpen(true);
  };

  const resetForm = () => {
    setEditingClient(null);
    setNewName('');
    setNewEmail('');
    setNewPhone('');
    setNewCpf('');
    setNewBirthDate('');
    setNewChannel('Instagram');
    setNewNps(10);
  };

  // Funnel operations
  const moveOpportunity = (id: string, currentStage: Opportunity['stage']) => {
    const stages: Opportunity['stage'][] = ['Prospecção', 'Foto Enviada', 'Prova / Reserva', 'Fechado'];
    const nextIdx = stages.indexOf(currentStage) + 1;
    if (nextIdx >= stages.length) return;

    setOpportunities(prev => prev.map(o => {
      if (o.id === id) {
        return { ...o, stage: stages[nextIdx], probability: stages[nextIdx] === 'Fechado' ? 100 : Math.min(95, o.probability + 15) };
      }
      return o;
    }));
  };

  const handleCreateOpportunity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!opClient || !opItem) return;

    const newOp: Opportunity = {
      id: `op-${Date.now().toString().slice(-4)}`,
      clientName: opClient,
      value: Number(opVal),
      probability: Number(opProb),
      stage: 'Prospecção',
      itemInteresse: opItem,
      notes: opNotes
    };

    setOpportunities(prev => [newOp, ...prev]);
    setOpClient('');
    setOpItem('');
    setOpNotes('');
    alert('Nova Oportunidade inserida com sucesso no Funil Comercial!');
  };

  // Follow up ops
  const handleCreateFollowUp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fClient || !fNotes) return;

    const newF: FollowUp = {
      id: `fup-${Date.now()}`,
      clientName: fClient,
      channel: fChannel,
      date: fDate,
      notes: fNotes,
      completed: false
    };

    setFollowups(prev => [newF, ...prev]);
    setFClient('');
    setFNotes('');
    alert('Follow-up agendado com sucesso para a vendedora!');
  };

  // Partner ops
  const handleCreatePartner = (e: React.FormEvent) => {
    e.preventDefault();
    if (!partName || !partCoupon) return;

    const newP: Partner = {
      id: `part-${Date.now()}`,
      name: partName,
      instagram: partInsta || '@insta_parceira',
      couponCode: partCoupon.trim().toUpperCase(),
      commissionRate: Number(partRate),
      salesCount: 0,
      totalGenerated: 0
    };

    setPartners(prev => [newP, ...prev]);
    setPartName('');
    setPartInsta('');
    setPartCoupon('');
    alert('Nova influenciadora cadastrada! Suas vendas vinculadas gerarão comissão.');
  };

  const getChannelIcon = (channel: SalesChannel) => {
    switch (channel) {
      case 'Instagram':
        return <Instagram size={14} className="text-pink-500" />;
      case 'WhatsApp':
        return <MessageCircle size={14} className="text-green-500" />;
      case 'E-commerce':
        return <Laptop size={14} className="text-blue-500" />;
      case 'Loja Física':
        return <Store size={14} className="text-amber-500" />;
      default:
        return <Compass size={14} className="text-slate-500" />;
    }
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  return (
    <div className="space-y-6">
      
      {/* Title & CRM Metrics Row */}
      <div className="flex flex-col lg:flex-row justify-between lg:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold font-sans text-slate-800 tracking-tight">CRM, Funil e Parcerias</h2>
          <p className="text-slate-400 text-sm">Estruture o funil comercial da AP Moda Fitness, controle os follow-ups agendados e comissions das influenciadoras</p>
        </div>

        {/* CRM quick KPI pills */}
        <div className="flex gap-2">
          <div className="bg-white border border-slate-100 rounded-xl px-4 py-2 flex items-center gap-2.5 shadow-xs text-xs font-sans">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <div className="text-left leading-none">
              <span className="text-[9px] font-bold text-slate-400 uppercase">Prospecções Ativas</span>
              <p className="text-sm font-bold text-slate-800 tracking-tight mt-0.5">{opportunities.filter(o => o.stage !== 'Fechado').length} Leads</p>
            </div>
          </div>
          <div className="bg-white border border-slate-100 rounded-xl px-4 py-2 flex items-center gap-2.5 shadow-xs text-xs font-sans">
            <span className="w-1.5 h-1.5 rounded-full bg-pink-500" />
            <div className="text-left leading-none">
              <span className="text-[9px] font-bold text-slate-400 uppercase">Média Geral NPS</span>
              <p className="text-sm font-bold text-slate-800 tracking-tight mt-0.5">{averageNpsScore}/10 Estrela</p>
            </div>
          </div>
        </div>
      </div>

      {/* CRM Sub-navigation Tabs */}
      <div className="flex border-b border-slate-100">
        <button
          type="button"
          onClick={() => setActiveSubTab('diretorio')}
          className={`px-4 py-2.5 font-sans text-xs font-bold transition-all border-b-2 flex items-center gap-2 cursor-pointer
            ${activeSubTab === 'diretorio' 
              ? 'border-pink-600 text-pink-600' 
              : 'border-transparent text-slate-450 hover:text-slate-700'}`}
        >
          <Users size={14} />
          <span>Fichário de Clientes</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveSubTab('funil')}
          className={`px-4 py-2.5 font-sans text-xs font-bold transition-all border-b-2 flex items-center gap-2 cursor-pointer
            ${activeSubTab === 'funil' 
              ? 'border-pink-600 text-pink-600' 
              : 'border-transparent text-slate-450 hover:text-slate-700'}`}
        >
          <TrendingUp size={14} />
          <span>Funil de Vendas Kanban</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveSubTab('followup')}
          className={`px-4 py-2.5 font-sans text-xs font-bold transition-all border-b-2 flex items-center gap-2 cursor-pointer
            ${activeSubTab === 'followup' 
              ? 'border-pink-600 text-pink-600' 
              : 'border-transparent text-slate-450 hover:text-slate-700'}`}
        >
          <Calendar size={14} />
          <span>Follow-up & Agendamentos</span>
        </button>
        {currentUser?.role !== 'Vendedor' && (
          <button
            type="button"
            onClick={() => setActiveSubTab('parceiros')}
            className={`px-4 py-2.5 font-sans text-xs font-bold transition-all border-b-2 flex items-center gap-2 cursor-pointer
              ${activeSubTab === 'parceiros' 
                ? 'border-pink-600 text-pink-600' 
                : 'border-transparent text-slate-450 hover:text-slate-705'}`}
          >
            <Award size={14} />
            <span>Influenciadoras & Parceiros</span>
          </button>
        )}
      </div>

      {/* Tab 1: Fichário de Clientes */}
      {activeSubTab === 'diretorio' && (
        <div className="space-y-4">
          <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-3 bg-white p-4 rounded-2xl border border-slate-100 shadow-xs">
            {/* Search client input */}
            <div className="relative flex-grow">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                <Search size={16} />
              </span>
              <input 
                id="crm-search-input"
                type="text"
                placeholder="Buscar cliente por nome, e-mail ou número de telefone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-150 rounded-xl text-xs font-sans text-slate-700 focus:outline-hidden"
              />
            </div>
            
            <button 
              type="button"
              id="add-client-modal-btn"
              onClick={() => {
                resetForm();
                setIsAddModalOpen(true);
              }}
              className="px-4 py-2 bg-pink-600 hover:bg-pink-700 font-sans font-medium text-white rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Plus size={15} />
              <span>Cadastrar Cliente</span>
            </button>
          </div>

          <div className="bg-white border border-slate-100 rounded-2xl shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs font-sans">
                <thead>
                  <tr className="bg-slate-50/70 border-b border-slate-50 text-slate-400 font-bold uppercase text-[9px] tracking-wider select-none">
                    <th className="p-4">Cliente</th>
                    <th className="p-4">Contato</th>
                    <th className="p-4">Canal Cadastrado</th>
                    <th className="p-4 text-center">Score NPS</th>
                    <th className="p-4 text-right">Faturamento Total</th>
                    <th className="p-4 text-center">Pedidos</th>
                    <th className="p-4 text-right">Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-650">
                  {filteredClients.map((c) => (
                    <tr key={c.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-pink-50 text-pink-600 font-bold flex items-center justify-center text-[10px]">
                            {c.name.split(' ')[0][0]}{c.name.split(' ').slice(-1)[0] ? c.name.split(' ').slice(-1)[0][0] : ''}
                          </div>
                          <div>
                            <span className="font-semibold text-slate-800 text-xs block leading-tight">{c.name}</span>
                            <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
                              <span className="text-[9px] text-slate-400 font-normal font-mono">ID: {c.id.substring(0,8).toUpperCase()}</span>
                              {c.cpf && (
                                <span className="bg-slate-100 text-slate-650 border border-slate-200 px-1 py-0.2 rounded text-[9px] font-mono font-bold leading-none shrink-0" title={`CPF: ${c.cpf}`}>
                                  {c.cpf}
                                </span>
                              )}
                              {c.birthDate && (
                                <span className="bg-pink-50 text-pink-600 border border-pink-100 px-1 py-0.2 rounded text-[9px] font-mono font-bold leading-none shrink-0" title={`Aniversário: ${c.birthDate}`}>
                                  🎂 {c.birthDate}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 space-y-1">
                        <div className="flex items-center gap-1.5 text-slate-500">
                          <Phone size={11} className="text-slate-400 shrink-0" />
                          <span className="font-mono">{c.phone}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                          <Mail size={11} className="text-slate-350 shrink-0" />
                          <span className="truncate max-w-[130px]">{c.email}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="inline-flex items-center gap-1 bg-slate-50 border border-slate-150 px-2 py-0.5 rounded text-[10px] font-sans font-medium text-slate-600">
                          {getChannelIcon(c.channel)}
                          <span>{c.channel}</span>
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        <div className="inline-flex items-center gap-1 bg-amber-50/50 border border-amber-100 text-amber-600 font-bold font-mono px-2 py-0.5 rounded text-[10px]">
                          <Star size={10} fill="currentColor" />
                          <span>{c.npsScore !== undefined ? c.npsScore : '10'}</span>
                        </div>
                      </td>
                      <td className="p-4 text-right font-mono font-bold text-slate-850">{formatCurrency(c.totalSpent)}</td>
                      <td className="p-4 text-center font-mono font-bold text-slate-650">{c.ordersCount} compra(s)</td>
                      <td className="p-4 text-right">
                        <div className="flex justify-end gap-1.5">
                          <button 
                            type="button"
                            onClick={() => setSelectedClientDetail(c)}
                            className="p-1 px-2 text-pink-600 hover:text-pink-700 hover:bg-pink-50 rounded-lg font-bold font-sans text-[10px] transition"
                          >
                            <Eye size={12} className="inline mr-1" />
                            <span>Histórico</span>
                          </button>
                          <button 
                            type="button"
                            onClick={() => handleOpenEdit(c)}
                            className="p-1 text-slate-450 hover:text-slate-800 rounded hover:bg-slate-100 transition"
                            title="Editar Dados"
                          >
                            <Edit size={12} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Kanban Pipeline opportunities funnel */}
      {activeSubTab === 'funil' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 text-xs font-sans">
          
          {/* Form to insert opportunity */}
          <div className="lg:col-span-3 bg-white border border-slate-100 rounded-2xl p-4 shadow-xs height-fit space-y-4">
            <h3 className="font-bold uppercase tracking-wider text-slate-700 pb-2 border-b border-slate-50 flex items-center gap-1">
              <Sparkles size={14} className="text-pink-600" />
              <span>Nova Oportunidade</span>
            </h3>

            <form onSubmit={handleCreateOpportunity} className="space-y-3">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Interessada (Designar)</label>
                <input
                  type="text"
                  required
                  placeholder="Nome do Lead / Cliente"
                  value={opClient}
                  onChange={(e) => setOpClient(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-150 rounded-lg p-2 focus:outline-hidden"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Est. Peças (R$)</label>
                  <input
                    type="number"
                    value={opVal}
                    onChange={(e) => setOpVal(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-150 rounded-lg p-2 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Prob (%)</label>
                  <input
                    type="number"
                    value={opProb}
                    onChange={(e) => setOpProb(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-150 rounded-lg p-2 focus:outline-hidden"
                  />
                </div>
              </div>
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Peça de Interesse</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Legging Sculp Wave"
                  value={opItem}
                  onChange={(e) => setOpItem(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-150 rounded-lg p-2 focus:outline-hidden"
                />
              </div>
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Anotações rápidas</label>
                <textarea
                  rows={2}
                  placeholder="Ficou de vir provar"
                  value={opNotes}
                  onChange={(e) => setOpNotes(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-150 rounded-lg p-2 focus:outline-hidden"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2 bg-pink-600 hover:bg-pink-700 text-white font-bold transition rounded-lg"
              >
                Incluir no Funil
              </button>
            </form>
          </div>

          {/* Kanban board layout representation */}
          <div className="lg:col-span-9 grid grid-cols-1 md:grid-cols-4 gap-3">
            {(['Prospecção', 'Foto Enviada', 'Prova / Reserva', 'Fechado'] as Opportunity['stage'][]).map(stage => {
              const stageOps = opportunities.filter(o => o.stage === stage);
              const stageTot = stageOps.reduce((sum, o) => sum + o.value, 0);

              return (
                <div key={stage} className="bg-slate-50 rounded-2xl p-3 border border-slate-150 max-h-96 overflow-y-auto flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-center mb-2 border-b border-slate-200 pb-1.5 font-bold uppercase tracking-wide">
                      <span className="text-slate-800 text-[10px]">{stage}</span>
                      <span className="bg-slate-200 text-slate-650 px-2 py-0.5 rounded-full text-[9px]">{stageOps.length}</span>
                    </div>

                    <div className="space-y-2">
                      {stageOps.map(op => (
                        <div key={op.id} className="bg-white p-3 rounded-xl border border-slate-100 hover:shadow-xs transition relative">
                          <p className="font-bold text-slate-800 truncate mb-1">{op.clientName}</p>
                          <p className="font-medium text-pink-600 text-[10px] mb-1.5">{op.itemInteresse}</p>
                          <div className="flex justify-between items-center text-[10px] text-slate-400">
                            <span>Prob: <strong className="text-slate-600">{op.probability}%</strong></span>
                            <span className="font-bold font-mono text-slate-700">{formatCurrency(op.value)}</span>
                          </div>
                          {op.notes && <p className="text-[9px] text-slate-400 mt-2 bg-slate-50/50 p-1.5 rounded border border-slate-100 leading-tight">📝 {op.notes}</p>}

                          {/* Quick transition trigger */}
                          {stage !== 'Fechado' && (
                            <button
                              type="button"
                              onClick={() => moveOpportunity(op.id, op.stage)}
                              className="w-full mt-2.5 py-1 bg-slate-50 hover:bg-slate-100 border border-slate-150 rounded text-[9px] font-bold text-slate-600 flex items-center justify-center gap-1 cursor-pointer transition-colors"
                            >
                              <span>Avançar Etapa</span>
                              <ArrowRight size={10} />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-200 text-right font-mono font-bold text-slate-750">
                    <span className="text-[10px] text-slate-400 mr-1.5">Soma:</span>
                    <span>{formatCurrency(stageTot)}</span>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      )}

      {/* Tab 3: Message Scheduling or Follow-up alerts */}
      {activeSubTab === 'followup' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-xs font-sans">
          
          {/* Scheduling Followup Form */}
          <div className="bg-white border border-slate-105 rounded-2xl p-4 shadow-xs">
            <h3 className="font-bold uppercase tracking-wider text-slate-700 pb-2 border-b border-slate-50 flex items-center gap-1.5">
              <ClipboardList size={15} className="text-pink-600" />
              <span>Agendar Follow-up de Cliente</span>
            </h3>

            <form onSubmit={handleCreateFollowUp} className="space-y-4 pt-2">
              <div>
                <label className="block text-slate-405 font-semibold mb-1">Nome da Cliente</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Amanda Rezende"
                  value={fClient}
                  onChange={(e) => setFClient(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-150 rounded-lg p-2 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-405 font-semibold mb-1">Meio de Contato</label>
                  <select
                    value={fChannel}
                    onChange={(e: any) => setFChannel(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-150 rounded-lg p-2 focus:outline-hidden font-semibold"
                  >
                    <option value="WhatsApp">WhatsApp</option>
                    <option value="Instagram">Instagram DM</option>
                    <option value="Call">Telefonar</option>
                    <option value="E-mail">E-mail</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-405 font-semibold mb-1">Data Agendada</label>
                  <input
                    type="date"
                    required
                    value={fDate}
                    onChange={(e) => setFDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-150 rounded-lg p-1.5 focus:outline-hidden font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-405 font-semibold mb-1">O que contatar? (Anotação da Campanha / Provadores)</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Perguntar o tamanho que ela prefere das estampas e cores que chegaram da nova coleção de tops!"
                  value={fNotes}
                  onChange={(e) => setFNotes(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-150 rounded-lg p-2 focus:outline-hidden"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2 bg-pink-600 hover:bg-pink-700 text-white font-bold transition rounded-lg"
              >
                Agendar Atividade
              </button>
            </form>
          </div>

          {/* List scheduled tasks */}
          <div className="lg:col-span-2 bg-white border border-slate-100 rounded-2xl p-4 shadow-xs">
            <h3 className="font-bold uppercase tracking-wider text-slate-500 mb-3 block">Follow-up Atividades Agendadas</h3>

            <div className="space-y-2.5">
              {followups.map(fup => (
                <div key={fup.id} className={`p-4 rounded-2xl border flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs font-sans transition-all
                  ${fup.completed ? 'bg-slate-50 border-slate-150 text-slate-400' : 'bg-white border-slate-150 hover:shadow-xs'}`}>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className={`font-bold ${fup.completed ? 'text-slate-405 line-through' : 'text-slate-800'}`}>{fup.clientName}</span>
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full
                        ${fup.channel === 'WhatsApp' ? 'bg-green-100 text-green-800' : fup.channel === 'Instagram' ? 'bg-pink-100 text-pink-800' : 'bg-blue-100 text-blue-800'}`}>
                        {fup.channel}
                      </span>
                    </div>
                    <p className={`text-slate-550 ${fup.completed ? 'line-through opacity-70' : 'font-medium'}`}>{fup.notes}</p>
                    <p className="text-[10px] text-slate-400">Data contato: <strong className="text-slate-500">{fup.date}</strong></p>
                  </div>

                  <div className="flex gap-2">
                    {!fup.completed ? (
                      <button
                        type="button"
                        onClick={() => {
                          setFollowups(prev => prev.map(f => f.id === fup.id ? { ...f, completed: true } : f));
                          alert('Atividade marcada como realizada e arquivada!');
                        }}
                        className="py-1 px-2.5 bg-green-500 hover:bg-green-600 text-white font-bold rounded transition text-[10px] border-none cursor-pointer"
                      >
                        Marcar Concluída
                      </button>
                    ) : (
                      <span className="text-green-600 font-bold text-[10px] bg-green-50 px-2 py-1 rounded">✔ Concluído</span>
                    )}

                    <button
                      type="button"
                      onClick={() => setFollowups(prev => prev.filter(f => f.id !== fup.id))}
                      className="p-1 px-2 hover:bg-rose-50 text-rose-600 rounded text-[10px] font-bold"
                    >
                      Excluir
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* Tab 4: Partner / Influencer program */}
      {activeSubTab === 'parceiros' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-xs font-sans">
          
          {/* List and report of partners */}
          <div className="lg:col-span-2 bg-white border border-slate-100 rounded-2xl p-4 shadow-xs">
            <h3 className="font-bold uppercase tracking-wider text-slate-500 mb-3 block">Métricas de Vendas por Parceira / Influenciadora</h3>
            
            <div className="divide-y divide-slate-100">
              {partners.map(part => {
                const comissaoPaga = Number(((part.totalGenerated * part.commissionRate) / 100).toFixed(2));

                return (
                  <div key={part.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-pink-100/50 text-pink-600 rounded-xl flex items-center justify-center font-bold">
                        <Gift size={16} />
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-800 text-xs">{part.name}</h4>
                        <span className="text-slate-400 text-[10px] font-medium block">{part.instagram}</span>
                        <span className="text-rose-600 font-mono font-bold text-[10px] bg-rose-50 px-1.5 py-0.5 rounded mt-1.5 inline-block">Cupom: {part.couponCode}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 text-right">
                      <div>
                        <span className="text-slate-350 font-bold block text-[9px] uppercase tracking-wider">Vendas</span>
                        <span className="font-bold text-slate-700 font-mono mt-0.5 inline-block text-[11px]">{part.salesCount} ped</span>
                      </div>
                      <div>
                        <span className="text-slate-350 font-bold block text-[9px] uppercase tracking-wider">Faturamento</span>
                        <span className="font-bold text-slate-700 font-mono mt-0.5 inline-block text-[11px]">{formatCurrency(part.totalGenerated)}</span>
                      </div>
                      <div>
                        <span className="text-slate-350 font-bold block text-[9px] uppercase tracking-wider">Comissão ({part.commissionRate}%)</span>
                        <span className="font-bold text-emerald-600 font-mono mt-0.5 inline-block text-[11px]">{formatCurrency(comissaoPaga)}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Form to insert partner */}
          <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-xs">
            <h3 className="font-bold uppercase tracking-wider text-slate-700 pb-2 border-b border-slate-50 flex items-center gap-1.5 mb-3">
              <Plus size={15} className="text-pink-600" />
              <span>Cadastrar Influenciadora</span>
            </h3>

            <form onSubmit={handleCreatePartner} className="space-y-4">
              <div>
                <label className="block text-slate-405 font-semibold mb-1">Nome Completo</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Ana Souza Coach"
                  value={partName}
                  onChange={(e) => setPartName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-150 rounded-lg p-2 focus:outline-hidden"
                />
              </div>
              <div>
                <label className="block text-slate-405 font-semibold mb-1">Instagram (@)</label>
                <input
                  type="text"
                  placeholder="Ex: @anasouza_fit"
                  value={partInsta}
                  onChange={(e) => setPartInsta(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-150 rounded-lg p-2 focus:outline-hidden"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-405 font-semibold mb-1">Código Cupom VIP</label>
                  <input
                    type="text"
                    required
                    placeholder="ANAFIT"
                    value={partCoupon}
                    onChange={(e) => setPartCoupon(e.target.value.toUpperCase())}
                    className="w-full bg-slate-50 border border-slate-150 rounded-lg p-1.5 focus:outline-hidden font-mono text-rose-600 font-bold"
                  />
                </div>
                <div>
                  <label className="block text-slate-405 font-semibold mb-1">Comissão (%)</label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={partRate}
                    onChange={(e) => setPartRate(Math.max(0, Math.min(100, Number(e.target.value))))}
                    className="w-full bg-slate-50 border border-slate-150 rounded-lg p-1.5 focus:outline-hidden font-semibold"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2 bg-pink-600 hover:bg-pink-700 text-white font-bold transition rounded-lg"
              >
                Cadastrar Parceira
              </button>
            </form>
          </div>

        </div>
      )}

      {/* Customer profile detail drawer */}
      {selectedClientDetail && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 transition-all">
          <div className="bg-white rounded-2xl max-w-sm w-full shadow-2xl border border-slate-100 overflow-hidden">
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <span className="font-bold text-xs tracking-wider uppercase font-sans">Ficha da Cliente</span>
              <button 
                onClick={() => setSelectedClientDetail(null)}
                className="text-slate-400 hover:text-white transition-colors text-xs"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-5 max-h-[85vh] overflow-y-auto font-sans text-xs">
              <div className="text-center pb-4 border-b border-slate-100">
                <div className="w-14 h-14 bg-pink-100 text-pink-600 font-bold rounded-full flex items-center justify-center text-lg mx-auto shadow-sm">
                  {selectedClientDetail.name[0]}
                </div>
                <h4 className="text-sm font-bold text-slate-800 mt-2.5">{selectedClientDetail.name}</h4>
                <p className="text-[10px] text-slate-400 mt-0.5">{selectedClientDetail.email}</p>
                <div className="flex justify-center gap-2 mt-3 text-[10px] font-semibold">
                  <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-mono">
                    {selectedClientDetail.phone}
                  </span>
                  <span className="bg-amber-50 text-amber-600 px-2 py-0.5 rounded flex items-center gap-1 font-mono">
                    <Star size={10} fill="currentColor" /> {selectedClientDetail.npsScore || '10'}/10 Score
                  </span>
                </div>
              </div>

              {/* Purchase History Listing */}
              <div className="space-y-3">
                <h5 className="font-bold text-[10px] text-slate-450 uppercase tracking-widest font-mono">Histórico de Pedidos ({clientPurchaseHistory.length})</h5>
                {clientPurchaseHistory.length === 0 ? (
                  <div className="py-6 text-center text-slate-400 text-xs font-sans">Nenhuma compra registrada para esta cliente no PDV ainda.</div>
                ) : (
                  <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
                    {clientPurchaseHistory.map((order, idx) => (
                      <div key={idx} className="bg-slate-50 border border-slate-100 rounded-xl p-3 text-xs space-y-2">
                        <div className="flex justify-between font-mono">
                          <span className="font-bold text-slate-750">{order.id.toUpperCase()}</span>
                          <span className="text-slate-400">{new Date(order.createdAt).toLocaleDateString('pt-BR')}</span>
                        </div>
                        <div className="divide-y divide-slate-150/50">
                          {order.items.map((it, i) => (
                             <div key={i} className="py-1 flex justify-between text-[11px] text-slate-650">
                              <span>{it.quantity}x {it.name}</span>
                              <span className="font-semibold font-mono">{formatCurrency(it.price * it.quantity)}</span>
                            </div>
                          ))}
                        </div>
                        <div className="flex justify-between border-t border-slate-150/55 pt-1.5 font-bold font-mono">
                          <span className="font-sans">Total</span>
                          <span className="text-pink-650">{formatCurrency(order.total)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <button 
                onClick={() => setSelectedClientDetail(null)}
                className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-650 rounded-xl text-xs font-bold font-sans transition-all cursor-pointer text-center"
              >
                Fechar Perfil
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Client Modal Popup */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 transition-all">
          <div className="bg-white rounded-2xl max-w-sm w-full shadow-2xl border border-slate-50 overflow-hidden">
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <span className="font-bold text-xs tracking-wider uppercase font-sans">
                {editingClient ? 'Editar Cadastro da Cliente' : 'Cadastrar Nova Cliente'}
              </span>
              <button 
                onClick={() => {
                  setIsAddModalOpen(false);
                  resetForm();
                }}
                className="text-slate-400 hover:text-white transition-colors text-xs"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="p-6 space-y-4">
              <div className="space-y-1 text-xs font-sans">
                <label className="text-slate-500 font-bold uppercase text-[9px] tracking-wide">Nome Completo</label>
                <input 
                  type="text"
                  required
                  placeholder="Ex: Amanda Rezende"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 placeholder-slate-400 focus:outline-hidden focus:border-pink-500 transition-all font-medium"
                />
              </div>

              <div className="space-y-1 text-xs font-sans">
                <label className="text-slate-500 font-bold uppercase text-[9px] tracking-wide">Celular / WhatsApp</label>
                <input 
                  type="text"
                  required
                  placeholder="Ex: (11) 98888-7777"
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 placeholder-slate-400 focus:outline-hidden focus:border-pink-500 transition-all font-medium font-mono"
                />
              </div>

              <div className="space-y-1 text-xs font-sans font-medium">
                <label className="text-slate-500 font-bold uppercase text-[9px] tracking-wide">E-mail de Contato</label>
                <input 
                  type="email"
                  placeholder="Ex: amanda@exemplo.com"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 placeholder-slate-400 focus:outline-none focus:border-pink-500 transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs font-sans font-medium">
                <div className="space-y-1">
                  <label className="text-slate-500 font-bold uppercase text-[9px] tracking-wide">CPF do Cliente</label>
                  <input 
                    type="text"
                    placeholder="000.000.000-00"
                    value={newCpf}
                    onChange={(e) => setNewCpf(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 placeholder-slate-400 focus:outline-none focus:border-pink-500 transition-all font-mono"
                  />
                </div>

                <div className="space-y-1 font-sans">
                  <label className="text-slate-500 font-bold uppercase text-[9px] tracking-wide">Data Nascimento</label>
                  <input 
                    type="text"
                    placeholder="Ex: 12/04/1995"
                    value={newBirthDate}
                    onChange={(e) => setNewBirthDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 placeholder-slate-400 focus:outline-none focus:border-pink-500 transition-all font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs font-sans font-medium">
                <div className="space-y-1">
                  <label className="text-slate-500 font-bold uppercase text-[9px] tracking-wide">Origem</label>
                  <select 
                    value={newChannel}
                    onChange={(e) => setNewChannel(e.target.value as SalesChannel)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-hidden focus:border-pink-500 transition-all font-semibold"
                  >
                    <option value="Instagram">Instagram</option>
                    <option value="WhatsApp">WhatsApp</option>
                    <option value="E-commerce">E-commerce</option>
                    <option value="Loja Física">Loja Física</option>
                    <option value="Outros">Outros</option>
                  </select>
                </div>

                <div className="space-y-1 font-sans">
                  <label className="text-slate-500 font-bold uppercase text-[9px] tracking-wide">Score Relacionamento</label>
                  <select 
                    value={newNps}
                    onChange={(e) => setNewNps(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-hidden focus:border-pink-500 transition-all font-semibold font-mono"
                  >
                    {[10, 9, 8, 7, 6, 5, 4, 3, 2, 1].map(n => <option key={n} value={n}>{n}</option>)}
                  </select>
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <button 
                  type="button" 
                  onClick={() => {
                    setIsAddModalOpen(false);
                    resetForm();
                  }}
                  className="flex-1 py-2.5 bg-slate-100 text-slate-650 rounded-xl text-xs font-bold font-sans transition-all cursor-pointer text-center hover:bg-slate-200"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-2.5 bg-pink-600 text-white rounded-xl text-xs font-bold font-sans transition-all cursor-pointer text-center shadow-md shadow-pink-500/10 hover:bg-pink-700"
                >
                  Salvar Cliente
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
