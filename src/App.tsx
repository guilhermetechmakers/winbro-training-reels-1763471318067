import { BrowserRouter, Routes, Route } from "react-router-dom"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { Toaster } from "@/components/ui/toaster"
import { Toaster as SonnerToaster } from "sonner"

// Pages
import { LandingPage } from "@/pages/landing"
import { LoginPage } from "@/pages/login"
import { SignupPage } from "@/pages/signup"
import { DashboardPage } from "@/pages/dashboard"
import { LibraryPage } from "@/pages/library"
import { EditReelPage } from "@/pages/edit-reel"
import { CheckoutPage } from "@/pages/checkout"
import { NotFoundPage } from "@/pages/not-found"

// React Query client with optimal defaults
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 10, // 10 minutes (formerly cacheTime)
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/library" element={<LibraryPage />} />
          <Route path="/reels/:id/edit" element={<EditReelPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/404" element={<NotFoundPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </BrowserRouter>
      <Toaster />
      <SonnerToaster position="top-right" />
    </QueryClientProvider>
  )
}

export default App
