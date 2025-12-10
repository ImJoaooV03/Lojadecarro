import React, { useState, useEffect } from 'react';
import { FileText, Plus, Copy, Loader2, Download, Calendar, User, Trash2, Eye, Printer } from 'lucide-react';
import { supabase, type ContractTemplate } from '../lib/supabase';
import { Modal } from '../components/Shared/Modal';

export default function Contracts() {
  const [activeTab, setActiveTab] = useState<'list' | 'templates'>('list');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  
  const [templates, setTemplates] = useState<ContractTemplate[]>([]);
  const [contracts, setContracts] = useState<any[]>([]);
  const [viewContract, setViewContract] = useState<any | null>(null);

  // Dados para geração
  const [customerName, setCustomerName] = useState('');

  // Fetch Data
  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch Templates
      const { data: tmplData } = await supabase.from('contract_templates').select('*');
      if (tmplData) setTemplates(tmplData);

      // Fetch Real Contracts
      const { data: contData } = await supabase.from('contracts').select('*').order('created_at', { ascending: false });
      if (contData) setContracts(contData);
    } catch (error) {
      console.error("Erro ao buscar dados:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleGenerateContract = async (template: ContractTemplate) => {
    if (!customerName.trim()) {
      alert("Por favor, digite o nome do cliente.");
      return;
    }

    setGenerating(true);
    try {
      const { data: dealerships } = await supabase.from('dealerships').select('id').limit(1);
      const dealershipId = dealerships?.[0]?.id;

      if (!dealershipId) throw new Error("Loja não encontrada");

      // Substituição simples de variáveis (Simulação)
      const filledContent = template.content
        .replace(/{{nome}}/g, customerName)
        .replace(/{{data}}/g, new Date().toLocaleDateString('pt-BR'));

      const { error } = await supabase.from('contracts').insert({
        dealership_id: dealershipId,
        title: template.title,
        customer_name: customerName,
        content: filledContent,
        status: 'active'
      });

      if (error) throw error;

      alert(`Contrato "${template.title}" gerado com sucesso!`);
      setIsModalOpen(false);
      setCustomerName('');
      fetchData(); // Recarrega a lista
    } catch (error) {
      console.error(error);
      alert("Erro ao gerar contrato.");
    } finally {
      setGenerating(false);
    }
  };

  const handleDeleteContract = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este contrato?")) return;
    
    try {
      await supabase.from('contracts').delete().eq('id', id);
      fetchData();
    } catch (error) {
      console.error(error);
    }
  };

  const handlePrint = () => {
    const printContent = document.getElementById('printable-contract');
    if (printContent) {
      const win = window.open('', '', 'height=700,width=800');
      if (win) {
        win.document.write('<html><head><title>Imprimir Contrato</title>');
        win.document.write('<style>body { font-family: sans-serif; padding: 40px; line-height: 1.6; }</style>');
        win.document.write('</head><body>');
        win.document.write(printContent.innerHTML);
        win.document.write('</body></html>');
        win.document.close();
        win.print();
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Gestão de Contratos</h2>
          <p className="text-slate-500">Emita e gerencie documentos legais.</p>
        </div>
        <div className="flex gap-2 bg-slate-100 p-1 rounded-lg">
          <button 
            onClick={() => setActiveTab('list')} 
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'list' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
          >
            Meus Contratos
          </button>
          <button 
            onClick={() => setActiveTab('templates')} 
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'templates' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
          >
            Modelos / Templates
          </button>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="ml-4 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 flex items-center gap-2 shadow-lg shadow-indigo-200">
          <Plus className="w-4 h-4" /> Novo Contrato
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-indigo-600" /></div>
      ) : (
        <>
          {activeTab === 'list' && (
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
              {contracts.length > 0 ? (
                <table className="w-full">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Documento</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Cliente</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Data</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Status</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {contracts.map((c) => (
                      <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg"><FileText className="w-5 h-5" /></div>
                            <span className="font-medium text-slate-900">{c.title}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600">{c.customer_name}</td>
                        <td className="px-6 py-4 text-sm text-slate-500">{new Date(c.created_at).toLocaleDateString('pt-BR')}</td>
                        <td className="px-6 py-4">
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700 border border-green-200 uppercase">
                            {c.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-3">
                            <button 
                              onClick={() => setViewContract(c)}
                              className="text-slate-500 hover:text-indigo-600 text-sm font-medium flex items-center gap-1"
                              title="Visualizar"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button onClick={() => handleDeleteContract(c.id)} className="text-red-400 hover:text-red-600" title="Excluir">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="p-12 text-center">
                  <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FileText className="w-8 h-8 text-slate-300" />
                  </div>
                  <h3 className="text-lg font-medium text-slate-900">Nenhum contrato gerado</h3>
                  <p className="text-slate-500 max-w-sm mx-auto mt-2">Seus contratos gerados aparecerão aqui. Utilize o botão "Novo Contrato" para criar.</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'templates' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {templates.length > 0 ? templates.map(t => (
                <div key={t.id} className="bg-white p-6 rounded-xl border border-slate-200 hover:border-indigo-500 hover:shadow-md transition-all group relative overflow-hidden">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2.5 bg-slate-100 text-slate-600 group-hover:bg-indigo-50 group-hover:text-indigo-600 rounded-lg transition-colors">
                      <Copy className="w-6 h-6" />
                    </div>
                    <h3 className="font-bold text-slate-900 group-hover:text-indigo-700 transition-colors">{t.title}</h3>
                  </div>
                  <p className="text-sm text-slate-500 line-clamp-3 mb-4">{t.content.substring(0, 100)}...</p>
                  <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
                    <span className="px-2 py-1 bg-slate-100 rounded uppercase">{t.type}</span>
                  </div>
                </div>
              )) : (
                <div className="col-span-3 text-center py-12 text-slate-500">Carregando modelos...</div>
              )}
            </div>
          )}
        </>
      )}

      {/* Modal Novo Contrato */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Novo Contrato">
        <div className="space-y-6">
          <div>
             <label className="block text-sm font-medium text-slate-700 mb-1">Nome do Cliente</label>
             <input 
                type="text" 
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Ex: Maria Oliveira"
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
             />
          </div>

          <div>
            <p className="text-sm font-medium text-slate-700 mb-2">Selecione um modelo:</p>
            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
              {templates.map(t => (
                <button 
                  key={t.id} 
                  onClick={() => handleGenerateContract(t)}
                  disabled={generating}
                  className="w-full text-left p-4 border border-slate-200 rounded-xl hover:bg-indigo-50 hover:border-indigo-200 transition-all flex justify-between items-center group disabled:opacity-50"
                >
                  <div>
                    <span className="font-bold text-slate-800 block group-hover:text-indigo-900">{t.title}</span>
                    <span className="text-xs text-slate-500 uppercase">{t.type}</span>
                  </div>
                  {generating ? <Loader2 className="w-4 h-4 animate-spin text-indigo-600" /> : <span className="text-indigo-600 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">Gerar →</span>}
                </button>
              ))}
            </div>
          </div>
        </div>
      </Modal>

      {/* Modal Visualizar Contrato */}
      <Modal isOpen={!!viewContract} onClose={() => setViewContract(null)} title="Visualizar Contrato" size="lg">
        {viewContract && (
          <div className="space-y-6">
            <div className="bg-slate-50 p-8 rounded-xl border border-slate-200 font-serif text-slate-800 leading-relaxed whitespace-pre-wrap" id="printable-contract">
              <h1 className="text-2xl font-bold text-center mb-8 uppercase">{viewContract.title}</h1>
              {viewContract.content}
              <div className="mt-12 pt-8 border-t border-slate-300 grid grid-cols-2 gap-8">
                 <div className="text-center">
                   <div className="h-px bg-slate-400 w-3/4 mx-auto mb-2"></div>
                   <p className="text-sm font-bold">AutoPremium Motors</p>
                 </div>
                 <div className="text-center">
                   <div className="h-px bg-slate-400 w-3/4 mx-auto mb-2"></div>
                   <p className="text-sm font-bold">{viewContract.customer_name}</p>
                 </div>
              </div>
            </div>
            
            <div className="flex justify-end gap-3">
              <button onClick={() => setViewContract(null)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg">Fechar</button>
              <button onClick={handlePrint} className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2 shadow-lg">
                <Printer className="w-4 h-4" /> Imprimir / Salvar PDF
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
