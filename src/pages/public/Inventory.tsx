import React, { useState, useEffect } from 'react';
import { Search, Filter } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { formatCurrency, formatKM } from '../../lib/utils';

export default function PublicInventory() {
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase.from('vehicles').select('*').eq('status', 'available');
      if (data) setVehicles(data);
      setLoading(false);
    };
    fetch();
  }, []);

  const filtered = vehicles.filter(v => 
    v.make.toLowerCase().includes(filter.toLowerCase()) || 
    v.model.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="bg-slate-50 min-h-screen py-12">
      <div className="container mx-auto px-4">
        <div className="bg-white rounded-2xl p-6 shadow-sm mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input 
                type="text" 
                placeholder="Busque por marca ou modelo..." 
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                value={filter}
                onChange={e => setFilter(e.target.value)}
              />
            </div>
            <button className="px-6 py-3 bg-slate-100 text-slate-700 font-medium rounded-xl hover:bg-slate-200 flex items-center gap-2 justify-center">
              <Filter className="w-5 h-5" /> Filtros Avançados
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filtered.map(vehicle => (
            <div key={vehicle.id} className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 group">
              <div className="relative h-56 overflow-hidden bg-slate-200">
                <img 
                  src={vehicle.images?.[0] || `https://img-wrapper.vercel.app/image?url=https://img-wrapper.vercel.app/image?url=https://placehold.co/600x400/e2e8f0/94a3b8?text=${vehicle.make}`} 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                  <p className="text-white font-bold text-lg">{vehicle.make} {vehicle.model}</p>
                </div>
              </div>
              <div className="p-5">
                <div className="flex justify-between text-sm text-slate-500 mb-4">
                  <span>{vehicle.year_model}</span>
                  <span>{formatKM(vehicle.mileage)}</span>
                </div>
                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-2xl font-bold text-indigo-600">{formatCurrency(vehicle.selling_price)}</span>
                  <button className="px-4 py-2 bg-indigo-600 text-white text-sm font-bold rounded-lg hover:bg-indigo-700">
                    Ver Detalhes
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
