import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';

import { DateSelector } from '../components/decision-desk/DateSelector';
import { CutoffSelector } from '../components/decision-desk/CutoffSelector';
import { KPISummaryCards } from '../components/decision-desk/KPISummaryCards';
import { DecisionDeskSummary } from '../types/api';

describe('DateSelector Component', () => {
  it('renders target date and handles quick jump buttons', () => {
    const handleDateChange = vi.fn();
    render(<DateSelector selectedDate="2026-01-15" onDateChange={handleDateChange} />);

    expect(screen.getByText(/15 Jan 2026/i)).toBeInTheDocument();
    
    // Click quick date 'Jan 01'
    const jan01Btn = screen.getByText('Jan 01');
    fireEvent.click(jan01Btn);
    expect(handleDateChange).toHaveBeenCalledWith('2026-01-01');
  });

  it('prevents decrementing before Jan 01', () => {
    const handleDateChange = vi.fn();
    render(<DateSelector selectedDate="2026-01-01" onDateChange={handleDateChange} />);

    const prevBtn = screen.getByTitle('Previous Day');
    expect(prevBtn).toBeDisabled();
  });
});

describe('CutoffSelector Component', () => {
  it('renders standard day-ahead auction gates and allows selection', () => {
    const handleCutoffChange = vi.fn();
    render(
      <CutoffSelector
        cutoffRule="DA_AUCTION_1100"
        onCutoffChange={handleCutoffChange}
        cutoffTime="2026-01-14T11:00:00Z"
        cutoffDescription="Day-Ahead Auction Gate (11:00 UTC on D-1)"
      />
    );

    expect(screen.getByText(/11:00 UTC \(D-1\)/i)).toBeInTheDocument();
    expect(screen.getByText(/12:00 UTC \(D-1\)/i)).toBeInTheDocument();

    // Click 12:00 UTC gate
    const gate12Btn = screen.getByText(/12:00 UTC \(D-1\)/i);
    fireEvent.click(gate12Btn);
    expect(handleCutoffChange).toHaveBeenCalledWith('DA_AUCTION_1200');
  });
});

describe('KPISummaryCards Component', () => {
  it('renders summary KPIs accurately with units', () => {
    const mockSummary: DecisionDeskSummary = {
      totalForecastMWh: 350000,
      totalActualMWh: 330000,
      avgForecastMW: 14583.3,
      avgActualMW: 13750.0,
      maeMW: 1250.5,
      rmseMW: 1540.2,
      meanBiasMW: 833.3,
      wapePercent: 9.09,
      matchedRecords: 48,
      totalExpectedRecords: 48,
      coveragePercent: 100.0,
      isCached: true
    };

    render(<KPISummaryCards summary={mockSummary} />);

    expect(screen.getByText('350,000')).toBeInTheDocument();
    expect(screen.getByText('330,000')).toBeInTheDocument();
    expect(screen.getByText('1,250.5')).toBeInTheDocument();
    expect(screen.getByText('100%')).toBeInTheDocument();
    expect(screen.getByText('9.09% WAPE')).toBeInTheDocument();
  });
});

import { MetricCards } from '../components/accuracy/MetricCards';
import { OverallMetrics } from '../types/api';

describe('MetricCards Component', () => {
  it('renders predictive R² and squared Pearson r² with statistical distinction', () => {
    const mockMetrics: OverallMetrics = {
      sampleSize: 1488,
      matchedRecords: 1488,
      missingRecords: 0,
      coveragePercent: 100.0,
      maeMW: 2126.1,
      rmseMW: 2620.8,
      meanBiasMW: 1840.3,
      wapePercent: 18.36,
      squaredPearsonR2: 0.860,
      predictiveR2: 0.602,
      correlationR2: 0.860,
      p10ErrorMW: -720.0,
      p50ErrorMW: 1680.0,
      p90ErrorMW: 4850.0
    };

    render(<MetricCards metrics={mockMetrics} />);

    expect(screen.getByText('2,126.1')).toBeInTheDocument();
    expect(screen.getByText('2,620.8')).toBeInTheDocument();
    expect(screen.getByText('+1,840.3')).toBeInTheDocument();
    expect(screen.getByText('18.36%')).toBeInTheDocument();
    expect(screen.getByText('0.602')).toBeInTheDocument();
    expect(screen.getByText('0.860')).toBeInTheDocument();

    // Check help explanation toggle
    const helpBtn = screen.getByTitle('Click to explain difference between Predictive R² and Pearson r²');
    fireEvent.click(helpBtn);
    expect(screen.getByText(/Statistical Metric Distinction: Predictive R/i)).toBeInTheDocument();
  });
});
