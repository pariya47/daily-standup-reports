export interface Report {
  id: string
  content: string
  createdAt: Date
  teamName: string
}

export interface WordCloudItem {
  text: string
  value: number
}
