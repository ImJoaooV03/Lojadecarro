import React, { useState, useEffect, useRef } from 'react';
import { 
  Send, Bot, User, Sparkles, Save, Loader2, Globe, 
  Monitor, Smartphone, RefreshCw, Zap, CheckCircle,
  ArrowRight, Search, Phone, MapPin, Star, Menu, X, Trash2,
  Layout, Type, Palette
} from 'lucide-react';
import { supabase, type SiteConfig, type ChatMessage } from '../lib/supabase';
import { cn, getSafeTextColor, formatCurrency } from '../lib/utils';
import { Modal } from '../components/Shared/Modal';

// --- MOCK DATA PARA O PREVIEW ---
const MOCK_VEHICLES = [
  { id: 1, make: 'BMW', model: '320i', version: 'M Sport', price: 329900, year: 2024, image: 'https://images.unsplash.com/photo-1555215695-3004980adade?auto=format&fit=crop&w=800&q=80' },
  { id: 2, make: 'Porsche', model: 'Macan', version: 'GTS', price: 680000, year: 2023, image: 'https://images.unsplash.com/photo-1503376763036-066120622c74?auto=format&fit=crop&w=800&q=80' },
  { id: 3, make: 'Audi', model: 'RS6', version: 'Avant', price: 1150000, year: 2024, image: 'https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?auto=format&fit=crop&w=800&q=80' },
  { id: 4, make: 'Mercedes', model: 'C300', version: 'AMG Line', price: 389900, year: 2023, image: 'https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&w=800&q=80' }
];

