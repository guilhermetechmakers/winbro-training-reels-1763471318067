import { api } from "@/lib/api"
import type { Reel, ReelVersion, Transcript, ReprocessStatus } from "@/types/reel"

export interface UpdateReelMetadataParams {
  title?: string
  description?: string
  tags?: string[]
  category?: string
  machine?: string
  tooling?: string
  processStep?: string
  skillLevel?: "Beginner" | "Intermediate" | "Advanced"
  language?: string
  visibility?: "tenant" | "public" | "internal"
  changesDescription?: string
}

export interface UpdateTranscriptParams {
  segments: Array<{
    id: string
    startTime: number
    endTime: number
    text: string
  }>
  changeNote?: string
}

export const reelApi = {
  getReel: (id: string) => api.get<Reel>(`/reels/${id}`),

  updateReelMetadata: (id: string, data: UpdateReelMetadataParams) =>
    api.patch<Reel>(`/reels/${id}`, data),

  getReelVersions: (id: string) => api.get<ReelVersion[]>(`/reels/${id}/versions`),

  rollbackToVersion: (reelId: string, versionId: string) =>
    api.post<Reel>(`/reels/${reelId}/versions/${versionId}/rollback`, {}),

  startReprocessing: (id: string) =>
    api.post<{ jobId: string }>(`/reels/${id}/reprocess`, {}),

  getReprocessStatus: (id: string, jobId: string) =>
    api.get<ReprocessStatus>(`/reels/${id}/reprocess/${jobId}`),

  getTranscript: (reelId: string) => api.get<Transcript>(`/reels/${reelId}/transcript`),

  updateTranscript: (reelId: string, data: UpdateTranscriptParams) =>
    api.put<Transcript>(`/reels/${reelId}/transcript`, data),
}
