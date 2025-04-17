
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function PropertyListEmpty() {
  const navigate = useNavigate();
  
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="flex justify-between items-center p-8">
        <h1 className="text-xl font-semibold">Properties</h1>
        <Button 
          onClick={() => navigate("/properties/new")}
          variant="default"
          className="bg-white text-black hover:bg-gray-100"
        >
          Add Property
        </Button>
      </header>
      <div className="flex-1 flex flex-col items-center justify-center p-8">
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
          <Home className="w-8 h-8 text-muted-foreground" />
        </div>
        <h2 className="text-xl font-semibold mb-2">No properties yet</h2>
        <p className="text-muted-foreground mb-6">
          Get started by adding your first property to manage
        </p>
        <Button 
          onClick={() => navigate("/properties/new")}
          variant="default"
          className="bg-white text-black hover:bg-gray-100"
        >
          Add Your First Property
        </Button>
      </div>
    </div>
  );
}
