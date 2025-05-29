import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Dashboard } from './dashboard'; // Adjust path as necessary
import * as supabaseLib from '@/lib/supabase'; // To mock its functions
import type { Report, ReportType } from '@/lib/types';

// Mock next/font/google
jest.mock('next/font/google', () => ({
  Inter: () => ({ className: 'mock-inter-font' }),
}));

// Mock lucide-react icons
jest.mock('lucide-react', () => {
  const original = jest.requireActual('lucide-react');
  return {
    ...original,
    Menu: (props: any) => <svg data-testid="icon-menu" {...props} />,
    FileText: (props: any) => <svg data-testid="icon-filetext" {...props} />,
    CalendarDays: (props: any) => <svg data-testid="icon-calendardays" {...props} />,
    Columns: (props: any) => <svg data-testid="icon-columns" {...props} />,
    Calendar: (props: any) => <svg data-testid="icon-calendar" {...props} />,
    ChevronDown: (props: any) => <svg data-testid="icon-chevrondown" {...props} />,
    ChevronRight: (props: any) => <svg data-testid="icon-chevronright" {...props} />,
    // Add any other icons used by Sidebar or Dashboard if necessary
  };
});

// Mock CommandDialogDemo
jest.mock('@/components/cmd', () => ({
  CommandDialogDemo: () => <div data-testid="mock-cmd-dialog"></div>,
}));


// Mock the supabase library functions
jest.mock('@/lib/supabase', () => ({
  fetchDailyReports: jest.fn(),
  fetchWeeklyReports: jest.fn(),
  fetchMonthlyReports: jest.fn(),
  // Keep other exports if Dashboard depends on them, e.g., mockTeams for mock data generation
  mockTeams: ['Engineering', 'Design'], 
  // Mock the mockReports function if it's used by the component during error/empty states, though our fetch mocks should cover this.
  mockReports: jest.fn((teams: string[], reportType: ReportType) => mockReportGenerator(teams, reportType, 1) as Report[]),
}));

const mockReportGenerator = (
  teams: string[],
  reportType: ReportType,
  count: number,
  startDate = new Date('2023-10-26T10:00:00Z')
): Partial<Report>[] => {
  return teams.flatMap((team) =>
    Array.from({ length: count }).map((_, i) => {
      const reportDate = new Date(startDate);
      if (reportType === 'daily') reportDate.setDate(startDate.getDate() - i);
      else if (reportType === 'weekly') reportDate.setDate(startDate.getDate() - i * 7);
      else if (reportType === 'monthly') reportDate.setMonth(startDate.getMonth() - i);
      
      return {
        id: `mock-${reportType}-${team}-${i + 1}`,
        content: `This is a mock ${reportType} report for ${team} ${i + 1}. Content for ${team}.`,
        createdAt: reportDate,
        teamName: team,
        reportType: reportType,
      };
    })
  ) as Report[];
};


