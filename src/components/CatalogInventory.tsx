/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Package, 
  AlertTriangle,
  RotateCcw,
  Check,
  ChevronDown,
  X,
  Sparkles
} from 'lucide-react';
import { Product } from '../types';
import ImageUploader from './ImageUploader';

interface CatalogInventoryProps {
  products: Product[];
  onAddProduct: (prod: Product) => void;
  onUpdateProduct: (prod: Product) => void;
  onDeleteProduct: (id: string) => void;
  activeSubTab?: 'inventario' | 'restoque' | 'cadastro';
  setActiveSubTab?: (subTab: 'inventario' | 'restoque' | 'cadastro') => void;
}

const colorToHex = (colorName: string): string => {
  const norm = colorName.toLowerCase().trim();
  if (norm.includes('preto') || norm.includes('black')) return '#1e293b';
  if (norm.includes('branco') || norm.includes('white')) return '#f8fafc';
  if (norm.includes('rosa') || norm.includes('pink') || norm.includes('pink glow')) return '#db2777';
  if (norm.includes('azul') || norm.includes('blue')) return '#2563eb';
  if (norm.includes('verde') || norm.includes('green')) return '#16a34a';
  if (norm.includes('vermelho') || norm.includes('red')) return '#dc2626';
  if (norm.includes('amarelo') || norm.includes('yellow')) return '#ca8a04';
  if (norm.includes('cinza') || norm.includes('gray')) return '#4b5563';
  if (norm.includes('laranja') || norm.includes('orange')) return '#ea580c';
  if (norm.includes('roxo') || norm.includes('purple')) return '#7c3aed';
  return '#cbd5e1'; // fallback gray
};

