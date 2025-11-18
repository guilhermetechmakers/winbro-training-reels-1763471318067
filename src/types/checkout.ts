export interface SubscriptionPlan {
  id: string
  name: string
  description: string
  price: number
  currency: string
  interval: 'month' | 'year'
  features: string[]
  popular?: boolean
}

export interface BillingDetails {
  companyName: string
  billingAddress: {
    street: string
    city: string
    state: string
    zipCode: string
    country: string
  }
  taxId?: string
}

export interface PaymentMethod {
  id?: string
  type: 'card' | 'saved'
  cardNumber?: string
  expiryMonth?: string
  expiryYear?: string
  cvv?: string
  cardholderName?: string
  savedCardId?: string
}

export interface PromoCode {
  code: string
  discountType: 'percentage' | 'fixed'
  discountValue: number
  valid: boolean
  message?: string
}

export interface InvoicePreview {
  subtotal: number
  discount: number
  tax: number
  total: number
  currency: string
  planName: string
  billingPeriod: string
}

export interface CheckoutData {
  planId: string
  billingDetails: BillingDetails
  paymentMethod: PaymentMethod
  promoCode?: string
  termsAccepted: boolean
}

export interface CheckoutResponse {
  transactionId: string
  invoiceId: string
  success: boolean
  message: string
}
