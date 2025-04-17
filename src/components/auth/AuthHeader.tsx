import { Building2 } from "lucide-react";

interface AuthHeaderProps {
  title: string;
  subtitle: string;
}

export const AuthHeader = ({ title, subtitle }: AuthHeaderProps) => (
  <div className="flex flex-col items-center mb-8">
    <Building2 className="h-12 w-12 text-primary mb-2" />
    <h1 className="text-2xl font-bold text-primary">{title}</h1>
    <p className="text-accent text-sm">{subtitle}</p>
  </div>
);