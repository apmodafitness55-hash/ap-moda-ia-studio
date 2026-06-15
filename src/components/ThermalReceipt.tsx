/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Printer, 
  X, 
  MapPin, 
  Phone, 
  FileText, 
  DollarSign, 
  Award, 
  QrCode, 
  CheckCircle,
  Copy,
  Edit2
} from 'lucide-react';
import { Sale } from '../types';

interface CompanyInfo {
  name: string;
  subName: string;
  cnpj: string;
  addressLine1: string;
  addressLine2: string;
  phone: string;
  slogan: string;
  website: string;
  instructions: string;
  pixKey: string;
}

const DEFAULT_COMPANY_INFO: CompanyInfo = {
  name: 'AP MODA FITNESS',
  subName: 'AP Moda Fitness - Confecções Femininas',
  cnpj: '12.345.678/0001-99',
  addressLine1: 'Av. Paulista, 1500 - Bela Vista',
  addressLine2: 'São Paulo - SP',
  phone: '(11) 98888-7777',
  slogan: 'Estilo, Conforto e Performance no seu Treino',
  website: 'www.apmodafitness.com.br',
  instructions: 'Para solicitar Nota Fiscal oficial, fale conosco via WhatsApp',
  pixKey: 'apmodafitness55@gmail.com'
};

interface ThermalReceiptProps {
  sale: Sale;
  onClose: () => void;
}

