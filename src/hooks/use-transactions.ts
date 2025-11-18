import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { transactionsApi } from "@/api/transactions"
import type {
  TransactionFilters,
  RefundRequest,
  BillingContact,
  PaymentMethod,
} from "@/types/transaction"

// Query keys
export const transactionKeys = {
  all: ["transactions"] as const,
  lists: () => [...transactionKeys.all, "list"] as const,
  list: (filters?: TransactionFilters) =>
    [...transactionKeys.lists(), filters] as const,
  detail: (id: string) => [...transactionKeys.all, "detail", id] as const,
  billing: {
    all: ["billing"] as const,
    contacts: () => [...transactionKeys.billing.all, "contacts"] as const,
    paymentMethods: () => [...transactionKeys.billing.all, "payment-methods"] as const,
  },
}

// Get transactions with filters
export function useTransactions(filters?: TransactionFilters) {
  return useQuery({
    queryKey: transactionKeys.list(filters),
    queryFn: () => transactionsApi.getTransactions(filters),
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}

// Get single transaction
export function useTransaction(transactionId: string) {
  return useQuery({
    queryKey: transactionKeys.detail(transactionId),
    queryFn: () => transactionsApi.getTransaction(transactionId),
    enabled: !!transactionId,
  })
}

// Download invoice
export function useDownloadInvoice() {
  return useMutation({
    mutationFn: (transactionId: string) => transactionsApi.downloadInvoice(transactionId),
    onSuccess: (data) => {
      // Open download URL in new tab
      window.open(data.url, "_blank")
      toast.success("Invoice download started")
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to download invoice")
    },
  })
}

// Request refund
export function useRequestRefund() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: RefundRequest) => transactionsApi.requestRefund(data),
    onSuccess: (response) => {
      toast.success(response.message || "Refund request submitted successfully")
      // Invalidate transactions list to refresh data
      queryClient.invalidateQueries({ queryKey: transactionKeys.lists() })
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to submit refund request")
    },
  })
}

// Get billing contacts
export function useBillingContacts() {
  return useQuery({
    queryKey: transactionKeys.billing.contacts(),
    queryFn: transactionsApi.getBillingContacts,
    staleTime: 1000 * 60 * 10, // 10 minutes
  })
}

// Update billing contact
export function useUpdateBillingContact() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ contactId, data }: { contactId: string; data: Partial<BillingContact> }) =>
      transactionsApi.updateBillingContact(contactId, data),
    onSuccess: () => {
      toast.success("Billing contact updated successfully")
      queryClient.invalidateQueries({ queryKey: transactionKeys.billing.contacts() })
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update billing contact")
    },
  })
}

// Get payment methods
export function usePaymentMethods() {
  return useQuery({
    queryKey: transactionKeys.billing.paymentMethods(),
    queryFn: transactionsApi.getPaymentMethods,
    staleTime: 1000 * 60 * 10, // 10 minutes
  })
}

// Add payment method
export function useAddPaymentMethod() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: Partial<PaymentMethod>) => transactionsApi.addPaymentMethod(data),
    onSuccess: () => {
      toast.success("Payment method added successfully")
      queryClient.invalidateQueries({ queryKey: transactionKeys.billing.paymentMethods() })
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to add payment method")
    },
  })
}

// Update payment method
export function useUpdatePaymentMethod() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ methodId, data }: { methodId: string; data: Partial<PaymentMethod> }) =>
      transactionsApi.updatePaymentMethod(methodId, data),
    onSuccess: () => {
      toast.success("Payment method updated successfully")
      queryClient.invalidateQueries({ queryKey: transactionKeys.billing.paymentMethods() })
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update payment method")
    },
  })
}

// Delete payment method
export function useDeletePaymentMethod() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (methodId: string) => transactionsApi.deletePaymentMethod(methodId),
    onSuccess: () => {
      toast.success("Payment method deleted successfully")
      queryClient.invalidateQueries({ queryKey: transactionKeys.billing.paymentMethods() })
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete payment method")
    },
  })
}
