import React from 'react';
import { 
  PageLayout, 
  usePageState, 
  DataTable, 
  Pagination,
  FilterButton,
  AddButton,
  type TableColumn,
  type TableAction
} from '../ui';

// Example data type
interface ExampleItem {
  id: string;
  name: string;
  code: string;
  status: 'active' | 'inactive';
  updatedAt: string;
}

// Example data
const exampleData: ExampleItem[] = [
  {
    id: '1',
    name: 'CN Sở giao dịch - PGD số 5',
    code: '1200',
    status: 'active',
    updatedAt: '2022-03-25T19:47:00Z'
  },
  {
    id: '2',
    name: 'CN Sở giao dịch - PGD số 1',
    code: '1220',
    status: 'active',
    updatedAt: '2022-03-25T19:47:00Z'
  },
  {
    id: '3',
    name: 'CN Sở giao dịch',
    code: '1230',
    status: 'inactive',
    updatedAt: '2022-03-25T19:47:00Z'
  }
];

/**
 * Demo component showing how to use the new reusable components
 */
export const ComponentDemo: React.FC = () => {
  const { 
    searchTerm, 
    setSearchTerm, 
    currentPage, 
    setCurrentPage, 
    itemsPerPage, 
    setItemsPerPage 
  } = usePageState();

  // Filter data based on search term
  const filteredData = exampleData.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.code.includes(searchTerm)
  );

  // Paginate data
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedData = filteredData.slice(startIndex, endIndex);

  // Define table columns
  const columns: TableColumn<ExampleItem>[] = [
    {
      key: 'code',
      header: 'Mã CN',
      render: (item) => (
        <span className="font-medium">{item.code}</span>
      )
    },
    {
      key: 'originalCode',
      header: 'Mã CN gốc',
      render: (item) => (
        <span className="text-sm text-gray-600">{item.code}</span>
      )
    },
    {
      key: 'name',
      header: 'Tên chi nhánh',
      render: (item) => (
        <div className="font-medium">{item.name}</div>
      )
    },
    {
      key: 'updatedAt',
      header: 'Ngày cập nhật',
      render: (item) => (
        <div className="text-sm">
          <div>{new Date(item.updatedAt).toLocaleDateString('vi-VN')}</div>
          <div className="text-gray-500">{new Date(item.updatedAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</div>
        </div>
      )
    }
  ];

  // Define table actions
  const actions: TableAction<ExampleItem>[] = [
    {
      label: 'Xem chi tiết',
      onClick: (item) => alert(`View details for ${item.name}`)
    },
    {
      label: 'Chỉnh sửa',
      onClick: (item) => alert(`Edit ${item.name}`)
    },
    {
      label: 'Xóa',
      onClick: (item) => alert(`Delete ${item.name}`),
      variant: 'destructive'
    }
  ];

  const handleFilter = (): void => {
    alert('Filter functionality');
  };

  const handleAdd = (): void => {
    alert('Add new item functionality');
  };

  return (
    <PageLayout
      title="Demo Component"
      searchPlaceholder="Tìm kiếm mã chi nhánh, tên chi nhánh..."
      searchValue={searchTerm}
      onSearchChange={setSearchTerm}
      actionButtons={
        <>
          <FilterButton onClick={handleFilter} />
          <AddButton onClick={handleAdd} label="THÊM MỚI" />
        </>
      }
    >
      <DataTable
        data={paginatedData}
        columns={columns}
        actions={actions}
        isLoading={false}
        emptyMessage="Không tìm thấy dữ liệu nào"
        getItemKey={(item) => item.id}
      />

      <Pagination
        currentPage={currentPage}
        totalItems={filteredData.length}
        itemsPerPage={itemsPerPage}
        onPageChange={setCurrentPage}
        onItemsPerPageChange={setItemsPerPage}
        isLoading={false}
      />
    </PageLayout>
  );
};
