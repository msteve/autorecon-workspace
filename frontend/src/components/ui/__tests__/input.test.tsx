import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Input } from '@/components/ui/input';

describe('Input Component', () => {
  it('renders input field', () => {
    render(<Input placeholder="Enter text" />);
    expect(screen.getByPlaceholderText('Enter text')).toBeInTheDocument();
  });

  it('handles value changes', () => {
    render(<Input data-testid="test-input" />);
    const input = screen.getByTestId('test-input') as HTMLInputElement;
    
    fireEvent.change(input, { target: { value: 'test value' } });
    expect(input.value).toBe('test value');
  });

  it('supports different input types', () => {
    render(<Input type="password" data-testid="password-input" />);
    const input = screen.getByTestId('password-input');
    expect(input).toHaveAttribute('type', 'password');
  });

  it('handles disabled state', () => {
    render(<Input disabled data-testid="disabled-input" />);
    const input = screen.getByTestId('disabled-input');
    expect(input).toBeDisabled();
  });
});
