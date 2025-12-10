import React, { useEffect, useState } from 'react';
import { TrendingUp, Car, Users, AlertCircle, ArrowUpRight, ArrowDownRight, Loader2, Download, Plus, CheckCircle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { formatCurrency } from '../lib/utils';
import { supabase } from '../lib/supabase';
import { Modal } from '../components/Shared/Modal';

// Components
const StatCard = ({ title, value, trend, trendValue, icon: Icon, color, loading }: any) => (
  <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
    <div className="flex items-start justify-between mb-4">
      <div className={`p-3 rounded-lg ${color}`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      {trend && (
        <div className={`flex items-center gap-1 text-sm font-medium ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
          {trend === 'up' ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
          {trendValue}
        </div>
      )}
    </div>
    <h3 className="text-slate-500 text-sm font-medium mb-1">{title}</h3>
    <div className="h-8 flex items-center">
      {loading ? <Loader2 className="w-5 h-5 animate-spin text-slate-400" /> : <p className="text-2xl font-bold text-slate-900">{value}</p>}
    </div>
  </div>
);

export default function Dashboard() {
  const [stats, setStats] = useState({ vehiclesCount: 0, leadsCount: 0, salesTotal: 0 });
  const [loading, setLoading] = useState(true);
  const [isSaleModalOpen, setIsSaleModalOpen] = useState(false);
  
  // Sale Modal State
  const [availableVehicles, setAvailableVehicles] = useState<any[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState('');
  const [salePrice, setSalePrice] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [saleLoading, setSaleLoading] = useState(false);

  const fetchStats = async () => {
    try {
      const { count: vCount } = await supabase.from('vehicles').select('*', { count: 'exact', head: true }).eq('status', 'available');
      const { count: lCount } = await supabase.from('leads').select('*', { count: 'exact', head: true }).eq('status', 'new');
      
      // Sum sales from transactions
      const { data: salesData } = await supabase.from('financial_transactions').select('amount').eq('type', 'income');
      const totalSales = salesData?.reduce((acc, curr) => acc + Number(curr.amount), 0) || 0;

      setStats({ vehiclesCount: vCount || 0, leadsCount: lCount || 0, salesTotal: totalSales });
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleOpenSaleModal = async () => {
    const { data } = await supabase.from('vehicles').select('id, make, model, version, selling_price').eq('status', 'available');
    if (data) setAvailableVehicles(data);
    setIsSaleModalOpen(true);
  };

  const handleCreateSale = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaleLoading(true);
    try {
      const { data: dealerships } = await supabase.from('dealerships').select('id').limit(1);
      const dealerId = dealerships?.[0]?.id;
      if (!dealerId) throw new Error("Loja não encontrada");

      // 1. Create Sale Record
      const { error: saleError } = await supabase.from('sales').insert({
        dealership_id: dealerId,
        vehicle_id: selectedVehicle,
        customer_name: customerName,
        sale_price: Number(salePrice)
      });
      if (saleError) throw saleError;

      // 2. Update Vehicle Status
      await supabase.from('vehicles').update({ status: 'sold' }).eq('id', selectedVehicle);

      // 3. Create Financial Transaction
      await supabase.from('financial_transactions').insert({
        dealership_id: dealerId,
        description: `Venda Veículo - ${customerName}`,
        amount: Number(salePrice),
        type: 'income',
        category: 'Venda de Veículo',
        status: 'completed'
      });

      setIsSaleModalOpen(false);
      fetchStats(); // Refresh dashboard
      alert('Venda registrada com sucesso!');
    } catch (error) {
      console.error(error);
      alert('Erro ao registrar venda.');
    } finally {
      setSaleLoading(false);
    }
  };

  const handleExportReport = () => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + "Métrica,Valor\n"
      + `Vendas Total,${stats.salesTotal}\n`
      + `Veículos Disponíveis,${stats.vehiclesCount}\n`
      + `Novos Leads,${stats.leadsCount}`;
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "relatorio_dashboard.csv");
    document.body.appendChild(link);
    link.click();
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Visão Geral</h2>
          <p className="text-slate-500">Bem-vindo ao Hub Automotivo.</p>
        </div>
        <div className="flex gap-3">
          <button onClick={handleExportReport} className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-700 text-sm font-medium hover:bg-slate-50">
            <Download className="w-4 h-4" /> Exportar Relatório
          </button>
          <button onClick={handleOpenSaleModal} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 shadow-lg shadow-indigo-200">
            <Plus className="w-4 h-4" /> Nova Venda
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Faturamento Total" value={formatCurrency(stats.salesTotal)} trend="up" trendValue="+12.5%" icon={TrendingUp} color="bg-indigo-500" loading={loading} />
        <StatCard title="Veículos Disponíveis" value={stats.vehiclesCount} icon={Car} color="bg-blue-500" loading={loading} />
        <StatCard title="Leads Novos" value={stats.leadsCount} trend="up" trendValue="+4" icon={Users} color="bg-emerald-500" loading={loading} />
        <StatCard title="Avisos Pendentes" value="3" icon={AlertCircle} color="bg-amber-500" loading={false} />
      </div>

      {/* Charts Placeholder (Static for now, but looks good) */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <h3 className="text-lg font-bold text-slate-900 mb-6">Desempenho Semanal</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={[
              { name: 'Seg', vendas: 4000 }, { name: 'Ter', vendas: 3000 }, 
              { name: 'Qua', vendas: 2000 }, { name: 'Qui', vendas: 2780 }, 
              { name: 'Sex', vendas: 1890 }, { name: 'Sáb', vendas: 2390 }, 
              { name: 'Dom', vendas: 3490 }
            ]}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} />
              <YAxis axisLine={false} tickLine={false} />
              <Tooltip cursor={{ fill: '#f8fafc' }} />
              <Bar dataKey="vendas" fill="#6366f1" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Nova Venda Modal */}
      <Modal isOpen={isSaleModalOpen} onClose={() => setIsSaleModalOpen(false)} title="Registrar Nova Venda">
        <form onSubmit={handleCreateSale} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Veículo</label>
            <select 
              required
              className="w-full p-2 border border-slate-200 rounded-lg"
              value={selectedVehicle}
              onChange={(e) => {
                setSelectedVehicle(e.target.value);
                const v = availableVehicles.find(v => v.id === e.target.value);
                if (v) setSalePrice(v.selling_price.toString());
              }}
            >
              <option value="">Selecione um veículo...</option>
              {availableVehicles.map(v => (
                <option key={v.id} value={v.id}>{v.make} {v.model} {v.version} - {formatCurrency(v.selling_price)}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Nome do Cliente</label>
            <input 
              required
              type="text" 
              className="w-full p-2 border border-slate-200 rounded-lg"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="Ex: João da Silva"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Valor Final da Venda (R$)</label>
            <input 
              required
              type="number" 
              className="w-full p-2 border border-slate-200 rounded-lg"
              value={salePrice}
              onChange={(e) => setSalePrice(e.target.value)}
            />
          </div>
          <div className="pt-4 flex justify-end gap-2">
            <button type="button" onClick={() => setIsSaleModalOpen(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-50 rounded-lg">Cancelar</button>
            <button type="submit" disabled={saleLoading} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2">
              {saleLoading && <Loader2 className="w-4 h-4 animate-spin" />} Confirmar Venda
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
