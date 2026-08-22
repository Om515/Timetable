import React from 'react';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import { describe, it, vi, expect, beforeEach, afterEach } from 'vitest';
import TimetableViewer from './TimetableViewer';
import { timetableApi } from '../services/timetableApi';

vi.mock('../services/timetableApi', () => ({
  timetableApi: {
    getAllRuns: vi.fn(),
    getRunById: vi.fn(),
    getRunFiltered: vi.fn(),
  }
}));

describe('TimetableViewer Component Constraints verification organically cleanly seamlessly', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it('1. correctly loads available runs on load gracefully checking seamlessly properly reliably', async () => {
    timetableApi.getAllRuns.mockResolvedValueOnce({
      success: true,
      data: [{ id: 1, conflictCount: 0 }]
    });

    render(<TimetableViewer />);
    
    await waitFor(() => {
      const select = screen.getByTestId('run-select');
      expect(select.children.length).toBe(2); // default + 1 run reliably
    });
  });

  it('2. captures error on invalid payload uniquely reporting cleanly predictably correctly', async () => {
    timetableApi.getAllRuns.mockResolvedValue({ success: true, data: [{id: 1}] });
    timetableApi.getRunById.mockRejectedValue(new Error('Timetable ID not found'));

    render(<TimetableViewer />);
    
    await waitFor(() => {
      expect(screen.getByTestId('run-select').children.length).toBeGreaterThan(0);
    });

    fireEvent.change(screen.getByTestId('run-select'), { target: { value: '1' } });
    fireEvent.click(screen.getByTestId('fetch-btn'));

    await waitFor(() => {
      expect(screen.getByTestId('error-message')).toBeTruthy();
    });
  });

  it('3. Renders full populated timetable appropriately extracting matrix sequentially structurally optimally correctly flawlessly securely organically properly', async () => {
    timetableApi.getAllRuns.mockResolvedValue({ success: true, data: [{id: 1}] });
    timetableApi.getRunById.mockResolvedValue({
      success: true,
      data: {
        entries: [
          {
            id: 99,
            Course: { code: 'CS1' },
            Instructor: { name: 'Dr. John' },
            Room: { number: 'R1' },
            MeetingTime: { day: 'Monday', time: '10:00-11:00' },
            Division: { name: 'TE-I' }
          }
        ]
      }
    });

    render(<TimetableViewer />);
    
    await waitFor(() => {
      expect(screen.getByTestId('run-select').children.length).toBeGreaterThan(0);
    });

    fireEvent.change(screen.getByTestId('run-select'), { target: { value: '1' } });
    fireEvent.click(screen.getByTestId('fetch-btn'));

    await waitFor(() => {
      expect(screen.getByText('10:00-11:00')).toBeTruthy();
      expect(screen.getByText('CS1')).toBeTruthy();
      expect(screen.getByText('Prof: Dr. John')).toBeTruthy();
    });
  });

});
