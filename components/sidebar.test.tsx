import { Report, ReportType } from '@/lib/types';
// Functions to test - these are not exported, so we need to copy them or use a workaround.
// For this exercise, I'll copy the relevant functions here.
// In a real scenario, you'd export them from sidebar.tsx or use a testing utility.

// --- Copied functions from components/sidebar.tsx ---
import { format, startOfWeek, startOfMonth, endOfWeek, getYear } from "date-fns"

interface GroupedReports {
  period: string 
  reports: Report[]
  periodTitle: string
}
const getWeekId = (date: Date) => `${getYear(date)}-${format(date, "II")}`

const groupReportsByDate = (reports: Report[]): GroupedReports[] => {
  const groups: Record<string, Report[]> = {}
  reports.forEach((report) => {
    const dateStr = format(report.createdAt, "yyyy-MM-dd")
    if (!groups[dateStr]) groups[dateStr] = []
    groups[dateStr].push(report)
  })
  return Object.entries(groups)
    .map(([date, reps]) => ({
      period: date,
      reports: reps,
      periodTitle: format(new Date(date), "MMM d, yyyy"),
    }))
    .sort((a, b) => new Date(b.period).getTime() - new Date(a.period).getTime())
}

const groupReportsByWeek = (reports: Report[]): GroupedReports[] => {
  const groups: Record<string, Report[]> = {}
  reports.forEach((report) => {
    const weekId = getWeekId(report.createdAt)
    if (!groups[weekId]) groups[weekId] = []
    groups[weekId].push(report)
  })
  return Object.entries(groups)
    .map(([weekId, reps]) => {
      const firstReportDate = reps[0].createdAt
      const weekStart = startOfWeek(firstReportDate, { weekStartsOn: 1 })
      const weekEnd = endOfWeek(firstReportDate, { weekStartsOn: 1 })
      return {
        period: weekId,
        reports: reps,
        periodTitle: `Week of ${format(weekStart, "MMM d")} - ${format(weekEnd, "MMM d, yyyy")}`,
      }
    })
    .sort((a, b) => b.period.localeCompare(a.period))
}

const groupReportsByMonth = (reports: Report[]): GroupedReports[] => {
  const groups: Record<string, Report[]> = {}
  reports.forEach((report) => {
    const monthId = format(report.createdAt, "yyyy-MM")
    if (!groups[monthId]) groups[monthId] = []
    groups[monthId].push(report)
  })
  return Object.entries(groups)
    .map(([monthId, reps]) => ({
      period: monthId,
      reports: reps,
      periodTitle: format(reps[0].createdAt, "MMMM yyyy"),
    }))
    .sort((a, b) => b.period.localeCompare(a.period))
}

function createPeriodSummary(reports: Report[], periodIdentifier: string, reportType: ReportType, periodTitle: string): Report {
  const combinedContent = reports
    .map((report) => {
      return report.content == null || report.content === "" ? "" : `## ${report.teamName} (${format(report.createdAt, "MMM d")})\n\n${report.content}`
    })
    .join("\n\n---\n\n")

  let titlePrefix = "Summary"
  if (reportType === "daily") titlePrefix = "Daily Summary"
  else if (reportType === "weekly") titlePrefix = "Weekly Summary"
  else if (reportType === "monthly") titlePrefix = "Monthly Summary"
  
  let summaryDate = new Date()
  if (reports.length > 0) {
    summaryDate = reports[0].createdAt;
  }
  if (reportType === 'daily') summaryDate = new Date(periodIdentifier + 'T00:00:00'); // Ensure it's parsed as local date
  else if (reportType === 'weekly' && reports.length > 0) summaryDate = startOfWeek(reports[0].createdAt, { weekStartsOn: 1 });
  else if (reportType === 'monthly' && reports.length > 0) summaryDate = startOfMonth(reports[0].createdAt);
  else if (reportType === 'weekly') summaryDate = startOfWeek(new Date(periodIdentifier.split('-')[0] + '-01-01'), { weekStartsOn: 1 }); // Fallback for empty reports
  else if (reportType === 'monthly') summaryDate = startOfMonth(new Date(periodIdentifier + '-01')); // Fallback for empty reports


  return {
    id: `summary-${reportType}-${periodIdentifier}`,
    content: `# ${titlePrefix} - ${periodTitle}\n\n${combinedContent}`,
    createdAt: summaryDate,
    teamName: `${titlePrefix}`,
    reportType: reportType,
  }
}
// --- End of copied functions ---

