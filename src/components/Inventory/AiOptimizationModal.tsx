import React, { useState, useEffect } from 'react';
import { Sparkles, CheckCircle, TrendingUp, Search, ArrowRight, X } from 'lucide-react';
import { Modal } from '../Shared/Modal';
import { formatCurrency } from '../../lib/utils';

interface AiOptimizationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AiOptimizationModal({ isOpen, onClose }: AiOptimizationModalProps) {
  const [step, setStep] = useState<'scanning' | 'results'>('scanning');
  const [progress, setProgress] = useState(0);

  // Reset state when opening
  useEffect(() => {
    if (isOpen) {
      setStep('scanning');
      setProgress(0);
      
      // Simulate scanning progress
      const interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            setStep('results');
            return 100;
          }
          return prev + 2;
        });
      }, 50);
      
      return () => clearInterval(interval);
    }
  }, [isOpen]);

  const suggestions = [
    {
      id: 1,
      vehicle: 'Toyota Corolla XEi 2.0',
      type: 'price',
      current: 145000,
      suggested: 147500,
      reason: 'Alta procura na região (+15%) e baixa oferta deste modelo.',
      impact: '+ R$ 2.500,00 de margem'
    },
    {
      id: 2,
      vehicle: 'Honda Civic Touring',
      type: 'seo',
      reason: 'Descrição incompleta. A IA gerou um texto focado em "Conforto" e "Economia" para melhorar o ranking no Google.',
      impact: '+ 40% de visibilidade'
    },
    {
      id: 3,
      vehicle: 'Jeep Compass Longitude',
      type: 'churn',
      reason: 'Veículo parado há 45 dias. Sugestão de impulsionamento no Instagram.',
      impact: 'Acelerar venda'
    }
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="IA Copilot - Otimização de Estoque">
      {step === 'scanning' ? (
        <div className="flex flex-col items-center justify-center py-12 text-center space-y-6">
          <div className="relative">
            <div className="w-24 h-24 rounded-full border-4 border-indigo-100 border-t-indigo-600 animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <Search className="w-8 h-8 text-indigo-600" />
            </div>
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900">Analisando Mercado...</h3>
            <p className="text-slate-500 mt-2">Comparando seu estoque com FIPE, Webmotors e OLX.</p>
          </div>
          <div className="w-full max-w-md bg-slate-100 rounded-full h-2 overflow-hidden">
            <div 
              className="bg-indigo-600 h-full transition-all duration-100 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-xs text-slate-400 font-mono">{progress}% concluído</p>
        </div>
      ) : (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
          <div className="bg-green-50 border border-green-100 rounded-xl p-4 flex items-start gap-3">
            <div className="p-2 bg-green-100 rounded-lg text-green-700">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-green-900">Análise Concluída</h4>
              <p className="text-sm text-green-800">Encontramos 3 oportunidades de otimização para aumentar sua lucratividade.</p>
            </div>
          </div>

          <div className="space-y-3">
            {suggestions.map(item => (
              <div key={item.id} className="bg-white border border-slate-200 rounded-xl p-4 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-bold text-slate-900">{item.vehicle}</h4>
                  <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${
                    item.type === 'price' ? 'bg-blue-50 text-blue-700' : 
                    item.type === 'seo' ? 'bg-purple-50 text-purple-700' : 'bg-amber-50 text-amber-700'
                  }`}>
                    {item.type === 'price' ? 'Precificação' : item.type === 'seo' ? 'Marketing' : 'Alerta'}
                  </span>
                </div>
                <p className="text-sm text-slate-600 mb-3">{item.reason}</p>
                
                {item.type === 'price' && (
                  <div className="flex items-center gap-3 text-sm bg-slate-50 p-2 rounded-lg mb-3">
                    <span className="text-slate-500 line-through">{formatCurrency(item.current)}</span>
                    <ArrowRight className="w-4 h-4 text-slate-400" />
                    <span className="font-bold text-green-600">{formatCurrency(item.suggested)}</span>
                  </div>
                )}

                <div className="flex items-center gap-2 text-xs font-medium text-indigo-600">
                  <TrendingUp className="w-3 h-3" />
                  Impacto estimado: {item.impact}
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button onClick={onClose} className="px-4 py-2 text-slate-600 hover:bg-slate-50 rounded-lg text-sm font-medium">
              Ignorar
            </button>
            <button onClick={onClose} className="px-6 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 shadow-lg shadow-indigo-200 flex items-center gap-2">
              <CheckCircle className="w-4 h-4" /> Aplicar Otimizações
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
}
