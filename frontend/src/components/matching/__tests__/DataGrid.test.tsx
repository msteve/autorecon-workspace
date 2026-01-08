import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { DataGrid, DataGridColumn } from '../DataGrid';

interface TestRow {
  id: string;
  name: string;
  value: number;
}

const mockData: TestRow[] = [
  { id: '1', name: 'Item 1', value: 100 },
  { id: '2', name: 'Item 2', value: 200 },
  { id: '3', name: 'Item 3', value: 300 }
];

const mockColumns: DataGridColumn<TestRow>[] = [
  { key: 'id', header: 'ID', sortable: true },
  { key: 'name', header: 'Name', sortable: true },
  { key: 'value', header: 'Value', sortable: true, render: (row) => `$${row.value}` }
];

describe('DataGrid', () => {
  const mockOnPageChange = vi.fn();
  const mockOnPageSizeChange = vi.fn();
  const mockOnSort = vi.fn();

  const defaultProps = {
    columns: mockColumns,
    data: mockData,
    keyExtractor: (row: TestRow) => row.id,
    currentPage: 1,
    pageSize: 20,
    totalItems: 3,
    onPageChange: mockOnPageChange,
    onPageSizeChange: mockOnPageSizeChange,
    onSort: mockOnSort
  };

  it('renders table with correct headers', () => {
    render(<DataGrid {...defaultProps} />);
    expect(screen.getByText('ID')).toBeInTheDocument();
    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Value')).toBeInTheDocument();
  });

  it('renders data rows correctly', () => {
    render(<DataGrid {...defaultProps} />);
    expect(screen.getByText('Item 1')).toBeInTheDocument();
    expect(screen.getByText('Item 2')).toBeInTheDocument();
    expect(screen.getByText('Item 3')).toBeInTheDocument();
  });

  it('renders custom cell content using render function', () => {
    render(<DataGrid {...defaultProps} />);
    expect(screen.getByText('$100')).toBeInTheDocument();
    expect(screen.getByText('$200')).toBeInTheDocument();
    expect(screen.getByText('$300')).toBeInTheDocument();
  });

  it('shows loading state', () => {
    render(<DataGrid {...defaultProps} loading={true} />);
    const spinner = screen.getByRole('cell', { name: '' }).querySelector('.animate-spin');
    expect(spinner).toBeInTheDocument();
  });

  it('shows empty message when no data', () => {
    render(<DataGrid {...defaultProps} data={[]} emptyMessage="No items found" />);
    expect(screen.getByText('No items found')).toBeInTheDocument();
  });

  it('displays pagination information correctly', () => {
    render(<DataGrid {...defaultProps} totalItems={50} />);
    expect(screen.getByText('Showing 1 to 3 of 50 results')).toBeInTheDocument();
  });

  it('handles page navigation', () => {
    render(<DataGrid {...defaultProps} totalItems={100} />);
    
    const nextButton = screen.getByLabelText('Next page');
    fireEvent.click(nextButton);
    expect(mockOnPageChange).toHaveBeenCalledWith(2);
  });

  it('handles first page navigation', () => {
    render(<DataGrid {...defaultProps} currentPage={3} totalItems={100} />);
    
    const firstButton = screen.getByLabelText('First page');
    fireEvent.click(firstButton);
    expect(mockOnPageChange).toHaveBeenCalledWith(1);
  });

  it('handles last page navigation', () => {
    render(<DataGrid {...defaultProps} currentPage={1} totalItems={100} />);
    
    const lastButton = screen.getByLabelText('Last page');
    fireEvent.click(lastButton);
    expect(mockOnPageChange).toHaveBeenCalledWith(5); // 100 / 20 = 5 pages
  });

  it('disables prev button on first page', () => {
    render(<DataGrid {...defaultProps} currentPage={1} />);
    
    const prevButton = screen.getByLabelText('Previous page');
    expect(prevButton).toBeDisabled();
  });

  it('disables next button on last page', () => {
    render(<DataGrid {...defaultProps} currentPage={1} totalItems={3} />);
    
    const nextButton = screen.getByLabelText('Next page');
    expect(nextButton).toBeDisabled();
  });

  it('handles page size change', () => {
    render(<DataGrid {...defaultProps} />);
    
    const pageSizeSelect = screen.getByRole('combobox');
    fireEvent.click(pageSizeSelect);
    
    const option50 = screen.getByText('50');
    fireEvent.click(option50);
    
    expect(mockOnPageSizeChange).toHaveBeenCalledWith(50);
  });

  it('handles column sorting', () => {
    render(<DataGrid {...defaultProps} sortBy="name" sortOrder="asc" />);
    
    const nameHeader = screen.getByText('Name');
    fireEvent.click(nameHeader);
    
    expect(mockOnSort).toHaveBeenCalledWith('name');
  });

  it('displays sort indicators correctly', () => {
    const { container } = render(
      <DataGrid {...defaultProps} sortBy="name" sortOrder="asc" />
    );
    
    // Should show up arrow for ascending sort
    const arrows = container.querySelectorAll('svg');
    expect(arrows.length).toBeGreaterThan(0);
  });

  it('does not call onSort for non-sortable columns', () => {
    const nonSortableColumns: DataGridColumn<TestRow>[] = [
      { key: 'id', header: 'ID', sortable: false }
    ];
    
    render(<DataGrid {...defaultProps} columns={nonSortableColumns} />);
    
    const idHeader = screen.getByText('ID');
    fireEvent.click(idHeader);
    
    expect(mockOnSort).not.toHaveBeenCalled();
  });

  it('displays correct page numbers', () => {
    render(<DataGrid {...defaultProps} currentPage={2} totalItems={100} />);
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('of')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(<DataGrid {...defaultProps} className="custom-grid" />);
    expect(container.querySelector('.custom-grid')).toBeInTheDocument();
  });

  it('applies column className to cells', () => {
    const columnsWithClass: DataGridColumn<TestRow>[] = [
      { key: 'id', header: 'ID', className: 'text-red-600' }
    ];
    
    const { container } = render(<DataGrid {...defaultProps} columns={columnsWithClass} />);
    const cell = container.querySelector('.text-red-600');
    expect(cell).toBeInTheDocument();
  });
});
