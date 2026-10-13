import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { DataSourceBadge } from '../shared/DataSourceBadge';

describe('DataSourceBadge Component', () => {
  it('renders "Demo / Simulated" when isSimulated is true', () => {
    render(<DataSourceBadge isSimulated={true} />);
    expect(screen.getByText('Demo / Simulated')).toBeInTheDocument();
  });

  it('renders "Demo / Simulated" when dataSource contains SIMULATOR', () => {
    render(<DataSourceBadge dataSource="SIMULATOR_THEFT" isSimulated={false} />);
    expect(screen.getByText('Demo / Simulated')).toBeInTheDocument();
  });

  it('renders "ESP32 Hardware" when dataSource is ESP32_PZEM004T and not simulated', () => {
    render(<DataSourceBadge dataSource="ESP32_PZEM004T" isSimulated={false} />);
    expect(screen.getByText('ESP32 Hardware')).toBeInTheDocument();
  });
});