describe('Dashboard Integration Tests - Report Granularity', () => {
  const dailyMockReports = mockReportGenerator(supabaseLib.mockTeams, 'daily', 2, new Date('2023-10-26T10:00:00Z')) as Report[];
  const weeklyMockReports = mockReportGenerator(supabaseLib.mockTeams, 'weekly', 1, new Date('2023-10-23T10:00:00Z')) as Report[];
  const monthlyMockReports = mockReportGenerator(supabaseLib.mockTeams, 'monthly', 1, new Date('2023-10-01T10:00:00Z')) as Report[];

  beforeEach(() => {
    jest.clearAllMocks();
    // Default successful fetches
    (supabaseLib.fetchDailyReports as jest.Mock).mockResolvedValue(dailyMockReports);
    (supabaseLib.fetchWeeklyReports as jest.Mock).mockResolvedValue(weeklyMockReports);
    (supabaseLib.fetchMonthlyReports as jest.Mock).mockResolvedValue(monthlyMockReports);
  });

  test('1. Default View (Daily)', async () => {
    render(<Dashboard />);

    // Verify 'Daily' reports are loaded by default
    expect(supabaseLib.fetchDailyReports).toHaveBeenCalledTimes(1);
    await screen.findByText(/Daily Reports/i); // Sidebar title
    
    // Check if daily reports are grouped correctly (e.g., by date title)
    // For dailyMockReports starting 2023-10-26
    await screen.findByText(/Oct 26, 2023/i); // Group title
    await screen.findByText(/Oct 25, 2023/i); 

    // Verify Daily Summary is present (assuming first group has a summary)
    // The summary text in sidebar is "Daily Summary Ready!"
    const dailySummaryButton = await screen.findAllByText(/Daily Summary Ready!/i);
    expect(dailySummaryButton.length).toBeGreaterThan(0);
    fireEvent.click(dailySummaryButton[0]);
    
    await waitFor(() => {
      // Check if the main area displays the summary content
      // The title in the header changes, and also the content in FullReport/WordCloud
      expect(screen.getByRole('heading', { name: /Daily Summary/i })).toBeInTheDocument();
      expect(screen.getByText(/This is a mock daily report for Engineering 1/i)).toBeInTheDocument(); // Part of summary content
    });

    // Select an individual daily report
    const individualReportButton = await screen.findByText(dailyMockReports[0].teamName, { exact: false });
    fireEvent.click(individualReportButton);

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: new RegExp(dailyMockReports[0].teamName, "i") })).toBeInTheDocument();
      expect(screen.getByText(/Content for Engineering/i)).toBeInTheDocument(); // Part of individual report
    });
  });

  test('2. Switching to Weekly View', async () => {
    render(<Dashboard />);
    await screen.findByText(/Daily Reports/i); // Ensure daily loaded first

    fireEvent.click(screen.getByRole('tab', { name: /Weekly/i }));

    expect(supabaseLib.fetchWeeklyReports).toHaveBeenCalledTimes(1);
    await screen.findByText(/Weekly Reports/i); // Sidebar title

    // Check for weekly report group title (e.g., "Week of Oct 23 - Oct 29, 2023" for '2023-10-23T10:00:00Z')
    await screen.findByText(/Week of Oct 23 - Oct 29, 2023/i);
    
    const weeklySummaryButton = await screen.findByText(/Weekly Summary Ready!/i);
    fireEvent.click(weeklySummaryButton);

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /Weekly Summary/i })).toBeInTheDocument();
      expect(screen.getByText(/This is a mock weekly report for Engineering 1/i)).toBeInTheDocument();
    });
  });

  test('3. Switching to Monthly View', async () => {
    render(<Dashboard />);
    await screen.findByText(/Daily Reports/i); // Ensure daily loaded first

    fireEvent.click(screen.getByRole('tab', { name: /Monthly/i }));

    expect(supabaseLib.fetchMonthlyReports).toHaveBeenCalledTimes(1);
    await screen.findByText(/Monthly Reports/i); // Sidebar title

    // Check for monthly report group title (e.g., "October 2023")
    await screen.findByText(/October 2023/i);
    
    const monthlySummaryButton = await screen.findByText(/Monthly Summary Ready!/i);
    fireEvent.click(monthlySummaryButton);

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /Monthly Summary/i })).toBeInTheDocument();
      expect(screen.getByText(/This is a mock monthly report for Engineering 1/i)).toBeInTheDocument();
    });
  });

  test('4. Data Integrity and UI Updates - Loading and No Reports', async () => {
    (supabaseLib.fetchDailyReports as jest.Mock).mockImplementation(() => {
      return new Promise(resolve => setTimeout(() => resolve(dailyMockReports), 100));
    });
    (supabaseLib.fetchWeeklyReports as jest.Mock).mockResolvedValue([]); // No weekly reports

    render(<Dashboard />);

    // Loading state for daily (initial load)
    // Since loading state is fast, this is hard to catch reliably without specific component changes.
    // We can check if fetchDailyReports was called, and then content appears.
    expect(supabaseLib.fetchDailyReports).toHaveBeenCalledTimes(1);
    await screen.findByText(/Daily Reports/i);
    await screen.findByText(/Oct 26, 2023/i); // Content loaded

    // Switch to Weekly View - No reports
    fireEvent.click(screen.getByRole('tab', { name: /Weekly/i }));
    
    expect(supabaseLib.fetchWeeklyReports).toHaveBeenCalledTimes(1);
    
    // Check for "No reports found" message for weekly
    // The message is "No weekly reports available for the selected period."
    await waitFor(() => {
        expect(screen.getByText(/No weekly reports available for the selected period./i)).toBeInTheDocument();
    });
    
    // Check that the main area also reflects no selection or empty state
    // The header might show "Weekly Overview" or similar if no report is selected.
    expect(screen.getByRole('heading', {name: /Weekly Overview/i})).toBeInTheDocument();


    // Test loading state when switching back to daily (if it was slow)
    // This would require more complex async control or specific UI for loading indicators beyond simple text.
    // For now, we confirm data loads.
    fireEvent.click(screen.getByRole('tab', { name: /Daily/i }));
    // fetchDailyReports is called again (total 2 times now)
    expect(supabaseLib.fetchDailyReports).toHaveBeenCalledTimes(2); 
    await screen.findByText(/Oct 26, 2023/i); // Daily content re-loaded
  });
});