export default function ThermalReceipt({ sale, onClose }: ThermalReceiptProps) {
  // Load company config with localStorage fallback
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo>(() => {
    const saved = localStorage.getItem('ap_moda_company_info');
    return saved ? JSON.parse(saved) : DEFAULT_COMPANY_INFO;
  });

  // Client documentation CPF model editable live for printing
  const [clientCpf, setClientCpf] = useState<string>(() => {
    return sale.clientDoc || '000.000.000-00';
  });

  // Custom live discount on printing template (if they want to adjust, or use existing calculations)
  const [discountPercent, setDiscountPercent] = useState<number>(0);
  const [isCopiedPayString, setIsCopiedPayString] = useState(false);
  const [isEditingSettings, setIsEditingSettings] = useState(false);

  // Sync settings
  useEffect(() => {
    localStorage.setItem('ap_moda_company_info', JSON.stringify(companyInfo));
  }, [companyInfo]);

  const subtotal = useMemo(() => {
    return sale.total;
  }, [sale]);

  const discountAmount = useMemo(() => {
    return Number(((subtotal * discountPercent) / 100).toFixed(2));
  }, [subtotal, discountPercent]);

  const finalTotal = useMemo(() => {
    return Math.max(0, subtotal - discountAmount);
  }, [subtotal, discountAmount]);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  // Live dynamic Pix payload for scan copy-paste
  const pixPayload = useMemo(() => {
    const key = companyInfo.pixKey || 'pagamentos@exemplo.com';
    const amountStr = finalTotal.toFixed(2);
    // Standard Pix static structure with basic variable interpolation
    return `00020101021126580014br.gov.bcb.pix0136${key}5204000053039865407${amountStr}5802BR5915APModaFitness6009SaoPaulo62070503***6304A1B2`;
  }, [companyInfo.pixKey, finalTotal]);

  const handleCopyPixString = () => {
    navigator.clipboard.writeText(pixPayload);
    setIsCopiedPayString(true);
    setTimeout(() => setIsCopiedPayString(false), 2000);
  };

  const handlePrint = () => {
    // Add print trigger styles dynamically to avoid affecting other screens permanently
    const style = document.createElement('style');
    style.id = 'thermal-receipt-print-styles';
    style.innerHTML = `
      @media print {
        /* Hide everything */
        body * {
          visibility: hidden !important;
        }
        /* Except our container and its descendants */
        #printable-thermal-receipt, #printable-thermal-receipt * {
          visibility: visible !important;
        }
        #printable-thermal-receipt {
          position: fixed !important;
          left: 50% !important;
          top: 0 !important;
          transform: translateX(-50%) !important;
          width: 76mm !important; /* precise thermal printing paper limits */
          max-width: 100% !important;
          margin: 0 auto !important;
          padding: 2mm !important;
          border: none !important;
          box-shadow: none !important;
          background: white !important;
          color: black !important;
          font-family: 'JetBrains Mono', Courier, monospace !important;
        }
        /* Ensure no layout distortion */
        html, body {
          background: white !important;
          width: 100% !important;
          height: auto !important;
          margin: 0 !important;
          padding: 0 !important;
          overflow: visible !important;
        }
        .modal-overlay-thermal, .no-print {
          display: none !important;
          background: transparent !important;
        }
      }
    `;
    document.head.appendChild(style);

    window.print();

    // Clean up style tag after window print opens
    setTimeout(() => {
      const addedStyle = document.getElementById('thermal-receipt-print-styles');
      if (addedStyle) {
        addedStyle.remove();
      }
    }, 1000);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center z-50 p-4 overflow-y-auto modal-overlay-thermal transition-all">
      <div className="bg-slate-50 rounded-2xl max-w-4xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col md:flex-row h-full md:max-h-[85vh]">
        
        {/* Controls Configuration Panel - left on desktop */}
        <div className="flex-1 p-5 md:p-6 space-y-4 border-r border-slate-150 overflow-y-auto bg-white">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-extrabold text-slate-800 tracking-tight font-sans flex items-center gap-2">
                <Printer size={16} className="text-pink-600 animate-pulse" />
                Emissão & Configuração do Cupom
              </h3>
              <p className="text-[10px] text-slate-400 font-sans mt-0.5">Ajuste os dados de emissão e os rodapés em tempo real</p>
            </div>
            
            <button 
              onClick={() => setIsEditingSettings(!isEditingSettings)}
              className="text-xs text-pink-600 hover:text-pink-700 font-bold font-sans flex items-center gap-1 bg-pink-50 hover:bg-pink-100/70 px-2.5 py-1.5 rounded-lg cursor-pointer transition-all"
            >
              <Edit2 size={12} />
              <span>{isEditingSettings ? 'Ver Impressão' : 'Editar Empresa'}</span>
            </button>
          </div>

          {isEditingSettings ? (
            /* CONFIG PANEL FORM */
            <div className="space-y-3.5 text-xs font-sans">
              <div className="space-y-1">
                <label className="text-slate-500 font-bold uppercase text-[9px] tracking-wide select-none">Nome Fantasia (Cabeçalho principal)</label>
                <input 
                  type="text"
                  value={companyInfo.name}
                  onChange={(e) => setCompanyInfo({ ...companyInfo, name: e.target.value.toUpperCase() })}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-mono focus:outline-hidden focus:border-pink-500 font-semibold"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-500 font-bold uppercase text-[9px] tracking-wide select-none">Razão Social / Nome Estendido</label>
                <input 
                  type="text"
                  value={companyInfo.subName}
                  onChange={(e) => setCompanyInfo({ ...companyInfo, subName: e.target.value })}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-medium focus:outline-hidden focus:border-pink-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-500 font-bold uppercase text-[9px] tracking-wide select-none">CNPJ Emissor</label>
                  <input 
                    type="text"
                    placeholder="00.000.000/0001-00"
                    value={companyInfo.cnpj}
                    onChange={(e) => setCompanyInfo({ ...companyInfo, cnpj: e.target.value })}
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-mono focus:outline-hidden focus:border-pink-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-500 font-bold uppercase text-[9px] tracking-wide select-none">Telefone / Whats</label>
                  <input 
                    type="text"
                    value={companyInfo.phone}
                    onChange={(e) => setCompanyInfo({ ...companyInfo, phone: e.target.value })}
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-mono focus:outline-hidden focus:border-pink-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-slate-500 font-bold uppercase text-[9px] tracking-wide select-none">Endereço Logradouro (Nº, Bairro)</label>
                <input 
                  type="text"
                  placeholder="Ex: Rua Dr Luiz Carlos, 560"
                  value={companyInfo.addressLine1}
                  onChange={(e) => setCompanyInfo({ ...companyInfo, addressLine1: e.target.value })}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-medium focus:outline-hidden focus:border-pink-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-500 font-bold uppercase text-[9px] tracking-wide select-none">Cidade - Estado</label>
                <input 
                  type="text"
                  placeholder="Ex: Assú - RN"
                  value={companyInfo.addressLine2}
                  onChange={(e) => setCompanyInfo({ ...companyInfo, addressLine2: e.target.value })}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-medium focus:outline-hidden focus:border-pink-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-500 font-bold uppercase text-[9px] tracking-wide select-none">Chave Pix de Recebimento</label>
                <input 
                  type="text"
                  placeholder="E-mail, CPF, celular ou chave aleatória"
                  value={companyInfo.pixKey}
                  onChange={(e) => setCompanyInfo({ ...companyInfo, pixKey: e.target.value })}
                  className="w-full px-3 py-1.5 bg-slate-100 border border-slate-200 rounded-lg text-slate-700 font-mono focus:outline-hidden focus:border-pink-500 font-semibold"
                />
                <p className="text-[10px] text-slate-450 mt-0.5 font-sans">Forneça sua chave para gerar o QR code Pix impresso de forma automática!</p>
              </div>

              <div className="space-y-1">
                <label className="text-slate-500 font-bold uppercase text-[9px] tracking-wide select-none">Slogan / Texto Sub-rodapé</label>
                <input 
                  type="text"
                  placeholder="Ex: Performance de Elite"
                  value={companyInfo.slogan}
                  onChange={(e) => setCompanyInfo({ ...companyInfo, slogan: e.target.value })}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-medium focus:outline-hidden focus:border-pink-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-500 font-bold uppercase text-[9px] tracking-wide select-none">Mensagem WhatsApp Rodapé</label>
                <input 
                  type="text"
                  placeholder="Ex: Para solicitar Nota Fiscal oficial entre em contato"
                  value={companyInfo.instructions}
                  onChange={(e) => setCompanyInfo({ ...companyInfo, instructions: e.target.value })}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-medium focus:outline-hidden focus:border-pink-500"
                />
              </div>
            </div>
          ) : (
            /* PRINT CONTROLS PANEL */
            <div className="space-y-4 text-xs font-sans">
              <div className="bg-pink-50/40 p-4 border border-pink-100 rounded-xl space-y-3">
                <h4 className="font-bold text-pink-700 flex items-center gap-1 text-[11px] uppercase tracking-wider select-none">
                  <Award size={13} /> Detalhes Extras do Comprovante
                </h4>

                <div className="space-y-1">
                  <label className="text-slate-500 font-bold uppercase text-[9px] tracking-wide">CPF / CNPJ da Cliente (na impressão)</label>
                  <input 
                    type="text"
                    value={clientCpf}
                    onChange={(e) => setClientCpf(e.target.value)}
                    placeholder="000.000.000-00"
                    className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-700 font-mono font-bold focus:outline-hidden focus:border-pink-500"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <label className="text-slate-500 font-bold uppercase text-[9px] tracking-wide">Lançar Desconto na Impressão (%)</label>
                    <span className="text-slate-700 font-mono font-bold">{discountPercent}%</span>
                  </div>
                  <input 
                    type="range"
                    min="0"
                    max="50"
                    step="1"
                    value={discountPercent}
                    onChange={(e) => setDiscountPercent(Number(e.target.value))}
                    className="w-full accent-pink-600 h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 font-medium font-sans">
                    <span>Sem desconto</span>
                    <span>Abatimento: {formatCurrency(discountAmount)}</span>
                    <span>Sem exceder</span>
                  </div>
                </div>
              </div>

              {/* PIX scan copy and paste */}
              {companyInfo.pixKey && (
                <div className="p-3 bg-slate-50 border border-slate-150 rounded-xl space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-extrabold text-[10px] text-slate-500 uppercase tracking-wider font-mono flex items-center gap-1 select-none">
                      <QrCode size={12} className="text-slate-450" /> Copia e Cola / Payload Pix
                    </span>
                    <button
                      onClick={handleCopyPixString}
                      className="text-[10px] font-bold text-pink-600 hover:text-pink-700 flex items-center gap-1 cursor-pointer"
                    >
                      {isCopiedPayString ? <span className="text-emerald-500 font-sans">Copiado!</span> : <><Copy size={11} /> <span>Copiar</span></>}
                    </button>
                  </div>
                  <div className="text-[10px] font-mono text-slate-400 bg-white p-2 border border-slate-100 rounded-lg truncate break-all leading-tight select-all">
                    {pixPayload}
                  </div>
                </div>
              )}

              {/* Helpful tips */}
              <div className="bg-slate-50/50 p-3 rounded-lg border border-slate-100 text-[10px] font-medium leading-relaxed text-slate-450">
                <p>💡 <strong>Dica de Impressão térmica:</strong> Clique no botão de imprimir, selecione o destino de sua impressora (ex: 58mm ou 80mm térmica, ou Salvar como PDF) nas configurações de impressão do seu navegador, habilite a opção de "Gráficos de segundo plano" e desmarque "Cabeçalhos e rodapés" para um acabamento perfeito!</p>
              </div>
            </div>
          )}

          {/* Dialog Action buttons bottom */}
          <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row gap-2">
            <button 
              onClick={handlePrint}
              className="flex-1 py-3 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold font-sans transition-all text-center shadow-lg shadow-emerald-500/10 flex items-center justify-center gap-2 text-xs cursor-pointer active:scale-95"
            >
              <Printer size={15} />
              <span>💾 Salvar como PDF / Imprimir</span>
            </button>
            <button 
              onClick={onClose}
              className="px-5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold font-sans transition-all text-center text-xs cursor-pointer active:scale-95"
            >
              Fechar
            </button>
          </div>
        </div>

        {/* Real Thermal Paper simulation Preview Panel - right on desktop */}
        <div className="flex-1 bg-slate-200 p-6 overflow-y-auto flex items-center justify-center min-h-[350px]">
          {/* Printable container simulating paper */}
          <div 
            id="printable-thermal-receipt" 
            className="bg-white border select-all border-slate-350 shadow-xl max-w-[340px] w-full p-5 text-slate-800 font-mono text-[11px] leading-relaxed relative flex flex-col"
          >
            {/* Paper custom border details top & bottom */}
            <div className="absolute top-0 inset-x-0 h-1.5 bg-radial from-transparent to-white bg-repeat-x bg-[length:8px_4px] opacity-10" />

            {/* Logo/Title */}
            <div className="text-center space-y-1">
              <h2 className="text-base font-black tracking-widest uppercase leading-tight select-all">
                {companyInfo.name || 'AP MODA FITNESS'}
              </h2>
              <p className="text-[10px] text-slate-600 font-sans leading-tight">
                {companyInfo.subName || 'AP Moda Fitness S/A'}
              </p>
              <p className="text-[9px] text-slate-500">
                CNPJ: {companyInfo.cnpj || '12.345.678/0001-99'}
              </p>
              <p className="text-[9px] text-slate-500 leading-tight">
                {companyInfo.addressLine1 || 'Av. Paulista, 1500'}
              </p>
              <p className="text-[9px] text-slate-500 leading-tight">
                {companyInfo.addressLine2 || 'São Paulo - SP'}
              </p>
            </div>

            {/* Separator Dashes */}
            <div className="text-center text-slate-400 select-none py-1 h-3 overflow-hidden">
              --------------------------------------------------
            </div>

            {/* COMPROVANTE BOX */}
            <div className="border border-dashed border-slate-400 p-2 text-center text-[10px] space-y-0.5 leading-tight select-none rounded bg-slate-50/50">
              <p className="font-black tracking-wider text-slate-700">COMPROVANTE DE VENDA</p>
              <p className="text-slate-500 text-[8px] uppercase tracking-wide">Este documento não possui valor fiscal</p>
              <p className="text-slate-500 text-[8px] uppercase tracking-wide">Não substitui a NF-e oficial</p>
            </div>

            {/* Separator Dashes */}
            <div className="text-center text-slate-400 select-none py-1 h-3 overflow-hidden">
              --------------------------------------------------
            </div>

            {/* Cupom number and timestamp */}
            <div className="flex justify-between text-[10px]">
              <div>
                <span>Cupom No.: </span>
                <span className="font-bold">{sale.id.replace('v-', '').toUpperCase()}</span>
              </div>
              <span className="font-medium text-slate-600">
                {new Date(sale.createdAt).toLocaleDateString('pt-BR')} {new Date(sale.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>

            {/* Customer name and CPF */}
            <div className="flex justify-between text-[10px] mt-1 text-slate-700">
              <span className="truncate pr-2">Cliente: <strong className="font-serif font-bold text-slate-800">{sale.clientName}</strong></span>
              {clientCpf && <span className="shrink-0 font-medium text-slate-650">CPF: {clientCpf}</span>}
            </div>

            {sale.salesperson && (
              <div className="flex justify-between text-[10px] text-slate-700">
                <span>Vendedora: <strong className="font-bold text-slate-800">{sale.salesperson}</strong></span>
              </div>
            )}

            {/* Double Line Border */}
            <div className="border-b border-double border-slate-400 py-1" />

            {/* Goods Items table */}
            <div className="py-2.5 space-y-2">
              <p className="font-black text-slate-700 tracking-wider text-[10px]">ITENS</p>
              
              <div className="space-y-1.5 divide-y divide-slate-100 max-h-56 overflow-y-auto pr-0.5">
                {sale.items.map((item, idx) => (
                  <div key={idx} className="pt-1.5 first:pt-0 leading-tight">
                    <div className="flex justify-between">
                      <span className="font-bold text-slate-850 truncate max-w-[200px]">{item.name}</span>
                      <span className="font-extrabold pr-0.5">{formatCurrency(item.price * item.quantity)}</span>
                    </div>
                    <p className="text-[9px] text-slate-500 font-sans mt-0.5">
                      {item.quantity} un x {formatCurrency(item.price)}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Dash border */}
            <div className="text-center text-slate-400 select-none py-1 h-3 overflow-hidden">
              --------------------------------------------------
            </div>

            {/* Calculations subtotals */}
            <div className="space-y-1 text-[10px]">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              
              {discountAmount > 0 && (
                <div className="flex justify-between text-rose-500 font-medium">
                  <span>Desconto ({discountPercent}%)</span>
                  <span>- {formatCurrency(discountAmount)}</span>
                </div>
              )}
            </div>

            {/* TOTAL high contrast styling black badge */}
            <div className="bg-slate-900 border border-slate-950 text-white rounded-lg p-2.5 flex items-center justify-between mt-2.5 my-1 tracking-wide select-all">
              <span className="text-[10px] font-extrabold">TOTAL</span>
              <span className="text-sm font-black">{formatCurrency(finalTotal)}</span>
            </div>

            {/* Payment method */}
            <div className="py-1 flex flex-col space-y-1 text-[10px] text-slate-700">
              <div className="flex justify-between border-b border-dashed border-slate-150 pb-1">
                <span className="font-medium text-slate-450 uppercase text-[9px]">Pagamento</span>
                {sale.payments && sale.payments.length > 0 ? (
                  <span className="font-bold text-slate-800 uppercase tracking-wider">{sale.payments.map(p => p.method).join(' + ')}</span>
                ) : (
                  <span className="font-bold text-slate-800">PIX</span>
                )}
              </div>
              
              {sale.payments && sale.payments.length > 0 && (
                <div className="space-y-0.5 pl-2 font-sans text-[10px]">
                  {sale.payments.map((p, idx) => (
                    <div key={idx} className="flex justify-between text-slate-600 font-medium">
                      <span>• {p.method}</span>
                      <span className="font-mono font-bold text-slate-750">{formatCurrency(p.amount)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Separator Dashes */}
            <div className="text-center text-slate-400 select-none py-1 h-3 overflow-hidden">
              --------------------------------------------------
            </div>

            {/* Footers information Slogan */}
            <div className="text-center text-[10px] text-slate-600 space-y-0.5 font-sans leading-normal">
              <p>Obrigado pela preferência!</p>
              <p className="font-mono text-[9px] font-extrabold text-slate-750 uppercase">
                {companyInfo.slogan || 'Qualidade & Performance'}
              </p>
              <p className="text-[9px]">
                {companyInfo.addressLine2 || 'São Paulo - SP'}
              </p>
            </div>

            {/* Separator Dashes */}
            <div className="text-center text-slate-400 select-none py-1 h-3 overflow-hidden">
              --------------------------------------------------
            </div>

            {/* Pix key dynamic QRCode section in layout */}
            {companyInfo.pixKey ? (
              <div className="py-1 text-center font-sans space-y-2 flex flex-col items-center justify-center">
                <p className="text-[9px] font-bold text-slate-550 uppercase tracking-widest select-none">Pague Confortável via Pix</p>
                <div id="pix-qr-print-wrapper" className="p-2 border border-slate-200 rounded-xl bg-white w-28 h-28 flex items-center justify-center">
                  <img 
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(pixPayload)}`}
                    alt="Pix QR Code"
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="space-y-0.5 leading-snug">
                  <p className="text-[8px] text-slate-400 uppercase">Chave Pix Emissor:</p>
                  <p className="text-[9px] font-bold text-slate-700 font-mono select-all truncate max-w-[200px] lowercase">{companyInfo.pixKey}</p>
                </div>
              </div>
            ) : null}

            {companyInfo.pixKey && (
              <div className="text-center text-slate-450 select-none py-1 h-3 overflow-hidden">
                --------------------------------------------------
              </div>
            )}

            {/* Extra footers instructions */}
            <div className="text-center text-[8px] leading-snug text-slate-450 mt-1 space-y-0.5">
              <p className="font-mono select-all">Ref: 800{sale.id.replace('v-', '')}4474-{sale.createdAt.slice(-2)}y</p>
              <p className="font-sans leading-normal px-2 max-w-[240px] mx-auto text-slate-500">
                {companyInfo.instructions || 'Para solicitar Nota Fiscal oficial entre em contato pelo Whats'}
              </p>
            </div>

            {/* Paper jagged footer simulation */}
            <div className="absolute bottom-0 inset-x-0 h-1.5 bg-radial from-transparent to-white bg-repeat-x bg-[length:8px_4px] transform rotate-180 opacity-10" />
          </div>
        </div>

      </div>
    </div>
  );
}
