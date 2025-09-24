import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Input } from '../../components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Search, Users, ShoppingCart, Package } from '../../components/Icons';
import { usersApi, customersApi, productsApi, ordersApi } from '../../services/api';
import { useDebounce } from '../../hooks/useDebounce';

const SearchPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  const { data: usersData } = useQuery({
    queryKey: ['search-users', debouncedSearchTerm],
    queryFn: () => usersApi.getUsers({ q: debouncedSearchTerm, limit: 5 }),
    enabled: debouncedSearchTerm.length > 0,
  });

  const { data: customersData } = useQuery({
    queryKey: ['search-customers', debouncedSearchTerm],
    queryFn: () => customersApi.getCustomers({ q: debouncedSearchTerm, limit: 5 }),
    enabled: debouncedSearchTerm.length > 0,
  });

  const { data: productsData } = useQuery({
    queryKey: ['search-products', debouncedSearchTerm],
    queryFn: () => productsApi.getProducts({ q: debouncedSearchTerm, limit: 5 }),
    enabled: debouncedSearchTerm.length > 0,
  });

  const { data: ordersData } = useQuery({
    queryKey: ['search-orders', debouncedSearchTerm],
    queryFn: () => ordersApi.getOrders({ q: debouncedSearchTerm, limit: 5 }),
    enabled: debouncedSearchTerm.length > 0,
  });

  const totalResults = (usersData?.total || 0) + 
                      (customersData?.total || 0) + 
                      (productsData?.total || 0) + 
                      (ordersData?.total || 0);

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Global Search</h1>
        <p className="text-gray-600">Search across users, customers, products and orders</p>
      </div>

      {/* Search Input */}
      <div className="mb-8">
        <div className="relative max-w-2xl">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <Input
            type="text"
            placeholder="Enter keywords to search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 h-12 text-lg"
          />
        </div>
        {debouncedSearchTerm && (
          <p className="mt-2 text-sm text-gray-600">
            Found {totalResults} results for "{debouncedSearchTerm}"
          </p>
        )}
      </div>

      {/* Search Results */}
      {debouncedSearchTerm && (
        <div className="grid gap-6 md:grid-cols-2">
          {/* Users Results */}
          <Card>
            <CardHeader className="flex flex-row items-center gap-2">
              <Users className="h-5 w-5 text-blue-600" />
              <CardTitle className="text-lg">Users ({usersData?.total || 0})</CardTitle>
            </CardHeader>
            <CardContent>
              {usersData?.data.length === 0 ? (
                <p className="text-gray-500">No users found</p>
              ) : (
                <div className="space-y-3">
                  {usersData?.data.map((user) => (
                    <div key={user.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                        {user.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium">{user.name}</p>
                        <p className="text-sm text-gray-600">{user.email}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Customers Results */}
          <Card>
            <CardHeader className="flex flex-row items-center gap-2">
              <Users className="h-5 w-5 text-green-600" />
              <CardTitle className="text-lg">Customers ({customersData?.total || 0})</CardTitle>
            </CardHeader>
            <CardContent>
              {customersData?.data.length === 0 ? (
                <p className="text-gray-500">No customers found</p>
              ) : (
                <div className="space-y-3">
                  {customersData?.data.map((customer) => (
                    <div key={customer.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                        {customer.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium">{customer.name}</p>
                        <p className="text-sm text-gray-600">{customer.email}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Products Results */}
          <Card>
            <CardHeader className="flex flex-row items-center gap-2">
              <Package className="h-5 w-5 text-purple-600" />
              <CardTitle className="text-lg">Products ({productsData?.total || 0})</CardTitle>
            </CardHeader>
            <CardContent>
              {productsData?.data.length === 0 ? (
                <p className="text-gray-500">No products found</p>
              ) : (
                <div className="space-y-3">
                  {productsData?.data.map((product) => (
                    <div key={product.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className="w-8 h-8 bg-purple-600 rounded flex items-center justify-center text-white font-semibold text-sm">
                        P
                      </div>
                      <div>
                        <p className="font-medium">{product.name}</p>
                        <p className="text-sm text-gray-600">{product.category} • ${product.price.toFixed(2)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Orders Results */}
          <Card>
            <CardHeader className="flex flex-row items-center gap-2">
              <ShoppingCart className="h-5 w-5 text-orange-600" />
              <CardTitle className="text-lg">Orders ({ordersData?.total || 0})</CardTitle>
            </CardHeader>
            <CardContent>
              {ordersData?.data.length === 0 ? (
                <p className="text-gray-500">No orders found</p>
              ) : (
                <div className="space-y-3">
                  {ordersData?.data.map((order) => (
                    <div key={order.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className="w-8 h-8 bg-orange-600 rounded flex items-center justify-center text-white font-semibold text-sm">
                        O
                      </div>
                      <div>
                        <p className="font-medium">{order.customerName}</p>
                        <p className="text-sm text-gray-600">{order.id} • ${order.total.toFixed(2)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* No Search Term */}
      {!debouncedSearchTerm && (
        <div className="text-center py-12">
          <Search className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Start searching</h3>
          <p className="text-gray-500">Enter keywords in the search box to begin</p>
        </div>
      )}
    </div>
  );
};

export default SearchPage;
