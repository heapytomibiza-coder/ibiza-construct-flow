import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Download, Filter, Search, Shield, UserCog } from "lucide-react";
import { cn } from "@/lib/utils";

interface AuditLogEntry {
  id: string;
  admin_id: string;
  admin_email: string;
  action: string;
  entity_type: string | null;
  entity_id: string | null;
  changes: any;
  impersonation_session_id: string | null;
  ip_address: string | null;
  created_at: string;
}

export function AuditLogViewer() {
  const [entityType, setEntityType] = useState<string>("");
  const [adminId, setAdminId] = useState<string>("");
  const [startDate, setStartDate] = useState<Date>(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000));
  const [endDate, setEndDate] = useState<Date>(new Date());
  const [searchTerm, setSearchTerm] = useState("");

  const { data: auditLogs, isLoading, refetch } = useQuery({
    queryKey: ["admin-audit-log", entityType, adminId, startDate, endDate],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_admin_audit_trail" as any, {
        p_entity_type: entityType || null,
        p_admin_id: adminId || null,
        p_start_date: startDate.toISOString(),
        p_end_date: endDate.toISOString(),
        p_limit: 100,
      });

      if (error) throw error;
      return data as AuditLogEntry[];
    },
  });

  const filteredLogs = auditLogs?.filter((log) => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      log.action.toLowerCase().includes(searchLower) ||
      log.admin_email?.toLowerCase().includes(searchLower) ||
      log.entity_type?.toLowerCase().includes(searchLower)
    );
  });

  const exportToCSV = () => {
    if (!filteredLogs) return;

    const headers = ["Timestamp", "Admin", "Action", "Entity Type", "Entity ID", "Impersonated", "IP Address"];
    const rows = filteredLogs.map((log) => [
      new Date(log.created_at).toLocaleString(),
      log.admin_email,
      log.action,
      log.entity_type || "-",
      log.entity_id || "-",
      log.impersonation_session_id ? "Yes" : "No",
      log.ip_address || "-",
    ]);

    const csv = [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `audit-log-${format(new Date(), "yyyy-MM-dd")}.csv`;
    a.click();
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Admin Audit Log
            </CardTitle>
            <CardDescription>Track all administrative actions and changes</CardDescription>
          </div>
          <Button onClick={exportToCSV} variant="outline" size="sm" className="gap-2">
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search actions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>

          <Select value={entityType} onValueChange={setEntityType}>
            <SelectTrigger>
              <SelectValue placeholder="Entity Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Types</SelectItem>
              <SelectItem value="user">User</SelectItem>
              <SelectItem value="job">Job</SelectItem>
              <SelectItem value="booking">Booking</SelectItem>
              <SelectItem value="dispute">Dispute</SelectItem>
              <SelectItem value="payout">Payout</SelectItem>
              <SelectItem value="feature_flag">Feature Flag</SelectItem>
            </SelectContent>
          </Select>

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className={cn("justify-start text-left font-normal")}>
                <CalendarIcon className="mr-2 h-4 w-4" />
                {startDate ? format(startDate, "PP") : <span>Start Date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar mode="single" selected={startDate} onSelect={(date) => date && setStartDate(date)} />
            </PopoverContent>
          </Popover>

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className={cn("justify-start text-left font-normal")}>
                <CalendarIcon className="mr-2 h-4 w-4" />
                {endDate ? format(endDate, "PP") : <span>End Date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar mode="single" selected={endDate} onSelect={(date) => date && setEndDate(date)} />
            </PopoverContent>
          </Popover>
        </div>

        {/* Results */}
        {isLoading ? (
          <div className="text-center py-8 text-muted-foreground">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          </div>
        ) : !filteredLogs || filteredLogs.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Filter className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p className="font-medium">No audit logs found</p>
            <p className="text-sm mt-1">Try adjusting your filters</p>
          </div>
        ) : (
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Showing {filteredLogs.length} of {auditLogs?.length || 0} logs
            </p>
            <div className="border rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted">
                    <tr>
                      <th className="text-left p-3 font-medium">Timestamp</th>
                      <th className="text-left p-3 font-medium">Admin</th>
                      <th className="text-left p-3 font-medium">Action</th>
                      <th className="text-left p-3 font-medium">Entity</th>
                      <th className="text-left p-3 font-medium">Details</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {filteredLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-muted/50">
                        <td className="p-3 text-xs text-muted-foreground">
                          {format(new Date(log.created_at), "MMM dd, HH:mm:ss")}
                        </td>
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            {log.impersonation_session_id && (
                              <UserCog className="h-4 w-4 text-warning" aria-label="Impersonated Action" />
                            )}
                            <span className="text-sm">{log.admin_email}</span>
                          </div>
                        </td>
                        <td className="p-3">
                          <Badge variant="outline">{log.action}</Badge>
                        </td>
                        <td className="p-3 text-sm">
                          {log.entity_type || "-"}
                          {log.entity_id && (
                            <span className="text-xs text-muted-foreground block truncate max-w-[200px]">
                              {log.entity_id}
                            </span>
                          )}
                        </td>
                        <td className="p-3">
                          {log.changes && (
                            <details className="cursor-pointer">
                              <summary className="text-xs text-muted-foreground">View Changes</summary>
                              <pre className="text-xs mt-1 bg-muted p-2 rounded overflow-auto max-h-32">
                                {JSON.stringify(log.changes, null, 2)}
                              </pre>
                            </details>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
