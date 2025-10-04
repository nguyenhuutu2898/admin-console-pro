import { mockApi } from './mock-api';
import { TransactionType, PageResp, Paging, Search } from '../types';

// Combine all query parameters
type TransactionTypesQuery = Paging & Search;

export const transactionTypesApi = {
  // GET /transaction-types
  getTransactionTypes: async (params: TransactionTypesQuery = {}): Promise<PageResp<TransactionType>> => {
    return await mockApi.getTransactionTypes(params);
  },

  // GET /transaction-types/:id
  getTransactionType: async (id: string): Promise<TransactionType> => {
    const types = await mockApi.getTransactionTypes({});
    const type = types.items.find(t => t.id === id);
    if (!type) throw new Error('Transaction type not found');
    return type;
  },

  // PUT /transaction-types/:id
  updateTransactionType: async (id: string, data: Partial<TransactionType>): Promise<TransactionType> => {
    return await mockApi.updateTransactionType(id, data);
  },
};
