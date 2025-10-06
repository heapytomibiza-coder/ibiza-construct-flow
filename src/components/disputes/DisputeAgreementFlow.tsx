import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useMediation } from '@/hooks/useMediation';
import { CheckCircle, XCircle, MessageSquare, Clock, AlertCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface DisputeAgreementFlowProps {
  disputeId: string;
  side: 'client' | 'professional';
}

export function DisputeAgreementFlow({ disputeId, side }: DisputeAgreementFlowProps) {
  const { resolutions, agree } = useMediation(disputeId);
  const latest = (resolutions.data ?? []).slice(-1)[0];

  if (!latest || latest.status === 'executed') return null;

  const myAgreed = side === 'client' ? latest.party_client_agreed : latest.party_professional_agreed;
  const otherAgreed = side === 'client' ? latest.party_professional_agreed : latest.party_client_agreed;
  const bothAgreed = latest.party_client_agreed && latest.party_professional_agreed;

  return (
    <Card className="border-border">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Resolution Proposal</span>
          <Badge variant={latest.status === 'agreed' ? 'default' : 'secondary'}>
            {latest.status}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Resolution Summary */}
        <div className="p-4 rounded-lg bg-muted space-y-3">
          <div className="font-medium text-lg">{latest.resolution_type}</div>
          
          {(latest.fault_percentage_client !== null || latest.fault_percentage_professional !== null) && (
            <div className="space-y-2">
              <div className="text-sm text-muted-foreground">Fault Distribution</div>
              <div className="flex w-full h-3 rounded-full overflow-hidden">
                <div 
                  className="bg-blue-500" 
                  style={{ width: `${latest.fault_percentage_client ?? 0}%` }}
                  title={`Client: ${latest.fault_percentage_client ?? 0}%`}
                />
                <div 
                  className="bg-purple-500" 
                  style={{ width: `${latest.fault_percentage_professional ?? 0}%` }}
                  title={`Professional: ${latest.fault_percentage_professional ?? 0}%`}
                />
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>Client: {latest.fault_percentage_client ?? 0}%</span>
                <span>Professional: {latest.fault_percentage_professional ?? 0}%</span>
              </div>
            </div>
          )}

          {latest.amount && (
            <div className="text-sm">
              <span className="text-muted-foreground">Amount: </span>
              <span className="font-semibold">£{latest.amount.toFixed(2)}</span>
            </div>
          )}

          {latest.mediator_decision_reasoning && (
            <div className="space-y-1">
              <div className="text-sm font-medium text-muted-foreground">Mediator's Reasoning</div>
              <div className="text-sm">{latest.mediator_decision_reasoning}</div>
            </div>
          )}
        </div>

        {/* Agreement Status */}
        <div className="space-y-2">
          <div className="text-sm font-medium">Agreement Status</div>
          <div className="flex items-center gap-4">
            <div className={`flex items-center gap-2 ${myAgreed ? 'text-green-500' : 'text-muted-foreground'}`}>
              {myAgreed ? (
                <CheckCircle className="w-5 h-5" />
              ) : (
                <AlertCircle className="w-5 h-5" />
              )}
              <span>You {myAgreed ? 'agreed' : 'pending'}</span>
            </div>
            <div className={`flex items-center gap-2 ${otherAgreed ? 'text-green-500' : 'text-muted-foreground'}`}>
              {otherAgreed ? (
                <CheckCircle className="w-5 h-5" />
              ) : (
                <AlertCircle className="w-5 h-5" />
              )}
              <span>Other party {otherAgreed ? 'agreed' : 'pending'}</span>
            </div>
          </div>
        </div>

        {/* Timeline Information */}
        {latest.auto_execute_date && bothAgreed && (
          <div className="flex items-center gap-2 text-sm text-blue-500 bg-blue-500/10 p-3 rounded-lg">
            <Clock className="w-4 h-4" />
            <span>
              Will auto-execute {formatDistanceToNow(new Date(latest.auto_execute_date), { addSuffix: true })}
            </span>
          </div>
        )}

        {latest.appeal_deadline && !bothAgreed && (
          <div className="flex items-center gap-2 text-sm text-yellow-500 bg-yellow-500/10 p-3 rounded-lg">
            <AlertCircle className="w-4 h-4" />
            <span>
              Appeal by {new Date(latest.appeal_deadline).toLocaleDateString()}
            </span>
          </div>
        )}

        {/* Action Buttons */}
        {!bothAgreed && (
          <div className="flex gap-3">
            {!myAgreed && (
              <>
                <Button
                  onClick={() => agree.mutate(side)}
                  disabled={agree.isPending}
                  className="flex-1"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Accept
                </Button>
                <Button
                  variant="outline"
                  className="flex-1"
                  disabled
                >
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Counter-Propose
                </Button>
              </>
            )}
            {myAgreed && !otherAgreed && (
              <div className="w-full p-3 text-center text-sm text-muted-foreground bg-muted rounded-lg">
                Waiting for other party to respond...
              </div>
            )}
          </div>
        )}

        {bothAgreed && (
          <div className="flex items-center gap-2 text-sm text-green-500 bg-green-500/10 p-3 rounded-lg">
            <CheckCircle className="w-4 h-4" />
            <span>Both parties have agreed! Resolution will be executed automatically.</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