export default function CatalogInventory({ 
  products, 
  onAddProduct, 
  onUpdateProduct, 
  onDeleteProduct,
  activeSubTab,
  setActiveSubTab
}: CatalogInventoryProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // States for size-specific colors
  const [newSizeColors, setNewSizeColors] = useState<Record<string, string>>({});
  const [editSizeColors, setEditSizeColors] = useState<Record<string, string>>({});

  // States for color-specific stocks
  const [newColorStocks, setNewColorStocks] = useState<Record<string, number>>({});
  const [editColorStocks, setEditColorStocks] = useState<Record<string, number>>({});

  // States for size-color specific stocks
  const [newSizeColorStocks, setNewSizeColorStocks] = useState<Record<string, Record<string, number>>>({});
  const [editSizeColorStocks, setEditSizeColorStocks] = useState<Record<string, Record<string, number>>>({});

  // Product Sub-Tab Switcher (Inventário, Combos, Markup, Curva ABC)
  const [internalSubTab, setInternalSubTab] = useState<'inventario' | 'combos' | 'markup' | 'abc'>('inventario');

  // Combos State with LocalStorage Persistence
  const [combos, setCombos] = useState<any[]>(() => {
    try {
      const saved = localStorage.getItem('ap_moda_combos');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return [
      {
        id: 'combo-1',
        name: 'Combo Legging Glow + Top Cross',
        price: 199.90,
        items: [
          { name: 'Legging Glow Cós Anatômico', quantity: 1, productId: 'prod-1' },
          { name: 'Top Cross Alta Sustentação', quantity: 1, productId: 'prod-2' }
        ],
        salesCount: 18,
        active: true
      },
      {
        id: 'combo-2',
        name: 'Conjunto Tri-Blend Sem Costura (3 peças)',
        price: 289.90,
        items: [
          { name: 'Shorts Seamless Sculpt', quantity: 1, productId: 'prod-3' },
          { name: 'Top Seamless Confort', quantity: 1, productId: 'prod-4' }
        ],
        salesCount: 12,
        active: true
      }
    ];
  });

  // Sync combos
  React.useEffect(() => {
    localStorage.setItem('ap_moda_combos', JSON.stringify(combos));
  }, [combos]);

  // Form states for creating custom combo
  const [isComboModalOpen, setIsComboModalOpen] = useState(false);
  const [comboName, setComboName] = useState('');
  const [comboPrice, setComboPrice] = useState(199.90);
  const [selectedComboProducts, setSelectedComboProducts] = useState<string[]>([]);

  // Form states for Pricing / Markup tool
  const [markupCost, setMarkupCost] = useState<number>(50.00);
  const [markupTax, setMarkupTax] = useState<number>(6.00); // 6% simples nacional
  const [markupCommission, setMarkupCommission] = useState<number>(5.00); // 5% comissão
  const [markupGateway, setMarkupGateway] = useState<number>(3.00); // 3%gateway maquininha
  const [markupDiscount, setMarkupDiscount] = useState<number>(10.00); // 10% desconto programado
  const [markupDesiredProfit, setMarkupDesiredProfit] = useState<number>(30.00); // 30% lucro líquido desejado

  React.useEffect(() => {
    if (activeSubTab === 'cadastro') {
      setIsAddModalOpen(true);
      if (setActiveSubTab) {
        // Reset so it doesn't keep opening on back and forth clicks
        setActiveSubTab('inventario');
      }
    } else if (activeSubTab === 'restoque') {
      // Filter by items that need restock
      setSearchQuery('');
      setSelectedCategory('Todos');
      if (setActiveSubTab) {
        setActiveSubTab('inventario');
      }
    }
  }, [activeSubTab, setActiveSubTab]);

  // Form states for new product
  const [newName, setNewName] = useState('');
  const [newSku, setNewSku] = useState('');
  const [newCategory, setNewCategory] = useState('Leggings');
  const [newPrice, setNewPrice] = useState(139.90);
  const [newCost, setNewCost] = useState(55.00);
  const [newStock, setNewStock] = useState(15);
  const [newMinStock, setNewMinStock] = useState(5);
  const [newImage, setNewImage] = useState('');
  const [newImages, setNewImages] = useState<string[]>([]);
  const [newDescription, setNewDescription] = useState('');
  const [newVideoUrl, setNewVideoUrl] = useState('');
  const [newColors, setNewColors] = useState('Preto, Pink Glow, Branco, Azul Celeste');
  const [newSizes, setNewSizes] = useState('P, M, G, GG');

  // Adding customizable / dynamic category entry states
  const [isCreatingNewCategory, setIsCreatingNewCategory] = useState(false);
  const [newCustomCategoryInput, setNewCustomCategoryInput] = useState('');

  // Editing product modal states
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editName, setEditName] = useState('');
  const [editSku, setEditSku] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [isEditingNewCategory, setIsEditingNewCategory] = useState(false);
  const [editCustomCategoryInput, setEditCustomCategoryInput] = useState('');
  const [editPrice, setEditPrice] = useState(0);
  const [editCost, setEditCost] = useState(0);
  const [editStock, setEditStock] = useState(0);
  const [editMinStock, setEditMinStock] = useState(0);
  const [editImage, setEditImage] = useState('');
  const [editImages, setEditImages] = useState<string[]>([]);
  const [editDescription, setEditDescription] = useState('');
  const [editVideoUrl, setEditVideoUrl] = useState('');
  const [editColors, setEditColors] = useState('');
  const [editSizes, setEditSizes] = useState('');

  // Sync total stock based on color-specific stocks and size-color specific stocks
  React.useEffect(() => {
    const sizes = newSizes.split(',').map(s => s.trim().toUpperCase()).filter(Boolean);
    const colors = newColors.split(',').map(c => c.trim()).filter(Boolean);

    if (sizes.length > 0) {
      let total = 0;
      sizes.forEach(sz => {
        const availableCols = newSizeColors[sz]
          ? newSizeColors[sz].split(',').map(c => c.trim()).filter(Boolean)
          : colors;
          
        availableCols.forEach(col => {
          total += (newSizeColorStocks[sz]?.[col] || 0);
        });
      });
      setNewStock(total);
    } else {
      if (colors.length > 0) {
        const total = colors.reduce((sum, color) => sum + (newColorStocks[color] || 0), 0);
        setNewStock(total);
      }
    }
  }, [newColors, newSizes, newSizeColors, newColorStocks, newSizeColorStocks]);

  React.useEffect(() => {
    const sizes = editSizes.split(',').map(s => s.trim().toUpperCase()).filter(Boolean);
    const colors = editColors.split(',').map(c => c.trim()).filter(Boolean);

    if (sizes.length > 0) {
      let total = 0;
      sizes.forEach(sz => {
        const availableCols = editSizeColors[sz]
          ? editSizeColors[sz].split(',').map(c => c.trim()).filter(Boolean)
          : colors;
          
        availableCols.forEach(col => {
          total += (editSizeColorStocks[sz]?.[col] || 0);
        });
      });
      setEditStock(total);
    } else {
      if (colors.length > 0) {
        const total = colors.reduce((sum, color) => sum + (editColorStocks[color] || 0), 0);
        setEditStock(total);
      }
    }
  }, [editColors, editSizes, editSizeColors, editColorStocks, editSizeColorStocks]);

  // Dynamic categories compile
  const productCategoriesOnly = useMemo(() => {
    const list = new Set(products.map(p => p.category).filter(Boolean));
    const defaultCats = ['Leggings', 'Tops', 'Conjuntos', 'Shorts', 'Casacos', 'Macacões', 'Regatas'];
    return Array.from(new Set([...defaultCats, ...Array.from(list)]));
  }, [products]);

  // Filter lists
  const categories = useMemo(() => {
    return ['Todos', ...productCategoriesOnly];
  }, [productCategoriesOnly]);

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesSearch = 
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        p.sku.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'Todos' || p.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [products, searchQuery, selectedCategory]);

  const handleRestock = (productId: string, quantity: number) => {
    const p = products.find(prod => prod.id === productId);
    if (p) {
      onUpdateProduct({
        ...p,
        stock: Math.max(0, p.stock + quantity)
      });
    }
  };

  const handleAddProductSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newSku.trim()) {
      alert('Por favor, preencha o Nome e o SKU do produto.');
      return;
    }

    const categoryToUse = isCreatingNewCategory 
      ? newCustomCategoryInput.trim() 
      : newCategory;

    if (isCreatingNewCategory && !newCustomCategoryInput.trim()) {
      alert('Por favor, informe a nova categoria personalizada.');
      return;
    }

    const sizesArray = newSizes.split(',').map(s => s.trim().toUpperCase()).filter(Boolean);

    // Build sizeColors list and aggregate colors
    const finalSizeColors: Record<string, string[]> = {};
    const sizeColorsList: string[] = [];
    Object.entries(newSizeColors).forEach(([sz, val]) => {
      if (sizesArray.includes(sz)) {
        const arr = (val as string).split(',').map(s => s.trim()).filter(Boolean);
        if (arr.length > 0) {
          finalSizeColors[sz] = arr;
          arr.forEach(c => {
            if (!sizeColorsList.includes(c)) sizeColorsList.push(c);
          });
        }
      }
    });

    const colorsArray = sizeColorsList.length > 0 
      ? sizeColorsList 
      : newColors.split(',').map(s => s.trim()).filter(Boolean);

    const finalColorStocks: Record<string, number> = {};
    const finalSizeColorStocks: Record<string, Record<string, number>> = {};

    if (sizesArray.length > 0) {
      sizesArray.forEach(sz => {
        finalSizeColorStocks[sz] = {};
        const availableCols = finalSizeColors[sz] || colorsArray;
        availableCols.forEach(col => {
          const qty = newSizeColorStocks[sz]?.[col] || 0;
          finalSizeColorStocks[sz][col] = qty;
          finalColorStocks[col] = (finalColorStocks[col] || 0) + qty;
        });
      });
    } else {
      colorsArray.forEach(color => {
        finalColorStocks[color] = newColorStocks[color] !== undefined ? newColorStocks[color] : 0;
      });
    }

    const newProd: Product = {
      id: `prod-${Date.now()}`,
      name: newName.trim(),
      sku: newSku.trim().toUpperCase(),
      category: categoryToUse,
      price: newPrice,
      cost: newCost,
      stock: newStock,
      minStock: newMinStock,
      image: newImages[0] || newImage,
      images: newImages.length > 0 ? newImages : [newImage],
      salesCount: 0,
      description: newDescription.trim(),
      videoUrl: newVideoUrl.trim(),
      colors: colorsArray,
      sizes: sizesArray,
      sizeColors: finalSizeColors,
      colorStocks: finalColorStocks,
      sizeColorStocks: finalSizeColorStocks
    };

    onAddProduct(newProd);
    setIsAddModalOpen(false);

    // Reset forms
    setNewName('');
    setNewSku('');
    setNewCategory('Leggings');
    setNewCustomCategoryInput('');
    setIsCreatingNewCategory(false);
    setNewPrice(139.90);
    setNewCost(55.00);
    setNewStock(15);
    setNewMinStock(5);
    setNewImage('');
    setNewImages([]);
    setNewDescription('');
    setNewVideoUrl('');
    setNewColors('Preto, Pink Glow, Branco, Azul Celeste');
    setNewSizes('P, M, G, GG');
    setNewSizeColors({});
    setNewColorStocks({});
    setNewSizeColorStocks({});
  };

  const handleOpenEditModal = (p: Product) => {
    setEditingProduct(p);
    setEditName(p.name);
    setEditSku(p.sku);
    setEditCategory(p.category);
    setIsEditingNewCategory(false);
    setEditCustomCategoryInput('');
    setEditPrice(p.price);
    setEditCost(p.cost);
    setEditStock(p.stock);
    setEditMinStock(p.minStock);
    setEditImage(p.image);
    setEditImages(p.images || [p.image]);
    setEditDescription(p.description || '');
    setEditVideoUrl(p.videoUrl || '');
    setEditColors(p.colors ? p.colors.join(', ') : 'Preto');
    setEditSizes(p.sizes ? p.sizes.join(', ') : 'P, M, G');
    
    // Map record string[] to record string for local input editing
    const scObj: Record<string, string> = {};
    if (p.sizeColors) {
      Object.entries(p.sizeColors).forEach(([sz, arr]) => {
        if (Array.isArray(arr)) {
          scObj[sz] = arr.join(', ');
        }
      });
    }
    setEditSizeColors(scObj);
    setEditColorStocks(p.colorStocks || {});
    setEditSizeColorStocks(p.sizeColorStocks || {});
    setIsEditModalOpen(true);
  };

  const handleEditProductSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    if (!editName.trim() || !editSku.trim()) {
      alert('Por favor, preencha o Nome e o SKU do produto.');
      return;
    }

    const categoryToUse = isEditingNewCategory 
      ? editCustomCategoryInput.trim() 
      : editCategory;

    if (isEditingNewCategory && !editCustomCategoryInput.trim()) {
      alert('Por favor, informe a nova categoria personalizada.');
      return;
    }

    const sizesArray = editSizes.split(',').map(s => s.trim().toUpperCase()).filter(Boolean);

    // Build sizeColors list and aggregate colors
    const finalSizeColors: Record<string, string[]> = {};
    const sizeColorsList: string[] = [];
    Object.entries(editSizeColors).forEach(([sz, val]) => {
      if (sizesArray.includes(sz)) {
        const arr = (val as string).split(',').map(s => s.trim()).filter(Boolean);
        if (arr.length > 0) {
          finalSizeColors[sz] = arr;
          arr.forEach(c => {
            if (!sizeColorsList.includes(c)) sizeColorsList.push(c);
          });
        }
      }
    });

    const colorsArray = sizeColorsList.length > 0 
      ? sizeColorsList 
      : editColors.split(',').map(s => s.trim()).filter(Boolean);

    const finalColorStocks: Record<string, number> = {};
    const finalSizeColorStocks: Record<string, Record<string, number>> = {};

    if (sizesArray.length > 0) {
      sizesArray.forEach(sz => {
        finalSizeColorStocks[sz] = {};
        const availableCols = finalSizeColors[sz] || colorsArray;
        availableCols.forEach(col => {
          const qty = editSizeColorStocks[sz]?.[col] || 0;
          finalSizeColorStocks[sz][col] = qty;
          finalColorStocks[col] = (finalColorStocks[col] || 0) + qty;
        });
      });
    } else {
      colorsArray.forEach(color => {
        finalColorStocks[color] = editColorStocks[color] !== undefined ? editColorStocks[color] : 0;
      });
    }

    onUpdateProduct({
      ...editingProduct,
      name: editName.trim(),
      sku: editSku.trim().toUpperCase(),
      category: categoryToUse,
      price: editPrice,
      cost: editCost,
      stock: editStock,
      minStock: editMinStock,
      image: editImages[0] || editImage,
      images: editImages.length > 0 ? editImages : [editImage],
      description: editDescription.trim(),
      videoUrl: editVideoUrl.trim(),
      colors: colorsArray,
      sizes: sizesArray,
      sizeColors: finalSizeColors,
      colorStocks: finalColorStocks,
      sizeColorStocks: finalSizeColorStocks
    });

    setIsEditModalOpen(false);
    setEditingProduct(null);
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold font-sans text-slate-800 tracking-tight">Produtos e Estoque</h2>
          <p className="text-slate-400 text-sm font-sans">Cadastre peças de moda fitness, monitore níveis críticos e reabasteça o estoque</p>
        </div>
        <button 
          id="add-product-modal-btn"
          onClick={() => setIsAddModalOpen(true)}
          className="inline-flex items-center gap-2 bg-pink-600 hover:bg-pink-700 font-sans font-medium text-white px-4 py-2 rounded-xl text-xs shadow-md shadow-pink-500/10 transition-all cursor-pointer"
        >
          <Plus size={16} />
          <span>Cadastrar Produto</span>
        </button>
      </div>

      {/* Product sub-tabs */}
      <div className="flex border-b border-slate-100 pb-px gap-6 overflow-x-auto text-xs font-sans">
        <button
          onClick={() => setInternalSubTab('inventario')}
          className={`pb-2.5 font-bold tracking-wide transition-all border-b-2 cursor-pointer whitespace-nowrap ${
            internalSubTab === 'inventario'
              ? 'border-pink-600 text-pink-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          📦 Inventário Geral
        </button>
        <button
          onClick={() => setInternalSubTab('combos')}
          className={`pb-2.5 font-bold tracking-wide transition-all border-b-2 cursor-pointer whitespace-nowrap ${
            internalSubTab === 'combos'
              ? 'border-pink-600 text-pink-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          🏷️ Combos & Looks
        </button>
        <button
          onClick={() => setInternalSubTab('markup')}
          className={`pb-2.5 font-bold tracking-wide transition-all border-b-2 cursor-pointer whitespace-nowrap ${
            internalSubTab === 'markup'
              ? 'border-pink-600 text-pink-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          🧮 Simulador de Markup
        </button>
        <button
          onClick={() => setInternalSubTab('abc')}
          className={`pb-2.5 font-bold tracking-wide transition-all border-b-2 cursor-pointer whitespace-nowrap ${
            internalSubTab === 'abc'
              ? 'border-pink-600 text-pink-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          📊 Giro & Curva ABC
        </button>
      </div>

      {internalSubTab === 'inventario' && (
        <>
          {/* Filter and Category Pills */}
      <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-xs space-y-4">
        <div className="relative">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
            <Search size={16} />
          </span>
          <input 
            id="catalog-search-input"
            type="text"
            placeholder="Procurar peça ou modelo pelo nome ou SKU..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-150 rounded-xl text-xs font-sans text-slate-700 placeholder-slate-400 focus:outline-hidden focus:border-pink-500 transitions-all"
          />
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap gap-2 pt-2">
          {categories.map((cat) => (
            <button
              key={cat}
              id={`pill-cat-${cat}`}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold font-sans transition-all cursor-pointer
                ${selectedCategory === cat 
                  ? 'bg-pink-600 text-white shadow-xs shadow-pink-500/10' 
                  : 'bg-slate-50 text-slate-550 hover:bg-slate-100 border border-slate-100'}`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Product Stock Table / Grid */}
      <div className="bg-white border border-slate-100 rounded-2xl shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-50 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-800">Catálogo de Roupas ({filteredProducts.length})</h3>
          <span className="text-[10px] text-slate-400 font-medium font-sans">Dica: clique em (+10) ou (-1) para ajustar estoques</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs font-sans">
            <thead>
              <tr className="bg-slate-50/70 border-b border-slate-50 text-slate-400 font-bold uppercase text-[10px] tracking-wider select-none">
                <th className="p-4">Item</th>
                <th className="p-4">SKU</th>
                <th className="p-4">Categoria</th>
                <th className="p-4 text-right">Custo</th>
                <th className="p-4 text-right">Preço Venda</th>
                <th className="p-4 text-center">Nível de Estoque</th>
                <th className="p-4 text-center">Ações Rápidas</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-650">
              {filteredProducts.map((p) => {
                const isLowStock = p.stock < p.minStock;
                const isOutOfStock = p.stock === 0;

                return (
                  <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                    {/* Item Image and Name */}
                    <td className="p-4 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg overflow-hidden border border-slate-100 bg-slate-50 shrink-0">
                        <img src={p.image} alt={p.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      </div>
                      <div>
                        <span className="font-semibold text-slate-800 text-xs block leading-tight">{p.name}</span>
                        <span className="text-[10px] text-slate-400 font-normal mt-1 block">Vendidos: {p.salesCount} un</span>
                        {p.colorStocks && Object.keys(p.colorStocks).length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1.5 max-w-[260px]">
                            {Object.entries(p.colorStocks).map(([color, qty]) => (
                              <span key={color} className="inline-flex items-center gap-1 bg-slate-50 text-slate-500 border border-slate-100 rounded-md px-1.5 py-0.5 text-[9px] font-medium font-mono leading-none">
                                <span className="w-1.5 h-1.5 rounded-full border border-slate-200" style={{ backgroundColor: colorToHex(color) }} />
                                {color}: <strong className="text-slate-700 font-bold">{qty}</strong>
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Sku */}
                    <td className="p-4 font-mono text-[10px] font-bold text-slate-500">{p.sku}</td>

                    {/* Category Label */}
                    <td className="p-4">
                      <span className="bg-slate-100 text-slate-600 border border-slate-200 font-semibold px-2 py-0.5 rounded text-[10px]">
                        {p.category}
                      </span>
                    </td>

                    {/* Price & Cost */}
                    <td className="p-4 text-right font-mono text-slate-500">{formatCurrency(p.cost)}</td>
                    <td className="p-4 text-right font-mono font-bold text-slate-850">{formatCurrency(p.price)}</td>

                    {/* Stock level bar */}
                    <td className="p-4 text-center min-w-[140px]">
                      <div className="flex flex-col items-center gap-1.5">
                        <div className="flex items-center gap-2">
                          <span className={`font-mono font-bold text-xs ${isOutOfStock ? 'text-rose-500 animate-pulse' : isLowStock ? 'text-amber-500' : 'text-slate-700'}`}>
                            {p.stock} peças
                          </span>
                          {isLowStock && (
                            <AlertTriangle size={12} className="text-amber-500 animate-bounce" />
                          )}
                        </div>
                        <div className="w-24 bg-slate-100 h-1 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full ${isOutOfStock ? 'w-0' : isLowStock ? 'bg-amber-500' : 'bg-emerald-500'}`}
                            style={{ width: `${Math.min(100, (p.stock / (p.minStock * 4)) * 100)}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    {/* Restock action elements */}
                    <td className="p-4 text-center">
                      <div className="inline-flex gap-1 bg-slate-50 p-1 border border-slate-150 rounded-lg">
                        <button 
                          onClick={() => handleOpenEditModal(p)}
                          title="Editar peça"
                          className="px-2 py-1 text-[10px] font-bold font-sans text-slate-500 hover:text-pink-600 hover:bg-white rounded transition-all cursor-pointer"
                        >
                          Editar
                        </button>
                        <span className="w-px bg-slate-150 self-stretch my-1" />
                        <button 
                          onClick={() => handleRestock(p.id, -1)}
                          title="Remover 1 unidade"
                          className="px-2 py-1 text-[10px] font-bold font-sans text-slate-500 hover:text-rose-600 hover:bg-white rounded transition-all cursor-pointer"
                        >
                          -1
                        </button>
                        <span className="w-px bg-slate-150 self-stretch my-1" />
                        <button 
                          onClick={() => handleRestock(p.id, 10)}
                          title="Restock de 10 unidades"
                          className="px-2 py-1 text-[10px] font-bold font-sans text-slate-500 hover:text-emerald-600 hover:bg-white rounded transition-all cursor-pointer"
                        >
                          +10
                        </button>
                        <span className="w-px bg-slate-150 self-stretch my-1" />
                        <button 
                          onClick={() => {
                            if (confirm(`Deseja mesmo arquivar a peça "${p.name}"?`)) {
                              onDeleteProduct(p.id);
                            }
                          }}
                          className="px-2 py-1 text-[10px] font-bold font-sans text-slate-400 hover:text-rose-500 hover:bg-white rounded transition-all cursor-pointer"
                        >
                          Deletar
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
        </>
      )}

      {/* VIEW 2: Combos & Looks */}
      {internalSubTab === 'combos' && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-sm font-bold text-slate-800">Looks & Kits Promocionais Ativos</h3>
                <p className="text-slate-400 text-xs mt-0.5">Monte conjuntos combinando em uma única oferta para alavancar o ticket médio</p>
              </div>
              <button
                onClick={() => {
                  setComboName('');
                  setComboPrice(199.90);
                  setSelectedComboProducts([]);
                  setIsComboModalOpen(true);
                }}
                className="bg-pink-600 hover:bg-pink-700 text-white text-[11px] font-semibold px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Plus size={14} /> Criar Combo
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {combos.map((combo) => {
                const areProductsAvailable = combo.items.every((item: any) => {
                  const p = products.find(prod => prod.id === item.productId || prod.name === item.name);
                  return p ? p.stock >= item.quantity : true;
                });

                return (
                  <div key={combo.id} className="border border-slate-150 bg-slate-50/40 rounded-xl p-4 flex flex-col justify-between hover:border-pink-200 hover:shadow-md hover:shadow-pink-500/5 transition-all">
                    <div>
                      <div className="flex justify-between items-start">
                        <span className="font-bold text-slate-800 text-xs font-sans block">{combo.name}</span>
                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${areProductsAvailable ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-500'}`}>
                          {areProductsAvailable ? 'Pronto para Entrega' : 'Estoque Parcial'}
                        </span>
                      </div>
                      
                      <div className="mt-3 space-y-1.5">
                        <span className="text-[10px] uppercase font-bold text-slate-400 font-mono tracking-wider block">Itens do Combo</span>
                        <div className="space-y-1">
                          {combo.items.map((it: any, i: number) => {
                            const linkedProd = products.find(p => p.id === it.productId || p.name === it.name);
                            return (
                              <div key={i} className="flex justify-between items-center text-[11px] bg-white p-1.5 px-2.5 rounded-lg border border-slate-100">
                                <span className="text-slate-650 font-medium font-sans">{it.quantity}x {it.name}</span>
                                <span className="font-mono text-[10px] text-slate-455">
                                  Estoque: {linkedProd ? `${linkedProd.stock} uni` : 'Não vinculado'}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                      <div>
                        <span className="text-[9px] text-slate-400 block font-bold uppercase tracking-wider font-mono font-sans">Preço Combo</span>
                        <span className="font-mono font-bold text-sm text-pink-600">{formatCurrency(combo.price)}</span>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            let stockMissing = false;
                            combo.items.forEach((item: any) => {
                              const p = products.find(prod => prod.id === item.productId || prod.name === item.name);
                              if (!p || p.stock < item.quantity) {
                                stockMissing = true;
                              }
                            });

                            if (stockMissing) {
                              const confirmSell = window.confirm('Algumas peças deste combo estão esgotadas ou abaixo do estoque necessário. Deseja efetuar a venda assim mesmo?');
                              if (!confirmSell) return;
                            }

                            combo.items.forEach((item: any) => {
                              const p = products.find(prod => prod.id === item.productId || prod.name === item.name);
                              if (p) {
                                onUpdateProduct({
                                  ...p,
                                  stock: Math.max(0, p.stock - item.quantity),
                                  salesCount: p.salesCount + item.quantity
                                });
                              }
                            });

                            setCombos(prev => prev.map(c => c.id === combo.id ? { ...c, salesCount: c.salesCount + 1 } : c));
                            alert(`Venda registrada! Os estoques das peças individuais do "${combo.name}" foram atualizados com sucesso.`);
                          }}
                          className="bg-slate-900 border border-slate-800 hover:bg-slate-950 text-white font-sans font-semibold px-2.5 py-1.5 rounded-lg text-[10px] transition-colors cursor-pointer"
                        >
                          Vender Combo
                        </button>
                        <button
                          onClick={() => {
                            if (confirm('Tem certeza que deseja remover este combo?')) {
                              setCombos(prev => prev.filter(c => c.id !== combo.id));
                            }
                          }}
                          className="p-1.5 bg-rose-50 border border-rose-100 hover:bg-rose-100 rounded-lg text-rose-600 transition-all cursor-pointer"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* VIEW 3: Pricing Simulator / Markup */}
      {internalSubTab === 'markup' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 font-sans">
          {/* Calculator controls */}
          <div className="lg:col-span-1 bg-white border border-slate-100 rounded-2xl p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-800">Formação de Preço de Venda</h3>
            <p className="text-slate-400 text-xs">Planeje as despesas e taxas para descobrir o preço ideal e fator Markup</p>
            
            <div className="space-y-4 text-xs font-sans">
              <div className="space-y-1">
                <label className="text-slate-500 font-bold block uppercase text-[9px] tracking-wide">Custo Unitário da Fábrica (R$)</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 font-bold">R$</span>
                  <input
                    type="number"
                    value={markupCost}
                    onChange={(e) => setMarkupCost(parseFloat(e.target.value) || 0)}
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-705 font-mono font-bold focus:outline-none focus:border-pink-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-slate-500 font-bold block uppercase text-[9px] tracking-wide font-sans">Impostos s/ Venda (%)</label>
                <input
                  type="number"
                  value={markupTax}
                  onChange={(e) => setMarkupTax(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-705 font-mono font-medium focus:outline-none focus:border-pink-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-500 font-bold block uppercase text-[9px] tracking-wide font-sans">Comissão de Venda (%)</label>
                <input
                  type="number"
                  value={markupCommission}
                  onChange={(e) => setMarkupCommission(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-705 font-mono font-medium focus:outline-none focus:border-pink-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-500 font-bold block uppercase text-[9px] tracking-wide font-sans">Taxa Maquininha / Meio (%)</label>
                <input
                  type="number"
                  value={markupGateway}
                  onChange={(e) => setMarkupGateway(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-705 font-mono font-medium focus:outline-none focus:border-pink-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-500 font-bold block uppercase text-[9px] tracking-wide font-sans">Provisão Desconto Máximo (%)</label>
                <input
                  type="number"
                  value={markupDiscount}
                  onChange={(e) => setMarkupDiscount(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-705 font-mono font-medium focus:outline-none focus:border-pink-500"
                />
              </div>

              <div className="space-y-1 text-pink-650 font-bold bg-pink-50/15 p-3 rounded-xl border border-pink-100/50">
                <label className="text-pink-650 font-bold block uppercase text-[9px] tracking-wide font-sans">Lucro Líquido Desejado (%)</label>
                <input
                  type="number"
                  value={markupDesiredProfit}
                  onChange={(e) => setMarkupDesiredProfit(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-white border border-pink-250 rounded-xl text-pink-700 font-mono font-bold focus:outline-none focus:border-pink-500"
                />
              </div>
            </div>
          </div>

          {/* Calculator results */}
          <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6 text-white flex flex-col justify-between">
            <div className="space-y-5">
              <span className="font-bold text-[10px] tracking-wider uppercase font-mono text-slate-400 block border-b border-slate-800 pb-2">Resultado da Formação</span>

              {(() => {
                const totalDeductions = markupTax + markupCommission + markupGateway + markupDiscount + markupDesiredProfit;
                const markupFactor = totalDeductions < 100 ? (100 / (100 - totalDeductions)) : 0;
                const sellingPrice = markupCost * (markupFactor || 1);
                
                const taxValue = sellingPrice * (markupTax / 100);
                const commissionValue = sellingPrice * (markupCommission / 100);
                const gatewayValue = sellingPrice * (markupGateway / 100);
                const discountValue = sellingPrice * (markupDiscount / 100);
                const rawProfitValue = sellingPrice * (markupDesiredProfit / 100);
                const breakevenPrice = markupCost + taxValue + commissionValue + gatewayValue + discountValue;

                return (
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-slate-950 text-center rounded-xl border border-slate-850">
                        <span className="block text-[8px] text-slate-455 uppercase font-mono font-bold tracking-wider mb-1">Fator de Markup</span>
                        <span className="text-xl font-mono font-semibold font-bold text-amber-500">{markupFactor ? `${markupFactor.toFixed(2)}x` : 'N/A'}</span>
                      </div>
                      <div className="p-4 bg-slate-950 text-center rounded-xl border border-slate-855">
                        <span className="block text-[8px] text-slate-455 uppercase font-mono font-bold tracking-wider mb-1">Preço de Custo Total</span>
                        <span className="text-xl font-mono font-semibold font-bold text-slate-300">{formatCurrency(breakevenPrice)}</span>
                      </div>
                    </div>

                    <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 text-center space-y-1">
                      <span className="block text-[10px] text-pink-400 uppercase font-bold tracking-widest font-mono">Preço Venda Sugerido</span>
                      <span className="text-3xl font-mono font-extrabold text-white block">{formatCurrency(sellingPrice)}</span>
                      <span className="text-[10px] text-slate-450 italic font-sans block mt-1">Multiplicador do Custo de Aquisição</span>
                    </div>

                    <div className="space-y-2">
                      <span className="block text-[9px] text-slate-455 uppercase font-mono font-bold tracking-wider">Abertura do Valor de Venda</span>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs">
                        <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-805">
                          <span className="block text-[8px] text-slate-500 font-bold uppercase font-sans">Custo Fábrica</span>
                          <span className="font-mono text-slate-300 font-semibold">{formatCurrency(markupCost)}</span>
                        </div>
                        <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-805">
                          <span className="block text-[8px] text-slate-500 font-bold uppercase font-sans">Impostos</span>
                          <span className="font-mono text-rose-400 font-semibold">{formatCurrency(taxValue)}</span>
                        </div>
                        <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-805">
                          <span className="block text-[8px] text-slate-500 font-bold uppercase font-sans">Comissões</span>
                          <span className="font-mono text-rose-400 font-semibold">{formatCurrency(commissionValue)}</span>
                        </div>
                        <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-805">
                          <span className="block text-[8px] text-slate-500 font-bold uppercase font-sans">Maquininha</span>
                          <span className="font-mono text-rose-400 font-semibold">{formatCurrency(gatewayValue)}</span>
                        </div>
                        <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-805">
                          <span className="block text-[8px] text-slate-500 font-bold uppercase font-sans">Fração Desc.</span>
                          <span className="font-mono text-rose-400 font-semibold">{formatCurrency(discountValue)}</span>
                        </div>
                        <div className="bg-pink-955/20 p-2.5 rounded-lg border border-pink-900/40 bg-pink-950/30">
                          <span className="block text-[8px] text-pink-400 font-bold uppercase font-sans">Lucro Líquido</span>
                          <span className="font-mono text-emerald-400 font-bold">{formatCurrency(rawProfitValue)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>

            <div className="mt-6 p-4 bg-slate-950 rounded-xl border border-slate-805 text-[10px] text-slate-400 font-sans leading-relaxed">
              💡 <strong>Dica AP Moda Fitness:</strong> Em produtos de fabricação própria ou importação de alta tecnologia (ex: costura inteligente, tecidos Seamless), margens saudáveis permitem markups acima de <strong className="text-white">2.2x</strong>.
            </div>
          </div>
        </div>
      )}

      {/* VIEW 4: Curva ABC */}
      {internalSubTab === 'abc' && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-xs space-y-5 flex flex-col font-sans">
            <div>
              <h3 className="text-sm font-bold text-slate-800">📊 Giro de Estoque - Relatório Curva ABC</h3>
              <p className="text-slate-400 text-xs mt-0.5">Visão analítica de giro das peças trazendo inteligência para reposições rápidas de estoque</p>
            </div>

            {(() => {
              const sortedProducts = [...products].sort((a, b) => b.salesCount - a.salesCount);
              const totalUnitsSold = sortedProducts.reduce((sum, p) => sum + p.salesCount, 0);

              let cumulativeCount = 0;
              const annotated = sortedProducts.map((p) => {
                cumulativeCount += p.salesCount;
                const cumulativePercentage = totalUnitsSold > 0 ? (cumulativeCount / totalUnitsSold) * 100 : 0;
                
                let classification: 'A' | 'B' | 'C' = 'C';
                if (cumulativePercentage <= 70) {
                  classification = 'A';
                } else if (cumulativePercentage <= 90) {
                  classification = 'B';
                } else {
                  classification = 'C';
                }

                if (totalUnitsSold === 0) classification = 'C';

                return {
                  ...p,
                  classification,
                  cumulativePercentage
                };
              });

              // Break down stats
              const aCount = annotated.filter(p => p.classification === 'A').length;
              const bCount = annotated.filter(p => p.classification === 'B').length;
              const cCount = annotated.filter(p => p.classification === 'C').length;

              const aSales = annotated.filter(p => p.classification === 'A').reduce((s, p) => s + p.salesCount, 0);
              const bSales = annotated.filter(p => p.classification === 'B').reduce((s, p) => s + p.salesCount, 0);
              const cSales = annotated.filter(p => p.classification === 'C').reduce((s, p) => s + p.salesCount, 0);

              return (
                <div className="space-y-6">
                  {/* Cards boxes */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-sans">
                    <div className="bg-pink-50/40 border border-pink-100 p-4 rounded-xl space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-slate-800">Classe A (Líquido Total)</span>
                        <span className="bg-pink-600 text-white font-bold px-2 py-0.5 rounded text-[8px] uppercase tracking-wider font-mono">Top Giro</span>
                      </div>
                      <p className="text-[11px] text-slate-500">Produtos de rápido escoamento. Representam cerca de 70% das peças consumidas.</p>
                      <div className="pt-2 border-t border-pink-100/60 flex justify-between font-mono font-bold text-slate-705">
                        <span>{aCount} Modelos</span>
                        <span className="text-pink-650">{aSales} vendas</span>
                      </div>
                    </div>

                    <div className="bg-amber-50/20 border border-amber-100 p-4 rounded-xl space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-slate-800">Classe B (Frequente)</span>
                        <span className="bg-amber-500 text-white font-bold px-2 py-0.5 rounded text-[8px] uppercase tracking-wider font-mono">Médio</span>
                      </div>
                      <p className="text-[11px] text-slate-500">Artigos de consumo intermediário. Garantem liquidez constante na vitrine física/online.</p>
                      <div className="pt-2 border-t border-amber-100/60 flex justify-between font-mono font-bold text-slate-705">
                        <span>{bCount} Modelos</span>
                        <span className="text-amber-600">{bSales} vendas</span>
                      </div>
                    </div>

                    <div className="bg-slate-50 border border-slate-150 p-4 rounded-xl space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-slate-800">Classe C (Estoque Parado)</span>
                        <span className="bg-slate-550 text-white font-bold px-2 py-0.5 rounded text-[8px] uppercase tracking-wider font-mono">Frio</span>
                      </div>
                      <p className="text-[11px] text-slate-500">Baixo giro. Ideais para cupons de desconto, liquidações ou combos promocionais.</p>
                      <div className="pt-2 border-t border-slate-150 flex justify-between font-mono font-bold text-slate-705">
                        <span>{cCount} Modelos</span>
                        <span className="text-slate-505">{cSales} vendas</span>
                      </div>
                    </div>
                  </div>

                  {/* Table mapping */}
                  <div className="border border-slate-100 rounded-xl overflow-hidden text-xs">
                    <div className="bg-slate-50 p-3 font-semibold text-slate-650 border-b border-slate-100 font-sans">Análise Individual por Peça</div>
                    
                    <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto pr-1">
                      {annotated.map((p, idx) => (
                        <div key={p.id} className="p-3 bg-white flex justify-between items-center">
                          <div className="flex items-center gap-3">
                            <span className="font-mono text-slate-350 font-bold">#{idx + 1}</span>
                            <div className="w-8 h-8 rounded bg-slate-50 overflow-hidden flex-shrink-0">
                              {p.image ? (
                                <img src={p.image} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                              ) : (
                                <div className="w-full h-full bg-slate-100 flex items-center justify-center text-slate-400">🧥</div>
                              )}
                            </div>
                            <div>
                              <span className="font-bold text-slate-800 text-[11px] block">{p.name}</span>
                              <span className="font-mono text-[9px] text-slate-400 block mt-0.5">SKU: {p.sku} | Estoque: {p.stock} uni</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-4 text-right">
                            <div className="font-mono">
                              <span className="font-bold text-slate-700 block text-[11px]">{p.salesCount} vendas</span>
                              {totalUnitsSold > 0 && (
                                <span className="text-[9px] text-slate-400 block mt-0.5">Acumulado {p.cumulativePercentage.toFixed(0)}%</span>
                              )}
                            </div>

                            <span className={`flex items-center justify-center font-bold text-[10px] font-mono rounded-full w-6 h-6 ${
                              p.classification === 'A' 
                                ? 'bg-pink-100 text-pink-700' 
                                : p.classification === 'B' 
                                  ? 'bg-amber-100 text-amber-700' 
                                  : 'bg-slate-100 text-slate-550'
                            }`}>
                              {p.classification}
                            </span>
                          </div>
                        </div>
                      ))}

                      {annotated.length === 0 && (
                        <div className="py-8 text-center text-slate-400 italic">Nenhum produto cadastrado para análise.</div>
                      )}
                    </div>
                  </div>

                  {/* Recommendations panel */}
                  <div className="bg-slate-900 text-slate-105 rounded-2xl p-4.5 space-y-2 text-xs border border-slate-800">
                    <span className="font-bold font-mono text-[10px] uppercase text-amber-500 block">💡 Diretrizes Estratégicas de Estoque AP Moda Fitness</span>
                    <ul className="list-disc list-inside space-y-1.5 text-slate-350 leading-relaxed text-[11px]">
                      <li>Utilize os itens <strong className="text-white">Classe C</strong> como brinde ou desconto na compra de combos inteiros de <strong className="text-white">Classe A</strong>.</li>
                      <li>Projete o estoque de segurança sempre multiplicando por 1.5 a média de vendas mensal das peças de <strong className="text-pink-400">Classe A</strong>.</li>
                      <li>Para os produtos <strong className="text-amber-500">Classe B</strong>, planeje ações de impulsionamento e marketing para transformá-los em Classe A.</li>
                    </ul>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* Add Product Modal Sheet */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 transition-all">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-50 overflow-hidden" id="add-product-modal">
            {/* Header */}
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <span className="font-bold text-xs tracking-wider uppercase font-sans">Cadastrar Nova Peça Fitness</span>
              <button 
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-white transition-colors text-xs"
              >
                ✕
              </button>
            </div>

            {/* Form list fields */}
            <form onSubmit={handleAddProductSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              <div className="space-y-1 text-xs">
                <label className="text-slate-500 font-bold uppercase text-[9px] tracking-wide">Nome Completo do Produto</label>
                <input 
                  id="new-product-name"
                  type="text"
                  required
                  placeholder="Ex: Legging Sculpt Seamless Pink Glow"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 placeholder-slate-450 focus:outline-hidden focus:border-pink-500 transition-all font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="space-y-1">
                  <label className="text-slate-500 font-bold uppercase text-[9px] tracking-wide">Cód SKU único</label>
                  <input 
                    id="new-product-sku"
                    type="text"
                    required
                    placeholder="Ex: LEG-SCUL-P"
                    value={newSku}
                    onChange={(e) => setNewSku(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 placeholder-slate-450 focus:outline-hidden focus:border-pink-500 transition-all font-medium font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <label className="text-slate-500 font-bold uppercase text-[9px] tracking-wide">Categoria</label>
                    <button
                      type="button"
                      onClick={() => setIsCreatingNewCategory(!isCreatingNewCategory)}
                      className="text-[10px] text-pink-600 hover:text-pink-700 font-semibold cursor-pointer"
                    >
                      {isCreatingNewCategory ? "Selecionar" : "+ Criar"}
                    </button>
                  </div>
                  {isCreatingNewCategory ? (
                    <input
                      type="text"
                      placeholder="Nova categoria..."
                      value={newCustomCategoryInput}
                      onChange={(e) => setNewCustomCategoryInput(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 placeholder-slate-450 focus:outline-hidden focus:border-pink-500 transition-all font-medium text-xs"
                      required
                    />
                  ) : (
                    <select 
                      id="new-product-category"
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-hidden focus:border-pink-500 transition-all font-medium text-xs"
                    >
                      {productCategoriesOnly.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="space-y-1">
                  <label className="text-slate-500 font-bold uppercase text-[9px] tracking-wide">Preço de Venda (R$)</label>
                  <input 
                    id="new-product-price"
                    type="number"
                    step="0.01"
                    required
                    value={newPrice}
                    onChange={(e) => setNewPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-hidden focus:border-pink-500 transition-all font-medium font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-500 font-bold uppercase text-[9px] tracking-wide">Custo de Fabr./Aq. (R$)</label>
                  <input 
                    id="new-product-cost"
                    type="number"
                    step="0.01"
                    required
                    value={newCost}
                    onChange={(e) => setNewCost(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-hidden focus:border-pink-500 transition-all font-medium font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="space-y-1">
                  <label className="text-slate-500 font-bold uppercase text-[9px] tracking-wide">Estoque Inicial (Peças)</label>
                  <input 
                    id="new-product-stock"
                    type="number"
                    required
                    value={newStock}
                    readOnly
                    className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-lg text-slate-500 focus:outline-hidden transition-all font-medium font-mono cursor-not-allowed"
                    title="Calculado automaticamente como a soma das quantidades por cor abaixo"
                  />
                  <p className="text-[8px] text-pink-600 font-semibold leading-none">Soma das quantidades por cor abaixo</p>
                </div>

                <div className="space-y-1">
                  <label className="text-slate-500 font-bold uppercase text-[9px] tracking-wide">Alerta Estoque Baixo (Peças)</label>
                  <input 
                    id="new-product-min-stock"
                    type="number"
                    required
                    value={newMinStock}
                    onChange={(e) => setNewMinStock(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-hidden focus:border-pink-500 transition-all font-medium font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1 text-xs">
                <label className="text-slate-500 font-bold uppercase text-[9px] tracking-wide block">Descrição Detalhada (Aparece no Site)</label>
                <textarea 
                  placeholder="Descreva detalhes premium da peça: tecido, toque gelado, compressão, se fica transparente..."
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 placeholder-slate-400 focus:outline-hidden focus:border-pink-500 transition-all font-medium h-16 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="space-y-1">
                  <label className="text-slate-500 font-bold uppercase text-[9px] tracking-wide">Cores Disponíveis (Gerais)</label>
                  <input 
                    type="text"
                    placeholder="Preto, Pink Glow, Azul Celeste"
                    value={newColors}
                    onChange={(e) => setNewColors(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-hidden focus:border-pink-500 transition-all font-medium font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-500 font-bold uppercase text-[9px] tracking-wide">Tamanhos Disponíveis</label>
                  <input 
                    type="text"
                    placeholder="P, M, G, GG"
                    value={newSizes}
                    onChange={(e) => setNewSizes(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-hidden focus:border-pink-500 transition-all font-medium font-mono"
                  />
                </div>
              </div>

              {newSizes.split(',').map(s => s.trim().toUpperCase()).filter(Boolean).length > 0 ? (
                <div className="space-y-3 mt-1 border border-pink-100 bg-pink-50/10 p-3 rounded-xl text-xs animate-fadeIn">
                  <div className="flex items-center gap-1.5 text-pink-700 font-bold uppercase text-[9px] tracking-widest">
                    <Sparkles size={11} className="text-pink-600 animate-pulse" />
                    <span>Estoque por Tamanho e Cor</span>
                  </div>
                  <p className="text-[9px] text-slate-400 leading-normal">
                    Informe a quantidade de peças para cada combinação de tamanho e cor. O estoque total será calculado automaticamente.
                  </p>
                  
                  <div className="space-y-3 pt-1">
                    {newSizes.split(',').map(s => s.trim().toUpperCase()).filter(Boolean).map(sz => {
                      const sizeColorsArr = newSizeColors[sz]
                        ? newSizeColors[sz].split(',').map(c => c.trim()).filter(Boolean)
                        : newColors.split(',').map(c => c.trim()).filter(Boolean);

                      if (sizeColorsArr.length === 0) return null;

                      return (
                        <div key={sz} className="border border-slate-100 bg-white p-2.5 rounded-lg shadow-2xs">
                          <div className="font-extrabold text-[10px] text-slate-800 bg-slate-150 px-2 py-0.5 rounded-md inline-block mb-2">
                            TAMANHO {sz}
                          </div>
                          
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {sizeColorsArr.map(color => (
                              <div key={color} className="flex items-center justify-between gap-2 bg-slate-50/50 p-2 rounded-lg border border-slate-100">
                                <div className="flex items-center gap-1.5 truncate">
                                  <span className="w-2.5 h-2.5 rounded-full border border-slate-200 shrink-0" style={{ backgroundColor: colorToHex(color) }} />
                                  <span className="font-semibold text-[10px] text-slate-700 truncate">{color}</span>
                                </div>
                                <input
                                  type="number"
                                  min="0"
                                  placeholder="0"
                                  value={newSizeColorStocks[sz]?.[color] !== undefined ? newSizeColorStocks[sz][color] : 0}
                                  onChange={(e) => {
                                    const val = Math.max(0, parseInt(e.target.value) || 0);
                                    setNewSizeColorStocks(prev => ({
                                      ...prev,
                                      [sz]: {
                                        ...(prev[sz] || {}),
                                        [color]: val
                                      }
                                    }));
                                  }}
                                  className="w-16 px-2 py-0.5 bg-white border border-slate-200 rounded-md text-slate-705 text-[10px] font-medium font-mono focus:outline-hidden focus:border-pink-500 text-center"
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                newColors.split(',').map(c => c.trim()).filter(Boolean).length > 0 && (
                  <div className="space-y-2 mt-1 border border-pink-100 bg-pink-50/10 p-3 rounded-xl text-xs">
                    <div className="flex items-center gap-1.5 text-pink-700 font-bold uppercase text-[9px] tracking-widest">
                      <Sparkles size={11} className="text-pink-600 animate-pulse" />
                      <span>Estoque por Cor</span>
                    </div>
                    <p className="text-[9px] text-slate-400 leading-normal">
                      Informe a quantidade de peças para cada cor informada acima. A soma total irá definir o estoque inicial do produto automaticamente.
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                      {newColors.split(',').map(c => c.trim()).filter(Boolean).map(color => (
                        <div key={color} className="flex items-center justify-between gap-2 bg-white p-2 rounded-lg border border-slate-150 shadow-2xs">
                          <div className="flex items-center gap-1.5 truncate">
                            <span className="w-2.5 h-2.5 rounded-full border border-slate-200 shrink-0 animate-pulse" style={{ backgroundColor: colorToHex(color) }} />
                            <span className="font-semibold text-[10px] text-slate-700 truncate">{color}</span>
                          </div>
                          <input
                            type="number"
                            min="0"
                            placeholder="0"
                            value={newColorStocks[color] !== undefined ? newColorStocks[color] : 0}
                            onChange={(e) => {
                              const val = Math.max(0, parseInt(e.target.value) || 0);
                              setNewColorStocks(prev => ({
                                ...prev,
                                [color]: val
                              }));
                            }}
                            className="w-16 px-2 py-0.5 bg-slate-50 border border-slate-200 rounded-md text-slate-705 text-[10px] font-medium font-mono focus:outline-hidden focus:border-pink-500 text-center"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )
              )}

              {newSizes.split(',').map(s => s.trim().toUpperCase()).filter(Boolean).length > 0 && (
                <div className="space-y-2 mt-1 border border-slate-100 bg-slate-50/50 p-3 rounded-xl text-xs">
                  <div className="flex items-center gap-1.5 text-slate-700 font-bold uppercase text-[9px] tracking-widest">
                    <Sparkles size={11} className="text-pink-600 animate-pulse" />
                    <span>CORES ESPECÍFICAS POR TAMANHO (OPCIONAL)</span>
                  </div>
                  <p className="text-[9px] text-slate-400 leading-normal">
                    Associe cores a cada tamanho. Se configurado, o cliente verá apenas as cores vinculadas ao selecionar o respectivo tamanho. Digite as cores separadas por vírgula.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                    {newSizes.split(',').map(s => s.trim().toUpperCase()).filter(Boolean).map(sz => (
                      <div key={sz} className="flex items-center gap-2 bg-white p-2 rounded-lg border border-slate-150 shadow-2xs">
                        <span className="font-extrabold text-[10px] text-slate-800 bg-slate-100 px-2 py-0.5 rounded-md min-w-[28px] text-center">{sz}</span>
                        <input
                          type="text"
                          placeholder="Ex: Azul Marinho, Preto, Vermelho"
                          value={newSizeColors[sz] || ''}
                          onChange={(e) => {
                            setNewSizeColors(prev => ({
                              ...prev,
                              [sz]: e.target.value
                            }));
                          }}
                          className="flex-1 px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-md text-slate-705 focus:outline-hidden focus:border-pink-500 transition-all text-[10px] font-medium font-mono"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-1 text-xs">
                <label className="text-slate-500 font-bold uppercase text-[9px] tracking-wide block">Link de Vídeo MP4 ou YouTube (Showcase)</label>
                <input 
                  type="text"
                  placeholder="Ex: https://www.w3schools.com/html/movie.mp4"
                  value={newVideoUrl}
                  onChange={(e) => setNewVideoUrl(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-hidden focus:border-pink-500 transition-all font-medium font-mono text-xs"
                />
              </div>

              <div className="space-y-3 text-xs bg-slate-50 p-3 rounded-xl border border-slate-100">
                <label className="text-slate-600 font-extrabold uppercase text-[10px] tracking-wide block">Galeria de Fotos do Produto (Múltiplas Fotos)</label>
                
                {/* Previews grid */}
                <div className="grid grid-cols-5 gap-2">
                  {newImages.map((img, idx) => (
                    <div key={idx} className="relative aspect-square rounded-lg border border-slate-200 overflow-hidden bg-slate-100 group shadow-xs">
                      <img src={img} alt={`Preview ${idx + 1}`} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => {
                          const updated = newImages.filter((_, i) => i !== idx);
                          setNewImages(updated);
                        }}
                        className="absolute top-1 right-1 bg-rose-600 hover:bg-rose-700 text-white p-1 rounded-full cursor-pointer transition-all shadow-md flex items-center justify-center border-none"
                        title="Remover esta foto"
                      >
                        <X size={10} />
                      </button>
                      {idx === 0 && (
                        <span className="absolute bottom-0 inset-x-0 bg-pink-600/90 text-white font-extrabold text-[8px] text-center tracking-wider py-0.5 uppercase">CAPA</span>
                      )}
                    </div>
                  ))}
                  {newImages.length === 0 && (
                    <div className="col-span-5 py-4 text-center text-slate-400 font-medium text-xs">
                      Nenhuma foto adicionada. Adicione pelo menos uma foto abaixo.
                    </div>
                  )}
                </div>

                {/* Direct File Picker / Uploader */}
                <div className="bg-pink-50/50 border border-pink-100 p-2.5 rounded-lg text-[9.5px] leading-snug text-slate-700 flex items-start gap-1.5 font-sans my-1 select-none">
                  <span className="text-pink-600">💡</span>
                  <p><strong>Dimensões Recomendadas para Moda/Fitness:</strong> Prefira fotos na proporção <strong>4:5 Vertical</strong> (ex: 800×1000 px) ou <strong>1:1 Quadrada</strong> (ex: 800×800 px) para valorizar as peças no caimento corporal e na vitrine.</p>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] text-slate-500 font-bold block">1. Enviar nova foto direto do aparelho:</span>
                  <ImageUploader 
                    onUploadSuccess={(url) => {
                      if (url) {
                        setNewImages(prev => [...prev, url]);
                      }
                    }} 
                    currentImageUrl=""
                  />
                </div>
                
                {/* Manual Link Input */}
                <div className="space-y-1.5 pt-1.5 border-t border-slate-200/60 font-sans">
                  <span className="text-[10px] text-slate-500 font-bold block">2. Ou cole o link de uma foto da internet:</span>
                  <div className="flex gap-2">
                    <input 
                      id="new-product-image-add-input"
                      type="text"
                      placeholder="Cole o link da foto de um produto..."
                      className="flex-1 px-2.5 py-1.5 bg-white border border-slate-200 rounded-md text-slate-600 focus:outline-hidden focus:border-pink-500 transition-all font-mono text-[10px]"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          const val = (e.target as HTMLInputElement).value.trim();
                          if (val) {
                            setNewImages(prev => [...prev, val]);
                            (e.target as HTMLInputElement).value = '';
                          }
                        }
                      }}
                    />
                    <button 
                      type="button" 
                      onClick={(e) => {
                        const input = document.getElementById('new-product-image-add-input') as HTMLInputElement;
                        if (input && input.value.trim()) {
                          setNewImages(prev => [...prev, input.value.trim()]);
                          input.value = '';
                        }
                      }}
                      className="px-3 bg-pink-600 hover:bg-pink-700 text-white font-bold rounded-md transition-all cursor-pointer text-xs border-none"
                    >
                      Adicionar
                    </button>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-4">
                <button 
                  type="button" 
                  onClick={() => setIsAddModalOpen(false)}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-650 rounded-xl text-xs font-bold font-sans transition-all cursor-pointer text-center"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-2.5 bg-pink-600 hover:bg-pink-700 text-white rounded-xl text-xs font-bold font-sans transition-all cursor-pointer text-center shadow-md shadow-pink-500/10"
                >
                  Gravar Produto
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Product Modal Sheet */}
      {isEditModalOpen && editingProduct && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 transition-all font-sans text-xs">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-50 overflow-hidden animate-in fade-in zoom-in duration-200" id="edit-product-modal">
            {/* Header */}
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <span className="font-bold text-xs tracking-wider uppercase">Editar Peça Fitness</span>
              <button 
                type="button"
                onClick={() => {
                  setIsEditModalOpen(false);
                  setEditingProduct(null);
                }}
                className="text-slate-400 hover:text-white transition-colors text-xs"
              >
                ✕
              </button>
            </div>

            {/* Form list fields */}
            <form onSubmit={handleEditProductSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              <div className="space-y-1">
                <label className="text-slate-500 font-bold uppercase text-[9px] tracking-wide block">Nome Completo do Produto</label>
                <input 
                  id="edit-product-name"
                  type="text"
                  required
                  placeholder="Ex: Legging Sculpt Seamless Pink Glow"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 placeholder-slate-450 focus:outline-hidden focus:border-pink-500 transition-all font-medium text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-slate-500 font-bold uppercase text-[9px] tracking-wide block">Cód SKU único</label>
                  <input 
                    id="edit-product-sku"
                    type="text"
                    required
                    placeholder="Ex: LEG-SCUL-P"
                    value={editSku}
                    onChange={(e) => setEditSku(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 placeholder-slate-450 focus:outline-hidden focus:border-pink-500 transition-all font-medium font-mono text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <label className="text-slate-500 font-bold uppercase text-[9px] tracking-wide">Categoria</label>
                    <button
                      type="button"
                      onClick={() => setIsEditingNewCategory(!isEditingNewCategory)}
                      className="text-[10px] text-pink-600 hover:text-pink-700 font-semibold cursor-pointer"
                    >
                      {isEditingNewCategory ? "Selecionar" : "+ Criar"}
                    </button>
                  </div>
                  {isEditingNewCategory ? (
                    <input
                      type="text"
                      placeholder="Nova categoria..."
                      value={editCustomCategoryInput}
                      onChange={(e) => setEditCustomCategoryInput(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 placeholder-slate-450 focus:outline-hidden focus:border-pink-500 transition-all font-medium text-xs"
                      required
                    />
                  ) : (
                    <select 
                      id="edit-product-category"
                      value={editCategory}
                      onChange={(e) => setEditCategory(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-hidden focus:border-pink-500 transition-all font-medium text-xs"
                    >
                      {productCategoriesOnly.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-slate-500 font-bold uppercase text-[9px] tracking-wide block">Preço de Venda (R$)</label>
                  <input 
                    id="edit-product-price"
                    type="number"
                    step="0.01"
                    required
                    value={editPrice}
                    onChange={(e) => setEditPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-hidden focus:border-pink-500 transition-all font-medium font-mono text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-500 font-bold uppercase text-[9px] tracking-wide block">Custo de Fabr./Aq. (R$)</label>
                  <input 
                    id="edit-product-cost"
                    type="number"
                    step="0.01"
                    required
                    value={editCost}
                    onChange={(e) => setEditCost(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-hidden focus:border-pink-500 transition-all font-medium font-mono text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-slate-500 font-bold uppercase text-[9px] tracking-wide block">Estoque (Peças)</label>
                  <input 
                    id="edit-product-stock"
                    type="number"
                    required
                    value={editStock}
                    readOnly
                    className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-lg text-slate-500 focus:outline-hidden transition-all font-medium font-mono text-xs cursor-not-allowed"
                    title="Calculado automaticamente como a soma das quantidades por cor abaixo"
                  />
                  <p className="text-[8px] text-pink-600 font-semibold leading-none">Soma das quantidades por cor abaixo</p>
                </div>

                <div className="space-y-1">
                  <label className="text-slate-500 font-bold uppercase text-[9px] tracking-wide block">Alerta Estoque Baixo (Peças)</label>
                  <input 
                    id="edit-product-min-stock"
                    type="number"
                    required
                    value={editMinStock}
                    onChange={(e) => setEditMinStock(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-hidden focus:border-pink-500 transition-all font-medium font-mono text-xs"
                  />
                </div>
              </div>

              <div className="space-y-1 text-xs">
                <label className="text-slate-500 font-bold uppercase text-[9px] tracking-wide block">Descrição Detalhada (Aparece no Site)</label>
                <textarea 
                  placeholder="Descreva detalhes premium da peça: tecido, toque gelado, compressão, se fica transparente..."
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 placeholder-slate-450 focus:outline-hidden focus:border-pink-500 transition-all font-medium h-16 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="space-y-1">
                  <label className="text-slate-500 font-bold uppercase text-[9px] tracking-wide block">Cores Disponíveis (Gerais)</label>
                  <input 
                    type="text"
                    placeholder="Preto, Pink Glow, Azul Celeste"
                    value={editColors}
                    onChange={(e) => setEditColors(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-hidden focus:border-pink-500 transition-all font-medium font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-500 font-bold uppercase text-[9px] tracking-wide block">Tamanhos Disponíveis</label>
                  <input 
                    type="text"
                    placeholder="P, M, G, GG"
                    value={editSizes}
                    onChange={(e) => setEditSizes(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-hidden focus:border-pink-500 transition-all font-medium font-mono"
                  />
                </div>
              </div>

              {editSizes.split(',').map(s => s.trim().toUpperCase()).filter(Boolean).length > 0 ? (
                <div className="space-y-3 mt-1 border border-pink-100 bg-pink-50/10 p-3 rounded-xl text-xs animate-fadeIn">
                  <div className="flex items-center gap-1.5 text-pink-700 font-bold uppercase text-[9px] tracking-widest">
                    <Sparkles size={11} className="text-pink-600 animate-pulse" />
                    <span>Estoque por Tamanho e Cor</span>
                  </div>
                  <p className="text-[9px] text-slate-400 leading-normal">
                    Informe a quantidade de peças para cada combinação de tamanho e cor. O estoque total será calculado automaticamente.
                  </p>
                  
                  <div className="space-y-3 pt-1">
                    {editSizes.split(',').map(s => s.trim().toUpperCase()).filter(Boolean).map(sz => {
                      const sizeColorsArr = editSizeColors[sz]
                        ? editSizeColors[sz].split(',').map(c => c.trim()).filter(Boolean)
                        : editColors.split(',').map(c => c.trim()).filter(Boolean);

                      if (sizeColorsArr.length === 0) return null;

                      return (
                        <div key={sz} className="border border-slate-100 bg-white p-2.5 rounded-lg shadow-2xs">
                          <div className="font-extrabold text-[10px] text-slate-800 bg-slate-150 px-2 py-0.5 rounded-md inline-block mb-2">
                            TAMANHO {sz}
                          </div>
                          
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {sizeColorsArr.map(color => (
                              <div key={color} className="flex items-center justify-between gap-2 bg-slate-50/50 p-2 rounded-lg border border-slate-100">
                                <div className="flex items-center gap-1.5 truncate">
                                  <span className="w-2.5 h-2.5 rounded-full border border-slate-200 shrink-0" style={{ backgroundColor: colorToHex(color) }} />
                                  <span className="font-semibold text-[10px] text-slate-700 truncate">{color}</span>
                                </div>
                                <input
                                  type="number"
                                  min="0"
                                  placeholder="0"
                                  value={editSizeColorStocks[sz]?.[color] !== undefined ? editSizeColorStocks[sz][color] : 0}
                                  onChange={(e) => {
                                    const val = Math.max(0, parseInt(e.target.value) || 0);
                                    setEditSizeColorStocks(prev => ({
                                      ...prev,
                                      [sz]: {
                                        ...(prev[sz] || {}),
                                        [color]: val
                                      }
                                    }));
                                  }}
                                  className="w-16 px-2 py-0.5 bg-white border border-slate-200 rounded-md text-slate-705 text-[10px] font-medium font-mono focus:outline-hidden focus:border-pink-500 text-center"
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                editColors.split(',').map(c => c.trim()).filter(Boolean).length > 0 && (
                  <div className="space-y-2 mt-1 border border-pink-100 bg-pink-50/10 p-3 rounded-xl text-xs">
                    <div className="flex items-center gap-1.5 text-pink-700 font-bold uppercase text-[9px] tracking-widest">
                      <Sparkles size={11} className="text-pink-600 animate-pulse" />
                      <span>Estoque por Cor</span>
                    </div>
                    <p className="text-[9px] text-slate-400 leading-normal">
                      Informe a quantidade de peças para cada cor informada acima. A soma total irá definir o estoque do produto automaticamente.
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                      {editColors.split(',').map(c => c.trim()).filter(Boolean).map(color => (
                        <div key={color} className="flex items-center justify-between gap-2 bg-white p-2 rounded-lg border border-slate-150 shadow-2xs">
                          <div className="flex items-center gap-1.5 truncate">
                            <span className="w-2.5 h-2.5 rounded-full border border-slate-200 shrink-0 animate-pulse" style={{ backgroundColor: colorToHex(color) }} />
                            <span className="font-semibold text-[10px] text-slate-700 truncate">{color}</span>
                          </div>
                          <input
                            type="number"
                            min="0"
                            placeholder="0"
                            value={editColorStocks[color] !== undefined ? editColorStocks[color] : 0}
                            onChange={(e) => {
                              const val = Math.max(0, parseInt(e.target.value) || 0);
                              setEditColorStocks(prev => ({
                                ...prev,
                                [color]: val
                              }));
                            }}
                            className="w-16 px-2 py-0.5 bg-slate-50 border border-slate-200 rounded-md text-slate-705 text-[10px] font-medium font-mono focus:outline-hidden focus:border-pink-500 text-center"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )
              )}

              {editSizes.split(',').map(s => s.trim().toUpperCase()).filter(Boolean).length > 0 && (
                <div className="space-y-2 mt-1 border border-slate-100 bg-slate-50/50 p-3 rounded-xl text-xs">
                  <div className="flex items-center gap-1.5 text-slate-700 font-bold uppercase text-[9px] tracking-widest">
                    <Sparkles size={11} className="text-pink-600 animate-pulse" />
                    <span>CORES ESPECÍFICAS POR TAMANHO (OPCIONAL)</span>
                  </div>
                  <p className="text-[9px] text-slate-400 leading-normal">
                    Associe cores a cada tamanho. Se configurado, o cliente verá apenas as cores vinculadas ao selecionar o respectivo tamanho. Digite as cores separadas por vírgula.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                    {editSizes.split(',').map(s => s.trim().toUpperCase()).filter(Boolean).map(sz => (
                      <div key={sz} className="flex items-center gap-2 bg-white p-2 rounded-lg border border-slate-150 shadow-2xs">
                        <span className="font-extrabold text-[10px] text-slate-800 bg-slate-100 px-2 py-0.5 rounded-md min-w-[28px] text-center">{sz}</span>
                        <input
                          type="text"
                          placeholder="Ex: Azul Marinho, Preto, Vermelho"
                          value={editSizeColors[sz] || ''}
                          onChange={(e) => {
                            setEditSizeColors(prev => ({
                              ...prev,
                              [sz]: e.target.value
                            }));
                          }}
                          className="flex-1 px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-md text-slate-705 focus:outline-hidden focus:border-pink-500 transition-all text-[10px] font-medium font-mono"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-1 text-xs">
                <label className="text-slate-500 font-bold uppercase text-[9px] tracking-wide block">Link de Vídeo MP4 ou YouTube (Showcase)</label>
                <input 
                  type="text"
                  placeholder="Ex: https://www.w3schools.com/html/movie.mp4"
                  value={editVideoUrl}
                  onChange={(e) => setEditVideoUrl(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-hidden focus:border-pink-500 transition-all font-medium font-mono text-xs"
                />
              </div>

              <div className="space-y-3 text-xs bg-slate-50 p-3 rounded-xl border border-slate-100">
                <label className="text-slate-600 font-extrabold uppercase text-[10px] tracking-wide block">Galeria de Fotos do Produto (Múltiplas Fotos)</label>
                
                {/* Previews grid */}
                <div className="grid grid-cols-5 gap-2">
                  {editImages.map((img, idx) => (
                    <div key={idx} className="relative aspect-square rounded-lg border border-slate-200 overflow-hidden bg-slate-100 group shadow-xs">
                      <img src={img} alt={`Preview ${idx + 1}`} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => {
                          const updated = editImages.filter((_, i) => i !== idx);
                          setEditImages(updated);
                        }}
                        className="absolute top-1 right-1 bg-rose-600 hover:bg-rose-700 text-white p-1 rounded-full cursor-pointer transition-all shadow-md flex items-center justify-center border-none"
                        title="Remover esta foto"
                      >
                        <X size={10} />
                      </button>
                      {idx === 0 && (
                        <span className="absolute bottom-0 inset-x-0 bg-pink-600/90 text-white font-extrabold text-[8px] text-center tracking-wider py-0.5 uppercase">CAPA</span>
                      )}
                    </div>
                  ))}
                  {editImages.length === 0 && (
                    <div className="col-span-5 py-4 text-center text-slate-400 font-medium text-xs">
                      Nenhuma foto adicionada. Adicione pelo menos uma foto abaixo.
                    </div>
                  )}
                </div>

                {/* Direct File Picker / Uploader */}
                <div className="bg-pink-50/50 border border-pink-100 p-2.5 rounded-lg text-[9.5px] leading-snug text-slate-700 flex items-start gap-1.5 font-sans my-1 select-none">
                  <span className="text-pink-600">💡</span>
                  <p><strong>Dimensões Recomendadas para Moda/Fitness:</strong> Prefira fotos na proporção <strong>4:5 Vertical</strong> (ex: 800×1000 px) ou <strong>1:1 Quadrada</strong> (ex: 800×800 px) para valorizar as peças no caimento corporal e na vitrine.</p>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] text-slate-500 font-bold block">1. Enviar nova foto direto do aparelho:</span>
                  <ImageUploader 
                    onUploadSuccess={(url) => {
                      if (url) {
                        setEditImages(prev => [...prev, url]);
                      }
                    }} 
                    currentImageUrl=""
                  />
                </div>
                
                {/* Manual Link Input */}
                <div className="space-y-1.5 pt-1.5 border-t border-slate-200/60 font-sans">
                  <span className="text-[10px] text-slate-500 font-bold block">2. Ou cole o link de uma foto da internet:</span>
                  <div className="flex gap-2">
                    <input 
                      id="edit-product-image-add-input"
                      type="text"
                      placeholder="Cole o link da foto de um produto..."
                      className="flex-1 px-2.5 py-1.5 bg-white border border-slate-200 rounded-md text-slate-600 focus:outline-hidden focus:border-pink-500 transition-all font-mono text-[10px]"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          const val = (e.target as HTMLInputElement).value.trim();
                          if (val) {
                            setEditImages(prev => [...prev, val]);
                            (e.target as HTMLInputElement).value = '';
                          }
                        }
                      }}
                    />
                    <button 
                      type="button" 
                      onClick={(e) => {
                        const input = document.getElementById('edit-product-image-add-input') as HTMLInputElement;
                        if (input && input.value.trim()) {
                          setEditImages(prev => [...prev, input.value.trim()]);
                          input.value = '';
                        }
                      }}
                      className="px-3 bg-pink-600 hover:bg-pink-700 text-white font-bold rounded-md transition-all cursor-pointer text-xs border-none"
                    >
                      Adicionar
                    </button>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-4">
                <button 
                  type="button" 
                  onClick={() => {
                    setIsEditModalOpen(false);
                    setEditingProduct(null);
                  }}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-650 rounded-xl text-xs font-bold transition-all cursor-pointer text-center"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-2.5 bg-pink-600 hover:bg-pink-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer text-center shadow-md shadow-pink-500/10"
                >
                  Gravar Alterações
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Custom Combo Modal Popup */}
      {isComboModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 transition-all">
          <div className="bg-white rounded-2xl max-w-sm w-full shadow-2xl border border-slate-50 overflow-hidden font-sans">
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <span className="font-bold text-xs tracking-wider uppercase">Criador de Combo Promocional</span>
              <button 
                onClick={() => setIsComboModalOpen(false)}
                className="text-slate-400 hover:text-white transition-colors text-xs"
              >
                ✕
              </button>
            </div>

            <form 
              onSubmit={(e) => {
                e.preventDefault();
                if (!comboName.trim()) {
                  alert('Insira o nome do combo!');
                  return;
                }
                if (selectedComboProducts.length === 0) {
                  alert('Selecione pelo menos uma peça de roupa para o combo!');
                  return;
                }

                const comboItems = selectedComboProducts.map(prodId => {
                  const p = products.find(prod => prod.id === prodId);
                  return {
                    productId: prodId,
                    name: p ? p.name : 'Peça desconhecida',
                    quantity: 1
                  };
                });

                const newCombo = {
                  id: `combo-${Date.now()}`,
                  name: comboName.trim(),
                  price: comboPrice,
                  items: comboItems,
                  salesCount: 0,
                  active: true
                };

                setCombos(prev => [newCombo, ...prev]);
                setIsComboModalOpen(false);
                alert('Combo promocional cadastrado com sucesso!');
              }}
              className="p-6 space-y-4 text-xs text-slate-700"
            >
              <div className="space-y-1">
                <label className="text-slate-500 font-bold uppercase text-[9px] tracking-wide block">Nome do Combo</label>
                <input 
                  type="text"
                  required
                  placeholder="Ex: Conjunto Top + Legging"
                  value={comboName}
                  onChange={(e) => setComboName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-pink-500 transition-all font-medium"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-500 font-bold uppercase text-[9px] tracking-wide block">Preço Promocional Combo (R$)</label>
                <input 
                  type="number"
                  required
                  value={comboPrice}
                  onChange={(e) => setComboPrice(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-pink-500 transition-all font-mono font-medium"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-400 font-bold uppercase text-[9px] tracking-wide block">Selecione as Peças que fazem parte:</label>
                <div className="space-y-1.5 max-h-48 overflow-y-auto border border-slate-100 p-2 rounded-lg bg-slate-50/50 pr-1">
                  {products.map(p => (
                    <label key={p.id} className="flex items-center gap-2 p-1.5 bg-white border border-slate-100 rounded-md cursor-pointer hover:border-slate-200">
                      <input 
                        type="checkbox"
                        checked={selectedComboProducts.includes(p.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedComboProducts(prev => [...prev, p.id]);
                          } else {
                            setSelectedComboProducts(prev => prev.filter(id => id !== p.id));
                          }
                        }}
                        className="rounded border-slate-200 text-pink-600 focus:ring-pink-500"
                      />
                      <span className="text-[11px] font-sans font-medium text-slate-700 truncate">{p.name} (SKU: {p.sku})</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex gap-2 pt-3">
                <button 
                  type="button" 
                  onClick={() => setIsComboModalOpen(false)}
                  className="flex-1 py-2 bg-slate-100 text-slate-650 rounded-lg font-bold transition-all hover:bg-slate-205 cursor-pointer text-center border-none"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-2 bg-pink-600 text-white rounded-lg font-bold transition-all hover:bg-pink-700 cursor-pointer text-center shadow-md shadow-pink-500/10 border-none"
                >
                  Confirmar Combo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
