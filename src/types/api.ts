export interface ApiMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  statusCode: number;
  message: string;
  data: T;
  meta?: ApiMeta;
}

export interface SearchResult {
  salons: import('./salon').Salon[];
  services: import('./salon').Service[];
  staff: import('./salon').Staff[];
}

export interface SearchSuggestion {
  id: string;
  name: string;
  type: 'salon' | 'service' | 'staff';
  subtitle?: string;
}
