import { useState, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export const usePhoneVerification = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [verificationCode, setVerificationCode] = useState('');

  // Fetch user's phone numbers
  const { data: phoneNumbers, isLoading } = useQuery({
    queryKey: ['phone-numbers', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from('user_phone_numbers')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  // Add phone number
  const addPhoneNumber = useMutation({
    mutationFn: async (phoneNumber: string) => {
      if (!user?.id) throw new Error('Not authenticated');

      // Validate phone number format (basic validation)
      const cleanPhone = phoneNumber.replace(/\D/g, '');
      if (cleanPhone.length < 10) {
        throw new Error('Invalid phone number format');
      }

      const { data, error } = await supabase
        .from('user_phone_numbers')
        .insert({
          user_id: user.id,
          phone_number: phoneNumber,
          country_code: '+1', // Default to US, could be improved
          is_primary: phoneNumbers?.length === 0, // First number is primary
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['phone-numbers'] });
      toast({
        title: 'Phone Number Added',
        description: 'A verification code has been sent to your phone',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to add phone number',
        variant: 'destructive',
      });
    },
  });

  // Send verification code
  const sendVerificationCode = useMutation({
    mutationFn: async (phoneId: string) => {
      // Generate 6-digit code
      const code = Math.floor(100000 + Math.random() * 900000).toString();

      // Update database with code
      const { error } = await supabase
        .from('user_phone_numbers')
        .update({
          verification_code: code,
          verification_sent_at: new Date().toISOString(),
        })
        .eq('id', phoneId);

      if (error) throw error;

      // In real implementation, send SMS via Twilio
      // For now, just log it (would call send-sms-notification edge function)
      console.log(`Verification code for ${phoneId}: ${code}`);

      return { phoneId, code };
    },
    onSuccess: () => {
      toast({
        title: 'Code Sent',
        description: 'Verification code has been sent to your phone',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: 'Failed to send verification code',
        variant: 'destructive',
      });
    },
  });

  // Verify code
  const verifyCode = useMutation({
    mutationFn: async ({ phoneId, code }: { phoneId: string; code: string }) => {
      // Check code matches
      const { data: phone, error: fetchError } = await supabase
        .from('user_phone_numbers')
        .select('verification_code')
        .eq('id', phoneId)
        .single();

      if (fetchError) throw fetchError;

      if (phone.verification_code !== code) {
        throw new Error('Invalid verification code');
      }

      // Mark as verified
      const { error } = await supabase
        .from('user_phone_numbers')
        .update({
          is_verified: true,
          verified_at: new Date().toISOString(),
          verification_code: null,
        })
        .eq('id', phoneId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['phone-numbers'] });
      setVerificationCode('');
      toast({
        title: 'Phone Verified',
        description: 'Your phone number has been verified successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Verification Failed',
        description: error.message || 'Invalid verification code',
        variant: 'destructive',
      });
    },
  });

  // Delete phone number
  const deletePhoneNumber = useMutation({
    mutationFn: async (phoneId: string) => {
      const { error } = await supabase
        .from('user_phone_numbers')
        .delete()
        .eq('id', phoneId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['phone-numbers'] });
      toast({
        title: 'Phone Number Removed',
        description: 'Phone number has been deleted',
      });
    },
  });

  return {
    phoneNumbers,
    isLoading,
    verificationCode,
    setVerificationCode,
    addPhoneNumber,
    sendVerificationCode,
    verifyCode,
    deletePhoneNumber,
  };
};
