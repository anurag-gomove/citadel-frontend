
import { Profile } from "@/types/database";
import {
  Table,
  TableBody,
  TableCaption,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { UserRow } from "./UserRow";
import { TableCell } from "@/components/ui/table";

interface UsersListProps {
  users: Profile[] | undefined;
  isLoading: boolean;
  error: Error | null;
  onEdit: (user: Profile) => void;
  onDelete: (userId: string) => void;
}

export function UsersList({ users, isLoading, error, onEdit, onDelete }: UsersListProps) {
  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div className="bg-background">
      <Table>
        <TableCaption>A list of all users in your account.</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">First Name</TableHead>
            <TableHead>Last Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users?.map((user) => (
            <UserRow 
              key={user.id} 
              user={user} 
              onEdit={onEdit} 
              onDelete={onDelete}
              totalSuperAdmins={users.filter(u => u.role === 'super_admin').length}
            />
          ))}
        </TableBody>
        <TableFooter>
          <TableRow>
            <TableCell colSpan={5}>
              {users?.length} Users
            </TableCell>
          </TableRow>
        </TableFooter>
      </Table>
    </div>
  );
}
