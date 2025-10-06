import { Card } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface CohortData {
  cohort: string;
  size: number;
  retention: number[];
}

interface CohortTableProps {
  data: CohortData[];
  title?: string;
}

export function CohortTable({ data, title }: CohortTableProps) {
  const maxWeeks = Math.max(...data.map(d => d.retention.length));

  const getColorForRetention = (value: number) => {
    if (value >= 80) return 'bg-green-500/20 text-green-700 dark:text-green-300';
    if (value >= 60) return 'bg-blue-500/20 text-blue-700 dark:text-blue-300';
    if (value >= 40) return 'bg-yellow-500/20 text-yellow-700 dark:text-yellow-300';
    if (value >= 20) return 'bg-orange-500/20 text-orange-700 dark:text-orange-300';
    return 'bg-red-500/20 text-red-700 dark:text-red-300';
  };

  return (
    <Card className="p-6">
      {title && <h3 className="text-lg font-semibold mb-4">{title}</h3>}
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-32">Cohort</TableHead>
              <TableHead className="w-20">Size</TableHead>
              {Array.from({ length: maxWeeks }, (_, i) => (
                <TableHead key={i} className="text-center w-20">
                  Week {i}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((cohort) => (
              <TableRow key={cohort.cohort}>
                <TableCell className="font-medium">{cohort.cohort}</TableCell>
                <TableCell>{cohort.size}</TableCell>
                {Array.from({ length: maxWeeks }, (_, i) => {
                  const value = cohort.retention[i];
                  return (
                    <TableCell key={i} className="text-center p-1">
                      {value !== undefined ? (
                        <div className={`rounded px-2 py-1 text-sm font-medium ${getColorForRetention(value)}`}>
                          {value.toFixed(0)}%
                        </div>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-green-500/20" />
          <span>80%+</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-blue-500/20" />
          <span>60-79%</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-yellow-500/20" />
          <span>40-59%</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-orange-500/20" />
          <span>20-39%</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-red-500/20" />
          <span>&lt;20%</span>
        </div>
      </div>
    </Card>
  );
}
