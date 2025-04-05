import { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { ProgressSpinner } from 'primereact/progressspinner';
import { Tooltip } from 'primereact/tooltip';
import { Message } from 'primereact/message';
import axios, { AxiosError } from 'axios';
import { Tag } from 'primereact/tag';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { User } from '../types/user';
import EditDialog from './EditDialog';  
import DeleteDialog from './DeleteDialog';
import { Toast } from 'primereact/toast';
import { useRef } from 'react';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';

const API_URL = 'https://66359043415f4e1a5e24d37c.mockapi.io/users';

const fetchUsers = async (): Promise<User[]> => {
  try {
    const { data } = await axios.get<User[]>(API_URL);
    return data.map(user => ({
      ...user,
      registerAt: new Date(user.registerAt)
    }));
  } catch (error) {
    const err = error as AxiosError;
    throw new Error(err.message || 'Failed to fetch users data');
  }
};

const formatDate = (date: Date | string): string => {
  if (typeof date === 'string') {
    return new Date(date).toISOString().split('T')[0];
  }
  return date.toISOString().split('T')[0];
};

const UserTable = () => {
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const [searchText, setSearchText] = useState<string>('');
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
  const [isCreating, setIsCreating] = useState<boolean>(false);
  const [editDialogVisible, setEditDialogVisible] = useState<boolean>(false);
  const [deleteDialogVisible, setDeleteDialogVisible] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const toast = useRef<Toast>(null);
  const queryClient = useQueryClient();

  const { data: users, isLoading, isError, error } = useQuery<User[], Error>({
    queryKey: ['users'],
    queryFn: fetchUsers,
    retry: 2,
  });

  const filteredUsers = users?.filter(user =>
    user.name.toLowerCase().includes(searchText.toLowerCase())
  );

  useEffect(() => {
    if (isDarkMode) {
      document.body.classList.add('dark');
      document.body.classList.remove('light');
    } else {
      document.body.classList.remove('dark');
      document.body.classList.add('light');
    }
  }, [isDarkMode]);

  const handleEdit = (user: User) => {
    setCurrentUser(user);
    setIsCreating(false);
    setEditDialogVisible(true);
  };

  const handleCreate = () => {
    const newUser = {
      id: '',
      name: '',
      email: '',
      balance: 0,
      registerAt: new Date(),
      active: true,
    };
    setCurrentUser(newUser);
    setIsCreating(true);
    setEditDialogVisible(true);
  };

  const handleDelete = (user: User) => {
    setCurrentUser(user);
    setDeleteDialogVisible(true);
  };
  

  const handleSaveUser = async (userData: User) => {
    try {
      const { data: users } = await axios.get<User[]>(API_URL);
      const isEmailDuplicate = users.some(
        user => user.email === userData.email && user.id !== userData.id
      );
  
      if (isEmailDuplicate) {
        toast.current?.show({
          severity: 'error',
          summary: 'Error',
          detail: 'Email already exists for another user',
          life: 3000
        });
        return;
      }
  
      if (isCreating) {
        await axios.post(API_URL, {
          ...userData,
          registerAt: new Date().toISOString()
        });
        toast.current?.show({
          severity: 'success',
          summary: 'Success',
          detail: 'User created successfully',
          life: 3000
        });
      } else {
        await axios.put(`${API_URL}/${userData.id}`, userData);
        toast.current?.show({
          severity: 'success',
          summary: 'Success',
          detail: 'User updated successfully',
          life: 3000
        });
      }
  
      setEditDialogVisible(false);
      queryClient.invalidateQueries({ queryKey: ['users'] });
    } catch (error) {
      console.error('Error saving user:', error);
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: isCreating ? 'Failed to create user' : 'Failed to update user',
        life: 3000
      });
    }
  };

  const handleDeleteUser = async () => {
    try {
      if (currentUser && currentUser.id) {
        await axios.delete(`https://66359043415f4e1a5e24d37c.mockapi.io/users/${currentUser.id}`);
        console.log('User deleted:', currentUser);
        setDeleteDialogVisible(false);
        
        toast.current?.show({
          severity: 'success',
          summary: 'Success',
          detail: 'User deleted successfully',
          life: 3000
        });
        queryClient.invalidateQueries({ queryKey: ['users'] })
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to delete user',
        life: 3000
      });
    }
  };

  const handleBulkDelete = async () => {
    if (!selectedUsers.length) return;
  
    confirmDialog({
      message: (
        <div className="flex align-items-center">
          <i 
            className="pi pi-exclamation-triangle mr-3" 
            style={{ fontSize: '2rem', color: 'var(--yellow-500)' }} 
          />
          <div>
            <p className="font-medium mb-2">
              Are you sure you want to delete <span className="text-primary font-semibold">{selectedUsers.length}</span> selected user(s)?
            </p>
            <p className="text-sm text-color-secondary">
              This action cannot be undone. All associated data will be permanently removed.
            </p>
          </div>
        </div>
      ),
      header: 'Confirm Deletion',
      accept: async () => {
        try {
          const deletePromises = selectedUsers.map(user => 
            axios.delete(`${API_URL}/${user.id}`)
          );
          await Promise.all(deletePromises);
          
          toast.current?.show({
            severity: 'success',
            summary: 'Success',
            detail: `Deleted ${selectedUsers.length} user(s) successfully`,
            life: 3000
          });
          
          setSelectedUsers([]);
          queryClient.invalidateQueries({ queryKey: ['users'] });
        } catch {
          toast.current?.show({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to delete selected users',
            life: 3000
          });
        }
      },
      reject: () => {
        toast.current?.show({
          severity: 'info',
          summary: 'Cancelled',
          detail: 'Deletion was cancelled',
          life: 2000
        });
      },
      acceptLabel: 'Delete',
      rejectLabel: 'Cancel',
      acceptClassName: 'p-button-danger',
      rejectClassName: 'p-button-text',
      acceptIcon: 'pi pi-trash',
      rejectIcon: 'pi pi-times',
      className: 'custom-confirm-dialog',
      style: { width: '30vw', minWidth: '350px' },
      breakpoints: { '960px': '75vw', '640px': '75vw' },
      footer: (options) => (
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
          <Button 
            label={options.rejectLabel} 
            icon={options.rejectIcon} 
            onClick={options.reject} 
            className={options.rejectClassName} 
          />
          <Button 
            label={options.acceptLabel} 
            icon={options.acceptIcon} 
            onClick={options.accept} 
            autoFocus 
            severity="danger"
          />
        </div>
      )
    });
  };
  
  if (isLoading) {
    return (
      <div className="flex flex-column justify-center items-center" style={{ height: '50vh' }}>
        <ProgressSpinner
          strokeWidth="4"
          animationDuration=".5s"
          style={{ width: '50px', height: '50px' }}
        />
        <span className="mt-3 text-lg">Loading users data...</span>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex justify-center items-center" style={{ height: '50vh' }}>
        <Message
          severity="error"
          text={`Error: ${error.message}`}
          className="w-full md:w-1/2"
        />
      </div>
    );
  }

  return (
    <div className="p-4">
      <Toast ref={toast} />
      <ConfirmDialog />
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-5">
        <div className="flex items-center gap-2 p-2 rounded-xl shadow-md w-2/3">
          <i className="pi pi-search"></i>
          <InputText
            placeholder="Search for users..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="flex-1 p-2 bg-transparent focus:outline-none"
          />
        </div>


        <div className="flex gap-2">
          {selectedUsers.length > 0 && (
              <Button
                label={`Delete (${selectedUsers.length})`}
                icon="pi pi-trash"
                onClick={handleBulkDelete}
                className="p-button-danger p-button-rounded p-button-outlined"
                severity="danger"
              />
            )}
          <Button
            label="Create User"
            icon="pi pi-plus"
            onClick={handleCreate}
            className="p-button-rounded p-button-outlined p-2 w-full md:w-auto"
          />
          <Button
            label={`${isDarkMode ? 'Light Mode' : 'Dark Mode'}`}
            icon={`pi pi-${isDarkMode ? 'sun' : 'moon'}`}
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="p-button-rounded p-button-outlined"
          />
        </div>
      </div>

      {/* DataTable */}
      <DataTable
        value={filteredUsers}
        scrollable
        scrollHeight="550px"
        paginator
        rows={10}
        rowsPerPageOptions={[5, 10, 15, 20, 25, 50]}
        resizableColumns
        columnResizeMode="expand"
        reorderableColumns
        selection={selectedUsers}
        onSelectionChange={(e) => setSelectedUsers(e.value as User[])}
        dataKey="id"
        selectionMode="multiple"
        className="p-datatable-striped p-datatable-responsive"
        currentPageReportTemplate="{totalRecords} results"
        paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
        filterDisplay="menu"
      >
        <Column selectionMode="multiple" headerStyle={{ width: '3rem' }} />
        <Column field="name" header="Name" sortable filter />
        <Column
          field="balance"
          header="Balance ($)"
          sortable
          filter
          body={(row) => `$${row.balance.toLocaleString()}`}
        />
        <Column
          field="email"
          header="Email"
          filter
          body={(row) => (
            <a
              href={`mailto:${row.email}`}
              className="text-blue-500 hover:text-blue-700 hover:underline"
            >
              {row.email}
            </a>
          )}
        />
        <Column
          field="registerAt"
          header="Registration"
          sortable
          filter
          body={(row) => (
            <span data-pr-tooltip={new Date(row.registerAt).toLocaleString()}>
              {formatDate(row.registerAt)}
            </span>
          )}
        />
        <Column
          field="active"
          header="STATUS"
          filter
          filterField="active"
          filterMatchMode="equals"
          dataType="boolean"
          body={(row) => (
            <Tag
              value={row.active ? 'Active' : 'Inactive'}
              severity={row.active ? 'success' : 'danger'}
            />
          )}
          filterElement={(options) => (
            <Dropdown
              value={options.value}
              options={[
                { label: 'Active', value: true },
                { label: 'Inactive', value: false },
                { label: 'All', value: null }
              ]}
              onChange={(e) => options.filterCallback(e.value)}
              placeholder="Select Status"
              showClear
              className="p-column-filter"
            />
          )}
        />
        <Column
          header="ACTION"
          body={(row) => (
            <div className="flex gap-2">
              <Button
                icon="pi pi-pencil"
                className="p-button-rounded p-button-text p-button-warning"
                tooltip="Edit user"
                tooltipOptions={{ position: 'top' }}
                onClick={() => handleEdit(row)}
              />
              <Button
                icon="pi pi-trash"
                className="p-button-rounded p-button-text p-button-danger"
                tooltip="Delete user"
                tooltipOptions={{ position: 'top' }}
                onClick={() => handleDelete(row)}
              />
            </div>
          )}
          style={{ width: '160px', textAlign: 'center' }}
        />
      </DataTable>
      <Tooltip target="span[data-pr-tooltip]" />

      <EditDialog
        visible={editDialogVisible}
        user={currentUser}
        isCreateMode={isCreating} 
        onHide={() => setEditDialogVisible(false)}
        onSave={handleSaveUser}
      />
      <DeleteDialog
        visible={deleteDialogVisible}
        user={currentUser}
        onHide={() => setDeleteDialogVisible(false)}
        onDelete={handleDeleteUser}
      />
    </div>
  );
};

export default UserTable;