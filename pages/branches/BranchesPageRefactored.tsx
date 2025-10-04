import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/Table';
import { FloatingInput, FloatingSelect } from '../../components/ui';
import { FilterSheet } from '../../components/ui/FilterSheet';
import { CascadingLocationSelect } from '../../components/ui/CascadingLocationSelect';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { PageLayout, TableActions, FormModal } from '../../components/shared';
import { usePagination, useModals, useFormData, useCrudOperations } from '../../hooks';
import { branchesApi } from '../../services/branches';
import { Branch, LocationFilter } from '../../types';

const BranchesPageRefactored: React.FC = () => {
  // Pagination and search
  const { page, limit, search, setPage, setLimit, setSearch } = usePagination();
  
  // Filters
  const [filters, setFilters] = React.useState<LocationFilter>({});
  
  // Modals
  const modals = useModals({
    initialStates: {
      filterSheet: false,
      createModal: false,
      editModal: false,
      deleteConfirm: false
    }
  });
  
  // Form data
  const { formData, setFormData, resetForm, setFormDataFromItem } = useFormData({
    initialData: {
      code: '',
      name: '',
      province: '',
      district: '',
      ward: '',
      address: '',
    }
  });
  
  // CRUD operations
  const {
    data: branches,
    total,
    isLoading,
    error,
    editingItem,
    deletingItem,
    setEditingItem,
    setDeletingItem,
    handleCreate,
    handleUpdate,
    handleDelete
  } = useCrudOperations({
    api: branchesApi,
    queryKey: 'branches',
    page,
    limit,
    search,
    filters,
    onSuccess: {
      create: () => {
        modals.closeModal('createModal');
        resetForm();
      },
      update: () => {
        modals.closeModal('editModal');
        resetForm();
      },
      delete: () => {
        modals.closeModal('deleteConfirm');
      }
    }
  });

  // Handlers
  const handleCreateClick = () => {
    resetForm();
    modals.openModal('createModal');
  };

  const handleEditClick = (branch: Branch) => {
    setFormDataFromItem(branch);
    setEditingItem(branch);
    modals.openModal('editModal');
  };

  const handleDeleteClick = (branch: Branch) => {
    setDeletingItem(branch);
    modals.openModal('deleteConfirm');
  };

  const handleCreateSubmit = () => {
    handleCreate(formData);
  };

  const handleUpdateSubmit = () => {
    if (editingItem) {
      handleUpdate(editingItem.id, formData);
    }
  };

  const handleDeleteConfirm = () => {
    if (deletingItem) {
      handleDelete(deletingItem.id);
    }
  };

  const handleFilterChange = (newFilters: LocationFilter) => {
    setFilters(newFilters);
    setPage(1);
  };

  const handleClearFilters = () => {
    setFilters({});
    setPage(1);
  };

  // Filter sheet fields
  const filterFields = [
    {
      key: 'location',
      label: 'Địa điểm',
      type: 'custom' as const,
      component: (
        <CascadingLocationSelect
          province={filters.province}
          district={filters.district}
          ward={filters.ward}
          onProvinceChange={(value) => setFilters(prev => ({ ...prev, province: value, district: '', ward: '' }))}
          onDistrictChange={(value) => setFilters(prev => ({ ...prev, district: value, ward: '' }))}
          onWardChange={(value) => setFilters(prev => ({ ...prev, ward: value }))}
          onClear={() => setFilters(prev => ({ ...prev, province: '', district: '', ward: '' }))}
        />
      )
    }
  ];

  return (
    <>
      <PageLayout
        data={branches}
        total={total}
        isLoading={isLoading}
        error={error}
        page={page}
        limit={limit}
        search={search}
        onPageChange={setPage}
        onLimitChange={setLimit}
        onSearchChange={setSearch}
        filters={filters}
        onFilterChange={handleFilterChange}
        onClearFilters={handleClearFilters}
        onCreateClick={handleCreateClick}
        onFilterClick={() => modals.openModal('filterSheet')}
        title="Quản lý Chi nhánh"
        createButtonText="Thêm chi nhánh"
        resource="branches"
      >
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Mã chi nhánh</TableHead>
              <TableHead>Tên chi nhánh</TableHead>
              <TableHead>Địa chỉ</TableHead>
              <TableHead>Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {branches?.map((branch) => (
              <TableRow key={branch.id}>
                <TableCell>{branch.code}</TableCell>
                <TableCell>{branch.name}</TableCell>
                <TableCell>{branch.address}</TableCell>
                <TableCell>
                  <TableActions
                    item={branch}
                    onEdit={handleEditClick}
                    onDelete={handleDeleteClick}
                    resource="branches"
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </PageLayout>

      {/* Filter Sheet */}
      <FilterSheet
        isOpen={modals.isOpen('filterSheet')}
        onClose={() => modals.closeModal('filterSheet')}
        title="Lọc dữ liệu"
        fields={filterFields}
        onApply={handleFilterChange}
        onReset={handleClearFilters}
      />

      {/* Create Modal */}
      <FormModal
        isOpen={modals.isOpen('createModal')}
        onClose={() => modals.closeModal('createModal')}
        title="Tạo chi nhánh"
        onSubmit={handleCreateSubmit}
        submitText="Tạo mới"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <FloatingInput
              label="Mã chi nhánh"
              value={formData.code}
              onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value }))}
              required
            />
            <FloatingInput
              label="Tên chi nhánh"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              required
            />
          </div>
          
          <FloatingInput
            label="Địa chỉ"
            value={formData.address}
            onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
            required
          />
          
          <div className="grid grid-cols-3 gap-4">
            <FloatingSelect
              label="Tỉnh/Thành Phố"
              value={formData.province}
              onChange={(value) => setFormData(prev => ({ ...prev, province: value }))}
              options={[
                { value: "HN", label: "Hà Nội" },
                { value: "HCM", label: "TP. Hồ Chí Minh" },
                { value: "DN", label: "Đà Nẵng" },
                { value: "CT", label: "Cần Thơ" }
              ]}
              required
            />
            <FloatingSelect
              label="Quận/ Huyện"
              value={formData.district}
              onChange={(value) => setFormData(prev => ({ ...prev, district: value }))}
              options={[
                { value: "NK", label: "Quận Ninh Kiều" },
                { value: "BD", label: "Quận Ba Đình" },
                { value: "Q1", label: "Quận 1" }
              ]}
              required
            />
            <FloatingSelect
              label="Phường/ Xã"
              value={formData.ward}
              onChange={(value) => setFormData(prev => ({ ...prev, ward: value }))}
              options={[
                { value: "AH", label: "Phường An Hoà" },
                { value: "PX", label: "Phường Phúc Xá" },
                { value: "BN", label: "Phường Bến Nghé" }
              ]}
              required
            />
          </div>
        </div>
      </FormModal>

      {/* Edit Modal */}
      <FormModal
        isOpen={modals.isOpen('editModal')}
        onClose={() => modals.closeModal('editModal')}
        title="Thông tin chi nhánh"
        onSubmit={handleUpdateSubmit}
        submitText="Lưu"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <FloatingInput
              label="Mã chi nhánh"
              value={formData.code}
              onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value }))}
              required
            />
            <FloatingInput
              label="Tên chi nhánh"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              required
            />
          </div>
          
          <FloatingInput
            label="Địa chỉ"
            value={formData.address}
            onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
            required
          />
          
          <div className="grid grid-cols-3 gap-4">
            <FloatingSelect
              label="Tỉnh/Thành Phố"
              value={formData.province}
              onChange={(value) => setFormData(prev => ({ ...prev, province: value }))}
              options={[
                { value: "HN", label: "Hà Nội" },
                { value: "HCM", label: "TP. Hồ Chí Minh" },
                { value: "DN", label: "Đà Nẵng" },
                { value: "CT", label: "Cần Thơ" }
              ]}
              required
            />
            <FloatingSelect
              label="Quận/ Huyện"
              value={formData.district}
              onChange={(value) => setFormData(prev => ({ ...prev, district: value }))}
              options={[
                { value: "NK", label: "Quận Ninh Kiều" },
                { value: "BD", label: "Quận Ba Đình" },
                { value: "Q1", label: "Quận 1" }
              ]}
              required
            />
            <FloatingSelect
              label="Phường/ Xã"
              value={formData.ward}
              onChange={(value) => setFormData(prev => ({ ...prev, ward: value }))}
              options={[
                { value: "AH", label: "Phường An Hoà" },
                { value: "PX", label: "Phường Phúc Xá" },
                { value: "BN", label: "Phường Bến Nghé" }
              ]}
              required
            />
          </div>
        </div>
      </FormModal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={modals.isOpen('deleteConfirm')}
        onClose={() => modals.closeModal('deleteConfirm')}
        onConfirm={handleDeleteConfirm}
        title="Xóa chi nhánh"
        message={`Bạn có chắc chắn muốn xóa chi nhánh "${deletingItem?.name}"?`}
        confirmText="Đồng ý"
        cancelText="Không"
      />
    </>
  );
};

export default BranchesPageRefactored;
