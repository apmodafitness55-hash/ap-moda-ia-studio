/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from 'react';
import { 
  ShoppingBag, 
  Search, 
  MapPin, 
  Phone, 
  X, 
  MessageCircle, 
  ChevronRight, 
  ChevronLeft,
  Play, 
  Tag, 
  Sparkles, 
  Truck, 
  Info,
  Check,
  Gift,
  Plus,
  Minus,
  Send,
  Video,
  Heart,
  Star,
  Menu,
  User,
  ArrowLeft,
  Maximize2,
  Lock,
  ThumbsUp,
  CreditCard,
  Eye,
  Edit,
  Trash2,
  Palette,
  Layout,
  Megaphone,
  Save,
  QrCode,
  Handshake,
  Ruler,
  Clock
} from 'lucide-react';
import { Product, Client } from '../types';
import { pushSystemConfigToSupabase } from '../supabase';

const COLOR_HEXES: Record<string, string> = {
  'fúcsia': '#d946ef',
  'fucsia': '#d946ef',
  'magenta': '#d946ef',
  'marrom': '#78350f',
  'roxo imperial': '#6b21a8',
  'verde militar': '#15803d',
  'militar': '#15803d',
  'vermelho duo': '#991b1b',
  'vinho': '#991b1b',
  'bordô': '#991b1b',
  'bordo': '#991b1b',
  'preto': '#0f172a',
  'black': '#0f172a',
  'branco': '#ffffff',
  'white': '#ffffff',
  'pink glow': '#ec4899',
  'azul celeste': '#0ea5e9',
  'azul marinho': '#1e3a8a',
  'marinho': '#1e3a8a',
  'azul': '#3b82f6',
  'vermelho': '#ef4444',
  'verde': '#22c55e',
  'rosa': '#f472b6',
  'amarelo': '#eab308',
  'amarelo neon': '#ccff00',
  'roxo': '#a855f7',
  'lilas': '#7c3aed',
  'lilás': '#7c3aed',
  'violeta': '#7c3aed',
  'cinza': '#64748b',
  'gray': '#64748b',
  'grey': '#64748b',
  'chumbo': '#475569',
  'grafite': '#334155',
  'bege': '#d97706',
  'beige': '#d97706',
  'caqui': '#d97706',
  'creme': '#d97706',
  'coral': '#f97316',
  'salmao': '#f97316',
  'salmão': '#f97316'
};

const getColorHex = (name: string) => {
  const norm = name.trim().toLowerCase();
  if (COLOR_HEXES[norm]) return COLOR_HEXES[norm];
  
  // Try sub-matches for compound color names like "verde militar" or "azul marinho"
  if (norm.includes('preto') || norm.includes('black')) return '#0f172a';
  if (norm.includes('branco') || norm.includes('white')) return '#ffffff';
  if (norm.includes('rosa') || norm.includes('pink')) return '#ec4899';
  if (norm.includes('fucsia') || norm.includes('fúcsia') || norm.includes('magenta')) return '#d946ef';
  if (norm.includes('marinho')) return '#1e3a8a';
  if (norm.includes('azul')) return '#3b82f6';
  if (norm.includes('militar') || norm.includes('verde')) return '#15803d';
  if (norm.includes('vinho') || norm.includes('bordo') || norm.includes('bordô') || norm.includes('vermelho')) return '#991b1b';
  if (norm.includes('amarelo')) return '#eab308';
  if (norm.includes('cinza') || norm.includes('gray') || norm.includes('grey') || norm.includes('chumbo') || norm.includes('grafite')) return '#64748b';
  if (norm.includes('laranja')) return '#ea580c';
  if (norm.includes('roxo') || norm.includes('purple') || norm.includes('lilas') || norm.includes('lilás')) return '#7c3aed';
  if (norm.includes('bege') || norm.includes('beige') || norm.includes('caqui') || norm.includes('creme')) return '#d97706';
  if (norm.includes('marrom')) return '#78350f';
  if (norm.includes('coral') || norm.includes('salmao') || norm.includes('salmão')) return '#f97316';

  // Custom hash logic to get a deterministic nice light color
  let hash = 0;
  for (let i = 0; i < norm.length; i++) {
    hash = norm.charCodeAt(i) + ((hash << 5) - hash);
  }
  const h = Math.abs(hash) % 360;
  return `hsl(${h}, 65%, 55%)`;
};

interface PublicCatalogProps {
  products: Product[];
  onAddOnlineOrder?: (order: any) => void;
  onAddCheckout?: (checkout: any) => void;
  clients: Client[];
  onAddClient: (newClient: Client) => void;
  onUpdateClients?: (updatedList: Client[]) => void;
  onExitCustomerView?: () => void;
  currentUser?: any;
}

