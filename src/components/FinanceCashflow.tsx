/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { 
  DollarSign, 
  Search, 
  Plus, 
  ArrowUpRight, 
  ArrowDownLeft, 
  TrendingUp, 
  AlertTriangle,
  Calendar,
  Tag,
  CheckCircle2,
  Trash2,
  Clock,
  CreditCard,
  Layers,
  Filter,
  Check
} from 'lucide-react';
import { Transaction } from '../types';

interface FinanceCashflowProps {
  transactions: Transaction[];
  setTransactions: React.Dispatch<React.SetStateAction<Transaction[]>>;
  onAddTransaction: (tx: Transaction) => void;
}

export default function FinanceCashflow({ transactions, setTransactions, onAddTransaction }: FinanceCashflowProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<'All' | 'Inflow' | 'Outflow'>('All');
  
  // Advanced Filter Tabs:
  // 'all' = Todos os fluxos
  // 'realized' = Realizado (Apenas Pagos/Liquidados)
  // 'payable' = Contas a Pagar (Saídas Pendentes)
  // 'receivable' = Contas a Receber (Entradas Pendentes)
  const [activeFilterTab, setActiveFilterTab] = useState<'all' | 'realized' | 'payable' | 'receivable'>('all');
  
  const [isAddTxOpen, setIsAddTxOpen] = useState(false);

  // Form states for creating / editing entries
  const [txType, setTxType] = useState<'Inflow' | 'Outflow'>('Outflow'); // typical use-case is Outflow (expense)
  const [txCategory, setTxCategory] = useState('Fornecedores');
  const [txDesc, setTxDesc] = useState('');
  const [txAmount, setTxAmount] = useState<number>(0);
  const [txStatus, setTxStatus] = useState<'pago' | 'pendente'>('pendente');
  const [txDueDate, setTxDueDate] = useState<string>(() => {
    return new Date().toISOString().split('T')[0];
  });
  
  // Installments state (Parcelamento)
  const [isInstallment, setIsInstallment] = useState(false);
  const [installmentsCount, setInstallmentsCount] = useState<number>(3);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  // Advanced financial calculations
  const metrics = useMemo(() => {
    let inflowPaid = 0;       // Recebido/Liquidado
    let inflowPending = 0;    // A receber
    let outflowPaid = 0;      // Pago/Liquidado
    let outflowPending = 0;   // A pagar

    transactions.forEach(t => {
      const status = t.status || 'pago'; // backward compatibility fallback
      const amount = Number(t.amount) || 0;
      
      if (t.type === 'Inflow') {
        if (status === 'pago') {
          inflowPaid += amount;
        } else {
          inflowPending += amount;
        }
      } else {
        if (status === 'pago') {
          outflowPaid += amount;
        } else {
          outflowPending += amount;
        }
      }
    });

    const balanceRealizado = inflowPaid - outflowPaid;
    const balanceProjetado = balanceRealizado + inflowPending - outflowPending;

    return {
      inflowPaid,
      inflowPending,
      outflowPaid,
      outflowPending,
      balanceRealizado,
      balanceProjetado
    };
  }, [transactions]);

  // Master filters implementation 
  const filteredTransactions = useMemo(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    
    return [...transactions]
      .filter(t => {
        const matchesSearch = 
          t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          t.category.toLowerCase().includes(searchQuery.toLowerCase());
          
        const matchesType = selectedType === 'All' || t.type === selectedType;
        
        // Advanced Filter Tab criteria
        const status = t.status || 'pago';
        let matchesTab = true;
        if (activeFilterTab === 'realized') {
          matchesTab = (status === 'pago');
        } else if (activeFilterTab === 'payable') {
          matchesTab = (t.type === 'Outflow' && status === 'pendente');
        } else if (activeFilterTab === 'receivable') {
          matchesTab = (t.type === 'Inflow' && status === 'pendente');
        }
        
        return matchesSearch && matchesType && matchesTab;
      })
      .sort((a, b) => {
        // Sort: pending ones go on top, sorted closer to due date, then sorted by date DESC
        const aStatus = a.status || 'pago';
        const bStatus = b.status || 'pago';
        
        if (aStatus === 'pendente' && bStatus === 'pago') return -1;
        if (aStatus === 'pago' && bStatus === 'pendente') return 1;
        
        // If both pending, sort by due date ASC (closest deadline first)
        if (aStatus === 'pendente' && bStatus === 'pendente') {
          const aDue = a.dueDate || a.date;
          const bDue = b.dueDate || b.date;
          return aDue.localeCompare(bDue);
        }
        
        // Default: sort by date created DESC
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      });
  }, [transactions, searchQuery, selectedType, activeFilterTab]);

  // Quick action: settle/liquidate a pending bill or income straight from the dashboard
  const handleMarkAsPaid = (id: string) => {
    setTransactions(prev => prev.map(t => {
      if (t.id === id) {
        return { 
          ...t, 
          status: 'pago',
          date: new Date().toISOString() // Marked as paid today/now in the cashledger
        };
      }
      return t;
    }));
  };

  // Quick action: delete a transaction
  const handleDeleteTx = (id: string) => {
    if (window.confirm('Confirma a exclusão definitiva deste lançamento financeiro? Essa ação não pode ser desfeita.')) {
      setTransactions(prev => prev.filter(t => t.id !== id));
    }
  };

  // Handle submit form (supports standard or monthly installment scheduler)
  const handleSubmitTx = (e: React.FormEvent) => {
    e.preventDefault();
    if (!txDesc.trim() || txAmount <= 0) {
      alert('Por favor, preencha a descrição do lançamento e defina um valor superior a R$ 0,00.');
      return;
    }

    if (isInstallment && installmentsCount >= 2) {
      // Installment scheduler engine (generates N recurring records month-over-month)
      const groupId = `group-${Date.now()}`;
      const installmentAmount = Number((txAmount / installmentsCount).toFixed(2));
      const generatedList: Transaction[] = [];

      for (let i = 1; i <= installmentsCount; i++) {
        // Calculate due date offset by (i - 1) months
        const baseDate = new Date(txDueDate + 'T12:00:00'); // set mid-day to avoid TZ adjustments shifts
        baseDate.setMonth(baseDate.getMonth() + (i - 1));
        const formattedDueDate = baseDate.toISOString().split('T')[0];

        // First installment behavior: matches the user selected status. 
        // Subsequent installments are set to "pendente" (future) automatically.
        const currentStatus = (i === 1) ? txStatus : 'pendente';

        generatedList.push({
          id: `tx-${Date.now()}-p${i}`,
          type: txType,
          category: txCategory,
          description: `${txDesc.trim()} (Parcela ${i}/${installmentsCount})`,
          amount: installmentAmount,
          date: new Date().toISOString(),
          status: currentStatus,
          dueDate: formattedDueDate,
          installmentsGroup: groupId,
          installmentNumber: i,
          totalInstallments: installmentsCount
        });
      }

      // Add all generated installments to transactions state
      setTransactions(prev => [...generatedList, ...prev]);
    } else {
      // Single transaction record
      const newTx: Transaction = {
        id: `tx-${Date.now()}`,
        type: txType,
        category: txCategory,
        description: txDesc.trim(),
        amount: txAmount,
        date: new Date().toISOString(),
        status: txStatus,
        dueDate: txDueDate
      };
      
      onAddTransaction(newTx);
    }

    setIsAddTxOpen(false);

    // Reset state inputs
    setTxDesc('');
    setTxAmount(0);
    setIsInstallment(false);
    setInstallmentsCount(3);
    setTxStatus('pendente');
    setTxDueDate(new Date().toISOString().split('T')[0]);
  };

  // Dynamic status badges and warnings
  const getTransactionStatusBadge = (tx: Transaction) => {
    const status = tx.status || 'pago';
    const isPending = status === 'pendente';
    
    if (!isPending) {
      return (
        <span className="bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full font-bold flex items-center gap-1 text-[10px] uppercase tracking-wide border border-emerald-100">
          <Check size={10} strokeWidth={3} /> Liquidado
        </span>
      );
    }

    // Is pending, evaluate deadline date
    const todayStr = new Date().toISOString().split('T')[0];
    const dueDateStr = tx.dueDate || tx.date.split('T')[0];

    if (dueDateStr < todayStr) {
      return (
        <span className="bg-rose-50 text-rose-600 px-2.5 py-1 rounded-full font-bold flex items-center gap-1 text-[10px] uppercase tracking-wide border border-rose-100 animate-pulse">
          <AlertTriangle size={10} /> Atrasado (Venceu {dueDateStr.split('-').reverse().join('/')})
        </span>
      );
    } else if (dueDateStr === todayStr) {
      return (
        <span className="bg-amber-50 text-amber-600 px-2.5 py-1 rounded-full font-bold flex items-center gap-1 text-[10px] uppercase tracking-wide border border-amber-100">
          <Clock size={10} /> Vence Hoje
        </span>
      );
    } else {
      return (
        <span className="bg-blue-50 text-blue-600 px-2.5 py-1 rounded-full font-bold flex items-center gap-1 text-[10px] uppercase tracking-wide border border-blue-100">
          <Calendar size={10} /> A Vencer ({dueDateStr.split('-').reverse().join('/')})
        </span>
      );
    }
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold font-sans text-slate-800 tracking-tight">Painel Financeiro & Fluxo de Caixa</h2>
          <p className="text-slate-400 text-sm font-sans font-medium">Controle total de despesas, contas a pagar, recebimentos parcelados e projeção real da saúde física da loja.</p>
        </div>
        <button 
          id="add-tx-modal-btn"
          onClick={() => {
            setTxDueDate(new Date().toISOString().split('T')[0]);
            setIsAddTxOpen(true);
          }}
          className="inline-flex items-center gap-2 bg-slate-900 hover:bg-black font-sans font-extrabold text-white px-5 py-3 rounded-xl text-xs uppercase shadow-md shadow-slate-900/10 transition-all cursor-pointer"
        >
          <Plus size={16} />
          <span>Lançar Despesa / Receita</span>
        </button>
      </div>

      {/* Advanced Finance KPI cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Caixa Realizado (Real Realized Safe) */}
        <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-xs flex items-center justify-between hover:shadow-xs transition-all hover:border-slate-200">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-450 uppercase tracking-wider block font-sans select-none">Saldo de Caixa Real</span>
            <div className="flex items-baseline gap-1">
              <h3 className={`text-xl font-bold font-mono ${metrics.balanceRealizado >= 0 ? 'text-emerald-600' : 'text-rose-500'}`}>
                {formatCurrency(metrics.balanceRealizado)}
              </h3>
            </div>
            <span className="text-[9px] text-slate-400 font-sans block">
              Dinheiro real em mãos (Liquidados)
            </span>
          </div>
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center border shrink-0 
            ${metrics.balanceRealizado >= 0 ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-500 border-rose-100'}`}>
            <DollarSign size={18} />
          </div>
        </div>

        {/* Total Contas a Receber (Receivables Pending) */}
        <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-xs flex items-center justify-between hover:shadow-xs transition-all hover:border-slate-200">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-450 uppercase tracking-wider block font-sans select-none">Contas a Receber</span>
            <h3 className="text-xl font-bold font-mono text-blue-600">{formatCurrency(metrics.inflowPending)}</h3>
            <span className="text-[9px] text-blue-500 font-bold font-sans flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 block"></span> Receitas agendadas / pendentes
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100 shrink-0">
            <ArrowUpRight size={18} />
          </div>
        </div>

        {/* Total Contas a Pagar (Payables Pending) */}
        <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-xs flex items-center justify-between hover:shadow-xs transition-all hover:border-slate-200">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-450 uppercase tracking-wider block font-sans select-none">Contas a Pagar</span>
            <h3 className="text-xl font-bold font-mono text-amber-600">{formatCurrency(metrics.outflowPending)}</h3>
            <span className="text-[9px] text-amber-600 font-bold font-sans flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 block animate-pulse"></span> Despesas futuras ou em aberto
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100 shrink-0">
            <ArrowDownLeft size={18} />
          </div>
        </div>

        {/* Projeção Financeira Comercial (Projected flows) */}
        <div className="bg-slate-900 border border-slate-900 rounded-2xl p-5 shadow-sm flex items-center justify-between hover:shadow-md transition-all">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block font-sans select-none">Saldo Projetado</span>
            <h3 className={`text-xl font-bold font-mono ${metrics.balanceProjetado >= 0 ? 'text-pink-400' : 'text-rose-400'}`}>
              {formatCurrency(metrics.balanceProjetado)}
            </h3>
            <span className="text-[9px] text-slate-350 font-sans block">
              Real + Receber - Pagar (Consolidado)
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-slate-800 text-pink-400 flex items-center justify-center border border-slate-700 shrink-0">
            <TrendingUp size={18} />
          </div>
        </div>
      </div>

      {/* Ledger lists, sorting and subtabs selection */}
      <div className="bg-white border border-slate-100 rounded-2xl shadow-xs overflow-hidden">
        
        {/* Ledger quick sub-tabs filter bar */}
        <div className="p-4 bg-slate-50/55 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs font-sans">
          
          <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 self-start font-bold">
            <button 
              onClick={() => setActiveFilterTab('all')}
              className={`px-3 py-2 rounded-lg transition-all cursor-pointer text-[11px] ${activeFilterTab === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-450 hover:text-slate-700'}`}
            >
              Todos os Lançamentos ({transactions.length})
            </button>
            <button 
              onClick={() => setActiveFilterTab('realized')}
              className={`px-3 py-2 rounded-lg transition-all cursor-pointer text-[11px] ${activeFilterTab === 'realized' ? 'bg-white text-emerald-600 shadow-xs' : 'text-slate-450 hover:text-slate-700'}`}
            >
              Realizado (Contas Baixadas)
            </button>
            <button 
              onClick={() => setActiveFilterTab('payable')}
              className={`px-3 py-2 rounded-lg transition-all cursor-pointer text-[11px] ${activeFilterTab === 'payable' ? 'bg-white text-rose-500 shadow-xs' : 'text-slate-450 hover:text-slate-700'}`}
            >
              Contas a Pagar (Despesas)
            </button>
            <button 
              onClick={() => setActiveFilterTab('receivable')}
              className={`px-3 py-2 rounded-lg transition-all cursor-pointer text-[11px] ${activeFilterTab === 'receivable' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-450 hover:text-slate-700'}`}
            >
              Contas a Receber
            </button>
          </div>

          <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 self-end md:self-auto font-bold text-slate-400">
            <button 
              onClick={() => setSelectedType('All')}
              className={`px-2.5 py-1.5 rounded-lg transition-all cursor-pointer text-[10px] uppercase tracking-wider ${selectedType === 'All' ? 'bg-white text-slate-800' : 'hover:text-slate-750'}`}
            >
              Misto
            </button>
            <button 
              onClick={() => setSelectedType('Inflow')}
              className={`px-2.5 py-1.5 rounded-lg transition-all cursor-pointer text-[10px] uppercase tracking-wider ${selectedType === 'Inflow' ? 'bg-emerald-50 text-emerald-700' : 'hover:text-emerald-600'}`}
            >
              Entradas
            </button>
            <button 
              onClick={() => setSelectedType('Outflow')}
              className={`px-2.5 py-1.5 rounded-lg transition-all cursor-pointer text-[10px] uppercase tracking-wider ${selectedType === 'Outflow' ? 'bg-rose-50 text-rose-700' : 'hover:text-rose-600'}`}
            >
              Saídas
            </button>
          </div>
        </div>

        {/* Query keyword and metadata filter */}
        <div className="p-4 border-b border-slate-50 text-xs font-sans">
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
              <Search size={14} />
            </span>
            <input 
              id="cashflow-search-input"
              type="text"
              placeholder="Buscar por descrição ou categoria (Ex: Fornecedores, Aluguel, Pro-labore, Venda)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-750 placeholder-slate-400 text-xs focus:outline-hidden focus:border-slate-800 focus:bg-white transition-all font-medium"
            />
          </div>
        </div>

        {/* Ledger items rendering core */}
        <div className="divide-y divide-slate-100 overflow-x-auto">
          {filteredTransactions.length === 0 ? (
            <div className="p-12 text-center text-slate-400 space-y-2">
              <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center mx-auto text-slate-400 border border-slate-200">
                <Filter size={18} />
              </div>
              <p className="font-semibold text-xs text-slate-500">Nenhum lançamento financeiro corresponde aos filtros atuais.</p>
              <p className="text-[10px] text-slate-400">Insira um novo lançamento ou alterne os botões de categorias acima.</p>
            </div>
          ) : (
            <div className="min-w-[700px]">
              {/* Header Titles */}
              <div className="grid grid-cols-12 gap-2 bg-slate-50 px-4 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">
                <div className="col-span-4">Fluxo / Descrição</div>
                <div className="col-span-2">Categoria</div>
                <div className="col-span-3">Identificação de Vencimento / Status</div>
                <div className="col-span-1 text-right">Valor bruto</div>
                <div className="col-span-2 text-right">Ações rápidas</div>
              </div>

              {/* Items row list */}
              {filteredTransactions.map(tx => {
                const isInflow = tx.type === 'Inflow';
                const isPending = tx.status === 'pendente';
                const hasInstallments = tx.installmentsGroup && tx.installmentNumber;

                return (
                  <div 
                    key={tx.id}
                    className="grid grid-cols-12 gap-2 items-center px-4 py-3.5 hover:bg-slate-50/40 text-xs transition-all font-sans"
                  >
                    {/* Desc and indicator */}
                    <div className="col-span-4 flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center border shrink-0 
                        ${isInflow 
                          ? 'bg-emerald-50 border-emerald-100/70 text-emerald-600' 
                          : 'bg-rose-50 border-rose-100/70 text-rose-500'}`}
                      >
                        {isInflow ? <ArrowUpRight size={14} /> : <ArrowDownLeft size={14} />}
                      </div>

                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-bold text-slate-800 leading-tight block">{tx.description}</span>
                          {hasInstallments && (
                            <span className="bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded-sm text-[9px] font-bold border border-slate-200">
                              Parc. {tx.installmentNumber}/{tx.totalInstallments}
                            </span>
                          )}
                        </div>
                        <div className="text-[9.5px] text-slate-400 font-medium flex items-center gap-1.5">
                          <span>Criado em: {new Date(tx.date).toLocaleDateString('pt-BR')}</span>
                        </div>
                      </div>
                    </div>

                    {/* Category */}
                    <div className="col-span-2">
                      <span className="inline-flex items-center gap-1 bg-slate-50 text-slate-600 px-2.5 py-1 rounded-md font-sans border border-slate-200 text-[10px] font-extrabold uppercase tracking-wide">
                        <Tag size={10} className="text-slate-400" /> {tx.category}
                      </span>
                    </div>

                    {/* Status badge and Date */}
                    <div className="col-span-3 flex items-center">
                      <div>
                        {getTransactionStatusBadge(tx)}
                      </div>
                    </div>

                    {/* Amount */}
                    <div className="col-span-1 text-right">
                      <span className={`font-mono font-bold text-xs select-all block
                        ${isInflow ? 'text-emerald-600' : 'text-rose-500'}`}
                      >
                        {isInflow ? '+' : '-'} {formatCurrency(tx.amount)}
                      </span>
                    </div>

                    {/* Quick settling Actions */}
                    <div className="col-span-2 text-right flex items-center justify-end gap-1 px-1">
                      {isPending ? (
                        <button
                          onClick={() => handleMarkAsPaid(tx.id)}
                          title={isInflow ? "Dar Baixa / Recebido" : "Dar Baixa / Pago comercialmente"}
                          className={`inline-flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-lg font-bold text-[9px] uppercase tracking-wider border cursor-pointer hover:shadow-xs transition-all text-white
                            ${isInflow 
                              ? 'bg-emerald-600 hover:bg-emerald-700 border-emerald-600' 
                              : 'bg-slate-900 border-slate-900 hover:bg-black'}`}
                        >
                          <CheckCircle2 size={11} />
                          <span>Baixar</span>
                        </button>
                      ) : (
                        <div className="text-[10px] text-emerald-500 pr-3 font-semibold select-none inline-flex items-center gap-1">
                          <Check size={12} strokeWidth={3} /> Pago
                        </div>
                      )}

                      <button
                        onClick={() => handleDeleteTx(tx.id)}
                        title="Remover definitivamente"
                        className="w-8 h-8 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-500 flex items-center justify-center transition-colors border border-transparent hover:border-rose-100 cursor-pointer shrink-0"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Insert Flow entry Dialog Modal Portal */}
      {isAddTxOpen && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center z-50 p-4 transition-all animate-fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-50 overflow-hidden" id="add-tx-modal">
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <span className="font-bold text-xs tracking-wider uppercase font-sans">Cadastrar Nova Movimentação Comercial</span>
              <button 
                onClick={() => setIsAddTxOpen(false)}
                className="text-slate-400 hover:text-white transition-colors text-xs font-semibold px-2 py-1 bg-slate-850 rounded-lg"
              >
                ✕ Fechar
              </button>
            </div>

            <form onSubmit={handleSubmitTx} className="p-6 space-y-4 font-medium text-xs font-sans">
              
              {/* Type toggle */}
              <div className="space-y-1.5">
                <label className="text-slate-500 font-bold uppercase text-[9px] tracking-wide select-none">Tipo do Lançamento Comercial</label>
                <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1 rounded-xl border border-slate-200">
                  <button 
                    type="button"
                    onClick={() => { 
                      setTxType('Outflow'); 
                      setTxCategory('Fornecedores'); 
                    }}
                    className={`py-2 rounded-lg text-center transition-all cursor-pointer font-extrabold flex items-center justify-center gap-1 text-[11px] uppercase ${txType === 'Outflow' ? 'bg-white text-rose-600 shadow-xs' : 'text-slate-450 hover:text-slate-650'}`}
                  >
                    <ArrowDownLeft size={13} />
                    Saída (Despesa / Custo)
                  </button>
                  <button 
                    type="button"
                    onClick={() => { 
                      setTxType('Inflow'); 
                      setTxCategory('Venda'); 
                    }}
                    className={`py-2 rounded-lg text-center transition-all cursor-pointer font-extrabold flex items-center justify-center gap-1 text-[11px] uppercase ${txType === 'Inflow' ? 'bg-white text-emerald-600 shadow-xs' : 'text-slate-450 hover:text-slate-650'}`}
                  >
                    <ArrowUpRight size={13} />
                    Entrada (Receita)
                  </button>
                </div>
              </div>

              {/* Category selector and Amount input */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5 text-xs">
                  <label className="text-slate-500 font-bold uppercase text-[9px] tracking-wide select-none">Categoria</label>
                  {txType === 'Inflow' ? (
                    <select 
                      id="tx-category-inflow"
                      value={txCategory}
                      onChange={(e) => setTxCategory(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-bold focus:outline-hidden focus:border-slate-800 transition-colors focus:bg-white text-xs"
                    >
                      <option value="Venda">Venda Comercial</option>
                      <option value="Aporte">Aporte Proprietário</option>
                      <option value="Rendimento">Rendimentos</option>
                      <option value="Reembolso">Reembolsos</option>
                      <option value="Outros">Outras Entradas</option>
                    </select>
                  ) : (
                    <select 
                      id="tx-category-outflow"
                      value={txCategory}
                      onChange={(e) => setTxCategory(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-bold focus:outline-hidden focus:border-slate-800 transition-colors focus:bg-white text-xs"
                    >
                      <option value="Fornecedores">Fornecedores (Peças/Tecidos)</option>
                      <option value="Aluguel">Aluguel / Condomínio</option>
                      <option value="Marketing">Marketing / Tráfego</option>
                      <option value="Salários">Salários / Equipe / Pro-labore</option>
                      <option value="Impostos">Impostos / Tributos</option>
                      <option value="Insumos / Embalagens">Insumos & Embalagens</option>
                      <option value="Serviços">Serviços Tercerizados (Oficinas)</option>
                      <option value="Outros Custos">Outros Custos Operacionais</option>
                    </select>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="text-slate-500 font-bold uppercase text-[9px] tracking-wide select-none">Valor Total (R$)</label>
                  <input 
                    id="tx-amount-input"
                    type="number"
                    step="0.01"
                    required
                    min="0.01"
                    placeholder="0.00"
                    value={txAmount || ''}
                    onChange={(e) => setTxAmount(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-bold font-mono focus:outline-hidden focus:border-slate-800 transition-colors focus:bg-white text-xs"
                  />
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <label className="text-slate-500 font-bold uppercase text-[9px] tracking-wide select-none font-sans">Descrição Detalhada</label>
                <input 
                  id="tx-desc-input"
                  type="text"
                  required
                  placeholder="Ex: Pagamento referente à confecção da coleção Verão"
                  value={txDesc}
                  onChange={(e) => setTxDesc(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-750 placeholder-slate-450 font-semibold focus:outline-hidden focus:border-slate-800 transition-colors focus:bg-white text-xs"
                />
              </div>

              {/* Initial Status and Date */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-slate-500 font-bold uppercase text-[9px] tracking-wide select-none">Status Inicial</label>
                  <select 
                    id="tx-status-input"
                    value={txStatus}
                    onChange={(e) => setTxStatus(e.target.value as 'pago' | 'pendente')}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-bold focus:outline-hidden focus:border-slate-800 transition-colors focus:bg-white text-xs"
                  >
                    <option value="pendente">
                      {txType === 'Inflow' ? 'A Receber (Não Consolidado)' : 'A Pagar (Em Aberto)'}
                    </option>
                    <option value="pago">
                      {txType === 'Inflow' ? 'Recebido (Liquidado em Caixa)' : 'Pago (Liquidado em Caixa)'}
                    </option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-slate-500 font-bold uppercase text-[9px] tracking-wide select-none">
                    {txStatus === 'pago' ? 'Data de Pagamento' : 'Data de Vencimento'}
                  </label>
                  <input
                    type="date"
                    required
                    value={txDueDate}
                    onChange={(e) => setTxDueDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-bold font-mono focus:outline-hidden focus:border-slate-800 transition-colors focus:bg-white text-xs"
                  />
                </div>
              </div>

              {/* Installment configuration scheduler (Parcelamento) */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="font-extrabold text-[10.5px] text-slate-850 uppercase tracking-wide block">Dividir / Parcelar Lançamento</span>
                    <span className="text-[9.5px] text-slate-400 block font-semibold leading-tight">Divide o valor total e agenda lembretes de cobrança automáticos mensais.</span>
                  </div>
                  <input 
                    type="checkbox"
                    id="checkbox-installment"
                    checked={isInstallment}
                    onChange={(e) => setIsInstallment(e.target.checked)}
                    className="w-4.5 h-4.5 accent-pink-600 rounded-md cursor-pointer shrink-0"
                  />
                </div>

                {isInstallment && (
                  <div className="grid grid-cols-2 gap-3 items-center pt-2 border-t border-slate-200/50 animate-fade-in">
                    <div className="space-y-1">
                      <label className="text-[8.5px] text-slate-450 uppercase font-bold tracking-wider block">Número de Parcelas</label>
                      <select
                        value={installmentsCount}
                        onChange={(e) => setInstallmentsCount(Number(e.target.value))}
                        className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-700 font-extrabold text-xs"
                      >
                        {[2,3,4,5,6,7,8,9,10,11,12].map(n => (
                          <option key={n} value={n}>{n}x</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[8.5px] text-slate-450 uppercase font-bold tracking-wider block leading-none">Previsão por Parcela</span>
                      <div className="text-slate-800 font-semibold font-mono text-[11px] pt-1">
                        {txAmount > 0 
                          ? `${installmentsCount}x de ${formatCurrency(Number((txAmount / installmentsCount).toFixed(2)))}` 
                          : 'insira o valor total acima'}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Cancel or Save CTA */}
              <div className="flex gap-2.5 pt-3">
                <button 
                  type="button" 
                  onClick={() => setIsAddTxOpen(false)}
                  className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl font-bold font-sans transition-all text-center uppercase tracking-wider text-[10px]"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-3 bg-slate-900 hover:bg-black text-white rounded-xl font-extrabold font-sans transition-all text-center uppercase tracking-wider text-[10px] shadow-md shadow-slate-900/10"
                >
                  Confirmar Lançamento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
