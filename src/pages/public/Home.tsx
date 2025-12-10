import React from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import { ArrowRight, Shield, Star, Clock, Car } from 'lucide-react';
import { supabase, type SiteConfig } from '../../lib/supabase';
import { formatCurrency, getSafeTextColor } from '../../lib/utils';
import { cn } from '../../lib/utils';

export default function PublicHome() {
  const { config } = useOutletContext<{ config: SiteConfig }>();
  const [featuredVehicles, setFeaturedVehicles] = React.useState<any[]>([]);

  React.useEffect(() => {
    const fetchFeatured = async () => {
      const { data } = await supabase.from('vehicles').select('*').eq('status', 'available').limit(4);
      if (data) setFeaturedVehicles(data);
    };
    fetchFeatured();
  }, []);

  // Helper para cores usando a função segura
  const primaryText = getSafeTextColor(config?.primary_color);
  const buttonBg = config?.button_color || 'bg-indigo-600';

  return (
    <div>
      {/* Hero Section */}
      {config?.show_hero && (
        <section className="relative h-[500px] md:h-[600px] flex items-center">
          <div className="absolute inset-0 z-0">
            <img 
              src={config?.banner_url || "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80"} 
              className="w-full h-full object-cover"
              alt="Hero Background"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-slate-900/90 to-slate-900/40" />
          </div>
          
          <div className="container mx-auto px-4 relative z-10 text-white">
            <div className="max-w-2xl animate-in slide-in-from-left duration-700">
              <span className={cn("inline-block px-4 py-1 rounded-full bg-white/10 border border-white/20 text-sm font-medium mb-4 backdrop-blur-sm")}>
                Líder em vendas na região
              </span>
              <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-6">
                {config?.hero_title || 'Encontre o carro dos seus sonhos'}
              </h1>
              <p className="text-lg text-slate-300 mb-8 leading-relaxed">
                {config?.hero_subtitle || 'Qualidade, procedência e as melhores taxas do mercado.'}
              </p>
              <div className="flex gap-4">
                <Link to="/site/estoque" className={cn("px-8 py-3 text-white rounded-full font-bold transition-all hover:scale-105 shadow-lg", buttonBg)}>
                  Ver Estoque
                </Link>
                <button className="px-8 py-3 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-full font-bold transition-all backdrop-blur-sm">
                  Avaliar meu Usado
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Features */}
      {config?.show_features && (
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              {[
                { icon: Shield, title: "Garantia Total", desc: "Todos os veículos periciados e com garantia." },
                { icon: Star, title: "Melhores Taxas", desc: "Parceria com os principais bancos." },
                { icon: Clock, title: "Aprovação Rápida", desc: "Saia de carro novo no mesmo dia." },
                { icon: Car, title: "Troca com Troco", desc: "Melhor avaliação do seu usado." }
              ].map((f, i) => (
                <div key={i} className="p-6 rounded-2xl bg-slate-50 border border-slate-100 hover:shadow-lg transition-all hover:-translate-y-1 group">
                  <div className={cn("w-12 h-12 bg-white rounded-xl flex items-center justify-center mb-4 shadow-sm transition-colors group-hover:text-white", `group-hover:${config?.primary_color}`)}>
                    <f.icon className="w-6 h-6 text-slate-700 group-hover:text-white" />
                  </div>
                  <h3 className="font-bold text-lg text-slate-900 mb-2">{f.title}</h3>
                  <p className="text-slate-500 text-sm">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Featured Inventory */}
      {config?.show_inventory && (
        <section className="py-20 bg-slate-50">
          <div className="container mx-auto px-4">
            <div className="flex justify-between items-end mb-12">
              <div>
                <h2 className="text-3xl font-bold text-slate-900 mb-2">Destaques da Semana</h2>
                <p className="text-slate-500">Veículos selecionados especialmente para você.</p>
              </div>
              <Link to="/site/estoque" className={cn("hidden md:flex items-center gap-2 font-bold hover:opacity-80", primaryText)}>
                Ver todo estoque <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {featuredVehicles.map(vehicle => (
                <div key={vehicle.id} className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 group">
                  <div className="relative h-48 overflow-hidden">
                    <img 
                      src={vehicle.images?.[0] || `https://img-wrapper.vercel.app/image?url=https://img-wrapper.vercel.app/image?url=https://img-wrapper.vercel.app/image?url=https://placehold.co/600x400/e2e8f0/94a3b8?text=${vehicle.make}`} 
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-slate-900 shadow-sm">
                      {vehicle.year_model}
                    </div>
                  </div>
                  <div className="p-5">
                    <h3 className="font-bold text-slate-900 text-lg truncate">{vehicle.make} {vehicle.model}</h3>
                    <p className="text-sm text-slate-500 mb-4">{vehicle.version}</p>
                    <div className="flex items-end justify-between">
                      <div>
                        <p className="text-xs text-slate-400 mb-1">À vista</p>
                        <p className={cn("text-xl font-bold", primaryText)}>{formatCurrency(vehicle.selling_price)}</p>
                      </div>
                      <button className={cn("w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center transition-colors hover:text-white", `hover:${config?.primary_color}`)}>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
