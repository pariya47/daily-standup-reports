import {
  fetchDailyReports,
  fetchWeeklyReports,
  fetchMonthlyReports,
  getSupabaseClient,
  mockTeams, // if needed for verifying mock data structure
} from './supabase';
import type { Report } from './types';

// Mock Supabase client
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
  })),
}));

// Mock getSupabaseClient to control its return value for some tests
jest.mock('./supabase', () => {
  const originalModule = jest.requireActual('./supabase');
  return {
    ...originalModule,
    getSupabaseClient: jest.fn(),
  };
});

describe('Supabase Data Fetching', () => {
  const mockSupabaseClient = {
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    order: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    // Default mock for getSupabaseClient to return the mock client
    (getSupabaseClient as jest.Mock).mockReturnValue(mockSupabaseClient);
  });

  // --- Tests for fetchDailyReports ---
  describe('fetchDailyReports', () => {
    const mockRawDailyReports = [
      { id: 'd1', content: 'Daily 1', created_at: '2023-10-01T10:00:00Z', team_name: 'Team A' },
      { id: 'd2', content: 'Daily 2', created_at: '2023-10-02T10:00:00Z', team_name: 'Team B' },
    ];

    it('should fetch daily reports and add reportType "daily"', async () => {
      mockSupabaseClient.order.mockResolvedValueOnce({ data: mockRawDailyReports, error: null });
      
      const reports = await fetchDailyReports();

      expect(getSupabaseClient).toHaveBeenCalledTimes(1);
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('standup');
      expect(mockSupabaseClient.select).toHaveBeenCalledWith('*');
      expect(mockSupabaseClient.order).toHaveBeenCalledWith('created_at', { ascending: false });
      expect(reports).toHaveLength(2);
      expect(reports[0]).toEqual(expect.objectContaining({ id: 'd1', content: 'Daily 1', teamName: 'Team A', reportType: 'daily' }));
      expect(reports[1]).toEqual(expect.objectContaining({ id: 'd2', content: 'Daily 2', teamName: 'Team B', reportType: 'daily' }));
      expect(reports[0].createdAt).toBeInstanceOf(Date);
    });

    it('should return mock daily reports if Supabase client is unavailable', async () => {
      (getSupabaseClient as jest.Mock).mockReturnValueOnce(null);
      const reports = await fetchDailyReports();
      
      expect(reports.length).toBeGreaterThan(0);
      expect(reports[0].reportType).toBe('daily');
      expect(reports[0].id).toContain('mock-daily-');
    });

    it('should return mock daily reports on Supabase error', async () => {
      mockSupabaseClient.order.mockResolvedValueOnce({ data: null, error: new Error('Supabase error') });
      const reports = await fetchDailyReports();

      expect(reports.length).toBeGreaterThan(0);
      expect(reports[0].reportType).toBe('daily');
      expect(reports[0].id).toContain('mock-daily-');
    });
  });

  // --- Tests for fetchWeeklyReports ---
  describe('fetchWeeklyReports', () => {
    const mockRawWeeklyReports = [
      { id: 'w1', content: 'Weekly 1', created_at: '2023-10-07T10:00:00Z', team_name: 'Team C' },
    ];

    it('should fetch weekly reports and add reportType "weekly"', async () => {
      mockSupabaseClient.order.mockResolvedValueOnce({ data: mockRawWeeklyReports, error: null });
      const reports = await fetchWeeklyReports();

      expect(getSupabaseClient).toHaveBeenCalledTimes(1);
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('weekly_reports');
      expect(mockSupabaseClient.select).toHaveBeenCalledWith('*');
      expect(mockSupabaseClient.order).toHaveBeenCalledWith('created_at', { ascending: false });
      expect(reports).toHaveLength(1);
      expect(reports[0]).toEqual(expect.objectContaining({ id: 'w1', content: 'Weekly 1', teamName: 'Team C', reportType: 'weekly' }));
      expect(reports[0].createdAt).toBeInstanceOf(Date);
    });

    it('should return mock weekly reports if Supabase client is unavailable', async () => {
      (getSupabaseClient as jest.Mock).mockReturnValueOnce(null);
      const reports = await fetchWeeklyReports();

      expect(reports.length).toBeGreaterThan(0);
      expect(reports[0].reportType).toBe('weekly');
      expect(reports[0].id).toContain('mock-weekly-');
    });

    it('should return mock weekly reports on Supabase error', async () => {
      mockSupabaseClient.order.mockResolvedValueOnce({ data: null, error: new Error('Supabase error') });
      const reports = await fetchWeeklyReports();
      
      expect(reports.length).toBeGreaterThan(0);
      expect(reports[0].reportType).toBe('weekly');
      expect(reports[0].id).toContain('mock-weekly-');
    });
  });

  // --- Tests for fetchMonthlyReports ---
  describe('fetchMonthlyReports', () => {
    const mockRawMonthlyReports = [
      { id: 'm1', content: 'Monthly 1', created_at: '2023-10-31T10:00:00Z', team_name: 'Team D' },
    ];

    it('should fetch monthly reports and add reportType "monthly"', async () => {
      mockSupabaseClient.order.mockResolvedValueOnce({ data: mockRawMonthlyReports, error: null });
      const reports = await fetchMonthlyReports();

      expect(getSupabaseClient).toHaveBeenCalledTimes(1);
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('monthly_reports');
      expect(mockSupabaseClient.select).toHaveBeenCalledWith('*');
      expect(mockSupabaseClient.order).toHaveBeenCalledWith('created_at', { ascending: false });
      expect(reports).toHaveLength(1);
      expect(reports[0]).toEqual(expect.objectContaining({ id: 'm1', content: 'Monthly 1', teamName: 'Team D', reportType: 'monthly' }));
      expect(reports[0].createdAt).toBeInstanceOf(Date);
    });

    it('should return mock monthly reports if Supabase client is unavailable', async () => {
      (getSupabaseClient as jest.Mock).mockReturnValueOnce(null);
      const reports = await fetchMonthlyReports();

      expect(reports.length).toBeGreaterThan(0);
      expect(reports[0].reportType).toBe('monthly');
      expect(reports[0].id).toContain('mock-monthly-');
    });

    it('should return mock monthly reports on Supabase error', async () => {
      mockSupabaseClient.order.mockResolvedValueOnce({ data: null, error: new Error('Supabase error') });
      const reports = await fetchMonthlyReports();

      expect(reports.length).toBeGreaterThan(0);
      expect(reports[0].reportType).toBe('monthly');
      expect(reports[0].id).toContain('mock-monthly-');
    });
  });
});
