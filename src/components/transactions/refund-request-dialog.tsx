import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { AlertCircle } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { useRequestRefund } from "@/hooks/use-transactions"

const refundRequestSchema = z.object({
  reason: z.string().min(10, "Reason must be at least 10 characters").optional(),
  notes: z.string().optional(),
})

type RefundRequestForm = z.infer<typeof refundRequestSchema>

interface RefundRequestDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  transactionId: string
  transactionAmount: number
  currency: string
}

export function RefundRequestDialog({
  open,
  onOpenChange,
  transactionId,
  transactionAmount,
  currency,
}: RefundRequestDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const requestRefundMutation = useRequestRefund()

  const form = useForm<RefundRequestForm>({
    resolver: zodResolver(refundRequestSchema),
    defaultValues: {
      reason: "",
      notes: "",
    },
  })

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency || "USD",
    }).format(amount)
  }

  const handleSubmit = async (data: RefundRequestForm) => {
    setIsSubmitting(true)
    try {
      await requestRefundMutation.mutateAsync({
        transactionId,
        reason: data.reason,
        notes: data.notes,
      })
      form.reset()
      onOpenChange(false)
    } catch (error) {
      // Error handled by mutation
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Request Refund</DialogTitle>
          <DialogDescription>
            Submit a refund request for this transaction. Our team will review your request and process it accordingly.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="bg-muted/30 rounded-lg p-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Transaction Amount</span>
              <span className="text-lg font-semibold text-foreground">
                {formatCurrency(transactionAmount)}
              </span>
            </div>
          </div>

          <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4 flex gap-3">
            <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-amber-800 dark:text-amber-200">
              <p className="font-medium mb-1">Refund Processing</p>
              <p>
                Refund requests are typically processed within 5-10 business days. 
                You will receive an email notification once your request has been reviewed.
              </p>
            </div>
          </div>

          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="reason">
                Reason for Refund <span className="text-muted-foreground">(Optional)</span>
              </Label>
              <Textarea
                id="reason"
                {...form.register("reason")}
                placeholder="Please provide a brief reason for the refund request..."
                rows={3}
                className="resize-none"
              />
              {form.formState.errors.reason && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.reason.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">
                Additional Notes <span className="text-muted-foreground">(Optional)</span>
              </Label>
              <Textarea
                id="notes"
                {...form.register("notes")}
                placeholder="Any additional information that might help us process your request..."
                rows={3}
                className="resize-none"
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || requestRefundMutation.isPending}
              >
                {isSubmitting || requestRefundMutation.isPending
                  ? "Submitting..."
                  : "Submit Request"}
              </Button>
            </DialogFooter>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  )
}
