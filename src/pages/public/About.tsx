import React from 'react';
import { CheckCircle } from 'lucide-react';

export default function PublicAbout() {
  return (
    <div className="py-12 md:py-20">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h1 className="text-4xl font-bold text-slate-900 mb-6">Sobre a AutoPremium</h1>
          <p className="text-lg text-slate-600 leading-relaxed">
            Há mais de 15 anos no mercado, somos referência em veículos premium e seminovos de qualidade. 
            Nossa missão é transformar a compra do seu carro em uma experiência única e transparente.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-20">
          <div className="relative h-[400px] rounded-2xl overflow-hidden shadow-2xl rotate-2 hover:rotate-0 transition-transform duration-500">
            <img 
              src="https://images.unsplash.com/photo-1560179707-f14e90ef3623?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80" 
              className="w-full h-full object-cover"
            />
          </div>
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-slate-900">Por que escolher a gente?</h2>
            <div className="space-y-4">
              {[
                "Todos os veículos com laudo cautelar aprovado",
                "Garantia de motor e câmbio de até 1 ano",
                "Melhor avaliação do seu usado na troca",
                "Consultores especializados para te atender",
                "Pós-venda dedicado e eficiente"
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-indigo-600 shrink-0" />
                  <span className="text-slate-700 font-medium">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
