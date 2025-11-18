import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Edit2, Save, Undo2, Play, Clock } from "lucide-react"
import type { Transcript, TranscriptSegment } from "@/types/reel"
import { toast } from "sonner"

interface TranscriptEditorProps {
  transcript: Transcript | null
  isEditing: boolean
  onEditToggle: () => void
  onSave: (segments: TranscriptSegment[]) => Promise<void>
  onSeek?: (time: number) => void
  currentTime?: number
}

export function TranscriptEditor({
  transcript,
  isEditing,
  onEditToggle,
  onSave,
  onSeek,
  currentTime = 0,
}: TranscriptEditorProps) {
  const [editedSegments, setEditedSegments] = useState<TranscriptSegment[]>([])
  const [isSaving, setIsSaving] = useState(false)
  const [activeSegmentId, setActiveSegmentId] = useState<string | null>(null)

  useEffect(() => {
    if (transcript) {
      setEditedSegments(transcript.segments)
    }
  }, [transcript])

  useEffect(() => {
    if (transcript && currentTime >= 0) {
      const active = transcript.segments.find(
        (seg) => currentTime >= seg.startTime && currentTime <= seg.endTime
      )
      setActiveSegmentId(active?.id || null)
    }
  }, [currentTime, transcript])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const handleSegmentClick = (segment: TranscriptSegment) => {
    if (onSeek) {
      onSeek(segment.startTime)
    }
  }

  const handleSegmentTextChange = (segmentId: string, newText: string) => {
    setEditedSegments((prev) =>
      prev.map((seg) => (seg.id === segmentId ? { ...seg, text: newText } : seg))
    )
  }

  const handleTimeAdjust = (segmentId: string, field: "startTime" | "endTime", delta: number) => {
    setEditedSegments((prev) =>
      prev.map((seg) => {
        if (seg.id === segmentId) {
          const newValue = Math.max(0, seg[field] + delta)
          return { ...seg, [field]: newValue }
        }
        return seg
      })
    )
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      await onSave(editedSegments)
      toast.success("Transcript saved successfully")
      onEditToggle()
    } catch (error) {
      toast.error("Failed to save transcript")
      console.error(error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleUndo = () => {
    if (transcript) {
      setEditedSegments(transcript.segments)
      toast.info("Changes reverted")
    }
  }

  if (!transcript) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-muted-foreground text-center py-8">No transcript available</p>
        </CardContent>
      </Card>
    )
  }

  const hasChanges =
    JSON.stringify(editedSegments) !== JSON.stringify(transcript.segments)

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Transcript</CardTitle>
            <CardDescription>
              Click on any segment to seek to that time in the video
            </CardDescription>
          </div>
          <div className="flex gap-2">
            {isEditing ? (
              <>
                <Button variant="outline" size="sm" onClick={handleUndo} disabled={!hasChanges}>
                  <Undo2 className="h-4 w-4 mr-2" />
                  Undo
                </Button>
                <Button
                  variant="default"
                  size="sm"
                  onClick={handleSave}
                  disabled={!hasChanges || isSaving}
                >
                  <Save className="h-4 w-4 mr-2" />
                  {isSaving ? "Saving..." : "Save"}
                </Button>
              </>
            ) : (
              <Button variant="outline" size="sm" onClick={onEditToggle}>
                <Edit2 className="h-4 w-4 mr-2" />
                Edit
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 max-h-[600px] overflow-y-auto">
          {editedSegments.map((segment) => {
            const isActive = activeSegmentId === segment.id
            const isPlaying = isActive && currentTime >= segment.startTime && currentTime <= segment.endTime

            return (
              <div
                key={segment.id}
                className={`p-3 rounded-lg border transition-all duration-200 cursor-pointer ${
                  isPlaying
                    ? "bg-primary text-primary-foreground border-primary shadow-md"
                    : isActive
                      ? "bg-accent/10 border-accent"
                      : "bg-card border-border hover:border-accent/50"
                }`}
                onClick={() => handleSegmentClick(segment)}
              >
                {isEditing ? (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      <span>{formatTime(segment.startTime)}</span>
                      <span>-</span>
                      <span>{formatTime(segment.endTime)}</span>
                      {segment.confidence !== undefined && (
                        <Badge variant="secondary" className="ml-auto text-xs">
                          {Math.round(segment.confidence * 100)}% confidence
                        </Badge>
                      )}
                    </div>
                    <Textarea
                      value={segment.text}
                      onChange={(e) => handleSegmentTextChange(segment.id, e.target.value)}
                      className="min-h-[60px] resize-none"
                      onClick={(e) => e.stopPropagation()}
                    />
                    <div className="flex items-center gap-2 text-xs">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 px-2"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleTimeAdjust(segment.id, "startTime", -0.5)
                        }}
                      >
                        -0.5s
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 px-2"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleTimeAdjust(segment.id, "startTime", 0.5)
                        }}
                      >
                        +0.5s
                      </Button>
                      <span className="text-muted-foreground">Start</span>
                      <div className="flex-1" />
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 px-2"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleTimeAdjust(segment.id, "endTime", -0.5)
                        }}
                      >
                        -0.5s
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 px-2"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleTimeAdjust(segment.id, "endTime", 0.5)
                        }}
                      >
                        +0.5s
                      </Button>
                      <span className="text-muted-foreground">End</span>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-medium">
                        {formatTime(segment.startTime)} - {formatTime(segment.endTime)}
                      </span>
                      {isPlaying && (
                        <Badge variant="secondary" className="ml-auto">
                          <Play className="h-3 w-3 mr-1" />
                          Playing
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm leading-relaxed">{segment.text}</p>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
