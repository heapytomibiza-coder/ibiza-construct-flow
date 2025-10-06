import { TicketQueue } from "@/components/helpdesk/TicketQueue";

export default function AdminHelpdeskPage() {
  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Support Helpdesk</h1>
        <p className="text-muted-foreground">Manage support tickets and customer inquiries</p>
      </div>
      <TicketQueue />
    </div>
  );
}
