export interface Reel {
  id: string
  title: string
  description: string
  tags: string[]
  category: string
  machine: string
  tooling: string
  processStep: string
  skillLevel: "Beginner" | "Intermediate" | "Advanced"
  language: string
  duration: string
  currentVersion: number
  status: "draft" | "published" | "archived"
  visibility: "tenant" | "public" | "internal"
  uploaderId: string
  uploaderName: string
  createdAt: string
  updatedAt: string
  videoUrl?: string
  thumbnailUrl?: string
}

export interface ReelVersion {
  id: string
  reelId: string
  version: number
  timestamp: string
  changesDescription: string
  changedBy: string
  changedByName: string
  metadata: Partial<Reel>
  canRollback: boolean
}

export interface TranscriptSegment {
  id: string
  startTime: number
  endTime: number
  text: string
  confidence?: number
}

export interface Transcript {
  id: string
  reelId: string
  version: number
  segments: TranscriptSegment[]
  language: string
  createdAt: string
  updatedAt: string
  updatedBy: string
}

export interface ReelPermission {
  id: string
  reelId: string
  userId?: string
  userGroupId?: string
  accessLevel: "view" | "edit" | "admin"
}

export interface ReprocessStatus {
  status: "idle" | "queued" | "processing" | "completed" | "failed"
  progress?: number
  message?: string
  startedAt?: string
  completedAt?: string
}
