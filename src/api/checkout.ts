import { api } from "@/lib/api"
import type {
  SubscriptionPlan,
  PromoCode,
  InvoicePreview,
  CheckoutData,
  CheckoutResponse,
} from "@/types/checkout"

export const checkoutApi = {
  // Get available subscription plans
  getPlans: async (): Promise<SubscriptionPlan[]> => {
    return api.get<SubscriptionPlan[]>("/checkout/plans")
  },

  // Validate promo code
  validatePromoCode: async (code: string, planId: string): Promise<PromoCode> => {
    return api.post<PromoCode>("/checkout/validate-promo", { code, planId })
  },

  // Generate invoice preview
  getInvoicePreview: async (
    planId: string,
    promoCode?: string
  ): Promise<InvoicePreview> => {
    return api.post<InvoicePreview>("/checkout/invoice-preview", {
      planId,
      promoCode,
    })
  },

  // Process checkout
  processCheckout: async (data: CheckoutData): Promise<CheckoutResponse> => {
    return api.post<CheckoutResponse>("/checkout/process", data)
  },
}