describe('Dashboard Integration Tests - Report Navigation Sorting', () => {
  // Mock data specifically for testing sorting
  // Sorted by date desc (as Supabase would), component will sort by teamName asc for same date
  const sortedMockReportsData: Report[] = [
    { id: 'd1', content: 'Report Alpha May 27', createdAt: new Date('2023-05-27T10:00:00Z'), teamName: 'Alpha Team', reportType: 'daily' },
    { id: 'd2', content: 'Report Bravo May 27', createdAt: new Date('2023-05-27T10:00:00Z'), teamName: 'Bravo Team', reportType: 'daily' },
    { id: 'd3', content: 'Report Charlie May 27', createdAt: new Date('2023-05-27T10:00:00Z'), teamName: 'Charlie Team', reportType: 'daily' },
    { id: 'd4', content: 'Report Alpha May 26', createdAt: new Date('2023-05-26T11:00:00Z'), teamName: 'Alpha Team', reportType: 'daily' },
    { id: 'd5', content: 'Report Bravo May 26', createdAt: new Date('2023-05-26T09:00:00Z'), teamName: 'Bravo Team', reportType: 'daily' },
  ];
  // This is how they should be after the component's internal sort
  const expectedOrderAfterComponentSort: Partial<Report>[] = [
    { teamName: 'Alpha Team', date: 'May 27', id: 'd1' }, // Dates are for easy title check
    { teamName: 'Bravo Team', date: 'May 27', id: 'd2' },
    { teamName: 'Charlie Team', date: 'May 27', id: 'd3' },
    { teamName: 'Alpha Team', date: 'May 26', id: 'd4' },
    { teamName: 'Bravo Team', date: 'May 26', id: 'd5' },
  ];


  beforeEach(() => {
    jest.clearAllMocks();
    (supabaseLib.fetchDailyReports as jest.Mock).mockResolvedValue([...sortedMockReportsData]); // Use a copy
    (supabaseLib.fetchWeeklyReports as jest.Mock).mockResolvedValue([]);
    (supabaseLib.fetchMonthlyReports as jest.Mock).mockResolvedValue([]);
  });

  test('should navigate reports in correct sort order (date desc, teamName asc)', async () => {
    render(<Dashboard />);

    // Wait for initial load (Daily reports by default)
    await screen.findByText(/Daily Reports/i);
    // Check that the sidebar has the correct groups (latest date first)
    await screen.findByText(/May 27, 2023/i);
    await screen.findByText(/May 26, 2023/i);

    // 1. Initial selection should be the first report after sorting
    // The dashboard title combines date and team name. Example: "27 May: Alpha Team"
    let expectedReport = expectedOrderAfterComponentSort[0];
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: new RegExp(`${expectedReport.date}.*${expectedReport.teamName}`, 'i') })).toBeInTheDocument();
    });
    
    // 2. Navigate "Next"
    const nextButton = screen.getByRole('button', { name: /Next report/i });
    for (let i = 1; i < expectedOrderAfterComponentSort.length; i++) {
      fireEvent.click(nextButton);
      expectedReport = expectedOrderAfterComponentSort[i];
      await waitFor(() => {
        expect(screen.getByRole('heading', { name: new RegExp(`${expectedReport.date}.*${expectedReport.teamName}`, 'i') })).toBeInTheDocument();
      });
    }

    // 3. At the last report, "Next" button should be disabled (or do nothing)
    // Current selected is the last one: expectedOrderAfterComponentSort[4]
    // The NavigationButtons component has logic for hasNext using reports.findIndex((r) => r.id === selectedReport?.id) > 0
    // hasNext is true if index > 0. So for the last item (index 4), next button (handlePrevious in component) should be enabled
    // And previous button (handleNext in component) should be disabled.
    // Let's re-check button state logic.
    // `hasPrevious={reports.findIndex((r) => r.id === selectedReport?.id) < reports.length - 1}` (this is "Next" in UI)
    // `hasNext={reports.findIndex((r) => r.id === selectedReport?.id) > 0}` (this is "Previous" in UI)
    // So, when at the last report (index 4), findIndex is 4. reports.length is 5. 4 < 4 is false. So "Next" (UI) is disabled. Correct.
    expect(nextButton).toBeDisabled();


    // 4. Navigate "Previous"
    const previousButton = screen.getByRole('button', { name: /Previous report/i });
    expect(previousButton).toBeEnabled(); // Should be enabled as we are not at the first report

    for (let i = expectedOrderAfterComponentSort.length - 2; i >= 0; i--) {
      fireEvent.click(previousButton);
      expectedReport = expectedOrderAfterComponentSort[i];
      await waitFor(() => {
        expect(screen.getByRole('heading', { name: new RegExp(`${expectedReport.date}.*${expectedReport.teamName}`, 'i') })).toBeInTheDocument();
      });
    }

    // 5. At the first report, "Previous" button should be disabled
    expect(previousButton).toBeDisabled();
  });
});
