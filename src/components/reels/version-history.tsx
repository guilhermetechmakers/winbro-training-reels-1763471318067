import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { History, RotateCcw, Clock, User } from "lucide-react"
import type { ReelVersion } from "@/types/reel"
import { format } from "date-fns"
import { toast } from "sonner"

interface VersionHistoryProps {
  versions: ReelVersion[]
  currentVersion: number
  onRollback: (versionId: string) => Promise<void>
}

export function VersionHistory({ versions, currentVersion, onRollback }: VersionHistoryProps) {
  const [rollbackDialogOpen, setRollbackDialogOpen] = useState(false)
  const [selectedVersion, setSelectedVersion] = useState<ReelVersion | null>(null)
  const [isRollingBack, setIsRollingBack] = useState(false)

  const handleRollbackClick = (version: ReelVersion) => {
    setSelectedVersion(version)
    setRollbackDialogOpen(true)
  }

  const handleConfirmRollback = async () => {
    if (!selectedVersion) return

    setIsRollingBack(true)
    try {
      await onRollback(selectedVersion.id)
      toast.success(`Rolled back to version ${selectedVersion.version}`)
      setRollbackDialogOpen(false)
      setSelectedVersion(null)
    } catch (error) {
      toast.error("Failed to rollback version")
      console.error(error)
    } finally {
      setIsRollingBack(false)
    }
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <History className="h-5 w-5 text-muted-foreground" />
            <CardTitle>Version History</CardTitle>
          </div>
          <CardDescription>View and manage previous versions of this reel</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {versions.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">No version history available</p>
            ) : (
              versions.map((version) => (
                <div
                  key={version.id}
                  className={`p-4 rounded-lg border transition-all duration-200 ${
                    version.version === currentVersion
                      ? "bg-accent/10 border-accent"
                      : "bg-card border-border hover:border-accent/50"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge
                          variant={version.version === currentVersion ? "default" : "secondary"}
                        >
                          Version {version.version}
                          {version.version === currentVersion && " (Current)"}
                        </Badge>
                      </div>
                      <p className="text-sm text-foreground mb-2">{version.changesDescription}</p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {format(new Date(version.timestamp), "MMM d, yyyy 'at' h:mm a")}
                        </div>
                        <div className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {version.changedByName}
                        </div>
                      </div>
                    </div>
                    {version.canRollback && version.version !== currentVersion && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRollbackClick(version)}
                      >
                        <RotateCcw className="h-4 w-4 mr-2" />
                        Rollback
                      </Button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      <Dialog open={rollbackDialogOpen} onOpenChange={setRollbackDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Rollback</DialogTitle>
            <DialogDescription>
              Are you sure you want to rollback to version {selectedVersion?.version}? This will
              restore the metadata and settings from that version. The current version will be saved
              in history.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setRollbackDialogOpen(false)
                setSelectedVersion(null)
              }}
            >
              Cancel
            </Button>
            <Button
              variant="default"
              onClick={handleConfirmRollback}
              disabled={isRollingBack}
            >
              {isRollingBack ? "Rolling back..." : "Confirm Rollback"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
