import React, { useEffect, useState, useRef } from 'react';
import { X, Loader2, Save, AlertCircle, Info, Wrench, Camera, Settings, Sparkles, UploadCloud, Trash2, Plus, Check } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { supabase, type Vehicle, type VehicleStatus } from '../../lib/supabase';
import { cn } from '../../lib/utils';

type EditVehicleModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  vehicle: Vehicle | null;
};

// --- CONSTANTES E LISTAS (Mesmas do Adicionar) ---
const STATUS_OPTIONS: { value: VehicleStatus; label: string; color: string }[] = [
  { value: 'available', label: 'Disponível', color: 'bg-green-100 text-green-700 border-green-200' },
  { value: 'reserved', label: 'Reservado', color: 'bg-amber-100 text-amber-700 border-amber-200' },
  { value: 'sold', label: 'Vendido', color: 'bg-red-100 text-red-700 border-red-200' },
  { value: 'maintenance', label: 'Em Manutenção', color: 'bg-slate-100 text-slate-700 border-slate-200' },
  { value: 'transit', label: 'Em Trânsito', color: 'bg-blue-100 text-blue-700 border-blue-200' },
];

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

export function EditVehicleModal({ isOpen, onClose, onSuccess, vehicle }: EditVehicleModalProps) {
  const { register, handleSubmit, setValue, reset, watch, getValues } = useForm<Partial<Vehicle>>();
  const [isLoading, setIsLoading] = useState(false);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('general');

  // Estados auxiliares
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [customOption, setCustomOption] = useState('');
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const currentStatus = watch('status');

  // --- INICIALIZAÇÃO ---
  useEffect(() => {
    if (vehicle) {
      // Preenche o formulário com TODOS os dados
      reset({
        ...vehicle,
        // Garante que números sejam tratados corretamente se vierem como string
        selling_price: Number(vehicle.selling_price),
        mileage: Number(vehicle.mileage),
        year_manufacture: Number(vehicle.year_manufacture),
        year_model: Number(vehicle.year_model),
      });

      // Inicializa estados complexos
      setSelectedOptions(vehicle.options || []);
      setPreviewUrls(vehicle.images || []);
      setActiveTab('general');
    }
  }, [vehicle, reset]);

  if (!isOpen || !vehicle) return null;

  // --- HANDLERS ---

  // Fotos
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) processFiles(Array.from(e.target.files));
  };
  
  const processFiles = (files: File[]) => {
    const newPreviews = files.map(file => URL.createObjectURL(file));
    setPreviewUrls(prev => [...prev, ...newPreviews]);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) processFiles(Array.from(e.dataTransfer.files));
  };

  const removePhoto = (index: number) => {
    setPreviewUrls(prev => prev.filter((_, i) => i !== index));
  };

  // Opcionais
  const toggleOption = (option: string) => {
    setSelectedOptions(prev => prev.includes(option) ? prev.filter(o => o !== option) : [...prev, option]);
  };

  const addCustomOption = (e: React.FormEvent) => {
    e.preventDefault();
    if (customOption.trim() && !selectedOptions.includes(customOption.trim())) {
      setSelectedOptions(prev => [...prev, customOption.trim()]);
      setCustomOption('');
    }
  };

  // IA
  const handleAiEnhanceDescription = () => {
    setIsAiLoading(true);
    setTimeout(() => {
      const enhancedDesc = `🚗 **${getValues('make')} ${getValues('model')} ${getValues('version')}**\n\n` +
        `✨ **Oportunidade Única:**\n` +
        `Veículo revisado e com garantia. Apenas ${getValues('mileage')}km rodados. ` +
        `Cor ${getValues('color')} impecável.\n\n` +
        `🔧 **Destaques:**\n` +
        `- Câmbio ${getValues('transmission')}\n` +
        `- Motor ${getValues('engine')}\n` +
        `- Completo com ${selectedOptions.slice(0, 3).join(', ')} e muito mais.\n\n` +
        `Venha conferir pessoalmente! Aceitamos troca e financiamos.`;
      setValue('description', enhancedDesc);
      setIsAiLoading(false);
    }, 1500);
  };

  // Submit
  const onSubmit = async (data: Partial<Vehicle>) => {
    setIsLoading(true);
    try {
      // CORREÇÃO: Remover lógica de substituição de imagem.
      // Salva exatamente o que está no estado previewUrls.
      const finalImages = previewUrls;
      
      const { error } = await supabase
        .from('vehicles')
        .update({
          ...data,
          selling_price: Number(data.selling_price),
          mileage: Number(data.mileage),
          year_manufacture: Number(data.year_manufacture),
          year_model: Number(data.year_model),
          options: selectedOptions,
          images: finalImages,
        })
        .eq('id', vehicle.id);

      if (error) throw error;
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Erro ao atualizar:', error);
      alert('Erro ao atualizar veículo.');
    } finally {
      setIsLoading(false);
    }
  };

  const tabs = [
    { id: 'general', label: 'Geral & Status', icon: Info },
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
            <h2 className="text-xl font-bold text-slate-900">Editar Veículo</h2>
            <p className="text-sm text-slate-500">Editando: {vehicle.make} {vehicle.model} ({vehicle.plate})</p>
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

          {/* Content Area */}
          <div className="flex-1 overflow-y-auto p-8 bg-white">
            <form id="edit-form" onSubmit={handleSubmit(onSubmit)} className="space-y-8 max-w-3xl mx-auto">
              
              {/* --- TAB: GERAL --- */}
              {activeTab === 'general' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                  
                  {/* Status Section (Destaque) */}
                  <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 shadow-sm">
                    <label className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-3">
                      <Info className="w-4 h-4 text-indigo-600" /> Status Atual
                    </label>
                    <div className="relative">
                      <select
                        {...register('status')}
                        className={cn(
                          "w-full p-3 rounded-xl border-2 outline-none font-bold text-sm transition-all appearance-none cursor-pointer",
                          currentStatus === 'available' && "border-green-200 bg-green-50 text-green-800 focus:border-green-500",
                          currentStatus === 'reserved' && "border-amber-200 bg-amber-50 text-amber-800 focus:border-amber-500",
                          currentStatus === 'sold' && "border-red-200 bg-red-50 text-red-800 focus:border-red-500",
                          currentStatus === 'maintenance' && "border-slate-200 bg-slate-100 text-slate-800 focus:border-slate-500",
                          currentStatus === 'transit' && "border-blue-200 bg-blue-50 text-blue-800 focus:border-blue-500"
                        )}
                      >
                        {STATUS_OPTIONS.map(opt => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                        <AlertCircle className="w-4 h-4 opacity-50" />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1.5">
                      <label className="text-sm font-semibold text-slate-700">Marca</label>
                      <input {...register('make')} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-semibold text-slate-700">Modelo</label>
                      <input {...register('model')} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
                    </div>
                    <div className="space-y-1.5 md:col-span-2">
                      <label className="text-sm font-semibold text-slate-700">Versão</label>
                      <input {...register('version')} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-semibold text-slate-700">Preço (R$)</label>
                      <input type="number" {...register('selling_price')} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-bold text-indigo-600 focus:ring-2 focus:ring-indigo-500 outline-none" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-semibold text-slate-700">KM</label>
                      <input type="number" {...register('mileage')} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
                    </div>
                  </div>

                  <div className="space-y-3 pt-4 border-t border-slate-100">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-semibold text-slate-700">Descrição</label>
                      <button type="button" onClick={handleAiEnhanceDescription} disabled={isAiLoading} className="text-xs flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-lg font-bold hover:bg-indigo-100 transition-colors disabled:opacity-50">
                        {isAiLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />} IA Rewrite
                      </button>
                    </div>
                    <textarea {...register('description')} rows={5} className="w-full p-4 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none resize-none" />
                  </div>
                </div>
              )}

              {/* --- TAB: MECÂNICA --- */}
              {activeTab === 'mechanics' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-right-4 duration-300">
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-slate-700">Ano Fab.</label>
                    <input type="number" {...register('year_manufacture')} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-slate-700">Ano Mod.</label>
                    <input type="number" {...register('year_model')} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-slate-700">Cor</label>
                    <input {...register('color')} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-slate-700">Combustível</label>
                    <select {...register('fuel')} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm bg-white focus:ring-2 focus:ring-indigo-500 outline-none">
                      {FUEL_TYPES.map(f => <option key={f} value={f}>{f}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1.5 md:col-span-2">
                    <label className="text-sm font-semibold text-slate-700">Câmbio</label>
                    <select {...register('transmission')} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm bg-white focus:ring-2 focus:ring-indigo-500 outline-none">
                      {TRANSMISSION_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-slate-700">Motor</label>
                    <input {...register('engine')} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-slate-700">Placa</label>
                    <input {...register('plate')} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm uppercase focus:ring-2 focus:ring-indigo-500 outline-none" />
                  </div>
                </div>
              )}

              {/* --- TAB: FOTOS --- */}
              {activeTab === 'photos' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                  <div 
                    className={cn(
                      "border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all",
                      isDragging ? "border-indigo-500 bg-indigo-50" : "border-slate-300 hover:border-indigo-400 hover:bg-slate-50"
                    )}
                    onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                    onDragLeave={(e) => { e.preventDefault(); setIsDragging(false); }}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <input type="file" ref={fileInputRef} className="hidden" multiple accept="image/*" onChange={handleFileSelect} />
                    <UploadCloud className="w-10 h-10 text-indigo-400 mb-3" />
                    <p className="text-sm font-bold text-slate-700">Adicionar novas fotos</p>
                    <p className="text-xs text-slate-400">Arraste ou clique para selecionar</p>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {previewUrls.map((url, index) => (
                      <div key={index} className="group relative aspect-[4/3] bg-slate-100 rounded-xl overflow-hidden border border-slate-200">
                        <img src={url} className="w-full h-full object-cover" alt={`Foto ${index}`} />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <button type="button" onClick={() => removePhoto(index)} className="p-2 bg-white text-red-600 rounded-full hover:bg-red-50">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        {index === 0 && <div className="absolute top-2 left-2 bg-indigo-600 text-white text-[10px] font-bold px-2 py-1 rounded">CAPA</div>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* --- TAB: OPCIONAIS --- */}
              {activeTab === 'options' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      value={customOption}
                      onChange={(e) => setCustomOption(e.target.value)}
                      placeholder="Novo opcional..."
                      className="flex-1 px-4 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                      onKeyDown={(e) => e.key === 'Enter' && addCustomOption(e)}
                    />
                    <button type="button" onClick={addCustomOption} className="px-4 py-2 bg-slate-900 text-white rounded-xl hover:bg-slate-800 flex items-center gap-2">
                      <Plus className="w-4 h-4" /> Add
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {DEFAULT_OPTIONS.map(opt => (
                      <label 
                        key={opt} 
                        className={cn(
                          "flex items-center gap-3 p-3 border rounded-xl cursor-pointer transition-all select-none",
                          selectedOptions.includes(opt) 
                            ? "bg-indigo-600 border-indigo-600 text-white shadow-md" 
                            : "bg-white border-slate-200 text-slate-600 hover:bg-indigo-50"
                        )}
                      >
                        <div className={cn("w-4 h-4 rounded border flex items-center justify-center", selectedOptions.includes(opt) ? "bg-white border-white" : "bg-white border-slate-300")}>
                          {selectedOptions.includes(opt) && <Check className="w-3 h-3 text-indigo-600" />}
                        </div>
                        <span className="text-sm font-medium">{opt}</span>
                        <input type="checkbox" className="hidden" checked={selectedOptions.includes(opt)} onChange={() => toggleOption(opt)} />
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
            {activeTab === 'photos' ? ' fotos' : activeTab === 'options' ? ' opcionais' : ''}
          </div>
          <div className="flex gap-3 w-full sm:w-auto">
            <button onClick={onClose} className="flex-1 sm:flex-none px-6 py-2.5 text-slate-700 text-sm font-bold hover:bg-slate-200 rounded-xl transition-colors">
              Cancelar
            </button>
            <button form="edit-form" type="submit" disabled={isLoading} className="flex-1 sm:flex-none px-8 py-2.5 bg-indigo-600 text-white text-sm font-bold rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 flex items-center justify-center gap-2 disabled:opacity-70">
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Salvar Alterações
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
