import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { User } from '../types/user';

interface DeleteDialogProps {
  visible: boolean;
  user: User | null;
  onHide: () => void;
  onDelete: () => void;
  isLoading?: boolean;
}

const DeleteDialog = ({ visible, user, onHide, onDelete, isLoading = false }: DeleteDialogProps) => {
  return (
    <Dialog
      header="Confirm Deletion"
      visible={visible}
      style={{ width: '30vw', minWidth: '350px' }}
      onHide={onHide}
      modal
      breakpoints={{ '960px': '75vw', '640px': '90vw' }}
      footer={
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
          <Button 
            label="Cancel" 
            icon="pi pi-times" 
            onClick={onHide} 
            className="p-button-text" 
            disabled={isLoading}
          />
          <Button 
            label={isLoading ? 'Deleting...' : 'Delete'} 
            icon={isLoading ? 'pi pi-spinner pi-spin' : 'pi pi-trash'} 
            onClick={onDelete} 
            autoFocus 
            severity="danger"
            loading={isLoading}
          />
        </div>
      }
    >
      <div className="flex align-items-center">
        <i 
          className="pi pi-exclamation-triangle mr-3" 
          style={{ fontSize: '2rem', color: 'var(--yellow-500)' }} 
        />
        <div>
          {user && (
            <>
              <p className="font-medium mb-2">
                Are you sure you want to delete <span className="text-primary font-semibold">{user.name}</span>?
              </p>
              <p className="text-sm text-color-secondary">
                This action cannot be undone. All associated data will be permanently removed.
              </p>
            </>
          )}
        </div>
      </div>
    </Dialog>
  );
};

export default DeleteDialog;