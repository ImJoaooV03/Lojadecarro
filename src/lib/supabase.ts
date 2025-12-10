import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// --- TYPES ---

export type VehicleStatus = 'available' | 'reserved' | 'sold' | 'maintenance' | 'transit';

export type Vehicle = {
  id: string;
  make: string;
  model: string;
  version: string;
  year_manufacture: number;
  year_model: number;
  selling_price: number;
  purchase_price?: number;
  fipe_price?: number;
  mileage: number;
  color: string;
  fuel: string;
  transmission: string;
  engine?: string;
  plate_end?: string;
  status: VehicleStatus;
  plate?: string;
  description?: string;
  images?: string[];
  options?: string[];
  created_at?: string;
};

export type Lead = {
  id: string;
  name: string;
  phone: string;
  email?: string;
  source: string;
  vehicle_interest?: string;
  status: 'new' | 'contact' | 'proposal' | 'negotiation' | 'won' | 'lost';
  temperature: 'cold' | 'warm' | 'hot';
  notes?: string;
  created_at: string;
};

export type Transaction = {
  id: string;
  description: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  date: string;
  status: 'pending' | 'completed';
  created_at?: string;
};

export type ContractTemplate = {
  id: string;
  title: string;
  content: string;
  type: string;
};

export type StyleOverrides = {
  hero_title_size?: string;
  hero_padding?: string;
  section_spacing?: string;
  button_border_width?: string;
  card_shadow?: string;
};

export type ChatMessage = {
  id: string;
  role: 'user' | 'ai';
  content: string;
  timestamp?: number;
};

export type SiteConfig = {
  id?: string;
  dealership_id?: string;
  // Design System
  template_id: 'modern' | 'classic' | 'minimal' | 'bold' | 'luxury' | 'sport' | 'urban' | 'eco';
  primary_color: string;
  button_color: string;
  font_family: 'sans' | 'serif' | 'mono';
  border_radius: string; 
  
  // Advanced Styles (JSONB)
  style_overrides?: StyleOverrides;
  
  // Chat History (JSONB)
  chat_history?: ChatMessage[];

  // Content
  hero_title: string;
  hero_subtitle: string;
  contact_phone: string;
  contact_address: string;
  social_instagram: string;
  
  // Assets
  logo_url?: string;
  banner_url?: string;
  
  // Visibility
  show_hero: boolean;
  show_features: boolean;
  show_inventory: boolean;
  show_about: boolean;
  
  // SEO
  seo_title?: string;
  seo_description?: string;
};
