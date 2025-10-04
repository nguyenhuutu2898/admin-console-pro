import { PageResponse, ApiResponse, FilterBase } from '../types';

export interface BaseApiOptions {
  baseUrl?: string;
  timeout?: number;
}

export interface PaginationParams {
  page: number;
  limit: number;
  q?: string;
}

export interface CrudApi<T, CreateData, UpdateData, Filter extends FilterBase = {}> {
  getItems: (params: PaginationParams & Filter) => Promise<PageResponse<T>>;
  getItem: (id: string) => Promise<T>;
  createItem: (data: CreateData) => Promise<T>;
  updateItem: (id: string, data: UpdateData) => Promise<T>;
  deleteItem: (id: string) => Promise<void>;
}

export class BaseApiService<T, CreateData, UpdateData, Filter extends FilterBase = {}> {
  protected baseUrl: string;
  protected timeout: number;

  constructor(options: BaseApiOptions = {}) {
    this.baseUrl = options.baseUrl || '/api';
    this.timeout = options.timeout || 10000;
  }

  protected async request<R>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<R> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`API request failed for ${endpoint}:`, error);
      throw error;
    }
  }

  protected buildQueryString(params: Record<string, any>): string {
    const searchParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        searchParams.append(key, String(value));
      }
    });
    
    return searchParams.toString();
  }
}

// Generic CRUD operations mixin
export function withCrudOperations<T extends { id: string }, CreateData, UpdateData, Filter extends FilterBase = {}>(
  baseService: BaseApiService<T, CreateData, UpdateData, Filter>,
  resourceName: string
): CrudApi<T, CreateData, UpdateData, Filter> {
  return {
    async getItems(params: PaginationParams & Filter): Promise<PageResponse<T>> {
      const queryString = baseService.buildQueryString(params);
      return baseService.request<PageResponse<T>>(`/${resourceName}?${queryString}`);
    },

    async getItem(id: string): Promise<T> {
      return baseService.request<T>(`/${resourceName}/${id}`);
    },

    async createItem(data: CreateData): Promise<T> {
      return baseService.request<T>(`/${resourceName}`, {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },

    async updateItem(id: string, data: UpdateData): Promise<T> {
      return baseService.request<T>(`/${resourceName}/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
    },

    async deleteItem(id: string): Promise<void> {
      await baseService.request<void>(`/${resourceName}/${id}`, {
        method: 'DELETE',
      });
    },
  };
}
