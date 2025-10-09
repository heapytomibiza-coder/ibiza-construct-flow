import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { DisputeDetailsView } from "@/components/disputes/DisputeDetailsView";

export default function AdminDisputeDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  if (!id) {
    return (
      <div className="container mx-auto py-8">
        <p className="text-muted-foreground">Dispute ID not provided</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 mb-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/admin")}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Admin Dashboard
        </Button>
        <span className="text-muted-foreground">/</span>
        <span className="text-sm font-medium">Dispute Details</span>
      </div>

      {/* Dispute Details with Admin Controls */}
      <DisputeDetailsView disputeId={id} />
    </div>
  );
}
