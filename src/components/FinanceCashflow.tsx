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
  Tag
} from 'lucide-react';
import { Transaction } from '../types';

interface FinanceCashflowProps {
  transactions: Transaction[];
  onAddTransaction: (tx: Transaction) => void;
}

export default function FinanceCashflow({ transactions, onAddTransaction }: FinanceCashflowProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<'All' | 'Inflow' | 'Outflow'>('All');
  const [isAddTxOpen, setIsAddTxOpen] = useState(false);

  // Form states for custom entry
  const [txType, setTxType] = useState<'Inflow' | 'Outflow'>('Inflow');
  const [txCategory, setTxCategory] = useState('Marketing');
  const [txDesc, setTxDesc] = useState('');
  const [txAmount, setTxAmount] = useState(150.00);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  // Calculations
  const metrics = useMemo(() => {
    let inflow = 0;
    let outflow = 0;

    transactions.forEach(t => {
      if (t.type === 'Inflow') inflow += t.amount;
      else outflow += t.amount;
    });

    return {
      inflow,
      outflow,
      balance: inflow - outflow
    };
  }, [transactions]);

  const filteredTransactions = useMemo(() => {
    // Exclude historic flows if wanted, or include them so it matches the dashboard exactly!
    // Let's include everything, sorted by date DESC
    return [...transactions]
      .filter(t => {
        const matchesSearch = 
          t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          t.category.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesType = selectedType === 'All' || t.type === selectedType;
        return matchesSearch && matchesType;
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [transactions, searchQuery, selectedType]);

  const handleSubmitTx = (e: React.FormEvent) => {
    e.preventDefault();
    if (!txDesc.trim() || txAmount <= 0) {
      alert('Preencha uma descrição adequada e valor de transação maior que R$ 0.');
      return;
    }

    const newTx: Transaction = {
      id: `t-${Date.now()}`,
      type: txType,
      category: txCategory,
      description: txDesc.trim(),
      amount: txAmount,
      date: new Date().toISOString()
    };

    onAddTransaction(newTx);
    setIsAddTxOpen(false);

    // Reset fields
    setTxDesc('');
    setTxAmount(150.00);
    setTxCategory('Marketing');
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold font-sans text-slate-800 tracking-tight">Painel Financeiro / Fluxo de Caixa</h2>
          <p className="text-slate-400 text-sm font-sans">Monitore todas as receitas e desembolsos, controle lucratividade e saúde financeira</p>
        </div>
        <button 
          id="add-tx-modal-btn"
          onClick={() => setIsAddTxOpen(true)}
          className="inline-flex items-center gap-2 bg-pink-600 hover:bg-pink-700 font-sans font-medium text-white px-4 py-2 rounded-xl text-xs shadow-md shadow-pink-500/10 transition-all cursor-pointer"
        >
          <Plus size={16} />
          <span>Lançar Movimentação</span>
        </button>
      </div>

      {/* Finance KPI cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total Inflow (Entradas) */}
        <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-xs flex items-center justify-between hover:shadow-sm transition-all hover:border-slate-200">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-450 uppercase tracking-wider block font-sans select-none">Total Entradas</span>
            <h3 className="text-xl font-bold font-mono text-emerald-600">{formatCurrency(metrics.inflow)}</h3>
            <span className="text-[10px] text-emerald-500 font-medium font-sans flex items-center gap-1.5 mt-1">
              <TrendingUp size={11} /> +15.5% vs mês anterior
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100 shr-0">
            <ArrowUpRight size={18} />
          </div>
        </div>

        {/* Total Outflow (Saídas) */}
        <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-xs flex items-center justify-between hover:shadow-sm transition-all hover:border-slate-200">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-450 uppercase tracking-wider block font-sans select-none">Total Saídas / Custos</span>
            <h3 className="text-xl font-bold font-mono text-rose-600">{formatCurrency(metrics.outflow)}</h3>
            <span className="text-[10px] text-slate-400 font-sans flex items-center gap-1.5 mt-1">
               Controle de faturamento e custos
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-100 shr-0">
            <ArrowDownLeft size={18} />
          </div>
        </div>

        {/* Balance (Saldo Líquido) */}
        <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-xs flex items-center justify-between hover:shadow-sm transition-all hover:border-slate-200">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-450 uppercase tracking-wider block font-sans select-none">Saldo de Caixa Líquido</span>
            <h3 className={`text-xl font-bold font-mono ${metrics.balance >= 0 ? 'text-pink-600' : 'text-rose-500'}`}>
              {formatCurrency(metrics.balance)}
            </h3>
            <span className="text-[10px] text-pink-500 font-sans flex items-center gap-1 mt-1 font-semibold">
              ✓ Fluxo de Caixa saudável
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-pink-50 text-pink-600 flex items-center justify-center border border-pink-100 shr-0">
            <DollarSign size={18} />
          </div>
        </div>
      </div>

      {/* Ledger listing */}
      <div className="bg-white border border-slate-100 rounded-2xl shadow-xs overflow-hidden">
        {/* Ledger header and togglers */}
        <div className="p-4 border-b border-slate-50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs font-sans">
          <h3 className="font-bold text-slate-800 text-sm">Livro Razão / Extrato de Operações</h3>
          <div className="flex bg-slate-50 p-1 rounded-lg border border-slate-150 self-end sm:self-auto font-semibold">
            <button 
              onClick={() => setSelectedType('All')}
              className={`px-3 py-1.5 rounded-md transition-all cursor-pointer ${selectedType === 'All' ? 'bg-white text-slate-800 shadow-xs' : 'text-slate-400 hover:text-slate-600'}`}
            >
              Todos
            </button>
            <button 
              onClick={() => setSelectedType('Inflow')}
              className={`px-3 py-1.5 rounded-md transition-all cursor-pointer ${selectedType === 'Inflow' ? 'bg-white text-emerald-600 shadow-xs' : 'text-slate-400 hover:text-slate-600'}`}
            >
              Entradas
            </button>
            <button 
              onClick={() => setSelectedType('Outflow')}
              className={`px-3 py-1.5 rounded-md transition-all cursor-pointer ${selectedType === 'Outflow' ? 'bg-white text-rose-500 shadow-xs' : 'text-slate-400 hover:text-slate-600'}`}
            >
              Saídas
            </button>
          </div>
        </div>

        {/* Fast query filters */}
        <div className="p-4 bg-slate-50/55 border-b border-slate-50 text-xs font-sans">
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
              <Search size={14} />
            </span>
            <input 
              id="cashflow-search-input"
              type="text"
              placeholder="Filtrar lançamentos por descrição ou categoria (ex: Fornecedores, Aluguel)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-705 placeholder-slate-400 text-xs focus:outline-hidden focus:border-pink-500 transition-all font-medium"
            />
          </div>
        </div>

        {/* Ledger items list */}
        <div className="divide-y divide-slate-100 overflow-x-auto min-w-[500px]">
          {filteredTransactions.map(tx => {
            const isInflow = tx.type === 'Inflow';

            return (
              <div 
                key={tx.id}
                className="p-4 flex items-center justify-between text-xs font-sans hover:bg-slate-50/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  {/* Indicator Icon */}
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center border shrink-0 
                    ${isInflow 
                      ? 'bg-emerald-50 border-emerald-100 text-emerald-500' 
                      : 'bg-rose-50 border-rose-100 text-rose-500'}`}
                  >
                    {isInflow ? <ArrowUpRight size={14} /> : <ArrowDownLeft size={14} />}
                  </div>

                  <div>
                    <h5 className="font-semibold text-slate-800 leading-tight">{tx.description}</h5>
                    <div className="text-[10px] text-slate-400 font-normal mt-1 flex items-center gap-1.5">
                      <span className="bg-slate-100 px-1.5 py-0.5 rounded font-sans flex items-center gap-1 font-medium text-slate-600 uppercase tracking-wider text-[9px]">
                        <Tag size={9} /> {tx.category}
                      </span>
                      <span>•</span>
                      <span>Lançado em: {new Date(tx.date).toLocaleDateString('pt-BR')} {new Date(tx.date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </div>
                </div>

                <span className={`font-mono font-bold text-xs select-all text-right
                  ${isInflow ? 'text-emerald-600' : 'text-rose-500'}`}
                >
                  {isInflow ? '+' : '-'} {formatCurrency(tx.amount)}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Insert Flow entry Dialog Portal */}
      {isAddTxOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 transition-all">
          <div className="bg-white rounded-2xl max-w-sm w-full shadow-2xl border border-slate-50 overflow-hidden" id="add-tx-modal">
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <span className="font-bold text-xs tracking-wider uppercase font-sans">Lançar Nova Transação</span>
              <button 
                onClick={() => setIsAddTxOpen(false)}
                className="text-slate-400 hover:text-white transition-colors text-xs"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitTx} className="p-6 space-y-4 font-medium text-xs font-sans">
              <div className="space-y-1.5">
                <label className="text-slate-500 font-bold uppercase text-[9px] tracking-wide select-none">Tipo de Lançamento</label>
                <div className="flex bg-slate-50 p-1 border border-slate-200 rounded-lg">
                  <button 
                    type="button"
                    onClick={() => { setTxType('Inflow'); setTxCategory('Venda'); }}
                    className={`flex-1 py-1.5 rounded-md text-center transition-all cursor-pointer font-bold ${txType === 'Inflow' ? 'bg-white text-emerald-600 shadow-xs' : 'text-slate-400'}`}
                  >
                    Entrada (Receita)
                  </button>
                  <button 
                    type="button"
                    onClick={() => { setTxType('Outflow'); setTxCategory('Fornecedores'); }}
                    className={`flex-1 py-1.5 rounded-md text-center transition-all cursor-pointer font-bold ${txType === 'Outflow' ? 'bg-white text-rose-500 shadow-xs' : 'text-slate-400'}`}
                  >
                    Saída (Custo/Despesa)
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1 text-xs">
                  <label className="text-slate-500 font-bold uppercase text-[9px] tracking-wide select-none">Categoria</label>
                  {txType === 'Inflow' ? (
                    <select 
                      id="tx-category-inflow"
                      value={txCategory}
                      onChange={(e) => setTxCategory(e.target.value)}
                      className="w-full px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-bold focus:outline-hidden focus:border-pink-500"
                    >
                      <option value="Venda">Venda</option>
                      <option value="Aporte">Aporte Proprietário</option>
                      <option value="Outros">Outras Entradas</option>
                    </select>
                  ) : (
                    <select 
                      id="tx-category-outflow"
                      value={txCategory}
                      onChange={(e) => setTxCategory(e.target.value)}
                      className="w-full px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-bold focus:outline-hidden focus:border-pink-500"
                    >
                      <option value="Fornecedores">Fornecedores</option>
                      <option value="Aluguel">Aluguel / Condomínio</option>
                      <option value="Marketing">Marketing / Tráfego</option>
                      <option value="Salários">Salários de Equipe</option>
                      <option value="Impostos">Impostos / Tributos</option>
                      <option value="Outros">Outros Custos</option>
                    </select>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="text-slate-500 font-bold uppercase text-[9px] tracking-wide select-none">Valor (R$)</label>
                  <input 
                    id="tx-amount-input"
                    type="number"
                    step="0.01"
                    required
                    value={txAmount}
                    onChange={(e) => setTxAmount(Number(e.target.value))}
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-medium font-mono focus:outline-hidden focus:border-pink-500"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-500 font-bold uppercase text-[9px] tracking-wide select-none font-sans">Descrição do Lançamento</label>
                <input 
                  id="tx-desc-input"
                  type="text"
                  required
                  placeholder="Ex: Aquisição de embalagens personalizadas"
                  value={txDesc}
                  onChange={(e) => setTxDesc(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 placeholder-slate-400 font-normal focus:outline-hidden focus:border-pink-500"
                />
              </div>

              <div className="flex gap-2 pt-4">
                <button 
                  type="button" 
                  onClick={() => setIsAddTxOpen(false)}
                  className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl font-bold font-sans transition-all text-center"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-2 bg-pink-600 hover:bg-pink-700 text-white rounded-xl font-bold font-sans transition-all text-center shadow-md shadow-pink-500/10"
                >
                  Lançar fluxo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
