
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TableCell, TableRow } from "@/components/ui/table";
import { Profile } from "@/types/database";
import { formatRoleName, getRoleBadgeVariant, isSebastienGodbout } from "../utils/userUtils";

interface UserRowProps {
  user: Profile;
  onEdit: (user: Profile) => void;
  onDelete: (userId: string) => void;
  totalSuperAdmins: number;
}

export function UserRow({ user, onEdit, onDelete, totalSuperAdmins }: UserRowProps) {
  // Determine if this user can be deleted
  const canDelete = (user.role !== 'super_admin' || totalSuperAdmins > 1) && 
                   !isSebastienGodbout(user);

  return (
    <TableRow>
      <TableCell className="font-medium">{user.first_name}</TableCell>
      <TableCell>{user.last_name}</TableCell>
      <TableCell>{user.email}</TableCell>
      <TableCell>
        <Badge variant={getRoleBadgeVariant(user.role)} className="font-normal">
          {formatRoleName(user.role)}
        </Badge>
      </TableCell>
      <TableCell className="text-right">
        <Button variant="outline" size="sm" onClick={() => onEdit(user)} className="mr-2">
          Edit
        </Button>
        {canDelete && (
          <Button variant="outline" size="sm" onClick={() => onDelete(user.id)}>
            Delete
          </Button>
        )}
      </TableCell>
    </TableRow>
  );
}
