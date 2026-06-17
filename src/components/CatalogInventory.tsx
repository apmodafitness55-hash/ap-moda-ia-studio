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
  X
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

    const colorsArray = newColors.split(',').map(s => s.trim()).filter(Boolean);
    const sizesArray = newSizes.split(',').map(s => s.trim().toUpperCase()).filter(Boolean);

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
      sizes: sizesArray
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

    const colorsArray = editColors.split(',').map(s => s.trim()).filter(Boolean);
    const sizesArray = editSizes.split(',').map(s => s.trim().toUpperCase()).filter(Boolean);

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
      sizes: sizesArray
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
                    onChange={(e) => setNewStock(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-hidden focus:border-pink-500 transition-all font-medium font-mono"
                  />
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
                  <label className="text-slate-500 font-bold uppercase text-[9px] tracking-wide">Cores Disponíveis</label>
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
                    onChange={(e) => setEditStock(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-hidden focus:border-pink-500 transition-all font-medium font-mono text-xs"
                  />
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
                  <label className="text-slate-500 font-bold uppercase text-[9px] tracking-wide block">Cores Disponíveis</label>
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
    </div>
  );
}
