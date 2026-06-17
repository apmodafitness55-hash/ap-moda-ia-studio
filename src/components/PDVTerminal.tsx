/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Trash2, 
  Plus, 
  Minus, 
  ShoppingCart, 
  User, 
  Tag, 
  CheckCircle,
  HelpCircle,
  TrendingDown,
  Instagram,
  Laptop,
  Store,
  MessageCircle,
  Compass,
  FileText,
  DollarSign,
  Printer
} from 'lucide-react';
import { Product, SaleItem, Sale, Client, SalesChannel, ActiveTab } from '../types';
import ThermalReceipt from './ThermalReceipt';

interface PDVTerminalProps {
  products: Product[];
  clients: Client[];
  onAddSale: (sale: Sale) => void;
  onAddClient: (client: Client) => void;
  setActiveTab: (tab: ActiveTab) => void;
  sellers?: string[];
}

export default function PDVTerminal({ products, clients, onAddSale, onAddClient, setActiveTab, sellers = [] }: PDVTerminalProps) {
  const [selectedClientName, setSelectedClientName] = useState<string>('Maria Silva');
  const [selectedChannel, setSelectedChannel] = useState<SalesChannel>('Instagram');
  const [cart, setCart] = useState<{ product: Product; quantity: number }[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');
  const [npsScore, setNpsScore] = useState<number>(10);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState<boolean>(false);
  const [isThermalReceiptOpen, setIsThermalReceiptOpen] = useState<boolean>(false);
  const [createdReceipt, setCreatedReceipt] = useState<Sale | null>(null);
  
  // Real seller listing
  const salespersonList = useMemo(() => {
    return sellers.length > 0 ? sellers : ['Ana Carolina', 'Beatriz Rocha', 'Juliana Costa', 'Bruna Oliveira'];
  }, [sellers]);

  const [selectedSalesperson, setSelectedSalesperson] = useState<string>(salespersonList[0] || 'Ana Carolina');

  // Quick Add Client states
  const [isQuickAddOpen, setIsQuickAddOpen] = useState<boolean>(false);
  const [quickPhone, setQuickPhone] = useState<string>('');
  const [quickEmail, setQuickEmail] = useState<string>('');
  const [quickCpf, setQuickCpf] = useState<string>('');
  const [isHistoryPanelOpen, setIsHistoryPanelOpen] = useState<boolean>(false);

  // Discount states
  const [discountPercent, setDiscountPercent] = useState<number>(0);
  const [discountValue, setDiscountValue] = useState<number>(0);
  const [couponCode, setCouponCode] = useState<string>('');
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; percent: number } | null>(null);
  const [pixDiscountPercent, setPixDiscountPercent] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('ap_pdv_pix_discount');
      if (saved) {
        const parsed = parseFloat(saved);
        if (!isNaN(parsed) && parsed >= 0) return parsed;
      }
    } catch (e) {}
    return 5; // default to 5%
  });

  const handlePixDiscountPercentChange = (newVal: number) => {
    setPixDiscountPercent(newVal);
    localStorage.setItem('ap_pdv_pix_discount', newVal.toString());
  };

  // Combination of payment methods states
  const [payments, setPayments] = useState<{ method: string; amount: number }[]>([
    { method: 'PIX', amount: 0 }
  ]);

  // Synchronize payment total automatically if only 1 method is present
  const cartTotal = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  }, [cart]);

  const cartCostTotal = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.product.cost * item.quantity, 0);
  }, [cart]);

  const getPartners = (): any[] => {
    const saved = localStorage.getItem('ap_moda_partners');
    return saved ? JSON.parse(saved) : [
      { id: 'part-1', name: 'Marina Fitness Coach', instagram: '@marina_fit', couponCode: 'MARINAFIT10', commissionRate: 10, salesCount: 15, totalGenerated: 4250.00 },
      { id: 'part-2', name: 'Julia Rezende', instagram: '@jurezendedm', couponCode: 'JU10', commissionRate: 8, salesCount: 8, totalGenerated: 1890.00 },
      { id: 'part-3', name: 'Amanda Runner', instagram: '@amandarun', couponCode: 'AMANDAPRO', commissionRate: 12, salesCount: 22, totalGenerated: 6200.00 }
    ];
  };

  const handleApplyCoupon = () => {
    if (!couponCode.trim()) return;
    const codeUpper = couponCode.trim().toUpperCase();
    const partners = getPartners();
    const partnerWithCoupon = partners.find(p => p.couponCode.toUpperCase() === codeUpper);
    
    if (partnerWithCoupon) {
      const disc = codeUpper.includes('20') ? 20 : codeUpper.includes('15') ? 15 : 10;
      setAppliedCoupon({ code: codeUpper, percent: disc });
      alert(`Cupom ${codeUpper} de ${partnerWithCoupon.name} aplicado com sucesso! Desconto de ${disc}% concedido.`);
    } else {
      alert('Cupom de parceiro não encontrado ou expirado.');
    }
  };

  const hasPixDiscount = useMemo(() => {
    return payments.some(p => p.method === 'PIX');
  }, [payments]);

  const totalDiscounts = useMemo(() => {
    let sumDiscounts = 0;
    if (discountPercent > 0) {
      sumDiscounts += cartTotal * (discountPercent / 100);
    }
    if (discountValue > 0) {
      sumDiscounts += discountValue;
    }
    if (appliedCoupon) {
      sumDiscounts += cartTotal * (appliedCoupon.percent / 100);
    }
    if (hasPixDiscount) {
      sumDiscounts += cartTotal * (pixDiscountPercent / 100);
    }
    return Math.min(sumDiscounts, cartTotal);
  }, [cartTotal, discountPercent, discountValue, appliedCoupon, hasPixDiscount, pixDiscountPercent]);

  const finalCartTotal = useMemo(() => {
    return Math.max(0, cartTotal - totalDiscounts);
  }, [cartTotal, totalDiscounts]);

  React.useEffect(() => {
    if (payments.length === 1) {
      setPayments([{ method: payments[0].method, amount: Number(finalCartTotal.toFixed(2)) }]);
    }
  }, [finalCartTotal, payments.length]);

  const paymentsTotalSum = useMemo(() => {
    return payments.reduce((sum, p) => sum + Number(p.amount || 0), 0);
  }, [payments]);

  const isPaymentValid = useMemo(() => {
    return Math.abs(paymentsTotalSum - finalCartTotal) < 0.02;
  }, [paymentsTotalSum, finalCartTotal]);

  const addPaymentRow = () => {
    const left = Math.max(0, finalCartTotal - paymentsTotalSum);
    const availableMethods = ['PIX', 'Dinheiro', 'Cartão de Crédito', 'Cartão de Débito', 'Boleto Bancário', 'Crediário'];
    const usedMethods = payments.map(p => p.method);
    const nextMethod = availableMethods.find(m => !usedMethods.includes(m)) || 'Dinheiro';
    setPayments(prev => [...prev, { method: nextMethod, amount: Number(left.toFixed(2)) }]);
  };

  const removePaymentRow = (index: number) => {
    if (payments.length <= 1) return;
    const removedAmount = payments[index].amount;
    const filtered = payments.filter((_, idx) => idx !== index);
    if (filtered.length > 0) {
      filtered[0].amount = Number((filtered[0].amount + removedAmount).toFixed(2));
    }
    setPayments(filtered);
  };

  const updatePaymentRow = (index: number, fields: Partial<{ method: string; amount: number }>) => {
    setPayments(prev => prev.map((p, idx) => idx === index ? { ...p, ...fields } : p));
  };

  const autoBalancePayments = () => {
    if (payments.length === 0) return;
    const sumExceptLast = payments.slice(0, -1).reduce((sum, p) => sum + Number(p.amount || 0), 0);
    const target = Math.max(0, finalCartTotal - sumExceptLast);
    setPayments(prev => {
      const updated = [...prev];
      if (updated.length > 0) {
        updated[updated.length - 1].amount = Number(target.toFixed(2));
      }
      return updated;
    });
  };

  const selectedClientHistory = useMemo(() => {
    if (!selectedClientName.trim()) return [];
    try {
      const saved = localStorage.getItem('ap_moda_sales');
      const allSales: Sale[] = saved ? JSON.parse(saved) : [];
      return allSales.filter(s => s.clientName.toLowerCase() === selectedClientName.trim().toLowerCase());
    } catch (e) {
      return [];
    }
  }, [selectedClientName, cart]);

  const handleQuickAddClient = () => {
    if (!selectedClientName.trim()) {
      alert("Por favor, digite o nome completo da cliente antes de salvar.");
      return;
    }
    const exists = clients.find(c => 
      c.name.toLowerCase() === selectedClientName.trim().toLowerCase() ||
      (quickCpf.trim() && c.cpf && c.cpf.replace(/\D/g, '') === quickCpf.trim().replace(/\D/g, ''))
    );
    if (exists) {
      alert(`A cliente "${selectedClientName}" ou o CPF informado já consta no sistema.`);
      setIsQuickAddOpen(false);
      return;
    }
    const newClient: Client = {
      id: `cli-${Date.now()}`,
      name: selectedClientName.trim(),
      email: quickEmail.trim() || `${selectedClientName.toLowerCase().replace(/\s+/g, '')}@exemplo.com`,
      phone: quickPhone.trim() || '(11) 99999-0000',
      cpf: quickCpf.trim() || undefined,
      channel: selectedChannel,
      npsScore: npsScore,
      totalSpent: 0,
      ordersCount: 0,
      createdAt: new Date().toISOString()
    };
    onAddClient(newClient);
    setIsQuickAddOpen(false);
    setQuickPhone('');
    setQuickEmail('');
    setQuickCpf('');
    alert(`⚡ Cliente "${selectedClientName.trim()}" cadastrada no sistema!`);
  };

  // Extract categories dynamically
  const categories = useMemo(() => {
    const list = new Set(products.map(p => p.category).filter(Boolean));
    return ['Todos', ...Array.from(list)];
  }, [products]);

  // Filter products by search query and category
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesSearch = 
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.sku.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'Todos' || p.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [products, searchQuery, selectedCategory]);

  const addToCart = (product: Product) => {
    if (product.stock <= 0) {
      alert(`O produto "${product.name}" está temporariamente esgotado! Recarregue o estoque no menu "Catálogo & Estoque".`);
      return;
    }

    setCart(prev => {
      const idx = prev.findIndex(item => item.product.id === product.id);
      if (idx > -1) {
        const currentQty = prev[idx].quantity;
        if (currentQty >= product.stock) {
          alert(`Você atingiu o limite de estoque disponível (${product.stock} peças) para este produto.`);
          return prev;
        }
        const updated = [...prev];
        updated[idx] = { ...updated[idx], quantity: currentQty + 1 };
        return updated;
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const updateQuantity = (productId: string, amount: number) => {
    setCart(prev => {
      const idx = prev.findIndex(item => item.product.id === productId);
      if (idx === -1) return prev;

      const currentQty = prev[idx].quantity;
      const targetQty = currentQty + amount;

      if (targetQty <= 0) {
        return prev.filter(item => item.product.id !== productId);
      }

      if (targetQty > prev[idx].product.stock) {
        alert(`Não é possível vender mais peças. Carga limite de estoque: ${prev[idx].product.stock}`);
        return prev;
      }

      const updated = [...prev];
      updated[idx] = { ...updated[idx], quantity: targetQty };
      return updated;
    });
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.product.id !== productId));
  };

  const handleCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) {
      alert('Seu carrinho de compras está vazio! Adicione peças fitness femininas antes de processar.');
      return;
    }

    if (!isPaymentValid) {
      alert(`Erro: A soma das formas de pagamento (${formatCurrency(paymentsTotalSum)}) deve ser exatamente igual ao total da venda (${formatCurrency(finalCartTotal)}).`);
      return;
    }

    // Prepare Sale items
    const saleItems: SaleItem[] = cart.map(item => ({
      productId: item.product.id,
      name: item.product.name,
      quantity: item.quantity,
      price: item.product.price,
      cost: item.product.cost
    }));

    // Find custom or existing client (by name or CPF)
    let finalClientName = selectedClientName.trim() || 'Cliente Avulso';
    let clientExists = clients.find(c => 
      c.name.toLowerCase() === finalClientName.toLowerCase() ||
      (c.cpf && c.cpf.replace(/\D/g, '') === finalClientName.replace(/\D/g, ''))
    );

    if (clientExists) {
      finalClientName = clientExists.name;
      // update stats
      clientExists.totalSpent = (clientExists.totalSpent || 0) + finalCartTotal;
      clientExists.ordersCount = (clientExists.ordersCount || 0) + 1;
    } else {
      // Create client inline!
      const isCpfText = /^\d[\d.\-/]+$/.test(finalClientName);
      const newClient: Client = {
        id: `cli-${Date.now()}`,
        name: isCpfText ? `Cliente CPF ${finalClientName}` : finalClientName,
        email: `${(isCpfText ? `cpf-${finalClientName}` : finalClientName).toLowerCase().replace(/[^a-z0-9]/g, '')}@exemplo.com`,
        phone: '(11) 99999-0000',
        cpf: isCpfText ? finalClientName : undefined,
        channel: selectedChannel,
        npsScore: npsScore,
        totalSpent: finalCartTotal,
        ordersCount: 1,
        createdAt: new Date().toISOString()
      };
      onAddClient(newClient);
      finalClientName = newClient.name;
    }

    const newSale: Sale = {
      id: `v-00${Date.now().toString().slice(-3)}`,
      clientName: finalClientName,
      channel: selectedChannel,
      items: saleItems,
      total: finalCartTotal,
      costTotal: cartCostTotal,
      status: 'Concluída',
      createdAt: new Date().toISOString(),
      payments: payments,
      salesperson: selectedSalesperson !== 'Sem Vendedor' ? selectedSalesperson : undefined
    };

    onAddSale(newSale);
    setCreatedReceipt(newSale);
    setCart([]);
    setDiscountPercent(0);
    setDiscountValue(0);
    setCouponCode('');
    setAppliedCoupon(null);
    setPayments([{ method: 'PIX', amount: 0 }]); // Reset payment methods
    setIsSuccessModalOpen(true);
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h2 className="text-2xl font-bold font-sans text-slate-800 tracking-tight">PDV (Ponto de Venda)</h2>
        <p className="text-slate-400 text-sm">Registre rapidamente as vendas efetuadas presencialmente ou por canais digitais</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Fitwear Selection List (Left Column 2-span) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-xs space-y-3">
            {/* Search and Filters */}
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                <Search size={16} />
              </span>
              <input 
                id="pdv-search-input"
                type="text"
                placeholder="Filtrar por nome, categoria ou código SKU da peça..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-150 rounded-xl text-xs font-sans text-slate-700 placeholder-slate-400 focus:outline-hidden focus:border-pink-500 focus:ring-1 focus:ring-pink-500 transition-all"
              />
            </div>

            {/* Category Filter Pills inside PDV */}
            <div className="flex flex-wrap gap-1.5 pt-2 border-t border-slate-50">
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  id={`pdv-pill-cat-${cat}`}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-bold font-sans transition-all cursor-pointer
                    ${selectedCategory === cat 
                      ? 'bg-pink-600 text-white shadow-xs shadow-pink-500/10' 
                      : 'bg-slate-50 text-slate-550 hover:bg-slate-100 border border-slate-100'}`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Grid Products list */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4" id="pdv-products-grid">
            {filteredProducts.map((p) => {
              const isLowStock = p.stock < p.minStock;
              const isOutOfStock = p.stock === 0;

              return (
                <div 
                  key={p.id}
                  onClick={() => !isOutOfStock && addToCart(p)}
                  className={`bg-white border border-slate-100 rounded-2xl overflow-hidden p-3.5 flex flex-col justify-between shadow-xs hover:shadow-md transition-all cursor-pointer group
                    ${isOutOfStock ? 'opacity-65 select-none bg-slate-50/50' : 'hover:border-pink-200'}`}
                >
                  <div className="relative h-32 rounded-xl overflow-hidden bg-slate-50 border border-slate-100 mb-3">
                    <img 
                      src={p.image} 
                      alt={p.name} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-xs px-2 py-0.5 rounded-full text-[9px] font-bold text-slate-600 font-sans border border-slate-100">
                      {p.category}
                    </div>
                    {isOutOfStock ? (
                      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-3xs flex items-center justify-center">
                        <span className="bg-rose-500 text-white font-sans font-bold text-[9px] uppercase px-2 py-1 rounded-md tracking-wider">
                          Esgotado
                        </span>
                      </div>
                    ) : isLowStock && (
                      <div className="absolute bottom-2 left-2 bg-amber-500 text-white font-sans font-bold text-[9px] px-1.5 py-0.5 rounded flex items-center gap-1">
                        Pouco Estoque
                      </div>
                    )}
                  </div>

                  <div>
                    <h4 className="font-semibold text-xs text-slate-700 leading-tight group-hover:text-pink-600 transition-colors line-clamp-1">{p.name}</h4>
                    <p className="text-[10px] text-slate-400 font-mono mt-1">SKU: {p.sku}</p>

                    <div className="flex items-center justify-between mt-3">
                      <div>
                        <span className="text-[10px] text-slate-400 block">Preço</span>
                        <span className="text-slate-850 font-bold font-mono text-sm">{formatCurrency(p.price)}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-slate-400 block">Estoque</span>
                        <span className={`font-mono text-xs font-bold ${isOutOfStock ? 'text-rose-500' : isLowStock ? 'text-amber-500' : 'text-slate-600'}`}>
                          {p.stock} peças
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* PDV Cart Sidebar (Right Column 1-span) */}
        <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-4 md:p-5 flex flex-col justify-between max-h-[80vh] sticky top-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <ShoppingCart size={18} className="text-pink-600" />
              <h3 className="text-sm font-bold text-slate-800">Carrinho</h3>
            </div>
            <span className="bg-slate-100 text-slate-600 font-bold font-mono px-2 py-0.5 rounded-full text-[10px]">
              {cart.reduce((sum, item) => sum + item.quantity, 0)} itens
            </span>
          </div>

          {/* Cart items scroll list */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-50 my-4 max-h-[40vh] pr-1">
            {cart.length === 0 ? (
              <div className="py-12 text-center text-slate-400 flex flex-col items-center justify-center gap-2">
                <ShoppingCart size={32} className="text-slate-200 stroke-1" />
                <p className="text-xs font-sans max-w-[180px]">Clique nas peças fitness ao lado para montar a venda</p>
              </div>
            ) : (
              cart.map((item) => (
                <div key={item.product.id} className="py-2.5 flex items-center justify-between gap-3 text-xs font-sans">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-700 leading-tight truncate">{item.product.name}</p>
                    <p className="text-[10px] text-pink-600 font-bold font-mono mt-0.5">{formatCurrency(item.product.price)}</p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button 
                      onClick={() => updateQuantity(item.product.id, -1)}
                      className="p-1 rounded bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-600 transition-colors cursor-pointer"
                    >
                      <Minus size={10} />
                    </button>
                    <span className="font-mono font-bold text-slate-800 w-5 text-center">{item.quantity}</span>
                    <button 
                      onClick={() => updateQuantity(item.product.id, 1)}
                      className="p-1 rounded bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-600 transition-colors cursor-pointer"
                    >
                      <Plus size={10} />
                    </button>
                    <button 
                      onClick={() => removeFromCart(item.product.id)}
                      className="p-1 text-slate-400 hover:text-rose-500 rounded transition-colors ml-1 cursor-pointer"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Customer & Channel details configuration forms */}
          <form onSubmit={handleCheckout} className="space-y-4 border-t border-slate-100 pt-4">
            {/* Customer select / field */}
            <div className="space-y-1.5 text-xs font-sans">
              <div className="flex items-center justify-between">
                <label className="text-slate-400 font-bold uppercase tracking-wider text-[9px] flex items-center gap-1 select-none">
                  <User size={10} /> Nome da Cliente
                </label>
                <div className="flex gap-2">
                  {selectedClientHistory.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setIsHistoryPanelOpen(!isHistoryPanelOpen)}
                      className="text-[9px] font-bold text-pink-600 hover:text-pink-700 bg-pink-50 hover:bg-pink-100 px-1.5 py-0.5 rounded cursor-pointer transition border-none"
                    >
                      {isHistoryPanelOpen ? '✕ Ocultar Histórico' : `📖 Histórico (${selectedClientHistory.length})`}
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setIsQuickAddOpen(!isQuickAddOpen)}
                    className="text-[9px] font-bold text-slate-500 hover:text-pink-600 bg-slate-100 hover:bg-pink-50 px-1.5 py-0.5 rounded cursor-pointer transition border-none"
                  >
                    {isQuickAddOpen ? '✕ Fechar' : '⚡ Cadastro Rápido'}
                  </button>
                </div>
              </div>

              <div className="flex gap-1">
                <input 
                  id="pdv-client-input"
                  type="text"
                  list="pdv-clients-list"
                  required
                  value={selectedClientName}
                  onChange={(e) => {
                    const typed = e.target.value;
                    setSelectedClientName(typed);
                    if (isHistoryPanelOpen) setIsHistoryPanelOpen(false);
                    
                    // Match auto-resolve from CPF or Name
                    const cleanTyped = typed.replace(/\D/g, '');
                    const foundByCpfOrName = clients.find(c => 
                      (cleanTyped && c.cpf && c.cpf.replace(/\D/g, '') === cleanTyped) ||
                      (c.name.toLowerCase() === typed.trim().toLowerCase())
                    );
                    if (foundByCpfOrName) {
                      setSelectedClientName(foundByCpfOrName.name);
                    }
                  }}
                  placeholder="Busque por CPF ou Nome da cliente..."
                  className="flex-1 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-sans text-slate-700 placeholder-slate-400 focus:outline-none focus:border-pink-500 transition-all font-medium"
                />
              </div>

              <datalist id="pdv-clients-list">
                {clients.map(c => (
                  <option key={c.id} value={c.name}>
                    {c.cpf ? `CPF: ${c.cpf}` : 'Sem CPF'}
                  </option>
                ))}
                {clients.filter(c => c.cpf).map(c => (
                  <option key={`cpf-opt-${c.id}`} value={c.cpf}>
                    {c.name}
                  </option>
                ))}
              </datalist>

              {/* QUICK ADD COLLAPSIBLE FORM CARD */}
              {isQuickAddOpen && (
                <div className="p-3 bg-pink-50/50 border border-pink-100 rounded-xl space-y-2 mt-1 animate-fadeIn font-sans">
                  <span className="text-[10px] font-extrabold text-pink-600 uppercase block tracking-wider">⚡ Cadastro Rápido de Cliente</span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <div className="space-y-1 font-sans">
                      <label className="text-[9px] font-bold text-slate-500 uppercase block">CPF do Cliente</label>
                      <input 
                        type="text"
                        placeholder="000.000.000-00"
                        value={quickCpf}
                        onChange={(e) => setQuickCpf(e.target.value)}
                        className="w-full px-2 py-1 bg-white border border-slate-200 rounded text-[10px] focus:outline-none focus:border-pink-500 font-mono text-slate-700"
                      />
                    </div>
                    <div className="space-y-1 font-sans">
                      <label className="text-[9px] font-bold text-slate-500 uppercase block">Telefone / WhatsApp</label>
                      <input 
                        type="text"
                        placeholder="(11) 99999-0000"
                        value={quickPhone}
                        onChange={(e) => setQuickPhone(e.target.value)}
                        className="w-full px-2 py-1 bg-white border border-slate-200 rounded text-[10px] focus:outline-none focus:border-pink-500 font-mono text-slate-700"
                      />
                    </div>
                    <div className="space-y-1 font-sans">
                      <label className="text-[9px] font-bold text-slate-500 uppercase block">E-mail</label>
                      <input 
                        type="email"
                        placeholder="cliente@exemplo.com"
                        value={quickEmail}
                        onChange={(e) => setQuickEmail(e.target.value)}
                        className="w-full px-2 py-1 bg-white border border-slate-200 rounded text-[10px] focus:outline-none focus:border-pink-500 font-mono text-slate-700"
                      />
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleQuickAddClient}
                    className="w-full py-1.5 bg-pink-600 hover:bg-pink-700 text-white font-extrabold text-[10px] uppercase rounded transition tracking-wider shadow-sm cursor-pointer border-none font-sans"
                  >
                    Salvar Novo Cadastro
                  </button>
                </div>
              )}

              {/* PAST PURCHASES HISTORY PANEL CARD */}
              {isHistoryPanelOpen && selectedClientHistory.length > 0 && (
                <div className="p-3 bg-purple-50/70 border border-purple-100 rounded-xl space-y-2.5 mt-1 font-sans max-h-40 overflow-y-auto scrollbar-thin">
                  <div className="flex items-center justify-between border-b border-purple-200/55 pb-1 font-sans">
                    <span className="text-[10px] font-extrabold text-purple-700 uppercase tracking-widest block flex items-center gap-1 font-sans">
                      📖 Histórico de {selectedClientName}
                    </span>
                    <span className="text-[10px] font-bold text-purple-600 font-sans">
                      Total Comprado: {formatCurrency(selectedClientHistory.reduce((s, o) => s + o.total, 0))}
                    </span>
                  </div>

                  <div className="space-y-1.5 font-sans">
                    {selectedClientHistory.map((sale, sIdx) => (
                      <div key={sIdx} className="text-[10px] bg-white border border-purple-100/50 rounded p-1.5 leading-tight shadow-2xs font-sans">
                        <div className="flex items-center justify-between text-slate-500 font-semibold text-[9px] mb-1 font-sans">
                          <span>Ref: {sale.id}</span>
                          <span>{new Date(sale.createdAt).toLocaleDateString('pt-BR')}</span>
                        </div>
                        <div className="text-slate-700 font-medium font-sans">
                          {sale.items.map(item => `${item.quantity}x ${item.name}`).join(', ')}
                        </div>
                        <div className="text-right text-pink-600 font-extrabold text-[10.5px] mt-0.5 font-mono">
                          Total Pago: {formatCurrency(sale.total)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Vendedora / Commission attribution */}
            <div className="space-y-1.5 text-xs font-sans">
              <label className="text-slate-400 font-bold uppercase tracking-wider text-[9px] flex items-center gap-1 select-none font-sans">
                <User size={10} /> Vendedora Responsável
              </label>
              <select 
                id="pdv-salesperson-select"
                value={selectedSalesperson}
                onChange={(e) => setSelectedSalesperson(e.target.value)}
                className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-sans text-slate-700 focus:outline-hidden focus:border-pink-500 transition-all font-medium cursor-pointer"
              >
                {salespersonList.map(name => (
                  <option key={name} value={name}>{name}</option>
                ))}
                <option value="Sem Vendedor">Sem Vendedora (Faturamento Direto)</option>
              </select>
            </div>

            {/* Sales Channel and NPS score (if new customer) */}
            <div className="grid grid-cols-2 gap-3 text-xs font-sans">
              <div className="space-y-1.5">
                <label className="text-slate-400 font-bold uppercase tracking-wider text-[9px] flex items-center gap-1 select-none">
                  <Tag size={10} /> Canal de Origem
                </label>
                <select 
                  id="pdv-channel-select"
                  value={selectedChannel}
                  onChange={(e) => setSelectedChannel(e.target.value as SalesChannel)}
                  className="w-full px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-sans text-slate-700 focus:outline-hidden focus:border-pink-500 transition-all font-medium"
                >
                  <option value="Instagram">Instagram</option>
                  <option value="WhatsApp">WhatsApp</option>
                  <option value="E-commerce">E-commerce</option>
                  <option value="Loja Física">Loja Física</option>
                  <option value="Outros">Outros</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-400 font-bold uppercase tracking-wider text-[9px] flex items-center gap-0.5 select-none">
                  Score de NPS
                </label>
                <select
                  id="pdv-nps-select"
                  value={npsScore}
                  onChange={(e) => setNpsScore(Number(e.target.value))}
                  className="w-full px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-sans text-slate-700 focus:outline-hidden focus:border-pink-500 transition-all font-medium"
                >
                  {[10, 9, 8, 7, 6, 5, 4, 3, 2, 1].map(n => <option key={n} value={n}>{n}</option>)}
                </select>
              </div>
            </div>

            {/* Formas de Pagamento Combinadas */}
            <div className="space-y-2.5 text-xs font-sans border-t border-slate-100 pt-3">
              <div className="flex items-center justify-between">
                <label className="text-slate-400 font-bold uppercase tracking-wider text-[9px] flex items-center gap-1 select-none">
                  <DollarSign size={10} /> Forma de Pagamento (Combinação)
                </label>
                <button
                  type="button"
                  id="add-payment-method-row-btn"
                  onClick={addPaymentRow}
                  className="text-pink-600 hover:text-pink-700 font-bold text-[10px] flex items-center gap-1 cursor-pointer"
                >
                  <Plus size={10} /> Adicionar Forma
                </button>
              </div>

              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {payments.map((p, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <select
                      value={p.method}
                      onChange={(e) => updatePaymentRow(idx, { method: e.target.value })}
                      className="flex-1 px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-sans text-slate-700 focus:outline-hidden focus:border-pink-500 font-medium"
                    >
                      <option value="PIX">PIX</option>
                      <option value="Dinheiro">Dinheiro</option>
                      <option value="Cartão de Crédito">Cartão de Crédito</option>
                      <option value="Cartão de Débito">Cartão de Débito</option>
                      <option value="Boleto Bancário">Boleto Bancário</option>
                      <option value="Crediário">Crediário</option>
                    </select>

                    <div className="relative w-28 shrink-0">
                      <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-[10px] font-mono">R$</span>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={p.amount || ''}
                        placeholder="0.00"
                        onChange={(e) => updatePaymentRow(idx, { amount: parseFloat(e.target.value) || 0 })}
                        className="w-full pl-7 pr-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono text-slate-750 font-bold focus:outline-hidden focus:border-pink-500"
                      />
                    </div>

                    {payments.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removePaymentRow(idx)}
                        className="p-1 px-2 text-rose-500 hover:bg-rose-50 rounded transition-colors cursor-pointer"
                        title="Remover forma de pagamento"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {/* Validation helper status block */}
              {payments.length > 1 && (
                <div className={`p-2 rounded-lg text-[10px] font-medium flex items-center justify-between gap-2 border font-sans ${isPaymentValid ? 'bg-emerald-50 border-emerald-100 text-emerald-700' : 'bg-amber-50 border-amber-100 text-amber-700'}`}>
                  <div>
                    {isPaymentValid ? (
                      <span className="font-bold flex items-center gap-1">✓ Valor Total Combinado!</span>
                    ) : (
                      <div className="leading-tight">
                        <span className="font-bold">Atenção:</span> Soma (R$ {paymentsTotalSum.toFixed(2)}) ≠ Total (R$ {finalCartTotal.toFixed(2)}).{' '}
                        {paymentsTotalSum < finalCartTotal ? (
                          <span>Falta: <strong className="font-mono">R$ {(finalCartTotal - paymentsTotalSum).toFixed(2)}</strong></span>
                        ) : (
                          <span>Excedeu: <strong className="font-mono">R$ {(paymentsTotalSum - finalCartTotal).toFixed(2)}</strong></span>
                        )}
                      </div>
                    )}
                  </div>
                  {!isPaymentValid && (
                    <button
                      type="button"
                      onClick={autoBalancePayments}
                      className="px-1.5 py-0.5 bg-white border border-amber-200 hover:border-pink-300 text-pink-600 rounded text-[9px] font-bold shadow-2xs font-sans transition-all cursor-pointer"
                    >
                      Ajustar Último
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* SECTION: Descontos & Parcerias */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-sans space-y-2.5 mt-2">
              <div className="flex items-center justify-between border-b border-slate-150 pb-1.5">
                <span className="font-bold text-slate-700 tracking-wide">Descontos & Parcerias</span>
                <span className="text-[10px] text-pink-600 font-bold bg-pink-50 px-1.5 py-0.5 rounded">PDV Inteligente</span>
              </div>

              {/* Percent and Cash discounts fields */}
              <div className="grid grid-cols-2 gap-2 font-sans">
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-slate-500 uppercase block">Desconto (%)</label>
                  <div className="relative">
                    <input 
                      type="number"
                      min="0"
                      max="100"
                      value={discountPercent || ''}
                      onChange={(e) => {
                        setDiscountPercent(Number(e.target.value));
                        setDiscountValue(0); 
                      }}
                      className="w-full pl-2 pr-6 py-1 bg-white border border-slate-200 rounded text-slate-700 focus:outline-hidden focus:border-pink-500 font-mono text-[11px]"
                      placeholder="0"
                    />
                    <span className="absolute right-2 top-1 text-[10px] text-slate-400 font-bold">%</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-slate-500 uppercase block">Desconto (R$)</label>
                  <div className="relative font-sans">
                    <input 
                      type="number"
                      min="0"
                      value={discountValue || ''}
                      onChange={(e) => {
                        setDiscountValue(Number(e.target.value));
                        setDiscountPercent(0); 
                      }}
                      className="w-full pl-6 pr-2 py-1 bg-white border border-slate-200 rounded text-slate-700 focus:outline-hidden focus:border-pink-500 font-mono text-[11px]"
                      placeholder="0.00"
                    />
                    <span className="absolute left-2 top-1 text-[10px] text-slate-400 font-bold font-sans">R$</span>
                  </div>
                </div>
              </div>

              {/* Partner Coupons */}
              <div className="space-y-1 font-sans">
                <label className="text-[9px] font-bold text-slate-500 uppercase block">Cupom de Parceiro</label>
                <div className="flex gap-1.5 font-sans">
                  <input 
                    type="text"
                    placeholder="Ex: MARINAFIT10"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    className="flex-1 px-2 py-1 bg-white border border-slate-200 rounded text-slate-700 focus:outline-hidden focus:border-pink-500 font-mono text-[10px] uppercase"
                  />
                  <button
                    type="button"
                    onClick={handleApplyCoupon}
                    className="px-2.5 py-1 bg-pink-100 hover:bg-pink-200 hover:text-pink-700 text-pink-600 rounded font-bold text-[10px] transition cursor-pointer border-none font-sans"
                  >
                    Validar
                  </button>
                </div>
                {appliedCoupon && (
                  <div className="flex items-center justify-between bg-emerald-50 border border-emerald-100 rounded p-1 text-[10px] text-emerald-700 font-medium">
                    <span>Cupom <strong>{appliedCoupon.code}</strong> ativo (-{appliedCoupon.percent}%)</span>
                    <button 
                      type="button" 
                      onClick={() => setAppliedCoupon(null)}
                      className="text-emerald-500 hover:text-rose-600 font-bold cursor-pointer transition border-none bg-transparent"
                    >
                      Remover
                    </button>
                  </div>
                )}
              </div>

              {/* Automated Payment-based discounts displays */}
              {hasPixDiscount && (
                <div className="bg-pink-50 border border-pink-200/60 rounded-xl p-2.5 text-[10px] text-pink-700 font-semibold space-y-1.5 font-sans">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1">✨ Desconto Automático PIX Ativo</span>
                    <span className="font-mono text-[10.5px] font-extrabold text-pink-800">
                      -{formatCurrency(cartTotal * (pixDiscountPercent / 100))}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 justify-end">
                    <span className="text-[8.5px] text-pink-600 font-bold uppercase tracking-wide">Desconto Pix (%):</span>
                    <div className="flex items-center bg-white border border-pink-300 rounded-md shadow-2xs overflow-hidden w-16">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={pixDiscountPercent}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value);
                          handlePixDiscountPercentChange(isNaN(val) ? 0 : val);
                        }}
                        className="w-full text-center text-xs font-mono font-bold text-pink-700 py-0.5 border-none outline-none focus:ring-0 bg-transparent"
                      />
                      <span className="text-[9px] font-bold text-slate-400 pr-1 select-none">%</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Price values and Checkout action */}
            <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 text-xs font-sans space-y-1.5 font-mono mt-2">
              <div className="flex justify-between text-slate-450 text-[11px]">
                <span>Faturamento Bruto</span>
                <span>{formatCurrency(cartTotal)}</span>
              </div>
              
              {totalDiscounts > 0 && (
                <div className="flex justify-between text-rose-500 text-[11px] font-medium">
                  <span>(-) Total Descontos</span>
                  <span>-{formatCurrency(totalDiscounts)}</span>
                </div>
              )}

              <div className="flex justify-between text-slate-750 font-bold border-t border-slate-150 pt-1.5 text-xs">
                <span className="font-sans text-xs">Total Líquido</span>
                <span className="text-sm font-extrabold text-pink-600">{formatCurrency(finalCartTotal)}</span>
              </div>
            </div>

            <button 
              id="pdv-checkout-btn"
              type="submit"
              disabled={cart.length === 0 || !isPaymentValid}
              className={`w-full py-2.5 font-sans font-bold text-white text-xs rounded-xl transition-all cursor-pointer shadow-md text-center flex items-center justify-center gap-2
                ${(cart.length === 0 || !isPaymentValid) 
                  ? 'bg-slate-300 shadow-none cursor-not-allowed text-slate-500' 
                  : 'bg-pink-600 hover:bg-pink-700 shadow-pink-500/10'}`}
            >
              <span>Concluir Venda</span>
            </button>
          </form>
        </div>
      </div>

      {/* Sale Success Modal Recibo print */}
      {isSuccessModalOpen && createdReceipt && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 transition-all">
          <div className="bg-white rounded-2xl max-w-sm w-full shadow-2xl border border-slate-150 overflow-hidden text-center p-6 space-y-4">
            <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center mx-auto text-xl">
              ✓
            </div>
            <div>
              <h4 className="font-bold font-sans text-slate-800 text-sm">Venda Realizada com Sucesso!</h4>
              <p className="text-slate-400 text-xs mt-1">Os estoques foram subtraídos e o painel faturamento foi atualizado.</p>
            </div>

            <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 text-xs font-sans font-mono space-y-1">
              <p className="text-[10px] text-slate-400">RECIBO #{createdReceipt.id.toUpperCase()}</p>
              <p className="text-sm font-bold text-slate-700 mt-1">{formatCurrency(createdReceipt.total)}</p>
              
              {createdReceipt.payments && createdReceipt.payments.length > 0 && (
                <div className="pt-2 border-t border-slate-150/55 mt-2 text-left space-y-1">
                  <p className="text-[9px] font-sans font-bold text-slate-400 uppercase tracking-wider">Formas de Pagamento:</p>
                  {createdReceipt.payments.map((p, idx) => (
                    <div key={idx} className="flex justify-between text-[11px] text-slate-650 font-sans">
                      <span>{p.method}</span>
                      <span className="font-bold font-mono text-xs">{formatCurrency(p.amount)}</span>
                    </div>
                  ))}
                </div>
              )}

              <div className="pt-2 border-t border-slate-150/55 mt-2 flex justify-between">
                <span className="text-slate-400">Cliente:</span>
                <span className="font-bold font-sans text-slate-650">{createdReceipt.clientName}</span>
              </div>
            </div>

            <div className="flex flex-col gap-2 pt-2.5">
              <button 
                type="button"
                id="pdv-modal-print-receipt-btn"
                onClick={() => {
                  setIsThermalReceiptOpen(true);
                }}
                className="w-full py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold font-sans transition-all flex items-center justify-center gap-1.5 shadow-md shadow-emerald-500/10 cursor-pointer active:scale-97"
              >
                <Printer size={14} />
                <span>Imprimir Cupom / PDF</span>
              </button>

              <div className="flex gap-2">
                <button 
                  type="button"
                  onClick={() => {
                    setIsSuccessModalOpen(false);
                    setActiveTab(ActiveTab.DASHBOARD);
                  }}
                  className="flex-1 py-1.5 bg-pink-50 hover:bg-pink-100 text-pink-700 transition-colors rounded-lg text-[11px] font-bold font-sans cursor-pointer"
                >
                  Ver no Dashboard
                </button>
                <button 
                  type="button"
                  onClick={() => {
                    setIsSuccessModalOpen(false);
                    setCreatedReceipt(null);
                  }}
                  className="flex-1 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors rounded-lg text-[11px] font-bold font-sans cursor-pointer"
                >
                  Fazer Outra Venda
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Interactive Thermal Receipt Modal popup */}
      {isThermalReceiptOpen && createdReceipt && (
        <ThermalReceipt 
          sale={createdReceipt} 
          onClose={() => {
            setIsThermalReceiptOpen(false);
          }}
        />
      )}
    </div>
  );
}
