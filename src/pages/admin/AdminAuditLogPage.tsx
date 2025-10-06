import { AuditLogViewer } from "@/components/admin/AuditLogViewer";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function AdminAuditLogPage() {
  const navigate = useNavigate();

  return (
    <div className="container mx-auto py-8">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 mb-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/dashboard/admin")}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Admin Dashboard
        </Button>
        <span className="text-muted-foreground">/</span>
        <span className="text-sm font-medium">Audit Log</span>
      </div>

      <AuditLogViewer />
    </div>
  );
}
