import { TableRow, TableCell } from '../ui/table';
import { SuspenseBadge } from './SuspenseBadge';
import type { JournalEntry } from '../../types';

interface JournalEntryRowProps {
  entry: JournalEntry;
  showBatchInfo?: boolean;
}

export function JournalEntryRow({ entry, showBatchInfo = false }: JournalEntryRowProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  return (
    <TableRow className="hover:bg-muted/50">
      <TableCell className="font-medium">{entry.lineNumber}</TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          <span className="font-mono text-sm">{entry.accountCode}</span>
          <SuspenseBadge isSuspense={entry.suspenseFlag} reason={entry.suspenseReason} />
        </div>
      </TableCell>
      <TableCell>
        <div>
          <div className="font-medium">{entry.accountName}</div>
          <div className="text-xs text-muted-foreground">{entry.description}</div>
        </div>
      </TableCell>
      <TableCell className="text-right font-mono">
        {entry.debitAmount > 0 ? (
          <span className="text-green-600">{formatCurrency(entry.debitAmount)}</span>
        ) : (
          <span className="text-muted-foreground">-</span>
        )}
      </TableCell>
      <TableCell className="text-right font-mono">
        {entry.creditAmount > 0 ? (
          <span className="text-blue-600">{formatCurrency(entry.creditAmount)}</span>
        ) : (
          <span className="text-muted-foreground">-</span>
        )}
      </TableCell>
      {showBatchInfo && (
        <>
          <TableCell className="text-sm">{entry.costCenter || '-'}</TableCell>
          <TableCell className="text-sm">{entry.department || '-'}</TableCell>
          <TableCell className="text-sm">{entry.reference || '-'}</TableCell>
        </>
      )}
    </TableRow>
  );
}
