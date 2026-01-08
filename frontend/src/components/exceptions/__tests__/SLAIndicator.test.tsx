import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SLAIndicator } from '../SLAIndicator';

describe('SLAIndicator', () => {
  it('renders within SLA status correctly', () => {
    render(
      <SLAIndicator 
        slaStatus="within_sla" 
        daysRemaining={5} 
        showLabel 
      />
    );
    
    expect(screen.getByText('On Track')).toBeInTheDocument();
    expect(screen.getByText(/5 days remaining/)).toBeInTheDocument();
  });

  it('renders approaching SLA status correctly', () => {
    render(
      <SLAIndicator 
        slaStatus="approaching" 
        daysRemaining={1} 
        showLabel 
      />
    );
    
    expect(screen.getByText('Due Soon')).toBeInTheDocument();
    expect(screen.getByText(/1 day remaining/)).toBeInTheDocument();
  });

  it('renders breached SLA status correctly', () => {
    render(
      <SLAIndicator 
        slaStatus="breached" 
        daysRemaining={-2} 
        showLabel 
      />
    );
    
    expect(screen.getByText('Overdue')).toBeInTheDocument();
    expect(screen.getByText(/2 days overdue/)).toBeInTheDocument();
  });

  it('renders without label when showLabel is false', () => {
    render(
      <SLAIndicator 
        slaStatus="within_sla" 
        daysRemaining={5} 
        showLabel={false} 
      />
    );
    
    expect(screen.queryByText('On Track')).not.toBeInTheDocument();
  });

  it('applies correct styling for different sizes', () => {
    const { rerender, container } = render(
      <SLAIndicator 
        slaStatus="within_sla" 
        daysRemaining={5} 
        size="sm" 
      />
    );
    
    const badge = container.querySelector('.text-xs');
    expect(badge).toBeInTheDocument();
    
    rerender(
      <SLAIndicator 
        slaStatus="within_sla" 
        daysRemaining={5} 
        size="lg" 
      />
    );
    
    const largeBadge = container.querySelector('.text-base');
    expect(largeBadge).toBeInTheDocument();
  });

  it('uses singular form for 1 day', () => {
    render(
      <SLAIndicator 
        slaStatus="within_sla" 
        daysRemaining={1} 
        showLabel 
      />
    );
    
    expect(screen.getByText(/1 day remaining/)).toBeInTheDocument();
  });

  it('uses plural form for multiple days', () => {
    render(
      <SLAIndicator 
        slaStatus="within_sla" 
        daysRemaining={3} 
        showLabel 
      />
    );
    
    expect(screen.getByText(/3 days remaining/)).toBeInTheDocument();
  });
});
