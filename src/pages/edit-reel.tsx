import { useState, useEffect } from "react"
import { useParams, useNavigate, Link } from "react-router-dom"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import {
  ArrowLeft,
  Save,
  RefreshCw,
  Lock,
  Globe,
  Building2,
  Loader2,
} from "lucide-react"
import { reelApi } from "@/api/reels"
import { TranscriptEditor } from "@/components/reels/transcript-editor"
import { VersionHistory } from "@/components/reels/version-history"
import type { Transcript, ReprocessStatus } from "@/types/reel"

const metadataSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  tags: z.string().optional(),
  category: z.string().optional(),
  machine: z.string().optional(),
  tooling: z.string().optional(),
  processStep: z.string().optional(),
  skillLevel: z.enum(["Beginner", "Intermediate", "Advanced"]).optional(),
  language: z.string().optional(),
  visibility: z.enum(["tenant", "public", "internal"]),
  changesDescription: z.string().optional(),
})

type MetadataFormData = z.infer<typeof metadataSchema>

export function EditReelPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [isEditingTranscript, setIsEditingTranscript] = useState(false)
  const [reprocessStatus, setReprocessStatus] = useState<ReprocessStatus | null>(null)
  const [reprocessJobId, setReprocessJobId] = useState<string | null>(null)

  // Fetch reel data
  const {
    data: reel,
    isLoading: isLoadingReel,
    error: reelError,
  } = useQuery({
    queryKey: ["reel", id],
    queryFn: () => reelApi.getReel(id!),
    enabled: !!id,
  })

  // Fetch versions
  const { data: versions = [] } = useQuery({
    queryKey: ["reel-versions", id],
    queryFn: () => reelApi.getReelVersions(id!),
    enabled: !!id,
  })

  // Fetch transcript
  const { data: transcript } = useQuery({
    queryKey: ["reel-transcript", id],
    queryFn: () => reelApi.getTranscript(id!),
    enabled: !!id,
  })

  // Initialize form
  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    setValue,
    watch,
  } = useForm<MetadataFormData>({
    resolver: zodResolver(metadataSchema),
    defaultValues: {
      visibility: "tenant",
    },
  })

  // Update form when reel data loads
  useEffect(() => {
    if (reel) {
      setValue("title", reel.title)
      setValue("description", reel.description)
      setValue("tags", reel.tags.join(", "))
      setValue("category", reel.category)
      setValue("machine", reel.machine)
      setValue("tooling", reel.tooling)
      setValue("processStep", reel.processStep)
      setValue("skillLevel", reel.skillLevel)
      setValue("language", reel.language)
      setValue("visibility", reel.visibility)
    }
  }, [reel, setValue])

  // Poll reprocess status
  useEffect(() => {
    if (reprocessJobId && id) {
      const interval = setInterval(async () => {
        try {
          const status = await reelApi.getReprocessStatus(id, reprocessJobId)
          setReprocessStatus(status)
          if (status.status === "completed" || status.status === "failed") {
            clearInterval(interval)
            queryClient.invalidateQueries({ queryKey: ["reel", id] })
          }
        } catch (error) {
          console.error("Failed to fetch reprocess status", error)
        }
      }, 2000)

      return () => clearInterval(interval)
    }
  }, [reprocessJobId, id, queryClient])

  // Update metadata mutation
  const updateMutation = useMutation({
    mutationFn: (data: MetadataFormData) => {
      const tagsArray = data.tags
        ? data.tags.split(",").map((tag) => tag.trim()).filter(Boolean)
        : undefined

      return reelApi.updateReelMetadata(id!, {
        title: data.title,
        description: data.description,
        tags: tagsArray,
        category: data.category,
        machine: data.machine,
        tooling: data.tooling,
        processStep: data.processStep,
        skillLevel: data.skillLevel,
        language: data.language,
        visibility: data.visibility,
        changesDescription: data.changesDescription,
      })
    },
    onSuccess: () => {
      toast.success("Metadata updated successfully")
      queryClient.invalidateQueries({ queryKey: ["reel", id] })
      queryClient.invalidateQueries({ queryKey: ["reel-versions", id] })
    },
    onError: (error) => {
      toast.error("Failed to update metadata")
      console.error(error)
    },
  })

  // Reprocess mutation
  const reprocessMutation = useMutation({
    mutationFn: () => reelApi.startReprocessing(id!),
    onSuccess: (data) => {
      setReprocessJobId(data.jobId)
      setReprocessStatus({ status: "queued" })
      toast.loading("Video reprocessing started...", { id: "reprocess" })
    },
    onError: (error) => {
      toast.error("Failed to start reprocessing")
      console.error(error)
    },
  })

  // Rollback mutation
  const rollbackMutation = useMutation({
    mutationFn: (versionId: string) => reelApi.rollbackToVersion(id!, versionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reel", id] })
      queryClient.invalidateQueries({ queryKey: ["reel-versions", id] })
    },
  })

  // Update transcript mutation
  const updateTranscriptMutation = useMutation({
    mutationFn: (segments: Transcript["segments"]) =>
      reelApi.updateTranscript(id!, { segments }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reel-transcript", id] })
    },
  })

  const onSubmit = (data: MetadataFormData) => {
    updateMutation.mutate(data)
  }

  const handleReprocess = () => {
    reprocessMutation.mutate()
  }

  const handleRollback = async (versionId: string) => {
    await rollbackMutation.mutateAsync(versionId)
  }

  const handleTranscriptSave = async (segments: Transcript["segments"]) => {
    await updateTranscriptMutation.mutateAsync(segments)
  }

  const visibility = watch("visibility")

  if (isLoadingReel) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </DashboardLayout>
    )
  }

  if (reelError || !reel) {
    return (
      <DashboardLayout>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">Failed to load reel</p>
              <Button variant="outline" onClick={() => navigate("/library")}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Library
              </Button>
            </div>
          </CardContent>
        </Card>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in-up">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Button variant="ghost" size="icon" asChild>
                <Link to="/library">
                  <ArrowLeft className="h-5 w-5" />
                </Link>
              </Button>
              <h1 className="text-3xl font-bold text-foreground">Edit Reel</h1>
            </div>
            <p className="text-muted-foreground ml-11">
              Manage metadata, versions, and transcript for this training reel
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge
              variant={reel.status === "published" ? "default" : "secondary"}
              className={
                reel.status === "published"
                  ? "bg-success text-white"
                  : reel.status === "archived"
                    ? "bg-muted text-muted-foreground"
                    : ""
              }
            >
              {reel.status.toUpperCase()}
            </Badge>
          </div>
        </div>

        <Tabs defaultValue="metadata" className="space-y-6">
          <TabsList>
            <TabsTrigger value="metadata">Metadata</TabsTrigger>
            <TabsTrigger value="transcript">Transcript</TabsTrigger>
            <TabsTrigger value="versions">Versions</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          {/* Metadata Tab */}
          <TabsContent value="metadata" className="space-y-6">
            <form onSubmit={handleSubmit(onSubmit)}>
              <Card>
                <CardHeader>
                  <CardTitle>Reel Information</CardTitle>
                  <CardDescription>
                    Update the metadata for this training reel. Changes are automatically saved with
                    version history.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="title">
                        Title <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="title"
                        {...register("title")}
                        placeholder="Enter reel title"
                        className={errors.title ? "border-destructive" : ""}
                      />
                      {errors.title && (
                        <p className="text-sm text-destructive">{errors.title.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="category">Category</Label>
                      <Input
                        id="category"
                        {...register("category")}
                        placeholder="e.g., Setup, Maintenance"
                      />
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        {...register("description")}
                        placeholder="Describe what this reel covers..."
                        rows={4}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="machine">Machine Model</Label>
                      <Input
                        id="machine"
                        {...register("machine")}
                        placeholder="e.g., CNC Mill, Lathe"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="tooling">Tooling</Label>
                      <Input
                        id="tooling"
                        {...register("tooling")}
                        placeholder="e.g., End Mill, Drill Bit"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="processStep">Process Step</Label>
                      <Input
                        id="processStep"
                        {...register("processStep")}
                        placeholder="e.g., Tool Change, Calibration"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="skillLevel">Skill Level</Label>
                      <Select
                        value={watch("skillLevel") || ""}
                        onValueChange={(value) => setValue("skillLevel", value as any)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select skill level" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Beginner">Beginner</SelectItem>
                          <SelectItem value="Intermediate">Intermediate</SelectItem>
                          <SelectItem value="Advanced">Advanced</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="language">Language</Label>
                      <Input
                        id="language"
                        {...register("language")}
                        placeholder="e.g., English, Spanish"
                        defaultValue="English"
                      />
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="tags">Tags</Label>
                      <Input
                        id="tags"
                        {...register("tags")}
                        placeholder="Comma-separated tags (e.g., CNC, Safety, Setup)"
                      />
                      <p className="text-xs text-muted-foreground">
                        Separate multiple tags with commas
                      </p>
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="changesDescription">Change Description (Optional)</Label>
                      <Textarea
                        id="changesDescription"
                        {...register("changesDescription")}
                        placeholder="Describe what you changed and why..."
                        rows={2}
                      />
                    </div>
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                      {isDirty && "You have unsaved changes"}
                    </div>
                    <Button type="submit" disabled={!isDirty || updateMutation.isPending}>
                      {updateMutation.isPending ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4 mr-2" />
                          Save Changes
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </form>

            {/* Reprocess Section */}
            <Card>
              <CardHeader>
                <CardTitle>Video Processing</CardTitle>
                <CardDescription>
                  Reprocess the video to update quality, thumbnails, or generate new renditions
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {reprocessStatus && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Status:</span>
                      <Badge
                        variant={
                          reprocessStatus.status === "completed"
                            ? "default"
                            : reprocessStatus.status === "failed"
                              ? "destructive"
                              : "secondary"
                        }
                      >
                        {reprocessStatus.status.toUpperCase()}
                      </Badge>
                    </div>
                    {reprocessStatus.progress !== undefined && (
                      <Progress value={reprocessStatus.progress} />
                    )}
                    {reprocessStatus.message && (
                      <p className="text-sm text-muted-foreground">{reprocessStatus.message}</p>
                    )}
                  </div>
                )}
                <Button
                  variant="outline"
                  onClick={handleReprocess}
                  disabled={reprocessMutation.isPending || reprocessStatus?.status === "processing"}
                >
                  {reprocessMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Starting...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Reprocess Video
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Transcript Tab */}
          <TabsContent value="transcript">
            <TranscriptEditor
              transcript={transcript || null}
              isEditing={isEditingTranscript}
              onEditToggle={() => setIsEditingTranscript(!isEditingTranscript)}
              onSave={handleTranscriptSave}
            />
          </TabsContent>

          {/* Versions Tab */}
          <TabsContent value="versions">
            <VersionHistory
              versions={versions}
              currentVersion={reel.currentVersion}
              onRollback={handleRollback}
            />
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Visibility & Permissions</CardTitle>
                <CardDescription>
                  Control who can view and edit this reel
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <Label>Visibility</Label>
                  <div className="grid gap-4 md:grid-cols-3">
                    <div
                      className={`p-4 rounded-lg border cursor-pointer transition-all duration-200 ${
                        visibility === "tenant"
                          ? "border-accent bg-accent/10"
                          : "border-border hover:border-accent/50"
                      }`}
                      onClick={() => setValue("visibility", "tenant")}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <Building2 className="h-5 w-5" />
                        <span className="font-medium">Tenant Only</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Visible only to your organization
                      </p>
                    </div>
                    <div
                      className={`p-4 rounded-lg border cursor-pointer transition-all duration-200 ${
                        visibility === "public"
                          ? "border-accent bg-accent/10"
                          : "border-border hover:border-accent/50"
                      }`}
                      onClick={() => setValue("visibility", "public")}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <Globe className="h-5 w-5" />
                        <span className="font-medium">Public</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Visible to all users
                      </p>
                    </div>
                    <div
                      className={`p-4 rounded-lg border cursor-pointer transition-all duration-200 ${
                        visibility === "internal"
                          ? "border-accent bg-accent/10"
                          : "border-border hover:border-accent/50"
                      }`}
                      onClick={() => setValue("visibility", "internal")}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <Lock className="h-5 w-5" />
                        <span className="font-medium">Internal</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Winbro admins only
                      </p>
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Allow Downloads</Label>
                    <p className="text-sm text-muted-foreground">
                      Enable offline download for registered devices
                    </p>
                  </div>
                  <Switch defaultChecked={false} />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
