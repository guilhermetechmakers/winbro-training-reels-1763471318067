import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { checkoutApi } from "@/api/checkout"
import type { CheckoutData } from "@/types/checkout"

// Query keys
export const checkoutKeys = {
  all: ["checkout"] as const,
  plans: () => [...checkoutKeys.all, "plans"] as const,
  invoicePreview: (planId: string, promoCode?: string) =>
    [...checkoutKeys.all, "invoice-preview", planId, promoCode] as const,
}

// Get subscription plans
export function useSubscriptionPlans() {
  return useQuery({
    queryKey: checkoutKeys.plans(),
    queryFn: checkoutApi.getPlans,
    staleTime: 1000 * 60 * 10, // 10 minutes
  })
}

// Validate promo code
export function useValidatePromoCode() {
  return useMutation({
    mutationFn: ({ code, planId }: { code: string; planId: string }) =>
      checkoutApi.validatePromoCode(code, planId),
    onError: (error: Error) => {
      toast.error(error.message || "Failed to validate promo code")
    },
  })
}

// Get invoice preview
export function useInvoicePreview(planId: string | null, promoCode?: string) {
  return useQuery({
    queryKey: checkoutKeys.invoicePreview(planId || "", promoCode),
    queryFn: () => checkoutApi.getInvoicePreview(planId!, promoCode),
    enabled: !!planId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}

// Process checkout
export function useProcessCheckout() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CheckoutData) => checkoutApi.processCheckout(data),
    onSuccess: (response) => {
      toast.success(response.message || "Payment processed successfully!")
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ["subscriptions"] })
      queryClient.invalidateQueries({ queryKey: ["transactions"] })
    },
    onError: (error: Error) => {
      toast.error(error.message || "Payment processing failed. Please try again.")
    },
  })
}