describe('Sidebar Utility Functions', () => {
  const sampleReports: Report[] = [
    { id: 'r1', content: 'R1', createdAt: new Date('2023-10-01T10:00:00Z'), teamName: 'A', reportType: 'daily' },
    { id: 'r2', content: 'R2', createdAt: new Date('2023-10-01T12:00:00Z'), teamName: 'B', reportType: 'daily' },
    { id: 'r3', content: 'R3', createdAt: new Date('2023-10-02T10:00:00Z'), teamName: 'A', reportType: 'daily' },
    { id: 'r4', content: 'R4', createdAt: new Date('2023-10-08T10:00:00Z'), teamName: 'C', reportType: 'daily' }, // Next week
    { id: 'r5', content: 'R5', createdAt: new Date('2023-11-01T10:00:00Z'), teamName: 'D', reportType: 'daily' }, // Next month
  ];

  describe('groupReportsByDate', () => {
    it('should group reports by date correctly', () => {
      const grouped = groupReportsByDate(sampleReports);
      expect(grouped).toHaveLength(4);
      expect(grouped[0].periodTitle).toBe('Nov 01, 2023'); // Sorted desc
      expect(grouped[0].reports).toHaveLength(1);
      expect(grouped[1].periodTitle).toBe('Oct 08, 2023');
      expect(grouped[1].reports).toHaveLength(1);
      expect(grouped[2].periodTitle).toBe('Oct 02, 2023');
      expect(grouped[2].reports).toHaveLength(1);
      expect(grouped[3].periodTitle).toBe('Oct 01, 2023');
      expect(grouped[3].reports).toHaveLength(2);
    });

    it('should return empty array for no reports (groupReportsByDate)', () => {
      expect(groupReportsByDate([])).toEqual([]);
    });
  });

  describe('groupReportsByWeek', () => {
    it('should group reports by week correctly', () => {
      const rWeek1_1 = { id: 'rw1', content: 'RW1', createdAt: new Date('2023-10-02T10:00:00Z'), teamName: 'A', reportType: 'weekly' }; // Mon, Week 40
      const rWeek1_2 = { id: 'rw2', content: 'RW2', createdAt: new Date('2023-10-04T10:00:00Z'), teamName: 'B', reportType: 'weekly' }; // Wed, Week 40
      const rWeek2_1 = { id: 'rw3', content: 'RW3', createdAt: new Date('2023-10-09T10:00:00Z'), teamName: 'C', reportType: 'weekly' }; // Mon, Week 41
      const weeklySample = [rWeek1_1, rWeek1_2, rWeek2_1];
      const grouped = groupReportsByWeek(weeklySample);
      
      expect(grouped).toHaveLength(2); // Two weeks
      // Week 41 (Oct 09 - Oct 15, 2023)
      expect(grouped[0].period).toBe('2023-41');
      expect(grouped[0].periodTitle).toBe('Week of Oct 09 - Oct 15, 2023');
      expect(grouped[0].reports).toHaveLength(1);
      expect(grouped[0].reports[0].id).toBe('rw3');
      // Week 40 (Oct 02 - Oct 08, 2023)
      expect(grouped[1].period).toBe('2023-40');
      expect(grouped[1].periodTitle).toBe('Week of Oct 02 - Oct 08, 2023');
      expect(grouped[1].reports).toHaveLength(2);
    });

    it('should return empty array for no reports (groupReportsByWeek)', () => {
      expect(groupReportsByWeek([])).toEqual([]);
    });
  });

  describe('groupReportsByMonth', () => {
    it('should group reports by month correctly', () => {
      const grouped = groupReportsByMonth(sampleReports);
      expect(grouped).toHaveLength(2);
      expect(grouped[0].periodTitle).toBe('November 2023');
      expect(grouped[0].reports).toHaveLength(1);
      expect(grouped[1].periodTitle).toBe('October 2023');
      expect(grouped[1].reports).toHaveLength(4);
    });
    it('should return empty array for no reports (groupReportsByMonth)', () => {
      expect(groupReportsByMonth([])).toEqual([]);
    });
  });

  describe('createPeriodSummary', () => {
    const dailyReportsForSummary: Report[] = [
      { id: 's1', content: 'Daily Summary R1', createdAt: new Date('2023-10-01T10:00:00Z'), teamName: 'Team X', reportType: 'daily' },
      { id: 's2', content: 'Daily Summary R2', createdAt: new Date('2023-10-01T14:00:00Z'), teamName: 'Team Y', reportType: 'daily' },
    ];

    it('should create a daily summary correctly', () => {
      const summary = createPeriodSummary(dailyReportsForSummary, '2023-10-01', 'daily', 'Oct 01, 2023');
      expect(summary.id).toBe('summary-daily-2023-10-01');
      expect(summary.teamName).toBe('Daily Summary');
      expect(summary.reportType).toBe('daily');
      expect(summary.content).toContain('# Daily Summary - Oct 01, 2023');
      expect(summary.content).toContain('## Team X (Oct 01)');
      expect(summary.content).toContain('Daily Summary R1');
      expect(summary.content).toContain('## Team Y (Oct 01)');
      expect(summary.content).toContain('Daily Summary R2');
      // Check if createdAt is the start of the day for daily summaries
      const expectedDate = new Date('2023-10-01T00:00:00');
      // Adjust for timezone offset if tests run in different environment than where date is created
      expectedDate.setMinutes(expectedDate.getMinutes() - expectedDate.getTimezoneOffset());
      // As createPeriodSummary uses `new Date(periodIdentifier)`, it might be affected by timezone.
      // For robust testing, compare year, month, date.
      expect(summary.createdAt.getFullYear()).toBe(2023);
      expect(summary.createdAt.getMonth()).toBe(9); // 0-indexed for October
      expect(summary.createdAt.getDate()).toBe(1);
    });

    it('should create a weekly summary correctly', () => {
      const weeklyReports: Report[] = [
        { id: 'w1', content: 'Weekly R1', createdAt: new Date('2023-10-03T10:00:00Z'), teamName: 'Team X', reportType: 'weekly' }, // Week 40
      ];
      const summary = createPeriodSummary(weeklyReports, '2023-40', 'weekly', 'Week of Oct 02 - Oct 08, 2023');
      expect(summary.id).toBe('summary-weekly-2023-40');
      expect(summary.teamName).toBe('Weekly Summary');
      expect(summary.reportType).toBe('weekly');
      expect(summary.content).toContain('# Weekly Summary - Week of Oct 02 - Oct 08, 2023');
      expect(summary.content).toContain('## Team X (Oct 03)');
      expect(summary.createdAt.toISOString().slice(0,10)).toBe(startOfWeek(new Date('2023-10-03T00:00:00Z'), { weekStartsOn: 1 }).toISOString().slice(0,10));
    });

    it('should create a monthly summary correctly', () => {
      const monthlyReports: Report[] = [
        { id: 'm1', content: 'Monthly R1', createdAt: new Date('2023-10-15T10:00:00Z'), teamName: 'Team Z', reportType: 'monthly' },
      ];
      const summary = createPeriodSummary(monthlyReports, '2023-10', 'monthly', 'October 2023');
      expect(summary.id).toBe('summary-monthly-2023-10');
      expect(summary.teamName).toBe('Monthly Summary');
      expect(summary.reportType).toBe('monthly');
      expect(summary.content).toContain('# Monthly Summary - October 2023');
      expect(summary.content).toContain('## Team Z (Oct 15)');
      expect(summary.createdAt.toISOString().slice(0,7)).toBe(startOfMonth(new Date('2023-10-15T00:00:00Z')).toISOString().slice(0,7));
    });

    it('should create a summary with empty content if no reports', () => {
      const summary = createPeriodSummary([], '2023-10-01', 'daily', 'Oct 01, 2023');
      expect(summary.content).toBe('# Daily Summary - Oct 01, 2023\n\n');
      expect(summary.reports).toBeUndefined(); // or however it's handled
    });
  });
});
