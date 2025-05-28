export interface Report {
  id: string;
  content: string; 
  createdAt: Date | null; 
  teamName: string;
  reportType?: ReportType;
  progress?: string | null; 
  blockers?: string | null; 
  nextSteps?: string | null; 
}

export type ReportType = 'daily' | 'weekly' | 'monthly';

export interface WordCloudItem {
  text: string
  value: number
}
