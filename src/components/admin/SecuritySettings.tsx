import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Shield, Smartphone, Monitor, MapPin, Trash2, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { QRCodeSVG } from "qrcode.react";

export function SecuritySettings() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [newIpAddress, setNewIpAddress] = useState("");
  const [twoFactorSecret, setTwoFactorSecret] = useState("");

  // Fetch 2FA status
  const { data: twoFactorData } = useQuery({
    queryKey: ['two-factor-auth'],
    queryFn: async () => {
      const { data } = await supabase
        .from('two_factor_auth')
        .select('*')
        .single();
      return data;
    }
  });

  // Fetch active sessions
  const { data: sessions } = useQuery({
    queryKey: ['user-sessions'],
    queryFn: async () => {
      const { data } = await supabase
        .from('user_sessions')
        .select('*')
        .eq('is_active', true)
        .order('last_activity_at', { ascending: false });
      return data || [];
    }
  });

  // Fetch IP whitelist
  const { data: whitelist } = useQuery({
    queryKey: ['admin-ip-whitelist'],
    queryFn: async () => {
      const { data } = await supabase
        .from('admin_ip_whitelist')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });
      return data || [];
    }
  });

  // Enable 2FA
  const enable2FA = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Generate secret (in production, do this server-side)
      const secret = Array.from({ length: 32 }, () => 
        'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'[Math.floor(Math.random() * 32)]
      ).join('');

      const { error } = await supabase.from('two_factor_auth').insert({
        user_id: user.id,
        secret,
        is_enabled: false
      });

      if (error) throw error;
      setTwoFactorSecret(secret);
      return secret;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['two-factor-auth'] });
      toast({ title: "2FA Setup", description: "Scan QR code with authenticator app" });
    }
  });

  // Revoke session
  const revokeSession = useMutation({
    mutationFn: async (sessionId: string) => {
      const { error } = await supabase
        .from('user_sessions')
        .update({ is_active: false })
        .eq('id', sessionId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-sessions'] });
      toast({ title: "Session Revoked", description: "Device logged out successfully" });
    }
  });

  // Add IP to whitelist
  const addIpAddress = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase.from('admin_ip_whitelist').insert({
        ip_address: newIpAddress,
        created_by: user.id
      });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-ip-whitelist'] });
      toast({ title: "IP Added", description: "IP address whitelisted successfully" });
      setNewIpAddress("");
    }
  });

  // Remove IP from whitelist
  const removeIpAddress = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('admin_ip_whitelist')
        .update({ is_active: false })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-ip-whitelist'] });
      toast({ title: "IP Removed", description: "IP address removed from whitelist" });
    }
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Security Settings</h2>
        <p className="text-muted-foreground">Manage authentication and access controls</p>
      </div>

      <Tabs defaultValue="2fa">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="2fa">Two-Factor Auth</TabsTrigger>
          <TabsTrigger value="sessions">Active Sessions</TabsTrigger>
          <TabsTrigger value="whitelist">IP Whitelist</TabsTrigger>
        </TabsList>

        <TabsContent value="2fa" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Smartphone className="h-5 w-5" />
                Two-Factor Authentication
              </CardTitle>
              <CardDescription>
                Add an extra layer of security to your account
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {!twoFactorData ? (
                <>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Enable 2FA</p>
                      <p className="text-sm text-muted-foreground">
                        Protect your account with authenticator app
                      </p>
                    </div>
                    <Button onClick={() => enable2FA.mutate()}>
                      Enable
                    </Button>
                  </div>

                  {twoFactorSecret && (
                    <div className="border rounded-lg p-4 space-y-4">
                      <p className="text-sm font-medium">Scan this QR code with your authenticator app:</p>
                      <div className="flex justify-center">
                        <QRCodeSVG 
                          value={`otpauth://totp/YourApp:user@example.com?secret=${twoFactorSecret}&issuer=YourApp`}
                          size={200}
                        />
                      </div>
                      <p className="text-xs text-center text-muted-foreground">
                        Or enter manually: {twoFactorSecret}
                      </p>
                    </div>
                  )}
                </>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4 text-green-500" />
                      <span className="font-medium">2FA is enabled</span>
                      <Badge variant="secondary">Active</Badge>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Your account is protected with two-factor authentication
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sessions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Monitor className="h-5 w-5" />
                Active Sessions
              </CardTitle>
              <CardDescription>
                Manage devices with access to your account
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {sessions.map((session: any) => (
                <div key={session.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Monitor className="h-4 w-4" />
                    <div>
                      <p className="font-medium text-sm">
                        {session.device_info?.device || 'Unknown Device'}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <MapPin className="h-3 w-3" />
                        <span>{session.ip_address}</span>
                        <span>•</span>
                        <span>{new Date(session.last_activity_at).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => revokeSession.mutate(session.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              {sessions.length === 0 && (
                <p className="text-center py-4 text-muted-foreground text-sm">
                  No active sessions
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="whitelist" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                IP Whitelist
              </CardTitle>
              <CardDescription>
                Restrict admin access to specific IP addresses
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <div className="flex-1">
                  <Label htmlFor="ip-address">IP Address</Label>
                  <Input
                    id="ip-address"
                    placeholder="192.168.1.1"
                    value={newIpAddress}
                    onChange={(e) => setNewIpAddress(e.target.value)}
                  />
                </div>
                <Button 
                  className="mt-auto"
                  onClick={() => addIpAddress.mutate()}
                  disabled={!newIpAddress}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add
                </Button>
              </div>

              <div className="space-y-2">
                {whitelist.map((ip: any) => (
                  <div key={ip.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{ip.ip_address}</p>
                      {ip.description && (
                        <p className="text-sm text-muted-foreground">{ip.description}</p>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeIpAddress.mutate(ip.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                {whitelist.length === 0 && (
                  <p className="text-center py-4 text-muted-foreground text-sm">
                    No whitelisted IPs
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
