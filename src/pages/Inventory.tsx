import React, { useState, useEffect } from 'react';
import { Plus, Sparkles, Loader2, Edit2, ImageOff } from 'lucide-react';
import { supabase, type Vehicle, type VehicleStatus } from '../lib/supabase';
import { formatCurrency, formatKM, cn } from '../lib/utils';
import { AddVehicleModal } from '../components/Inventory/AddVehicleModal';
import { EditVehicleModal } from '../components/Inventory/EditVehicleModal';
import { AiOptimizationModal } from '../components/Inventory/AiOptimizationModal';

// Helper para cores dos badges
const getStatusBadgeInfo = (status: VehicleStatus) => {
  switch (status) {
    case 'available': return { label: 'Disponível', className: 'bg-green-100 text-green-700 border-green-200' };
    case 'reserved': return { label: 'Reservado', className: 'bg-amber-100 text-amber-700 border-amber-200' };
    case 'sold': return { label: 'Vendido', className: 'bg-red-100 text-red-700 border-red-200' };
    case 'maintenance': return { label: 'Manutenção', className: 'bg-slate-100 text-slate-700 border-slate-200' };
    case 'transit': return { label: 'Em Trânsito', className: 'bg-blue-100 text-blue-700 border-blue-200' };
    default: return { label: status, className: 'bg-slate-100 text-slate-700' };
  }
};

export default function Inventory() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modals State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);

  const fetchVehicles = async () => {
    setLoading(true);
    const { data } = await supabase.from('vehicles').select('*').order('created_at', { ascending: false });
    if (data) setVehicles(data as Vehicle[]);
    setLoading(false);
  };

  useEffect(() => { fetchVehicles(); }, []);

  // CORREÇÃO: Usar a imagem do banco sem tentar substituir por placeholders genéricos,
  // a menos que realmente não exista imagem.
  const getVehicleImage = (vehicle: Vehicle) => {
    if (vehicle.images && vehicle.images.length > 0) {
      return vehicle.images[0];
    }
    // Apenas se não tiver NENHUMA imagem, usa o fallback
    return `https://loremflickr.com/800/600/${encodeURIComponent(vehicle.make)},${encodeURIComponent(vehicle.model)}/all`;
  };

  // Handler para erro de carregamento da imagem
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    const target = e.target as HTMLImageElement;
    target.onerror = null; // Previne loop infinito
    // Fallback final visual apenas se a imagem do usuário quebrar
    target.src = "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=800&q=80";
  };

  return (
    <div className="space-y-6">
      <AddVehicleModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} onSuccess={fetchVehicles} />
      
      <EditVehicleModal 
        isOpen={!!editingVehicle} 
        onClose={() => setEditingVehicle(null)} 
        onSuccess={fetchVehicles} 
        vehicle={editingVehicle} 
      />

      <AiOptimizationModal isOpen={isAiModalOpen} onClose={() => setIsAiModalOpen(false)} />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Estoque</h2>
          <p className="text-slate-500">Gerencie seu inventário e status dos veículos.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => setIsAiModalOpen(true)} 
            className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-700 border border-indigo-100 rounded-lg text-sm font-medium hover:bg-indigo-100 transition-colors"
          >
            <Sparkles className="w-4 h-4" /> Otimizar com IA
          </button>
          <button 
            onClick={() => setIsAddModalOpen(true)} 
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 shadow-lg shadow-indigo-200"
          >
            <Plus className="w-4 h-4" /> Adicionar Veículo
          </button>
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-indigo-600" /></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {vehicles.map((vehicle) => {
            const statusInfo = getStatusBadgeInfo(vehicle.status);
            const imageUrl = getVehicleImage(vehicle);
            
            return (
              <div key={vehicle.id} className="bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-lg transition-all duration-300 group flex flex-col h-full">
                <div className="relative h-48 bg-slate-200 group overflow-hidden">
                  <img 
                    src={imageUrl}
                    onError={handleImageError}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    alt={`${vehicle.make} ${vehicle.model}`}
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  
                  {/* Status Badge */}
                  <div className="absolute top-3 right-3 z-10">
                    <span className={cn("px-2.5 py-1 rounded-md text-xs font-bold border shadow-sm uppercase tracking-wide bg-white/90 backdrop-blur-sm", statusInfo.className)}>
                      {statusInfo.label}
                    </span>
                  </div>
                </div>

                <div className="p-4 flex-1 flex flex-col">
                  <div className="mb-1">
                    <h3 className="font-bold text-slate-900 truncate text-lg" title={`${vehicle.make} ${vehicle.model}`}>{vehicle.make} {vehicle.model}</h3>
                  </div>
                  <p className="text-sm text-slate-500 mb-4 line-clamp-1">{vehicle.version} • {vehicle.year_model}</p>
                  
                  <div className="flex items-end justify-between mt-auto pt-4 border-t border-slate-50">
                    <div>
                      <p className="text-[10px] uppercase font-bold text-slate-400 mb-0.5">Preço de Venda</p>
                      <p className="text-xl font-bold text-indigo-600">{formatCurrency(vehicle.selling_price)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] uppercase font-bold text-slate-400 mb-0.5">Quilometragem</p>
                      <p className="text-sm font-medium text-slate-700">{formatKM(vehicle.mileage)}</p>
                    </div>
                  </div>
                </div>

                <div className="px-4 py-3 bg-slate-50 border-t border-slate-100 flex justify-between items-center">
                   <span className="text-xs text-slate-500 font-medium truncate max-w-[50%] flex items-center gap-1">
                     <div className="w-2 h-2 rounded-full bg-slate-300" /> {vehicle.color}
                   </span>
                   <button 
                    onClick={() => setEditingVehicle(vehicle)}
                    className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 px-3 py-1.5 rounded-lg transition-colors"
                   >
                     <Edit2 className="w-3.5 h-3.5" /> Editar
                   </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
