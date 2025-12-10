import React, { useEffect, useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Phone, MapPin, Instagram, Facebook, Menu, X, Loader2 } from 'lucide-react';
import { cn, getSafeTextColor } from '../../lib/utils';
import { supabase, type SiteConfig } from '../../lib/supabase';

export default function PublicLayout() {
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [config, setConfig] = useState<SiteConfig | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const { data } = await supabase.from('site_configs').select('*').limit(1);
        
        if (data && data.length > 0) {
          setConfig(data[0] as SiteConfig);
          if (data[0].seo_title) document.title = data[0].seo_title;
        } else {
          setConfig({
            template_id: 'modern',
            primary_color: 'bg-indigo-600',
            button_color: 'bg-indigo-600',
            font_family: 'sans',
            hero_title: 'AutoPremium Motors',
            hero_subtitle: '',
            contact_phone: '(11) 99999-0000',
            contact_address: 'Av. dos Autonomistas, 1500 - SP',
            social_instagram: '@autopremium',
            show_hero: true,
            show_features: true,
            show_inventory: true,
            show_about: true
          });
        }
      } catch (error) {
        console.error("Erro ao carregar config do site:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchConfig();
  }, []);

  const navItems = [
    { label: 'Home', path: '/site' },
    { label: 'Estoque', path: '/site/estoque' },
    { label: 'Sobre Nós', path: '/site/sobre' },
  ];

  if (loading) {
    return <div className="h-screen flex items-center justify-center bg-white"><Loader2 className="w-8 h-8 animate-spin text-slate-300" /></div>;
  }

  return (
    <div className={cn(
      "min-h-screen flex flex-col bg-white font-sans", 
      config?.font_family === 'serif' && 'font-serif',
      config?.font_family === 'mono' && 'font-mono'
    )}>
      {/* Top Bar */}
      <div className="bg-slate-900 text-slate-300 py-2 px-4 text-xs md:text-sm">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> {config?.contact_phone}</span>
            <span className="hidden md:flex items-center gap-1"><MapPin className="w-3 h-3" /> {config?.contact_address}</span>
          </div>
          <div className="flex items-center gap-3">
            <Instagram className="w-4 h-4 hover:text-white cursor-pointer" />
            <Facebook className="w-4 h-4 hover:text-white cursor-pointer" />
          </div>
        </div>
      </div>

      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-slate-100 shadow-sm">
        <div className="container mx-auto px-4 h-20 flex items-center justify-between">
          <Link to="/site" className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-1">
            Auto<span className={cn("font-extrabold", getSafeTextColor(config?.primary_color))}>Premium</span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            {navItems.map(item => (
              <Link 
                key={item.path} 
                to={item.path}
                className={cn(
                  "text-sm font-medium transition-colors hover:opacity-80",
                  location.pathname === item.path ? `font-bold ${getSafeTextColor(config?.primary_color)}` : "text-slate-600"
                )}
              >
                {item.label}
              </Link>
            ))}
            <button 
              className={cn(
                "text-white px-6 py-2.5 rounded-full text-sm font-bold transition-transform hover:scale-105 shadow-lg",
                config?.button_color || 'bg-indigo-600'
              )}
            >
              Fale Conosco
            </button>
          </nav>

          {/* Mobile Menu Toggle */}
          <button className="md:hidden p-2" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X /> : <Menu />}
          </button>
        </div>

        {/* Mobile Nav */}
        {isMenuOpen && (
          <div className="md:hidden bg-white border-t border-slate-100 p-4 space-y-4 absolute w-full shadow-xl">
            {navItems.map(item => (
              <Link 
                key={item.path} 
                to={item.path}
                onClick={() => setIsMenuOpen(false)}
                className="block text-base font-medium text-slate-700 py-2"
              >
                {item.label}
              </Link>
            ))}
          </div>
        )}
      </header>

      {/* Content */}
      <main className="flex-1">
        <Outlet context={{ config }} />
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-12">
        <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4">AutoPremium</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Especialistas em realizar sonhos. Veículos periciados, com garantia e procedência. 
              Venha tomar um café conosco.
            </p>
          </div>
          <div>
            <h4 className="font-bold mb-4">Links Rápidos</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li><Link to="/site/estoque" className="hover:text-white">Estoque Atualizado</Link></li>
              <li><Link to="/site/sobre" className="hover:text-white">Nossa História</Link></li>
              <li><Link to="/site" className="hover:text-white">Financiamento</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-4">Contato</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li className="flex items-center gap-2"><Phone className="w-4 h-4" /> {config?.contact_phone}</li>
              <li className="flex items-center gap-2"><MapPin className="w-4 h-4" /> {config?.contact_address}</li>
            </ul>
          </div>
        </div>
        <div className="container mx-auto px-4 mt-12 pt-8 border-t border-slate-800 text-center text-xs text-slate-500">
          <p>© 2025 AutoPremium Motors. Todos os direitos reservados. Powered by Hub Automotivo.</p>
        </div>
      </footer>
    </div>
  );
}