// --- RENDERIZADOR DO TEMA (PREVIEW) ---
const ThemeRenderer = ({ config }: { config: SiteConfig }) => {
  const isLuxury = config.template_id === 'luxury';
  const isSport = config.template_id === 'sport';
  const isBold = config.template_id === 'bold';
  const isMinimal = config.template_id === 'minimal';
  
  // Base Styles
  const bgBase = isLuxury ? 'bg-slate-950' : isBold ? 'bg-slate-50' : 'bg-white';
  const textBase = isLuxury ? 'text-slate-100' : 'text-slate-900';
  const textMuted = isLuxury ? 'text-slate-400' : 'text-slate-500';
  const cardBg = isLuxury ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100';
  
  // Dynamic Colors
  const accentColorClass = getSafeTextColor(config.primary_color);
  
  const btnClass = cn(
    "px-6 py-3 font-bold transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center justify-center gap-2",
    config.button_color,
    config.border_radius,
    isSport && "-skew-x-12 uppercase tracking-wider",
    isMinimal && "shadow-none border border-current bg-transparent hover:bg-slate-900 hover:text-white hover:border-transparent"
  );

  return (
    <div className={cn("w-full min-h-full flex flex-col font-sans transition-all duration-500", bgBase, textBase, config.font_family === 'serif' && 'font-serif', config.font_family === 'mono' && 'font-mono')}>
      {/* Header */}
      <header className={cn("sticky top-0 z-30 border-b backdrop-blur-md transition-colors duration-300", isLuxury ? "bg-slate-950/90 border-slate-800" : "bg-white/90 border-slate-100")}>
        <div className="px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {/* Logo Simulado */}
            <div className={cn("w-8 h-8 flex items-center justify-center font-bold text-white shadow-sm", config.primary_color, config.border_radius)}>
               {config.hero_title ? config.hero_title.substring(0, 2).toUpperCase() : 'AP'}
            </div>
            <span className={cn("text-lg font-bold tracking-tight", isLuxury ? "text-white" : "text-slate-900")}>
              {config.hero_title}
            </span>
          </div>
          <nav className="hidden md:flex gap-6 text-xs font-bold uppercase tracking-wider">
            <span className={cn("cursor-pointer hover:opacity-70 transition-colors", accentColorClass)}>Home</span>
            {config.show_inventory && <span className="cursor-pointer hover:opacity-70 transition-colors">Estoque</span>}
            {config.show_about && <span className="cursor-pointer hover:opacity-70 transition-colors">Sobre</span>}
          </nav>
          <button className={cn("text-xs text-white", btnClass, "py-2 px-4", isMinimal && "text-slate-900 border-slate-900")}>
            <span className={cn(isSport && "skew-x-12 inline-block")}>Fale Conosco</span>
          </button>
        </div>
      </header>

      {/* Hero */}
      {config.show_hero && (
        <section className="relative group overflow-hidden">
          <div className={cn("relative h-[450px] w-full overflow-hidden transition-all duration-500", config.border_radius === 'rounded-3xl' && "m-4 rounded-3xl h-[400px] w-auto shadow-2xl")}>
            <img 
              src={config.banner_url || "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=1200&q=80"} 
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
            />
            <div className={cn("absolute inset-0 transition-colors duration-500", isLuxury ? "bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent" : "bg-gradient-to-r from-black/80 via-black/40 to-transparent")} />
            
            <div className="absolute inset-0 flex items-center px-8 md:px-12">
              <div className="max-w-lg animate-in slide-in-from-left duration-700">
                <span className={cn("inline-block px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-[10px] font-bold text-white mb-4 uppercase tracking-wider")}>
                  O Melhor Estoque da Região
                </span>
                <h1 className={cn("text-4xl md:text-6xl font-bold text-white mb-6 leading-tight drop-shadow-lg", isLuxury && "font-serif tracking-wide", isBold && "uppercase font-black")}>
                  {config.hero_title}
                </h1>
                <p className="text-slate-200 text-sm md:text-lg mb-8 max-w-sm leading-relaxed opacity-90 drop-shadow-md">
                  {config.hero_subtitle}
                </p>
                <div className="flex gap-3">
                  <button className={cn("text-white", btnClass)}>
                    <span className={cn(isSport && "skew-x-12 inline-block")}>Ver Estoque</span>
                  </button>
                  {isLuxury && (
                    <button className="px-6 py-3 font-bold text-white border border-white/30 hover:bg-white/10 transition-all rounded-sm backdrop-blur-sm">
                      Agendar Visita
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Features (Opcional) */}
      {config.show_features && (
        <section className="py-12 px-6">
          <div className="grid grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className={cn("p-4 rounded-xl flex flex-col items-center text-center gap-2", isLuxury ? "bg-slate-900 border border-slate-800" : "bg-slate-50 border border-slate-100")}>
                <div className={cn("w-10 h-10 rounded-full flex items-center justify-center", config.primary_color, "text-white shadow-md")}>
                  <Star className="w-5 h-5" />
                </div>
                <h3 className={cn("font-bold text-sm", textBase)}>Qualidade</h3>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Inventory Grid */}
      {config.show_inventory && (
        <section className="py-12 px-6 flex-1">
          <div className="flex justify-between items-end mb-8">
            <div>
              <h2 className={cn("text-2xl font-bold mb-2", isLuxury && "font-serif")}>Destaques</h2>
              <div className={cn("h-1 w-12 rounded-full", config.primary_color)}></div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {MOCK_VEHICLES.map((car) => (
              <div key={car.id} className={cn("group overflow-hidden transition-all duration-300", cardBg, config.border_radius, isLuxury ? "hover:shadow-amber-900/10" : "hover:shadow-xl")}>
                <div className="relative aspect-[16/10] overflow-hidden">
                  <img src={car.image} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                  <div className={cn("absolute top-3 right-3 px-3 py-1 text-[10px] font-bold shadow-sm", isLuxury ? "bg-slate-950 text-amber-500 border border-amber-900/30" : "bg-white text-slate-900", config.border_radius)}>
                    {car.year}
                  </div>
                </div>
                <div className="p-5">
                  <h3 className={cn("text-lg font-bold mb-1", isLuxury && "font-serif tracking-wide")}>{car.make} {car.model}</h3>
                  <p className={cn("text-xs mb-4 uppercase tracking-wider font-medium", textMuted)}>{car.version}</p>
                  <div className={cn("flex items-center justify-between pt-4 border-t", isLuxury ? "border-slate-800" : "border-slate-100")}>
                    <span className={cn("text-xl font-bold", accentColorClass)}>{formatCurrency(car.price)}</span>
                    <button className={cn("w-8 h-8 flex items-center justify-center rounded-full transition-colors", isLuxury ? "bg-slate-800 hover:bg-amber-600 hover:text-white" : "bg-slate-100 hover:bg-slate-900 hover:text-white")}>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

// --- LÓGICA DE IA APRIMORADA ---
const processAiCommand = (prompt: string, currentConfig: SiteConfig): { newConfig: SiteConfig, response: string } => {
  const lowerPrompt = prompt.toLowerCase();
  let newConfig = { ...currentConfig };
  let response = "Entendi! Apliquei as alterações.";

  // --- 1. COMANDOS DE TEMA (PRESETS) ---
  if (lowerPrompt.includes('luxo') || lowerPrompt.includes('premium') || lowerPrompt.includes('sofisticado')) {
    newConfig.template_id = 'luxury';
    newConfig.primary_color = 'bg-amber-500';
    newConfig.button_color = 'bg-amber-600';
    newConfig.font_family = 'serif';
    newConfig.border_radius = 'rounded-sm';
    response = "Apliquei o tema Luxo (Elite). Tons escuros, dourado e fontes serifadas.";
  } 
  else if (lowerPrompt.includes('moderno') || lowerPrompt.includes('tech') || lowerPrompt.includes('clean')) {
    newConfig.template_id = 'modern';
    newConfig.primary_color = 'bg-indigo-600';
    newConfig.button_color = 'bg-indigo-600';
    newConfig.font_family = 'sans';
    newConfig.border_radius = 'rounded-2xl';
    response = "Apliquei o tema Moderno. Visual limpo, arredondado e cores vibrantes.";
  } 
  else if (lowerPrompt.includes('esportivo') || lowerPrompt.includes('agressivo') || lowerPrompt.includes('rápido')) {
    newConfig.template_id = 'sport';
    newConfig.primary_color = 'bg-red-600';
    newConfig.button_color = 'bg-red-600';
    newConfig.font_family = 'sans';
    newConfig.border_radius = 'rounded-none';
    response = "Tema Esportivo ativado! Ângulos retos e cores quentes.";
  }
  else if (lowerPrompt.includes('minimalista') || lowerPrompt.includes('simples')) {
    newConfig.template_id = 'minimal';
    newConfig.primary_color = 'bg-slate-900';
    newConfig.button_color = 'bg-slate-900';
    newConfig.font_family = 'sans';
    newConfig.border_radius = 'rounded-lg';
    response = "Tema Minimalista. Foco total no conteúdo, sem distrações.";
  }
  // --- COMANDOS GENÉRICOS DE "NOVO DESIGN" ---
  else if (
    lowerPrompt.includes('novo design') || 
    lowerPrompt.includes('refazer') || 
    lowerPrompt.includes('criar site') || 
    lowerPrompt.includes('mudar tudo') ||
    lowerPrompt.includes('surpreenda')
  ) {
    const presets = [
      { id: 'luxury', color: 'bg-amber-500', font: 'serif', radius: 'rounded-sm', msg: 'Criei um design Luxuoso e exclusivo.' },
      { id: 'modern', color: 'bg-indigo-600', font: 'sans', radius: 'rounded-2xl', msg: 'Gerei um design Moderno e limpo.' },
      { id: 'sport', color: 'bg-red-600', font: 'sans', radius: 'rounded-none', msg: 'Apliquei um visual Esportivo.' },
      { id: 'bold', color: 'bg-slate-900', font: 'sans', radius: 'rounded-xl', msg: 'Apliquei um tema Bold de alto impacto.' }
    ];
    // Evita repetir o mesmo tema
    const availablePresets = presets.filter(p => p.id !== currentConfig.template_id);
    const randomPreset = availablePresets[Math.floor(Math.random() * availablePresets.length)] || presets[0];
    
    newConfig.template_id = randomPreset.id as any;
    newConfig.primary_color = randomPreset.color;
    newConfig.button_color = randomPreset.color;
    newConfig.font_family = randomPreset.font as any;
    newConfig.border_radius = randomPreset.radius;
    response = randomPreset.msg;
  }

  // --- 2. CORES ---
  if (lowerPrompt.includes('azul')) {
    newConfig.primary_color = 'bg-blue-600';
    newConfig.button_color = 'bg-blue-600';
    response = "Mudei a cor principal para Azul.";
  } else if (lowerPrompt.includes('vermelho')) {
    newConfig.primary_color = 'bg-red-600';
    newConfig.button_color = 'bg-red-600';
    response = "Mudei a cor principal para Vermelho.";
  } else if (lowerPrompt.includes('verde')) {
    newConfig.primary_color = 'bg-emerald-600';
    newConfig.button_color = 'bg-emerald-600';
    response = "Mudei a cor principal para Verde.";
  } else if (lowerPrompt.includes('roxo') || lowerPrompt.includes('violeta')) {
    newConfig.primary_color = 'bg-violet-600';
    newConfig.button_color = 'bg-violet-600';
    response = "Mudei a cor principal para Violeta.";
  } else if (lowerPrompt.includes('laranja') || lowerPrompt.includes('amber') || lowerPrompt.includes('dourado')) {
    newConfig.primary_color = 'bg-amber-500';
    newConfig.button_color = 'bg-amber-600';
    response = "Mudei a cor principal para Dourado/Laranja.";
  } else if (lowerPrompt.includes('preto') || lowerPrompt.includes('escuro')) {
    newConfig.primary_color = 'bg-slate-900';
    newConfig.button_color = 'bg-slate-900';
    response = "Mudei a cor principal para Preto/Escuro.";
  } else if (lowerPrompt.includes('rosa') || lowerPrompt.includes('pink')) {
    newConfig.primary_color = 'bg-pink-600';
    newConfig.button_color = 'bg-pink-600';
    response = "Mudei a cor principal para Rosa.";
  }

  // --- 3. FONTES E FORMAS ---
  if (lowerPrompt.includes('arredondado') || lowerPrompt.includes('redondo')) {
    newConfig.border_radius = 'rounded-3xl';
    response = "Aumentei o arredondamento das bordas.";
  } else if (lowerPrompt.includes('quadrado') || lowerPrompt.includes('reto')) {
    newConfig.border_radius = 'rounded-none';
    response = "Removi o arredondamento das bordas.";
  }
  
  if (lowerPrompt.includes('serifa') || lowerPrompt.includes('clássica')) {
    newConfig.font_family = 'serif';
    response = "Alterei a fonte para Serifa (Clássica).";
  } else if (lowerPrompt.includes('sans') || lowerPrompt.includes('moderna')) {
    newConfig.font_family = 'sans';
    response = "Alterei a fonte para Sans-Serif (Moderna).";
  }

  // --- 4. CONTEÚDO (TÍTULO) ---
  if (lowerPrompt.includes('título') || lowerPrompt.includes('nome')) {
    const match = prompt.match(/["']([^"']+)["']/); // Pega texto entre aspas
    if (match && match[1]) {
      newConfig.hero_title = match[1];
      response = `Atualizei o título para "${match[1]}".`;
    }
  }
  
  // --- 5. VISIBILIDADE ---
  if (lowerPrompt.includes('esconder') || lowerPrompt.includes('ocultar') || lowerPrompt.includes('remover')) {
    if (lowerPrompt.includes('banner') || lowerPrompt.includes('hero')) {
      newConfig.show_hero = false;
      response = "Ocultei o banner principal.";
    } else if (lowerPrompt.includes('estoque') || lowerPrompt.includes('veículos')) {
      newConfig.show_inventory = false;
      response = "Ocultei a seção de estoque.";
    } else if (lowerPrompt.includes('sobre')) {
      newConfig.show_about = false;
      response = "Ocultei a seção Sobre.";
    }
  } else if (lowerPrompt.includes('mostrar') || lowerPrompt.includes('exibir') || lowerPrompt.includes('adicionar')) {
    if (lowerPrompt.includes('banner') || lowerPrompt.includes('hero')) {
      newConfig.show_hero = true;
      response = "Exibi o banner principal.";
    } else if (lowerPrompt.includes('estoque') || lowerPrompt.includes('veículos')) {
      newConfig.show_inventory = true;
      response = "Exibi a seção de estoque.";
    }
  }

  return { newConfig, response };
};

// --- COMPONENT PRINCIPAL ---

export default function WebsiteEditor() {
  // Config State
  const [config, setConfig] = useState<SiteConfig>({
    template_id: 'modern',
    primary_color: 'bg-indigo-600',
    button_color: 'bg-indigo-600',
    font_family: 'sans',
    border_radius: 'rounded-xl',
    hero_title: 'AutoPremium Motors',
    hero_subtitle: 'Os melhores veículos da região estão aqui.',
    contact_phone: '(11) 99999-9999',
    contact_address: 'Av. Principal, 1000',
    social_instagram: '@autopremium',
    show_hero: true,
    show_features: true,
    show_inventory: true,
    show_about: true,
    style_overrides: {},
    chat_history: []
  });

  const [inputValue, setInputValue] = useState('');
  const [isAiProcessing, setIsAiProcessing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // App State
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [viewMode, setViewMode] = useState<'desktop' | 'mobile'>('desktop');
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);

  // Scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => { scrollToBottom(); }, [config.chat_history, isAiProcessing]);

  // Load Initial Config
  useEffect(() => {
    const fetchConfig = async () => {
      setLoading(true);
      try {
        const { data } = await supabase.from('site_configs').select('*').limit(1);
        if (data && data.length > 0) {
          // Garante que chat_history seja um array
          const loadedConfig = data[0];
          if (!Array.isArray(loadedConfig.chat_history)) {
            loadedConfig.chat_history = [];
          }
          setConfig(prev => ({ ...prev, ...loadedConfig }));
        } else {
          // Se não tiver config, adiciona mensagem inicial
          setConfig(prev => ({
            ...prev,
            chat_history: [{
              id: 'init',
              role: 'ai',
              content: 'Olá! Sou seu assistente de design. Como você quer que o site da sua loja fique hoje? (Ex: "Faça um novo design moderno" ou "Mude a cor para vermelho")',
              timestamp: Date.now()
            }]
          }));
        }
      } catch (error) {
        console.error("Erro ao carregar config:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchConfig();
  }, []);

  // Handle Send Message
  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputValue.trim() || isAiProcessing) return;

    const userText = inputValue;
    setInputValue('');
    setIsAiProcessing(true);

    // 1. Add User Message Locally
    const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', content: userText, timestamp: Date.now() };
    const tempHistory = [...(config.chat_history || []), userMsg];
    
    setConfig(prev => ({ ...prev, chat_history: tempHistory }));

    // 2. Process AI (Simulated Delay)
    setTimeout(async () => {
      const { newConfig, response } = processAiCommand(userText, config);
      
      const aiMsg: ChatMessage = { id: (Date.now() + 1).toString(), role: 'ai', content: response, timestamp: Date.now() };
      const finalHistory = [...tempHistory, aiMsg];

      const finalConfig = { ...newConfig, chat_history: finalHistory };
      
      // 3. Update Local State (Live Preview)
      setConfig(finalConfig);
      setIsAiProcessing(false);

      // 4. Auto-Save to DB
      try {
        const { data: dealerships } = await supabase.from('dealerships').select('id').limit(1);
        const dealershipId = dealerships?.[0]?.id;
        
        // Se não tiver dealership, tenta criar uma default (fallback para demo)
        let finalDealerId = dealershipId;
        if (!finalDealerId) {
            const { data: newDealer } = await supabase.from('dealerships').insert({ name: 'Minha Loja' }).select().single();
            finalDealerId = newDealer?.id;
        }

        if (finalDealerId) {
          const payload = { ...finalConfig, dealership_id: finalDealerId, updated_at: new Date().toISOString() };
          
          if (config.id) {
            await supabase.from('site_configs').update(payload).eq('id', config.id);
          } else {
            const { data: inserted } = await supabase.from('site_configs').insert(payload).select().single();
            if (inserted) setConfig(prev => ({ ...prev, id: inserted.id }));
          }
        }
      } catch (err) {
        console.error("Auto-save failed", err);
      }

    }, 1000);
  };

  // Manual Save (Publish)
  const handlePublish = async () => {
    setSaving(true);
    try {
      const { data: dealerships } = await supabase.from('dealerships').select('id').limit(1);
      const dealershipId = dealerships?.[0]?.id;
      
      if (!dealershipId) throw new Error("Loja não encontrada");

      const payload = { ...config, dealership_id: dealershipId, updated_at: new Date().toISOString() };

      if (config.id) {
        await supabase.from('site_configs').update(payload).eq('id', config.id);
      } else {
        await supabase.from('site_configs').insert(payload);
      }
      
      setTimeout(() => {
        setSaving(false);
        setIsSuccessModalOpen(true);
      }, 800);
    } catch (error) {
      console.error(error);
      setSaving(false);
      alert('Erro ao publicar site.');
    }
  };

  const handleClearChat = async () => {
    if(confirm("Limpar histórico do chat?")) {
       const clearedConfig = { 
         ...config, 
         chat_history: [{
            id: Date.now().toString(),
            role: 'ai',
            content: 'Histórico limpo. Como posso ajudar agora?',
            timestamp: Date.now()
         } as ChatMessage] 
       };
       setConfig(clearedConfig);
       // Sync DB
       if (config.id) {
         await supabase.from('site_configs').update({ chat_history: clearedConfig.chat_history }).eq('id', config.id);
       }
    }
  };

  return (
    <div className="h-[calc(100vh-2rem)] flex flex-col gap-4 overflow-hidden">
      
      {/* Success Modal */}
      {isSuccessModalOpen && (
        <Modal isOpen={true} onClose={() => setIsSuccessModalOpen(false)} title="Site Publicado!">
          <div className="text-center p-6">
            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
              <CheckCircle className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Sucesso!</h2>
            <p className="text-slate-500 mb-6">Seu site foi atualizado e já está disponível online.</p>
            <div className="flex gap-3 justify-center">
              <a href="/site" target="_blank" className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700">
                Ver Site Online
              </a>
              <button onClick={() => setIsSuccessModalOpen(false)} className="px-6 py-2 bg-slate-100 text-slate-700 rounded-lg font-bold">
                Fechar
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Header */}
      <div className="flex justify-between items-center shrink-0 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="p-2 bg-indigo-50 rounded-lg">
            <Sparkles className="w-6 h-6 text-indigo-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">AI Website Builder</h2>
            <p className="text-sm text-slate-500">Descreva o que você quer e a IA constrói.</p>
          </div>
        </div>
        
        <div className="flex gap-3">
          <div className="bg-slate-100 p-1 rounded-lg flex gap-1">
            <button onClick={() => setViewMode('desktop')} className={cn("p-2 rounded-md transition-all", viewMode === 'desktop' ? "bg-white shadow text-indigo-600" : "text-slate-500 hover:text-slate-700")}>
              <Monitor className="w-4 h-4" />
            </button>
            <button onClick={() => setViewMode('mobile')} className={cn("p-2 rounded-md transition-all", viewMode === 'mobile' ? "bg-white shadow text-indigo-600" : "text-slate-500 hover:text-slate-700")}>
              <Smartphone className="w-4 h-4" />
            </button>
          </div>
          <div className="h-8 w-px bg-slate-200 mx-2" />
          <button onClick={handlePublish} disabled={saving || loading} className="px-6 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-200 flex items-center gap-2 disabled:opacity-70 transition-all hover:scale-105 active:scale-95">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Publicar Alterações
          </button>
        </div>
      </div>

      <div className="flex-1 flex gap-6 overflow-hidden">
        
        {/* LEFT PANEL: AI CHAT */}
        <div className="w-[400px] bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col overflow-hidden shrink-0">
          
          {/* Header Chat */}
          <div className="p-3 border-b border-slate-100 flex justify-between items-center bg-slate-50">
             <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Chat Assistente</span>
             <button onClick={handleClearChat} className="text-slate-400 hover:text-red-500 p-1" title="Limpar Chat">
               <Trash2 className="w-4 h-4" />
             </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/30">
            {config.chat_history?.map((msg, idx) => (
              <div key={msg.id || idx} className={cn("flex gap-3 animate-in slide-in-from-bottom-2", msg.role === 'user' ? "flex-row-reverse" : "flex-row")}>
                <div className={cn("w-8 h-8 rounded-full flex items-center justify-center shrink-0 border shadow-sm", msg.role === 'ai' ? "bg-indigo-100 border-indigo-200 text-indigo-600" : "bg-slate-200 border-slate-300 text-slate-600")}>
                  {msg.role === 'ai' ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
                </div>
                <div className={cn("max-w-[80%] p-3 rounded-2xl text-sm leading-relaxed shadow-sm", msg.role === 'ai' ? "bg-white border border-slate-200 text-slate-700 rounded-tl-none" : "bg-indigo-600 text-white rounded-tr-none")}>
                  {msg.content}
                </div>
              </div>
            ))}
            
            {isAiProcessing && (
              <div className="flex gap-3 animate-in fade-in">
                <div className="w-8 h-8 rounded-full bg-indigo-100 border border-indigo-200 text-indigo-600 flex items-center justify-center shrink-0">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="bg-white border border-slate-200 px-4 py-3 rounded-2xl rounded-tl-none flex items-center gap-1">
                  <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-4 bg-white border-t border-slate-100">
            <form onSubmit={handleSendMessage} className="relative">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Ex: Novo design moderno..."
                className="w-full pl-4 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all shadow-inner"
                disabled={isAiProcessing}
              />
              <button 
                type="submit" 
                disabled={!inputValue.trim() || isAiProcessing}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:bg-slate-300 transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
            <div className="mt-3 flex gap-2 overflow-x-auto pb-1 no-scrollbar">
              <button onClick={() => setInputValue("Faça um novo design moderno")} className="whitespace-nowrap px-3 py-1 bg-slate-100 hover:bg-slate-200 rounded-full text-xs text-slate-600 border border-slate-200 transition-colors">
                ✨ Novo Design
              </button>
              <button onClick={() => setInputValue("Mudar cor para vermelho")} className="whitespace-nowrap px-3 py-1 bg-slate-100 hover:bg-slate-200 rounded-full text-xs text-slate-600 border border-slate-200 transition-colors">
                🎨 Cor Vermelha
              </button>
              <button onClick={() => setInputValue("Tema escuro e luxuoso")} className="whitespace-nowrap px-3 py-1 bg-slate-100 hover:bg-slate-200 rounded-full text-xs text-slate-600 border border-slate-200 transition-colors">
                💎 Luxo
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT PANEL: LIVE PREVIEW */}
        <div className="flex-1 bg-slate-100 rounded-xl border border-slate-200 shadow-inner flex items-center justify-center relative overflow-hidden p-8">
          <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
          
          <div 
            className={cn(
              "bg-white shadow-2xl transition-all duration-500 ease-in-out overflow-hidden flex flex-col border-8 border-slate-800 relative",
              viewMode === 'mobile' ? "w-[375px] h-[667px] rounded-[3rem]" : "w-full h-full max-w-5xl max-h-[800px] rounded-xl"
            )}
          >
            {/* Desktop Browser Bar */}
            {viewMode === 'desktop' && (
              <div className="h-8 bg-slate-50 border-b border-slate-200 flex items-center px-4 gap-2 shrink-0">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                  <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
                </div>
                <div className="flex-1 bg-white h-5 rounded border border-slate-100 text-[10px] text-slate-400 flex items-center px-2 mx-4 font-mono truncate">
                  https://autopremium.com.br
                </div>
                <RefreshCw className="w-3 h-3 text-slate-400" />
              </div>
            )}

            {/* Mobile Notch */}
            {viewMode === 'mobile' && (
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-slate-800 rounded-b-xl z-20" />
            )}

            {/* PREVIEW CONTENT */}
            <div className="flex-1 overflow-y-auto custom-scrollbar bg-white relative">
              {loading ? (
                <div className="h-full flex items-center justify-center">
                  <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
                </div>
              ) : (
                <ThemeRenderer config={config} />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
