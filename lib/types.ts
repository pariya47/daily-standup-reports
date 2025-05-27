export interface Report {
  id: string
  content: string
  createdAt: Date
  teamName: string
  reportType?: ReportType
}

export type ReportType = 'daily' | 'weekly' | 'monthly';

export interface WordCloudItem {
  text: string
  value: number
}
