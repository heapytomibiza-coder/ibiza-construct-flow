import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useTicketMessages } from "@/hooks/useTicketMessages";
import { useHelpdesk, SupportTicket } from "@/hooks/useHelpdesk";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Send, Clock, User } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export function TicketDetail() {
  const { ticketId } = useParams<{ ticketId: string }>();
  const navigate = useNavigate();
  const [message, setMessage] = useState("");
  const [internalNote, setInternalNote] = useState("");
  
  const { messages, sendMessage } = useTicketMessages(ticketId);
  const { updateTicket, getSLAStatus } = useHelpdesk();

  const { data: ticket, isLoading } = useQuery({
    queryKey: ['support-ticket', ticketId],
    queryFn: async () => {
      if (!ticketId) throw new Error("No ticket ID");
      
      const { data, error } = await supabase
        .from('support_tickets')
        .select('*')
        .eq('id', ticketId)
        .single();

      if (error) throw error;
      return data as SupportTicket;
    },
    enabled: !!ticketId
  });

  const handleSendMessage = async () => {
    if (!message.trim()) return;
    await sendMessage({ message, isInternalNote: false });
    setMessage("");
  };

  const handleSendInternalNote = async () => {
    if (!internalNote.trim()) return;
    await sendMessage({ message: internalNote, isInternalNote: true });
    setInternalNote("");
  };

  const handleStatusChange = async (newStatus: string) => {
    if (!ticketId) return;
    await updateTicket({
      ticketId,
      updates: {
        status: newStatus as any,
        ...(newStatus === 'resolved' && { resolved_at: new Date().toISOString() }),
        ...(newStatus === 'closed' && { closed_at: new Date().toISOString() })
      }
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!ticket) {
    return <div>Ticket not found</div>;
  }

  const sla = getSLAStatus(ticket);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/admin/helpdesk')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-2xl font-bold">Ticket #{ticket.ticket_number}</h1>
              <Badge variant={ticket.priority === 'urgent' ? 'destructive' : 'default'}>
                {ticket.priority}
              </Badge>
              <Badge variant="secondary">{ticket.status.replace('_', ' ')}</Badge>
            </div>
            <p className="text-sm text-muted-foreground">{ticket.subject}</p>
          </div>
        </div>

        <div className="flex gap-2">
          {ticket.status === 'open' && (
            <Button onClick={() => handleStatusChange('in_progress')}>
              Start Working
            </Button>
          )}
          {ticket.status === 'in_progress' && (
            <Button onClick={() => handleStatusChange('resolved')}>
              Mark Resolved
            </Button>
          )}
          {ticket.status === 'resolved' && (
            <Button variant="outline" onClick={() => handleStatusChange('closed')}>
              Close Ticket
            </Button>
          )}
        </div>
      </div>

      {/* SLA Alert */}
      {sla.status !== 'ok' && (
        <Card className={sla.status === 'breached' ? 'border-destructive' : 'border-warning'}>
          <CardContent className="flex items-center gap-2 py-3">
            <Clock className="h-4 w-4" />
            <span className="text-sm">
              {sla.status === 'breached' 
                ? `SLA breached ${sla.minutesRemaining} minutes ago`
                : `SLA deadline in ${sla.minutesRemaining} minutes`
              }
            </span>
          </CardContent>
        </Card>
      )}

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Messages */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="messages" className="w-full">
            <TabsList className="w-full">
              <TabsTrigger value="messages" className="flex-1">Messages</TabsTrigger>
              <TabsTrigger value="internal" className="flex-1">Internal Notes</TabsTrigger>
            </TabsList>

            <TabsContent value="messages" className="space-y-4">
              {/* Message Thread */}
              <Card>
                <CardHeader>
                  <CardTitle>Conversation</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Initial Description */}
                  {ticket.description && (
                    <div className="flex gap-3 pb-4 border-b">
                      <Avatar>
                        <AvatarFallback>
                          <User className="h-4 w-4" />
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="text-sm font-medium">User</p>
                        <p className="text-xs text-muted-foreground mb-2">
                          {formatDistanceToNow(new Date(ticket.created_at), { addSuffix: true })}
                        </p>
                        <p className="text-sm whitespace-pre-wrap">{ticket.description}</p>
                      </div>
                    </div>
                  )}

                  {/* Messages */}
                  {messages?.filter(m => !m.is_internal_note).map((msg) => (
                    <div key={msg.id} className="flex gap-3">
                      <Avatar>
                        <AvatarFallback>
                          {msg.sender?.full_name?.charAt(0) || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{msg.sender?.full_name || 'User'}</p>
                        <p className="text-xs text-muted-foreground mb-2">
                          {formatDistanceToNow(new Date(msg.created_at), { addSuffix: true })}
                        </p>
                        <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
                      </div>
                    </div>
                  ))}

                  {/* Reply Form */}
                  <Separator />
                  <div className="space-y-2">
                    <Textarea
                      placeholder="Type your reply..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      rows={3}
                    />
                    <Button onClick={handleSendMessage} className="w-full">
                      <Send className="h-4 w-4 mr-2" />
                      Send Reply
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="internal" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Internal Notes (Admin Only)</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {messages?.filter(m => m.is_internal_note).map((msg) => (
                    <div key={msg.id} className="p-3 bg-muted rounded-lg">
                      <p className="text-sm font-medium">{msg.sender?.full_name || 'Admin'}</p>
                      <p className="text-xs text-muted-foreground mb-2">
                        {formatDistanceToNow(new Date(msg.created_at), { addSuffix: true })}
                      </p>
                      <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
                    </div>
                  ))}

                  <Separator />
                  <div className="space-y-2">
                    <Textarea
                      placeholder="Add internal note (not visible to user)..."
                      value={internalNote}
                      onChange={(e) => setInternalNote(e.target.value)}
                      rows={3}
                    />
                    <Button onClick={handleSendInternalNote} variant="secondary" className="w-full">
                      Add Note
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div>
                <p className="text-muted-foreground">Category</p>
                <p className="font-medium capitalize">{ticket.category}</p>
              </div>
              <Separator />
              <div>
                <p className="text-muted-foreground">Created</p>
                <p className="font-medium">
                  {formatDistanceToNow(new Date(ticket.created_at), { addSuffix: true })}
                </p>
              </div>
              <Separator />
              <div>
                <p className="text-muted-foreground">Last Updated</p>
                <p className="font-medium">
                  {formatDistanceToNow(new Date(ticket.updated_at), { addSuffix: true })}
                </p>
              </div>
              {ticket.sla_deadline && (
                <>
                  <Separator />
                  <div>
                    <p className="text-muted-foreground">SLA Deadline</p>
                    <p className="font-medium">
                      {formatDistanceToNow(new Date(ticket.sla_deadline), { addSuffix: true })}
                    </p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
