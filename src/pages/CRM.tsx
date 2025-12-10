import React, { useEffect, useState } from 'react';
import { MessageCircle, Phone, Loader2, Plus, GripVertical, User } from 'lucide-react';
import { supabase, type Lead } from '../lib/supabase';
import { Modal } from '../components/Shared/Modal';

// Simple Drag and Drop Implementation
const LeadCard = ({ lead, onDragStart, onClick }: any) => (
  <div 
    draggable
    onDragStart={(e) => onDragStart(e, lead.id)}
    onClick={() => onClick(lead)}
    className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm hover:shadow-md transition-all cursor-grab active:cursor-grabbing group border-l-4 border-l-transparent hover:border-l-indigo-500 mb-3"
  >
    <div className="flex justify-between items-start mb-2">
      <h4 className="font-bold text-slate-800 text-sm">{lead.name}</h4>
      <GripVertical className="w-4 h-4 text-slate-300 opacity-0 group-hover:opacity-100" />
    </div>
    <p className="text-xs text-slate-600 mb-3">{lead.vehicle_interest || 'Interesse Geral'}</p>
    <div className="flex items-center justify-between pt-3 border-t border-slate-50">
      <div className="flex gap-2">
        <button className="p-1.5 hover:bg-green-50 text-slate-400 hover:text-green-600 rounded" title="WhatsApp"><MessageCircle className="w-4 h-4" /></button>
      </div>
      <span className="text-[10px] text-slate-400">{new Date(lead.created_at).toLocaleDateString('pt-BR')}</span>
    </div>
  </div>
);

