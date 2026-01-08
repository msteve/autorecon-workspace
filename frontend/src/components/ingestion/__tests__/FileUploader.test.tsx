import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { FileUploader } from '../FileUploader';

describe('FileUploader', () => {
  const mockOnFileSelect = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders upload prompt', () => {
    render(<FileUploader onFileSelect={mockOnFileSelect} />);

    expect(screen.getByText(/drag and drop your file here/i)).toBeInTheDocument();
    expect(screen.getByText(/click to browse/i)).toBeInTheDocument();
  });

  it('shows accepted formats and max size', () => {
    render(<FileUploader onFileSelect={mockOnFileSelect} maxSize={5242880} />);

    expect(screen.getByText(/Supported formats/i)).toBeInTheDocument();
    expect(screen.getByText(/5 MB/i)).toBeInTheDocument();
  });

  it('handles file selection via input', async () => {
    render(<FileUploader onFileSelect={mockOnFileSelect} />);

    const file = new File(['test content'], 'test.csv', { type: 'text/csv' });
    const input = screen.getByRole('textbox', { hidden: true }) as HTMLInputElement;

    Object.defineProperty(input, 'files', {
      value: [file],
    });

    fireEvent.change(input);

    await waitFor(() => {
      expect(mockOnFileSelect).toHaveBeenCalledWith(file);
    });

    expect(screen.getByText('test.csv')).toBeInTheDocument();
  });

  it('validates file size', async () => {
    render(<FileUploader onFileSelect={mockOnFileSelect} maxSize={1000} />);

    const largeFile = new File(['x'.repeat(2000)], 'large.csv', { type: 'text/csv' });
    const input = screen.getByRole('textbox', { hidden: true }) as HTMLInputElement;

    Object.defineProperty(input, 'files', {
      value: [largeFile],
    });

    fireEvent.change(input);

    await waitFor(() => {
      expect(screen.getByText(/File size exceeds/i)).toBeInTheDocument();
    });

    expect(mockOnFileSelect).not.toHaveBeenCalled();
  });

  it('validates file type', async () => {
    render(<FileUploader onFileSelect={mockOnFileSelect} accept=".csv" />);

    const pdfFile = new File(['test'], 'test.pdf', { type: 'application/pdf' });
    const input = screen.getByRole('textbox', { hidden: true }) as HTMLInputElement;

    Object.defineProperty(input, 'files', {
      value: [pdfFile],
    });

    fireEvent.change(input);

    await waitFor(() => {
      expect(screen.getByText(/File type not supported/i)).toBeInTheDocument();
    });

    expect(mockOnFileSelect).not.toHaveBeenCalled();
  });

  it('allows file removal', async () => {
    render(<FileUploader onFileSelect={mockOnFileSelect} />);

    const file = new File(['test'], 'test.csv', { type: 'text/csv' });
    const input = screen.getByRole('textbox', { hidden: true }) as HTMLInputElement;

    Object.defineProperty(input, 'files', {
      value: [file],
    });

    fireEvent.change(input);

    await waitFor(() => {
      expect(screen.getByText('test.csv')).toBeInTheDocument();
    });

    const removeButton = screen.getByRole('button', { name: '' });
    fireEvent.click(removeButton);

    await waitFor(() => {
      expect(screen.queryByText('test.csv')).not.toBeInTheDocument();
    });
  });

  it('shows upload progress', () => {
    render(<FileUploader onFileSelect={mockOnFileSelect} uploadProgress={50} />);

    const file = new File(['test'], 'test.csv', { type: 'text/csv' });
    const input = screen.getByRole('textbox', { hidden: true }) as HTMLInputElement;

    Object.defineProperty(input, 'files', {
      value: [file],
    });

    fireEvent.change(input);

    expect(screen.getByText(/50%/i)).toBeInTheDocument();
    expect(screen.getByText(/Uploading/i)).toBeInTheDocument();
  });

  it('shows upload complete state', () => {
    const { container } = render(
      <FileUploader onFileSelect={mockOnFileSelect} uploadProgress={100} />
    );

    const file = new File(['test'], 'test.csv', { type: 'text/csv' });
    const input = screen.getByRole('textbox', { hidden: true }) as HTMLInputElement;

    Object.defineProperty(input, 'files', {
      value: [file],
    });

    fireEvent.change(input);

    expect(screen.getByText(/Upload complete/i)).toBeInTheDocument();
  });

  it('disables interaction when disabled prop is true', () => {
    render(<FileUploader onFileSelect={mockOnFileSelect} disabled={true} />);

    const input = screen.getByRole('textbox', { hidden: true }) as HTMLInputElement;
    expect(input).toBeDisabled();
  });

  it('displays custom error message', () => {
    render(<FileUploader onFileSelect={mockOnFileSelect} error="Custom error message" />);

    expect(screen.getByText('Custom error message')).toBeInTheDocument();
  });
});
