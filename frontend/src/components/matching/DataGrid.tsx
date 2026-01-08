import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, ArrowUp, ArrowDown } from 'lucide-react';

export interface DataGridColumn<T> {
  key: string;
  header: string;
  sortable?: boolean;
  render?: (row: T) => React.ReactNode;
  className?: string;
}

export interface DataGridProps<T> {
  columns: DataGridColumn<T>[];
  data: T[];
  keyExtractor: (row: T) => string;
  
  // Pagination
  currentPage: number;
  pageSize: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  
  // Sorting
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  onSort?: (column: string) => void;
  
  // UI
  loading?: boolean;
  emptyMessage?: string;
  className?: string;
}

/**
 * DataGrid Component
 * 
 * Reusable data table with pagination, sorting, and flexible column rendering.
 * 
 * @example
 * ```tsx
 * <DataGrid
 *   columns={[
 *     { key: 'id', header: 'ID', sortable: true },
 *     { key: 'name', header: 'Name', render: (row) => <strong>{row.name}</strong> }
 *   ]}
 *   data={items}
 *   keyExtractor={(row) => row.id}
 *   currentPage={1}
 *   pageSize={20}
 *   totalItems={100}
 *   onPageChange={setPage}
 *   onPageSizeChange={setPageSize}
 *   sortBy="name"
 *   sortOrder="asc"
 *   onSort={handleSort}
 * />
 * ```
 */
export function DataGrid<T>({
  columns,
  data,
  keyExtractor,
  currentPage,
  pageSize,
  totalItems,
  onPageChange,
  onPageSizeChange,
  sortBy,
  sortOrder,
  onSort,
  loading = false,
  emptyMessage = 'No data available',
  className = ''
}: DataGridProps<T>) {
  const totalPages = Math.ceil(totalItems / pageSize);
  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  const handleSort = (column: DataGridColumn<T>) => {
    if (column.sortable && onSort) {
      onSort(column.key);
    }
  };

  const renderSortIcon = (column: DataGridColumn<T>) => {
    if (!column.sortable) return null;
    
    if (sortBy !== column.key) {
      return (
        <div className="inline-flex flex-col ml-1 opacity-30">
          <ArrowUp className="h-3 w-3 -mb-1" />
          <ArrowDown className="h-3 w-3" />
        </div>
      );
    }

    return sortOrder === 'asc' ? (
      <ArrowUp className="h-4 w-4 ml-1 inline" />
    ) : (
      <ArrowDown className="h-4 w-4 ml-1 inline" />
    );
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((column) => (
                <TableHead 
                  key={column.key}
                  className={`${column.className || ''} ${column.sortable ? 'cursor-pointer select-none hover:bg-muted/50' : ''}`}
                  onClick={() => handleSort(column)}
                >
                  <div className="flex items-center">
                    {column.header}
                    {renderSortIcon(column)}
                  </div>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-32 text-center">
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                </TableCell>
              </TableRow>
            ) : data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-32 text-center text-muted-foreground">
                  {emptyMessage}
                </TableCell>
              </TableRow>
            ) : (
              data.map((row) => (
                <TableRow key={keyExtractor(row)}>
                  {columns.map((column) => (
                    <TableCell key={column.key} className={column.className || ''}>
                      {column.render ? column.render(row) : String((row as any)[column.key] || '-')}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Controls */}
      <div className="flex items-center justify-between">
        {/* Items per page */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Rows per page:</span>
          <Select 
            value={String(pageSize)} 
            onValueChange={(value) => onPageSizeChange(Number(value))}
          >
            <SelectTrigger className="w-20">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="20">20</SelectItem>
              <SelectItem value="50">50</SelectItem>
              <SelectItem value="100">100</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Page info */}
        <div className="text-sm text-muted-foreground">
          {totalItems > 0 ? (
            <>
              Showing {startItem} to {endItem} of {totalItems} results
            </>
          ) : (
            'No results'
          )}
        </div>

        {/* Page navigation */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => onPageChange(1)}
            disabled={currentPage === 1 || loading}
            aria-label="First page"
          >
            <ChevronsLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1 || loading}
            aria-label="Previous page"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          <div className="flex items-center gap-1 text-sm">
            <span className="text-muted-foreground">Page</span>
            <span className="font-medium">{currentPage}</span>
            <span className="text-muted-foreground">of</span>
            <span className="font-medium">{totalPages || 1}</span>
          </div>

          <Button
            variant="outline"
            size="icon"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage >= totalPages || loading}
            aria-label="Next page"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => onPageChange(totalPages)}
            disabled={currentPage >= totalPages || loading}
            aria-label="Last page"
          >
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
