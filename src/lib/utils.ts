import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

export const formatKM = (value: number) => {
  return new Intl.NumberFormat('pt-BR').format(value) + ' km';
};

// Mapa de cores EXTENDIDO para garantir que o Tailwind gere as classes
export const getSafeTextColor = (bgClass: string | undefined) => {
  if (!bgClass) return 'text-indigo-600';
  
  const map: Record<string, string> = {
    // Indigo
    'bg-indigo-600': 'text-indigo-600',
    'bg-indigo-500': 'text-indigo-500',
    'bg-indigo-900': 'text-indigo-900',
    // Blue
    'bg-blue-600': 'text-blue-600',
    'bg-blue-500': 'text-blue-500',
    'bg-blue-900': 'text-blue-900',
    // Red
    'bg-red-600': 'text-red-600',
    'bg-red-500': 'text-red-500',
    // Emerald/Green
    'bg-emerald-600': 'text-emerald-600',
    'bg-green-600': 'text-green-600',
    'bg-green-500': 'text-green-500',
    // Slate/Black
    'bg-slate-900': 'text-slate-900',
    'bg-black': 'text-black',
    'bg-gray-900': 'text-gray-900',
    // Violet/Purple
    'bg-violet-600': 'text-violet-600',
    'bg-purple-600': 'text-purple-600',
    // Amber/Orange
    'bg-amber-500': 'text-amber-500',
    'bg-amber-600': 'text-amber-600',
    'bg-orange-500': 'text-orange-500',
    // Pink
    'bg-pink-600': 'text-pink-600',
  };

  return map[bgClass] || 'text-indigo-600';
};
