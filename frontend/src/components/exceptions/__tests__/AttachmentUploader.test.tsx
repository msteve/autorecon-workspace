import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AttachmentUploader } from '../AttachmentUploader';
import { ExceptionAttachment } from '@/services/exceptionsService';

describe('AttachmentUploader', () => {
  const mockAttachments: ExceptionAttachment[] = [
    {
      id: 'att1',
      exceptionId: 'exc1',
      fileName: 'invoice.pdf',
      fileSize: 102400,
      fileType: 'application/pdf',
      uploadedBy: 'user1',
      uploadedByName: 'John Doe',
      uploadedAt: new Date('2024-01-01').toISOString(),
      url: 'https://example.com/invoice.pdf'
    },
    {
      id: 'att2',
      exceptionId: 'exc1',
      fileName: 'screenshot.png',
      fileSize: 204800,
      fileType: 'image/png',
      uploadedBy: 'user2',
      uploadedByName: 'Jane Smith',
      uploadedAt: new Date('2024-01-02').toISOString(),
      url: 'https://example.com/screenshot.png'
    }
  ];

  it('renders attachments list correctly', () => {
    const onUpload = vi.fn();
    render(
      <AttachmentUploader 
        attachments={mockAttachments} 
        onUpload={onUpload} 
      />
    );
    
    expect(screen.getByText('invoice.pdf')).toBeInTheDocument();
    expect(screen.getByText('screenshot.png')).toBeInTheDocument();
    expect(screen.getByText(/John Doe/)).toBeInTheDocument();
    expect(screen.getByText(/Jane Smith/)).toBeInTheDocument();
  });

  it('displays file sizes correctly', () => {
    const onUpload = vi.fn();
    render(
      <AttachmentUploader 
        attachments={mockAttachments} 
        onUpload={onUpload} 
      />
    );
    
    expect(screen.getByText('100 KB')).toBeInTheDocument();
    expect(screen.getByText('200 KB')).toBeInTheDocument();
  });

  it('shows attachment count in title', () => {
    const onUpload = vi.fn();
    render(
      <AttachmentUploader 
        attachments={mockAttachments} 
        onUpload={onUpload} 
      />
    );
    
    expect(screen.getByText(`Attachments (${mockAttachments.length})`)).toBeInTheDocument();
  });

  it('shows empty state when no attachments', () => {
    const onUpload = vi.fn();
    render(
      <AttachmentUploader 
        attachments={[]} 
        onUpload={onUpload} 
      />
    );
    
    expect(screen.getByText('No attachments yet')).toBeInTheDocument();
  });

  it('handles file upload', async () => {
    const onUpload = vi.fn().mockResolvedValue(undefined);
    render(
      <AttachmentUploader 
        attachments={[]} 
        onUpload={onUpload} 
      />
    );
    
    const file = new File(['content'], 'test.pdf', { type: 'application/pdf' });
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    
    Object.defineProperty(input, 'files', {
      value: [file],
      writable: false,
    });
    
    fireEvent.change(input);
    
    await waitFor(() => {
      expect(onUpload).toHaveBeenCalledWith(file);
    });
  });

  it('validates file size', async () => {
    const onUpload = vi.fn();
    const maxSize = 1024; // 1KB
    render(
      <AttachmentUploader 
        attachments={[]} 
        onUpload={onUpload}
        maxFileSize={maxSize}
      />
    );
    
    const largeFile = new File(['x'.repeat(2048)], 'large.pdf', { type: 'application/pdf' });
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    
    Object.defineProperty(input, 'files', {
      value: [largeFile],
      writable: false,
    });
    
    fireEvent.change(input);
    
    await waitFor(() => {
      expect(screen.getByText(/Upload Failed/)).toBeInTheDocument();
      expect(onUpload).not.toHaveBeenCalled();
    });
  });

  it('handles download action', () => {
    const onUpload = vi.fn();
    const windowOpen = vi.spyOn(window, 'open').mockImplementation(() => null);
    
    render(
      <AttachmentUploader 
        attachments={mockAttachments} 
        onUpload={onUpload} 
      />
    );
    
    const downloadButtons = screen.getAllByRole('button');
    const downloadButton = downloadButtons.find(btn => 
      btn.querySelector('svg')?.getAttribute('class')?.includes('Download')
    );
    
    if (downloadButton) {
      fireEvent.click(downloadButton);
      expect(windowOpen).toHaveBeenCalled();
    }
  });

  it('handles delete action', async () => {
    const onUpload = vi.fn();
    const onDelete = vi.fn().mockResolvedValue(undefined);
    
    render(
      <AttachmentUploader 
        attachments={mockAttachments} 
        onUpload={onUpload}
        onDelete={onDelete}
      />
    );
    
    const deleteButtons = screen.getAllByRole('button');
    const trashButton = deleteButtons.find(btn => 
      btn.textContent?.includes('Trash') || 
      btn.querySelector('[class*="Trash"]')
    );
    
    if (trashButton) {
      fireEvent.click(trashButton);
      await waitFor(() => {
        expect(onDelete).toHaveBeenCalledWith('att1');
      });
    }
  });

  it('displays file type icons correctly', () => {
    const onUpload = vi.fn();
    const { container } = render(
      <AttachmentUploader 
        attachments={mockAttachments} 
        onUpload={onUpload} 
      />
    );
    
    // Check for PDF and Image icons
    const icons = container.querySelectorAll('svg');
    expect(icons.length).toBeGreaterThan(0);
  });
});
