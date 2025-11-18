import { useState } from "react"
import { format } from "date-fns"
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
} from "@tanstack/react-table"
import {
  Download,
  FileText,
  Filter,
  CreditCard,
  Building2,
  RefreshCw,
  ChevronUp,
  ChevronDown,
} from "lucide-react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { RefundRequestDialog } from "@/components/transactions/refund-request-dialog"
import { BillingContactForm } from "@/components/transactions/billing-contact-form"
import { PaymentMethodForm } from "@/components/transactions/payment-method-form"
import {
  useTransactions,
  useDownloadInvoice,
  useBillingContacts,
  usePaymentMethods,
} from "@/hooks/use-transactions"
import type { Transaction, TransactionStatus } from "@/types/transaction"
import { cn } from "@/lib/utils"

const statusColors: Record<TransactionStatus, string> = {
  completed: "bg-success text-white",
  pending: "bg-yellow-500 text-white",
  failed: "bg-destructive text-white",
  refunded: "bg-blue-500 text-white",
  refund_pending: "bg-orange-500 text-white",
}

const statusLabels: Record<TransactionStatus, string> = {
  completed: "Completed",
  pending: "Pending",
  failed: "Failed",
  refunded: "Refunded",
  refund_pending: "Refund Pending",
}

export function TransactionHistoryPage() {
  const [sorting, setSorting] = useState<SortingState>([{ id: "date", desc: true }])
  const [statusFilter, setStatusFilter] = useState<TransactionStatus | "all">("all")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null)
  const [showRefundDialog, setShowRefundDialog] = useState(false)
  const [showBillingForm, setShowBillingForm] = useState(false)
  const [showPaymentForm, setShowPaymentForm] = useState(false)

  const filters = {
    status: statusFilter !== "all" ? statusFilter : undefined,
    startDate: startDate || undefined,
    endDate: endDate || undefined,
  }

  const { data: transactions, isLoading, refetch } = useTransactions(filters)
  const { data: billingContacts } = useBillingContacts()
  const { data: paymentMethods } = usePaymentMethods()
  const downloadInvoiceMutation = useDownloadInvoice()

  const formatCurrency = (amount: number, currency: string = "USD") => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
    }).format(amount)
  }

  const handleDownloadInvoice = async (transactionId: string) => {
    try {
      await downloadInvoiceMutation.mutateAsync(transactionId)
    } catch (error) {
      // Error handled by mutation
    }
  }

  const handleRequestRefund = (transaction: Transaction) => {
    setSelectedTransaction(transaction)
    setShowRefundDialog(true)
  }

  const columns: ColumnDef<Transaction>[] = [
    {
      accessorKey: "date",
      header: "Date",
      cell: ({ row }) => {
        const date = new Date(row.original.date)
        return (
          <div className="text-sm text-foreground">
            {format(date, "MMM dd, yyyy")}
            <div className="text-xs text-muted-foreground">
              {format(date, "hh:mm a")}
            </div>
          </div>
        )
      },
    },
    {
      accessorKey: "plan",
      header: "Plan",
      cell: ({ row }) => {
        const plan = row.original.plan
        return (
          <div>
            <div className="font-medium text-foreground">{plan.name}</div>
            <div className="text-xs text-muted-foreground">
              {plan.interval === "month" ? "Monthly" : "Yearly"}
            </div>
          </div>
        )
      },
    },
    {
      accessorKey: "amount",
      header: "Amount",
      cell: ({ row }) => {
        return (
          <div className="font-semibold text-foreground">
            {formatCurrency(row.original.amount, row.original.plan.currency)}
          </div>
        )
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.original.status
        return (
          <Badge className={cn("text-xs", statusColors[status])}>
            {statusLabels[status]}
          </Badge>
        )
      },
    },
    {
      accessorKey: "refundStatus",
      header: "Refund Status",
      cell: ({ row }) => {
        const refundStatus = row.original.refundStatus
        if (refundStatus === "none") {
          return <span className="text-sm text-muted-foreground">—</span>
        }
        return (
          <Badge
            variant="outline"
            className={cn(
              "text-xs",
              refundStatus === "processed" && "bg-success/10 text-success border-success",
              refundStatus === "approved" && "bg-blue-500/10 text-blue-500 border-blue-500",
              refundStatus === "rejected" && "bg-destructive/10 text-destructive border-destructive",
              refundStatus === "requested" && "bg-orange-500/10 text-orange-500 border-orange-500"
            )}
          >
            {refundStatus.charAt(0).toUpperCase() + refundStatus.slice(1).replace("_", " ")}
          </Badge>
        )
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const transaction = row.original
        return (
          <div className="flex items-center gap-2">
            {transaction.invoiceUrl && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => window.open(transaction.invoiceUrl!, "_blank")}
                className="h-8"
              >
                <FileText className="h-4 w-4 mr-1" />
                View
              </Button>
            )}
            {transaction.downloadUrl && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDownloadInvoice(transaction.id)}
                disabled={downloadInvoiceMutation.isPending}
                className="h-8"
              >
                <Download className="h-4 w-4 mr-1" />
                PDF
              </Button>
            )}
            {transaction.status === "completed" &&
              transaction.refundStatus === "none" && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleRequestRefund(transaction)}
                  className="h-8"
                >
                  Refund
                </Button>
              )}
          </div>
        )
      },
    },
  ]

  const table = useReactTable({
    data: transactions || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    state: {
      sorting,
    },
  })

  return (
    <DashboardLayout>
      <div className="space-y-8 animate-fade-in-up">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Transaction History</h1>
            <p className="text-muted-foreground mt-2">
              View and manage your payment history, invoices, and refunds
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => refetch()}
            disabled={isLoading}
          >
            <RefreshCw className={cn("h-4 w-4 mr-2", isLoading && "animate-spin")} />
            Refresh
          </Button>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Filters */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Filter className="h-5 w-5" />
                  Filters
                </CardTitle>
                <CardDescription>
                  Filter transactions by date range and status
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="startDate">Start Date</Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="endDate">End Date</Label>
                    <Input
                      id="endDate"
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select
                      value={statusFilter}
                      onValueChange={(value) => setStatusFilter(value as TransactionStatus | "all")}
                    >
                      <SelectTrigger id="status">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Statuses</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="failed">Failed</SelectItem>
                        <SelectItem value="refunded">Refunded</SelectItem>
                        <SelectItem value="refund_pending">Refund Pending</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Transactions Table */}
            <Card>
              <CardHeader>
                <CardTitle>Transactions</CardTitle>
                <CardDescription>
                  {transactions?.length || 0} transaction{transactions?.length !== 1 ? "s" : ""} found
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-3">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Skeleton key={i} className="h-16 w-full" />
                    ))}
                  </div>
                ) : transactions && transactions.length > 0 ? (
                  <div className="rounded-md border border-border">
                    <Table>
                      <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                          <TableRow key={headerGroup.id}>
                            {headerGroup.headers.map((header) => {
                              const canSort = header.column.getCanSort()
                              return (
                                <TableHead
                                  key={header.id}
                                  className={canSort ? "cursor-pointer select-none" : ""}
                                  onClick={header.column.getToggleSortingHandler()}
                                >
                                  <div className="flex items-center gap-2">
                                    {flexRender(
                                      header.column.columnDef.header,
                                      header.getContext()
                                    )}
                                    {canSort && (
                                      <span className="text-muted-foreground">
                                        {{
                                          asc: <ChevronUp className="h-4 w-4" />,
                                          desc: <ChevronDown className="h-4 w-4" />,
                                        }[header.column.getIsSorted() as string] ?? (
                                          <div className="h-4 w-4" />
                                        )}
                                      </span>
                                    )}
                                  </div>
                                </TableHead>
                              )
                            })}
                          </TableRow>
                        ))}
                      </TableHeader>
                      <TableBody>
                        {table.getRowModel().rows.map((row) => (
                          <TableRow key={row.id}>
                            {row.getVisibleCells().map((cell) => (
                              <TableCell key={cell.id}>
                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                              </TableCell>
                            ))}
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      No transactions found
                    </h3>
                    <p className="text-sm text-muted-foreground max-w-sm">
                      {statusFilter !== "all" || startDate || endDate
                        ? "Try adjusting your filters to see more results."
                        : "Your transaction history will appear here once you make a purchase."}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Billing Contacts */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  Billing Contacts
                </CardTitle>
                <CardDescription>
                  Manage your billing information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {billingContacts && billingContacts.length > 0 ? (
                  <div className="space-y-3">
                    {billingContacts.map((contact) => (
                      <div
                        key={contact.id}
                        className="p-3 rounded-lg border border-border bg-card"
                      >
                        <div className="font-medium text-foreground">{contact.name}</div>
                        <div className="text-sm text-muted-foreground">{contact.email}</div>
                        <div className="text-sm text-muted-foreground">{contact.companyName}</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No billing contacts found
                  </p>
                )}
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setShowBillingForm(true)}
                >
                  <Building2 className="h-4 w-4 mr-2" />
                  Manage Contacts
                </Button>
              </CardContent>
            </Card>

            {/* Payment Methods */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Payment Methods
                </CardTitle>
                <CardDescription>
                  Manage your saved payment methods
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {paymentMethods && paymentMethods.length > 0 ? (
                  <div className="space-y-3">
                    {paymentMethods.map((method) => (
                      <div
                        key={method.id}
                        className="p-3 rounded-lg border border-border bg-card flex items-center justify-between"
                      >
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
                          {method.isDefault && (
                            <Badge variant="outline" className="mt-1 text-xs">
                              Default
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No payment methods found
                  </p>
                )}
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setShowPaymentForm(true)}
                >
                  <CreditCard className="h-4 w-4 mr-2" />
                  Manage Methods
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Modals */}
      {selectedTransaction && (
        <RefundRequestDialog
          open={showRefundDialog}
          onOpenChange={setShowRefundDialog}
          transactionId={selectedTransaction.id}
          transactionAmount={selectedTransaction.amount}
          currency={selectedTransaction.plan.currency}
        />
      )}

      <BillingContactForm
        open={showBillingForm}
        onOpenChange={setShowBillingForm}
      />

      <PaymentMethodForm
        open={showPaymentForm}
        onOpenChange={setShowPaymentForm}
      />
    </DashboardLayout>
  )
}
