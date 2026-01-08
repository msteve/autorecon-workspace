import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { RetryButton } from '../RetryButton';

describe('RetryButton', () => {
  const mockOnRetry = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders retry button with default text', () => {
    render(<RetryButton onRetry={mockOnRetry} showConfirmation={false} />);

    expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument();
  });

  it('renders with custom children', () => {
    render(
      <RetryButton onRetry={mockOnRetry} showConfirmation={false}>
        Restart Job
      </RetryButton>
    );

    expect(screen.getByText('Restart Job')).toBeInTheDocument();
  });

  it('calls onRetry when clicked (no confirmation)', async () => {
    mockOnRetry.mockResolvedValue(undefined);

    render(<RetryButton onRetry={mockOnRetry} showConfirmation={false} />);

    const button = screen.getByRole('button', { name: /retry/i });
    fireEvent.click(button);

    await waitFor(() => {
      expect(mockOnRetry).toHaveBeenCalledTimes(1);
    });
  });

  it('shows confirmation dialog when showConfirmation is true', async () => {
    render(<RetryButton onRetry={mockOnRetry} showConfirmation={true} />);

    const button = screen.getByRole('button', { name: /retry/i });
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText(/Retry Job?/i)).toBeInTheDocument();
    });
  });

  it('calls onRetry after confirmation', async () => {
    mockOnRetry.mockResolvedValue(undefined);

    render(<RetryButton onRetry={mockOnRetry} showConfirmation={true} />);

    const button = screen.getByRole('button', { name: /retry/i });
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText(/Retry Job?/i)).toBeInTheDocument();
    });

    const confirmButton = screen.getByRole('button', { name: /retry job/i });
    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(mockOnRetry).toHaveBeenCalledTimes(1);
    });
  });

  it('does not call onRetry when cancelled', async () => {
    render(<RetryButton onRetry={mockOnRetry} showConfirmation={true} />);

    const button = screen.getByRole('button', { name: /retry/i });
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText(/Retry Job?/i)).toBeInTheDocument();
    });

    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    fireEvent.click(cancelButton);

    await waitFor(() => {
      expect(mockOnRetry).not.toHaveBeenCalled();
    });
  });

  it('shows loading state while retrying', async () => {
    let resolveRetry: () => void;
    const retryPromise = new Promise<void>((resolve) => {
      resolveRetry = resolve;
    });
    mockOnRetry.mockReturnValue(retryPromise);

    render(<RetryButton onRetry={mockOnRetry} showConfirmation={false} />);

    const button = screen.getByRole('button', { name: /retry/i });
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText(/retrying/i)).toBeInTheDocument();
    });

    resolveRetry!();

    await waitFor(() => {
      expect(screen.queryByText(/retrying/i)).not.toBeInTheDocument();
    });
  });

  it('disables button when disabled prop is true', () => {
    render(<RetryButton onRetry={mockOnRetry} disabled={true} showConfirmation={false} />);

    const button = screen.getByRole('button', { name: /retry/i });
    expect(button).toBeDisabled();
  });

  it('applies size prop correctly', () => {
    const { container } = render(
      <RetryButton onRetry={mockOnRetry} size="sm" showConfirmation={false} />
    );

    const button = container.querySelector('button');
    expect(button).toHaveClass('h-8');
  });

  it('applies variant prop correctly', () => {
    const { container } = render(
      <RetryButton onRetry={mockOnRetry} variant="default" showConfirmation={false} />
    );

    const button = container.querySelector('button');
    expect(button).toHaveClass('bg-primary');
  });

  it('shows custom confirmation title and description', async () => {
    render(
      <RetryButton
        onRetry={mockOnRetry}
        showConfirmation={true}
        confirmationTitle="Custom Title"
        confirmationDescription="Custom description text"
      />
    );

    const button = screen.getByRole('button', { name: /retry/i });
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText('Custom Title')).toBeInTheDocument();
      expect(screen.getByText('Custom description text')).toBeInTheDocument();
    });
  });

  it('applies custom className', () => {
    const { container } = render(
      <RetryButton
        onRetry={mockOnRetry}
        className="custom-class"
        showConfirmation={false}
      />
    );

    const button = container.querySelector('.custom-class');
    expect(button).toBeInTheDocument();
  });
});
