import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Car, 
  Users, 
  DollarSign, 
  FileText, 
  Settings, 
  LogOut,
  Zap,
  Globe
} from 'lucide-react';
import { cn } from '../../lib/utils';

const menuItems = [
  { icon: LayoutDashboard, label: 'Visão Geral', path: '/' },
  { icon: Car, label: 'Estoque', path: '/inventory' },
  { icon: Users, label: 'CRM & Leads', path: '/crm' },
  { icon: DollarSign, label: 'Financeiro', path: '/finance' },
  { icon: FileText, label: 'Contratos', path: '/contracts' },
  { icon: Globe, label: 'Meu Site', path: '/website-editor' },
  { icon: Settings, label: 'Configurações', path: '/settings' },
];

export function Sidebar() {
  const location = useLocation();

  return (
    <aside className="w-64 bg-slate-900 text-white h-screen fixed left-0 top-0 flex flex-col border-r border-slate-800">
      <div className="p-6 flex items-center gap-2 border-b border-slate-800">
        <div className="bg-indigo-600 p-2 rounded-lg">
          <Zap className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="font-bold text-lg leading-none">Hub Auto</h1>
          <span className="text-xs text-indigo-400 font-medium">Intelligence AI</span>
        </div>
      </div>

      <nav className="flex-1 py-6 px-3 space-y-1">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group",
                isActive 
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-900/20" 
                  : "text-slate-400 hover:bg-slate-800 hover:text-white"
              )}
            >
              <item.icon className={cn("w-5 h-5", isActive ? "text-white" : "text-slate-500 group-hover:text-white")} />
              <span className="font-medium text-sm">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-800">
        <div className="bg-slate-800/50 rounded-xl p-4 mb-4 border border-slate-700">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-xs font-semibold text-slate-300">Sistema Operacional</span>
          </div>
          <p className="text-xs text-slate-500">AutoPremium Matriz</p>
        </div>
        
        <button className="flex items-center gap-2 text-slate-400 hover:text-red-400 transition-colors w-full px-2 py-2">
          <LogOut className="w-5 h-5" />
          <span className="text-sm font-medium">Sair</span>
        </button>
      </div>
    </aside>
  );
}
