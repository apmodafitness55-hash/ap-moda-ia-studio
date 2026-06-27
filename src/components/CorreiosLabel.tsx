/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { X, Printer, Check, Link } from 'lucide-react';
import { getSupabaseClient } from '../supabase';

interface ShippingLabelProps {
  order?: {
    id: string;
    clientName: string;
    phone: string;
    address: string;
    items: { productName: string; quantity: number; price: number }[];
    total: number;
    trackingCode?: string;
    deliveryMethod?: string;
  };
  sale?: {
    id: string;
    clientName: string;
    items: { name: string; quantity: number; price: number }[];
    total: number;
    address?: string;
    trackingCode?: string;
    deliveryMethod?: string;
  };
  onClose: () => void;
  onUpdateTrackingCode?: (id: string, code: string) => void;
}

export default function CorreiosLabel({ order, sale, onClose, onUpdateTrackingCode }: ShippingLabelProps) {
  // Retrieve store configuration from localStorage or defaults
  const storeName = localStorage.getItem('ap_store_name') || 'AP Moda Fitness';
  const storeCnpj = localStorage.getItem('ap_store_cnpj') || '52.348.910/0001-88';
  const storeAddress = localStorage.getItem('ap_store_address') || 'Rua Visconde de Pirajá, 351, Bloco C, Ipanema, Rio de Janeiro - RJ';
  const storeCep = '22410-003';

  // Identify recipient data
  const recipientName = order?.clientName || sale?.clientName || 'Cliente';
  const rawAddress = order?.address || sale?.address || 'A combinar / Entrega Balcão';
  const recipientPhone = order?.phone || '(11) 99999-0000';

  // Generate tracking code in official Correios format: e.g. QC123456789BR
  const [trackingCode, setTrackingCode] = useState<string>(() => {
    const current = order?.trackingCode || sale?.trackingCode;
    if (current) return current;
    
    const prefixes = ['QC', 'BR', 'PM', 'AL', 'JN', 'OB', 'XY'];
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const middleNum = Math.floor(100000000 + Math.random() * 900000000).toString();
    return `${prefix}${middleNum}BR`;
  });

  const [deliveryType, setDeliveryType] = useState<string>(() => {
    const method = order?.deliveryMethod || sale?.deliveryMethod || '';
    if (method.toLowerCase().includes('sedex')) return 'SEDEX';
    if (method.toLowerCase().includes('pac')) return 'PAC';
    return 'PAC'; // Default to PAC
  });

  const [saving, setSaving] = useState(false);

  // Auto-sync generated tracking code to database
  useEffect(() => {
    const currentCodeInDb = order?.trackingCode || sale?.trackingCode;
    if (!currentCodeInDb) {
      handleSaveTrackingCode(trackingCode);
    }
  }, [trackingCode]);

  const handleSaveTrackingCode = async (codeToSave: string) => {
    setSaving(true);
    try {
      const supabase = getSupabaseClient();
      if (supabase) {
        if (order) {
          // Update in ap_online_orders
          await supabase
            .from('ap_online_orders')
            .update({ trackingCode: codeToSave })
            .eq('id', order.id);
            
          if (onUpdateTrackingCode) {
            onUpdateTrackingCode(order.id, codeToSave);
          }
        } else if (sale) {
          // Update in ap_sales
          await supabase
            .from('ap_sales')
            .update({ trackingCode: codeToSave })
            .eq('id', sale.id);
            
          if (onUpdateTrackingCode) {
            onUpdateTrackingCode(sale.id, codeToSave);
          }
        }
      }
    } catch (err) {
      console.error('Error saving tracking code to Supabase:', err);
    } finally {
      setSaving(false);
    }
  };

  // Extract items for content declaration
  const itemsList = order 
    ? order.items.map(it => ({ name: it.productName, qty: it.quantity, val: it.price }))
    : sale 
      ? sale.items.map(it => ({ name: it.name, qty: it.quantity, val: it.price }))
      : [{ name: 'Peças de Vestuário (AP Moda Fitness)', qty: 1, val: order?.total || sale?.total || 150 }];

  const totalQty = itemsList.reduce((sum, item) => sum + item.qty, 0);
  const totalVal = order?.total || sale?.total || 0;

  // Print execution
  const handlePrint = () => {
    const printWindowStyleId = 'correios-print-layout';
    
    // Remove existing print layouts
    const existing = document.getElementById(printWindowStyleId);
    if (existing) existing.remove();

    const style = document.createElement('style');
    style.id = printWindowStyleId;
    style.innerHTML = `
      @media print {
        body * {
          visibility: hidden !important;
        }
        #printable-shipping-label, #printable-shipping-label * {
          visibility: visible !important;
        }
        #printable-shipping-label {
          position: absolute !important;
          left: 0 !important;
          top: 0 !important;
          width: 100mm !important;
          max-width: 100mm !important;
          margin: 0 !important;
          padding: 2mm !important;
          background: #white !important;
          color: #000000 !important;
          font-family: 'Inter', system-ui, sans-serif !important;
        }
        @page {
          size: 100mm 150mm;
          margin: 0;
        }
        .no-print {
          display: none !important;
        }
      }
    `;
    document.head.appendChild(style);
    window.print();
    setTimeout(() => {
      style.remove();
    }, 1000);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-150 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header Options */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-pink-100 text-pink-600 rounded-lg">
              <Printer size={16} />
            </span>
            <div>
              <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">Etiqueta de Envio Correios</h3>
              <p className="text-[10px] text-slate-400">Otimizada para impressora de adesivos térmicos</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 bg-pink-600 hover:bg-pink-700 text-white rounded-lg text-[11px] font-bold flex items-center gap-1.5 cursor-pointer shadow-sm shadow-pink-500/10 active:scale-97 transition-all"
            >
              <Printer size={13} />
              <span>Imprimir</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-slate-200 text-slate-400 hover:text-slate-600 rounded-lg transition-colors cursor-pointer"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Configurations Selector in popup */}
        <div className="p-3 bg-pink-50/50 border-b border-pink-100/40 text-xs font-sans text-slate-600 flex flex-wrap items-center justify-between gap-2.5">
          <div className="flex items-center gap-2">
            <span>Tipo de Postagem:</span>
            <div className="flex gap-1.5">
              <button
                onClick={() => setDeliveryType('PAC')}
                className={`px-2 py-0.5 rounded font-extrabold text-[10px] border transition-all ${deliveryType === 'PAC' ? 'bg-pink-600 border-pink-600 text-white' : 'bg-white border-slate-250 text-slate-500 hover:border-slate-350'}`}
              >
                PAC
              </button>
              <button
                onClick={() => setDeliveryType('SEDEX')}
                className={`px-2 py-0.5 rounded font-extrabold text-[10px] border transition-all ${deliveryType === 'SEDEX' ? 'bg-pink-600 border-pink-600 text-white' : 'bg-white border-slate-250 text-slate-500 hover:border-slate-350'}`}
              >
                SEDEX
              </button>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <span className="text-[10px] text-slate-400 font-mono">Código:</span>
            <span className="font-bold text-slate-800 font-mono bg-white border border-slate-200 px-2 py-0.5 rounded text-[10.5px]">
              {trackingCode}
            </span>
          </div>
        </div>

        {/* Scrollable Preview Area */}
        <div className="p-6 bg-slate-100 overflow-y-auto flex-1 flex justify-center">
          
          {/* Official Correios Shipping Label Format (100mm x 150mm equivalent) */}
          <div 
            id="printable-shipping-label"
            className="w-[100mm] min-h-[145mm] bg-white text-black p-3 font-sans border-2 border-dashed border-slate-400 rounded-lg flex flex-col justify-between text-left leading-tight shadow-lg"
            style={{ boxSizing: 'border-box' }}
          >
            {/* Top Border with CORREIOS Header */}
            <div className="border-3 border-black p-1">
              <div className="flex justify-between items-center border-b-2 border-black pb-1.5 mb-2">
                <div className="flex items-center gap-1">
                  <div className="bg-yellow-400 text-blue-950 font-black px-2 py-0.5 rounded text-[11px] border border-blue-900 flex items-center justify-center font-sans tracking-tight">
                    CORREIOS
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-black text-xs font-mono tracking-wider">{deliveryType}</span>
                </div>
              </div>

              {/* Barcode representation */}
              <div className="flex flex-col items-center justify-center py-2 bg-slate-50 border border-slate-200 rounded mb-2.5">
                {/* Simulated high-contrast barcodes */}
                <div className="w-11/12 h-10 flex items-stretch gap-[1.5px] bg-white p-1">
                  {[...Array(48)].map((_, i) => {
                    const width = (i % 3 === 0 || i % 7 === 0 || i % 11 === 0) ? 'w-[3px]' : 'w-[1px]';
                    const bg = (i % 5 === 0 && i % 3 !== 0) ? 'bg-transparent' : 'bg-black';
                    return <div key={i} className={`${width} ${bg} h-full shrink-0`} />;
                  })}
                </div>
                <span className="font-mono text-[9px] font-bold tracking-[3px] mt-1 text-black">
                  {trackingCode}
                </span>
              </div>

              {/* Destinatário Panel */}
              <div className="border-t-2 border-black pt-2 mb-2">
                <span className="bg-black text-white text-[8px] font-bold px-1.5 py-0.5 uppercase tracking-wide rounded">DESTINATÁRIO</span>
                <div className="mt-1.5 text-[9.5px] space-y-0.5">
                  <p className="font-extrabold text-[10.5px] uppercase">{recipientName}</p>
                  <p className="font-medium text-slate-850">{rawAddress}</p>
                  <p className="font-semibold text-slate-900">Tel: {recipientPhone}</p>
                  {order?.id && <p className="text-[8px] font-mono text-slate-400">PEDIDO: {order.id.toUpperCase()}</p>}
                </div>
              </div>

              {/* Remetente Panel */}
              <div className="border-t-2 border-black pt-2">
                <span className="border border-black text-black text-[8px] font-bold px-1.5 py-0.5 uppercase tracking-wide rounded bg-slate-100">REMETENTE</span>
                <div className="mt-1.5 text-[8.5px] text-slate-700 space-y-0.5 leading-tight">
                  <p className="font-bold">{storeName}</p>
                  <p>{storeAddress}</p>
                  <p>CNPJ: {storeCnpj} - CEP: {storeCep}</p>
                </div>
              </div>
            </div>

            {/* Simplified Content Declaration Area */}
            <div className="border-3 border-black p-1 mt-3">
              <div className="text-center border-b border-black pb-1 mb-1 bg-slate-50">
                <h4 className="text-[9px] font-black uppercase">DECLARAÇÃO DE CONTEÚDO (SIMPLIFICADA)</h4>
                <p className="text-[7.5px] text-slate-500 leading-none">Conforme exigências de postagem dos Correios do Brasil</p>
              </div>

              {/* Items list */}
              <table className="w-full text-[8px] text-left leading-normal border-collapse">
                <thead>
                  <tr className="border-b border-slate-300 font-bold bg-slate-150">
                    <th className="py-0.5">Item / Descrição</th>
                    <th className="py-0.5 text-center">Qtd</th>
                    <th className="py-0.5 text-right">R$ Un.</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-150">
                  {itemsList.slice(0, 4).map((item, idx) => (
                    <tr key={idx}>
                      <td className="py-0.5 truncate max-w-[140px] font-medium">{item.name}</td>
                      <td className="py-0.5 text-center">{item.qty}</td>
                      <td className="py-0.5 text-right">R$ {item.val.toFixed(2)}</td>
                    </tr>
                  ))}
                  {itemsList.length > 4 && (
                    <tr>
                      <td className="py-0.5 text-slate-400 font-medium italic" colSpan={3}>+ {itemsList.length - 4} outros itens...</td>
                    </tr>
                  )}
                </tbody>
              </table>

              {/* Declaration Summary */}
              <div className="flex justify-between items-center text-[8.5px] font-bold border-t border-black pt-1 mt-1 leading-none">
                <span>Total de Itens: {totalQty}</span>
                <span className="font-extrabold text-[9.5px]">Valor Total: R$ {totalVal.toFixed(2)}</span>
              </div>

              {/* Signature / Legal Declaration */}
              <div className="text-[6.5px] text-slate-600 mt-2 leading-tight bg-slate-50/50 p-1 rounded border border-slate-200">
                <p>
                  Declaro que não sou contribuinte do ICMS e que a mercadoria acima descrita é destinada a fins não comerciais, enquadrando-se nos termos da legislação postal vigente.
                </p>
                <div className="flex justify-between items-end mt-2">
                  <span>Data: {new Date().toLocaleDateString('pt-BR')}</span>
                  <div className="border-t border-slate-400 w-32 text-center pt-0.5 font-sans scale-90">
                    Assinatura do Remetente
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Info footer */}
        <div className="p-3 border-t border-slate-100 bg-slate-50 text-[10px] text-slate-500 font-sans flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Sincronizado via Supabase</span>
          </span>
          <span>AP Moda Fitness Logística © 2026</span>
        </div>

      </div>
    </div>
  );
}
