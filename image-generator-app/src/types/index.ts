export interface GeneratedImage {
  id: string;
  url: string;
  prompt: string;
  timestamp: number;
  createdAt: string;
  isGenerating?: boolean;
}