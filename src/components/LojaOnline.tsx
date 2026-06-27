/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { 
  Sparkles, 
  Percent, 
  ShoppingBag, 
  Copy, 
  ExternalLink, 
  Tag, 
  Plus, 
  Check, 
  Flame, 
  Smartphone, 
  Clock, 
  Trash2, 
  MessageCircle,
  Eye,
  Filter,
  Instagram,
  Share2
} from 'lucide-react';
import { Product } from '../types';
import { getCatalogUrl } from '../config';
import AbandonedCarts from './AbandonedCarts';

interface LojaOnlineProps {
  products: Product[];
  onEnterCustomerView?: () => void;
  activeSubTab?: 'compartilhar' | 'cupons' | 'vitrine' | 'recuperacao';
  setActiveSubTab?: (subTab: 'compartilhar' | 'cupons' | 'vitrine' | 'recuperacao') => void;
  checkouts?: any[];
  setCheckouts?: React.Dispatch<React.SetStateAction<any[]>>;
  onSyncCheckouts?: () => void;
}

export interface Coupon {
  code: string;
  type: 'percent' | 'fixed';
  value: number;
  minPurchase: number;
  limitUses: number;
  usedCount: number;
  validUntil: string;
}

export default function LojaOnline({ 
  products, 
  onEnterCustomerView,
  activeSubTab: propActiveSubTab,
  setActiveSubTab: propSetActiveSubTab,
  checkouts = [],
  setCheckouts = () => {},
  onSyncCheckouts
}: LojaOnlineProps) {
  const [internalActiveSubTab, setInternalActiveSubTab] = useState<'compartilhar' | 'cupons' | 'vitrine' | 'recuperacao'>('compartilhar');
  const activeSubTab = propActiveSubTab || internalActiveSubTab;
  const setActiveSubTab = propSetActiveSubTab || setInternalActiveSubTab;
  const [copiedLink, setCopiedLink] = useState(false);

  // Bio state handlers with localStorage persistence
  const [instaBio, setInstaBio] = useState(() => {
    return localStorage.getItem('ap_insta_bio') || 
`🌸 AP Moda Fitness • Moda Premium
✨ Looks de alta compressão e zero transparência
👇 Monte seu carrinho de compras e finalize no WhatsApp:
{link}`;
  });

  const [whatsappBio, setWhatsappBio] = useState(() => {
    return localStorage.getItem('ap_whatsapp_bio') || 
`AP Moda Fitness • Peças de alta tecnologia e caimento perfeito. Acesse nosso catálogo online e veja as novidades: {link}`;
  });

  const [isSavedBios, setIsSavedBios] = useState(false);
  const [copiedInsta, setCopiedInsta] = useState(false);
  const [copiedWhatsapp, setCopiedWhatsapp] = useState(false);

  const handleSaveBios = () => {
    localStorage.setItem('ap_insta_bio', instaBio);
    localStorage.setItem('ap_whatsapp_bio', whatsappBio);
    setIsSavedBios(true);
    setTimeout(() => setIsSavedBios(false), 2000);
  };

  const handleCopyInstaBio = () => {
    const text = instaBio.replace('{link}', getCatalogLink());
    navigator.clipboard.writeText(text);
    setCopiedInsta(true);
    setTimeout(() => setCopiedInsta(false), 2000);
  };

  const handleCopyWhatsappBio = () => {
    const text = whatsappBio.replace('{link}', getCatalogLink());
    navigator.clipboard.writeText(text);
    setCopiedWhatsapp(true);
    setTimeout(() => setCopiedWhatsapp(false), 2000);
  };

  const handleApplyPresetInsta = (preset: string) => {
    setInstaBio(preset);
  };

  const handleApplyPresetWhatsapp = (preset: string) => {
    setWhatsappBio(preset);
  };

  const getCatalogLink = () => {
    return getCatalogUrl();
  };

  const handleCopyCatalogLink = () => {
    const link = getCatalogLink();
    navigator.clipboard.writeText(link);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  // Coupon listing state
  const [coupons, setCoupons] = useState<Coupon[]>([
    { code: 'FITNESS10', type: 'percent', value: 10, minPurchase: 150, limitUses: 100, usedCount: 32, validUntil: '2026-06-30' },
    { code: 'BEMVINDA50', type: 'fixed', value: 50, minPurchase: 300, limitUses: 50, usedCount: 15, validUntil: '2026-07-15' },
    { code: 'FRETEGRATIS', type: 'percent', value: 0, minPurchase: 399, limitUses: 500, usedCount: 88, validUntil: '2026-12-31' }
  ]);

  // Form states for creating new coupon
  const [newCode, setNewCode] = useState('');
  const [newType, setNewType] = useState<'percent' | 'fixed'>('percent');
  const [newValue, setNewValue] = useState(10);
  const [newMinPurchase, setNewMinPurchase] = useState(100);
  const [newLimitUses, setNewLimitUses] = useState(100);
  const [newValidUntil, setNewValidUntil] = useState('2026-07-31');

  // Interactive Public Showcase State (Mock e-commerce preview)
  const [previewCategory, setPreviewCategory] = useState('Todos');
  const [vitrineCart, setVitrineCart] = useState<{ product: Product; qty: number }[]>([]);
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [couponInput, setCouponInput] = useState('');

  // Extract categories for vitrine
  const categoriesList = useMemo(() => {
    const list = new Set(products.map(p => p.category));
    return ['Todos', ...Array.from(list)];
  }, [products]);

  // Filter products for vitrine
  const vitrineProducts = useMemo(() => {
    return products.filter(p => {
      const categoryMatch = previewCategory === 'Todos' || p.category === previewCategory;
      return categoryMatch && p.stock > 0; // Show only instock items on the e-commerce client view!
    });
  }, [products, previewCategory]);

  // Actions for Vitrine Cart
  const handleAddToVitrineCart = (product: Product) => {
    setVitrineCart(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        return prev.map(item => item.product.id === product.id ? { ...item, qty: item.qty + 1 } : item);
      }
      return [...prev, { product, qty: 1 }];
    });
  };

  const handleRemoveFromVitrineCart = (prodId: string) => {
    setVitrineCart(prev => prev.filter(item => item.product.id !== prodId));
  };

  const handleApplyCouponInVitrine = () => {
    const matched = coupons.find(c => c.code.toUpperCase() === couponInput.toUpperCase().trim());
    if (!matched) {
      alert('Cupom de desconto inválido ou inexistente!');
      return;
    }
    setAppliedCoupon(matched);
    alert(`Cupom ${matched.code} aplicado com sucesso na Vitrine Online!`);
  };

  // Cart financial computations
  const cartSubtotal = useMemo(() => {
    return vitrineCart.reduce((sum, item) => sum + (item.product.price * item.qty), 0);
  }, [vitrineCart]);

  const cartDiscountAmt = useMemo(() => {
    if (!appliedCoupon) return 0;
    if (cartSubtotal < appliedCoupon.minPurchase) {
      return 0; // Below minimum purchase requirement
    }
    if (appliedCoupon.type === 'percent') {
      return Number(((cartSubtotal * appliedCoupon.value) / 100).toFixed(2));
    } else {
      return appliedCoupon.value;
    }
  }, [appliedCoupon, cartSubtotal]);

  const cartTotal = useMemo(() => {
    return Math.max(0, cartSubtotal - cartDiscountAmt);
  }, [cartSubtotal, cartDiscountAmt]);

  // Generate WhatsApp payload for vitrine order checkout
  const sendVitrineOrderWhatsApp = () => {
    if (vitrineCart.length === 0) {
      alert('Seu carrinho está vazio para checkout!');
      return;
    }

    const itemsText = vitrineCart.map(it => `• ${it.qty}x ${it.product.name} (R$ ${it.product.price.toFixed(2)})`).join('\n');
    const discountText = appliedCoupon ? `\n🏷️ Cupom Aplicado: *${appliedCoupon.code}* (-R$ ${cartDiscountAmt.toFixed(2)})` : '';
    const message = `Olá, AP Moda Fitness! 🌸\n\nAcabei de ver suas peças na sua *Vitrine Online* e montei meu carrinho de compras!\n\n🛍️ *Meu Carrinho:*\n${itemsText}${discountText}\n\n💵 *Subtotal:* R$ ${cartSubtotal.toFixed(2)}\n💸 *Total das Peças:* R$ ${cartTotal.toFixed(2)}\n\nPode confirmar se essas peças estão disponíveis no meu tamanho e o preço do frete? Obrigada!`;

    try {
      window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`, '_blank');
    } catch {
      alert(`Mensagem do carrinho enviada de forma simulada:\n\n${message}`);
    }
  };

  const handleCreateCouponSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCode.trim() || newValue < 0) {
      alert('Preencha o código do cupom e o valor de desconto!');
      return;
    }

    const uppercaseCode = newCode.trim().toUpperCase();
    if (coupons.some(c => c.code === uppercaseCode)) {
      alert('Este código de cupom já existe no sistema!');
      return;
    }

    const newCouponItem: Coupon = {
      code: uppercaseCode,
      type: newType,
      value: Number(newValue),
      minPurchase: Number(newMinPurchase),
      limitUses: Number(newLimitUses),
      usedCount: 0,
      validUntil: newValidUntil
    };

    setCoupons(prev => [newCouponItem, ...prev]);
    setNewCode('');
    setNewValue(10);
    setNewMinPurchase(100);
    alert(`Cupom ${uppercaseCode} cadastrado com sucesso e já está ativo para uso!`);
  };

  const handleDeleteCoupon = (code: string) => {
    if (confirm(`Excluir o cupom ${code}? Ele não poderá mais ser usado por clientes.`)) {
      setCoupons(prev => prev.filter(c => c.code !== code));
    }
  };

  const openLojaHtmlNewTab = () => {
    // Generate a beautiful popup simulating opening loja.html to test e-commerce
    alert('Boutique Online Integrada!\n\nSeu catálogo de pedidos rápido "loja.html" foi carregado com conexão direta ao banco Supabase e cache offline localStorage. Você pode testá-lo usando a Vitrine Virtual no painel ao lado para ver exatamente como sua cliente visualiza a vitrine de qualquer celular ou tablet!');
  };

  return (
    <div className="space-y-6">
      
      {/* Title block */}
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold font-sans text-slate-800 tracking-tight">Loja Online, Vitrine & Cupons</h2>
          <p className="text-slate-400 text-sm">Gerencie cupons ativos, crie códigos promocionais temporários e simule a vitrine do seu e-commerce</p>
        </div>

        {/* Action Link buttons */}
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={handleCopyCatalogLink}
            className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-sans font-bold px-4 py-2.5 rounded-xl text-xs transition-all cursor-pointer active:scale-97 shadow-xs text-center"
          >
            {copiedLink ? <Check size={14} className="text-green-400" /> : <Copy size={13} />}
            <span>{copiedLink ? 'Link Copiado!' : 'Copiar Link do Catálogo'}</span>
          </button>

          <button
            type="button"
            onClick={() => window.open(getCatalogLink(), '_blank')}
            className="inline-flex items-center gap-2 bg-pink-100 hover:bg-pink-200 text-pink-700 font-sans font-bold px-4 py-2.5 rounded-xl text-xs transition-colors cursor-pointer active:scale-97 text-center"
          >
            <ExternalLink size={14} />
            <span>Ver Catálogo Online (Cliente)</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-100 overflow-x-auto scrollbar-none">
        <button
          type="button"
          onClick={() => setActiveSubTab('compartilhar')}
          className={`px-4 py-2.5 font-sans text-xs font-bold transition-all border-b-2 flex items-center gap-2 cursor-pointer whitespace-nowrap
            ${activeSubTab === 'compartilhar' 
              ? 'border-pink-600 text-pink-600' 
              : 'border-transparent text-slate-450 hover:text-slate-700'}`}
        >
          <Share2 size={14} className={activeSubTab === 'compartilhar' ? 'text-pink-600' : 'text-slate-400'} />
          <span>Compartilhar Vitrine & Bios</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveSubTab('cupons')}
          className={`px-4 py-2.5 font-sans text-xs font-bold transition-all border-b-2 flex items-center gap-2 cursor-pointer whitespace-nowrap
            ${activeSubTab === 'cupons' 
              ? 'border-pink-600 text-pink-600' 
              : 'border-transparent text-slate-450 hover:text-slate-700'}`}
        >
          <Percent size={14} className={activeSubTab === 'cupons' ? 'text-pink-600' : 'text-slate-400'} />
          <span>Gestão de Cupons Promocionais</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveSubTab('vitrine')}
          className={`px-4 py-2.5 font-sans text-xs font-bold transition-all border-b-2 flex items-center gap-2 cursor-pointer whitespace-nowrap
            ${activeSubTab === 'vitrine' 
              ? 'border-pink-600 text-pink-600' 
              : 'border-transparent text-slate-450 hover:text-slate-700'}`}
        >
          <Smartphone size={14} className={activeSubTab === 'vitrine' ? 'text-pink-600' : 'text-slate-400'} />
          <span>Vitrine de Clientes (Preview)</span>
        </button>
        <button
          id="tab-recuperacao-btn"
          type="button"
          onClick={() => setActiveSubTab('recuperacao')}
          className={`px-4 py-2.5 font-sans text-xs font-bold transition-all border-b-2 flex items-center gap-2 cursor-pointer whitespace-nowrap
            ${activeSubTab === 'recuperacao' 
              ? 'border-pink-600 text-pink-600' 
              : 'border-transparent text-slate-450 hover:text-slate-700'}`}
        >
          <Sparkles size={14} className={activeSubTab === 'recuperacao' ? 'text-pink-600' : 'text-slate-400'} />
          <span>Carrinhos Abandonados (IA)</span>
        </button>
      </div>

      {/* Tab: Compartilhar & Bios de Redes Sociais */}
      {activeSubTab === 'compartilhar' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 font-sans">
          
          {/* Main settings column */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Link & QR Code Section */}
            <div className="bg-white border border-slate-100 rounded-2xl shadow-xs p-5">
              <div className="flex flex-col md:flex-row items-center gap-6">
                
                {/* Simulated Beautiful QR Code Card with scanning animation */}
                <div className="w-full md:w-44 shrink-0 flex flex-col items-center justify-center p-3 bg-slate-50 border border-slate-150 rounded-2xl relative overflow-hidden group select-none">
                  {/* Subtle scan bar animating over mockup */}
                  <div className="absolute top-0 left-0 right-0 h-0.5 bg-pink-500 shadow-md shadow-pink-400 animate-bounce duration-3000 pointer-events-none" />
                  
                  {/* Mini Grid resembling QR Code */}
                  <div className="w-32 h-32 bg-white rounded-lg p-2 border border-slate-200/60 flex flex-col justify-between relative shadow-xs">
                    <div className="flex justify-between">
                      <div className="w-7 h-7 border-4 border-slate-800 rounded-sm flex items-center justify-center">
                        <div className="w-2 h-2 bg-slate-800 rounded-xs" />
                      </div>
                      <div className="w-7 h-7 border-4 border-slate-800 rounded-sm flex items-center justify-center">
                        <div className="w-2 h-2 bg-slate-800 rounded-xs" />
                      </div>
                    </div>

                    {/* Dotted texture resembling QR payload */}
                    <div className="flex-1 py-1 flex flex-col justify-around">
                      <div className="flex justify-around gap-1 px-1">
                        <span className="w-1.5 h-1.5 bg-slate-800 rounded-full" />
                        <span className="w-1.5 h-1.5 bg-slate-400 rounded-full" />
                        <span className="w-1.5 h-1.5 bg-slate-800 rounded-full" />
                        <span className="w-1.5 h-1.5 bg-slate-700 rounded-full" />
                        <span className="w-1.5 h-1.5 bg-slate-400 rounded-full" />
                      </div>
                      <div className="flex justify-around gap-1 px-1">
                        <span className="w-1.5 h-1.5 bg-slate-400 rounded-full" />
                        <span className="w-1.5 h-1.5 bg-slate-800 rounded-full" />
                        <span className="w-1.5 h-1.5 bg-pink-600 rounded-full" />
                        <span className="w-1.5 h-1.5 bg-slate-800 rounded-full" />
                        <span className="w-1.5 h-1.5 bg-slate-800 rounded-full" />
                      </div>
                      <div className="flex justify-around gap-1 px-1">
                        <span className="w-1.5 h-1.5 bg-slate-800 rounded-full" />
                        <span className="w-1.5 h-1.5 bg-slate-500 rounded-full" />
                        <span className="w-1.5 h-1.5 bg-slate-800 rounded-full" />
                        <span className="w-1.5 h-1.5 bg-slate-400 rounded-full" />
                        <span className="w-1.5 h-1.5 bg-pink-600 rounded-full" />
                      </div>
                    </div>

                    <div className="flex justify-between">
                      <div className="w-7 h-7 border-4 border-slate-800 rounded-sm flex items-center justify-center">
                        <div className="w-2 h-2 bg-slate-800 rounded-xs" />
                      </div>
                      {/* Logo center accent */}
                      <span className="text-[10px] font-black text-pink-600 absolute inset-0 m-auto w-fit h-fit bg-white px-1.5 py-0.5 border border-slate-200 shadow-xs rounded">AP</span>
                      
                      <div className="w-7 p-0.5 flex flex-wrap gap-0.5 justify-end">
                        <span className="w-1.5 h-1.5 bg-slate-800 rounded-xs" />
                        <span className="w-1.5 h-1.5 bg-slate-800 rounded-xs" />
                        <span className="w-1.5 h-1.5 bg-slate-800 rounded-xs" />
                        <span className="w-1.5 h-1.5 bg-slate-800 rounded-xs" />
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] text-slate-400 font-bold tracking-wider mt-2.5 uppercase">QR Code da Vitrine</span>
                </div>

                {/* Info and action */}
                <div className="flex-1 space-y-3.5 text-center md:text-left">
                  <div>
                    <span className="bg-pink-100/70 border border-pink-200/50 text-pink-700 font-bold text-[9px] px-2.5 py-1 rounded-full uppercase tracking-wider inline-block">Sua vitrine está pronta</span>
                    <h3 className="text-base font-bold text-slate-800 mt-1.5">Catalogo de Pedidos Online</h3>
                    <p className="text-slate-400 text-xs mt-1 leading-relaxed">Você já pode enviar o link direto para suas clientes em canais de chat ou fixá-lo na seção de "Link da Bio" nas suas redes oficiais!</p>
                  </div>

                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-150 flex items-center justify-between gap-3 overflow-hidden">
                    <span className="font-mono text-xs text-slate-650 truncate select-all">{getCatalogLink()}</span>
                    <button
                      type="button"
                      onClick={handleCopyCatalogLink}
                      className="shrink-0 inline-flex items-center gap-1.5 text-pink-600 hover:text-pink-700 font-bold text-xs"
                    >
                      {copiedLink ? <Check size={14} className="text-green-500" /> : <Copy size={13} />}
                      <span>{copiedLink ? 'Copiado!' : 'Copiar'}</span>
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-2.5 justify-center md:justify-start">
                    <button
                      type="button"
                      onClick={() => window.open(getCatalogLink(), '_blank')}
                      className="inline-flex items-center gap-1.5 text-slate-700 bg-slate-100 hover:bg-slate-200 font-bold text-xs px-3.5 py-2 rounded-xl transition"
                    >
                      <ExternalLink size={13} />
                      <span>Ver como cliente</span>
                    </button>
                    <button
                      type="button"
                      className="inline-flex items-center gap-1.5 text-white bg-pink-600 hover:bg-pink-700 font-bold text-xs px-3.5 py-2 rounded-xl transition cursor-pointer"
                      onClick={() => alert(`Para exportar o QR Code para panfletos ou tags de roupas:\n\n1. Imprima ou tire um print desta página\n2. Use em canais do Instagram e WhatsApp!`)}
                    >
                      <span>Imprimir Etiquetas QR</span>
                    </button>
                  </div>
                </div>

              </div>
            </div>

            {/* Bios Editing Area */}
            <div className="space-y-4">
              <div className="bg-white border border-slate-100 rounded-2xl shadow-xs p-5">
                <div className="flex justify-between items-center border-b border-slate-50 pb-3 mb-4">
                  <div>
                    <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                      <Instagram size={15} className="text-pink-600" />
                      <span>Bios Customizáveis para Redes Sociais</span>
                    </h3>
                    <p className="text-slate-400 text-[11px] mt-0.5">Use o caractere <code className="font-mono bg-slate-100 px-1 rounded text-pink-600 font-semibold">&#123;link&#125;</code> onde deseja que seu link exclusivo seja injetado.</p>
                  </div>

                  {/* Save feedback indicator */}
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleSaveBios}
                      className="text-xs bg-slate-900 hover:bg-slate-800 text-white font-bold px-3.5 py-1.5 rounded-xl transition"
                    >
                      {isSavedBios ? '✓ Salvo!' : 'Salvar Textos'}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* Instagram Bio config card */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <label className="text-slate-750 text-xs font-bold flex items-center gap-1">
                        <span>Instagram Bio</span>
                      </label>
                      <button
                        type="button"
                        onClick={handleCopyInstaBio}
                        className="text-[10px] text-pink-600 hover:text-pink-700 font-bold flex items-center gap-1"
                        title="Copiar texto final já com link"
                      >
                        {copiedInsta ? <Check size={11} className="text-green-500" /> : <Copy size={11} />}
                        <span>{copiedInsta ? 'Link + Bio Copiado!' : 'Copiar c/ Link'}</span>
                      </button>
                    </div>
                    <textarea
                      rows={5}
                      value={instaBio}
                      onChange={(e) => setInstaBio(e.target.value)}
                      placeholder="Bio do Instagram..."
                      className="w-full text-xs font-sans p-3 bg-slate-50 border border-slate-150 rounded-xl focus:outline-hidden text-slate-755 leading-relaxed resize-none"
                    />
                  </div>

                  {/* WhatsApp Bio config card */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <label className="text-slate-750 text-xs font-bold flex items-center gap-1">
                        <span>WhatsApp Recado / Grupo Info</span>
                      </label>
                      <button
                        type="button"
                        onClick={handleCopyWhatsappBio}
                        className="text-[10px] text-emerald-600 hover:text-emerald-700 font-bold flex items-center gap-1"
                        title="Copiar recado final"
                      >
                        {copiedWhatsapp ? <Check size={11} className="text-green-500" /> : <Copy size={11} />}
                        <span>{copiedWhatsapp ? 'Link + Bio Copiado!' : 'Copiar c/ Link'}</span>
                      </button>
                    </div>
                    <textarea
                      rows={5}
                      value={whatsappBio}
                      onChange={(e) => setWhatsappBio(e.target.value)}
                      placeholder="Status do WhatsApp..."
                      className="w-full text-xs font-sans p-3 bg-slate-50 border border-slate-150 rounded-xl focus:outline-hidden text-slate-755 leading-relaxed resize-none"
                    />
                  </div>
                </div>

                {/* Previews wrapper */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-6 pt-5 border-t border-slate-100">
                  
                  {/* INSTAGRAM MOCKUP PREVIEW */}
                  <div className="bg-slate-50 rounded-2xl border border-slate-150 p-4 font-sans select-none relative overflow-hidden">
                    <span className="absolute right-3 top-3 text-[8px] bg-slate-200 text-slate-500 font-bold px-1.5 py-0.5 rounded uppercase">Preview no Instagram</span>
                    
                    {/* Header profile info mockup */}
                    <div className="flex items-center gap-3.5 mb-2.5">
                      <div className="w-12 h-12 rounded-full ring-2 ring-pink-500 p-0.5 bg-white flex-shrink-0">
                        <div className="w-full h-full bg-slate-200 rounded-full flex items-center justify-center font-bold text-slate-400 text-xs">AP</div>
                      </div>
                      <div className="space-y-1">
                        <p className="font-bold text-xs text-slate-800">apmodafitness</p>
                        <div className="flex gap-2.5 text-[10px] text-slate-500 font-medium">
                          <span><strong>142</strong> posts</span>
                          <span><strong>3.8k</strong> seguidores</span>
                        </div>
                      </div>
                    </div>

                    {/* Bio Rendered Text markup with link converted to blue */}
                    <div className="text-[11px] text-slate-800 leading-relaxed font-sans whitespace-pre-wrap">
                      <p className="font-semibold text-slate-900">AP Moda Fitness | Premium</p>
                      {instaBio.split('{link}')[0]}
                      <span className="text-blue-600 font-medium break-all underline cursor-pointer hover:text-blue-800">{getCatalogLink()}</span>
                      {instaBio.split('{link}')[1] || ''}
                    </div>
                  </div>

                  {/* WHATSAPP MOCKUP PREVIEW */}
                  <div className="bg-emerald-50/40 rounded-2xl border border-emerald-100 p-4 font-sans select-none relative overflow-hidden">
                    <span className="absolute right-3 top-3 text-[8px] bg-emerald-100 text-emerald-600 font-bold px-1.5 py-0.5 rounded uppercase">Preview no WhatsApp</span>
                    
                    {/* Green chat bar simulator */}
                    <div className="flex items-center gap-3 mb-2.5">
                      <div className="w-9 h-9 rounded-full bg-emerald-600 flex items-center justify-center text-white font-extrabold text-xs">AP</div>
                      <div>
                        <p className="font-bold text-xs text-slate-800">AP Moda Fitness (Catálogo)</p>
                        <p className="text-slate-400 text-[8px]">Recado de status ativo</p>
                      </div>
                    </div>

                    {/* Bio message simulation */}
                    <div className="bg-white p-2.5 rounded-xl border border-emerald-100/50 shadow-xs max-w-xs text-[11px] text-slate-850 whitespace-pre-wrap leading-relaxed relative">
                      {whatsappBio.split('{link}')[0]}
                      <span className="text-emerald-600 font-semibold break-all underline cursor-pointer">{getCatalogLink()}</span>
                      {whatsappBio.split('{link}')[1] || ''}
                    </div>
                  </div>

                </div>

              </div>
            </div>

          </div>

          {/* Campaign presets & helper column */}
          <div className="space-y-6">
            
            {/* Presets Card */}
            <div className="bg-white border border-slate-100 rounded-2xl shadow-xs p-4">
              <h4 className="text-xs font-bold font-sans uppercase tracking-wider text-slate-650 mb-3 flex items-center gap-1.5">
                <Sparkles size={13} className="text-pink-600" />
                <span>Presets Prontos p/ Copiar</span>
              </h4>
              <p className="text-slate-400 text-[10.5px] leading-relaxed mb-4">Escolha abaixo templates criados por especialistas para atualizar suas redes de forma instantânea com temas estratégicos:</p>

              <div className="space-y-3">
                {/* Instagram Presets */}
                <div>
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Modelos de Bio Instagram</span>
                  <div className="space-y-2">
                    {[
                      {
                        title: "🔥 Looks de Alta Compressão",
                        text: `🌸 AP Moda Fitness • Premium
✨ Looks de altíssima compressão e zero transparência
👇 Monte seu carrinho de compras e finalize no WhatsApp para atendimento VIP:
{link}`
                      },
                      {
                        title: "🎉 Oferta Ativa & Cupom",
                        text: `🛍️ AP Moda Fitness • Pratique com Estilo!
🏷️ 10% OFF EXTRA usando o cupom FITNESS10 no carrinho
👇 Acesse nossa vitrine online atualizada agora:
{link}`
                      },
                      {
                        title: "❄️ Nova Coleção Inverno",
                        text: `⚡ Coleção Nova AP MODA FITNESS Liberada!
📦 Peças exclusivas, confortáveis e premium para seu treino.
👇 Compre fácil pelo link abaixo direto do catálogo:
{link}`
                      }
                    ].map((p, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => handleApplyPresetInsta(p.text)}
                        className="w-full text-left p-2.5 bg-slate-50 hover:bg-slate-100 active:bg-slate-150 border border-slate-150 rounded-xl transition cursor-pointer text-[11px] font-medium text-slate-700 flex justify-between items-center group"
                      >
                        <span className="truncate pr-2">{p.title}</span>
                        <span className="text-[9px] text-pink-600 font-bold opacity-0 group-hover:opacity-100 transition duration-150">Aplicar →</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* WhatsApp Presets */}
                <div className="pt-2 border-t border-slate-50">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Modelos para WhatsApp</span>
                  <div className="space-y-2">
                    {[
                      {
                        title: "💬 Recado Oficial",
                        text: `Atendimento AP Moda Fitness 🌸 Confira nosso catálogo online atualizado, escolha suas cores e tamanhos favoritos e me envie por aqui! 👇 {link}`
                      },
                      {
                        title: "👗 Conforto & Elasticidade",
                        text: `AP Moda Fitness • Peças lindas que elevam seu treino. Siga-nos no Instagram. Veja novidades no link: {link}`
                      }
                    ].map((p, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => handleApplyPresetWhatsapp(p.text)}
                        className="w-full text-left p-2.5 bg-slate-50 hover:bg-slate-100 active:bg-slate-150 border border-slate-150 rounded-xl transition cursor-pointer text-[11px] font-medium text-slate-700 flex justify-between items-center group"
                      >
                        <span className="truncate pr-2">{p.title}</span>
                        <span className="text-[9px] text-emerald-600 font-bold opacity-0 group-hover:opacity-100 transition duration-150">Aplicar →</span>
                      </button>
                    ))}
                  </div>
                </div>

              </div>
            </div>

            {/* Helper Tips Card */}
            <div className="bg-grad-sidebar p-4.5 rounded-2xl border border-pink-100/40 space-y-3 font-sans">
              <h4 className="text-xs font-bold text-pink-700 uppercase tracking-wide flex items-center gap-1">
                <span>💡</span>
                <span>Dicas para Bombar de Vender</span>
              </h4>
              <ul className="space-y-2 text-[11px] text-pink-955 leading-relaxed font-medium">
                <li className="flex gap-1.5 items-start">
                  <span>✨</span>
                  <span><strong>Fixe na Bio do Instagram:</strong> Com a bio configurada e copiada, acerte seu perfil no Instagram e coloque o link do catálogo!</span>
                </li>
                <li className="flex gap-1.5 items-start">
                  <span>📱</span>
                  <span><strong>Figurinha nos Stories:</strong> Crie um story mostrando os detalhes de uma peça (como a elasticidade ou tecido) e adicione uma figurinha de "Link" direcionando para seu catálogo.</span>
                </li>
                <li className="flex gap-1.5 items-start">
                  <span>💬</span>
                  <span><strong>Lista de Transmissão:</strong> Envie o link personalizado em massa com um textinho gentil avisando: "Oi flor, chegou reposição da nossa calça favorita, corre pra garantir antes que esgote!"</span>
                </li>
              </ul>
            </div>

          </div>

        </div>
      )}

      {/* Tab 1: Coupon Manager */}
      {activeSubTab === 'cupons' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* List existing coupons */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white border border-slate-100 rounded-2xl shadow-xs p-4">
              <h3 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-1">
                <Tag size={15} className="text-pink-600" />
                <span>Cupons Ativos na Loja Virtual</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {coupons.map(coupon => (
                  <div key={coupon.code} className="p-4 bg-slate-50 border border-slate-150 rounded-2xl flex flex-col justify-between hover:shadow-xs transition-all relative overflow-hidden font-sans">
                    {/* Background badge decorative */}
                    <div className="absolute right-0 top-0 translate-x-3 -translate-y-3 opacity-5 pointer-events-none scale-150">
                      <Tag size={80} className="text-slate-900" />
                    </div>

                    <div>
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="font-mono font-bold text-rose-600 tracking-wide bg-rose-50 px-2 py-0.5 rounded text-xs">
                            {coupon.code}
                          </span>
                          <span className="text-[10px] text-slate-400 block mt-1">Validade: {coupon.validUntil}</span>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleDeleteCoupon(coupon.code)}
                          className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors"
                          title="Remover Cupom"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>

                      <div className="mt-3.5 space-y-1 text-xs text-slate-700">
                        <p className="font-medium">
                          Desconto: <strong className="text-slate-800">{coupon.type === 'percent' ? `${coupon.value}%` : `R$ ${coupon.value.toFixed(2)}`}</strong>
                        </p>
                        <p className="text-[11px] text-slate-500">
                          Compra Mínima: <strong className="text-slate-650">R$ {coupon.minPurchase.toFixed(2)}</strong>
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 pt-2.5 border-t border-slate-200/50 flex justify-between items-center text-[10px] text-slate-400">
                      <span>Usos: <strong className="text-slate-650">{coupon.usedCount} / {coupon.limitUses}</strong></span>
                      <div className="w-24 bg-slate-200 h-1 rounded-full overflow-hidden">
                        <div className="bg-rose-500 h-1" style={{ width: `${(coupon.usedCount / coupon.limitUses) * 100}%` }} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Create Coupon Form */}
          <div className="bg-white border border-slate-100 rounded-2xl shadow-xs p-4">
            <div className="flex items-center gap-2 mb-3 border-b border-slate-50 pb-2">
              <Plus size={15} className="text-pink-600" />
              <h3 className="text-xs font-bold font-sans uppercase text-slate-700 tracking-wider">Criar Novo Cupom</h3>
            </div>

            <form onSubmit={handleCreateCouponSubmit} className="space-y-4 text-xs font-sans">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Código do Cupom</label>
                <input
                  type="text"
                  required
                  placeholder="EX: APVERAO20"
                  value={newCode}
                  onChange={(e) => setNewCode(e.target.value.toUpperCase())}
                  className="w-full bg-slate-50 border border-slate-150 rounded-lg p-2 font-mono font-bold uppercase focus:outline-hidden text-rose-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Tipo Desconto</label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value as 'percent' | 'fixed')}
                    className="w-full bg-slate-50 border border-slate-150 rounded-lg p-2 focus:outline-hidden"
                  >
                    <option value="percent">Porcentagem (%)</option>
                    <option value="fixed">Valor Fixo (R$)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Desconto</label>
                  <input
                    type="number"
                    min={0}
                    required
                    value={newValue}
                    onChange={(e) => setNewValue(Math.max(0, Number(e.target.value)))}
                    className="w-full bg-slate-50 border border-slate-150 rounded-lg p-2 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Pedido Mínimo (R$)</label>
                  <input
                    type="number"
                    min={0}
                    required
                    value={newMinPurchase}
                    onChange={(e) => setNewMinPurchase(Math.max(0, Number(e.target.value)))}
                    className="w-full bg-slate-50 border border-slate-150 rounded-lg p-2 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Limite de Uso</label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={newLimitUses}
                    onChange={(e) => setNewLimitUses(Math.max(1, Number(e.target.value)))}
                    className="w-full bg-slate-50 border border-slate-150 rounded-lg p-2 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Data Validade</label>
                <input
                  type="date"
                  required
                  value={newValidUntil}
                  onChange={(e) => setNewValidUntil(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-150 rounded-lg p-2 focus:outline-hidden"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2 bg-pink-600 hover:bg-pink-700 text-white font-bold rounded-lg transition-colors cursor-pointer text-center"
              >
                Cadastrar Código na Nuvem
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Tab 2: Vitrine/Catalog Showcase Preview */}
      {activeSubTab === 'vitrine' && (
        <div className="space-y-4 font-sans">
          {/* Banner calling attention to the new high-fidelity fullscreen catalog */}
          <div className="bg-pink-50 border border-pink-200 p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs font-sans">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-pink-100 rounded-xl text-pink-600 font-bold shrink-0 animate-bounce">
                🌸
              </div>
              <div className="text-left leading-snug">
                <h4 className="font-extrabold text-slate-800 text-xs uppercase tracking-wide">NOVIDADE: Vitrine VIP Premium Ativada!</h4>
                <p className="text-[11px] text-slate-500 font-medium">Lançamos os novos carrosséis de vídeos, lookbooks dinâmicos interativos, calculador de frete por CEP realista e checkout automático via CRM integrado.</p>
              </div>
            </div>
            <button
              onClick={() => {
                if (onEnterCustomerView) {
                  onEnterCustomerView();
                } else {
                  const btn = document.getElementById('sidebar-toggle-btn') || document.querySelector('[title*="cliente"]');
                  if (btn) (btn as HTMLElement).click();
                }
              }}
              className="shrink-0 bg-pink-600 hover:bg-pink-700 text-white font-extrabold text-[10px] md:text-[11px] uppercase tracking-wider px-4 py-2 rounded-full cursor-pointer transition shadow-sm border-none"
            >
              Experimentar Tela Cheia 🚀
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* E-commerce showcase catalog mockup */}
          <div className="lg:col-span-8 bg-slate-900 ring-4 ring-slate-850 rounded-3xl p-4 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 bg-red-500 rounded-full" />
                <span className="w-2.5 h-2.5 bg-yellow-500 rounded-full" />
                <span className="w-2.5 h-2.5 bg-green-500 rounded-full" />
                <span className="text-[10px] text-slate-500 font-mono ml-2">https://apmodafitness.com.br/vitrine</span>
              </div>
              <span className="text-[9px] bg-pink-600/25 border border-pink-500/20 text-pink-400 font-bold px-2 py-0.5 rounded-full select-none">Preview Cliente (E-commerce)</span>
            </div>

            {/* In-Preview Public Header */}
            <div className="bg-slate-950 p-3 rounded-2xl flex justify-between items-center text-xs selection:bg-pink-600 mb-4 border border-slate-850">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-md bg-pink-600 flex items-center justify-center text-white font-bold text-xs shadow-md shadow-pink-500/10">AP</div>
                <span className="font-bold text-white tracking-wide">AP Vitrine Online</span>
              </div>

              {/* public pills category selection */}
              <div className="flex gap-1 overflow-x-auto max-w-xs scrollbar-none py-1">
                {categoriesList.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setPreviewCategory(cat)}
                    className={`px-2 py-1 text-[10px] font-bold rounded-md transition-colors cursor-pointer select-none
                      ${previewCategory === cat ? 'bg-pink-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-850'}`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Grid of items */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-96 overflow-y-auto pr-1">
              {vitrineProducts.map(prod => (
                <div key={prod.id} className="bg-slate-950 border border-slate-850 rounded-xl p-2.5 hover:border-pink-600/30 transition-all flex flex-col justify-between">
                  <div>
                    <div className="aspect-square w-full rounded-lg overflow-hidden bg-slate-850 relative mb-1.5">
                      <img src={prod.image} alt={prod.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      <span className="absolute top-1 left-1.5 bg-slate-900/85 backdrop-blur-xs text-[8px] font-bold text-pink-400 px-1 py-0.5 rounded uppercase font-mono">{prod.category}</span>
                    </div>
                    <p className="text-[10px] font-bold text-white leading-tight line-clamp-2">{prod.name}</p>
                  </div>

                  <div className="mt-2.5 flex items-center justify-between">
                    <span className="font-bold text-[11px] text-pink-400 font-mono">R$ {prod.price.toFixed(2)}</span>
                    <button
                      type="button"
                      onClick={() => handleAddToVitrineCart(prod)}
                      className="bg-pink-600 hover:bg-pink-700 text-white p-1 rounded-lg text-[9px] font-bold transition-all flex items-center gap-1 cursor-pointer"
                    >
                      <span>Adicionar</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Public customer cart drawer */}
          <div className="lg:col-span-4 bg-white border border-slate-100 rounded-3xl p-4 shadow-sm flex flex-col justify-between font-sans">
            
            <div>
              <div className="flex items-center gap-1.5 border-b border-slate-100 pb-2 mb-3">
                <ShoppingBag size={15} className="text-pink-600" />
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wide">Minha Sacola ({vitrineCart.length} itens)</h3>
              </div>

              {/* Cart List */}
              <div className="space-y-2.5 max-h-48 overflow-y-auto pr-1">
                {vitrineCart.length === 0 ? (
                  <p className="text-slate-400 text-center py-6 text-[11px]">Adicione peças clicando nos produtos da vitrine ao lado!</p>
                ) : (
                  vitrineCart.map(item => (
                    <div key={item.product.id} className="flex justify-between items-center text-xs text-slate-700 p-2 bg-slate-50 rounded-xl border border-slate-100">
                      <div>
                        <p className="font-bold text-slate-800 truncate max-w-[140px]">{item.product.name}</p>
                        <p className="text-slate-400 text-[10px] mt-0.5 font-mono">{item.qty}x R$ {item.product.price.toFixed(2)}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveFromVitrineCart(item.product.id)}
                        className="p-1 text-slate-400 hover:text-red-500 rounded transition"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  ))
                )}
              </div>

              {/* Coupon input */}
              {vitrineCart.length > 0 && (
                <div className="mt-4 pt-3.5 border-t border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 block mb-1">Cupom de Desconto</span>
                  <div className="flex gap-1.5">
                    <input
                      type="text"
                      placeholder="EX: FITNESS10"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                      className="flex-grow bg-slate-50 border border-slate-150 rounded-lg p-1.5 focus:outline-hidden font-mono text-[11px] font-bold text-rose-600 uppercase"
                    />
                    <button
                      type="button"
                      onClick={handleApplyCouponInVitrine}
                      className="bg-slate-800 hover:bg-slate-900 text-white font-bold text-[10px] px-3 py-1.5 rounded-lg border-none cursor-pointer"
                    >
                      Aplicar
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Calculations and checkout */}
            {vitrineCart.length > 0 && (
              <div className="mt-4 pt-4 border-t border-slate-100 space-y-2">
                <div className="space-y-1.5 text-xs text-slate-600">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span className="font-bold text-slate-800">R$ {cartSubtotal.toFixed(2)}</span>
                  </div>
                  {appliedCoupon && (
                    <div className="flex justify-between text-rose-600">
                      <span>Desconto ({appliedCoupon.code}):</span>
                      <span>-R$ {cartDiscountAmt.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-slate-800 pt-1.5 border-t border-slate-100 font-bold">
                    <span>Valor Peças:</span>
                    <span className="text-pink-600 tracking-tight font-mono text-sm">R$ {cartTotal.toFixed(2)}</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={sendVitrineOrderWhatsApp}
                  className="w-full py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-md shadow-green-500/10 cursor-pointer active:scale-97"
                >
                  <MessageCircle size={14} />
                  <span>Pedir via WhatsApp</span>
                </button>
              </div>
            )}

          </div>
        </div>
      </div>
      )}

      {/* Tab: Recuperação de Carrinhos Abandonados por IA */}
      {activeSubTab === 'recuperacao' && (
        <AbandonedCarts 
          checkouts={checkouts} 
          setCheckouts={setCheckouts}
          onSyncCheckouts={onSyncCheckouts}
        />
      )}

    </div>
  );
}
