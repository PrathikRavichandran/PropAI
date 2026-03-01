export interface Property {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  type: string;
  status: string;
  bed: number;
  bath: number;
  image_url: string;
  current_principal?: number;
  monthly_payment?: number;
  bank_name?: string;
  tenant_name?: string;
  monthly_rent?: number;
  payment_status?: string;
}

export interface Tenant {
  id: string;
  property_id: string;
  name: string;
  phone: string;
  email: string;
  occupation: string;
  rent_amount: number;
  security_deposit: number;
  pet_deposit: number;
  lease_start: string;
  lease_end: string;
  lease_duration: number;
  pet_policy: string;
  renewal_status: string;
  payment_status: string;
}

export interface Loan {
  id: string;
  property_id: string;
  lender_name: string;
  loan_amount: number;
  interest_rate: number;
  start_date: string;
  tenure_months: number;
  emi_amount: number;
  emi_due_date: string;
  outstanding_balance: number;
  last_payment_date: string;
  status: string;
}

export interface Appliance {
  id: string;
  property_id: string;
  name: string;
  brand: string;
  model: string;
  purchase_date: string;
  warranty_start: string;
  warranty_end: string;
  insurance_covered: string;
  insurance_provider: string;
  last_service_date: string;
  status: string;
  contact_number: string;
  contractor_name: string;
  contractor_email: string;
}

export interface Escrow {
  id: string;
  property_id: string;
  agency_name: string;
  payment_year: number;
  property_tax: number;
  insurance: number;
  hoa_fees: number;
  payment_date: string;
  next_due_date: string;
}

export interface Alert {
  type: 'payment_overdue' | 'lease_end' | 'emi_due' | 'escrow_due' | 'warranty_end' | 'rent_paid';
  message: string;
  date: string;
}

export interface MaintenanceRequest {
  id: number;
  property_id: string;
  tenant_id: string;
  description: string;
  status: 'pending' | 'scheduled' | 'completed';
  priority: 'low' | 'normal' | 'high' | 'emergency';
  reported_date: string;
  assigned_contractor_id?: number;
  ai_summary?: string;
  address?: string; // joined
  contractor_name?: string; // joined
}

export interface FinanceSummary {
  total_rent: number;
  total_mortgage: number;
  total_debt: number;
  total_asset_value: number;
}

export interface HistoricalFinance {
  month: string;
  revenue: number;
  expenses: number;
  profit: number;
}
