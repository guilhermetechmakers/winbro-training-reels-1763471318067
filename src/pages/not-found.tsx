import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Home, Search } from "lucide-react"

export function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6">
      <Card className="max-w-md w-full text-center animate-fade-in-up">
        <CardHeader>
          <div className="text-6xl font-bold text-muted-foreground mb-4">404</div>
          <CardTitle className="text-2xl">Page Not Found</CardTitle>
          <CardDescription className="mt-2">
            The page you're looking for doesn't exist or has been moved.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/">
              <Button>
                <Home className="mr-2 h-4 w-4" />
                Go Home
              </Button>
            </Link>
            <Link to="/dashboard">
              <Button variant="outline">
                <Search className="mr-2 h-4 w-4" />
                Dashboard
              </Button>
            </Link>
          </div>
          <p className="text-sm text-muted-foreground">
            If you believe this is an error, please{" "}
            <Link to="/contact" className="text-accent hover:underline">
              contact support
            </Link>
            .
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
