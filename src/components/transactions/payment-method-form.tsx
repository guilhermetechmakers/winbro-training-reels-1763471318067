import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import {
  usePaymentMethods,
  useAddPaymentMethod,
  useUpdatePaymentMethod,
  useDeletePaymentMethod,
} from "@/hooks/use-transactions"
import { Skeleton } from "@/components/ui/skeleton"
import { CreditCard, Trash2, Plus } from "lucide-react"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"

const paymentMethodSchema = z.object({
  cardNumber: z.string().regex(/^\d{4}\s?\d{4}\s?\d{4}\s?\d{4}$/, "Invalid card number"),
  expiryMonth: z.string().regex(/^(0[1-9]|1[0-2])$/, "Invalid month"),
  expiryYear: z.string().regex(/^\d{4}$/, "Invalid year"),
  cvv: z.string().regex(/^\d{3,4}$/, "Invalid CVV"),
  cardholderName: z.string().min(2, "Cardholder name is required"),
})

type PaymentMethodForm = z.infer<typeof paymentMethodSchema>

interface PaymentMethodFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function PaymentMethodForm({ open, onOpenChange }: PaymentMethodFormProps) {
  const [isAddingNew, setIsAddingNew] = useState(false)
  const { data: paymentMethods, isLoading } = usePaymentMethods()
  const addMethodMutation = useAddPaymentMethod()
  const updateMethodMutation = useUpdatePaymentMethod()
  const deleteMethodMutation = useDeletePaymentMethod()

  const form = useForm<PaymentMethodForm>({
    resolver: zodResolver(paymentMethodSchema),
    defaultValues: {
      cardNumber: "",
      expiryMonth: "",
      expiryYear: "",
      cvv: "",
      cardholderName: "",
    },
  })

  const formatCardNumber = (value: string) => {
    const cleaned = value.replace(/\s/g, "")
    const match = cleaned.match(/.{1,4}/g)
    return match ? match.join(" ") : cleaned
  }

  const handleAddNew = () => {
    setIsAddingNew(true)
    form.reset()
  }

  const handleCancel = () => {
    setIsAddingNew(false)
    form.reset()
  }

  const handleSubmit = async (data: PaymentMethodForm) => {
    try {
      // In a real app, you'd send card details to a payment processor (e.g., Stripe)
      // which returns a payment method token. For now, we'll send minimal data.
      await addMethodMutation.mutateAsync({
        type: "card",
        expiryMonth: parseInt(data.expiryMonth),
        expiryYear: parseInt(data.expiryYear),
      })
      form.reset()
      setIsAddingNew(false)
      onOpenChange(false)
    } catch (error) {
      // Error handled by mutation
    }
  }

  const handleDelete = async (methodId: string) => {
    if (!confirm("Are you sure you want to delete this payment method?")) {
      return
    }

    try {
      await deleteMethodMutation.mutateAsync(methodId)
    } catch (error) {
      // Error handled by mutation
    }
  }

  const handleSetDefault = async (methodId: string) => {
    try {
      await updateMethodMutation.mutateAsync({
        methodId,
        data: { isDefault: true },
      })
      toast.success("Default payment method updated")
    } catch (error) {
      // Error handled by mutation
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Payment Methods
          </DialogTitle>
          <DialogDescription>
            Manage your saved payment methods for faster checkout
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="space-y-4 py-4">
            {[1, 2].map((i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
        ) : (
          <div className="space-y-4 py-4">
            {/* Existing Payment Methods */}
            {paymentMethods && paymentMethods.length > 0 && (
              <div className="space-y-3">
                {paymentMethods.map((method) => (
                  <div
                    key={method.id}
                    className="p-4 rounded-lg border border-border bg-card flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <CreditCard className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <div className="font-medium text-foreground">
                          {method.type === "card" && method.brand
                            ? `${method.brand.toUpperCase()} •••• ${method.last4}`
                            : `•••• ${method.last4}`}
                        </div>
                        {method.expiryMonth && method.expiryYear && (
                          <div className="text-sm text-muted-foreground">
                            Expires {method.expiryMonth}/{method.expiryYear}
                          </div>
                        )}
                      </div>
                      {method.isDefault && (
                        <Badge variant="outline" className="text-xs">
                          Default
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {!method.isDefault && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleSetDefault(method.id)}
                          disabled={updateMethodMutation.isPending}
                        >
                          Set Default
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(method.id)}
                        disabled={deleteMethodMutation.isPending}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Add New Payment Method */}
            {isAddingNew ? (
              <>
                <Separator />
                <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="cardholderName">Cardholder Name *</Label>
                    <Input
                      id="cardholderName"
                      {...form.register("cardholderName")}
                      placeholder="John Doe"
                    />
                    {form.formState.errors.cardholderName && (
                      <p className="text-sm text-destructive">
                        {form.formState.errors.cardholderName.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cardNumber">Card Number *</Label>
                    <Input
                      id="cardNumber"
                      {...form.register("cardNumber", {
                        onChange: (e) => {
                          e.target.value = formatCardNumber(e.target.value)
                        },
                      })}
                      placeholder="1234 5678 9012 3456"
                      maxLength={19}
                    />
                    {form.formState.errors.cardNumber && (
                      <p className="text-sm text-destructive">
                        {form.formState.errors.cardNumber.message}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="expiryMonth">Month *</Label>
                      <Input
                        id="expiryMonth"
                        {...form.register("expiryMonth")}
                        placeholder="12"
                        maxLength={2}
                      />
                      {form.formState.errors.expiryMonth && (
                        <p className="text-sm text-destructive">
                          {form.formState.errors.expiryMonth.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="expiryYear">Year *</Label>
                      <Input
                        id="expiryYear"
                        {...form.register("expiryYear")}
                        placeholder="2025"
                        maxLength={4}
                      />
                      {form.formState.errors.expiryYear && (
                        <p className="text-sm text-destructive">
                          {form.formState.errors.expiryYear.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="cvv">CVV *</Label>
                      <Input
                        id="cvv"
                        type="password"
                        {...form.register("cvv")}
                        placeholder="123"
                        maxLength={4}
                      />
                      {form.formState.errors.cvv && (
                        <p className="text-sm text-destructive">
                          {form.formState.errors.cvv.message}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="bg-muted/30 rounded-lg p-4">
                    <p className="text-xs text-muted-foreground">
                      Your payment information is encrypted and secure. We never store
                      your full card details.
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleCancel}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={addMethodMutation.isPending}
                      className="flex-1"
                    >
                      {addMethodMutation.isPending ? "Adding..." : "Add Payment Method"}
                    </Button>
                  </div>
                </form>
              </>
            ) : (
              <Button
                variant="outline"
                className="w-full"
                onClick={handleAddNew}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add New Payment Method
              </Button>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
