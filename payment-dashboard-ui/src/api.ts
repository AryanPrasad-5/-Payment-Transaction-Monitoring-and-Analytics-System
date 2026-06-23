const API_BASE = '/api/v1';

export interface Transaction {
  transaction_id: string;
  merchant_id: string;
  amount: number;
  status: string;
  payment_method: string;
  created_at: string;
}

export interface MerchantStats {
  merchant_id: string;
  total_transactions: number;
  failed_transactions: number;
  total_amount: number;
  success_rate: number;
}

export interface DailySummary {
  date: string;
  total_transactions: number;
  total_amount: number;
  failed_transactions: number;
  success_rate: number;
}

export interface Metrics {
  total_ingested: number;
  total_succeeded: number;
  total_failed: number;
  grpc_errors: number;
  db_errors: number;
  uptime: string;
}

export async function fetchTransactions(limit = 50, offset = 0): Promise<{ count: number; data: Transaction[] }> {
  const res = await fetch(`${API_BASE}/transactions/?limit=${limit}&offset=${offset}`);
  if (!res.ok) throw new Error('Failed to fetch transactions');
  return res.json();
}

export async function fetchMetrics(): Promise<Metrics> {
  const res = await fetch('/metrics');
  if (!res.ok) throw new Error('Failed to fetch metrics');
  return res.json();
}

export async function fetchMerchantStats(merchantId: string): Promise<MerchantStats> {
  const res = await fetch(`${API_BASE}/merchants/${merchantId}/stats`);
  if (!res.ok) throw new Error('Failed to fetch merchant stats');
  return res.json();
}

export async function fetchDailySummaries(from?: string, to?: string): Promise<{ count: number; data: DailySummary[] }> {
  const params = new URLSearchParams();
  if (from) params.set('from', from);
  if (to) params.set('to', to);
  const qs = params.toString() ? `?${params.toString()}` : '';
  const res = await fetch(`${API_BASE}/analytics/daily${qs}`);
  if (!res.ok) throw new Error('Failed to fetch daily summaries');
  return res.json();
}
