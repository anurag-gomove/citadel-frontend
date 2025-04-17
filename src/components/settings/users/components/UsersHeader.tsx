
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";

interface UsersHeaderProps {
  onCreateUser: () => void;
}

export function UsersHeader({ onCreateUser }: UsersHeaderProps) {
  return (
    <div className="flex flex-row items-center justify-between mb-6">
      <div>
        <h2 className="text-2xl font-semibold">Users</h2>
        <p className="text-sm text-muted-foreground">
          Manage users and their roles.
        </p>
      </div>
      <Button 
        onClick={onCreateUser}
        className="flex items-center gap-2"
      >
        <PlusCircle className="h-4 w-4" />
        Add User
      </Button>
    </div>
  );
}
