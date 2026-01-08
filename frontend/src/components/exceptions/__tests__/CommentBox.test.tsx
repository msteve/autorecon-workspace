import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { CommentBox } from '../CommentBox';
import { ExceptionComment } from '@/services/exceptionsService';

describe('CommentBox', () => {
  const mockComments: ExceptionComment[] = [
    {
      id: 'comment1',
      exceptionId: 'exc1',
      userId: 'user1',
      userName: 'John Doe',
      userAvatar: null,
      content: 'This needs immediate attention',
      isInternal: false,
      createdAt: new Date('2024-01-01').toISOString(),
      updatedAt: new Date('2024-01-01').toISOString()
    },
    {
      id: 'comment2',
      exceptionId: 'exc1',
      userId: 'user2',
      userName: 'Jane Smith',
      userAvatar: null,
      content: 'Internal note: escalate to manager',
      isInternal: true,
      createdAt: new Date('2024-01-02').toISOString(),
      updatedAt: new Date('2024-01-02').toISOString()
    }
  ];

  it('renders comment list correctly', () => {
    const onAddComment = vi.fn();
    render(
      <CommentBox comments={mockComments} onAddComment={onAddComment} />
    );
    
    expect(screen.getByText('This needs immediate attention')).toBeInTheDocument();
    expect(screen.getByText('Internal note: escalate to manager')).toBeInTheDocument();
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
  });

  it('displays internal badge for internal comments', () => {
    const onAddComment = vi.fn();
    render(
      <CommentBox comments={mockComments} onAddComment={onAddComment} />
    );
    
    const internalBadges = screen.getAllByText('Internal');
    expect(internalBadges).toHaveLength(1);
  });

  it('allows adding new comments', async () => {
    const onAddComment = vi.fn().mockResolvedValue(undefined);
    render(
      <CommentBox comments={[]} onAddComment={onAddComment} />
    );
    
    const textarea = screen.getByPlaceholderText('Add a comment...');
    fireEvent.change(textarea, { target: { value: 'New comment' } });
    
    const postButton = screen.getByRole('button', { name: /Post Comment/i });
    fireEvent.click(postButton);
    
    await waitFor(() => {
      expect(onAddComment).toHaveBeenCalledWith('New comment', false);
    });
  });

  it('allows marking comments as internal', async () => {
    const onAddComment = vi.fn().mockResolvedValue(undefined);
    render(
      <CommentBox 
        comments={[]} 
        onAddComment={onAddComment}
        showInternalToggle 
      />
    );
    
    const textarea = screen.getByPlaceholderText('Add a comment...');
    fireEvent.change(textarea, { target: { value: 'Internal comment' } });
    
    const internalCheckbox = screen.getByRole('checkbox');
    fireEvent.click(internalCheckbox);
    
    const postButton = screen.getByRole('button', { name: /Post Comment/i });
    fireEvent.click(postButton);
    
    await waitFor(() => {
      expect(onAddComment).toHaveBeenCalledWith('Internal comment', true);
    });
  });

  it('clears textarea after successful submission', async () => {
    const onAddComment = vi.fn().mockResolvedValue(undefined);
    render(
      <CommentBox comments={[]} onAddComment={onAddComment} />
    );
    
    const textarea = screen.getByPlaceholderText('Add a comment...') as HTMLTextAreaElement;
    fireEvent.change(textarea, { target: { value: 'Test comment' } });
    
    const postButton = screen.getByRole('button', { name: /Post Comment/i });
    fireEvent.click(postButton);
    
    await waitFor(() => {
      expect(textarea.value).toBe('');
    });
  });

  it('disables submit when comment is empty', () => {
    const onAddComment = vi.fn();
    render(
      <CommentBox comments={[]} onAddComment={onAddComment} />
    );
    
    const postButton = screen.getByRole('button', { name: /Post Comment/i });
    expect(postButton).toBeDisabled();
  });

  it('shows empty state when no comments', () => {
    const onAddComment = vi.fn();
    render(
      <CommentBox comments={[]} onAddComment={onAddComment} />
    );
    
    expect(screen.getByText('No comments yet')).toBeInTheDocument();
    expect(screen.getByText('Be the first to comment')).toBeInTheDocument();
  });

  it('displays comment count in title', () => {
    const onAddComment = vi.fn();
    render(
      <CommentBox comments={mockComments} onAddComment={onAddComment} />
    );
    
    expect(screen.getByText(`Comments (${mockComments.length})`)).toBeInTheDocument();
  });
});
