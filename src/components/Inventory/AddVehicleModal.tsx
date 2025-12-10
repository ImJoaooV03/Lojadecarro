import React, { useState, useRef } from 'react';
import { X, Sparkles, Loader2, Camera, Check, Info, Settings, Wrench, UploadCloud, Trash2, Plus, Search } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { supabase } from '../../lib/supabase';
import { cn } from '../../lib/utils';

type AddVehicleModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
};

// Listas Globais Completas
const FUEL_TYPES = [
  "Flex", "Gasolina", "Etanol", "Diesel", 
  "Híbrido (HEV)", "Híbrido Plug-in (PHEV)", "Híbrido Leve (MHEV)", 
  "Elétrico (BEV)", "GNV", "Hidrogênio"
];

const TRANSMISSION_TYPES = [
  "Automático", "Manual", "CVT", "Automatizado", 
  "Dupla Embreagem (DCT/DSG)", "Semi-automático", "Redução Fixa (Elétrico)"
];

const DEFAULT_OPTIONS = [
  'Ar Condicionado', 'Direção Elétrica', 'Direção Hidráulica', 'Vidros Elétricos', 
  'Travas Elétricas', 'Alarme', 'Airbag Duplo', 'Airbag Lateral', 'Airbag de Cortina',
  'Freios ABS', 'Controle de Tração', 'Controle de Estabilidade', 'Rodas de Liga Leve', 
  'Bancos em Couro', 'Teto Solar', 'Teto Solar Panorâmico', 'Central Multimídia', 
  'Câmera de Ré', 'Câmera 360º', 'Sensor de Estacionamento', 'Piloto Automático', 
  'Piloto Automático Adaptativo (ACC)', 'Faróis de LED', 'Faróis de Xenon', 
  'Start-Stop', 'Chave Presencial', 'Painel Digital (TFT)', 'Carregador por Indução',
  'Android Auto / Apple CarPlay', 'Volante Multifuncional', 'Retrovisores Elétricos',
  'Computador de Bordo', 'Freio de Mão Eletrônico', 'Paddle Shifts'
];

