import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Video, Search, Filter, Clock } from "lucide-react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"

export function LibraryPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedFilter, setSelectedFilter] = useState("all")

  // Mock data
  const reels = [
    {
      id: 1,
      title: "CNC Tool Change Procedure",
      description: "Quick guide to changing tools on CNC machines",
      duration: "0:25",
      tags: ["CNC", "Tooling", "Setup"],
      machine: "CNC Mill",
      skillLevel: "Beginner",
    },
    {
      id: 2,
      title: "Lathe Safety Check",
      description: "Pre-operation safety checklist for lathe machines",
      duration: "0:30",
      tags: ["Lathe", "Safety", "Maintenance"],
      machine: "Lathe",
      skillLevel: "Beginner",
    },
    {
      id: 3,
      title: "Advanced Calibration",
      description: "Precision calibration for high-tolerance work",
      duration: "0:28",
      tags: ["Calibration", "Advanced", "Precision"],
      machine: "CNC Mill",
      skillLevel: "Advanced",
    },
  ]

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in-up">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">Content Library</h1>
          <p className="text-muted-foreground mt-2">
            Browse and search all available training reels
          </p>
        </div>

        {/* Search and Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Search & Filter</CardTitle>
            <CardDescription>
              Search by title, transcript, or filter by machine, tooling, or skill level
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search reels, transcripts..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={selectedFilter} onValueChange={setSelectedFilter}>
                <SelectTrigger className="w-full md:w-[200px]">
                  <SelectValue placeholder="Filter by..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Reels</SelectItem>
                  <SelectItem value="machine">By Machine</SelectItem>
                  <SelectItem value="tooling">By Tooling</SelectItem>
                  <SelectItem value="skill">By Skill Level</SelectItem>
                  <SelectItem value="date">By Date</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline">
                <Filter className="mr-2 h-4 w-4" />
                More Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Results Grid */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-foreground">
              {reels.length} Reels Found
            </h2>
            <Select defaultValue="recent">
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recent">Most Recent</SelectItem>
                <SelectItem value="popular">Most Popular</SelectItem>
                <SelectItem value="duration">Duration</SelectItem>
                <SelectItem value="title">Title A-Z</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {reels.map((reel) => (
              <Card key={reel.id} className="card-hover">
                <CardContent className="p-0">
                  <div className="aspect-video bg-muted rounded-t-lg flex items-center justify-center relative group">
                    <Video className="h-12 w-12 text-muted-foreground" />
                    <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {reel.duration}
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-foreground line-clamp-1">{reel.title}</h3>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                      {reel.description}
                    </p>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {reel.tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
                      <span>{reel.machine}</span>
                      <span>{reel.skillLevel}</span>
                    </div>
                    <Button variant="outline" className="w-full">
                      Watch Reel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
