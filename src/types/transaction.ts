export type TransactionStatus = 'completed' | 'pending' | 'failed' | 'refunded' | 'refund_pending'
export type RefundStatus = 'none' | 'requested' | 'approved' | 'rejected' | 'processed'

export interface Transaction {
  id: string
  userId: string
  date: string
  plan: {
    id: string
    name: string
    price: number
    currency: string
    interval: 'month' | 'year'
  }
  amount: number
  status: TransactionStatus
  invoiceUrl: string | null
  downloadUrl: string | null
  refundStatus: RefundStatus
  createdAt: string
  updatedAt: string
}

export interface TransactionFilters {
  startDate?: string
  endDate?: string
  status?: TransactionStatus
}

export interface RefundRequest {
  transactionId: string
  reason?: string
  notes?: string
}

export interface RefundRequestResponse {
  requestId: string
  status: RefundStatus
  message: string
}

export interface BillingContact {
  id: string
  name: string
  email: string
  phone?: string
  companyName: string
  address: {
    street: string
    city: string
    state: string
    zipCode: string
    country: string
  }
  taxId?: string
}

export interface PaymentMethod {
  id: string
  type: 'card' | 'bank_account'
  last4?: string
  brand?: string
  expiryMonth?: number
  expiryYear?: number
  isDefault: boolean
  createdAt: string
}

export interface InvoiceDownloadResponse {
  url: string
  expiresAt: string
}
