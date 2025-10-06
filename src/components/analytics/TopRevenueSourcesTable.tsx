import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

interface TopRevenueSource {
  job_id: string;
  job_title: string;
  total_revenue: number;
  payment_count: number;
}

interface TopRevenueSourcesTableProps {
  data: TopRevenueSource[];
}

export function TopRevenueSourcesTable({ data }: TopRevenueSourcesTableProps) {
  if (!data || data.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No revenue source data available
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Rank</TableHead>
            <TableHead>Job Title</TableHead>
            <TableHead className="text-right">Total Revenue</TableHead>
            <TableHead className="text-right">Payments</TableHead>
            <TableHead className="text-right">Avg per Payment</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((source, index) => {
            const avgPerPayment = Number(source.total_revenue) / Number(source.payment_count);
            return (
              <TableRow key={source.job_id}>
                <TableCell>
                  <Badge variant={index === 0 ? 'default' : 'outline'}>
                    #{index + 1}
                  </Badge>
                </TableCell>
                <TableCell className="font-medium">
                  {source.job_title || 'Untitled Job'}
                </TableCell>
                <TableCell className="text-right font-semibold">
                  ${Number(source.total_revenue).toFixed(2)}
                </TableCell>
                <TableCell className="text-right">
                  {Number(source.payment_count)}
                </TableCell>
                <TableCell className="text-right text-muted-foreground">
                  ${avgPerPayment.toFixed(2)}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