export default function CRM() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [isNewLeadModalOpen, setIsNewLeadModalOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  
  // New Lead Form State
  const [newLeadName, setNewLeadName] = useState('');
  const [newLeadPhone, setNewLeadPhone] = useState('');
  const [newLeadInterest, setNewLeadInterest] = useState('');
  const [isCreating, setIsCreating] = useState(false); // Estado para loading do botão

  const fetchLeads = async () => {
    const { data } = await supabase.from('leads').select('*').order('created_at', { ascending: false });
    if (data) setLeads(data as Lead[]);
    setLoading(false);
  };

  useEffect(() => { fetchLeads(); }, []);

  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData("leadId", id);
  };

  const handleDrop = async (e: React.DragEvent, status: string) => {
    const id = e.dataTransfer.getData("leadId");
    if (!id) return;

    // Optimistic UI Update
    setLeads(prev => prev.map(l => l.id === id ? { ...l, status: status as any } : l));

    // DB Update
    await supabase.from('leads').update({ status }).eq('id', id);
  };

  const handleDragOver = (e: React.DragEvent) => e.preventDefault();

  const handleCreateLead = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true); // Inicia loading

    try {
      const { data: dealerships } = await supabase.from('dealerships').select('id').limit(1);
      
      // 1. Inserção com .select() para retornar o objeto criado
      const { data, error } = await supabase.from('leads').insert({
        dealership_id: dealerships?.[0]?.id,
        name: newLeadName,
        phone: newLeadPhone,
        vehicle_interest: newLeadInterest,
        status: 'new',
        source: 'manual'
      }).select(); // <--- IMPORTANTE: Retorna os dados inseridos

      if (error) throw error;

      // 2. Atualização Otimista do Estado (Adiciona ao topo da lista)
      if (data && data.length > 0) {
        const createdLead = data[0] as Lead;
        setLeads(prev => [createdLead, ...prev]);
      }

      // 3. Limpeza e Fechamento
      setIsNewLeadModalOpen(false);
      setNewLeadName(''); 
      setNewLeadPhone(''); 
      setNewLeadInterest('');
      
    } catch (error) {
      console.error('Erro ao criar lead:', error);
      alert('Erro ao criar lead. Tente novamente.');
    } finally {
      setIsCreating(false); // Para loading
    }
  };

  const columns = [
    { id: 'new', title: 'Novos', color: 'blue' },
    { id: 'contact', title: 'Em Contato', color: 'amber' },
    { id: 'proposal', title: 'Proposta', color: 'purple' },
    { id: 'won', title: 'Vendido', color: 'emerald' }
  ];

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-slate-900">CRM</h2>
        <button onClick={() => setIsNewLeadModalOpen(true)} className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 flex items-center gap-2 shadow-lg shadow-indigo-200">
          <Plus className="w-4 h-4" /> Novo Lead
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
        </div>
      ) : (
        <div className="flex gap-6 overflow-x-auto pb-4 h-full">
          {columns.map(col => (
            <div 
              key={col.id} 
              onDrop={(e) => handleDrop(e, col.id)}
              onDragOver={handleDragOver}
              className="flex-1 min-w-[300px] bg-slate-100/50 rounded-xl p-4 flex flex-col h-[calc(100vh-12rem)] border border-slate-200/50"
            >
              <div className={`flex items-center justify-between mb-4 pb-3 border-b border-${col.color}-200`}>
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full bg-${col.color}-500`} />
                  <h3 className="font-bold text-slate-700">{col.title}</h3>
                </div>
                <span className="bg-white px-2 py-0.5 rounded text-xs font-bold text-slate-500 border border-slate-200">
                  {leads.filter(l => l.status === col.id).length}
                </span>
              </div>
              <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                {leads.filter(l => l.status === col.id).map(lead => (
                  <LeadCard key={lead.id} lead={lead} onDragStart={handleDragStart} onClick={setSelectedLead} />
                ))}
                {leads.filter(l => l.status === col.id).length === 0 && (
                   <div className="h-24 flex items-center justify-center border-2 border-dashed border-slate-200 rounded-lg text-slate-400 text-xs">
                     Arraste leads para cá
                   </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* New Lead Modal */}
      <Modal isOpen={isNewLeadModalOpen} onClose={() => setIsNewLeadModalOpen(false)} title="Novo Lead">
        <form onSubmit={handleCreateLead} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Nome do Cliente</label>
            <input 
              required 
              placeholder="Ex: João da Silva" 
              value={newLeadName} 
              onChange={e => setNewLeadName(e.target.value)} 
              className="w-full p-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all" 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Telefone / WhatsApp</label>
            <input 
              required 
              placeholder="(00) 00000-0000" 
              value={newLeadPhone} 
              onChange={e => setNewLeadPhone(e.target.value)} 
              className="w-full p-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all" 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Interesse</label>
            <input 
              placeholder="Ex: Toyota Corolla 2024" 
              value={newLeadInterest} 
              onChange={e => setNewLeadInterest(e.target.value)} 
              className="w-full p-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all" 
            />
          </div>
          <div className="flex justify-end pt-4 gap-2">
            <button 
              type="button"
              onClick={() => setIsNewLeadModalOpen(false)}
              className="px-4 py-2 text-slate-600 hover:bg-slate-50 rounded-lg text-sm font-medium"
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              disabled={isCreating}
              className="bg-indigo-600 text-white px-6 py-2 rounded-lg text-sm font-bold hover:bg-indigo-700 flex items-center gap-2 disabled:opacity-70"
            >
              {isCreating && <Loader2 className="w-4 h-4 animate-spin" />}
              Salvar Lead
            </button>
          </div>
        </form>
      </Modal>

      {/* Lead Details Modal */}
      <Modal isOpen={!!selectedLead} onClose={() => setSelectedLead(null)} title="Detalhes do Lead">
        {selectedLead && (
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center border border-slate-200">
                <User className="w-8 h-8 text-slate-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900">{selectedLead.name}</h3>
                <p className="text-slate-500 font-medium">{selectedLead.phone}</p>
                <span className={`inline-block mt-1 px-2 py-0.5 rounded text-xs font-bold uppercase ${
                  selectedLead.status === 'new' ? 'bg-blue-100 text-blue-700' :
                  selectedLead.status === 'won' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'
                }`}>
                  {selectedLead.status === 'new' ? 'Novo' : selectedLead.status}
                </span>
              </div>
            </div>
            
            <div className="bg-slate-50 p-5 rounded-xl border border-slate-100">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Veículo de Interesse</p>
              <p className="text-lg font-medium text-slate-800">{selectedLead.vehicle_interest || 'Não informado'}</p>
            </div>

            <div className="flex gap-3 pt-2">
              <button className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors shadow-lg shadow-green-100">
                <MessageCircle className="w-5 h-5" /> WhatsApp
              </button>
              <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors shadow-lg shadow-blue-100">
                <Phone className="w-5 h-5" /> Ligar
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
