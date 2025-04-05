import { useState, useEffect } from 'react';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Calendar } from 'primereact/calendar';
import { Dropdown } from 'primereact/dropdown';
import { User } from '../types/user';

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

  useEffect(() => {
    setEditedUser(user ? { ...user } : { ...defaultUser });
  }, [user, visible]);

  const handleSave = () => {
    onSave(editedUser);
  };

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
            className="border p-2"
          />
        </div>
        <div className="field col-12 md:col-6">
          <label htmlFor="email">Email</label>
          <InputText
            id="email"
            value={editedUser.email}
            onChange={(e) => setEditedUser({ ...editedUser, email: e.target.value })}
            className="border p-2"
          />
        </div>
        <div className="field col-12 md:col-6">
          <label htmlFor="balance">Balance</label>
          <InputText
            id="balance"
            value={editedUser.balance.toString()}
            onChange={(e) => setEditedUser({ ...editedUser, balance: parseFloat(e.target.value) || 0 })}
            className="border p-2"
          />
        </div>
        <div className="field col-12 md:col-6">
          <label htmlFor="registerAt">Registration Date</label>
          <Calendar
            id="registerAt"
            value={new Date(editedUser.registerAt)}
            onChange={(e) => setEditedUser({ ...editedUser, registerAt: e.value as Date })}
            showIcon
            className="border p-2"
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