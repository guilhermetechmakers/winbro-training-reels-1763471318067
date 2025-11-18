import { api } from "@/lib/api"
import type {
  Transaction,
  TransactionFilters,
  RefundRequest,
  RefundRequestResponse,
  BillingContact,
  PaymentMethod,
  InvoiceDownloadResponse,
} from "@/types/transaction"

export const transactionsApi = {
  // Get all transactions for the current user
  getTransactions: async (filters?: TransactionFilters): Promise<Transaction[]> => {
    const params = new URLSearchParams()
    if (filters?.startDate) params.append("startDate", filters.startDate)
    if (filters?.endDate) params.append("endDate", filters.endDate)
    if (filters?.status) params.append("status", filters.status)
    
    const queryString = params.toString()
    const endpoint = `/transactions${queryString ? `?${queryString}` : ""}`
    return api.get<Transaction[]>(endpoint)
  },

  // Get a single transaction by ID
  getTransaction: async (transactionId: string): Promise<Transaction> => {
    return api.get<Transaction>(`/transactions/${transactionId}`)
  },

  // Download invoice PDF
  downloadInvoice: async (transactionId: string): Promise<InvoiceDownloadResponse> => {
    return api.post<InvoiceDownloadResponse>(`/transactions/${transactionId}/invoice/download`, {})
  },

  // Request a refund
  requestRefund: async (data: RefundRequest): Promise<RefundRequestResponse> => {
    return api.post<RefundRequestResponse>(`/transactions/${data.transactionId}/refund`, {
      reason: data.reason,
      notes: data.notes,
    })
  },

  // Get billing contacts
  getBillingContacts: async (): Promise<BillingContact[]> => {
    return api.get<BillingContact[]>("/billing/contacts")
  },

  // Update billing contact
  updateBillingContact: async (contactId: string, data: Partial<BillingContact>): Promise<BillingContact> => {
    return api.put<BillingContact>(`/billing/contacts/${contactId}`, data)
  },

  // Get payment methods
  getPaymentMethods: async (): Promise<PaymentMethod[]> => {
    return api.get<PaymentMethod[]>("/billing/payment-methods")
  },

  // Add payment method
  addPaymentMethod: async (data: Partial<PaymentMethod>): Promise<PaymentMethod> => {
    return api.post<PaymentMethod>("/billing/payment-methods", data)
  },

  // Update payment method
  updatePaymentMethod: async (methodId: string, data: Partial<PaymentMethod>): Promise<PaymentMethod> => {
    return api.put<PaymentMethod>(`/billing/payment-methods/${methodId}`, data)
  },

  // Delete payment method
  deletePaymentMethod: async (methodId: string): Promise<void> => {
    await api.delete(`/billing/payment-methods/${methodId}`)
  },
}
