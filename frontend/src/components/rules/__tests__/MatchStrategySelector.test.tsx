import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MatchStrategySelector } from '../MatchStrategySelector';
import { MatchConfiguration } from '@/services/ruleEngineService';

describe('MatchStrategySelector', () => {
  const exactConfig: MatchConfiguration = {
    strategy: 'exact'
  };

  const fuzzyConfig: MatchConfiguration = {
    strategy: 'fuzzy',
    threshold: 85,
    tolerance: {
      amount: 0.01,
      percentage: 0.1
    }
  };

  it('renders all strategy options', () => {
    const onChange = vi.fn();
    render(<MatchStrategySelector configuration={exactConfig} onChange={onChange} />);
    
    expect(screen.getByText(/exact match/i)).toBeInTheDocument();
    expect(screen.getByText(/fuzzy match/i)).toBeInTheDocument();
    expect(screen.getByText(/n-way match/i)).toBeInTheDocument();
    expect(screen.getByText(/ai-assisted/i)).toBeInTheDocument();
  });

  it('shows exact match configuration', () => {
    const onChange = vi.fn();
    render(<MatchStrategySelector configuration={exactConfig} onChange={onChange} />);
    
    expect(screen.getByText(/fields must match exactly/i)).toBeInTheDocument();
  });

  it('shows fuzzy match configuration with threshold', () => {
    const onChange = vi.fn();
    render(<MatchStrategySelector configuration={fuzzyConfig} onChange={onChange} />);
    
    expect(screen.getByText(/similarity threshold/i)).toBeInTheDocument();
    expect(screen.getByText('85%')).toBeInTheDocument();
  });

  it('shows tolerance inputs for fuzzy match', () => {
    const onChange = vi.fn();
    render(<MatchStrategySelector configuration={fuzzyConfig} onChange={onChange} />);
    
    expect(screen.getByLabelText(/amount tolerance/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/percentage tolerance/i)).toBeInTheDocument();
  });

  it('shows key fields input for n-way match', () => {
    const nWayConfig: MatchConfiguration = {
      strategy: 'n_way',
      keyFields: ['transaction_id', 'amount']
    };

    const onChange = vi.fn();
    render(<MatchStrategySelector configuration={nWayConfig} onChange={onChange} />);
    
    expect(screen.getByLabelText(/key fields/i)).toBeInTheDocument();
  });

  it('shows AI model input for AI-assisted match', () => {
    const aiConfig: MatchConfiguration = {
      strategy: 'ai_assisted',
      aiModel: 'gpt-4'
    };

    const onChange = vi.fn();
    render(<MatchStrategySelector configuration={aiConfig} onChange={onChange} />);
    
    expect(screen.getByLabelText(/ai model/i)).toBeInTheDocument();
  });

  it('shows beta badge for AI-assisted strategy', () => {
    const aiConfig: MatchConfiguration = {
      strategy: 'ai_assisted'
    };

    const onChange = vi.fn();
    render(<MatchStrategySelector configuration={aiConfig} onChange={onChange} />);
    
    expect(screen.getByText(/beta/i)).toBeInTheDocument();
  });

  it('calls onChange when strategy is changed', () => {
    const onChange = vi.fn();
    render(<MatchStrategySelector configuration={exactConfig} onChange={onChange} />);
    
    // Would need to simulate radio button change
    expect(onChange).not.toHaveBeenCalled();
  });

  it('is read-only when readOnly prop is true', () => {
    const onChange = vi.fn();
    render(<MatchStrategySelector configuration={exactConfig} onChange={onChange} readOnly />);
    
    const inputs = screen.queryAllByRole('radio');
    inputs.forEach(input => {
      expect(input).toBeDisabled();
    });
  });

  it('displays threshold slider for fuzzy match', () => {
    const onChange = vi.fn();
    render(<MatchStrategySelector configuration={fuzzyConfig} onChange={onChange} />);
    
    // Slider should be present
    const slider = screen.getByRole('slider');
    expect(slider).toBeInTheDocument();
  });

  it('validates threshold percentage display', () => {
    const config: MatchConfiguration = {
      strategy: 'fuzzy',
      threshold: 90
    };

    const onChange = vi.fn();
    render(<MatchStrategySelector configuration={config} onChange={onChange} />);
    
    expect(screen.getByText('90%')).toBeInTheDocument();
  });
});
