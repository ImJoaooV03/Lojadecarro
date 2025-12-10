import React, { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, TrendingDown, Plus, Calendar, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { supabase, type Transaction } from '../lib/supabase';
import { formatCurrency, cn } from '../lib/utils';
import { Modal } from '../components/Shared/Modal';

export default function Finance() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 7)); // YYYY-MM

  // Form
  const [desc, setDesc] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState('expense');
  const [category, setCategory] = useState('');

  const fetchTransactions = async () => {
    const { data } = await supabase.from('financial_transactions')
      .select('*')
      .gte('date', `${selectedDate}-01`)
      .lte('date', `${selectedDate}-31`)
      .order('date', { ascending: false });
    if (data) setTransactions(data as any);
  };

  useEffect(() => { fetchTransactions(); }, [selectedDate]);

  const handleAddTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    const { data: dealerships } = await supabase.from('dealerships').select('id').limit(1);
    await supabase.from('financial_transactions').insert({
      dealership_id: dealerships?.[0]?.id,
      description: desc,
      amount: Number(amount),
      type,
      category,
      date: new Date().toISOString(),
      status: 'completed'
    });
    setIsModalOpen(false);
    fetchTransactions();
  };

  const income = transactions.filter(t => t.type === 'income').reduce((acc, t) => acc + Number(t.amount), 0);
  const expense = transactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + Number(t.amount), 0);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-900">Financeiro</h2>
        <div className="flex gap-3">
           <input 
            type="month" 
            value={selectedDate} 
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-4 py-2 border border-slate-200 rounded-lg text-sm"
          />
          <button onClick={() => setIsModalOpen(true)} className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 flex items-center gap-2">
            <Plus className="w-4 h-4" /> Nova Transação
          </button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl border border-slate-200">
          <p className="text-sm text-slate-500">Receitas</p>
          <h3 className="text-2xl font-bold text-green-600">{formatCurrency(income)}</h3>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200">
          <p className="text-sm text-slate-500">Despesas</p>
          <h3 className="text-2xl font-bold text-red-600">{formatCurrency(expense)}</h3>
        </div>
        <div className="bg-indigo-600 p-6 rounded-xl border border-indigo-700 text-white">
          <p className="text-sm text-indigo-200">Saldo</p>
          <h3 className="text-2xl font-bold">{formatCurrency(income - expense)}</h3>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Descrição</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Categoria</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Valor</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {transactions.map(t => (
              <tr key={t.id}>
                <td className="px-6 py-4 text-sm font-medium text-slate-900">{t.description}</td>
                <td className="px-6 py-4 text-sm text-slate-500">{t.category}</td>
                <td className={cn("px-6 py-4 text-sm font-bold", t.type === 'income' ? "text-green-600" : "text-red-600")}>
                  {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Adicionar Transação">
        <form onSubmit={handleAddTransaction} className="space-y-4">
          <div className="flex gap-4">
            <label className="flex-1 cursor-pointer">
              <input type="radio" name="type" checked={type === 'income'} onChange={() => setType('income')} className="hidden peer" />
              <div className="p-3 text-center border rounded-lg peer-checked:bg-green-50 peer-checked:border-green-500 peer-checked:text-green-700">Receita</div>
            </label>
            <label className="flex-1 cursor-pointer">
              <input type="radio" name="type" checked={type === 'expense'} onChange={() => setType('expense')} className="hidden peer" />
              <div className="p-3 text-center border rounded-lg peer-checked:bg-red-50 peer-checked:border-red-500 peer-checked:text-red-700">Despesa</div>
            </label>
          </div>
          <input required placeholder="Descrição" value={desc} onChange={e => setDesc(e.target.value)} className="w-full p-2 border rounded-lg" />
          <input required type="number" placeholder="Valor (R$)" value={amount} onChange={e => setAmount(e.target.value)} className="w-full p-2 border rounded-lg" />
          <input required placeholder="Categoria (Ex: Aluguel, Venda)" value={category} onChange={e => setCategory(e.target.value)} className="w-full p-2 border rounded-lg" />
          <button className="w-full bg-indigo-600 text-white py-2 rounded-lg">Salvar</button>
        </form>
      </Modal>
    </div>
  );
}
