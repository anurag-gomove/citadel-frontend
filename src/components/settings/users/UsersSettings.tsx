
import { useEffect } from "react";
import { EditUserDialog } from "./components/EditUserDialog";
import { CreateUserDialog } from "./components/CreateUserDialog";
import { UsersList } from "./components/UsersList";
import { UsersHeader } from "./components/UsersHeader";
import { useUserManagement } from "./hooks/useUserManagement";
import { ensureSuperAdmin } from "./utils/userUtils";

export function UsersSettings() {
  const {
    users,
    isLoading,
    error,
    editUser,
    showCreateDialog,
    showToastMessage,
    setShowCreateDialog,
    handleEdit,
    handleCloseEditDialog,
    handleUserUpdated,
    handleDelete,
    refetch,
  } = useUserManagement();

  useEffect(() => {
    if (users && users.length > 0) {
      ensureSuperAdmin(users, showToastMessage);
    }
  }, [users, showToastMessage]);

  // Force a refetch when the component mounts and whenever showCreateDialog changes
  useEffect(() => {
    console.log("UsersSettings mounted or dialog state changed, forcing refetch");
    refetch();
  }, [refetch, showCreateDialog]);

  const handleCreateUserSuccess = () => {
    console.log("User created, refreshing list");
    
    // First, immediately trigger a refetch attempt
    refetch();
    
    // Then do multiple delayed refetches to ensure we get the latest data
    const delays = [1000, 2500, 4000, 6000]; // Try multiple times with increasing delays
    
    delays.forEach(delay => {
      setTimeout(() => {
        console.log(`Performing delayed refetch after ${delay}ms`);
        refetch();
      }, delay);
    });
    
    handleUserUpdated();
  };

  return (
    <div className="container mx-auto py-6">
      <UsersHeader onCreateUser={() => setShowCreateDialog(true)} />
      
      <UsersList 
        users={users}
        isLoading={isLoading}
        error={error}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      {editUser && (
        <EditUserDialog
          user={editUser}
          open={!!editUser}
          onClose={handleCloseEditDialog}
          onSuccess={handleUserUpdated}
        />
      )}

      <CreateUserDialog 
        open={showCreateDialog} 
        onClose={() => setShowCreateDialog(false)} 
        onSuccess={handleCreateUserSuccess}
      />
    </div>
  );
}
