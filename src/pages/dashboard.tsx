import { Link } from "react-router-dom"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Video, Upload, BookOpen, Clock, CheckCircle2 } from "lucide-react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"

export function DashboardPage() {
  // Mock data - in real app, this would come from React Query
  const libraries = [
    { id: 1, name: "Machine Setup Library", count: 45, color: "bg-blue-500" },
    { id: 2, name: "Maintenance Procedures", count: 32, color: "bg-green-500" },
    { id: 3, name: "Troubleshooting Guides", count: 28, color: "bg-purple-500" },
  ]

  const recentActivity = [
    { id: 1, title: "CNC Setup - Tool Change", type: "reel", time: "2 hours ago" },
    { id: 2, title: "Basic Maintenance Course", type: "course", time: "1 day ago" },
    { id: 3, title: "Lathe Operation Basics", type: "reel", time: "2 days ago" },
  ]

  const recommendedReels = [
    { id: 1, title: "Quick Tool Change", duration: "0:25", thumbnail: "" },
    { id: 2, title: "Safety Check Procedure", duration: "0:30", thumbnail: "" },
    { id: 3, title: "Machine Calibration", duration: "0:28", thumbnail: "" },
  ]

  const courseProgress = [
    { id: 1, title: "Advanced CNC Operations", progress: 75, total: 12, completed: 9 },
    { id: 2, title: "Maintenance Fundamentals", progress: 50, total: 8, completed: 4 },
  ]

  return (
    <DashboardLayout>
      <div className="space-y-8 animate-fade-in-up">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            Welcome back! Here's what's happening with your training.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="card-hover">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Reels</CardTitle>
              <Video className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">105</div>
              <p className="text-xs text-muted-foreground">+12 from last month</p>
            </CardContent>
          </Card>
          <Card className="card-hover">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Courses</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">8</div>
              <p className="text-xs text-muted-foreground">3 in progress</p>
            </CardContent>
          </Card>
          <Card className="card-hover">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Watch Time</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">24h</div>
              <p className="text-xs text-muted-foreground">This month</p>
            </CardContent>
          </Card>
          <Card className="card-hover">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">87%</div>
              <p className="text-xs text-muted-foreground">+5% from last month</p>
            </CardContent>
          </Card>
        </div>

        {/* Libraries */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-foreground">Your Libraries</h2>
            <Link to="/library">
              <Button variant="outline">View All</Button>
            </Link>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {libraries.map((library) => (
              <Card key={library.id} className="card-hover">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-lg ${library.color} flex items-center justify-center`}>
                      <Video className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{library.name}</CardTitle>
                      <CardDescription>{library.count} reels</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Link to={`/library/${library.id}`}>
                    <Button variant="outline" className="w-full">Browse Library</Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Course Progress */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-foreground">Course Progress</h2>
            <Link to="/courses">
              <Button variant="outline">View All Courses</Button>
            </Link>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {courseProgress.map((course) => (
              <Card key={course.id} className="card-hover">
                <CardHeader>
                  <CardTitle className="text-lg">{course.title}</CardTitle>
                  <CardDescription>
                    {course.completed} of {course.total} modules completed
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="font-medium">{course.progress}%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className="bg-accent h-2 rounded-full transition-all"
                        style={{ width: `${course.progress}%` }}
                      />
                    </div>
                  </div>
                  <Link to={`/courses/${course.id}`}>
                    <Button variant="outline" className="w-full mt-4">Continue Course</Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Recommended Reels */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-foreground">Recommended for You</h2>
            <Link to="/library">
              <Button variant="outline">Browse All</Button>
            </Link>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {recommendedReels.map((reel) => (
              <Card key={reel.id} className="card-hover">
                <CardContent className="p-0">
                  <div className="aspect-video bg-muted rounded-t-lg flex items-center justify-center">
                    <Video className="h-12 w-12 text-muted-foreground" />
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-foreground">{reel.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{reel.duration}</p>
                    <Link to={`/reel/${reel.id}`}>
                      <Button variant="outline" className="w-full mt-3">Watch</Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-4">Recent Activity</h2>
          <Card>
            <CardContent className="p-6">
              <div className="space-y-4">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-center justify-between pb-4 border-b border-border last:border-0 last:pb-0">
                    <div className="flex items-center gap-3">
                      {activity.type === "reel" ? (
                        <Video className="h-5 w-5 text-muted-foreground" />
                      ) : (
                        <BookOpen className="h-5 w-5 text-muted-foreground" />
                      )}
                      <div>
                        <p className="font-medium text-foreground">{activity.title}</p>
                        <p className="text-sm text-muted-foreground">{activity.time}</p>
                      </div>
                    </div>
                    <Link to={activity.type === "reel" ? `/reel/${activity.id}` : `/courses/${activity.id}`}>
                      <Button variant="ghost" size="sm">View</Button>
                    </Link>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Upload */}
        <Card className="bg-accent/5 border-accent/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Quick Upload
            </CardTitle>
            <CardDescription>
              Upload a new training reel or request content
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-3">
              <Link to="/upload">
                <Button>Upload Reel</Button>
              </Link>
              <Button variant="outline">Request Content</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