export function AddVehicleModal({ isOpen, onClose, onSuccess }: AddVehicleModalProps) {
  const { register, handleSubmit, setValue, watch, reset, getValues, setFocus } = useForm();
  const [isLoading, setIsLoading] = useState(false);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [isPlateLoading, setIsPlateLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('general');
  
  // Estado para Opcionais
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [customOption, setCustomOption] = useState('');

  // Estado para Fotos
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  if (!isOpen) return null;

  // --- Handler de Busca de Placa ---
  const handlePlateLookup = async () => {
    const plate = getValues('plate')?.toUpperCase().replace(/[^A-Z0-9]/g, '');
    
    if (!plate || plate.length < 7) {
      alert("Por favor, digite uma placa válida (Ex: ABC1234 ou ABC-1234)");
      return;
    }

    setIsPlateLoading(true);
    
    // Simulação de API de consulta veicular (Delay para realismo)
    setTimeout(() => {
      // Lógica simulada para preencher dados baseados na placa
      const mockData = {
        make: plate.startsWith('BMW') ? 'BMW' : plate.startsWith('JEEP') ? 'Jeep' : 'Toyota',
        model: plate.startsWith('BMW') ? '320i' : plate.startsWith('JEEP') ? 'Compass' : 'Corolla',
        version: plate.startsWith('BMW') ? 'M Sport' : plate.startsWith('JEEP') ? 'Longitude T270' : 'XEi 2.0',
        year_manufacture: 2023,
        year_model: 2024,
        color: ['Preto', 'Branco', 'Cinza', 'Prata'][Math.floor(Math.random() * 4)],
        fuel: 'Flex',
        transmission: 'Automático',
        engine: plate.startsWith('BMW') ? '2.0 Turbo' : '2.0 Flex',
        plate_end: plate.slice(-1)
      };

      setValue('make', mockData.make);
      setValue('model', mockData.model);
      setValue('version', mockData.version);
      setValue('year_manufacture', mockData.year_manufacture);
      setValue('year_model', mockData.year_model);
      setValue('color', mockData.color);
      setValue('fuel', mockData.fuel);
      setValue('transmission', mockData.transmission);
      setValue('engine', mockData.engine);
      setValue('plate_end', mockData.plate_end);
      
      setIsPlateLoading(false);
      setFocus('mileage');
    }, 1500);
  };

  // --- Handlers de Fotos ---
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(Array.from(e.target.files));
    }
  };

  const processFiles = (files: File[]) => {
    const validFiles = files.filter(file => 
      ['image/jpeg', 'image/png', 'image/webp'].includes(file.type)
    );
    
    const newPreviews = validFiles.map(file => URL.createObjectURL(file));
    setPreviewUrls(prev => [...prev, ...newPreviews]);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(Array.from(e.dataTransfer.files));
    }
  };

  const removePhoto = (index: number) => {
    setPreviewUrls(prev => prev.filter((_, i) => i !== index));
  };

  // --- Handlers de Opcionais ---
  const toggleOption = (option: string) => {
    setSelectedOptions(prev => 
      prev.includes(option) ? prev.filter(o => o !== option) : [...prev, option]
    );
  };

  const addCustomOption = (e: React.FormEvent) => {
    e.preventDefault();
    if (customOption.trim() && !selectedOptions.includes(customOption.trim())) {
      setSelectedOptions(prev => [...prev, customOption.trim()]);
      setCustomOption('');
    }
  };

  // --- Handler de IA ---
  const handleAiEnhanceDescription = () => {
    const currentDesc = getValues('description');
    const make = getValues('make');
    const model = getValues('model');
    const version = getValues('version');
    const year = getValues('year_model');
    const km = getValues('mileage');
    
    if (!make || !model) {
      alert("Por favor, preencha Marca e Modelo antes de usar a IA.");
      return;
    }

    setIsAiLoading(true);
    
    setTimeout(() => {
      const enhancedDesc = `🚗 **${make} ${model} ${version || ''} - ${year || ''}**\n\n` +
        `✨ **Destaques:**\n` +
        `Veículo em estado de zero km! Apenas ${km || 'baixa'} km rodados. ` +
        `Design impecável na cor ${getValues('color') || 'exclusiva'}, combinando elegância e esportividade.\n\n` +
        `🔧 **Detalhes Técnicos:**\n` +
        `- Motor ${getValues('engine') || 'potente'} com câmbio ${getValues('transmission') || 'automático'}\n` +
        `- Economia e desempenho garantidos\n` +
        `- Revisões em dia e garantia de procedência\n\n` +
        (currentDesc ? `📝 **Observações do Dono:** ${currentDesc}\n\n` : '') +
        `🏆 **Por que comprar na AutoPremium?**\n` +
        `Aceitamos seu usado na troca com a melhor avaliação da região. Financiamento com taxas especiais em até 60x.\n\n` +
        `📲 Entre em contato agora e agende seu test-drive!`;
      
      setValue('description', enhancedDesc);
      setIsAiLoading(false);
    }, 1500);
  };

  // --- Submit ---
  const onSubmit = async (data: any) => {
    setIsLoading(true);
    try {
      const { data: dealerships } = await supabase.from('dealerships').select('id').limit(1);
      const dealershipId = dealerships?.[0]?.id;

      if (!dealershipId) throw new Error("Nenhuma loja encontrada. Crie uma loja primeiro.");

      // CORREÇÃO: Usar as imagens exatamente como o usuário definiu (previewUrls)
      // Não substituir por imagens genéricas.
      const finalImages = previewUrls.length > 0 ? previewUrls : [];

      const { error } = await supabase.from('vehicles').insert({
        ...data,
        dealership_id: dealershipId,
        status: 'available',
        images: finalImages,
        options: selectedOptions,
        fipe_price: Number(data.selling_price) * 0.95,
        purchase_price: Number(data.selling_price) * 0.80,
      });

      if (error) throw error;

      reset();
      setPreviewUrls([]);
      setSelectedOptions([]);
      onSuccess();
      onClose();
      alert("Veículo cadastrado com sucesso!");
    } catch (error) {
      console.error('Erro ao salvar veículo:', error);
      alert('Erro ao salvar veículo. Verifique o console.');
    } finally {
      setIsLoading(false);
    }
  };

  const tabs = [
    { id: 'general', label: 'Dados Gerais', icon: Info },
    { id: 'mechanics', label: 'Mecânica', icon: Wrench },
    { id: 'photos', label: 'Fotos', icon: Camera },
    { id: 'options', label: 'Opcionais', icon: Settings },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between shrink-0 bg-white">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Adicionar Veículo</h2>
            <p className="text-sm text-slate-500">Preencha as informações para publicar no estoque.</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar Tabs */}
          <div className="w-64 bg-slate-50 border-r border-slate-100 p-4 space-y-1 shrink-0 hidden md:block overflow-y-auto">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200",
                  activeTab === tab.id 
                    ? "bg-white text-indigo-600 shadow-sm ring-1 ring-slate-200 translate-x-1" 
                    : "text-slate-600 hover:bg-slate-200/50 hover:text-slate-900"
                )}
              >
                <tab.icon className={cn("w-4 h-4", activeTab === tab.id && "text-indigo-600")} />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-8 bg-white">
            <form id="vehicle-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-3xl mx-auto">
              
              {/* --- TAB: GERAL --- */}
              {activeTab === 'general' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1.5">
                      <label className="text-sm font-semibold text-slate-700">Placa</label>
                      <div className="flex gap-2">
                        <input 
                          {...register('plate')} 
                          className="flex-1 px-4 py-2.5 border border-slate-200 rounded-xl text-sm uppercase focus:ring-2 focus:ring-indigo-500 outline-none transition-all" 
                          placeholder="ABC-1234" 
                        />
                        <button 
                          type="button"
                          onClick={handlePlateLookup}
                          disabled={isPlateLoading}
                          className="px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-100 transition-colors disabled:opacity-50"
                          title="Buscar dados pela placa"
                        >
                          {isPlateLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-semibold text-slate-700">Quilometragem (KM)</label>
                      <input type="number" {...register('mileage')} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all" placeholder="0" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-semibold text-slate-700">Marca <span className="text-red-500">*</span></label>
                      <input {...register('make', { required: true })} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all" placeholder="Ex: Toyota" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-semibold text-slate-700">Modelo <span className="text-red-500">*</span></label>
                      <input {...register('model', { required: true })} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all" placeholder="Ex: Corolla" />
                    </div>
                    <div className="space-y-1.5 md:col-span-2">
                      <label className="text-sm font-semibold text-slate-700">Versão</label>
                      <input {...register('version')} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all" placeholder="Ex: XEi 2.0 Flex" />
                    </div>
                    <div className="space-y-1.5 md:col-span-2">
                      <label className="text-sm font-semibold text-slate-700">Preço de Venda (R$) <span className="text-red-500">*</span></label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">R$</span>
                        <input type="number" {...register('selling_price', { required: true })} className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl text-lg font-bold text-indigo-600 focus:ring-2 focus:ring-indigo-500 outline-none transition-all" placeholder="0,00" />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3 pt-4 border-t border-slate-100">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-semibold text-slate-700">Descrição do Veículo</label>
                      <button 
                        type="button" 
                        onClick={handleAiEnhanceDescription} 
                        disabled={isAiLoading}
                        className="text-xs flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-lg font-bold hover:bg-indigo-100 transition-colors disabled:opacity-50"
                      >
                        {isAiLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                        {isAiLoading ? 'Gerando Copy...' : 'Melhorar com IA'}
                      </button>
                    </div>
                    <div className="relative">
                      <textarea 
                        {...register('description')} 
                        rows={6} 
                        className="w-full p-4 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all resize-none leading-relaxed" 
                        placeholder="Digite os pontos fortes do carro (ex: Único dono, pneus novos) e clique em 'Melhorar com IA' para criar um texto de vendas profissional." 
                      />
                      {isAiLoading && (
                        <div className="absolute inset-0 bg-white/80 backdrop-blur-[1px] flex items-center justify-center rounded-xl">
                          <div className="flex flex-col items-center gap-2">
                            <Sparkles className="w-8 h-8 text-indigo-600 animate-pulse" />
                            <p className="text-sm font-medium text-indigo-900">Criando texto persuasivo...</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* --- TAB: MECÂNICA --- */}
              {activeTab === 'mechanics' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-right-4 duration-300">
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-slate-700">Ano Fabricação</label>
                    <input type="number" {...register('year_manufacture')} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="YYYY" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-slate-700">Ano Modelo</label>
                    <input type="number" {...register('year_model')} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="YYYY" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-slate-700">Cor</label>
                    <input {...register('color')} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="Ex: Preto Metálico" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-slate-700">Combustível</label>
                    <select {...register('fuel')} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm bg-white focus:ring-2 focus:ring-indigo-500 outline-none">
                      <option value="">Selecione...</option>
                      {FUEL_TYPES.map(f => <option key={f} value={f}>{f}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1.5 md:col-span-2">
                    <label className="text-sm font-semibold text-slate-700">Câmbio / Transmissão</label>
                    <select {...register('transmission')} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm bg-white focus:ring-2 focus:ring-indigo-500 outline-none">
                      <option value="">Selecione...</option>
                      {TRANSMISSION_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-slate-700">Motorização</label>
                    <input {...register('engine')} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="Ex: 2.0 Turbo" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-slate-700">Final da Placa</label>
                    <input {...register('plate_end')} maxLength={1} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="Ex: 9" />
                  </div>
                </div>
              )}

              {/* --- TAB: FOTOS --- */}
              {activeTab === 'photos' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                  <div 
                    className={cn(
                      "border-2 border-dashed rounded-2xl p-10 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-200",
                      isDragging ? "border-indigo-500 bg-indigo-50 scale-[1.02]" : "border-slate-300 hover:border-indigo-400 hover:bg-slate-50"
                    )}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      className="hidden" 
                      multiple 
                      accept="image/png, image/jpeg, image/webp" 
                      onChange={handleFileSelect}
                    />
                    <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mb-4">
                      <UploadCloud className="w-8 h-8" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900">Clique ou arraste fotos aqui</h3>
                    <p className="text-sm text-slate-500 mt-2">Suporta JPG, PNG e WebP (Máx 10MB)</p>
                  </div>

                  {previewUrls.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {previewUrls.map((url, index) => (
                        <div key={index} className="group relative aspect-[4/3] bg-slate-100 rounded-xl overflow-hidden border border-slate-200 shadow-sm">
                          <img src={url} className="w-full h-full object-cover" alt={`Preview ${index}`} />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <button 
                              type="button"
                              onClick={(e) => { e.stopPropagation(); removePhoto(index); }}
                              className="p-2 bg-white text-red-600 rounded-full hover:bg-red-50 transition-colors"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </div>
                          {index === 0 && (
                            <div className="absolute top-2 left-2 bg-indigo-600 text-white text-[10px] font-bold px-2 py-1 rounded shadow-sm">
                              CAPA
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* --- TAB: OPCIONAIS --- */}
              {activeTab === 'options' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                  {/* Add Custom Option */}
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      value={customOption}
                      onChange={(e) => setCustomOption(e.target.value)}
                      placeholder="Adicionar opcional exclusivo (ex: Kit AMG)"
                      className="flex-1 px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                      onKeyDown={(e) => e.key === 'Enter' && addCustomOption(e)}
                    />
                    <button 
                      type="button" 
                      onClick={addCustomOption}
                      className="px-4 py-2 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-colors flex items-center gap-2"
                    >
                      <Plus className="w-4 h-4" /> Adicionar
                    </button>
                  </div>

                  {/* Selected Tags */}
                  {selectedOptions.length > 0 && (
                    <div className="flex flex-wrap gap-2 p-4 bg-indigo-50 rounded-xl border border-indigo-100">
                      {selectedOptions.map(opt => (
                        <span key={opt} className="inline-flex items-center gap-1 px-3 py-1 bg-white text-indigo-700 rounded-full text-xs font-bold border border-indigo-200 shadow-sm">
                          {opt}
                          <button type="button" onClick={() => toggleOption(opt)} className="hover:text-red-500"><X className="w-3 h-3" /></button>
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Default Options Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {DEFAULT_OPTIONS.map(opt => (
                      <label 
                        key={opt} 
                        className={cn(
                          "flex items-center gap-3 p-3 border rounded-xl cursor-pointer transition-all duration-200 select-none",
                          selectedOptions.includes(opt) 
                            ? "bg-indigo-600 border-indigo-600 text-white shadow-md transform scale-[1.02]" 
                            : "bg-white border-slate-200 text-slate-600 hover:border-indigo-300 hover:bg-indigo-50/30"
                        )}
                      >
                        <div className={cn(
                          "w-5 h-5 rounded border flex items-center justify-center transition-colors",
                          selectedOptions.includes(opt) ? "bg-white border-white" : "bg-white border-slate-300"
                        )}>
                          {selectedOptions.includes(opt) && <Check className="w-3.5 h-3.5 text-indigo-600" />}
                        </div>
                        <span className="text-sm font-medium">{opt}</span>
                        <input 
                          type="checkbox" 
                          className="hidden" 
                          checked={selectedOptions.includes(opt)}
                          onChange={() => toggleOption(opt)}
                        />
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </form>
          </div>
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-slate-100 flex justify-between items-center shrink-0 bg-slate-50">
          <div className="text-xs text-slate-400 hidden sm:block">
            <span className="font-bold text-slate-600">{activeTab === 'photos' ? previewUrls.length : activeTab === 'options' ? selectedOptions.length : ''}</span> 
            {activeTab === 'photos' ? ' fotos selecionadas' : activeTab === 'options' ? ' opcionais selecionados' : '* Campos obrigatórios'}
          </div>
          <div className="flex gap-3 w-full sm:w-auto">
            <button type="button" onClick={onClose} className="flex-1 sm:flex-none px-6 py-2.5 text-slate-700 text-sm font-bold hover:bg-slate-200 rounded-xl transition-colors">
              Cancelar
            </button>
            <button form="vehicle-form" type="submit" disabled={isLoading} className="flex-1 sm:flex-none px-8 py-2.5 bg-indigo-600 text-white text-sm font-bold rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed">
              {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
              Salvar Veículo
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
