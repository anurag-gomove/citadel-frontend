
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PlusCircle, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface PropertySearchBarProps {
  search: string;
  onSearchChange: (value: string) => void;
}

export function PropertySearchBar({ search, onSearchChange }: PropertySearchBarProps) {
  const navigate = useNavigate();

  return (
    <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div className="flex-1 w-full">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
          <Input
            id="search"
            type="search"
            placeholder="Search by name or address..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 py-6 text-base w-full"
          />
        </div>
      </div>
      <Button size="lg" onClick={() => navigate("/properties/new")} className="whitespace-nowrap">
        <PlusCircle className="mr-2 h-5 w-5" />
        Add Property
      </Button>
    </div>
  );
}
