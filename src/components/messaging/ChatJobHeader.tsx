import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreVertical, ExternalLink, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ChatJobHeaderProps {
  jobId: string;
  jobTitle: string;
  category?: string;
  microService?: string;
  contractStatus?: 'pending' | 'quoted' | 'in_progress' | 'completed' | 'cancelled';
  agreedPrice?: number;
}

const statusConfig = {
  pending: { label: 'Pending', className: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20' },
  quoted: { label: 'Quoted', className: 'bg-blue-500/10 text-blue-600 border-blue-500/20' },
  in_progress: { label: 'In Progress', className: 'bg-green-500/10 text-green-600 border-green-500/20' },
  completed: { label: 'Completed', className: 'bg-gray-500/10 text-gray-600 border-gray-500/20' },
  cancelled: { label: 'Cancelled', className: 'bg-red-500/10 text-red-600 border-red-500/20' },
};

export const ChatJobHeader = ({
  jobId,
  jobTitle,
  category,
  microService,
  contractStatus = 'pending',
  agreedPrice,
}: ChatJobHeaderProps) => {
  const navigate = useNavigate();
  const status = statusConfig[contractStatus];

  return (
    <div className="border-b bg-muted/30 px-4 py-3 space-y-2">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-foreground truncate">{jobTitle}</h3>
          <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
            {category && <span>{category}</span>}
            {microService && (
              <>
                <span>•</span>
                <span>{microService}</span>
              </>
            )}
          </div>
        </div>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="flex-shrink-0">
              <MoreVertical className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => navigate(`/jobs/${jobId}`)}>
              <ExternalLink className="w-4 h-4 mr-2" />
              View Job Details
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate(`/contracts?job=${jobId}`)}>
              <FileText className="w-4 h-4 mr-2" />
              View Contract
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="flex items-center gap-3 text-sm">
        <Badge variant="outline" className={status.className}>
          {status.label}
        </Badge>
        {agreedPrice && (
          <span className="text-muted-foreground">
            Agreed: <span className="font-semibold text-foreground">€{agreedPrice.toLocaleString()}</span>
          </span>
        )}
      </div>
    </div>
  );
};