export default function PublicCatalog({ 
  products, 
  onAddOnlineOrder, 
  onAddCheckout,
  clients = [], 
  onAddClient, 
  onUpdateClients,
  onExitCustomerView,
  currentUser
}: PublicCatalogProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  
  // Custom states for interactive lookbook carousel
  const [currentSlide, setCurrentSlide] = useState(0);

  const [storeName, setStoreName] = useState(() => {
    return localStorage.getItem('ap_vitrine_store_name') || "AP Moda Fitness";
  });
  const [storeSub, setStoreSub] = useState(() => {
    return localStorage.getItem('ap_vitrine_store_sub') || "Moda Fitness Premium";
  });
  const [themeColor, setThemeColor] = useState(() => {
    return localStorage.getItem('ap_vitrine_theme_color') || "#db2777";
  });

  const [lookbookSlides, setLookbookSlides] = useState<any[]>(() => {
    try {
      const saved = localStorage.getItem('ap_vitrine_slides');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    return [
      {
        image: "https://images.unsplash.com/photo-1518310383802-640c2de311b2?w=1100&q=80",
        tag: "COLEÇÃO EXCLUSIVA",
        title: "ATACADO PREMIUM",
        desc: "Compre no atacado a partir de 15 unidades com preços imbatíveis de fábrica."
      },
      {
        image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=1100&q=80",
        tag: "NOVA COLEÇÃO 2 EM 1",
        title: "COLEÇÃO DUO",
        desc: "Experimente peças de alta compressão e toque sensorial único. Confira Lançamentos!"
      },
      {
        image: "https://images.unsplash.com/photo-1507398941214-572c25f4b1dc?w=1100&q=80",
        tag: "ALTA PERFORMANCE",
        title: "SUA JORNADA RUN",
        desc: "Tecnologia respirável com costura reforçada e poliamida biodegradável premium."
      }
    ];
  });

  // Dynamic Announcement Ticker
  const [tickerConfig, setTickerConfig] = useState(() => {
    try {
      const saved = localStorage.getItem('ap_vitrine_announcement');
      if (saved) return JSON.parse(saved);
    } catch(e) {}
    return {
      show: true,
      text: "⚡ ENVIAMOS PARA TODO BRASIL • FRETE GRÁTIS ACIMA DE R$ 399 ATÉ 6X SEM JUROS ⚡",
      bgColor: "#db2777", // pink-600
      textColor: "#ffffff"
    };
  });

  // Category highlight box banners
  const [categoryBanners, setCategoryBanners] = useState(() => {
    try {
      const saved = localStorage.getItem('ap_vitrine_category_banners');
      if (saved) return JSON.parse(saved);
    } catch(e) {}
    return {
      slimFit: "https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?w=600&q=80",
      plusSize: "https://images.unsplash.com/photo-1518310383802-640c2de311b2?w=600&q=80"
    };
  });

  // Floating campaign promotion banner configuration
  const [floatingBanner, setFloatingBanner] = useState<any>(() => {
    try {
      const saved = localStorage.getItem('ap_vitrine_floating_banner');
      if (saved) return JSON.parse(saved);
    } catch(e){}
    return {
      show: true,
      title: "✨ CUPOM DA SEMANA",
      subtitle: "Insira APMODAFIT no carrinho para ganhar 5% OFF e frete grátis!",
      ctaText: "Aproveitar Desconto",
      ctaLink: "https://wa.me/5511999990000?text=Quero%20aproveitar%20o%20cupom%20de%20desconto",
      bgColor: "#ec4899", // pink-500
      textColor: "#ffffff"
    };
  });

  const [isFloatingDismissed, setIsFloatingDismissed] = useState(false);

  // Sync edits to localStorage
  useEffect(() => {
    localStorage.setItem('ap_vitrine_store_name', storeName);
    localStorage.setItem('ap_vitrine_store_sub', storeSub);
    localStorage.setItem('ap_vitrine_theme_color', themeColor);
  }, [storeName, storeSub, themeColor]);

  useEffect(() => {
    localStorage.setItem('ap_vitrine_slides', JSON.stringify(lookbookSlides));
  }, [lookbookSlides]);

  useEffect(() => {
    localStorage.setItem('ap_vitrine_announcement', JSON.stringify(tickerConfig));
  }, [tickerConfig]);

  useEffect(() => {
    localStorage.setItem('ap_vitrine_category_banners', JSON.stringify(categoryBanners));
  }, [categoryBanners]);

  useEffect(() => {
    localStorage.setItem('ap_vitrine_floating_banner', JSON.stringify(floatingBanner));
  }, [floatingBanner]);

  // Listen for background sync updates to immediately reflect across screens
  useEffect(() => {
    const handleStorageSynced = () => {
      console.log('[PublicCatalog] Sincronizando dados locais da vitrine a partir do localStorage.');
      const savedName = localStorage.getItem('ap_vitrine_store_name');
      if (savedName) setStoreName(savedName);

      const savedSub = localStorage.getItem('ap_vitrine_store_sub');
      if (savedSub) setStoreSub(savedSub);

      const savedTheme = localStorage.getItem('ap_vitrine_theme_color');
      if (savedTheme) setThemeColor(savedTheme);

      try {
        const savedSlides = localStorage.getItem('ap_vitrine_slides');
        if (savedSlides) {
          const parsed = JSON.parse(savedSlides);
          if (Array.isArray(parsed) && parsed.length > 0) setLookbookSlides(parsed);
        }
      } catch (e) {}

      try {
        const savedAnn = localStorage.getItem('ap_vitrine_announcement');
        if (savedAnn) setTickerConfig(JSON.parse(savedAnn));
      } catch (e) {}

      try {
        const savedCat = localStorage.getItem('ap_vitrine_category_banners');
        if (savedCat) setCategoryBanners(JSON.parse(savedCat));
      } catch (e) {}

      try {
        const savedFlo = localStorage.getItem('ap_vitrine_floating_banner');
        if (savedFlo) setFloatingBanner(JSON.parse(savedFlo));
      } catch (e) {}
    };

    window.addEventListener('ap-storage-synced', handleStorageSynced);
    return () => window.removeEventListener('ap-storage-synced', handleStorageSynced);
  }, []);

  // Auto-advance banner slides
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % lookbookSlides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [lookbookSlides.length]);

  // Collapsible Accordions in Product Detailed view
  const [activeAccordion, setActiveAccordion] = useState<'desc' | 'detalhes' | 'tamanhos' | 'cuidados' | null>('desc');

  // Detail modal options selection
  const [selectedColor, setSelectedColor] = useState('Fúcsia');
  const [selectedSize, setSelectedSize] = useState('M');

  // Provador Virtual (Virtual Fitting Room) States
  const [isFittingRoomOpen, setIsFittingRoomOpen] = useState(false);
  const [fitHeight, setFitHeight] = useState<string>('');
  const [fitWeight, setFitWeight] = useState<string>('');
  const [fitPreference, setFitPreference] = useState<'justo' | 'normal' | 'largo'>('normal');
  const [fitRecommendation, setFitRecommendation] = useState<'P' | 'M' | 'G' | 'GG' | null>(null);

  const [productQty, setProductQty] = useState(1);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  
  // Mock alternative angles / views inside product details
  const [detailImageIdx, setDetailImageIdx] = useState(0);

  // CEP simulation states
  const [cepNumber, setCepNumber] = useState('');
  const [cepResult, setCepResult] = useState<string | null>(null);
  const [isCalculatingCep, setIsCalculatingCep] = useState(false);

  // Review states per product
  const [productReviews, setProductReviews] = useState<{[key: string]: {author: string; date: string; comment: string; stars: number}[]}>({
    default: [
      { author: "Priscila Lima", date: "29/09/2025", comment: "Simplesmente maravilhoso! O tecido é super grosso, não tem transparência nenhuma. O elástico segura muito bem no treino.", stars: 5 },
      { author: "Ana Keity", date: "03/07/2025", comment: "Excelente caimento. Comprei o tamanho M e vestiu perfeitamente. Com certeza comprarei mais cores!", stars: 5 }
    ]
  });
  const [newReviewAuthor, setNewReviewAuthor] = useState('');
  const [newReviewText, setNewReviewText] = useState('');
  const [newReviewStars, setNewReviewStars] = useState(5);
  const [isReviewFormOpen, setIsReviewFormOpen] = useState(false);

  // Wishlist / Likes simulation state
  const [wishlistLikes, setWishlistLikes] = useState<{[key: string]: {count: number; active: boolean}}>({});

  // Newsletter form state
  const [newsletterName, setNewsletterName] = useState('');
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [isNewsletterSubmitted, setIsNewsletterSubmitted] = useState(false);

  // Cart state
  const [cart, setCart] = useState<{
    product: Product;
    color: string;
    size: string;
    quantity: number;
    priceAtTime: number;
  }[]>([]);

  // Cart drawer open state
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Checkout form info
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientCpf, setClientCpf] = useState('');
  const [clientBirthDate, setClientBirthDate] = useState('');
  
  // Structured address components
  const [addressStreet, setAddressStreet] = useState('');
  const [addressNum, setAddressNum] = useState('');
  const [addressComp, setAddressComp] = useState('');
  const [addressBairro, setAddressBairro] = useState('');
  const [addressCidade, setAddressCidade] = useState('');
  const [addressEstado, setAddressEstado] = useState('');
  const [addressCep, setAddressCep] = useState('');

  const [isVipRegisteredJustNow, setIsVipRegisteredJustNow] = useState(false);
  const [vipMessage, setVipMessage] = useState('');
  const [deliveryMethod, setDeliveryMethod] = useState<'motoboy' | 'correios' | 'retirada' | 'combinar'>('motoboy');
  const [clientAddress, setClientAddress] = useState('');
  const [clientNotes, setClientNotes] = useState('');
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discountPercent: number; fixedDiscount: number } | null>(null);

  // Perfil / Área VIP Cliente States
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isMenuDrawerOpen, setIsMenuDrawerOpen] = useState(false);
  const [loggedClient, setLoggedClient] = useState<Client | null>(null);
  const [loginCpf, setLoginCpf] = useState('');
  const [loginError, setLoginError] = useState('');
  const [useCashback, setUseCashback] = useState(false);
  
  // Retirada Agendamento
  const [pickupDate, setPickupDate] = useState('');
  const [pickupTime, setPickupTime] = useState('');

  // Payment states in storefront Checkout
  const [paymentMethod, setPaymentMethod] = useState<'pix' | 'cartao'>('pix');
  const [isCopiedPix, setIsCopiedPix] = useState(false);
  const [cardNumber, setCardNumber] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [cardInstallments, setCardInstallments] = useState('1');

  // Lists categories
  const categoriesList = useMemo(() => {
    const list = new Set(products.map(p => p.category).filter(Boolean));
    return ['Todos', ...Array.from(list)];
  }, [products]);

  // Filter products that have stock
  const visibleProducts = useMemo(() => {
    return products.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            (p.category || '').toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'Todos' || 
                              p.category === selectedCategory ||
                              (selectedCategory === 'Slim Fit' && p.name.toLowerCase().includes('slim')) ||
                              (selectedCategory === 'Plus Size' && (p.name.toLowerCase().includes('plus') || p.category?.toLowerCase().includes('plus')));
      return matchesSearch && matchesCategory && p.stock > 0;
    });
  }, [products, searchQuery, selectedCategory]);

  // Handle open item details modal
  const handleOpenProduct = (product: Product) => {
    setSelectedProduct(product);
    const defaultSize = product.sizes && product.sizes.length > 0 ? product.sizes[0] : 'M';
    let defaultColor = product.colors && product.colors.length > 0 ? product.colors[0] : 'Preto';
    
    if (product.sizeColors && product.sizeColors[defaultSize] && product.sizeColors[defaultSize].length > 0) {
      defaultColor = product.sizeColors[defaultSize][0];
    }
    
    setSelectedSize(defaultSize);
    setSelectedColor(defaultColor);
    setProductQty(1);
    setDetailImageIdx(0);
    setIsVideoPlaying(false);
    setCepResult(null);
    setCepNumber('');
    setIsReviewFormOpen(false);
    
    // Add default likes if not set
    if (!wishlistLikes[product.id]) {
      setWishlistLikes(prev => ({
        ...prev,
        [product.id]: { count: Math.floor(Math.random() * 45) + 12, active: false }
      }));
    }
  };

  // Toggle wishlist heart icon with counting
  const handleToggleWishlist = (pId: string) => {
    setWishlistLikes(prev => {
      const item = prev[pId] || { count: 15, active: false };
      const nextActive = !item.active;
      return {
        ...prev,
        [pId]: {
          count: nextActive ? item.count + 1 : item.count - 1,
          active: nextActive
        }
      };
    });
  };

  // Add review submission
  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;
    if (!newReviewAuthor.trim() || !newReviewText.trim()) {
      alert("Por favor, preencha o seu nome e sua avaliação.");
      return;
    }

    const newRev = {
      author: newReviewAuthor.trim(),
      date: new Date().toLocaleDateString('pt-BR'),
      comment: newReviewText.trim(),
      stars: newReviewStars
    };

    const pId = selectedProduct.id;
    setProductReviews(prev => {
      const currentList = prev[pId] || prev.default || [];
      return {
        ...prev,
        [pId]: [newRev, ...currentList]
      };
    });

    setNewReviewAuthor('');
    setNewReviewText('');
    setNewReviewStars(5);
    setIsReviewFormOpen(false);
    alert("Obrigada! Sua avaliação foi enviada com sucesso e cadastrada na vitrine. 🌸");
  };

  // CEP Freight simulate calculation
  const handleCalculateCep = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cepNumber.trim() || cepNumber.replace(/\D/g, '').length < 8) {
      alert("Por favor, informe um CEP válido com 8 dígitos.");
      return;
    }
    
    setIsCalculatingCep(true);
    setTimeout(() => {
      const values = [
        "Sedex Expresso: R$ 15,00 (2 dias úteis) - Ideal para urgência! ⚡",
        "PAC Econômico: R$ 9,00 (5 dias úteis) 📦",
        "Motoboy Local: R$ 12,00 (Entrega HOJE!) 🏍️",
        "Retirada Grátis em nossa Loja: R$ 0,00 🏠"
      ];
      setCepResult(values[Math.floor(Math.random() * values.length)]);
      setIsCalculatingCep(false);
    }, 1000);
  };

  // Provador Virtual: Cálculo matemático baseado no IMC, Altura e Preferência de Caimento
  const calculateRecommendedSize = (heightCm: number, weightKg: number, fit: 'justo' | 'normal' | 'largo'): 'P' | 'M' | 'G' | 'GG' => {
    const bmi = weightKg / ((heightCm / 100) ** 2);
    let baseSize: 'P' | 'M' | 'G' | 'GG' = 'M';

    if (bmi < 20.5) {
      baseSize = 'P';
    } else if (bmi >= 20.5 && bmi < 24.0) {
      baseSize = 'M';
    } else if (bmi >= 24.0 && bmi < 27.5) {
      baseSize = 'G';
    } else {
      baseSize = 'GG';
    }

    // Ajuste fino para fôrma fitness considerando limites de altura/peso que forçam estiramento vertical
    if (baseSize === 'P' && (weightKg > 55 || heightCm > 168)) {
      baseSize = 'M';
    }
    if (baseSize === 'M' && (weightKg > 66 || heightCm > 174)) {
      baseSize = 'G';
    }
    if (baseSize === 'G' && (weightKg > 78 || heightCm > 180)) {
      baseSize = 'GG';
    }

    // Ajuste de preferência de caimento
    const sizes: ('P' | 'M' | 'G' | 'GG')[] = ['P', 'M', 'G', 'GG'];
    let sizeIdx = sizes.indexOf(baseSize);

    if (fit === 'justo') {
      sizeIdx = Math.max(0, sizeIdx - 1);
    } else if (fit === 'largo') {
      sizeIdx = Math.min(sizes.length - 1, sizeIdx + 1);
    }

    return sizes[sizeIdx];
  };

  const handleApplyRecommendedSize = (size: 'P' | 'M' | 'G' | 'GG') => {
    setSelectedSize(size);
    setIsFittingRoomOpen(false);
    // Reset recommend states
    setFitHeight('');
    setFitWeight('');
    setFitPreference('normal');
    setFitRecommendation(null);
    alert(`Tamanho ${size} selecionado com base nas suas medidas do Provador! ✨`);
  };

  // Compre o Look: Algoritmo de inteligência de cross-selling de peças fitness complementares
  const getComplementaryProduct = (product: Product): Product | null => {
    if (!product || !products || products.length === 0) return null;

    const cat = (product.category || '').toLowerCase();
    const name = (product.name || '').toLowerCase();

    // Identificação de grupos (Topwear vs Bottomwear)
    const isTopGroup = cat.includes('top') || cat.includes('cropped') || cat.includes('regata') || cat.includes('t-shirt') || cat.includes('camiseta') || cat.includes('blusa') || name.includes('top') || name.includes('cropped') || name.includes('regata');
    const isBottomGroup = cat.includes('shorts') || cat.includes('legging') || cat.includes('calça') || cat.includes('bermuda') || cat.includes('saia') || name.includes('shorts') || name.includes('legging') || name.includes('calça') || name.includes('bermuda');

    let matched: Product | null = null;

    if (isTopGroup) {
      // Procura uma peça de baixo
      matched = products.find(p => {
        if (p.id === product.id) return false;
        const pCat = (p.category || '').toLowerCase();
        const pName = (p.name || '').toLowerCase();
        return pCat.includes('legging') || pCat.includes('shorts') || pCat.includes('calça') || pName.includes('legging') || pName.includes('shorts') || pName.includes('calça');
      }) || null;
    } else if (isBottomGroup) {
      // Procura uma peça de cima
      matched = products.find(p => {
        if (p.id === product.id) return false;
        const pCat = (p.category || '').toLowerCase();
        const pName = (p.name || '').toLowerCase();
        return pCat.includes('top') || pCat.includes('cropped') || pCat.includes('regata') || pName.includes('top') || pName.includes('cropped') || pName.includes('regata');
      }) || null;
    }

    // Fallback 1: Caso não pertença a um grupo claro, busca outro produto de categoria diferente
    if (!matched) {
      matched = products.find(p => p.id !== product.id && p.category !== product.category) || null;
    }

    // Fallback 2: Qualquer outro produto que não seja ele mesmo
    if (!matched) {
      matched = products.find(p => p.id !== product.id) || null;
    }

    return matched;
  };

  // Adicionar Combo Look Inteiro à Sacola de forma transparente aplicando desconto de 5% em ambos
  const handleAddComboToCart = (compProduct: Product) => {
    if (!selectedProduct) return;

    // Estoque do produto principal
    let mainMaxStock = selectedProduct.stock;
    if (selectedProduct.sizeColorStocks && selectedProduct.sizeColorStocks[selectedSize] && selectedProduct.sizeColorStocks[selectedSize][selectedColor] !== undefined) {
      mainMaxStock = selectedProduct.sizeColorStocks[selectedSize][selectedColor];
    } else if (selectedProduct.colorStocks && selectedProduct.colorStocks[selectedColor] !== undefined) {
      mainMaxStock = selectedProduct.colorStocks[selectedColor];
    }

    if (mainMaxStock <= 0) {
      alert(`Desculpe, o tamanho ${selectedSize} na cor ${selectedColor} do produto principal está esgotado.`);
      return;
    }

    // Define cor e tamanho para o produto complementar correspondente
    // Tenta usar o mesmo tamanho para harmonia, senão usa o primeiro disponível
    const compSize = compProduct.sizes && compProduct.sizes.includes(selectedSize) 
      ? selectedSize 
      : (compProduct.sizes && compProduct.sizes.length > 0 ? compProduct.sizes[0] : 'M');
    
    // Tenta pegar a primeira cor disponível para o tamanho complementar
    const compAvailableColors = compProduct.sizeColors && compProduct.sizeColors[compSize] && compProduct.sizeColors[compSize].length > 0
      ? compProduct.sizeColors[compSize]
      : (compProduct.colors && compProduct.colors.length > 0 ? compProduct.colors : ['Única']);
    
    const compColor = Array.isArray(compAvailableColors) ? compAvailableColors[0] : compAvailableColors;

    let compMaxStock = compProduct.stock;
    if (compProduct.sizeColorStocks && compProduct.sizeColorStocks[compSize] && compProduct.sizeColorStocks[compSize][compColor] !== undefined) {
      compMaxStock = compProduct.sizeColorStocks[compSize][compColor];
    } else if (compProduct.colorStocks && compProduct.colorStocks[compColor] !== undefined) {
      compMaxStock = compProduct.colorStocks[compColor];
    }

    if (compMaxStock <= 0) {
      alert(`Desculpe, o tamanho ${compSize} na cor ${compColor} do produto complementar está esgotado.`);
      return;
    }

    // Calcula preços com desconto de 5%
    const discountedMainPrice = selectedProduct.price * 0.95;
    const discountedCompPrice = compProduct.price * 0.95;

    setCart(prev => {
      let updated = [...prev];

      // 1. Adicionar/Atualizar Produto Principal
      const mainExistingIdx = updated.findIndex(item => 
        item.product.id === selectedProduct.id && 
        item.color === selectedColor && 
        item.size === selectedSize
      );

      if (mainExistingIdx > -1) {
        const newQty = updated[mainExistingIdx].quantity + 1;
        updated[mainExistingIdx].quantity = Math.min(newQty, mainMaxStock);
        updated[mainExistingIdx].priceAtTime = discountedMainPrice;
      } else {
        updated.push({
          product: selectedProduct,
          color: selectedColor,
          size: selectedSize,
          quantity: 1,
          priceAtTime: discountedMainPrice
        });
      }

      // 2. Adicionar/Atualizar Produto Complementar
      const compExistingIdx = updated.findIndex(item => 
        item.product.id === compProduct.id && 
        item.color === compColor && 
        item.size === compSize
      );

      if (compExistingIdx > -1) {
        const newQty = updated[compExistingIdx].quantity + 1;
        updated[compExistingIdx].quantity = Math.min(newQty, compMaxStock);
        updated[compExistingIdx].priceAtTime = discountedCompPrice;
      } else {
        updated.push({
          product: compProduct,
          color: compColor,
          size: compSize,
          quantity: 1,
          priceAtTime: discountedCompPrice
        });
      }

      return updated;
    });

    setIsCartOpen(true);
    alert(`🎉 Look Completo Adicionado! Aplicamos 5% de desconto de cross-selling em ambas as peças! 🌸`);
  };

  // Add item to custom checkout cart
  const handleAddToCart = () => {
    if (!selectedProduct) return;

    // Determine max available stock for selected combination
    let maxStockAvailable = selectedProduct.stock;
    if (selectedProduct.sizeColorStocks && selectedProduct.sizeColorStocks[selectedSize] && selectedProduct.sizeColorStocks[selectedSize][selectedColor] !== undefined) {
      maxStockAvailable = selectedProduct.sizeColorStocks[selectedSize][selectedColor];
    } else if (selectedProduct.colorStocks && selectedProduct.colorStocks[selectedColor] !== undefined) {
      maxStockAvailable = selectedProduct.colorStocks[selectedColor];
    }

    if (maxStockAvailable <= 0) {
      alert(`Desculpe, o tamanho ${selectedSize} na cor ${selectedColor} está fora de estoque.`);
      return;
    }

    setCart(prev => {
      const existingIdx = prev.findIndex(item => 
        item.product.id === selectedProduct.id && 
        item.color === selectedColor && 
        item.size === selectedSize
      );

      if (existingIdx > -1) {
        const updated = [...prev];
        const newQty = updated[existingIdx].quantity + productQty;
        if (newQty > maxStockAvailable) {
          alert(`Desculpe, só há ${maxStockAvailable} unidades disponíveis desta combinação.`);
          updated[existingIdx].quantity = maxStockAvailable;
        } else {
          updated[existingIdx].quantity = newQty;
        }
        return updated;
      }

      const finalQty = Math.min(productQty, maxStockAvailable);
      return [...prev, {
        product: selectedProduct,
        color: selectedColor,
        size: selectedSize,
        quantity: finalQty,
        priceAtTime: selectedProduct.price
      }];
    });

    setSelectedProduct(null);
    setIsCartOpen(true);
  };

  // Direct quick addition of a special variant from product grid
  const handleQuickAdd = (product: Product, event: React.MouseEvent) => {
    event.stopPropagation();
    const defaultCol = product.colors && product.colors.length > 0 ? product.colors[0] : 'Única';
    const defaultSz = product.sizes && product.sizes.length > 0 ? product.sizes[0] : 'M';
    
    let maxStockAvailable = product.stock;
    if (product.sizeColorStocks && product.sizeColorStocks[defaultSz] && product.sizeColorStocks[defaultSz][defaultCol] !== undefined) {
      maxStockAvailable = product.sizeColorStocks[defaultSz][defaultCol];
    } else if (product.colorStocks && product.colorStocks[defaultCol] !== undefined) {
      maxStockAvailable = product.colorStocks[defaultCol];
    }

    if (maxStockAvailable <= 0) {
      alert(`Desculpe, o tamanho ${defaultSz} na cor ${defaultCol} está fora de estoque.`);
      return;
    }

    setCart(prev => {
      const idx = prev.findIndex(item => item.product.id === product.id && item.color === defaultCol && item.size === defaultSz);
      if (idx > -1) {
        const updated = [...prev];
        const newQty = updated[idx].quantity + 1;
        if (newQty > maxStockAvailable) {
          alert(`Limite de estoque de ${maxStockAvailable} un. atingido para esta combinação.`);
          updated[idx].quantity = maxStockAvailable;
        } else {
          updated[idx].quantity = newQty;
        }
        return updated;
      }
      return [...prev, {
        product,
        color: defaultCol,
        size: defaultSz,
        quantity: 1,
        priceAtTime: product.price
      }];
    });
    setIsCartOpen(true);
  };

  const handleUpdateItemQty = (idx: number, amount: number) => {
    setCart(prev => {
      const updated = [...prev];
      const item = updated[idx];
      
      let maxStockAvailable = item.product.stock;
      if (item.product.sizeColorStocks && item.product.sizeColorStocks[item.size] && item.product.sizeColorStocks[item.size][item.color] !== undefined) {
        maxStockAvailable = item.product.sizeColorStocks[item.size][item.color];
      } else if (item.product.colorStocks && item.product.colorStocks[item.color] !== undefined) {
        maxStockAvailable = item.product.colorStocks[item.color];
      }

      const newQty = item.quantity + amount;
      if (newQty <= 0) {
        updated.splice(idx, 1);
      } else if (newQty > maxStockAvailable) {
        alert(`Desculpe, só há ${maxStockAvailable} unidades disponíveis desta combinação.`);
        updated[idx].quantity = maxStockAvailable;
      } else {
        updated[idx].quantity = newQty;
      }
      return updated;
    });
  };

  // Coupons simulation
  const handleApplyCoupon = () => {
    const cleanCode = couponCode.trim().toUpperCase();
    if (!cleanCode) return;

    if (cleanCode === 'FITNESS10' || cleanCode === 'VERAO10' || cleanCode === 'QUERO10') {
      setAppliedCoupon({ code: cleanCode, discountPercent: 10, fixedDiscount: 0 });
      alert(`Cupom ${cleanCode} (10% de desconto) aplicado com sucesso!`);
    } else if (cleanCode === 'BEMVINDA50' || cleanCode === 'MODAFIT50') {
      setAppliedCoupon({ code: cleanCode, discountPercent: 0, fixedDiscount: 50 });
      alert(`Cupom ${cleanCode} (R$ 50,00 de desconto) aplicado com sucesso!`);
    } else if (cleanCode === 'FRETEGRATIS') {
      setAppliedCoupon({ code: 'FRETEGRATIS', discountPercent: 0, fixedDiscount: 0 });
      alert('Cupom FRETEGRATIS ativado com sucesso!');
    } else {
      alert('Este cupom promocional expirou ou é inválido.');
    }
  };

  // Computations
  const cartSubtotal = useMemo(() => {
    return cart.reduce((sum, item) => sum + (item.priceAtTime * item.quantity), 0);
  }, [cart]);

  const deliveryFee = useMemo(() => {
    if (deliveryMethod === 'retirada' || deliveryMethod === 'combinar') return 0;
    if (appliedCoupon?.code === 'FRETEGRATIS' || cartSubtotal >= 399) return 0;
    return deliveryMethod === 'motoboy' ? 12 : 20;
  }, [deliveryMethod, cartSubtotal, appliedCoupon]);

  const cartDiscount = useMemo(() => {
    if (!appliedCoupon) return 0;
    if (appliedCoupon.discountPercent > 0) {
      return Number(((cartSubtotal * appliedCoupon.discountPercent) / 100).toFixed(2));
    }
    return Math.min(cartSubtotal, appliedCoupon.fixedDiscount);
  }, [appliedCoupon, cartSubtotal]);

  // Load payment configs dynamically from local storage
  const paymentConfig = useMemo(() => {
    try {
      const saved = localStorage.getItem('ap_moda_payment_config');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    // Backward compatibility with legacy company info
    try {
      const savedLegacy = localStorage.getItem('ap_moda_company_info');
      if (savedLegacy) {
        const parsed = JSON.parse(savedLegacy);
        if (parsed && parsed.pixKey) {
          return {
            pixActive: true,
            pixKey: parsed.pixKey,
            pixKeyType: 'E-mail',
            pixDiscountPercent: 5
          };
        }
      }
    } catch (e) {}
    return {
      pixActive: true,
      pixKey: 'apmodafitness55@gmail.com',
      pixKeyType: 'E-mail',
      pixDiscountPercent: 5
    };
  }, []);

  const storeInfo = useMemo(() => {
    let name = 'AP Moda Fitness';
    let city = 'São José de Mipibu';
    let state = 'RN';
    let phone = '5521991234567';

    try {
      const savedName = localStorage.getItem('ap_store_name');
      if (savedName) name = savedName;

      const savedCity = localStorage.getItem('ap_store_city');
      if (savedCity) city = savedCity;

      const savedState = localStorage.getItem('ap_store_state');
      if (savedState) state = savedState;

      const savedPhone = localStorage.getItem('ap_store_phone');
      if (savedPhone) phone = savedPhone;

      // Fallback check legacy company info
      const savedLegacy = localStorage.getItem('ap_moda_company_info');
      if (savedLegacy) {
        const parsed = JSON.parse(savedLegacy);
        if (parsed) {
          if (!savedName && parsed.name) name = parsed.name;
          if (!savedPhone && parsed.phone) phone = parsed.phone;
          if (parsed.addressLine2 && !savedCity) {
            const parts = parsed.addressLine2.split('-');
            if (parts[0]) city = parts[0].trim();
            if (parts[1]) state = parts[1].trim();
          }
        }
      }
    } catch (e) {}

    // Clean merchant name for Pix
    const cleanMerchant = name
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-zA-Z]/g, '')
      .trim()
      .substring(0, 25) || 'APModaFitness';
    const merchantLen = String(cleanMerchant.length).padStart(2, '0');

    // Clean city for Pix
    const cleanCity = city
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-zA-Z\s]/g, '')
      .replace(/\s+/g, '')
      .trim()
      .substring(0, 15) || 'SaoPaulo';
    const cityLen = String(cleanCity.length).padStart(2, '0');

    // Clean phone
    const cleanPhone = phone.replace(/\D/g, '');
    let finalPhone = cleanPhone;
    if (cleanPhone.length >= 10 && cleanPhone.length <= 11 && !cleanPhone.startsWith('55')) {
      finalPhone = `55${cleanPhone}`;
    }
    if (finalPhone.length === 0) {
      finalPhone = '5521991234567';
    }

    return {
      name,
      city,
      state,
      phone: finalPhone,
      cleanMerchant,
      merchantLen,
      cleanCity,
      cityLen
    };
  }, []);

  const storePixKey = useMemo(() => {
    return paymentConfig.pixKey || 'apmodafitness55@gmail.com';
  }, [paymentConfig]);

  const pixDiscountPercent = useMemo(() => {
    return paymentConfig.pixDiscountPercent ?? 5;
  }, [paymentConfig]);

  const pixDiscount = useMemo(() => {
    if (paymentMethod !== 'pix') return 0;
    // Dynamic discount on the product subtotal (after coupon discount)
    return Number(((cartSubtotal - cartDiscount) * (pixDiscountPercent / 100)).toFixed(2));
  }, [paymentMethod, cartSubtotal, cartDiscount, pixDiscountPercent]);

  const availableCashback = useMemo(() => {
    return loggedClient ? (loggedClient.cashbackBalance || 0) : 0;
  }, [loggedClient]);

  const cashbackDiscount = useMemo(() => {
    if (!useCashback) return 0;
    const maxDiscountable = Math.max(0, cartSubtotal - cartDiscount - pixDiscount);
    return Number(Math.min(availableCashback, maxDiscountable).toFixed(2));
  }, [useCashback, availableCashback, cartSubtotal, cartDiscount, pixDiscount]);

  const cartTotal = useMemo(() => {
    return Math.max(0, Number((cartSubtotal - cartDiscount - pixDiscount - cashbackDiscount + deliveryFee).toFixed(2)));
  }, [cartSubtotal, cartDiscount, pixDiscount, cashbackDiscount, deliveryFee]);

  const pixPayload = useMemo(() => {
    const amountStr = cartTotal.toFixed(2);
    return `00020101021126580014br.gov.bcb.pix0136${storePixKey}5204000053039865407${amountStr}5802BR59${storeInfo.merchantLen}${storeInfo.cleanMerchant}60${storeInfo.cityLen}${storeInfo.cleanCity}62070503***6304A1B2`;
  }, [storePixKey, cartTotal, storeInfo]);

  const handleCopyPix = () => {
    navigator.clipboard.writeText(pixPayload);
    setIsCopiedPix(true);
    setTimeout(() => setIsCopiedPix(false), 2000);
  };

  // Synchronize/monitor checkout initiation as soon as cart and some contact info exists
  useEffect(() => {
    if (cart.length > 0 && (clientName.trim() || clientPhone.trim() || clientEmail.trim())) {
      const timer = setTimeout(() => {
        let checkoutId = localStorage.getItem('ap_current_checkout_id');
        if (!checkoutId) {
          checkoutId = `chk-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
          localStorage.setItem('ap_current_checkout_id', checkoutId);
        }

        const checkoutData = {
          id: checkoutId,
          clientName: clientName.trim() || 'Cliente Anônimo',
          phone: clientPhone.trim() || '',
          email: clientEmail.trim() || '',
          items: cart.map(it => ({
            productName: `${it.product.name} (${it.color} - ${it.size})`,
            productId: it.product.id,
            quantity: it.quantity,
            price: it.priceAtTime,
            color: it.color,
            size: it.size
          })),
          total: cartTotal,
          status: 'pendente', // status is 'pendente' until final order submission
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };

        if (onAddCheckout) {
          onAddCheckout(checkoutData);
        }
      }, 1000); // 1s debounce to avoid spamming while typing

      return () => clearTimeout(timer);
    }
  }, [clientName, clientPhone, clientEmail, cart, cartTotal, onAddCheckout]);

  // Checkout submission
  const handleCheckoutWhatsApp = () => {
    if (cart.length === 0) {
      alert('Seu carrinho está vazio para finalizar.');
      return;
    }
    if (!clientName.trim()) {
      alert('Por favor, preencha o seu Nome Completo.');
      return;
    }
    if (!clientCpf.trim()) {
      alert('Por favor, preencha o seu CPF.');
      return;
    }
    if (!clientPhone.trim()) {
      alert('Por favor, preencha o seu número de Celular / WhatsApp.');
      return;
    }
    if (!clientBirthDate.trim()) {
      alert('Por favor, preencha sua Data de Nascimento.');
      return;
    }
    if (!clientEmail.trim()) {
      alert('Por favor, preencha o seu E-mail de contato.');
      return;
    }
    
    if (deliveryMethod !== 'retirada' && deliveryMethod !== 'combinar') {
      if (!addressStreet.trim() || !addressNum.trim() || !addressBairro.trim() || !addressCidade.trim() || !addressEstado.trim() || !addressCep.trim()) {
        alert('Por favor, preencha todos os campos obrigatórios do endereço de entrega (Rua, Número, Bairro, Cidade, Estado e CEP).');
        return;
      }
    }

    if (deliveryMethod === 'retirada') {
      if (!pickupDate || !pickupTime) {
        alert('Por favor, agende uma Data e Horário para a retirada do seu pedido na loja.');
        return;
      }
    }

    if (paymentMethod === 'cartao') {
      if (!cardNumber.trim() || cardNumber.replace(/\s/g, '').length < 16) {
        alert('Por favor, insira um número de cartão de crédito válido (16 dígitos).');
        return;
      }
      if (!cardHolder.trim()) {
        alert('Por favor, insira o nome impresso no cartão de crédito.');
        return;
      }
      if (!cardExpiry.trim() || !cardExpiry.includes('/')) {
        alert('Por favor, insira a data de vencimento do cartão (MM/AA).');
        return;
      }
      if (!cardCvv.trim() || cardCvv.length < 3) {
        alert('Por favor, insira o código CVV de segurança do cartão.');
        return;
      }
    }

    let finalAddress = 'Retirada no Local';
    if (deliveryMethod === 'combinar') {
      finalAddress = 'A combinar via WhatsApp';
    } else if (deliveryMethod !== 'retirada') {
      finalAddress = `${addressStreet.trim()}, ${addressNum.trim()}${addressComp.trim() ? ` (${addressComp.trim()})` : ''} - Bairro: ${addressBairro.trim()} - ${addressCidade.trim()}/${addressEstado.trim()} - CEP: ${addressCep.trim()}`;
    }

    // Compose order detail message
    const itemsListText = cart.map(item => 
      `• *${item.quantity}x* ${item.product.name}\n  [Cor: ${item.color} | Tam: ${item.size}] (R$ ${item.product.price.toFixed(2)} un.)`
    ).join('\n\n');

    const couponInfo = appliedCoupon ? `\n🏷️ Cupom: *${appliedCoupon.code}* (-R$ ${cartDiscount.toFixed(2)})` : '';
    const pixDiscountInfo = paymentMethod === 'pix' ? `\n⚡ Desconto Pix (${pixDiscountPercent}% OFF Extra): -R$ ${pixDiscount.toFixed(2)}` : '';
    const cashbackDiscountInfo = useCashback && cashbackDiscount > 0 ? `\n✨ Desconto Cashback Clube VIP: -R$ ${cashbackDiscount.toFixed(2)}` : '';
    const pickupSchedInfo = deliveryMethod === 'retirada' 
      ? `\n📅 *Agendamento de Retirada na Loja:*\n  Dia: *${new Date(pickupDate).toLocaleDateString('pt-BR')}* às *${pickupTime}*\n` 
      : '';

    const deliveryTypeLabel = 
      deliveryMethod === 'motoboy' ? 'Entrega por Motoboy 🏍️' :
      deliveryMethod === 'correios' ? 'Envio via Correios 📦' :
      deliveryMethod === 'combinar' ? 'Combinar Entrega 🤝' :
      'Retirar no Local de Venda 🏠';

    const paymentLabelText = paymentMethod === 'pix' 
      ? `PIX (Pago via QR Code/Chave Pix de destino: ${storePixKey}) ⚡`
      : `Cartão de Crédito em ${cardInstallments}x de R$ ${(cartTotal / Number(cardInstallments)).toFixed(2)} (Aprovado Instantâneo via Gateway SSL) 💳`;

    const orderMsg = 
      `🌸 *PEDIDO CONFIRMADO: AP MODA FITNESS* 🌸\n\n` +
      `👤 *Cliente:* ${clientName.trim()}\n` +
      `🆔 *CPF:* ${clientCpf.trim()}\n` +
      `🎂 *Nascimento:* ${clientBirthDate.trim()}\n` +
      `📧 *E-mail:* ${clientEmail.trim()}\n` +
      `📞 *WhatsApp:* ${clientPhone.trim()}\n\n` +
      `🛍️ *Produtos Solicitados:*\n${itemsListText}\n` +
      `---------------------------------\n` +
      `💵 *Subtotal:* R$ ${cartSubtotal.toFixed(2)}\n` +
      `${couponInfo}` +
      `${pixDiscountInfo}` +
      `${cashbackDiscountInfo}\n` +
      `🚚 *Taxa de Entrega:* R$ ${deliveryFee.toFixed(2)}\n` +
      `💰 *Total Geral:* R$ ${cartTotal.toFixed(2)}\n\n` +
      `💳 *Forma de Pagamento:* ${paymentLabelText}\n` +
      `📍 *Forma de Recebimento:* ${deliveryTypeLabel}\n` +
      `${pickupSchedInfo}` +
      (deliveryMethod !== 'retirada' && deliveryMethod !== 'combinar' ? `🏠 *Endereço Completo:*\n  Rua: ${addressStreet.trim()}, Nº ${addressNum.trim()}\n  Bairro: ${addressBairro.trim()}\n  Cidade: ${addressCidade.trim()}/${addressEstado.trim()} - CEP: ${addressCep.trim()}${addressComp.trim() ? `\n  Compl.: ${addressComp.trim()}` : ''}\n` : '') +
      (clientNotes.trim() ? `📝 *Observações:* ${clientNotes.trim()}\n` : '') +
      `\nOlá! Acabei de finalizar meu pedido e efetuar o pagamento via ${paymentMethod === 'pix' ? 'PIX (comprovante anexo)' : `Cartão de Crédito (${cardInstallments}x)`}. Aguardo a entrega das minhas lidas peças! Gratidão! 🌸✨`;

    // Process order back to the administration orders system via hook
    if (onAddOnlineOrder) {
      const isCorreios = deliveryMethod === 'correios';
      const generatedTracking = isCorreios ? (() => {
        const prefixes = ['QC', 'BR', 'PM', 'AL', 'JN', 'OB', 'XY'];
        const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
        const middleNum = Math.floor(100000000 + Math.random() * 900000000).toString();
        return `${prefix}${middleNum}BR`;
      })() : undefined;

      const orderData = {
        id: `ped-web-${Date.now().toString().slice(-4)}`,
        clientName: clientName.trim(),
        phone: clientPhone.trim(),
        items: cart.map(it => ({
          productName: `${it.product.name} (${it.color} - ${it.size})`,
          productId: it.product.id,
          quantity: it.quantity,
          price: it.priceAtTime,
          color: it.color,
          size: it.size
        })),
        total: cartTotal,
        status: 'Pendente',
        status_pagamento: 'pendente',
        createdAt: new Date().toISOString(),
        address: finalAddress,
        deliveryFee: deliveryFee,
        deliveryMethod: deliveryMethod,
        trackingCode: generatedTracking,
        pickupDate: deliveryMethod === 'retirada' ? pickupDate : undefined,
        pickupTime: deliveryMethod === 'retirada' ? pickupTime : undefined,
        notes: `Cor: ${cart.map(c=>c.color).join(', ')} | CPF: ${clientCpf.trim()} | Pg: ${paymentMethod === 'pix' ? 'PIX' : `Cartão (${cardInstallments}x)`} | Obs: ${clientNotes.trim()}`
      };
      
      onAddOnlineOrder(orderData);
    }

    // Mark checkout as concluded and clear current checkout ID
    const currentCheckoutId = localStorage.getItem('ap_current_checkout_id');
    if (currentCheckoutId && onAddCheckout) {
      const checkoutData = {
        id: currentCheckoutId,
        clientName: clientName.trim(),
        phone: clientPhone.trim(),
        email: clientEmail.trim(),
        items: cart.map(it => ({
          productName: `${it.product.name} (${it.color} - ${it.size})`,
          productId: it.product.id,
          quantity: it.quantity,
          price: it.priceAtTime,
          color: it.color,
          size: it.size
        })),
        total: cartTotal,
        status: 'concluido',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      onAddCheckout(checkoutData);
      localStorage.removeItem('ap_current_checkout_id');
    }

    // Save or update Customer details in CRM system
    const cleanedPhone = clientPhone.replace(/\D/g, '');
    const cleanedName = clientName.trim();
    const cleanedCpf = clientCpf.replace(/\D/g, '');
    
    // Calculate cashback accumulation: 5% of order total
    const cashbackEarned = Number((cartTotal * 0.05).toFixed(2));
    const appliedCashbackDiscount = useCashback ? cashbackDiscount : 0;

    const existingClientIndex = (clients || []).findIndex(c => {
      const matchPhone = c.phone.replace(/\D/g, '') === cleanedPhone && cleanedPhone.length > 0;
      const matchCpf = c.cpf && c.cpf.replace(/\D/g, '') === cleanedCpf && cleanedCpf.length > 0;
      const matchName = c.name.toLowerCase() === cleanedName.toLowerCase();
      return matchPhone || matchCpf || matchName;
    });

    if (existingClientIndex !== -1) {
      const existingClient = clients[existingClientIndex];
      const updatedList = [...clients];
      const nextBalance = Math.max(0, Number(((existingClient.cashbackBalance || 0) - appliedCashbackDiscount + cashbackEarned).toFixed(2)));

      updatedList[existingClientIndex] = {
        ...existingClient,
        email: clientEmail.trim() || existingClient.email,
        cpf: clientCpf.trim() || existingClient.cpf,
        birthDate: clientBirthDate.trim() || existingClient.birthDate,
        whatsapp: clientPhone.trim() || existingClient.whatsapp,
        addressStreet: addressStreet.trim() || existingClient.addressStreet,
        addressNum: addressNum.trim() || existingClient.addressNum,
        addressComp: addressComp.trim() || existingClient.addressComp,
        addressBairro: addressBairro.trim() || existingClient.addressBairro,
        addressCidade: addressCidade.trim() || existingClient.addressCidade,
        addressEstado: addressEstado.trim() || existingClient.addressEstado,
        addressCep: addressCep.trim() || existingClient.addressCep,
        totalSpent: Number((existingClient.totalSpent + cartTotal).toFixed(2)),
        ordersCount: (existingClient.ordersCount || 0) + 1,
        cashbackBalance: nextBalance
      };
      if (onUpdateClients) {
        onUpdateClients(updatedList);
      }
      setVipMessage(`Fidelidade Ativa! Cashback atualizado: você acumulou R$ ${cashbackEarned.toFixed(2)} nesta compra e possui R$ ${nextBalance.toFixed(2)} disponíveis para novos pedidos! 🌸`);
    } else {
      const newClient: Client = {
        id: `cli-${Date.now()}`,
        name: cleanedName,
        email: clientEmail.trim() || `${cleanedName.toLowerCase().replace(/\s+/g, '')}@exemplo.com`,
        phone: clientPhone.trim(),
        cpf: clientCpf.trim() || undefined,
        birthDate: clientBirthDate.trim() || undefined,
        whatsapp: clientPhone.trim(),
        addressStreet: addressStreet.trim() || undefined,
        addressNum: addressNum.trim() || undefined,
        addressComp: addressComp.trim() || undefined,
        addressBairro: addressBairro.trim() || undefined,
        addressCidade: addressCidade.trim() || undefined,
        addressEstado: addressEstado.trim() || undefined,
        addressCep: addressCep.trim() || undefined,
        channel: 'E-commerce',
        npsScore: 10,
        totalSpent: Number(cartTotal.toFixed(2)),
        ordersCount: 1,
        cashbackBalance: cashbackEarned,
        createdAt: new Date().toISOString()
      };
      onAddClient(newClient);
      setVipMessage(`Seja bem-vinda, ${cleanedName}! Seu cadastro de cliente VIP foi salvo automaticamente no sistema. ✨ Você acumulou R$ ${cashbackEarned.toFixed(2)} de cashback nesta compra!`);
    }

    // Reset login states
    setLoggedClient(null);
    setUseCashback(false);
    setIsVipRegisteredJustNow(true);

    try {
      window.open(`https://api.whatsapp.com/send?phone=${storeInfo.phone}&text=${encodeURIComponent(orderMsg)}`, '_blank');
    } catch {
      alert('Seu navegador bloqueou o WhatsApp. Copie a mensagem ou tente novamente.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans selection:bg-pink-100 selection:text-pink-600 pb-16 relative">
      
      {/* Main E-Commerce Scrollable Vitrine Body Block */}
      <div className="flex-1 mt-0 relative transition-all duration-300">
        
        {/* 1. Ticker Announcement Bar */}
        {tickerConfig.show && (
          <div 
            className="text-white py-2 px-4 shadow-sm relative overflow-hidden h-9"
            style={{ backgroundColor: tickerConfig.bgColor, color: tickerConfig.textColor }}
          >
            <div className="absolute inset-x-0 top-0 flex items-center justify-center h-full animate-pulse">
              <p className="text-[10px] md:text-xs font-bold tracking-widest uppercase flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                <span>{tickerConfig.text}</span>
              </p>
            </div>
          </div>
        )}

      {/* 2. Main Premium Sticky Header */}
      <header className="bg-white/95 backdrop-blur-md sticky top-0 z-40 border-b border-slate-100 px-4 md:px-8 py-3 flex justify-between items-center max-w-7xl mx-auto rounded-b-3xl">
        {/* Left Side menu indicators */}
        <div className="flex items-center gap-3">
          <button 
            type="button"
            onClick={() => setIsMenuDrawerOpen(true)}
            className="p-2 text-slate-700 hover:text-pink-600 hover:bg-slate-50 rounded-full transition cursor-pointer"
          >
            <Menu size={20} />
          </button>
          <button 
            type="button"
            onClick={() => {
              const el = document.getElementById('search-catalog-bar');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
            className="p-2 text-slate-700 hover:text-pink-600 hover:bg-slate-50 rounded-full transition cursor-pointer"
          >
            <Search size={18} />
          </button>
        </div>

        {/* Center: Curvy Elegant Serif Brand Name Logo */}
        <div className="flex flex-col items-center">
          <span className="font-serif italic text-2xl md:text-3xl font-normal leading-none tracking-normal text-slate-950 select-none cursor-pointer">
            {storeName}
          </span>
          <span className="text-[8px] font-bold uppercase tracking-widest mt-0.5 font-sans" style={{ color: themeColor }}>
            {storeSub}
          </span>
        </div>

        {/* Right side user elements & cart badging */}
        <div className="flex items-center gap-3">
          <button 
            type="button"
            onClick={() => setIsProfileModalOpen(true)}
            className={`p-2 rounded-full transition cursor-pointer relative ${loggedClient ? 'bg-pink-50 text-pink-700 border border-pink-200/50' : 'text-slate-700 hover:text-pink-600 hover:bg-slate-50'}`}
            title={loggedClient ? `Olá, ${loggedClient.name} (Clube VIP)` : "Área VIP Cliente & Cashback"}
          >
            <User size={18} />
            {loggedClient && (
              <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-white animate-pulse" />
            )}
          </button>
          
          <button 
            onClick={() => setIsCartOpen(true)}
            className="relative p-2.5 bg-pink-50/50 hover:bg-pink-100 text-pink-600 hover:text-pink-700 rounded-full transition duration-300 cursor-pointer border border-pink-100/40"
            title="Minha Sacola"
          >
            <ShoppingBag size={18} />
            {cart.length > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-pink-600 text-white border-2 border-white rounded-full flex items-center justify-center text-[9px] font-extrabold tracking-tight animate-bounce">
                {cart.reduce((s, c) => s + c.quantity, 0)}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* 3. High quality Lookbook Banner Autoplay Slider */}
      <section className="px-4 md:px-8 mt-4 max-w-7xl mx-auto">
        <div className="relative rounded-3xl overflow-hidden bg-slate-900 text-white min-h-[260px] md:min-h-[340px] flex items-center shadow-lg transition-all duration-700">
          
          {/* Animated Background image based on lookbook model collection */}
          <div 
            className="absolute inset-0 bg-cover bg-center transition-all duration-1000 transform scale-102"
            style={{ 
              backgroundImage: `url('${lookbookSlides[currentSlide].image}')`,
              filter: 'brightness(0.65)'
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/40 to-slate-900/10" />

          {/* Slogan overlaid details with slide elements */}
          <div className="relative max-w-xl pl-6 pr-6 md:pl-16 space-y-4 z-10 text-left">
            <span style={{ backgroundColor: themeColor }} className="inline-flex items-center gap-1.5 text-white font-sans font-extrabold text-[9px] uppercase tracking-widest px-3 py-1 rounded-full shadow-md">
              <Sparkles size={10} />
              <span>{lookbookSlides[currentSlide].tag}</span>
            </span>
            <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight leading-tight uppercase font-sans">
              {lookbookSlides[currentSlide].title}
            </h2>
            <p className="text-[11px] md:text-xs text-slate-250 leading-relaxed max-w-md font-medium">
              {lookbookSlides[currentSlide].desc}
            </p>
            <div>
              <button
                type="button"
                onClick={() => {
                  const target = document.getElementById('colecao-run-anchor');
                  if (target) target.scrollIntoView({ behavior: 'smooth' });
                }}
                className="bg-white hover:bg-pink-600 text-slate-900 hover:text-white font-bold text-[10px] uppercase tracking-wider py-2.5 px-5 rounded-full transition duration-300 shadow-md cursor-pointer border-none"
              >
                Comprar Coleção
              </button>
            </div>
          </div>

          {/* Indicators dots for carousel state */}
          <div className="absolute bottom-5 right-1/2 translate-x-1/2 flex gap-2 z-25">
            {lookbookSlides.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setCurrentSlide(idx)}
                className={`w-2 h-2 rounded-full transition-all duration-300
                  ${currentSlide === idx ? 'w-5 bg-white' : 'bg-white/40'}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* 4. Core Benefits & Trust Icons Rows */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 mt-5">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
          <div className="bg-white border border-slate-100 rounded-2xl p-4 flex items-center gap-3 shadow-xs">
            <div className="w-9 h-9 rounded-xl bg-pink-50 text-pink-600 flex items-center justify-center flex-shrink-0">
              <Truck size={16} />
            </div>
            <div className="text-left text-[10px] leading-tight">
              <p className="font-extrabold text-slate-800">Envio para todo o Brasil</p>
              <p className="text-slate-450 text-[9px] font-medium mt-0.5">Correios ou Transportadora</p>
            </div>
          </div>

          <div className="bg-white border border-slate-100 rounded-2xl p-4 flex items-center gap-3 shadow-xs">
            <div className="w-9 h-9 rounded-xl bg-pink-50 text-pink-600 flex items-center justify-center flex-shrink-0">
              <CreditCard size={16} />
            </div>
            <div className="text-left text-[10px] leading-tight">
              <p className="font-extrabold text-slate-800">Até 6x no Cartão</p>
              <p className="text-slate-450 text-[9px] font-medium mt-0.5">Parcelamento facilitado</p>
            </div>
          </div>

          <div className="bg-white border border-slate-100 rounded-2xl p-4 flex items-center gap-3 shadow-xs">
            <div className="w-9 h-9 rounded-xl bg-pink-50 text-pink-600 flex items-center justify-center flex-shrink-0">
              <Lock size={15} />
            </div>
            <div className="text-left text-[10px] leading-tight">
              <p className="font-extrabold text-slate-800">Compra 100% Segura</p>
              <p className="text-slate-450 text-[9px] font-medium mt-0.5">Seus dados protegidos</p>
            </div>
          </div>

          <div className="bg-white border border-slate-100 rounded-2xl p-4 flex items-center gap-3 shadow-xs">
            <div className="w-9 h-9 rounded-xl bg-pink-50 text-pink-600 flex items-center justify-center flex-shrink-0">
              <Sparkles size={15} />
            </div>
            <div className="text-left text-[10px] leading-tight">
              <p className="font-extrabold text-slate-800">Desconto Extra no Pix</p>
              <p className="text-slate-450 text-[9px] font-medium mt-0.5">Ganhe {pixDiscountPercent}% OFF Extra!</p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Bento Category Highlights: Slim Fit vs Plus Size */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 mt-6">
        <div className="grid grid-cols-2 gap-4">
          
          {/* Box 1: Slim Fit highlighting model in activewear */}
          <div 
            onClick={() => setSelectedCategory('Slim Fit')}
            className={`group rounded-3xl h-36 md:h-48 overflow-hidden relative cursor-pointer shadow-xs border transition duration-300
              ${selectedCategory === 'Slim Fit' ? 'border-pink-500 scale-[1.01] ring-2 ring-pink-600/5' : 'border-slate-100 hover:border-pink-200'}`}
          >
            <div 
              className="absolute inset-0 bg-cover bg-center group-hover:scale-103 transition duration-500"
              style={{ backgroundImage: `url('${categoryBanners.slimFit}')` }}
            />
            <div className="absolute inset-0 bg-slate-950/40 group-hover:bg-slate-950/30 transition duration-300" />
            
            <div className="absolute inset-0 flex flex-col justify-end p-4 text-left">
              <p className="font-serif italic text-2xl md:text-3xl font-medium text-white tracking-wide">Slim Fit</p>
              <p className="text-[9px] md:text-10px font-bold text-pink-300 tracking-widest uppercase">Coleção modeladora</p>
            </div>
          </div>

          {/* Box 2: Plus Size highlighting model in dark activewear */}
          <div 
            onClick={() => setSelectedCategory('Plus Size')}
            className={`group rounded-3xl h-36 md:h-48 overflow-hidden relative cursor-pointer shadow-xs border transition duration-300
              ${selectedCategory === 'Plus Size' ? 'border-pink-500 scale-[1.01] ring-2 ring-pink-600/5' : 'border-slate-100 hover:border-pink-200'}`}
          >
            <div 
              className="absolute inset-0 bg-cover bg-center group-hover:scale-103 transition duration-500"
              style={{ backgroundImage: `url('${categoryBanners.plusSize}')` }}
            />
            <div className="absolute inset-0 bg-slate-950/40 group-hover:bg-slate-950/30 transition duration-300" />
            
            <div className="absolute inset-0 flex flex-col justify-end p-4 text-left">
              <p className="font-serif italic text-2xl md:text-3xl font-medium text-white tracking-wide">Plus Size</p>
              <p className="text-[9px] md:text-10px font-bold text-pink-300 tracking-widest uppercase">Caimento esculpido</p>
            </div>
          </div>

        </div>
      </section>

      {/* Brand title block separator */}
      <span id="colecao-run-anchor" className="block h-1 scroll-mt-20" />

      {/* 6. Main Catalog grid blocks listing */}
      <main className="max-w-7xl mx-auto px-4 md:px-8 mt-10 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Side options list */}
        <div className="lg:col-span-3 space-y-5">
          <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-xs space-y-4">
            
            {/* Search items bar */}
            <div id="search-catalog-bar" className="space-y-1.5 scroll-mt-24">
              <label className="text-[9px] text-slate-400 font-extrabold uppercase tracking-widest block">Consultar Vitrine</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-450 pointer-events-none">
                  <Search size={14} className="text-slate-400" />
                </span>
                <input 
                  type="text"
                  placeholder="Pesquisar calça, top, macacão..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-150 rounded-xl py-2 pl-9 pr-3 text-xs placeholder-slate-400 focus:outline-hidden focus:border-pink-500 font-medium"
                />
              </div>
            </div>

            {/* List Pills of standard categories */}
            <div className="space-y-1.5">
              <label className="text-[9px] text-slate-400 font-extrabold uppercase tracking-widest block">Seções Oficiais</label>
              <div className="flex flex-wrap lg:flex-col gap-1">
                {categoriesList.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    style={selectedCategory === cat ? { backgroundColor: themeColor, boxShadow: `0 4px 12px ${themeColor}20` } : {}}
                    className={`px-3.5 py-2 text-xs font-bold rounded-xl transition-all text-left flex items-center justify-between cursor-pointer w-full select-none
                      ${selectedCategory === cat 
                        ? 'text-white' 
                        : 'bg-slate-50 text-slate-650 hover:bg-slate-100'}`}
                  >
                    <span>{cat}</span>
                    <ChevronRight size={12} className={selectedCategory === cat ? 'opacity-100' : 'opacity-40'} />
                  </button>
                ))}
              </div>
            </div>

            {/* Trust highlights info */}
            <div className="border-t border-slate-50 pt-4 space-y-3 text-[11px] text-slate-500 font-medium font-sans">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-green-50 text-green-600 flex items-center justify-center text-xs font-bold">✓</div>
                <span>Zero Transparência Garantida</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-green-50 text-green-600 flex items-center justify-center text-xs font-bold">✓</div>
                <span>Finalização rápida em 1 clique</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-green-50 text-green-600 flex items-center justify-center text-xs font-bold">✓</div>
                <span>Atendimento humano pelo WhatsApp</span>
              </div>
            </div>

          </div>
        </div>

        {/* Right Side grid listing */}
        <div className="lg:col-span-9 space-y-6 text-center">
          
          {/* Centered Collection header from videos */}
          <div className="space-y-1 text-center py-2">
            <h3 className="font-serif italic text-3xl font-medium tracking-tight text-slate-900">
              Coleção Run
            </h3>
            <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest">
              Confira nossa nova coleção!
            </p>
          </div>

          {visibleProducts.length === 0 ? (
            <div className="bg-white border border-slate-100 rounded-3xl p-12 text-center text-slate-400 max-w-md mx-auto">
              <ShoppingBag size={42} className="mx-auto text-slate-300 mb-3" />
              <p className="font-bold text-slate-600 text-xs">Nenhum produto em estoque encontrado.</p>
              <p className="text-[11px] mt-1 text-slate-400">Tente buscar por termos alternativos ou limpe os filtros selecionados.</p>
              <button 
                onClick={() => { setSearchQuery(''); setSelectedCategory('Todos'); }}
                className="mt-4 px-3 py-1.5 bg-slate-800 hover:bg-slate-900 border-none text-white rounded-lg text-xs font-semibold cursor-pointer"
              >
                Limpar Filtros
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              {visibleProducts.map(prod => {
                const isItemLiked = wishlistLikes[prod.id]?.active || false;
                const totalWishCount = wishlistLikes[prod.id]?.count || 12;
                return (
                  <div 
                    key={prod.id} 
                    className="bg-transparent overflow-hidden transition-all flex flex-col justify-between text-left group relative"
                  >
                    
                    {/* Portrait Style Frame with layout ratio of the fashion site */}
                    <div className="relative aspect-[3/4] w-full rounded-2xl bg-white overflow-hidden shadow-xs cursor-pointer border border-slate-100/65" onClick={() => handleOpenProduct(prod)}>
                      {prod.image ? (
                        <img 
                          src={prod.image} 
                          alt={prod.name} 
                          className="w-full h-full object-cover group-hover:scale-104 transition-transform duration-700"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="w-full h-full bg-slate-50 flex flex-col items-center justify-center p-4 text-center text-slate-400 group-hover:bg-slate-100 transition-colors duration-500">
                          <ShoppingBag size={24} className="text-slate-350 stroke-[1.5] mb-2 animate-pulse" />
                          <span className="text-[10px] font-bold tracking-widest uppercase text-slate-400">AP Moda Fitness</span>
                          <span className="text-[9px] text-slate-400 font-medium">Foto em breve</span>
                        </div>
                      )}
                      
                      {/* Heart Like micro indicator absolute overlay */}
                      <button 
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleWishlist(prod.id);
                        }}
                        className={`absolute top-3.5 right-3.5 bg-white/90 backdrop-blur-xs p-2 rounded-full shadow-xs hover:scale-110 active:scale-95 transition
                          ${isItemLiked ? 'text-pink-600' : 'text-slate-400 hover:text-pink-600'}`}
                      >
                        <Heart size={14} className={isItemLiked ? 'fill-pink-600 text-pink-600' : ''} />
                      </button>

                      {/* Video Play preview Overlay if product is recorded */}
                      {prod.videoUrl && (
                        <span className="absolute bottom-3 left-3 bg-pink-600/95 text-white py-1 px-2.5 rounded-lg text-[9px] font-extrabold uppercase tracking-wider flex items-center gap-1.5 shadow-md shadow-pink-600/20">
                          <Play size={8} className="fill-white" />
                          <span>Vídeo</span>
                        </span>
                      )}

                      {/* Stock safety highlight */}
                      {prod.stock <= 3 && (
                        <span className="absolute top-3 left-3 bg-rose-600 text-white px-2 py-0.5 rounded text-[8px] font-extrabold uppercase tracking-wide">
                          ÚLTIMAS PEÇAS!
                        </span>
                      )}
                    </div>

                    {/* Highly polished borderless detailing cards matching design stills */}
                    <div className="pt-3 pb-2.5 px-1 space-y-1">
                      
                      {/* Interactive Gold Stars rating */}
                      <div className="flex items-center gap-0.5">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} size={11} className="fill-yellow-400 text-yellow-400" />
                        ))}
                        <span className="text-[9px] text-slate-400 font-bold ml-1">({totalWishCount})</span>
                      </div>

                      {/* Product Name Title */}
                      <p className="text-[12.5px] font-medium text-slate-850 leading-snug tracking-tight group-hover:text-pink-600 transition-colors truncate">
                        {prod.name}
                      </p>

                      {/* Size Tags indicator row preview */}
                      {prod.sizes && prod.sizes.length > 0 && (
                        <div className="flex gap-1 py-0.5 select-none">
                          {prod.sizes.map(sz => (
                            <span key={sz} className="text-[8.5px] font-bold text-slate-400 font-mono border border-slate-200/50 px-1 rounded-sm">
                              {sz}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Bold price tag */}
                      <div className="pt-0.5 flex justify-between items-center">
                        <span className="font-extrabold text-[15px] text-slate-900 leading-none">
                          R$ {prod.price.toFixed(2)}
                        </span>
                        
                        {/* Quick Add icon */}
                        <button
                          type="button"
                          onClick={(e) => handleQuickAdd(prod, e)}
                          className="w-7 h-7 bg-slate-900 hover:bg-pink-600 hover:scale-105 active:scale-95 text-white rounded-full flex items-center justify-center transition cursor-pointer"
                          title="Compra Rápida"
                        >
                          <Plus size={14} />
                        </button>
                      </div>

                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </main>

      {/* 7. Beautiful Product Detail Overlay Popup with Interactive Matrix Stepper */}
      {selectedProduct && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-50 p-3 md:p-6 font-sans">
          <div className="bg-white rounded-[32px] max-w-3xl w-full shadow-2xl border border-slate-100 overflow-hidden text-slate-800 flex flex-col md:flex-row h-full max-h-[92vh] md:max-h-[620px] animate-in fade-in zoom-in-95 duration-200 relative">
            
            {/* Header top row simulated in modal screen */}
            <div className="absolute top-0 inset-x-0 bg-white/90 backdrop-blur-xs px-5 py-3 border-b border-slate-100 flex justify-between items-center z-10 md:hidden">
              <button 
                type="button"
                onClick={() => setSelectedProduct(null)}
                className="p-1.5 hover:bg-slate-50 text-slate-700 rounded-full cursor-pointer flex items-center gap-1 font-bold text-xs"
              >
                <ArrowLeft size={16} />
                <span>Voltar</span>
              </button>
              <span className="font-serif italic text-base -ml-2">AP Moda Fitness</span>
              <div className="w-8" />
            </div>

            {/* Left section detail layout: Multi angle lookbook photo slider */}
            <div className="w-full md:w-[45%] bg-slate-50 relative min-h-[300px] md:min-h-full flex items-center justify-center overflow-hidden flex-shrink-0 pt-[45px] md:pt-0">
              
              {isVideoPlaying && selectedProduct.videoUrl ? (
                <div className="absolute inset-0 bg-black flex flex-col justify-between">
                  <video 
                    src={selectedProduct.videoUrl} 
                    autoPlay 
                    controls 
                    loop 
                    muted 
                    playsInline 
                    className="w-full h-full object-contain"
                  />
                  <button 
                    onClick={() => setIsVideoPlaying(false)}
                    className="absolute top-4 right-4 bg-slate-900/70 hover:bg-slate-900 text-white rounded-full p-2 transition cursor-pointer z-30"
                  >
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <div className="absolute inset-0">
                  {(() => {
                    const imagesPoolRaw = selectedProduct.images && selectedProduct.images.length > 0 
                      ? selectedProduct.images 
                      : [selectedProduct.image];
                    const imagesPool = imagesPoolRaw.filter(Boolean);

                    if (imagesPool.length === 0) {
                      return (
                        <div className="w-full h-full bg-slate-50 flex flex-col items-center justify-center p-6 text-center text-slate-400">
                          <ShoppingBag size={32} className="text-slate-300 stroke-[1.5] mb-2 animate-pulse" />
                          <span className="text-xs font-bold tracking-widest uppercase text-slate-400">AP Moda Fitness</span>
                          <span className="text-xs text-slate-500 mt-1">Fotografia do produto indisponível</span>
                        </div>
                      );
                    }

                    const currentIdx = detailImageIdx % imagesPool.length;
                    const activeImage = imagesPool[currentIdx];

                    return (
                      <>
                        <img 
                          src={activeImage} 
                          alt={selectedProduct.name} 
                          className="w-full h-full object-cover transition duration-500"
                          referrerPolicy="no-referrer"
                        />
                        
                        {/* Hearts wishlist interactive feedback outline bar */}
                        <div className="absolute top-4 left-4 hidden md:flex items-center gap-2 bg-white/90 backdrop-blur-xs px-3 py-1.5 rounded-full shadow-xs">
                          <button 
                            type="button" 
                            onClick={() => handleToggleWishlist(selectedProduct.id)}
                            className="text-pink-600 hover:scale-110 active:scale-95 transition"
                          >
                            <Heart 
                              size={15} 
                              className={wishlistLikes[selectedProduct.id]?.active ? 'fill-pink-600' : ''} 
                            />
                          </button>
                          <span className="text-[10px] text-slate-700 font-bold">
                            {wishlistLikes[selectedProduct.id]?.count || 12} curtidas
                          </span>
                        </div>

                        {/* Play video overlay badge if link exists */}
                        {selectedProduct.videoUrl && (
                          <button
                            onClick={() => setIsVideoPlaying(true)}
                            className="absolute inset-0 m-auto w-14 h-14 bg-pink-600 hover:bg-pink-700 text-white rounded-full flex items-center justify-center shadow-lg shadow-pink-500/20 active:scale-95 transition cursor-pointer z-20"
                            title="Assistir demonstração de caimento"
                          >
                            <Play size={20} className="ml-1 fill-white" />
                          </button>
                        )}

                        {/* Horizontal slider dots indicator */}
                        {imagesPool.length > 1 && (
                          <div className="absolute bottom-5 inset-x-0 mx-auto flex justify-center gap-2 z-10 select-none">
                            {imagesPool.map((_, idx) => (
                              <button
                                key={idx}
                                type="button"
                                onClick={() => setDetailImageIdx(idx)}
                                className={`w-2 h-2 rounded-full transition-all duration-300
                                  ${currentIdx === idx ? 'w-4 bg-pink-600' : 'bg-white/70'}`}
                              />
                            ))}
                          </div>
                        )}

                        {/* Left / Right arrows for model positions and zoom */}
                        {imagesPool.length > 1 && (
                          <>
                            <button
                              type="button"
                              onClick={() => setDetailImageIdx(prev => (prev - 1 + imagesPool.length) % imagesPool.length)}
                              className="absolute left-3 bottom-1/2 translate-y-1/2 w-8 h-8 rounded-full bg-white/80 flex items-center justify-center text-slate-800 shadow-sm hover:bg-white transition"
                            >
                              <ChevronLeft size={16} />
                            </button>
                            <button
                              type="button"
                              onClick={() => setDetailImageIdx(prev => (prev + 1) % imagesPool.length)}
                              className="absolute right-3 bottom-1/2 translate-y-1/2 w-8 h-8 rounded-full bg-white/80 flex items-center justify-center text-slate-800 shadow-sm hover:bg-white transition"
                            >
                              <ChevronRight size={16} />
                            </button>
                          </>
                        )}
                      </>
                    );
                  })()}
                </div>
              )}

              {/* Close detail button on Desktop */}
              <button 
                onClick={() => setSelectedProduct(null)}
                className="absolute top-4 right-4 bg-white/85 hover:bg-white text-slate-900 rounded-full p-2.5 transition cursor-pointer shadow-md hidden md:block z-30 font-bold text-xs"
                title="Fechar detalhes"
              >
                ✕
              </button>
            </div>

            {/* Right section details with premium configurations */}
            <div className="w-full md:w-[55%] p-5 md:p-7 overflow-y-auto max-h-[55vh] md:max-h-full flex flex-col justify-between text-left space-y-4">
              
              <div className="space-y-4">
                
                {/* Visual specs code */}
                <div className="flex justify-between items-center text-[10px]">
                  <span className="bg-pink-100 text-pink-700 font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider">
                    {selectedProduct.category || "Coleção Run"}
                  </span>
                  <span className="text-slate-400 font-bold font-mono">
                    Cód: {selectedProduct.sku || `CA${selectedProduct.id.slice(-4)}`} • AP Moda Fitness
                  </span>
                </div>
                
                {/* Title */}
                <div>
                  <h4 className="text-base md:text-xl font-extrabold text-slate-900 leading-tight">
                    {selectedProduct.name}
                  </h4>
                  {/* Reviews line feedback */}
                  <div className="flex items-center gap-1 mt-1 font-sans">
                    <div className="flex text-yellow-450 gap-0.5">
                      {[...Array(5)].map((_, i) => <Star key={i} size={11} className="fill-yellow-400 text-yellow-400" />)}
                    </div>
                    <span className="text-[10px] text-slate-450 font-bold ml-1">★ 5.0 (2 avaliações de clientes)</span>
                  </div>
                </div>

                {/* Big bold Price tag */}
                <p className="font-extrabold text-pink-600 text-xl md:text-2xl font-mono">
                  R$ {selectedProduct.price.toFixed(2)}
                </p>

                {/* Video play promotional banner box */}
                {selectedProduct.videoUrl && !isVideoPlaying && (
                  <button
                    onClick={() => setIsVideoPlaying(true)}
                    className="w-full px-4 py-2.5 rounded-2xl bg-gradient-to-r from-pink-500/10 to-rose-450/5 border border-pink-100 text-pink-600 hover:from-pink-500/15 transition flex items-center gap-2.5 text-[10.5px] font-bold text-left shadow-2xs"
                  >
                    <Play size={13} className="fill-pink-600 animate-bounce" />
                    <span>Esta peça possui vídeo de caimento real! Clique para assistir.</span>
                  </button>
                )}

                {/* 1. HIGH-END PREMIUM INTERACTIVE VARIANT CONTROLS */}
                <div className="space-y-4 border-t border-slate-50 pt-3">
                  {/* Sizes Row */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-1.5 text-[10px] text-slate-400 font-extrabold uppercase tracking-widest">
                      <div className="flex items-center gap-1.5">
                        <Palette size={11} className="text-pink-600" />
                        <span>1. Escolha o Tamanho:</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setFitHeight('');
                          setFitWeight('');
                          setFitPreference('normal');
                          setFitRecommendation(null);
                          setIsFittingRoomOpen(true);
                        }}
                        className="text-pink-600 hover:text-pink-700 transition flex items-center gap-1 text-[10px] lowercase first-letter:uppercase font-extrabold bg-pink-50 hover:bg-pink-100 px-2 py-0.5 rounded-full cursor-pointer select-none active:scale-95"
                      >
                        <Ruler size={11} className="text-pink-600 animate-pulse" />
                        <span>Descubra seu tamanho 📐</span>
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {(selectedProduct.sizes && selectedProduct.sizes.length > 0 ? selectedProduct.sizes : ['M']).map(sz => {
                        const isSelected = selectedSize === sz;
                        return (
                          <button
                            key={sz}
                            type="button"
                            onClick={() => {
                              setSelectedSize(sz);
                              // Auto-select first available color for this size if sizeColors is set
                              if (selectedProduct.sizeColors && selectedProduct.sizeColors[sz]) {
                                const availableColors = selectedProduct.sizeColors[sz];
                                if (availableColors.length > 0 && !availableColors.includes(selectedColor)) {
                                  setSelectedColor(availableColors[0]);
                                }
                              }
                            }}
                            className={`px-3.5 py-2 text-xs font-bold rounded-xl border transition-all font-mono min-w-[42px] text-center cursor-pointer active:scale-95
                              ${isSelected 
                                ? 'bg-pink-600 border-pink-600 text-white shadow-sm' 
                                : 'bg-white border-slate-200/80 hover:border-slate-300 text-slate-700'}`}
                          >
                            {sz}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Colors Row filtered by Selected Size */}
                  {(() => {
                    const availableColors = (selectedProduct.sizeColors && selectedProduct.sizeColors[selectedSize] && selectedProduct.sizeColors[selectedSize].length > 0)
                      ? selectedProduct.sizeColors[selectedSize]
                      : (selectedProduct.colors && selectedProduct.colors.length > 0 ? selectedProduct.colors : ['Única']);

                    // Double-check selectedColor is within availableColors options
                    return (
                      <div className="space-y-2">
                        <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-extrabold uppercase tracking-widest">
                          <Palette size={11} className="text-pink-600" />
                          <span>2. Escolha a Cor:</span>
                        </div>
                        <div className="flex flex-wrap gap-2.5">
                          {availableColors.map(color => {
                            const isSelected = selectedColor === color;
                            const hex = getColorHex(color);
                            return (
                              <button
                                key={color}
                                type="button"
                                onClick={() => setSelectedColor(color)}
                                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-[11px] font-bold transition-all cursor-pointer active:scale-95
                                  ${isSelected 
                                    ? 'bg-slate-900 border-slate-900 text-white shadow-xs' 
                                    : 'bg-white border-slate-200/80 hover:border-slate-300 text-slate-700'}`}
                              >
                                <span className="w-3.5 h-3.5 rounded-full border border-slate-200 shadow-3xs" style={{ backgroundColor: hex }} />
                                <span>{color}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })()}
                </div>

                {/* Active Choice Overview Feedback */}
                <div className="bg-pink-50/40 p-2.5 rounded-xl border border-pink-100/40 text-[11px] text-pink-955 font-bold flex justify-between items-center">
                  <span>Selecionado: {selectedColor} — Tamanho {selectedSize}</span>
                  {(() => {
                    let available = selectedProduct.stock;
                    if (selectedProduct.sizeColorStocks && selectedProduct.sizeColorStocks[selectedSize] && selectedProduct.sizeColorStocks[selectedSize][selectedColor] !== undefined) {
                      available = selectedProduct.sizeColorStocks[selectedSize][selectedColor];
                    } else if (selectedProduct.colorStocks && selectedProduct.colorStocks[selectedColor] !== undefined) {
                      available = selectedProduct.colorStocks[selectedColor];
                    }

                    if (available > 0) {
                      return (
                        <span className="text-[10px] text-emerald-600 font-bold">
                          {available} un. disponíveis! 🔥
                        </span>
                      );
                    } else {
                      return (
                        <span className="text-[10px] text-rose-500 font-bold animate-pulse">
                          Esgotado nesta variação ⚠️
                        </span>
                      );
                    }
                  })()}
                </div>

                {/* Counter units selector */}
                <div className="flex items-center justify-between border-t border-slate-50 pt-3">
                  <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest block">Quantidade Desejada</span>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center bg-slate-100 rounded-xl py-1 px-1.5 border border-slate-150">
                      <button 
                        onClick={() => setProductQty(Math.max(1, productQty - 1))}
                        className="p-1 hover:bg-white rounded-md transition text-slate-650 cursor-pointer"
                      >
                        <Minus size={11} />
                      </button>
                      <span className="w-8 text-center font-bold text-xs leading-none font-mono">{productQty}</span>
                      <button 
                        onClick={() => setProductQty(Math.min(selectedProduct.stock, productQty + 1))}
                        className="p-1 hover:bg-white rounded-md transition text-slate-655 cursor-pointer"
                      >
                        <Plus size={11} />
                      </button>
                    </div>
                  </div>
                </div>

                {/* FREIGHT SHIPPING CALCULATOR SYSTEM */}
                <div className="border-t border-slate-50 pt-3 space-y-1.5">
                  <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest block">Simular Frete & Prazo</span>
                  <form onSubmit={handleCalculateCep} className="flex gap-2">
                    <input 
                      type="text"
                      maxLength={9}
                      placeholder="Digite seu CEP (Ex: 01001-000)"
                      value={cepNumber}
                      onChange={(e) => setCepNumber(e.target.value)}
                      className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs focus:outline-hidden text-slate-800"
                    />
                    <button
                      type="submit"
                      className="bg-slate-905 bg-slate-900 text-white hover:bg-pink-600 text-[10px] font-bold px-3 py-1.5 rounded-xl transition cursor-pointer"
                    >
                      {isCalculatingCep ? 'Calculando...' : 'OK'}
                    </button>
                  </form>
                  {cepResult && (
                    <div className="text-[10px] text-emerald-800 font-bold bg-emerald-50 border border-emerald-100 p-2 rounded-xl animate-in fade-in duration-200 text-left">
                      {cepResult}
                    </div>
                  )}
                </div>

                {/* 2. COMBINE E MONTE SEU LOOK (CROSS-SELLING) */}
                {(() => {
                  const compProduct = getComplementaryProduct(selectedProduct);
                  if (!compProduct) return null;

                  const originalTotal = selectedProduct.price + compProduct.price;
                  const comboTotal = originalTotal * 0.95;

                  return (
                    <div className="border border-pink-100 rounded-2xl bg-gradient-to-br from-pink-50/40 via-white to-pink-50/10 p-3.5 space-y-3 shadow-xs">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <Sparkles size={12} className="text-pink-600 animate-pulse" />
                          <span className="text-[11px] font-extrabold uppercase tracking-widest text-slate-800">Combine e Monte seu Look 🌸</span>
                        </div>
                        <span className="bg-pink-100 text-pink-700 text-[9px] font-black uppercase px-2 py-0.5 rounded-full tracking-wider animate-pulse">
                          Combo 5% OFF!
                        </span>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-slate-50 border border-slate-100 flex-shrink-0 flex items-center justify-center">
                          <img 
                            src={compProduct.image} 
                            alt={compProduct.name} 
                            className="w-full h-full object-cover" 
                            referrerPolicy="no-referrer"
                          />
                        </div>
                        <div className="flex-1 text-left min-w-0">
                          <h5 className="text-[11px] font-extrabold text-slate-800 truncate leading-tight">
                            {compProduct.name}
                          </h5>
                          <p className="text-[10px] text-slate-400 font-bold leading-tight mt-0.5">
                            Categoria: {compProduct.category}
                          </p>
                          <div className="flex items-center gap-1.5 mt-1">
                            <span className="text-[11px] font-extrabold text-pink-600">
                              R$ {compProduct.price.toFixed(2)}
                            </span>
                            <span className="text-[9px] text-slate-400 line-through">
                              R$ {(compProduct.price * 1.15).toFixed(2)}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Combo Sizing harmony help info */}
                      <p className="text-[9.5px] text-slate-500 font-medium">
                        Peça complementar recomendada no tamanho <strong className="text-pink-600">{compProduct.sizes && compProduct.sizes.includes(selectedSize) ? selectedSize : (compProduct.sizes?.[0] || 'M')}</strong> para perfeita harmonia estética do look.
                      </p>

                      <div className="grid grid-cols-1 gap-2 pt-1">
                        <div className="bg-slate-50 border border-slate-100 p-2 rounded-xl flex items-center justify-between text-[10px] text-slate-600 font-bold">
                          <span>Total do Look: <span className="line-through text-slate-400">R$ {originalTotal.toFixed(2)}</span></span>
                          <span className="text-pink-600 font-black text-xs">R$ {comboTotal.toFixed(2)}</span>
                        </div>
                        
                        <button
                          type="button"
                          onClick={() => handleAddComboToCart(compProduct)}
                          className="w-full py-2 bg-slate-900 hover:bg-pink-600 text-white rounded-xl text-[10px] font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 shadow-sm active:scale-97 cursor-pointer border-none"
                        >
                          <ShoppingBag size={12} />
                          <span>Adicionar Look Completo (5% OFF)</span>
                        </button>
                      </div>
                    </div>
                  );
                })()}

                {/* Primary Add to Bag Button right after configs */}
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={handleAddToCart}
                    className="w-full py-3 bg-pink-600 hover:bg-pink-700 text-white font-sans font-extrabold rounded-2xl text-[12px] tracking-wider uppercase transition-all flex items-center justify-center gap-1.5 shadow-md shadow-pink-500/20 cursor-pointer active:scale-97"
                  >
                    <ShoppingBag size={15} />
                    <span>Adicionar à Sacola</span>
                  </button>
                </div>

                {/* ACCORDION COLLAPSIBLES */}
                <div className="border-t border-slate-100 pt-3.5 space-y-2 text-left">
                  
                  {/* Descrição Accordion */}
                  <div className="border border-slate-100 rounded-xl overflow-hidden">
                    <button
                      type="button"
                      onClick={() => setActiveAccordion(activeAccordion === 'desc' ? null : 'desc')}
                      className="w-full px-3 py-2 bg-slate-50 text-[11px] font-bold text-slate-800 flex justify-between items-center border-none cursor-pointer"
                    >
                      <span>Descrição Detalhada</span>
                      <span>{activeAccordion === 'desc' ? '−' : '+'}</span>
                    </button>
                    {activeAccordion === 'desc' && (
                      <div className="p-3 text-[10px] text-slate-500 leading-relaxed bg-white border-t border-slate-100">
                        {selectedProduct.description || "Confeccionadas em tecido suplex power de 310g, nossas peças garantem alta elasticidade, ajuste perfeito ao corpo e zero transparência. O tecido é ultra resistente, confortável e totalmente ideal para quem busca estilo em treinos intensos."}
                      </div>
                    )}
                  </div>

                  {/* Detalhes Accordion Checklist */}
                  <div className="border border-slate-100 rounded-xl overflow-hidden">
                    <button
                      type="button"
                      onClick={() => setActiveAccordion(activeAccordion === 'detalhes' ? null : 'detalhes')}
                      className="w-full px-3 py-2 bg-slate-50 text-[11px] font-bold text-slate-800 flex justify-between items-center border-none cursor-pointer"
                    >
                      <span>Ficha Técnica & Detalhes</span>
                      <span>{activeAccordion === 'detalhes' ? '−' : '+'}</span>
                    </button>
                    {activeAccordion === 'detalhes' && (
                      <div className="p-3 bg-white border-t border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-1.5 text-[10px]">
                        <p className="flex items-center gap-1.5 text-slate-650 font-medium">
                          <Check size={11} className="text-pink-600 font-bold" />
                          <span>Tecido: Suplex Power 310g</span>
                        </p>
                        <p className="flex items-center gap-1.5 text-slate-650 font-medium">
                          <Check size={11} className="text-pink-600 font-bold" />
                          <span>Composição: 90% Poliéster, 10% Elastano</span>
                        </p>
                        <p className="flex items-center gap-1.5 text-slate-650 font-medium">
                          <Check size={11} className="text-pink-600 font-bold" />
                          <span>Bojo: Removível de alta sustentação</span>
                        </p>
                        <p className="flex items-center gap-1.5 text-slate-650 font-medium">
                          <Check size={11} className="text-pink-600 font-bold" />
                          <span>Elasticidade incrível modelável</span>
                        </p>
                        <p className="flex items-center gap-1.5 text-slate-650 font-medium">
                          <Check size={11} className="text-pink-600 font-bold" />
                          <span>Costura Dupla Anti-Rompimento</span>
                        </p>
                        <p className="flex items-center gap-1.5 text-slate-650 font-medium">
                          <Check size={11} className="text-pink-600 font-bold" />
                          <span>Zero Transparência Certificada</span>
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Tamanhos Grid Accordion */}
                  <div className="border border-slate-100 rounded-xl overflow-hidden">
                    <button
                      type="button"
                      onClick={() => setActiveAccordion(activeAccordion === 'tamanhos' ? null : 'tamanhos')}
                      className="w-full px-3 py-2 bg-slate-50 text-[11px] font-bold text-slate-800 flex justify-between items-center border-none cursor-pointer"
                    >
                      <span>Tabela de Medidas Oficial</span>
                      <span>{activeAccordion === 'tamanhos' ? '−' : '+'}</span>
                    </button>
                    {activeAccordion === 'tamanhos' && (
                      <div className="p-2.5 bg-white border-t border-slate-100 text-[10px]">
                        <div className="grid grid-cols-2 gap-1 text-center font-bold">
                          <div className="bg-slate-50 py-1.5 border border-slate-100 rounded">Tamanho P — Veste 34 ao 36</div>
                          <div className="bg-slate-50 py-1.5 border border-slate-100 rounded">Tamanho M — Veste 38 ao 40</div>
                          <div className="bg-slate-50 py-1.5 border border-slate-100 rounded">Tamanho G — Veste 42 ao 44</div>
                          <div className="bg-slate-50 py-1.5 border border-slate-100 rounded">Tamanho Ps / GG — Veste 46 ao 50</div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Cuidados Accordion */}
                  <div className="border border-slate-100 rounded-xl overflow-hidden">
                    <button
                      type="button"
                      onClick={() => setActiveAccordion(activeAccordion === 'cuidados' ? null : 'cuidados')}
                      className="w-full px-3 py-2 bg-slate-50 text-[11px] font-bold text-slate-800 flex justify-between items-center border-none cursor-pointer"
                    >
                      <span>Cuidados de Preservação</span>
                      <span>{activeAccordion === 'cuidados' ? '−' : '+'}</span>
                    </button>
                    {activeAccordion === 'cuidados' && (
                      <div className="p-3 bg-white border-t border-slate-100 text-[10px] space-y-1.5 text-slate-600 font-medium">
                        <p className="flex items-center gap-1.5">🧼 Lavar à mão somente com sabão neutro</p>
                        <p className="flex items-center gap-1.5">🚫 Não deixar de molho e não passar ferro quente</p>
                        <p className="flex items-center gap-1.5">⚠️ As cores podem variar conforme o brilho e filtros da tela</p>
                      </div>
                    )}
                  </div>

                </div>

                {/* 1. REAL CLIENTS REVIEWS LOGS SYSTEM */}
                <div className="border-t border-slate-100 pt-4 space-y-2 text-left">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] text-slate-450 font-extrabold uppercase tracking-widest">Avaliações das Clientes ({productReviews[selectedProduct.id]?.length || productReviews.default.length})</span>
                    <button
                      type="button"
                      onClick={() => setIsReviewFormOpen(!isReviewFormOpen)}
                      className="text-[9px] text-pink-600 hover:text-pink-700 font-bold underline border-none bg-transparent cursor-pointer"
                    >
                      Deixar avaliação
                    </button>
                  </div>

                  {/* Review inputs block */}
                  {isReviewFormOpen && (
                    <form onSubmit={handleSubmitReview} className="bg-slate-50 p-3 rounded-2xl border border-slate-150 space-y-2 animate-in slide-in-from-top duration-200">
                      <div>
                        <input 
                          type="text"
                          required
                          placeholder="Seu nome"
                          value={newReviewAuthor}
                          onChange={(e) => setNewReviewAuthor(e.target.value)}
                          className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-[10.5px] "
                        />
                      </div>
                      <div>
                        <textarea
                          required
                          rows={2}
                          placeholder="O que achou da peça? (Elasticidade, transparência, etc...)"
                          value={newReviewText}
                          onChange={(e) => setNewReviewText(e.target.value)}
                          className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-[10.5px] "
                        />
                      </div>
                      <div className="flex justify-between items-center pt-1">
                        <div className="flex items-center gap-1">
                          <span className="text-[9px] font-bold text-slate-400 uppercase">Nota:</span>
                          <div className="flex gap-0.5">
                            {[1, 2, 3, 4, 5].map((n) => (
                              <button
                                key={n}
                                type="button"
                                onClick={() => setNewReviewStars(n)}
                                className="text-yellow-400"
                              >
                                {newReviewStars >= n ? '★' : '☆'}
                              </button>
                            ))}
                          </div>
                        </div>
                        <button
                          type="submit"
                          className="bg-slate-900 text-white hover:bg-pink-600 px-3 py-1 rounded-lg text-[9px] font-bold"
                        >
                          Publicar Avaliação
                        </button>
                      </div>
                    </form>
                  )}

                  {/* List out Reviews */}
                  <div className="space-y-3">
                    {(productReviews[selectedProduct.id] || productReviews.default).map((rev, idx) => (
                      <div key={idx} className="bg-slate-50/50 p-3 rounded-2xl border border-slate-100 relative space-y-1">
                        <div className="flex justify-between items-center">
                          <p className="font-extrabold text-[11px] text-slate-800">{rev.author}</p>
                          <span className="text-[8px] text-slate-400 font-bold font-mono">{rev.date}</span>
                        </div>
                        <div className="flex gap-0.5 text-[9px] text-yellow-450">
                          {[...Array(rev.stars)].map((_, i) => <Star key={i} size={10} className="fill-yellow-400 text-yellow-400" />)}
                        </div>
                        <p className="text-[10px] text-slate-550 leading-relaxed font-medium">
                          {rev.comment}
                        </p>
                      </div>
                    ))}
                  </div>

                </div>

                {/* PRODUTOS RELACIONADOS CAROUSEL IN DETAILS */}
                <div className="border-t border-slate-100 pt-5 space-y-3 text-left">
                  <span className="text-[10px] text-slate-450 font-extrabold uppercase tracking-widest block">Produtos Relacionados</span>
                  
                  {/* Related items list view */}
                  <div className="flex gap-3 overflow-x-auto scrollbar-none pb-2">
                    {products.filter(p => p.id !== selectedProduct.id && p.stock > 0).slice(0, 4).map(rel => (
                      <div 
                        key={rel.id} 
                        onClick={() => handleOpenProduct(rel)}
                        className="w-28 shrink-0 space-y-1.5 cursor-pointer bg-slate-50/60 hover:bg-slate-50 p-2 border border-slate-100 rounded-xl flex-shrink-0"
                      >
                        <div className="aspect-[3/4] rounded-lg overflow-hidden relative">
                          <img src={rel.image} className="w-full h-full object-cover" />
                        </div>
                        <div className="text-left leading-tight text-[9px]">
                          <p className="font-extrabold text-slate-700 truncate">{rel.name}</p>
                          <p className="text-pink-600 font-bold font-mono mt-0.5">R$ {rel.price.toFixed(2)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

              {/* Sticky bottom CTA actions bar */}
              <div className="pt-4 border-t border-slate-150 flex gap-2.5">
                <button
                  type="button"
                  onClick={() => setSelectedProduct(null)}
                  className="px-4 py-3 bg-slate-100 hover:bg-slate-200 font-sans font-bold text-slate-600 rounded-2xl transition cursor-pointer text-center text-[10.5px]"
                >
                  Voltar
                </button>
                <button
                  type="button"
                  onClick={handleAddToCart}
                  className="flex-grow py-3 bg-slate-900 border-none hover:bg-pink-600 text-white font-sans font-extrabold rounded-2xl text-[11px] tracking-wider uppercase transition-all flex items-center justify-center gap-1.5 shadow-md shadow-pink-500/10 cursor-pointer active:scale-97"
                >
                  <ShoppingBag size={14} />
                  <span>Adicionar à Sacola</span>
                </button>
              </div>

            </div>

          </div>
        </div>
      )}

      {/* 8. Junte-se a nós / Obtenha Descontos Exclusivos Newsletter Footer Card */}
      <section id="newsletter-section" className="max-w-4xl mx-auto px-4 md:px-8 mt-12 mb-6">
        <div className="bg-gradient-to-r from-pink-600 to-rose-450 text-white rounded-3xl p-6 md:p-8 text-center space-y-4 shadow-lg relative overflow-hidden">
          {/* Subtle graphic shape elements */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full transform translate-x-10 -translate-y-10" />
          <div className="absolute -bottom-8 -left-8 w-28 h-28 bg-white/5 rounded-full" />
          
          <div className="max-w-md mx-auto space-y-2 relative z-10">
            <span className="inline-block bg-white/20 border border-white/20 text-white text-[8px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-widest">JUNTE-SE A NÓS</span>
            <h4 className="text-xl md:text-2xl font-extrabold font-serif italic tracking-wide">Obtenha Descontos Exclusivos</h4>
            <p className="text-[11px] text-pink-100 leading-normal max-w-sm mx-auto">Cadastre-se na nossa Lista de Clientes VIPs para receber alertas semanais de lançamentos, cupons secretos e promoções com até 50% OFF!</p>
          </div>

          {!isNewsletterSubmitted ? (
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                if (!newsletterName.trim() || !newsletterEmail.trim()) return;
                
                // Add dummy VIP back into parent CRM
                const newVIP: Client = {
                  id: `nws-${Date.now()}`,
                  name: newsletterName.trim(),
                  email: newsletterEmail.trim(),
                  phone: "(21) 99999-1234",
                  channel: "E-commerce",
                  npsScore: 10,
                  totalSpent: 0,
                  ordersCount: 0,
                  createdAt: new Date().toISOString()
                };
                onAddClient(newVIP);

                setIsNewsletterSubmitted(true);
              }}
              className="max-w-md mx-auto space-y-2.5 font-sans pt-1 relative z-10"
            >
              <input 
                type="text"
                required
                placeholder="Seu nome completo"
                value={newsletterName}
                onChange={(e) => setNewsletterName(e.target.value)}
                className="w-full bg-white text-slate-800 text-xs px-4 py-2.5 rounded-xl placeholder-slate-400 focus:outline-hidden font-medium"
              />
              <div className="flex flex-col sm:flex-row gap-2">
                <input 
                  type="email"
                  required
                  placeholder="Digite seu melhor e-mail"
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  className="flex-1 bg-white text-slate-800 text-xs px-4 py-2.5 rounded-xl placeholder-slate-400 focus:outline-hidden font-medium"
                />
                <button
                  type="submit"
                  className="bg-slate-900 border-none hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-wider py-2.5 px-5 rounded-xl transition cursor-pointer"
                >
                  Inscrever-se
                </button>
              </div>
            </form>
          ) : (
            <div className="bg-white/10 p-4 rounded-2xl max-w-xs mx-auto animate-in fade-in duration-300 relative z-10">
              <span className="text-xl">🎉</span>
              <p className="font-bold text-xs text-white mt-1">Bem-vinda à nossa lista VIP!</p>
              <p className="text-[10px] text-pink-100 mt-0.5">Seu cadastro foi salvo automaticamente em nosso CRM do sistema!</p>
            </div>
          )}

        </div>
      </section>

      {/* Custom footer signature line */}
      <div className="text-center py-4 bg-transparent border-t border-slate-100 select-none text-[10px] text-slate-400 font-bold tracking-wider uppercase font-sans">
        © {new Date().getFullYear()} AP Moda Fitness • Desenvolvido exclusivamente para você render o máximo.
      </div>

      {/* 9. Interactive Float WhatsApp Button with notify sticker */}
      <a 
        href={`https://api.whatsapp.com/send?phone=${storeInfo.phone}&text=Ol%C3%A1!%20Gostaria%20de%20tirar%20uma%20d%C3%BAvida%20sobre%20as%20pe%C3%A7as%20da%20vitrine%20AP%20Moda%20Fitness%20🌸`}
        target="_blank"
        rel="noreferrer"
        className="fixed bottom-6 right-6 z-40 bg-green-500 hover:bg-green-600 p-3.5 rounded-full shadow-lg text-white hover:scale-110 active:scale-95 transition-all text-center flex items-center justify-center animate-bounce duration-3000 cursor-pointer"
        title="Atendimento pelo WhatsApp"
      >
        <MessageCircle size={24} className="fill-white text-green-500" />
        <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-red-500 border border-white rounded-full animate-ping" />
        <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-red-500 border border-white rounded-full flex items-center justify-center text-[7px] font-extrabold text-white">1</span>
      </a>

      {/* Provador Virtual Modal */}
      {isFittingRoomOpen && selectedProduct && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-[100] p-4 font-sans animate-in fade-in duration-200">
          <div className="bg-white rounded-[24px] max-w-md w-full shadow-2xl border border-slate-150 overflow-hidden text-slate-800 flex flex-col p-6 space-y-4 animate-in zoom-in-95 duration-250 relative">
            
            {/* Close button */}
            <button 
              onClick={() => setIsFittingRoomOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 hover:bg-slate-50 p-1.5 rounded-full transition cursor-pointer border-none bg-transparent flex items-center justify-center w-8 h-8"
              title="Fechar Provador"
            >
              ✕
            </button>

            {/* Header */}
            <div className="text-center space-y-1.5">
              <div className="w-12 h-12 rounded-full bg-pink-100 flex items-center justify-center mx-auto text-pink-600">
                <Ruler size={24} />
              </div>
              <h3 className="text-base md:text-lg font-extrabold text-slate-900">
                Provador Virtual Interativo 📏
              </h3>
              <p className="text-[10.5px] text-slate-500 leading-normal max-w-xs mx-auto font-medium">
                Insira suas medidas para que nosso assistente calcule cientificamente o tamanho ideal para você!
              </p>
            </div>

            {/* Form Fields */}
            <div className="space-y-4">
              
              {/* Altura Input Slider combo */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-[10.5px] font-bold text-slate-600">
                  <span className="flex items-center gap-1">📏 Altura</span>
                  <span className="text-pink-600 font-extrabold font-mono">{fitHeight ? `${fitHeight} cm` : 'Selecione'}</span>
                </div>
                <div className="flex gap-2">
                  <input 
                    type="range"
                    min="140"
                    max="200"
                    value={fitHeight || "165"}
                    onChange={(e) => {
                      setFitHeight(e.target.value);
                      const rec = calculateRecommendedSize(Number(e.target.value), Number(fitWeight || 60), fitPreference);
                      setFitRecommendation(rec);
                    }}
                    className="flex-1 accent-pink-600 h-1 bg-slate-100 rounded-lg cursor-pointer"
                  />
                  <input 
                    type="number"
                    placeholder="Ex: 165"
                    value={fitHeight}
                    onChange={(e) => {
                      const val = e.target.value;
                      setFitHeight(val);
                      if (val && Number(val) >= 100) {
                        const rec = calculateRecommendedSize(Number(val), Number(fitWeight || 60), fitPreference);
                        setFitRecommendation(rec);
                      }
                    }}
                    className="w-16 px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-center text-slate-800 focus:outline-hidden focus:border-pink-500 font-mono"
                  />
                </div>
              </div>

              {/* Peso Input Slider combo */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-[10.5px] font-bold text-slate-600">
                  <span className="flex items-center gap-1">⚖️ Peso</span>
                  <span className="text-pink-600 font-extrabold font-mono">{fitWeight ? `${fitWeight} kg` : 'Selecione'}</span>
                </div>
                <div className="flex gap-2">
                  <input 
                    type="range"
                    min="40"
                    max="120"
                    value={fitWeight || "60"}
                    onChange={(e) => {
                      setFitWeight(e.target.value);
                      const rec = calculateRecommendedSize(Number(fitHeight || 165), Number(e.target.value), fitPreference);
                      setFitRecommendation(rec);
                    }}
                    className="flex-1 accent-pink-600 h-1 bg-slate-100 rounded-lg cursor-pointer"
                  />
                  <input 
                    type="number"
                    placeholder="Ex: 60"
                    value={fitWeight}
                    onChange={(e) => {
                      const val = e.target.value;
                      setFitWeight(val);
                      if (val && Number(val) >= 20) {
                        const rec = calculateRecommendedSize(Number(fitHeight || 165), Number(val), fitPreference);
                        setFitRecommendation(rec);
                      }
                    }}
                    className="w-16 px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-center text-slate-800 focus:outline-hidden focus:border-pink-500 font-mono"
                  />
                </div>
              </div>

              {/* Fit Preference Choice Row */}
              <div className="space-y-2 text-left">
                <span className="text-[10.5px] font-bold text-slate-600 block">🛍️ Estilo de Caimento Preferido:</span>
                <div className="grid grid-cols-3 gap-2">
                  {(['justo', 'normal', 'largo'] as const).map((pref) => {
                    const isSel = fitPreference === pref;
                    const labels = { justo: 'Justinho 🏃‍♀️', normal: 'Normal 👍', largo: 'Mais Solto 👕' };
                    return (
                      <button
                        key={pref}
                        type="button"
                        onClick={() => {
                          setFitPreference(pref);
                          if (fitHeight && fitWeight) {
                            const rec = calculateRecommendedSize(Number(fitHeight), Number(fitWeight), pref);
                            setFitRecommendation(rec);
                          }
                        }}
                        className={`py-2 px-1 text-[10px] font-black rounded-xl border transition-all text-center cursor-pointer select-none
                          ${isSel 
                            ? 'bg-pink-600 border-pink-600 text-white shadow-xs' 
                            : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-300'}`}
                      >
                        {labels[pref]}
                      </button>
                    );
                  })}
                </div>
              </div>

            </div>

            {/* Recommendation Result display block */}
            {fitHeight && fitWeight ? (
              <div className="bg-pink-50/45 border border-pink-100 p-4 rounded-2xl space-y-2 text-center animate-in fade-in zoom-in-95 duration-200">
                <span className="text-[10px] text-pink-700 font-extrabold uppercase tracking-widest block">Tamanho Recomendado:</span>
                <span className="text-4xl font-extrabold font-mono text-pink-600 block animate-pulse">
                  {fitRecommendation || 'M'}
                </span>
                
                {/* Custom feedback text based on calculation */}
                <p className="text-[10px] text-slate-600 font-semibold leading-relaxed max-w-xs mx-auto">
                  Este tamanho possui elasticidade ideal (tecido Suplex Power de alta densidade 310g) para se ajustar perfeitamente ao seu corpo com o caimento {fitPreference === 'justo' ? 'bem firme e compressivo' : fitPreference === 'largo' ? 'mais soltinho e confortável' : 'adequado e elegante'}.
                </p>

                <button
                  type="button"
                  onClick={() => handleApplyRecommendedSize(fitRecommendation || 'M')}
                  className="w-full mt-2 py-2.5 bg-pink-600 hover:bg-pink-700 text-white rounded-xl text-xs font-extrabold transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer border-none"
                >
                  <Check size={14} />
                  <span>Aplicar Tamanho {fitRecommendation || 'M'}</span>
                </button>
              </div>
            ) : (
              <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl text-center text-slate-450 text-[10px] font-bold">
                💡 Insira sua altura e peso acima para receber a recomendação.
              </div>
            )}

            {/* Information Footnote */}
            <div className="flex gap-1.5 items-start text-left text-[9px] text-slate-400 leading-normal pt-1">
              <Info size={11} className="text-pink-400 mt-0.5 flex-shrink-0" />
              <span className="font-medium">Dica: Nossas fôrmas seguem a tabela padrão brasileira de roupas fitness femininas de alta compressão. Se você estiver entre tamanhos, a preferência de caimento decide perfeitamente seu visual.</span>
            </div>

          </div>
        </div>
      )}

      {/* Cart Drawer & Checkout Form */}
      {isCartOpen && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs flex justify-end z-50 text-[11px] md:text-xs">
          
          <div className="bg-white max-w-md w-full h-full shadow-2xl p-6 flex flex-col justify-between overflow-y-auto animate-in slide-in-from-right duration-250 font-sans text-slate-800">
            
            <div className="space-y-50 space-y-4">
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <div className="flex items-center gap-1.5">
                  <ShoppingBag size={16} className="text-pink-600" />
                  <span className="font-extrabold text-slate-800 text-xs md:text-sm uppercase tracking-wider">Minha Sacola</span>
                </div>
                <button 
                  onClick={() => setIsCartOpen(false)}
                  className="p-1.5 bg-slate-50 hover:bg-slate-100 rounded-full transition text-slate-600 cursor-pointer"
                >
                  <X size={15} />
                </button>
              </div>

              {/* Items listing list */}
              <div className="space-y-3 max-h-52 overflow-y-auto pr-1">
                {cart.length === 0 ? (
                  <div className="py-12 text-center text-slate-400 space-y-2">
                    <ShoppingBag size={32} className="mx-auto text-slate-300" />
                    <p className="font-bold text-slate-550 text-xs">Sua sacola de compras está vazia.</p>
                    <p className="text-[10px]">Aproveite para rechear de conjuntos lindos!</p>
                  </div>
                ) : (
                  cart.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center p-2.5 bg-slate-50/70 border border-slate-100 rounded-xl relative">
                      <div className="flex items-center gap-2.5 text-left">
                        <div className="w-10 h-10 rounded-lg overflow-hidden bg-slate-200 flex-shrink-0">
                          <img src={item.product.image} className="w-full h-full object-cover" />
                        </div>
                        <div className="leading-tight">
                          <p className="font-bold text-slate-850 truncate max-w-[150px]">{item.product.name}</p>
                          <p className="text-[9.5px] text-slate-450 font-bold font-mono mt-0.5">Cor: {item.color} | Tam: {item.size}</p>
                          <p className="text-[10px] text-pink-600 font-bold font-mono">R$ {item.priceAtTime.toFixed(2)} un.</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => handleUpdateItemQty(idx, -1)}
                          className="w-5 h-5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 rounded-md flex items-center justify-center cursor-pointer"
                        >
                          -
                        </button>
                        <span className="text-xs font-bold font-mono w-4 text-center">{item.quantity}</span>
                        <button 
                          onClick={() => handleUpdateItemQty(idx, 1)}
                          className="w-5 h-5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 rounded-md flex items-center justify-center cursor-pointer"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Checkout Customer fields form */}
              {cart.length > 0 && (
                <div className="border-t border-slate-100 pt-3 space-y-3 text-left">
                  <div className="bg-pink-50/50 p-3 rounded-2xl border border-pink-100/40 space-y-0.5">
                    <h5 className="font-extrabold text-[10px] tracking-wider uppercase text-slate-850 flex items-center gap-1.5">
                      <Sparkles size={11} className="text-pink-600 animate-pulse" />
                      <span>Fidelidade VIP & Entrega</span>
                    </h5>
                    <p className="text-[9px] text-slate-500 font-medium">Os dados inseridos abaixo serão cadastrados em nosso sistema de forma automática para garantir seus descontos, histórico e brindes!</p>
                  </div>

                  <div className="space-y-4 text-xs">
                    <div>
                      <label className="text-slate-450 font-bold text-[9px] uppercase tracking-wider block">Seu Nome Completo *</label>
                      <input 
                        type="text"
                        required
                        placeholder="Ex: Gabriela Duarte"
                        value={clientName}
                        onChange={(e) => setClientName(e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg font-medium text-xs focus:outline-hidden"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-slate-450 font-bold text-[9px] uppercase tracking-wider block">CPF *</label>
                        <input 
                          type="text"
                          required
                          placeholder="Ex: 123.456.789-00"
                          value={clientCpf}
                          onChange={(e) => setClientCpf(e.target.value)}
                          className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg font-medium text-xs focus:outline-hidden font-mono"
                        />
                      </div>
                      <div>
                        <label className="text-slate-450 font-bold text-[9px] uppercase tracking-wider block">Data de Nascimento *</label>
                        <input 
                          type="date"
                          required
                          value={clientBirthDate}
                          onChange={(e) => setClientBirthDate(e.target.value)}
                          className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg font-medium text-xs focus:outline-hidden font-mono"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-slate-450 font-bold text-[9px] uppercase tracking-wider block">Celular / WhatsApp *</label>
                        <input 
                          type="text"
                          required
                          placeholder="Ex: (11) 99999-8888"
                          value={clientPhone}
                          onChange={(e) => setClientPhone(e.target.value)}
                          className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg font-medium text-xs focus:outline-hidden font-mono"
                        />
                      </div>
                      <div>
                        <label className="text-slate-450 font-bold text-[9px] uppercase tracking-wider block">E-mail *</label>
                        <input 
                          type="email"
                          required
                          placeholder="Ex: gabriela@email.com"
                          value={clientEmail}
                          onChange={(e) => setClientEmail(e.target.value)}
                          className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg font-medium text-xs focus:outline-hidden"
                        />
                      </div>
                    </div>

                    {/* Delivery Options select */}
                    <div>
                      <label className="text-slate-450 font-bold text-[9px] uppercase tracking-wider block">Forma de Retirada/Envio *</label>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-1 mt-1 font-sans font-bold">
                        <button
                          type="button"
                          onClick={() => setDeliveryMethod('motoboy')}
                          className={`py-1.5 transition rounded-lg text-[9px] flex flex-col items-center justify-center gap-1 cursor-pointer border
                            ${deliveryMethod === 'motoboy' 
                              ? 'bg-slate-900 border-slate-900 text-white' 
                              : 'bg-slate-50 border-slate-200 text-slate-650 hover:bg-slate-100'}`}
                        >
                          <Truck size={12} />
                          <span>Motoboy</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeliveryMethod('correios')}
                          className={`py-1.5 transition rounded-lg text-[9px] flex flex-col items-center justify-center gap-1 cursor-pointer border
                            ${deliveryMethod === 'correios' 
                              ? 'bg-slate-900 border-slate-900 text-white' 
                              : 'bg-slate-50 border-slate-200 text-slate-650 hover:bg-slate-100'}`}
                        >
                          <Gift size={12} />
                          <span>Correios</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeliveryMethod('combinar')}
                          className={`py-1.5 transition rounded-lg text-[9px] flex flex-col items-center justify-center gap-1 cursor-pointer border
                            ${deliveryMethod === 'combinar' 
                              ? 'bg-slate-900 border-slate-900 text-white' 
                              : 'bg-slate-50 border-slate-200 text-slate-650 hover:bg-slate-100'}`}
                        >
                          <Handshake size={12} />
                          <span>Combinar</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeliveryMethod('retirada')}
                          className={`py-1.5 transition rounded-lg text-[9px] flex flex-col items-center justify-center gap-1 cursor-pointer border
                            ${deliveryMethod === 'retirada' 
                              ? 'bg-slate-900 border-slate-900 text-white' 
                              : 'bg-slate-50 border-slate-200 text-slate-650 hover:bg-slate-100'}`}
                        >
                          <MapPin size={12} />
                          <span>Retirar</span>
                        </button>
                      </div>
                    </div>

                    {/* Dynamic Date & Time Picker for Retirada */}
                    {deliveryMethod === 'retirada' && (
                      <div className="animate-in fade-in slide-in-from-top-2 duration-300 space-y-3 bg-pink-50/20 border border-pink-100/40 rounded-xl p-3 text-left">
                        <div className="flex items-center gap-1.5">
                          <Clock size={14} className="text-pink-600 animate-pulse" />
                          <p className="font-extrabold text-[10px] uppercase tracking-wider text-pink-700">Agendar Retirada na Loja</p>
                        </div>
                        <p className="text-[9px] text-slate-500 leading-normal">
                          Selecione o dia e o horário em que deseja comparecer à nossa loja física para retirar suas peças fitness.
                        </p>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="text-slate-550 font-bold text-[8px] uppercase tracking-wider block mb-1">Data de Retirada *</label>
                            <input 
                              type="date"
                              required
                              value={pickupDate}
                              min={new Date().toISOString().split('T')[0]}
                              onChange={(e) => setPickupDate(e.target.value)}
                              className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 focus:outline-none focus:border-pink-500 text-[10px] bg-white font-medium"
                            />
                          </div>
                          <div>
                            <label className="text-slate-550 font-bold text-[8px] uppercase tracking-wider block mb-1">Horário Estimado *</label>
                            <select
                              required
                              value={pickupTime}
                              onChange={(e) => setPickupTime(e.target.value)}
                              className="w-full px-2 py-1.5 rounded-lg border border-slate-200 focus:outline-none focus:border-pink-500 text-[10px] bg-white font-medium"
                            >
                              <option value="">Selecione...</option>
                              <option value="09:00">09:00 (Abertura)</option>
                              <option value="10:00">10:00</option>
                              <option value="11:00">11:00</option>
                              <option value="12:00">12:00 (Almoço)</option>
                              <option value="13:00">13:00</option>
                              <option value="14:00">14:00</option>
                              <option value="15:00">15:00</option>
                              <option value="16:00">16:00</option>
                              <option value="17:00">17:00</option>
                              <option value="18:00">18:00 (Fechamento)</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Dynamic Address option */}
                    {deliveryMethod !== 'retirada' && deliveryMethod !== 'combinar' && (
                      <div className="animate-in fade-in duration-205 space-y-2 border-t border-slate-100/60 pt-2">
                        <p className="font-extrabold text-[9px] uppercase tracking-wider text-slate-500">Endereço Completo de Destino</p>
                        
                        <div className="grid grid-cols-3 gap-2">
                          <div className="col-span-1">
                            <label className="text-slate-450 font-bold text-[8px] uppercase tracking-wider block">CEP *</label>
                            <input 
                              type="text"
                              required
                              placeholder="Ex: 01311-200"
                              value={addressCep}
                              onChange={(e) => setAddressCep(e.target.value)}
                              className="w-full px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-[11px] font-medium focus:outline-hidden font-mono"
                            />
                          </div>
                          <div className="col-span-2">
                            <label className="text-slate-450 font-bold text-[8px] uppercase tracking-wider block">Rua / Logradouro *</label>
                            <input 
                              type="text"
                              required
                              placeholder="Ex: Avenida Paulista"
                              value={addressStreet}
                              onChange={(e) => setAddressStreet(e.target.value)}
                              className="w-full px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-[11px] font-medium focus:outline-hidden"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-2">
                          <div>
                            <label className="text-slate-450 font-bold text-[8px] uppercase tracking-wider block">Número *</label>
                            <input 
                              type="text"
                              required
                              placeholder="Ex: 1000"
                              value={addressNum}
                              onChange={(e) => setAddressNum(e.target.value)}
                              className="w-full px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-[11px] font-medium focus:outline-hidden"
                            />
                          </div>
                          <div className="col-span-2">
                            <label className="text-slate-450 font-bold text-[8px] uppercase tracking-wider block">Complemento</label>
                            <input 
                              type="text"
                              placeholder="Ex: Apto 12"
                              value={addressComp}
                              onChange={(e) => setAddressComp(e.target.value)}
                              className="w-full px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-[11px] font-medium focus:outline-hidden"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-2 font-sans">
                          <div>
                            <label className="text-slate-450 font-bold text-[8px] uppercase tracking-wider block">Bairro *</label>
                            <input 
                              type="text"
                              required
                              placeholder="Ex: Bela Vista"
                              value={addressBairro}
                              onChange={(e) => setAddressBairro(e.target.value)}
                              className="w-full px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-[11px] font-medium focus:outline-hidden"
                            />
                          </div>
                          <div>
                            <label className="text-slate-450 font-bold text-[8px] uppercase tracking-wider block">Cidade *</label>
                            <input 
                              type="text"
                              required
                              placeholder="Ex: São Paulo"
                              value={addressCidade}
                              onChange={(e) => setAddressCidade(e.target.value)}
                              className="w-full px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-[11px] font-medium focus:outline-hidden"
                            />
                          </div>
                          <div>
                            <label className="text-slate-450 font-bold text-[8px] uppercase tracking-wider block">Estado *</label>
                            <input 
                              type="text"
                              required
                              placeholder="Ex: SP"
                              value={addressEstado}
                              onChange={(e) => setAddressEstado(e.target.value)}
                              className="w-full px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-[11px] font-medium focus:outline-hidden font-mono uppercase"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    <div>
                      <label className="text-slate-450 font-bold text-[9px] uppercase tracking-wider block">Nota / Observação Especial (Opcional)</label>
                      <input 
                        type="text"
                        placeholder="Ex: Embrulhar para presente, deixar na portaria..."
                        value={clientNotes}
                        onChange={(e) => setClientNotes(e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:outline-hidden"
                      />
                    </div>

                    {/* Slated Coupon Application */}
                    <div>
                      <label className="text-slate-450 font-bold text-[9px] uppercase tracking-wider block">Possui Cupom Promocional?</label>
                      <div className="flex gap-1.5 mt-0.5">
                        <input 
                          type="text"
                          placeholder="Ex: FITNESS10"
                          value={couponCode}
                          onChange={(e) => setCouponCode(e.target.value)}
                          className="flex-1 px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-hidden uppercase font-mono font-bold text-rose-600"
                        />
                        <button 
                          type="button" 
                          onClick={handleApplyCoupon}
                          className="px-3 bg-slate-800 hover:bg-slate-900 font-bold text-white max-h-[30px] rounded-lg transition text-[10px] cursor-pointer"
                        >
                          Aplicar
                        </button>
                      </div>
                      <span className="text-[8px] text-slate-400 block mt-1">Dica: Use cupons como <strong>FITNESS10</strong>, <strong>BEMVINDA50</strong> ou <strong>FRETEGRATIS</strong> para testar.</span>
                    </div>

                    {/* Cashback / Fidelidade Section */}
                    <div className="border-t border-slate-100/60 pt-4 space-y-2">
                      <p className="font-extrabold text-[9px] uppercase tracking-wider text-slate-500">Clube VIP & Cashback</p>
                      {loggedClient ? (
                        <div className="bg-emerald-50/50 border border-emerald-100/80 rounded-xl p-3 flex flex-col gap-2 text-left animate-in fade-in duration-300">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] text-emerald-800 font-extrabold uppercase tracking-wide">
                              ✨ Cliente VIP Identificado
                            </span>
                            <span className="text-[10px] text-emerald-700 font-bold font-mono">
                              Saldo: R$ {loggedClient.cashbackBalance?.toFixed(2) || '0.00'}
                            </span>
                          </div>
                          <p className="text-[9px] text-slate-600 leading-normal">
                            Olá, <strong>{loggedClient.name}</strong>! Você possui um saldo acumulado de cashback. Deseja aplicá-lo como desconto nesta compra?
                          </p>
                          {(loggedClient.cashbackBalance || 0) > 0 ? (
                            <label className="flex items-center gap-2 bg-white px-2.5 py-1.5 rounded-lg border border-emerald-100 cursor-pointer shadow-xs hover:bg-emerald-50/30 transition">
                              <input 
                                type="checkbox"
                                checked={useCashback}
                                onChange={(e) => setUseCashback(e.target.checked)}
                                className="rounded text-emerald-600 focus:ring-emerald-500 w-3.5 h-3.5"
                              />
                              <span className="text-[10px] font-bold text-slate-700">
                                Sim, usar R$ {Math.min(loggedClient.cashbackBalance || 0, cartSubtotal - cartDiscount - pixDiscount).toFixed(2)} de desconto! 🎁
                              </span>
                            </label>
                          ) : (
                            <div className="text-[9.5px] text-slate-500 italic">
                              Você ainda não possui cashback disponível. Esta compra gerará 5% de cashback para o seu próximo pedido! 🌸
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 text-left">
                          <p className="text-[9.5px] text-slate-600 leading-relaxed">
                            Faça login com seu CPF na <strong>Área VIP</strong> (ícone de perfil no topo do site) para visualizar e resgatar seu saldo de Cashback!
                          </p>
                          <button
                            type="button"
                            onClick={() => {
                              setIsCartOpen(false); // Close cart drawer
                              setIsProfileModalOpen(true); // Open login modal
                            }}
                            className="mt-2 text-pink-600 hover:text-pink-700 font-extrabold text-[9px] uppercase tracking-wider flex items-center gap-1 bg-white border border-slate-200 px-2.5 py-1 rounded-md shadow-xs cursor-pointer"
                          >
                            <User size={10} /> Entrar com meu CPF →
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Forma de Pagamento */}
                    <div className="border-t border-slate-100/60 pt-4 space-y-3">
                      <p className="font-extrabold text-[9px] uppercase tracking-wider text-slate-500">Forma de Pagamento Desejada</p>
                      
                      <div className="grid grid-cols-2 gap-2 font-sans font-bold">
                        <button
                          type="button"
                          onClick={() => setPaymentMethod('pix')}
                          className={`py-2 px-2.5 transition rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer border
                            ${paymentMethod === 'pix' 
                              ? 'bg-pink-50 border-pink-550 text-pink-700 font-extrabold ring-1 ring-pink-550/20' 
                              : 'bg-slate-50 border-slate-200 text-slate-650 hover:bg-slate-100'}`}
                        >
                          <QrCode size={13} className={paymentMethod === 'pix' ? "text-pink-600" : "text-slate-400"} />
                          <div className="text-left leading-normal">
                            <span className="block font-extrabold text-[10.5px]">Pagar com PIX</span>
                            <span className="block text-[7.5px] text-emerald-600 font-medium leading-none">Ganhe {pixDiscountPercent}% OFF Extra! ⚡</span>
                          </div>
                        </button>
                        
                        <button
                          type="button"
                          onClick={() => setPaymentMethod('cartao')}
                          className={`py-2 px-2.5 transition rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer border
                            ${paymentMethod === 'cartao' 
                              ? 'bg-pink-50 border-pink-550 text-pink-700 font-extrabold ring-1 ring-pink-550/20' 
                              : 'bg-slate-50 border-slate-200 text-slate-650 hover:bg-slate-100'}`}
                        >
                          <CreditCard size={13} className={paymentMethod === 'cartao' ? "text-pink-600" : "text-slate-400"} />
                          <div className="text-left leading-normal">
                            <span className="block font-extrabold text-[10.5px]">Cartão de Crédito</span>
                            <span className="block text-[7.5px] text-slate-500 font-medium leading-none">Até 6x sem juros 💳</span>
                          </div>
                        </button>
                      </div>

                      {/* Dynamic fields based on payment option selected */}
                      {paymentMethod === 'pix' && (
                        <div className="bg-emerald-50/50 rounded-2xl border border-emerald-100/40 p-3.5 space-y-3 font-sans animate-in fade-in duration-200 text-left">
                          <div className="flex items-start gap-2">
                            <div className="p-1 bg-emerald-100 border border-emerald-200 text-emerald-800 rounded-lg shrink-0">
                              <Sparkles size={11} className="animate-pulse" />
                            </div>
                            <div className="text-left leading-tight">
                              <p className="font-extrabold text-[10px] text-emerald-900 uppercase tracking-wide">Pague Seguro via PIX</p>
                              <p className="text-[9px] text-emerald-700 font-medium">Sua compra foi bonificada com <strong>{pixDiscountPercent}% de desconto extra</strong>! Pague agora de forma segura:</p>
                            </div>
                          </div>

                          <div className="flex flex-col sm:flex-row items-center gap-3 bg-white p-2.5 rounded-xl border border-emerald-100 shadow-xs">
                            {/* Dynamic bank QR Code generator */}
                            <div className="p-1 border border-slate-100 rounded-lg bg-slate-50 shrink-0">
                              <img 
                                src={`https://api.qrserver.com/v1/create-qr-code/?size=110x110&data=${encodeURIComponent(pixPayload)}`}
                                alt="Pix QR Code"
                                className="w-20 h-20 object-contain"
                                referrerPolicy="no-referrer"
                              />
                            </div>
                            <div className="flex-1 w-full text-left space-y-2">
                              <div className="space-y-0.5 leading-snug">
                                <p className="text-[7.5px] font-bold text-slate-400 uppercase tracking-widest font-mono">Chave Pix de Destino</p>
                                <p className="text-[9.5px] font-extrabold text-slate-705 font-mono truncate lowercase">{storePixKey}</p>
                              </div>
                              
                              <div className="space-y-1">
                                <span className="text-[7.5px] font-bold text-slate-400 uppercase tracking-widest block font-mono">PIX Copia e Cola</span>
                                <div className="flex gap-1">
                                  <input 
                                    type="text"
                                    readOnly
                                    value={pixPayload}
                                    className="flex-1 px-2 py-1 bg-slate-50 border border-slate-200 rounded-md text-[9px] font-mono focus:outline-hidden"
                                  />
                                  <button
                                    type="button"
                                    onClick={handleCopyPix}
                                    className="px-2 bg-pink-600 hover:bg-pink-700 text-white font-bold rounded-lg text-[9px] transition cursor-pointer shrink-0 py-1"
                                  >
                                    {isCopiedPix ? "Copiado!" : "Copiar"}
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          <p className="text-[9px] font-medium text-emerald-700 text-center leading-normal">
                            💡 <strong>Como funciona:</strong> Copie o código Pix Copia e Cola acima ou escaneie o QR Code no app do seu banco. Depois, clique abaixo para enviar seu pedido e o comprovante no WhatsApp!
                          </p>
                        </div>
                      )}

                      {paymentMethod === 'cartao' && (
                        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 space-y-3 font-sans animate-in fade-in duration-200 text-left">
                          <div className="bg-white p-3 rounded-xl border border-slate-150 shadow-xs space-y-2.5 relative overflow-hidden">
                            {/* Subtle decorative background micro-chip card overlay */}
                            <div className="absolute right-3 top-3 text-slate-350 opacity-15">
                              <CreditCard size={32} />
                            </div>
                            
                            <p className="font-extrabold text-[9px] uppercase text-slate-700 tracking-wider">Dados do Cartão de Crédito</p>
                            
                            <div className="space-y-2">
                              <div>
                                <label className="text-slate-450 font-bold text-[7.5px] uppercase block tracking-wider mb-0.5">Número do Cartão *</label>
                                <input 
                                  type="text"
                                  required
                                  placeholder="0000 0000 0000 0000"
                                  value={cardNumber}
                                  onChange={(e) => {
                                    const clean = e.target.value.replace(/\D/g, '').slice(0, 16);
                                    const matched = clean.match(/.{1,4}/g);
                                    setCardNumber(matched ? matched.join(' ') : clean);
                                  }}
                                  className="w-full px-2 py-1 bg-slate-50 border border-slate-200 rounded-md text-[10px] font-mono tracking-wider focus:outline-hidden"
                                />
                              </div>

                              <div>
                                <label className="text-slate-450 font-bold text-[7.5px] uppercase block tracking-wider mb-0.5">Nome do Titular *</label>
                                <input 
                                  type="text"
                                  required
                                  placeholder="NOME IMPRESSO NO CARTÃO"
                                  value={cardHolder}
                                  onChange={(e) => setCardHolder(e.target.value.toUpperCase())}
                                  className="w-full px-2 py-1 bg-slate-50 border border-slate-200 rounded-md text-[10px] uppercase placeholder:normal-case font-medium focus:outline-hidden"
                                />
                              </div>

                              <div className="grid grid-cols-2 gap-2">
                                <div>
                                  <label className="text-slate-450 font-bold text-[7.5px] uppercase block tracking-wider mb-0.5">Vencimento (MM/AA) *</label>
                                  <input 
                                    type="text"
                                    required
                                    placeholder="Ex: 12/29"
                                    value={cardExpiry}
                                    onChange={(e) => {
                                      let val = e.target.value.replace(/\D/g, '').slice(0, 4);
                                      if (val.length > 2) {
                                        val = val.slice(0, 2) + '/' + val.slice(2);
                                      }
                                      setCardExpiry(val);
                                    }}
                                    className="w-full px-2 py-1 bg-slate-50 border border-slate-200 rounded-md text-[10px] font-mono tracking-widest focus:outline-hidden"
                                  />
                                </div>
                                <div>
                                  <label className="text-slate-450 font-bold text-[7.5px] uppercase block tracking-wider mb-0.5">Código CVV *</label>
                                  <input 
                                    type="password"
                                    required
                                    placeholder="Ex: 123"
                                    value={cardCvv}
                                    onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
                                    className="w-full px-2 py-1 bg-slate-50 border border-slate-200 rounded-md text-[10px] font-mono tracking-widest focus:outline-hidden"
                                  />
                                </div>
                              </div>

                              <div>
                                <label className="text-slate-450 font-bold text-[7.5px] uppercase block tracking-wider mb-0.5">Condições de Parcelamento *</label>
                                <select
                                  value={cardInstallments}
                                  onChange={(e) => setCardInstallments(e.target.value)}
                                  className="w-full px-2 py-1 bg-slate-50 border border-slate-200 rounded-md text-[10px] font-bold text-slate-700 focus:outline-hidden cursor-pointer"
                                >
                                  <option value="1">1x de R$ {cartTotal.toFixed(2)} (Sem Juros)</option>
                                  {cartTotal >= 60 && <option value="2">2x de R$ {(cartTotal / 2).toFixed(2)} (Sem Juros)</option>}
                                  {cartTotal >= 90 && <option value="3">3x de R$ {(cartTotal / 3).toFixed(2)} (Sem Juros)</option>}
                                  {cartTotal >= 120 && <option value="4">4x de R$ {(cartTotal / 4).toFixed(2)} (Sem Juros)</option>}
                                  {cartTotal >= 150 && <option value="5">5x de R$ {(cartTotal / 5).toFixed(2)} (Sem Juros)</option>}
                                  {cartTotal >= 180 && <option value="6">6x de R$ {(cartTotal / 6).toFixed(2)} (Sem Juros)</option>}
                                </select>
                              </div>
                            </div>
                          </div>
                          
                          <p className="text-[8.5px] font-medium text-slate-550 text-center leading-normal">
                            🔒 Seus dados de cartão são protegidos via gateway seguro SSL 256 bits. A transação é faturada imediatamente ao submeter.
                          </p>
                        </div>
                      )}
                    </div>

                  </div>
                </div>
              )}

            </div>

            {/* Total order overview calculation and WhatsApp ordering */}
            {cart.length > 0 && (
              <div className="border-t border-slate-100 pt-4 mt-6 space-y-3">
                {isVipRegisteredJustNow && (
                  <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-3.5 rounded-2xl space-y-1.5 animate-in fade-in duration-300">
                    <p className="font-bold text-[11px] uppercase tracking-wide flex items-center gap-1 text-emerald-800">
                      <span>🎉</span>
                      <span>Cadastro Sincronizado no Sistema!</span>
                    </p>
                    <p className="text-[10px] text-emerald-700 font-medium leading-relaxed">
                      {vipMessage}
                    </p>
                  </div>
                )}

                <div className="space-y-1 text-slate-600 text-xs font-sans">
                  <div className="flex justify-between">
                    <span>Subtotal das Peças:</span>
                    <span className="font-bold text-slate-800">R$ {cartSubtotal.toFixed(2)}</span>
                  </div>
                  
                  {appliedCoupon && (
                    <div className="flex justify-between text-rose-600 font-bold">
                      <span>Desconto Especial ({appliedCoupon.code}):</span>
                      <span>-R$ {cartDiscount.toFixed(2)}</span>
                    </div>
                  )}

                  {paymentMethod === 'pix' && pixDiscount > 0 && (
                    <div className="flex justify-between text-emerald-600 font-bold">
                      <span>Desconto Extra Pix ({pixDiscountPercent}% OFF):</span>
                      <span>-R$ {pixDiscount.toFixed(2)}</span>
                    </div>
                  )}

                  {useCashback && cashbackDiscount > 0 && (
                    <div className="flex justify-between text-emerald-600 font-bold">
                      <span>Desconto Cashback VIP:</span>
                      <span>-R$ {cashbackDiscount.toFixed(2)}</span>
                    </div>
                  )}

                  <div className="flex justify-between">
                    <span>Taxa de Envio:</span>
                    <span className="font-bold text-slate-800">{deliveryMethod === 'combinar' ? "A combinar 🤝" : (deliveryFee === 0 ? "GRÁTIS 🚚" : `R$ ${deliveryFee.toFixed(2)}`)}</span>
                  </div>

                  <div className="flex justify-between text-slate-905 font-bold text-sm pt-2 border-t border-slate-100">
                    <span>Total da Encomenda:</span>
                    <span className="text-pink-600 text-base font-extrabold font-mono">R$ {cartTotal.toFixed(2)}</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleCheckoutWhatsApp}
                  className="w-full py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-2 shadow-md shadow-green-500/15 cursor-pointer active:scale-97 border-none"
                >
                  <MessageCircle size={15} />
                  <span>Confirmar & Pedir via WhatsApp</span>
                </button>
              </div>
            )}

          </div>

        </div>
      )}

      </div>

      {/* 10. Floating Banner / Popup Card */}
      {floatingBanner.show && !isFloatingDismissed && (
        <div className="fixed bottom-6 right-6 z-[60] max-w-sm w-80 bg-white border border-rose-100 rounded-3xl p-4 shadow-2xl shadow-pink-600/15 animate-bounce-subtle font-sans transition-all duration-300">
          <button 
            type="button"
            onClick={() => setIsFloatingDismissed(true)}
            className="absolute top-3 right-3 text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-1.5 rounded-full transition cursor-pointer border-none bg-transparent flex items-center justify-center h-6 w-6"
          >
            <X size={12} />
          </button>
          
          <div className="space-y-3 font-sans mt-1">
            {floatingBanner.image && (
              <img 
                src={floatingBanner.image} 
                className="w-full h-28 object-cover rounded-2xl" 
                alt="Banner Promocional"
                referrerPolicy="no-referrer"
              />
            )}
            <div className="space-y-1 text-left font-sans">
              <span className="text-[8px] font-extrabold tracking-wider uppercase px-2 py-0.5 rounded-full" style={{ backgroundColor: `${floatingBanner.bgColor}15`, color: floatingBanner.bgColor }}>
                Campanha Ativa
              </span>
              <h4 className="text-xs font-extrabold text-slate-800 pt-1 tracking-tight">{floatingBanner.title}</h4>
              <p className="text-[10px] text-slate-500 font-medium leading-normal">{floatingBanner.subtitle}</p>
            </div>
            
            {floatingBanner.ctaLink && (
              <a 
                href={floatingBanner.ctaLink}
                target="_blank"
                rel="noopener noreferrer"
                className="block text-center py-2 px-4 rounded-xl text-[10px] font-bold text-white transition hover:opacity-90 tracking-wide border-none"
                style={{ backgroundColor: floatingBanner.bgColor }}
              >
                {floatingBanner.ctaText || "Aproveitar"}
              </a>
            )}
          </div>
        </div>
      )}

      {/* 11. Profile Modal / Clube VIP e Cashback */}
      {isProfileModalOpen && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center z-[100] p-4 text-[11px] md:text-xs">
          <div className="bg-white max-w-md w-full rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col font-sans text-slate-800">
            
            {/* Header */}
            <div className="bg-pink-600 text-white p-5 flex justify-between items-center relative">
              <div className="flex items-center gap-2">
                <Gift size={18} className="animate-bounce" />
                <div>
                  <h3 className="font-extrabold text-sm md:text-base tracking-tight uppercase">Clube VIP & Cashback 🌸</h3>
                  <p className="text-[10px] text-pink-100 font-medium">Consulte seu saldo de fidelidade e acelere seus looks fitness</p>
                </div>
              </div>
              <button 
                type="button"
                onClick={() => {
                  setIsProfileModalOpen(false);
                  setLoginError('');
                }}
                className="p-1.5 bg-pink-700/50 hover:bg-pink-850/80 rounded-full transition text-white border-none cursor-pointer"
              >
                <X size={15} />
              </button>
            </div>

            {/* Content body */}
            <div className="p-6 space-y-4 text-left">
              {loggedClient ? (
                // LOGGED VIP VIEW
                <div className="space-y-4">
                  <div className="bg-pink-50/40 border border-pink-100 rounded-2xl p-4 space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-pink-600 text-white flex items-center justify-center font-black text-sm">
                        {loggedClient.name.split(' ')[0][0].toUpperCase()}
                      </div>
                      <div>
                        <h4 className="font-black text-slate-850 text-sm leading-tight">{loggedClient.name}</h4>
                        <span className="bg-emerald-100 text-emerald-800 text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider block w-max mt-0.5">
                          Membro do Clube VIP 👑
                        </span>
                      </div>
                    </div>

                    <div className="border-t border-pink-100/50 pt-3 grid grid-cols-2 gap-3 text-slate-650 text-[10px]">
                      <div>
                        <span className="block text-slate-400 font-bold uppercase text-[8px]">Pedidos Realizados</span>
                        <strong className="text-slate-800 text-xs font-mono">{loggedClient.ordersCount || 1} compras</strong>
                      </div>
                      <div>
                        <span className="block text-slate-400 font-bold uppercase text-[8px]">Investimento Acumulado</span>
                        <strong className="text-slate-800 text-xs font-mono">R$ {(loggedClient.totalSpent || 0).toFixed(2)}</strong>
                      </div>
                    </div>
                  </div>

                  {/* Cashback Display Card */}
                  <div className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white rounded-2xl p-5 shadow-md shadow-emerald-500/10 flex items-center justify-between relative overflow-hidden">
                    <div className="absolute right-2 -bottom-2 opacity-10 pointer-events-none transform rotate-12">
                      <Gift size={96} />
                    </div>
                    <div className="space-y-1 relative z-10">
                      <span className="text-[9px] font-extrabold tracking-wider uppercase bg-white/20 px-2 py-0.5 rounded-full block w-max">
                        Seu Saldo Disponível
                      </span>
                      <h3 className="text-2xl font-black font-mono tracking-tight pt-1">
                        R$ {(loggedClient.cashbackBalance || 0).toFixed(2)}
                      </h3>
                      <p className="text-[9px] text-emerald-100 leading-normal max-w-[220px]">
                        Insira itens na sacola para resgatar seu saldo como desconto no Checkout!
                      </p>
                    </div>
                    <div className="bg-white/10 p-2.5 rounded-xl border border-white/10 flex items-center justify-center">
                      <span className="text-xl">💰</span>
                    </div>
                  </div>

                  <p className="text-[9px] text-slate-400 text-center leading-normal">
                    Fidelidade garantida: 5% de cashback sobre o valor pago é devolvido em cada nova compra concluída!
                  </p>

                  <div className="flex gap-2.5 pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setIsProfileModalOpen(false);
                        setIsCartOpen(true);
                      }}
                      className="flex-1 py-2.5 bg-slate-900 hover:bg-slate-950 text-white rounded-xl text-xs font-bold transition text-center cursor-pointer border-none shadow-sm"
                    >
                      Ver Minha Sacola
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setLoggedClient(null);
                        setUseCashback(false);
                      }}
                      className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-800 rounded-xl text-xs font-bold transition text-center cursor-pointer border-none"
                    >
                      Sair da Conta
                    </button>
                  </div>
                </div>
              ) : (
                // LOGIN FORM VIEW
                <div className="space-y-4 font-sans">
                  <p className="text-slate-600 text-[10.5px] leading-relaxed">
                    Bem-vinda ao seu espaço exclusivo de fidelidade! Insira o seu <strong>CPF cadastrado</strong> para acessar seu saldo de cashback e preencher o checkout de forma instantânea.
                  </p>
                  
                  <div className="space-y-1.5">
                    <label className="text-slate-500 font-bold text-[9px] uppercase tracking-wider block">Insira seu CPF *</label>
                    <input 
                      type="text"
                      required
                      placeholder="000.000.000-00"
                      value={loginCpf}
                      onChange={(e) => setLoginCpf(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-pink-500 font-medium font-mono tracking-wide"
                    />
                  </div>

                  {loginError && (
                    <div className="bg-rose-50 border border-rose-100 text-rose-700 p-2.5 rounded-xl text-[9.5px] font-bold leading-normal">
                      ⚠ {loginError}
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      const cleaned = loginCpf.replace(/\D/g, '');
                      if (!cleaned) {
                        setLoginError('Por favor, informe seu CPF.');
                        return;
                      }
                      const found = (clients || []).find(c => c.cpf && c.cpf.replace(/\D/g, '') === cleaned);
                      if (found) {
                        setLoggedClient(found);
                        setClientName(found.name);
                        setClientPhone(found.phone || found.whatsapp || '');
                        setClientEmail(found.email || '');
                        setClientCpf(found.cpf || '');
                        setClientBirthDate(found.birthDate || '');
                        setAddressStreet(found.addressStreet || '');
                        setAddressNum(found.addressNum || '');
                        setAddressComp(found.addressComp || '');
                        setAddressBairro(found.addressBairro || '');
                        setAddressCidade(found.addressCidade || '');
                        setAddressEstado(found.addressEstado || '');
                        setAddressCep(found.addressCep || '');
                        setLoginError('');
                      } else {
                        setLoginError('CPF não localizado em nosso Clube VIP. Cadastre-se efetuando sua primeira compra!');
                      }
                    }}
                    className="w-full py-2.5 bg-pink-600 hover:bg-pink-700 text-white font-extrabold text-xs rounded-xl shadow-md shadow-pink-500/10 transition-all cursor-pointer border-none flex items-center justify-center gap-1.5 font-sans"
                  >
                    <span>Entrar no Clube VIP</span>
                  </button>

                  <div className="border-t border-slate-100 pt-3 text-center">
                    <span className="text-[9.5px] text-slate-450 leading-normal block">
                      Ainda não comprou conosco? Não se preocupe! Ao realizar seu primeiro pedido, você será cadastrada automaticamente e já acumulará <strong>5% de cashback</strong> para as próximas compras. ✨
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 12. Public Sidebar Category Drawer */}
      {isMenuDrawerOpen && (
        <div 
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-[150] transition-opacity duration-300 animate-in fade-in"
          onClick={() => setIsMenuDrawerOpen(false)}
        >
          <div 
            className="fixed inset-y-0 left-0 w-80 max-w-[90%] bg-white shadow-2xl flex flex-col z-[160] animate-in slide-in-from-left duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drawer Header */}
            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-pink-50/20">
              <div className="flex flex-col">
                <span className="font-serif italic text-lg font-bold text-slate-950">
                  {storeName}
                </span>
                <span className="text-[8px] font-bold uppercase tracking-widest mt-0.5" style={{ color: themeColor }}>
                  {storeSub}
                </span>
              </div>
              <button 
                type="button"
                onClick={() => setIsMenuDrawerOpen(false)}
                className="p-1.5 bg-slate-100 hover:bg-slate-200 rounded-full transition text-slate-700 cursor-pointer border-none"
              >
                <X size={16} />
              </button>
            </div>

            {/* Categories Navigation */}
            <div className="p-6 flex-1 overflow-y-auto space-y-6">
              <div className="space-y-3">
                <p className="font-extrabold text-[10px] uppercase tracking-wider text-slate-400">Navegar por Categorias</p>
                <div className="space-y-1">
                  {categoriesList.map(cat => {
                    const isSelected = selectedCategory === cat;
                    return (
                      <button
                        key={`menu-cat-${cat}`}
                        onClick={() => {
                          setSelectedCategory(cat);
                          setIsMenuDrawerOpen(false);
                          // Scroll to catalog section if needed
                          const section = document.getElementById('search-catalog-bar');
                          if (section) {
                            section.scrollIntoView({ behavior: 'smooth', block: 'start' });
                          }
                        }}
                        className={`w-full px-4 py-3 rounded-2xl text-xs font-bold transition-all text-left flex items-center justify-between cursor-pointer border border-transparent
                          ${isSelected 
                            ? 'bg-pink-600 text-white shadow-md shadow-pink-500/10' 
                            : 'bg-slate-50 text-slate-700 hover:bg-slate-100/80 active:bg-slate-200/50'}`}
                        style={isSelected ? { backgroundColor: themeColor } : {}}
                      >
                        <span className="flex items-center gap-2">
                          {cat === 'Todos' ? '🌸' : '⚡'} {cat}
                        </span>
                        <ChevronRight size={14} className={isSelected ? 'text-white' : 'text-slate-400'} />
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Quick advantages */}
              <div className="border-t border-slate-100 pt-5 space-y-4 text-[11px] text-slate-500 font-medium">
                <p className="font-extrabold text-[10px] uppercase tracking-wider text-slate-400 block">Vantagens da Loja</p>
                
                <div className="flex items-center gap-2.5">
                  <span className="text-base">🚚</span>
                  <span>Frete Grátis acima de R$ 399</span>
                </div>
                
                <div className="flex items-center gap-2.5">
                  <span className="text-base">💳</span>
                  <span>Até 6x Sem Juros no Cartão</span>
                </div>

                <div className="flex items-center gap-2.5">
                  <span className="text-base">👑</span>
                  <span>Ganhe 5% de Cashback VIP</span>
                </div>

                <div className="flex items-center gap-2.5">
                  <span className="text-base">🔒</span>
                  <span>Compra 100% Protegida</span>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-slate-100 bg-slate-50 text-[10px] text-slate-400 text-center">
              <span>{storeName} • Todos os direitos reservados.</span>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
