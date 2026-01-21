import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { JournalEntryRow } from '../JournalEntryRow';
import type { JournalEntry } from '../../../types';

const mockEntry: JournalEntry = {
  id: 'entry-1',
  batchId: 'batch-1',
  lineNumber: 1,
  accountCode: '1000',
  accountName: 'Cash - Operating Account',
  debitAmount: 5000,
  creditAmount: 0,
  description: 'Payment received from customer',
  costCenter: 'CC-1',
  department: 'Finance',
  reference: 'REF-12345',
  suspenseFlag: false,
  createdAt: '2026-01-10T10:00:00Z',
};

const mockSuspenseEntry: JournalEntry = {
  ...mockEntry,
  id: 'entry-2',
  lineNumber: 2,
  accountCode: '9999',
  accountName: 'Suspense Account',
  suspenseFlag: true,
  suspenseReason: 'Unidentified transaction',
};

describe('JournalEntryRow', () => {
  it('renders entry data correctly', () => {
    render(
      <table>
        <tbody>
          <JournalEntryRow entry={mockEntry} />
        </tbody>
      </table>
    );

    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('1000')).toBeInTheDocument();
    expect(screen.getByText('Cash - Operating Account')).toBeInTheDocument();
    expect(screen.getByText('Payment received from customer')).toBeInTheDocument();
  });

  it('formats debit amount correctly', () => {
    render(
      <table>
        <tbody>
          <JournalEntryRow entry={mockEntry} />
        </tbody>
      </table>
    );

    expect(screen.getByText('$5,000.00')).toBeInTheDocument();
  });

  it('formats credit amount correctly', () => {
    const creditEntry = { ...mockEntry, debitAmount: 0, creditAmount: 3000 };
    render(
      <table>
        <tbody>
          <JournalEntryRow entry={creditEntry} />
        </tbody>
      </table>
    );

    expect(screen.getByText('$3,000.00')).toBeInTheDocument();
  });

  it('displays dash for zero amounts', () => {
    render(
      <table>
        <tbody>
          <JournalEntryRow entry={mockEntry} />
        </tbody>
      </table>
    );

    const cells = screen.getAllByText('-');
    expect(cells.length).toBeGreaterThan(0);
  });

  it('renders suspense badge for suspense entries', () => {
    render(
      <table>
        <tbody>
          <JournalEntryRow entry={mockSuspenseEntry} />
        </tbody>
      </table>
    );

    expect(screen.getByText('Suspense')).toBeInTheDocument();
  });

  it('does not render suspense badge for normal entries', () => {
    render(
      <table>
        <tbody>
          <JournalEntryRow entry={mockEntry} />
        </tbody>
      </table>
    );

    expect(screen.queryByText('Suspense')).not.toBeInTheDocument();
  });

  it('shows batch info when showBatchInfo is true', () => {
    render(
      <table>
        <tbody>
          <JournalEntryRow entry={mockEntry} showBatchInfo={true} />
        </tbody>
      </table>
    );

    expect(screen.getByText('CC-1')).toBeInTheDocument();
    expect(screen.getByText('Finance')).toBeInTheDocument();
    expect(screen.getByText('REF-12345')).toBeInTheDocument();
  });

  it('hides batch info when showBatchInfo is false', () => {
    render(
      <table>
        <tbody>
          <JournalEntryRow entry={mockEntry} showBatchInfo={false} />
        </tbody>
      </table>
    );

    expect(screen.queryByText('CC-1')).not.toBeInTheDocument();
    expect(screen.queryByText('Finance')).not.toBeInTheDocument();
    expect(screen.queryByText('REF-12345')).not.toBeInTheDocument();
  });

  it('displays dash for missing optional fields', () => {
    const entryWithoutOptionals = {
      ...mockEntry,
      costCenter: undefined,
      department: undefined,
      reference: undefined,
    };

    render(
      <table>
        <tbody>
          <JournalEntryRow entry={entryWithoutOptionals} showBatchInfo={true} />
        </tbody>
      </table>
    );

    const dashes = screen.getAllByText('-');
    expect(dashes.length).toBeGreaterThan(2);
  });

  it('applies correct styling for debit amounts', () => {
    const { container } = render(
      <table>
        <tbody>
          <JournalEntryRow entry={mockEntry} />
        </tbody>
      </table>
    );

    const debitCell = container.querySelector('.text-green-600');
    expect(debitCell).toBeInTheDocument();
  });

  it('applies correct styling for credit amounts', () => {
    const creditEntry = { ...mockEntry, debitAmount: 0, creditAmount: 3000 };
    const { container } = render(
      <table>
        <tbody>
          <JournalEntryRow entry={creditEntry} />
        </tbody>
      </table>
    );

    const creditCell = container.querySelector('.text-blue-600');
    expect(creditCell).toBeInTheDocument();
  });

  it('displays account code in monospace font', () => {
    const { container } = render(
      <table>
        <tbody>
          <JournalEntryRow entry={mockEntry} />
        </tbody>
      </table>
    );

    const accountCode = container.querySelector('.font-mono');
    expect(accountCode).toHaveTextContent('1000');
  });
});
