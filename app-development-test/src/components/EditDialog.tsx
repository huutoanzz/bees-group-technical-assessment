import { useState, useEffect } from 'react';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Calendar } from 'primereact/calendar';
import { Dropdown } from 'primereact/dropdown';
import { User } from '../types/user';
import { Message } from 'primereact/message';

interface EditDialogProps {
  visible: boolean;
  user: User | null;
  onHide: () => void;
  onSave: (user: User) => void;
  isCreateMode?: boolean;
}

const defaultUser: User = {
  id: '',
  name: '',
  email: '',
  balance: 0,
  registerAt: new Date(),
  active: true
};

const EditDialog = ({ visible, user, onHide, onSave, isCreateMode = false }: EditDialogProps) => {
  const [editedUser, setEditedUser] = useState<User>(defaultUser);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (user) {
      const registerAt = user.registerAt ? new Date(user.registerAt) : new Date();
      const localDate = new Date(
        registerAt.getUTCFullYear(),
        registerAt.getUTCMonth(),
        registerAt.getUTCDate()
      );
      setEditedUser({ ...user, registerAt: localDate });
    } else {
      setEditedUser({ ...defaultUser });
    }
    setErrors({});
    setTouched({});
  }, [user, visible]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!editedUser.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (editedUser.name.length < 6) {
      newErrors.name = 'Name must be at least 6 characters';
    }
    
    if (!editedUser.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(editedUser.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    
    if (isNaN(editedUser.balance)) {
      newErrors.balance = 'Balance must be a number';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleBlur = (field: string) => {
    setTouched({ ...touched, [field]: true });
    validate();
  };

  const handleSave = () => {
    if (!validate()) return;
    
    const registerAt = editedUser.registerAt ? new Date(editedUser.registerAt) : new Date();
    const utcDate = new Date(
      Date.UTC(
        registerAt.getFullYear(),
        registerAt.getMonth(),
        registerAt.getDate()
      )
    );
    onSave({ ...editedUser, registerAt: utcDate });
  };

  const minDate = new Date(2000, 0, 1);
  const maxDate = new Date();

  const isFieldInvalid = (field: string) => touched[field] && errors[field];

  return (
    <Dialog
      header={isCreateMode ? "Create New User" : "Edit User"}
      visible={visible}
      style={{ width: '50vw' }}
      onHide={onHide}
      footer={
        <div>
          <Button 
            label="Cancel" 
            icon="pi pi-times" 
            onClick={onHide} 
            className="p-button-text mr-3" 
          />
          <Button 
            label={isCreateMode ? "Create" : "Save"} 
            icon="pi pi-check" 
            onClick={handleSave} 
            autoFocus
            disabled={Object.keys(errors).length > 0}
          />
        </div>
      }
    >
      <div className="p-fluid grid">
        <div className="field col-12 md:col-6">
          <label htmlFor="name">Name</label>
          <InputText
            id="name"
            value={editedUser.name}
            onChange={(e) => setEditedUser({ ...editedUser, name: e.target.value })}
            onBlur={() => handleBlur('name')}
            className={`border p-2 ${isFieldInvalid('name') ? 'p-invalid' : ''}`}
          />
          {isFieldInvalid('name') && (
            <Message severity="error" text={errors.name} className="mt-1" />
          )}
        </div>
        <div className="field col-12 md:col-6">
          <label htmlFor="email">Email</label>
          <InputText
            id="email"
            value={editedUser.email}
            onChange={(e) => setEditedUser({ ...editedUser, email: e.target.value })}
            onBlur={() => handleBlur('email')}
            className={`border p-2 ${isFieldInvalid('email') ? 'p-invalid' : ''}`}
          />
          {isFieldInvalid('email') && (
            <Message severity="error" text={errors.email} className="mt-1" />
          )}
        </div>
        <div className="field col-12 md:col-6">
          <label htmlFor="balance">Balance</label>
          <InputText
            id="balance"
            value={editedUser.balance.toString()}
            onChange={(e) => setEditedUser({ 
              ...editedUser, 
              balance: parseFloat(e.target.value) || 0 
            })}
            onBlur={() => handleBlur('balance')}
            className={`border p-2 ${isFieldInvalid('balance') ? 'p-invalid' : ''}`}
          />
          {isFieldInvalid('balance') && (
            <Message severity="error" text={errors.balance} className="mt-1" />
          )}
        </div>
        <div className="field col-12 md:col-6">
          <label htmlFor="registerAt">Registration Date</label>
          <Calendar
            id="registerAt"
            value={editedUser.registerAt}
            onChange={(e) => {
              const selectedDate = e.value as Date;
              if (selectedDate) {
                const dateWithoutTime = new Date(
                  selectedDate.getFullYear(),
                  selectedDate.getMonth(),
                  selectedDate.getDate()
                );
                setEditedUser({
                  ...editedUser,
                  registerAt: dateWithoutTime
                });
              }
            }}
            showIcon
            className="border p-2"
            dateFormat="dd/mm/yy"
            disabled={isCreateMode ? false : true} 
            minDate={minDate} 
            maxDate={maxDate} 
          />
        </div>
        <div className="field col-12">
          <label htmlFor="active">Status</label>
          <Dropdown
            id="active"
            value={editedUser.active}
            options={[
              { label: 'Active', value: true },
              { label: 'Inactive', value: false }
            ]}
            onChange={(e) => setEditedUser({ ...editedUser, active: e.value })}
            placeholder="Select Status"
            className="border p-2"
          />
        </div>
      </div>
    </Dialog>
  );
};

export default EditDialog;