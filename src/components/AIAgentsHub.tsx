/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Sparkles, 
  Bot, 
  MessageSquare, 
  TrendingUp, 
  Package, 
  Scissors, 
  Copy, 
  Check, 
  Send,
  Loader2,
  Trash2,
  Share2,
  ShoppingBag,
  HelpCircle,
  FileText,
  Percent,
  CheckSquare,
  AlertCircle,
  Megaphone,
  Palette,
  Globe
} from 'lucide-react';
import { Product, Client } from '../types';
import ImageUploader from './ImageUploader';

interface AIAgentsHubProps {
  products: Product[];
  clients: Client[];
  activeSubTab?: 'descritor' | 'estilista' | 'whatsapp' | 'sentinela' | 'campanha' | 'consultoria' | 'tradutor' | 'precificador';
  setActiveSubTab?: (subTab: 'descritor' | 'estilista' | 'whatsapp' | 'sentinela' | 'campanha' | 'consultoria' | 'tradutor' | 'precificador') => void;
}

export default function AIAgentsHub({ 
  products, 
  clients,
  activeSubTab: propActiveSubTab,
  setActiveSubTab: propSetActiveSubTab
}: AIAgentsHubProps) {
  // Navigation tabs for the AI Agente Hub
  const [internalActiveSubTab, setInternalActiveSubTab] = useState<'descritor' | 'estilista' | 'whatsapp' | 'sentinela' | 'campanha' | 'consultoria' | 'tradutor' | 'precificador'>('descritor');
  const activeSubTab = propActiveSubTab || internalActiveSubTab;
  const setActiveSubTab = propSetActiveSubTab || setInternalActiveSubTab;

  // Loading States and Result States
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Form State - Descritor de Produtos
  const [descName, setDescName] = useState('');
  const [descImage, setDescImage] = useState('');
  const [descStyle, setDescStyle] = useState('Alta Performance (Musculação/Running)');
  const [descMaterials, setDescMaterials] = useState<string[]>(['Poliamida Premium', 'Elastano Lycra']);
  const [descExtra, setDescExtra] = useState('');
  const [descResult, setDescResult] = useState('');

  // Form State - Estilista Lookbook
  const [selectedProdIds, setSelectedProdIds] = useState<string[]>([]);
  const [styleTone, setStyleTone] = useState('Sustentável e Urbano');
  const [lookbookResult, setLookbookResult] = useState('');

  // Form State - WhatsApp Copiloto
  const [waScenario, setWaScenario] = useState('Carrinho Abandonado');
  const [waClientName, setWaClientName] = useState('');
  const [waProductDetail, setWaProductDetail] = useState('');
  const [waDiscount, setWaDiscount] = useState(false);
  const [waPhone, setWaPhone] = useState('');
  const [whatsappResult, setWhatsappResult] = useState('');

  // Form State - Sentinela de Estoque
  const [sentinelResult, setSentinelResult] = useState('');

  // Form State - Campanhas de Marketing Sazonais
  const [campTheme, setCampTheme] = useState('Semana do Consumidor VIP');
  const [campDiscount, setCampDiscount] = useState('15% de Desconto + Frete Grátis com cupom CONSUMIDORFIT');
  const [campCategory, setCampCategory] = useState('Leggings Zero Costura & Cores de Outono');
  const [campAudience, setCampAudience] = useState('Mulheres dinâmicas que buscam roupas premium para musculação e corrida');
  const [campResult, setCampResult] = useState('');

  // Form State - Consultoria de Cores & Estampas
  const [colorPrim, setColorPrim] = useState('Azul Petróleo Profundo');
  const [colorTextu, setColorTextu] = useState('Fio Cirrê de toque gelado e alto brilho glam');
  const [colorVibeOption, setColorVibeOption] = useState('Treinos Intensivos & Esteticismo Urbano');
  const [colorResult, setColorResult] = useState('');

  // Form State - Tradutor Técnico de Moda Fitness
  const [transText, setTransText] = useState('Legging empina-bumbum em tecido jacquard texturizado de poliamida com elastano, com zero transparência, toque extremamente macio e cós modelador de compressão anatômica.');
  const [transLang, setTransLang] = useState('Inglês (E-commerce EUA)');
  const [transResult, setTransResult] = useState('');

  // Form State - Precificador Inteligente IA
  const [priceProdName, setPriceProdName] = useState('');
  const [priceCategory, setPriceCategory] = useState('Legging');
  const [costFabric, setCostFabric] = useState<number>(18.5);
  const [costLabor, setCostLabor] = useState<number>(12.0);
  const [costAccessories, setCostAccessories] = useState<number>(4.0);
  const [costBranding, setCostBranding] = useState<number>(3.0);
  const [fixedOverhead, setFixedOverhead] = useState<number>(10);
  const [profitStrategy, setProfitStrategy] = useState<'popular' | 'regular' | 'premium'>('regular');
  const [pricingResult, setPricingResult] = useState('');

  const fabricOptions = [
    'Poliamida Premium',
    'Elastano Lycra',
    'Fio Emana (Termo)',
    'Suplex Compressão',
    'Dry-Fit Poliéster',
    'Jacquard Texturizado',
    'Fio de Lurex Brilhante',
    'Proteção UV50+'
  ];

  // Helper to handle client selection and auto-fill details
  const handleClientSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const name = e.target.value;
    setWaClientName(name);
    const matched = clients.find(c => c.name === name);
    if (matched) {
      setWaPhone(matched.phone || '');
    }
  };

  // Helper to trigger temporary visual copy state
  const handleCopyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Toggle item in fabric array
  const handleFabricToggle = (fabric: string) => {
    if (descMaterials.includes(fabric)) {
      setDescMaterials(prev => prev.filter(f => f !== fabric));
    } else {
      setDescMaterials(prev => [...prev, fabric]);
    }
  };

  // Toggle selected products for Stylist
  const handleStylistProductToggle = (prodId: string) => {
    if (selectedProdIds.includes(prodId)) {
      setSelectedProdIds(prev => prev.filter(id => id !== prodId));
    } else {
      if (selectedProdIds.length >= 4) {
        alert("O estilista cria combinações ideais com até 4 peças do catálogo!");
        return;
      }
      setSelectedProdIds(prev => [...prev, prodId]);
    }
  };

  // Simple Regex-based Markdown to HTML renderer for clean visualization without external libraries
  const renderMarkdown = (mdText: string) => {
    if (!mdText) return null;
    
    // Split into lines
    const lines = mdText.split('\n');
    return lines.map((line, idx) => {
      // Headers
      if (line.startsWith('### ')) {
        return <h4 key={idx} className="text-sm font-bold text-slate-800 mt-4 mb-2 flex items-center gap-1">{line.replace('### ', '')}</h4>;
      }
      if (line.startsWith('## ')) {
        return <h3 key={idx} className="text-base font-bold text-slate-900 border-b border-pink-100 pb-1 mt-5 mb-3 flex items-center gap-1 text-pink-600">{line.replace('## ', '')}</h3>;
      }
      if (line.startsWith('# ')) {
        return <h2 key={idx} className="text-lg font-black text-slate-950 mt-6 mb-4 font-sans tracking-tight border-b-2 border-slate-100 pb-1.5">{line.replace('# ', '')}</h2>;
      }
      
      // Bullets
      if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
        const content = line.trim().substring(2);
        return (
          <li key={idx} className="ml-4 text-xs text-slate-600 list-disc py-0.5 leading-relaxed">
            {parseInlineStyling(content)}
          </li>
        );
      }

      // Enumerated Lists
      const numberedMatch = line.trim().match(/^\d+\.\s(.*)/);
      if (numberedMatch) {
        return (
          <li key={idx} className="ml-4 text-xs text-slate-600 list-decimal py-0.5 leading-relaxed">
            {parseInlineStyling(numberedMatch[1])}
          </li>
        );
      }

      // Divider lines
      if (line.trim() === '---' || line.trim() === '***') {
        return <hr key={idx} className="my-4 border-slate-100" />;
      }

      // Empty Lines
      if (!line.trim()) {
        return <div key={idx} className="h-2" />;
      }

      // Standard Paragraph
      return (
        <p key={idx} className="text-xs text-slate-600 leading-relaxed font-sans mb-2">
          {parseInlineStyling(line)}
        </p>
      );
    });
  };

  // Helper to parse bolds and italics inline
  const parseInlineStyling = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*|\*.*?\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} className="font-bold text-slate-800">{part.slice(2, -2)}</strong>;
      }
      if (part.startsWith('*') && part.endsWith('*')) {
        return <em key={i} className="italic text-slate-700">{part.slice(1, -1)}</em>;
      }
      return part;
    });
  };

  // 1. Submit Product Description Agent
  const handleGenerateDescription = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setLoadingMessage('O Agente Redator está inspecionando o tecido e desenhando a descrição...');
    setDescResult('');

    try {
      const response = await fetch('/api/gemini/generate-description', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image: descImage,
          name: descName,
          materials: descMaterials,
          style: descStyle,
          extraInstructions: descExtra
        })
      });

      const resData = await response.json();
      if (resData.success && resData.text) {
        setDescResult(resData.text);
      } else {
        throw new Error(resData.error || 'Erro inesperado da IA.');
      }
    } catch (err: any) {
      alert(`Erro: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // 2. Submit Trend Lookbook Agent
  const handleGenerateLookbook = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setLoadingMessage('O Estilista Virtual está selecionando combinações e redigindo copys...');
    setLookbookResult('');

    const matchingProducts = products.filter(p => selectedProdIds.includes(p.id));

    try {
      const response = await fetch('/api/gemini/trends-lookbook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          products: matchingProducts,
          styleTone
        })
      });

      const resData = await response.json();
      if (resData.success && resData.text) {
        setLookbookResult(resData.text);
      } else {
        throw new Error(resData.error || 'Erro inesperado do Estilista IA.');
      }
    } catch (err: any) {
      alert(`Erro no estilista: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // 3. Submit WhatsApp outreach Copilot
  const handleGenerateWhatsApp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setLoadingMessage('Redigindo roteiro customizado com gatilhos de boutique fitness...');
    setWhatsappResult('');

    let scDetail = waScenario;
    if (waDiscount) {
      scDetail += ' (Oferecer Cupom FIT10 com 10% de desconto adicional)';
    }

    try {
      const response = await fetch('/api/gemini/whatsapp-script', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scenario: scDetail,
          clientName: waClientName,
          productDetails: waProductDetail
        })
      });

      const resData = await response.json();
      if (resData.success && resData.text) {
        setWhatsappResult(resData.text);
      } else {
        throw new Error(resData.error || 'A IA não respondeu seu script.');
      }
    } catch (err: any) {
      alert(`Erro no script de WhatsApp: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // 4. Submit Stock Sentinel Analyzer Report
  const handleRunStockAudit = async () => {
    setLoading(true);
    setLoadingMessage('O Sentinela de Estoque está compilando taxas de giro, coberturas e metas...');
    setSentinelResult('');

    try {
      const response = await fetch('/api/gemini/stock-sentinel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productsList: products
        })
      });

      const resData = await response.json();
      if (resData.success && resData.text) {
        setSentinelResult(resData.text);
      } else {
        throw new Error(resData.error || 'Sentinela ocupado ou sem conexão.');
      }
    } catch (err: any) {
      alert(`Falha na Auditoria do Sentinela: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // 5. Submit Campaign Planner Agent
  const handleGenerateCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setLoadingMessage('O Diretor de Campanhas está gerando o planejamento de vendas e ganchos promocionais...');
    setCampResult('');

    try {
      const response = await fetch('/api/gemini/marketing-campaign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          theme: campTheme,
          discount: campDiscount,
          focusCategory: campCategory,
          targetAudience: campAudience
        })
      });

      const resData = await response.json();
      if (resData.success && resData.text) {
        setCampResult(resData.text);
      } else {
        throw new Error(resData.error || 'Erro inesperado do planejador.');
      }
    } catch (err: any) {
      alert(`Erro na Campanha: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // 6. Submit Color Specialist Agent
  const handleGenerateColorHarmony = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setLoadingMessage('A Consultora de Cores está calculando harmonias por Pantone e gerando dicas...');
    setColorResult('');

    try {
      const response = await fetch('/api/gemini/color-consultant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          primaryColor: colorPrim,
          fabricTexture: colorTextu,
          usageVibe: colorVibeOption
        })
      });

      const resData = await response.json();
      if (resData.success && resData.text) {
        setColorResult(resData.text);
      } else {
        throw new Error(resData.error || 'A consultora está ocupada.');
      }
    } catch (err: any) {
      alert(`Erro na Consultoria de Cores: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // 7. Submit Global Translator Agent
  const handleGenerateTranslation = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setLoadingMessage('O Tradutor de Moda está vertendo a ficha técnica com termos estilísticos refinados...');
    setTransResult('');

    try {
      const response = await fetch('/api/gemini/fashion-translator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          textToTranslate: transText,
          targetLanguage: transLang
        })
      });

      const resData = await response.json();
      if (resData.success && resData.text) {
        setTransResult(resData.text);
      } else {
        throw new Error(resData.error || 'Falha na tradução de e-commerce.');
      }
    } catch (err: any) {
      alert(`Erro de Tradução: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // 8. Submit Costing & Pricing Analyzer Agent
  const handleGeneratePricing = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setLoadingMessage('O Precificador IA está calculando custos e projetando margens ótimas para o nicho de fitness...');
    setPricingResult('');

    try {
      const response = await fetch('/api/gemini/analyze-pricing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productName: priceProdName,
          category: priceCategory,
          costFabric,
          costLabor,
          costAccessories,
          costBranding,
          fixedOverhead,
          profitStrategy
        })
      });

      const resData = await response.json();
      if (resData.success && resData.text) {
        setPricingResult(resData.text);
      } else {
        throw new Error(resData.error || 'Erro inesperado do Precificador IA.');
      }
    } catch (err: any) {
      alert(`Erro no precificador: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Helper to send generated text direct as WhatsApp
  const handleSendWhatsAppMessage = (textMessage: string) => {
    if (!textMessage) return;
    
    // Quick sanitizing of markdown headers or bolds for WhatsApp clean layout
    const formatted = textMessage
      .replace(/\*\*/g, '*') // Convert markdown bold to WhatsApp asterisks bold
      .replace(/^##\s(.*)/gm, '*$1*') // Title lines to bold
      .replace(/^###\s(.*)/gm, '*$1*')
      .replace(/^-\s/gm, '• '); // Replace list bullet

    const encoded = encodeURIComponent(formatted);
    const phoneClean = waPhone.replace(/\D/g, '');
    const url = `https://api.whatsapp.com/send?${phoneClean ? `phone=55${phoneClean}&` : ''}text=${encoded}`;
    window.open(url, '_blank');
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Top Welcome Title Banner */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 relative overflow-hidden shadow-xl border border-slate-800">
        <div className="absolute top-0 right-0 w-64 h-64 bg-pink-500/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl -ml-20 -mb-20"></div>

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative z-10">
          <div className="space-y-1.5 text-left">
            <div className="flex items-center gap-2">
              <span className="bg-pink-500/20 text-pink-400 font-bold text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-full border border-pink-500/30 flex items-center gap-1">
                <Sparkles size={11} className="animate-pulse" />
                Gemini 3.5 Engine Ativo
              </span>
            </div>
            <h1 className="text-xl md:text-2xl font-black tracking-tight" id="agent-hub-title">
              Central de Agentes & Assistentes de IA
            </h1>
            <p className="text-slate-400 text-xs">
              Automação inteligente e geradores cognitivos calibrados para moda fitness premium, CRM VIP e controle avançado.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex -space-x-2">
              <div className="w-8 h-8 rounded-full bg-pink-150 border-2 border-slate-900 text-pink-600 font-bold text-[11px] flex items-center justify-center">RD</div>
              <div className="w-8 h-8 rounded-full bg-emerald-100 border-2 border-slate-900 text-emerald-700 font-bold text-[11px] flex items-center justify-center">ES</div>
              <div className="w-8 h-8 rounded-full bg-violet-100 border-2 border-slate-900 text-violet-700 font-bold text-[11px] flex items-center justify-center">CO</div>
              <div className="w-8 h-8 rounded-full bg-indigo-100 border-2 border-slate-900 text-indigo-700 font-bold text-[11px] flex items-center justify-center">ST</div>
              <div className="w-8 h-8 rounded-full bg-amber-100 border-2 border-slate-900 text-amber-700 font-bold text-[11px] flex items-center justify-center">MK</div>
              <div className="w-8 h-8 rounded-full bg-cyan-100 border-2 border-slate-900 text-cyan-750 font-bold text-[11px] flex items-center justify-center">CH</div>
              <div className="w-8 h-8 rounded-full bg-purple-100 border-2 border-slate-900 text-purple-750 font-bold text-[11px] flex items-center justify-center">TR</div>
            </div>
            <span className="text-[11px] text-slate-400 font-mono font-medium pl-1">7 Agentes Online</span>
          </div>
        </div>
      </div>

      {/* Agents Sub-Tabs Navigation */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveSubTab('descritor')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
            activeSubTab === 'descritor'
              ? 'bg-pink-600 text-white shadow-md shadow-pink-500/15'
              : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200'
          }`}
        >
          <Scissors size={14} />
          <span>Redator de Peças VIP</span>
        </button>

        <button
          onClick={() => setActiveSubTab('estilista')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
            activeSubTab === 'estilista'
              ? 'bg-pink-600 text-white shadow-md shadow-pink-500/15'
              : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200'
          }`}
        >
          <Bot size={14} />
          <span>Estilista Lookbook</span>
        </button>

        <button
          onClick={() => setActiveSubTab('whatsapp')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
            activeSubTab === 'whatsapp'
              ? 'bg-pink-600 text-white shadow-md shadow-pink-500/15'
              : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200'
          }`}
        >
          <MessageSquare size={14} />
          <span>Copiloto WhatsApp</span>
        </button>

        <button
          onClick={() => {
            setActiveSubTab('sentinela');
            // Lazy load sentinel audit output so user doesn't wait
            if (!sentinelResult) {
              handleRunStockAudit();
            }
          }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
            activeSubTab === 'sentinela'
              ? 'bg-pink-600 text-white shadow-md shadow-pink-500/15'
              : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200'
          }`}
        >
          <TrendingUp size={14} />
          <span>Sentinela de Estoque</span>
        </button>

        <button
          onClick={() => setActiveSubTab('campanha')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
            activeSubTab === 'campanha'
              ? 'bg-pink-600 text-white shadow-md shadow-pink-500/15'
              : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200'
          }`}
        >
          <Megaphone size={14} />
          <span>Planejador de Campanhas</span>
        </button>

        <button
          onClick={() => setActiveSubTab('consultoria')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
            activeSubTab === 'consultoria'
              ? 'bg-pink-600 text-white shadow-md shadow-pink-500/15'
              : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200'
          }`}
        >
          <Palette size={14} />
          <span>Combinação de Cores</span>
        </button>

        <button
          onClick={() => setActiveSubTab('tradutor')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
            activeSubTab === 'tradutor'
              ? 'bg-pink-600 text-white shadow-md shadow-pink-500/15'
              : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200'
          }`}
        >
          <Globe size={14} />
          <span>Tradutor de Moda</span>
        </button>

        <button
          onClick={() => setActiveSubTab('precificador')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
            activeSubTab === 'precificador'
              ? 'bg-pink-600 text-white shadow-md shadow-pink-500/15'
              : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200'
          }`}
        >
          <Percent size={14} />
          <span>Precificador Inteligente</span>
        </button>
      </div>

      {/* Main Interface Split Screen (Form Layout + Output Window) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT COLUMN: Input form for the active agent */}
        <div className="lg:col-span-5 bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs text-left">
          
          {/* TAB 1: PRODUCT DESCRIPTION GENERATOR AGENT */}
          {activeSubTab === 'descritor' && (
            <form onSubmit={handleGenerateDescription} className="space-y-4">
              <div className="border-b border-slate-50 pb-3 mb-2">
                <span className="text-[10px] font-bold text-pink-600 uppercase tracking-widest block mb-0.5">Agente Redator Premium</span>
                <h3 className="text-sm font-black text-slate-800">Descrições Apaixonantes de Peças</h3>
                <p className="text-[10px] text-slate-400 mt-1">Insira as especificações da peça ou faça o upload de uma foto que a IA irá descrever os tecidos, diferenciais técnicos e coordenar looks de e-commerce.</p>
              </div>

              <div>
                <label className="block text-slate-500 font-bold text-[10px] uppercase mb-1">Nome sugerido do Produto</label>
                <input 
                  type="text"
                  required
                  placeholder="Ex: Legging Emphathy Jacquard Rosê"
                  value={descName}
                  onChange={(e) => setDescName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-sans text-slate-700 text-xs focus:outline-hidden focus:border-pink-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-slate-500 font-bold text-[10px] uppercase mb-1">Foto da Peça (Arrastar/Colar ou Selecionar)</label>
                <ImageUploader 
                  onUploadSuccess={(url) => setDescImage(url)}
                  currentImageUrl={descImage}
                />
                
                {descImage && (
                  <div className="flex items-center gap-2 mt-2 bg-slate-50 p-2 rounded-lg border border-slate-150">
                    <span className="text-[9px] text-slate-400 font-mono truncate max-w-xs">{descImage}</span>
                    <button 
                      type="button" 
                      onClick={() => setDescImage('')}
                      className="ml-auto text-rose-500 hover:text-rose-600 text-[10px] cursor-pointer"
                    >
                      Remover URL
                    </button>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-slate-500 font-bold text-[10px] uppercase mb-1">Dose Adicional de Materiais / Fios</label>
                <div className="grid grid-cols-2 gap-2 mt-1">
                  {fabricOptions.map((fabric) => {
                    const isSelected = descMaterials.includes(fabric);
                    return (
                      <button
                        type="button"
                        key={fabric}
                        onClick={() => handleFabricToggle(fabric)}
                        className={`px-2.5 py-1.5 rounded-lg border text-left text-[11px] transition-all flex items-center justify-between cursor-pointer ${
                          isSelected
                            ? 'bg-pink-50 border-pink-200 text-pink-700 font-bold shadow-2xs'
                            : 'bg-white border-slate-150 hover:bg-slate-50 text-slate-650'
                        }`}
                      >
                        <span>{fabric}</span>
                        {isSelected && <CheckSquare size={12} className="text-pink-650 shrink-0 ml-1" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-slate-500 font-bold text-[10px] uppercase mb-1">Vibe e Estilo da Modelagem</label>
                <select 
                  value={descStyle}
                  onChange={(e) => setDescStyle(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-sans text-slate-700 text-xs focus:outline-hidden"
                >
                  <option value="Alta Performance (Musculação/Running)">Alta Performance (Musculação/Running)</option>
                  <option value="Casual & Academia (Dia-a-Dia)">Casual & Academia (Dia-a-Dia)</option>
                  <option value="Compressão Ativa (Modeladora Sem Costura)">Compressão Ativa (Modeladora Sem Costura)</option>
                  <option value="Conforto Absoluto & Wellness (Yoga/Pilates)">Conforto Absoluto & Wellness (Yoga/Pilates)</option>
                  <option value="Boutique Glamour (Brilhos, Recortes & Cirrê)">Boutique Glamour (Brilhos, Recortes & Cirrê)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-500 font-bold text-[10px] uppercase mb-1">Gatilhos Extras & Diferenciais (Opcional)</label>
                <textarea 
                  rows={2}
                  placeholder="Ex: Cós duplo largo ultra anatômico, detalhe empina-bumbum nas costas, zero transparência garantido, etc."
                  value={descExtra}
                  onChange={(e) => setDescExtra(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-sans text-slate-700 text-xs focus:outline-hidden focus:border-pink-500 transition-all resize-none"
                />
              </div>

              <button 
                type="submit"
                disabled={loading}
                className="w-full bg-slate-900 hover:bg-slate-950 text-white font-bold rounded-xl py-2.5 text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-md disabled:bg-slate-400"
              >
                {loading ? (
                  <>
                    <Loader2 size={13} className="animate-spin" />
                    <span>Processando Peça...</span>
                  </>
                ) : (
                  <>
                    <Sparkles size={13} className="text-pink-400 animate-pulse" />
                    <span>Gerar Descrição de E-commerce</span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* TAB 2: TREND LOOKBOOK ESTILISTA IA */}
          {activeSubTab === 'estilista' && (
            <form onSubmit={handleGenerateLookbook} className="space-y-4">
              <div className="border-b border-slate-50 pb-3 mb-2">
                <span className="text-[10px] font-bold text-pink-600 uppercase tracking-widest block mb-0.5">Agente de Estilo & Lookbook</span>
                <h3 className="text-sm font-black text-slate-800">Estilista Virtual de Coleções</h3>
                <p className="text-[10px] text-slate-400 mt-1">Selecione peças do seu catálogo atual para que o estilista elabore um lookbook coordenado de vendas e gere as legendas perfeitas para o Instagram.</p>
              </div>

              <div>
                <label className="block text-slate-550 font-bold text-[10px] uppercase mb-1">Selecione até 4 Peças do Catálogo</label>
                <div className="max-h-56 overflow-y-auto space-y-1.5 divide-y divide-slate-100 pr-1.5">
                  {products.length === 0 ? (
                    <p className="text-[10px] text-slate-400 py-4 text-center">Nenhum produto cadastrado no catálogo.</p>
                  ) : (
                    products.map((p) => {
                      const isSelected = selectedProdIds.includes(p.id);
                      return (
                        <div 
                          key={p.id}
                          className={`flex items-center gap-2.5 py-1.5 px-2 rounded-lg cursor-pointer transition-colors ${
                            isSelected ? 'bg-pink-50/15 border border-pink-100' : 'hover:bg-slate-50'
                          }`}
                          onClick={() => handleStylistProductToggle(p.id)}
                        >
                          <input 
                            type="checkbox"
                            checked={isSelected}
                            readOnly
                            className="rounded text-pink-605"
                          />
                          <img src={p.image} alt="Produto" className="w-8 h-8 rounded-lg object-cover" referrerPolicy="no-referrer" />
                          <div className="flex-1 min-w-0">
                            <p className="text-[11px] font-bold text-slate-700 truncate">{p.name}</p>
                            <p className="text-[9px] text-slate-400 font-mono">SKU: {p.sku} | Estoque: {p.stock} pçs</p>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
                <p className="text-[9px] text-slate-400 mt-2">Selecionados: {selectedProdIds.length} de 4 peças.</p>
              </div>

              <div>
                <label className="block text-slate-550 font-bold text-[10px] uppercase mb-1">Vibe e Direção de Estilo</label>
                <select 
                  value={styleTone}
                  onChange={(e) => setStyleTone(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-sans text-slate-700 text-xs focus:outline-hidden"
                >
                  <option value="Sustentável, Casual e Urbano">Sustentável, Casual e Urbano</option>
                  <option value="Alto Brilho & Luxo de Academia (Glow Glam)">Alto Brilho & Luxo de Academia (Glow Glam)</option>
                  <option value="Ultra Conforto, Yoga & Pilates (Minimal Zen)">Ultra Conforto, Yoga & Pilates (Minimal Zen)</option>
                  <option value="Performance Extrema & Compressão (Fitness Hard)">Performance Extrema & Compressão (Fitness Hard)</option>
                  <option value="Cores Candy e Recortes Esportivos Modernos">Cores Candy e Recortes Esportivos Modernos</option>
                </select>
              </div>

              <button 
                type="submit"
                disabled={loading || selectedProdIds.length === 0}
                className="w-full bg-slate-900 hover:bg-slate-950 text-white font-bold rounded-xl py-2.5 text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-md disabled:bg-slate-350"
              >
                {loading ? (
                  <>
                    <Loader2 size={13} className="animate-spin" />
                    <span>Confeccionando Roteiros...</span>
                  </>
                ) : (
                  <>
                    <Bot size={13} className="text-pink-400" />
                    <span>Criar Combinações de Looks</span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* TAB 3: SAC WHATSAPP IA COPILOT */}
          {activeSubTab === 'whatsapp' && (
            <form onSubmit={handleGenerateWhatsApp} className="space-y-4">
              <div className="border-b border-slate-50 pb-3 mb-2">
                <span className="text-[10px] font-bold text-pink-600 uppercase tracking-widest block mb-0.5">SAC & Copiloto WhatsApp</span>
                <h3 className="text-sm font-black text-slate-800">Redator de Roteiros e Follow-ups</h3>
                <p className="text-[10px] text-slate-400 mt-1">Crie mensagens extremamente humanas, simpáticas e focadas em converter vendas de clientes VIP.</p>
              </div>

              <div>
                <label className="block text-slate-550 font-bold text-[10px] uppercase mb-1">Cenário de Atendimento</label>
                <select 
                  value={waScenario}
                  onChange={(e) => setWaScenario(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-sans text-slate-700 text-xs focus:outline-hidden"
                >
                  <option value="Carrinho Abandonado / Duração do Pix expirando">Carrinho Abandonado / Pix expirando</option>
                  <option value="Divulgação de Campanha e Lançamento de Nova Coleção">Divulgação de Nova Coleção</option>
                  <option value="Avisar que a Peça Desejada Chegou na Loja">Peça Desejada Chegou!</option>
                  <option value="Parabenizar Cliente Aniversariante com mimo especial">Aniversariante do Mês VIP</option>
                  <option value="Agradecimento pós-compra e dicas de lavagem premium">Pós-venda agradecimento & cuidados</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-550 font-bold text-[10px] uppercase mb-1">Vincular Cliente cadastrada (Opcional)</label>
                <select 
                  onChange={handleClientSelect}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-sans text-slate-700 text-xs focus:outline-hidden"
                >
                  <option value="">-- Selecione uma cliente para puxar dados --</option>
                  {clients.map(c => (
                    <option key={c.id} value={c.name}>{c.name} ({c.phone})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-550 font-bold text-[10px] uppercase mb-1">Nome da Cliente na Mensagem</label>
                <input 
                  type="text"
                  required
                  placeholder="Ex: Beatriz Pereira"
                  value={waClientName}
                  onChange={(e) => setWaClientName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-sans text-slate-700 text-xs focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-slate-550 font-bold text-[10px] uppercase mb-1">WhatsApp para Disparo Direto</label>
                <input 
                  type="text"
                  placeholder="Ex: 11999999999"
                  value={waPhone}
                  onChange={(e) => setWaPhone(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-mono text-slate-700 text-xs focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-slate-550 font-bold text-[10px] uppercase mb-1">Peça ou Coleção Referência</label>
                <input 
                  type="text"
                  required
                  placeholder="Ex: Conjunto Infinity Neon Pink"
                  value={waProductDetail}
                  onChange={(e) => setWaProductDetail(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-sans text-slate-700 text-xs focus:outline-hidden"
                />
              </div>

              <div className="flex items-center gap-2 bg-slate-50 p-2.5 rounded-lg border border-slate-150">
                <input 
                  type="checkbox"
                  id="waDiscount"
                  checked={waDiscount}
                  onChange={(e) => setWaDiscount(e.target.checked)}
                  className="rounded text-pink-600 focus:ring-pink-500"
                />
                <label htmlFor="waDiscount" className="text-[11px] font-bold text-slate-600 select-none">Inserir Cupom FIT10 Extra e Frete Grátis</label>
              </div>

              <button 
                type="submit"
                disabled={loading}
                className="w-full bg-slate-900 hover:bg-slate-950 text-white font-bold rounded-xl py-2.5 text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-md disabled:bg-slate-400"
              >
                {loading ? (
                  <>
                    <Loader2 size={13} className="animate-spin" />
                    <span>Redigindo no WhatsApp...</span>
                  </>
                ) : (
                  <>
                    <MessageSquare size={13} className="text-pink-400" />
                    <span>Gerar Roteiro VIP</span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* TAB 4: SENTINELA DE ESTOQUE */}
          {activeSubTab === 'sentinela' && (
            <div className="space-y-4">
              <div className="border-b border-slate-50 pb-3 mb-2">
                <span className="text-[10px] font-bold text-pink-600 uppercase tracking-widest block mb-0.5">Agente Sentinela de Liquidez</span>
                <h3 className="text-sm font-black text-slate-800">Auditoria Preditiva e Caixas</h3>
                <p className="text-[10px] text-slate-400 mt-1">Este agente examina volumes, limites de segurança do estoque mínimo de cada peça e gera diagnósticos preditivos para faturamento de caixa.</p>
              </div>

              <div className="bg-slate-50 rounded-xl p-3 border border-slate-150 text-xs space-y-2">
                <h4 className="font-bold text-slate-700">Métricas Alimentadas Atualmente:</h4>
                <div className="grid grid-cols-2 gap-2 text-[10px]">
                  <div className="bg-white p-2 rounded-lg border border-slate-100">
                    <span className="text-slate-400 block font-medium">Peças no Estoque</span>
                    <span className="text-slate-700 font-extrabold font-mono text-xs">{products.reduce((acc, p) => acc + p.stock, 0)} pçs</span>
                  </div>
                  <div className="bg-white p-2 rounded-lg border border-slate-100">
                    <span className="text-slate-400 block font-medium">Urgência de Compra</span>
                    <span className="text-red-600 font-extrabold font-mono text-xs">
                      {products.filter(p => p.stock < p.minStock).length} Itens
                    </span>
                  </div>
                </div>
              </div>

              <button 
                type="button"
                onClick={handleRunStockAudit}
                disabled={loading}
                className="w-full bg-slate-900 hover:bg-slate-950 text-white font-bold rounded-xl py-2.5 text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-md disabled:bg-slate-400"
              >
                {loading ? (
                  <>
                    <Loader2 size={13} className="animate-spin" />
                    <span>Processando Auditoria...</span>
                  </>
                ) : (
                  <>
                    <TrendingUp size={13} className="text-pink-400" />
                    <span>Medir Força de Giro & Caixa</span>
                  </>
                )}
              </button>
            </div>
          )}

          {/* TAB 5: PLANEJADOR DE CAMPANHAS DE MARKETING */}
          {activeSubTab === 'campanha' && (
            <form onSubmit={handleGenerateCampaign} className="space-y-4">
              <div className="border-b border-slate-50 pb-3 mb-2">
                <span className="text-[10px] font-bold text-pink-600 uppercase tracking-widest block mb-0.5">Marketing & Sazonalidades</span>
                <h3 className="text-sm font-black text-slate-800">Diretor de Campanhas Promo</h3>
                <p className="text-[10px] text-slate-400 mt-1">Desenhe campanhas promocionais de alto impacto, slogans inesquecíveis, ganchos emocionais e legendas estratégicas prontos para as suas redes sociais.</p>
              </div>

              <div>
                <label className="block text-slate-550 font-bold text-[10px] uppercase mb-1">Tema / Data Comemorativa</label>
                <input 
                  type="text"
                  required
                  placeholder="Ex: Dia dos Namorados VIP, Black Friday Fitness"
                  value={campTheme}
                  onChange={(e) => setCampTheme(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-sans text-slate-700 text-xs focus:outline-hidden focus:border-pink-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-slate-550 font-bold text-[10px] uppercase mb-1">Benefício ou Cupom Oferecido</label>
                <input 
                  type="text"
                  required
                  placeholder="Ex: 15% de Desconto com cupom FITVALENTINES"
                  value={campDiscount}
                  onChange={(e) => setCampDiscount(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-sans text-slate-700 text-xs focus:outline-hidden focus:border-pink-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-slate-550 font-bold text-[10px] uppercase mb-1">Categoria ou Peças de Foco</label>
                <input 
                  type="text"
                  required
                  placeholder="Ex: Conjuntos de Lurex & Leggings Modeladoras"
                  value={campCategory}
                  onChange={(e) => setCampCategory(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-sans text-slate-700 text-xs focus:outline-hidden focus:border-pink-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-slate-550 font-bold text-[10px] uppercase mb-1">Público-Alvo e Vibe</label>
                <textarea 
                  rows={2}
                  required
                  placeholder="Ex: Clientes VIP que amam sofisticação e roupas elegantes para malhar."
                  value={campAudience}
                  onChange={(e) => setCampAudience(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-sans text-slate-700 text-xs focus:outline-hidden focus:border-pink-500 transition-all resize-none"
                />
              </div>

              <button 
                type="submit"
                disabled={loading}
                className="w-full bg-slate-900 hover:bg-slate-950 text-white font-bold rounded-xl py-2.5 text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-md disabled:bg-slate-400"
              >
                {loading ? (
                  <>
                    <Loader2 size={13} className="animate-spin" />
                    <span>Estruturando Campanha...</span>
                  </>
                ) : (
                  <>
                    <Megaphone size={13} className="text-pink-400" />
                    <span>Planejar Campanha Expressa</span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* TAB 6: CONSULTORIA DE HARMONIA DE CORES & PANTONE */}
          {activeSubTab === 'consultoria' && (
            <form onSubmit={handleGenerateColorHarmony} className="space-y-4">
              <div className="border-b border-slate-50 pb-3 mb-2">
                <span className="text-[10px] font-bold text-pink-600 uppercase tracking-widest block mb-0.5">Estilo & Colorimetria</span>
                <h3 className="text-sm font-black text-slate-800">Especialista de Combinações de Tons</h3>
                <p className="text-[10px] text-slate-400 mt-1">A IA funciona como consultora técnica de cores. Insira o tom principal do tecido para obter paletas análogas, complementares e conselhos de coordenação visual.</p>
              </div>

              <div>
                <label className="block text-slate-550 font-bold text-[10px] uppercase mb-1">Cor Principal do Tecido</label>
                <input 
                  type="text"
                  required
                  placeholder="Ex: Verde Neon, Rosê Atômico, Violeta Orquídea"
                  value={colorPrim}
                  onChange={(e) => setColorPrim(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-sans text-slate-700 text-xs focus:outline-hidden focus:border-pink-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-slate-550 font-bold text-[10px] uppercase mb-1">Textura e Brilho do Tecido</label>
                <input 
                  type="text"
                  required
                  placeholder="Ex: Cirrê Metalizado, Jacquard Relevo, Matte Liso"
                  value={colorTextu}
                  onChange={(e) => setColorTextu(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-sans text-slate-700 text-xs focus:outline-hidden focus:border-pink-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-slate-550 font-bold text-[10px] uppercase mb-1">Ocasião ou Vibe de Uso</label>
                <select 
                  value={colorVibeOption}
                  onChange={(e) => setColorVibeOption(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-sans text-slate-700 text-xs focus:outline-hidden"
                >
                  <option value="Treinos Noturnos e Atividades Urbanas Premium">Treinos Noturnos e Atividades Urbanas Premium</option>
                  <option value="Yoga, Pilates & Studio Mindful (Tons Calmos)">Yoga, Pilates & Studio Mindful (Tons Calmos)</option>
                  <option value="Corrida de Rua & Alta Performance Diurna">Corrida de Rua & Alta Performance Diurna</option>
                  <option value="Boutique Coquetel & Streetwear Casual">Boutique Coquetel & Streetwear Casual</option>
                </select>
              </div>

              <button 
                type="submit"
                disabled={loading}
                className="w-full bg-slate-900 hover:bg-slate-950 text-white font-bold rounded-xl py-2.5 text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-md disabled:bg-slate-400"
              >
                {loading ? (
                  <>
                    <Loader2 size={13} className="animate-spin" />
                    <span>Mapeando Cores...</span>
                  </>
                ) : (
                  <>
                    <Palette size={13} className="text-pink-400" />
                    <span>Gerar Paleta & Estilo</span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* TAB 7: TRADUTOR TÉCNICO DE MODA */}
          {activeSubTab === 'tradutor' && (
            <form onSubmit={handleGenerateTranslation} className="space-y-4">
              <div className="border-b border-slate-50 pb-3 mb-2">
                <span className="text-[10px] font-bold text-pink-600 uppercase tracking-widest block mb-0.5">Moda Global & E-commerce</span>
                <h3 className="text-sm font-black text-slate-800">Tradutor de Tecnologia Têxtil</h3>
                <p className="text-[10px] text-slate-400 mt-1">Converta termos brasileiros ("empina-bumbum", "suplex", "fio emana", "cós duplo") para correspondentes internacionais ultra-chiques.</p>
              </div>

              <div>
                <label className="block text-slate-550 font-bold text-[10px] uppercase mb-1">Descrição em Português</label>
                <textarea 
                  rows={4}
                  required
                  placeholder="Cole aqui a descrição ou ficha técnica da peça para tradução."
                  value={transText}
                  onChange={(e) => setTransText(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-sans text-slate-700 text-xs focus:outline-hidden focus:border-pink-500 transition-all resize-none"
                />
              </div>

              <div>
                <label className="block text-slate-550 font-bold text-[10px] uppercase mb-1">Idioma / E-commerce de Destino</label>
                <select 
                  value={transLang}
                  onChange={(e) => setTransLang(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-sans text-slate-700 text-xs focus:outline-hidden"
                >
                  <option value="Inglês (E-commerce EUA)">Inglês (E-commerce EUA)</option>
                  <option value="Inglês (Reino Unido / Boutique Europa)">Inglês (Reino Unido / Boutique Europa)</option>
                  <option value="Espanhol (Espanha / Luxury Studio)">Espanhol (Espanha / Luxury Studio)</option>
                  <option value="Espanhol (Mercado Latino-Americano)">Espanhol (Mercado Latino-Americano)</option>
                  <option value="Francês (França / High Style)">Francês (França / High Style)</option>
                </select>
              </div>

              <button 
                type="submit"
                disabled={loading}
                className="w-full bg-slate-900 hover:bg-slate-950 text-white font-bold rounded-xl py-2.5 text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-md disabled:bg-slate-400"
              >
                {loading ? (
                  <>
                    <Loader2 size={13} className="animate-spin" />
                    <span>Vertendo Idioma...</span>
                  </>
                ) : (
                  <>
                    <Globe size={13} className="text-pink-400" />
                    <span>Traduzir Ficha Técnica</span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* TAB 8: PRECIFICADOR INTELIGENTE IA */}
          {activeSubTab === 'precificador' && (
            <form onSubmit={handleGeneratePricing} className="space-y-4">
              <div className="border-b border-slate-50 pb-3 mb-2">
                <span className="text-[10px] font-bold text-pink-600 uppercase tracking-widest block mb-0.5">Finanças & Inteligência Têxtil</span>
                <h3 className="text-sm font-black text-slate-800">Precificador Inteligente IA</h3>
                <p className="text-[10px] text-slate-400 mt-1">Insira os custos dos materiais de confecção e mão de obra de suas novas peças fitness e a IA sugerirá o preço de venda e margens de lucro ideais.</p>
              </div>

              <div>
                <label className="block text-slate-500 font-bold text-[10px] uppercase mb-1">Nome do Novo Produto</label>
                <input 
                  type="text"
                  required
                  placeholder="Ex: Calça Legging Power Glow Cirrê"
                  value={priceProdName}
                  onChange={(e) => setPriceProdName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-sans text-slate-700 text-xs focus:outline-hidden focus:border-pink-500 transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 text-left">
                <div>
                  <label className="block text-slate-500 font-bold text-[10px] uppercase mb-1">Categoria</label>
                  <select 
                    value={priceCategory}
                    onChange={(e) => setPriceCategory(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-sans text-slate-700 text-xs focus:outline-hidden"
                  >
                    <option value="Legging">Legging</option>
                    <option value="Top Fitness">Top Fitness</option>
                    <option value="Shorts Compressão">Shorts Compressão</option>
                    <option value="Macacão Fitness">Macacão Fitness</option>
                    <option value="Cropped / Regata">Cropped / Regata</option>
                    <option value="Body / Macaquinho">Body / Macaquinho</option>
                    <option value="Conjunto Duas Peças">Conjunto Duas Peças</option>
                    <option value="Outros">Outros</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-500 font-bold text-[10px] uppercase mb-1">Custo Tecidos (R$)</label>
                  <input 
                    type="number"
                    step="0.01"
                    required
                    placeholder="Ex: 18.50"
                    value={costFabric}
                    onChange={(e) => setCostFabric(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-mono text-slate-700 text-xs focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-left">
                <div>
                  <label className="block text-slate-500 font-bold text-[10px] uppercase mb-1">Custo Costura (R$)</label>
                  <input 
                    type="number"
                    step="0.01"
                    required
                    placeholder="Ex: 12.00"
                    value={costLabor}
                    onChange={(e) => setCostLabor(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-mono text-slate-700 text-xs focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 font-bold text-[10px] uppercase mb-1">Aviamento/Acessórios (R$)</label>
                  <input 
                    type="number"
                    step="0.01"
                    required
                    placeholder="Ex: 4.00"
                    value={costAccessories}
                    onChange={(e) => setCostAccessories(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-mono text-slate-700 text-xs focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-left">
                <div>
                  <label className="block text-slate-500 font-bold text-[10px] uppercase mb-1">Embalagem/Branding (R$)</label>
                  <input 
                    type="number"
                    step="0.01"
                    required
                    placeholder="Ex: 3.00"
                    value={costBranding}
                    onChange={(e) => setCostBranding(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-mono text-slate-700 text-xs focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 font-bold text-[10px] uppercase mb-1">Operacional/Impostos (%)</label>
                  <input 
                    type="number"
                    step="1"
                    required
                    placeholder="Ex: 10"
                    value={fixedOverhead}
                    onChange={(e) => setFixedOverhead(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-mono text-slate-700 text-xs focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-500 font-bold text-[10px] uppercase mb-1">Estratégia comercial</label>
                <select 
                  value={profitStrategy}
                  onChange={(e) => setProfitStrategy(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-sans text-slate-700 text-xs focus:outline-hidden"
                >
                  <option value="popular">Giro de Vendas / Popular (Preços Competitivos)</option>
                  <option value="regular">Boutique Padrão (Intermediário Equilibrado)</option>
                  <option value="premium">Exclusividade / Margem Máxima (Premium Fitness)</option>
                </select>
              </div>

              <button 
                type="submit"
                disabled={loading}
                className="w-full bg-slate-900 hover:bg-slate-950 text-white font-bold rounded-xl py-2.5 text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-md disabled:bg-slate-400"
              >
                {loading ? (
                  <>
                    <Loader2 size={13} className="animate-spin" />
                    <span>Analisando Custos Marginais...</span>
                  </>
                ) : (
                  <>
                    <Percent size={13} className="text-pink-400" />
                    <span>Calcular Preço Ideal</span>
                  </>
                )}
              </button>
            </form>
          )}

        </div>

        {/* RIGHT COLUMN: Output display styled as a terminal-chic digital tablet */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-slate-950 text-slate-100 rounded-3xl overflow-hidden border border-slate-900 shadow-2xl flex flex-col h-[520px]">
            
            {/* Header of Content Tablet */}
            <div className="bg-slate-900 px-4 py-3 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span className="text-slate-400 text-[10px] font-mono pl-1 tracking-wide">
                  {activeSubTab === 'descritor' && 'Redator_Premium_v2.5.md'}
                  {activeSubTab === 'estilista' && 'Lookbook_Estilista_IA.md'}
                  {activeSubTab === 'whatsapp' && 'Script_Disparo_WhatsApp.txt'}
                  {activeSubTab === 'sentinela' && 'Sentinela_Relatorio_Estoque.md'}
                  {activeSubTab === 'campanha' && 'Diretor_Campanha_Marketing.md'}
                  {activeSubTab === 'consultoria' && 'Guia_Consultoria_Cores.md'}
                  {activeSubTab === 'tradutor' && 'Trade_Fashion_Translation.md'}
                  {activeSubTab === 'precificador' && 'Calculo_Margem_Preco_Sugerido.md'}
                </span>
              </div>

              <div className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" />
                <span className="text-[10px] text-slate-405 font-mono">Pronto</span>
              </div>
            </div>

            {/* Scrollable output screen */}
            <div className="flex-1 p-5 md:p-6 overflow-y-auto bg-white/98 text-slate-850 flex flex-col justify-start">
              
              {loading ? (
                <div className="flex-1 flex flex-col items-center justify-center space-y-4 text-center py-10">
                  <div className="relative">
                    <div className="w-12 h-12 rounded-full border-4 border-pink-100 border-t-pink-600 animate-spin" />
                    <Sparkles className="absolute inset-0 m-auto text-pink-600 animate-pulse" size={18} />
                  </div>
                  <div className="max-w-xs">
                    <p className="font-bold text-slate-800 text-xs">Acessando Rede Neural Gemini...</p>
                    <p className="text-[10.5px] text-slate-406 mt-1.5 font-sans leading-relaxed animate-pulse">
                      {loadingMessage}
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  {/* Render content based on active tab outcome */}
                  {activeSubTab === 'descritor' && (
                    descResult ? (
                      <div className="space-y-4 font-sans prose max-w-none text-left">
                        {renderMarkdown(descResult)}
                      </div>
                    ) : (
                      <div className="flex-1 flex flex-col items-center justify-center text-center text-slate-400 py-10">
                        <Scissors size={28} className="text-slate-300 stroke-[1.5] mb-2 animate-bounce" />
                        <h4 className="font-bold text-slate-700 text-xs">Preparado para Redigir</h4>
                        <p className="text-[10.5px] max-w-xs mt-1">Preencha o formulário e dispare a IA para gerar a descrição premium do seu produto.</p>
                      </div>
                    )
                  )}

                  {activeSubTab === 'estilista' && (
                    lookbookResult ? (
                      <div className="space-y-4 font-sans prose max-w-none text-left">
                        {renderMarkdown(lookbookResult)}
                      </div>
                    ) : (
                      <div className="flex-1 flex flex-col items-center justify-center text-center text-slate-400 py-10">
                        <Bot size={28} className="text-slate-300 stroke-[1.5] mb-2 animate-bounce" />
                        <h4 className="font-bold text-slate-700 text-xs">Lookbook de Vendas Offline</h4>
                        <p className="text-[10.5px] max-w-xs mt-1">Selecione peças do estoque e gere ideias incríveis de looks casados com legendas cativantes.</p>
                      </div>
                    )
                  )}

                  {activeSubTab === 'whatsapp' && (
                    whatsappResult ? (
                      <div className="space-y-4 font-sans prose max-w-none text-left">
                        {renderMarkdown(whatsappResult)}
                      </div>
                    ) : (
                      <div className="flex-1 flex flex-col items-center justify-center text-center text-slate-400 py-10">
                        <MessageSquare size={28} className="text-slate-300 stroke-[1.5] mb-2 animate-bounce" />
                        <h4 className="font-bold text-slate-700 text-xs">Atendimento Humanizado</h4>
                        <p className="text-[10.5px] max-w-xs mt-1">Formule roteiros instantâneos de cobrança, promoções ou disparos de novidades.</p>
                      </div>
                    )
                  )}

                  {activeSubTab === 'sentinela' && (
                    sentinelResult ? (
                      <div className="space-y-4 font-sans prose max-w-none text-left">
                        {renderMarkdown(sentinelResult)}
                      </div>
                    ) : (
                      <div className="flex-1 flex flex-col items-center justify-center text-center text-slate-400 py-10">
                        <TrendingUp size={28} className="text-slate-300 stroke-[1.5] mb-2 animate-bounce" />
                        <h4 className="font-bold text-slate-700 text-xs">Pronto para Analisar</h4>
                        <p className="text-[10.5px] max-w-xs mt-1">Gere relatórios automatizados de margem, giro e sinal vermelho de estoque.</p>
                      </div>
                    )
                  )}

                  {activeSubTab === 'campanha' && (
                    campResult ? (
                      <div className="space-y-4 font-sans prose max-w-none text-left">
                        {renderMarkdown(campResult)}
                      </div>
                    ) : (
                      <div className="flex-1 flex flex-col items-center justify-center text-center text-slate-400 py-10">
                        <Megaphone size={28} className="text-slate-300 stroke-[1.5] mb-2" />
                        <h4 className="font-bold text-slate-700 text-xs">Planejador de Campanhas Pronto</h4>
                        <p className="text-[10.5px] max-w-xs mt-1">Defina a sazonalidade e dispare a IA para estruturar um plano de vendas arrebatador.</p>
                      </div>
                    )
                  )}

                  {activeSubTab === 'consultoria' && (
                    colorResult ? (
                      <div className="space-y-4 font-sans prose max-w-none text-left">
                        {renderMarkdown(colorResult)}
                      </div>
                    ) : (
                      <div className="flex-1 flex flex-col items-center justify-center text-center text-slate-400 py-10">
                        <Palette size={28} className="text-slate-300 stroke-[1.5] mb-2" />
                        <h4 className="font-bold text-slate-700 text-xs">Consultora de Harmonia Cromática</h4>
                        <p className="text-[10.5px] max-w-xs mt-1">Insira uma cor e textura brasileiras para obter análise de colorimetria e propostas de tons.</p>
                      </div>
                    )
                  )}

                  {activeSubTab === 'tradutor' && (
                    transResult ? (
                      <div className="space-y-4 font-sans prose max-w-none text-left">
                        {renderMarkdown(transResult)}
                      </div>
                    ) : (
                      <div className="flex-1 flex flex-col items-center justify-center text-center text-slate-400 py-10">
                        <Globe size={28} className="text-slate-300 stroke-[1.5] mb-2" />
                        <h4 className="font-bold text-slate-700 text-xs text-center">Tradutor Têxtil Global</h4>
                        <p className="text-[10.5px] max-w-xs mt-1">Escreva em português e obtenha traduções de luxo preservando termos científicos de moda fitness.</p>
                      </div>
                    )
                  )}

                  {activeSubTab === 'precificador' && (
                    pricingResult ? (
                      <div className="space-y-4 font-sans prose max-w-none text-left">
                        {renderMarkdown(pricingResult)}
                      </div>
                    ) : (
                      <div className="flex-1 flex flex-col items-center justify-center text-center text-slate-400 py-10 animate-fade-in">
                        <Percent size={28} className="text-slate-300 stroke-[1.5] mb-2 animate-bounce" />
                        <h4 className="font-bold text-slate-700 text-xs text-center">Calculadora & Precificador IA</h4>
                        <p className="text-[10.5px] max-w-xs mt-1">Insira os custos estimados da peça no formulário ao lado para obter a sugestão com inteligência de mercado fitwear.</p>
                      </div>
                    )
                  )}
                </>
              )}

            </div>

            {/* Bottom Actions of Content Tablet */}
            <div className="bg-slate-900 border-t border-slate-800 px-4 py-3 flex flex-wrap gap-2 items-center justify-between">
              
              <div className="text-slate-400 text-[10px] font-mono">
                {activeSubTab === 'descritor' && descResult && `Tamanho: ${descResult.length} caracteres`}
                {activeSubTab === 'estilista' && lookbookResult && `Tamanho: ${lookbookResult.length} caracteres`}
                {activeSubTab === 'whatsapp' && whatsappResult && `Tamanho: ${whatsappResult.length} caracteres`}
                {activeSubTab === 'sentinela' && sentinelResult && `Tamanho: ${sentinelResult.length} caracteres`}
                {activeSubTab === 'campanha' && campResult && `Tamanho: ${campResult.length} caracteres`}
                {activeSubTab === 'consultoria' && colorResult && `Tamanho: ${colorResult.length} caracteres`}
                {activeSubTab === 'tradutor' && transResult && `Tamanho: ${transResult.length} caracteres`}
                {activeSubTab === 'precificador' && pricingResult && `Tamanho: ${pricingResult.length} caracteres`}
                {!loading && !descResult && !lookbookResult && !whatsappResult && !sentinelResult && !campResult && !colorResult && !transResult && !pricingResult && 'Nenhum relatório ativo'}
              </div>

              {/* Action and copy buttons */}
              <div className="flex items-center gap-2">
                {activeSubTab === 'descritor' && descResult && (
                  <button
                    onClick={() => handleCopyText(descResult, 'desc')}
                    className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-white font-bold px-3 py-1.5 rounded-lg text-xs transition-colors cursor-pointer"
                  >
                    {copiedId === 'desc' ? (
                      <>
                        <Check size={12} className="text-emerald-400" />
                        <span className="text-emerald-400">Copiada</span>
                      </>
                    ) : (
                      <>
                        <Copy size={12} />
                        <span>Copiar Descrição</span>
                      </>
                    )}
                  </button>
                )}

                {activeSubTab === 'estilista' && lookbookResult && (
                  <button
                    onClick={() => handleCopyText(lookbookResult, 'stylist')}
                    className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-white font-bold px-3 py-1.5 rounded-lg text-xs transition-colors cursor-pointer"
                  >
                    {copiedId === 'stylist' ? (
                      <>
                        <Check size={12} className="text-emerald-400" />
                        <span className="text-emerald-400">Copiado</span>
                      </>
                    ) : (
                      <>
                        <Copy size={12} />
                        <span>Copiar Looks</span>
                      </>
                    )}
                  </button>
                )}

                {activeSubTab === 'whatsapp' && whatsappResult && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleCopyText(whatsappResult, 'wa')}
                      className="flex items-center gap-1.5 bg-slate-850 hover:bg-slate-800 text-white px-3 py-1.5 rounded-lg text-xs transition-colors cursor-pointer font-bold border border-slate-700"
                    >
                      {copiedId === 'wa' ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                      <span>{copiedId === 'wa' ? 'Copiado!' : 'Copiar Roteiro'}</span>
                    </button>

                    <button
                      onClick={() => handleSendWhatsAppMessage(whatsappResult)}
                      className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black px-4 py-1.5 rounded-lg text-xs transition-colors cursor-pointer shadow-md"
                    >
                      <Send size={12} />
                      <span>Enviar no WhatsApp</span>
                    </button>
                  </div>
                )}

                {activeSubTab === 'sentinela' && sentinelResult && (
                  <button
                    onClick={() => handleCopyText(sentinelResult, 'sentinel')}
                    className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-white font-bold px-3 py-1.5 rounded-lg text-xs transition-colors cursor-pointer"
                  >
                    {copiedId === 'sentinel' ? (
                      <>
                        <Check size={12} className="text-emerald-400" />
                        <span className="text-emerald-400">Relatório Copiado</span>
                      </>
                    ) : (
                      <>
                        <Copy size={12} />
                        <span>Copiar Relatório</span>
                      </>
                    )}
                  </button>
                )}

                {activeSubTab === 'campanha' && campResult && (
                  <button
                    onClick={() => handleCopyText(campResult, 'campaign')}
                    className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-white font-bold px-3 py-1.5 rounded-lg text-xs transition-colors cursor-pointer"
                  >
                    {copiedId === 'campaign' ? (
                      <>
                        <Check size={12} className="text-emerald-400" />
                        <span className="text-emerald-400">Copiada</span>
                      </>
                    ) : (
                      <>
                        <Copy size={12} />
                        <span>Copiar Campanha</span>
                      </>
                    )}
                  </button>
                )}

                {activeSubTab === 'consultoria' && colorResult && (
                  <button
                    onClick={() => handleCopyText(colorResult, 'color')}
                    className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-white font-bold px-3 py-1.5 rounded-lg text-xs transition-colors cursor-pointer"
                  >
                    {copiedId === 'color' ? (
                      <>
                        <Check size={12} className="text-emerald-400" />
                        <span className="text-emerald-400">Copiado</span>
                      </>
                    ) : (
                      <>
                        <Copy size={12} />
                        <span>Copiar Paleta</span>
                      </>
                    )}
                  </button>
                )}

                {activeSubTab === 'tradutor' && transResult && (
                  <button
                    onClick={() => handleCopyText(transResult, 'translate')}
                    className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-white font-bold px-3 py-1.5 rounded-lg text-xs transition-colors cursor-pointer"
                  >
                    {copiedId === 'translate' ? (
                      <>
                        <Check size={12} className="text-emerald-400" />
                        <span className="text-emerald-400">Copiado</span>
                      </>
                    ) : (
                      <>
                        <Copy size={12} />
                        <span>Copiar Tradução</span>
                      </>
                    )}
                  </button>
                )}

                {activeSubTab === 'precificador' && pricingResult && (
                  <button
                    onClick={() => handleCopyText(pricingResult, 'pricing')}
                    className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-white font-bold px-3 py-1.5 rounded-lg text-xs transition-colors cursor-pointer"
                  >
                    {copiedId === 'pricing' ? (
                      <>
                        <Check size={12} className="text-emerald-400" />
                        <span className="text-emerald-400">Copiado</span>
                      </>
                    ) : (
                      <>
                        <Copy size={12} />
                        <span>Copiar Precificação</span>
                      </>
                    )}
                  </button>
                )}
              </div>

            </div>

          </div>

          {/* Prompt/Guide hint footer block */}
          <div className="bg-pink-50/40 rounded-2xl p-4 border border-pink-100 flex items-start gap-3 text-left">
            <HelpCircle size={18} className="text-pink-650 shrink-0 mt-0.5" />
            <div>
              <h5 className="font-bold text-pink-700 text-xs">Dica de Produtividade</h5>
              <p className="text-[10px] text-slate-600 leading-relaxed mt-0.5">
                Utilize as descrições geradas no seu catálogo de produtos da <strong>Boutique AP Moda</strong> copiando-as direto para os seus canais. Se quiser mandar mensagens diretas, use o copiloto de WhatsApp para acelerar as vendas e manter seu NPS no topo!
              </p>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
