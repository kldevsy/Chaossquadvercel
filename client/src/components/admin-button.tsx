import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { Settings } from "lucide-react";

export default function AdminButton() {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated || !user?.isAdmin) {
    return null;
  }

  return (
    <Button 
      size="sm" 
      onClick={() => window.location.href = "/admin"}
      className="gap-1 px-2 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
    >
      <Settings className="w-3 h-3" />
      <span className="hidden lg:inline text-xs">Admin</span>
    </Button>
  );
}