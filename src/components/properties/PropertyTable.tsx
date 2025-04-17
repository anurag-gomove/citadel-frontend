
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Property } from "@/types/database";

interface PropertyTableProps {
  properties: Property[];
}

export function PropertyTable({ properties }: PropertyTableProps) {
  const navigate = useNavigate();

  return (
    <Table className="border-0 shadow-none">
      <TableCaption>A list of your properties.</TableCaption>
      <TableHeader>
        <TableRow className="border-b border-t-0">
          <TableHead className="w-[200px]">Name</TableHead>
          <TableHead>Address</TableHead>
          <TableHead>City</TableHead>
          <TableHead>Classification</TableHead>
          <TableHead>Type</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {properties.map((property) => (
          <TableRow key={property.id} className="border-b">
            <TableCell className="font-medium">{property.name}</TableCell>
            <TableCell>{property.address}</TableCell>
            <TableCell>{property.city}</TableCell>
            <TableCell>{property.primary_classification || "Not specified"}</TableCell>
            <TableCell>{property.secondary_classification || property.type}</TableCell>
            <TableCell className="text-right">
              <Button 
                variant="secondary" 
                size="sm" 
                onClick={() => navigate(`/properties/${property.id}`)}
              >
                View Details
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
      <TableFooter>
        <TableRow>
          <TableCell colSpan={6}>
            {properties.length} Properties
          </TableCell>
        </TableRow>
      </TableFooter>
    </Table>
  );
}
