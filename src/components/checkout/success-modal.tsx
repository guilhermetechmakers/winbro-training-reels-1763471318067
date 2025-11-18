import { useNavigate } from "react-router-dom"
import { CheckCircle2 } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

interface SuccessModalProps {
  open: boolean
  transactionId: string
  invoiceId: string
}

export function SuccessModal({ open, transactionId, invoiceId }: SuccessModalProps) {
  const navigate = useNavigate()

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex justify-center mb-4">
            <div className="rounded-full bg-success/10 p-4">
              <CheckCircle2 className="h-12 w-12 text-success" />
            </div>
          </div>
          <DialogTitle className="text-center text-2xl">
            Payment Successful!
          </DialogTitle>
          <DialogDescription className="text-center">
            Your subscription has been activated successfully.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="bg-muted/30 rounded-lg p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Transaction ID</span>
              <span className="text-foreground font-mono text-xs">{transactionId}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Invoice ID</span>
              <span className="text-foreground font-mono text-xs">{invoiceId}</span>
            </div>
          </div>

          <p className="text-sm text-muted-foreground text-center">
            A confirmation email has been sent to your registered email address with
            your invoice and subscription details.
          </p>

          <div className="flex gap-3 pt-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => navigate("/dashboard")}
            >
              Go to Dashboard
            </Button>
            <Button
              className="flex-1"
              onClick={() => navigate("/settings?tab=billing")}
            >
              View Subscription
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
