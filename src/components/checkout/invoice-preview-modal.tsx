import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import type { InvoicePreview } from "@/types/checkout"

interface InvoicePreviewModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  invoice: InvoicePreview | null
}

export function InvoicePreviewModal({
  open,
  onOpenChange,
  invoice,
}: InvoicePreviewModalProps) {
  if (!invoice) return null

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: invoice.currency,
    }).format(amount)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Invoice Preview</DialogTitle>
          <DialogDescription>
            Review your invoice before completing the purchase
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Plan Details */}
          <div>
            <h3 className="font-semibold text-foreground mb-2">{invoice.planName}</h3>
            <p className="text-sm text-muted-foreground">{invoice.billingPeriod}</p>
          </div>

          <Separator />

          {/* Invoice Breakdown */}
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="text-foreground font-medium">
                {formatCurrency(invoice.subtotal)}
              </span>
            </div>

            {invoice.discount > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Discount</span>
                <span className="text-success font-medium">
                  -{formatCurrency(invoice.discount)}
                </span>
              </div>
            )}

            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Tax</span>
              <span className="text-foreground font-medium">
                {formatCurrency(invoice.tax)}
              </span>
            </div>

            <Separator />

            <div className="flex justify-between text-lg font-bold">
              <span className="text-foreground">Total</span>
              <span className="text-foreground">{formatCurrency(invoice.total)}</span>
            </div>
          </div>

          <div className="bg-muted/30 rounded-lg p-4">
            <p className="text-sm text-muted-foreground">
              By completing this purchase, you agree to our Terms of Service and Privacy
              Policy. Your subscription will begin immediately after payment confirmation.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
