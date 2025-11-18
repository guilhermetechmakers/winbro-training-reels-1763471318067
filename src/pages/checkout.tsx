import { useState, useEffect } from "react"
import { useSearchParams } from "react-router-dom"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { CreditCard, Building2, FileText, CheckCircle2 } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { CheckoutProgress } from "@/components/checkout/checkout-progress"
import { InvoicePreviewModal } from "@/components/checkout/invoice-preview-modal"
import { SuccessModal } from "@/components/checkout/success-modal"
import {
  useSubscriptionPlans,
  useValidatePromoCode,
  useInvoicePreview,
  useProcessCheckout,
} from "@/hooks/use-checkout"
import type { CheckoutData } from "@/types/checkout"

// Form schemas
const billingSchema = z.object({
  companyName: z.string().min(2, "Company name must be at least 2 characters"),
  street: z.string().min(5, "Street address is required"),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State is required"),
  zipCode: z.string().regex(/^\d{5}(-\d{4})?$/, "Invalid ZIP code"),
  country: z.string().min(2, "Country is required"),
  taxId: z.string().optional(),
})

const paymentSchema = z.object({
  cardNumber: z.string().regex(/^\d{4}\s?\d{4}\s?\d{4}\s?\d{4}$/, "Invalid card number"),
  expiryMonth: z.string().regex(/^(0[1-9]|1[0-2])$/, "Invalid month"),
  expiryYear: z.string().regex(/^\d{4}$/, "Invalid year"),
  cvv: z.string().regex(/^\d{3,4}$/, "Invalid CVV"),
  cardholderName: z.string().min(2, "Cardholder name is required"),
})

type BillingForm = z.infer<typeof billingSchema>
type PaymentForm = z.infer<typeof paymentSchema>

const CHECKOUT_STEPS = ["Plan", "Billing", "Payment", "Review"]

export function CheckoutPage() {
  const [searchParams] = useSearchParams()
  const preselectedPlanId = searchParams.get("planId")

  // State
  const [currentStep, setCurrentStep] = useState(1)
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(
    preselectedPlanId
  )
  const [promoCode, setPromoCode] = useState("")
  const [promoCodeValid, setPromoCodeValid] = useState(false)
  const [showInvoicePreview, setShowInvoicePreview] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [transactionData, setTransactionData] = useState<{
    transactionId: string
    invoiceId: string
  } | null>(null)
  const [termsAccepted, setTermsAccepted] = useState(false)

  // Queries and mutations
  const { data: plans, isLoading: plansLoading } = useSubscriptionPlans()
  const validatePromoMutation = useValidatePromoCode()
  const { data: invoicePreview, isLoading: invoiceLoading } = useInvoicePreview(
    selectedPlanId,
    promoCodeValid ? promoCode : undefined
  )
  const processCheckoutMutation = useProcessCheckout()

  // Forms
  const billingForm = useForm<BillingForm>({
    resolver: zodResolver(billingSchema),
    defaultValues: {
      companyName: "",
      street: "",
      city: "",
      state: "",
      zipCode: "",
      country: "United States",
      taxId: "",
    },
  })

  const paymentForm = useForm<PaymentForm>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      cardNumber: "",
      expiryMonth: "",
      expiryYear: "",
      cvv: "",
      cardholderName: "",
    },
  })

  // Auto-select plan if provided
  useEffect(() => {
    if (preselectedPlanId && plans) {
      const plan = plans.find((p) => p.id === preselectedPlanId)
      if (plan) {
        setSelectedPlanId(preselectedPlanId)
      }
    }
  }, [preselectedPlanId, plans])

  // Handle promo code validation
  const handlePromoCodeChange = async (code: string) => {
    setPromoCode(code)
    if (code.length > 3 && selectedPlanId) {
      try {
        const result = await validatePromoMutation.mutateAsync({
          code,
          planId: selectedPlanId,
        })
        if (result.valid) {
          setPromoCodeValid(true)
          toast.success(result.message || "Promo code applied!")
        } else {
          setPromoCodeValid(false)
          toast.error(result.message || "Invalid promo code")
        }
      } catch (error) {
        setPromoCodeValid(false)
      }
    } else {
      setPromoCodeValid(false)
    }
  }

  // Format card number
  const formatCardNumber = (value: string) => {
    const cleaned = value.replace(/\s/g, "")
    const match = cleaned.match(/.{1,4}/g)
    return match ? match.join(" ") : cleaned
  }

  // Handle step navigation
  const handleNext = async () => {
    if (currentStep === 1) {
      if (!selectedPlanId) {
        toast.error("Please select a subscription plan")
        return
      }
      setCurrentStep(2)
    } else if (currentStep === 2) {
      const isValid = await billingForm.trigger()
      if (!isValid) {
        toast.error("Please fill in all required billing details")
        return
      }
      setCurrentStep(3)
    } else if (currentStep === 3) {
      const isValid = await paymentForm.trigger()
      if (!isValid) {
        toast.error("Please fill in all required payment details")
        return
      }
      setCurrentStep(4)
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  // Handle checkout submission
  const handleCheckout = async () => {
    if (!termsAccepted) {
      toast.error("Please accept the terms and conditions")
      return
    }

    if (!selectedPlanId) {
      toast.error("Please select a plan")
      return
    }

    const billingData = billingForm.getValues()
    const paymentData = paymentForm.getValues()

    const checkoutData: CheckoutData = {
      planId: selectedPlanId,
      billingDetails: {
        companyName: billingData.companyName,
        billingAddress: {
          street: billingData.street,
          city: billingData.city,
          state: billingData.state,
          zipCode: billingData.zipCode,
          country: billingData.country,
        },
        taxId: billingData.taxId,
      },
      paymentMethod: {
        type: "card",
        cardNumber: paymentData.cardNumber.replace(/\s/g, ""),
        expiryMonth: paymentData.expiryMonth,
        expiryYear: paymentData.expiryYear,
        cvv: paymentData.cvv,
        cardholderName: paymentData.cardholderName,
      },
      promoCode: promoCodeValid ? promoCode : undefined,
      termsAccepted: true,
    }

    try {
      const result = await processCheckoutMutation.mutateAsync(checkoutData)
      setTransactionData({
        transactionId: result.transactionId,
        invoiceId: result.invoiceId,
      })
      setShowSuccessModal(true)
    } catch (error) {
      // Error handled by mutation
    }
  }

  const selectedPlan = plans?.find((p) => p.id === selectedPlanId)
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: selectedPlan?.currency || "USD",
    }).format(amount)
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="mb-8 animate-fade-in-up">
          <h1 className="text-3xl font-bold text-foreground mb-2">Checkout</h1>
          <p className="text-muted-foreground">
            Complete your subscription purchase in a few simple steps
          </p>
        </div>

        {/* Progress Indicator */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <CheckoutProgress currentStep={currentStep} steps={CHECKOUT_STEPS} />
          </CardContent>
        </Card>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Step 1: Plan Selection */}
            {currentStep === 1 && (
              <Card className="animate-fade-in-up">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Select Subscription Plan
                  </CardTitle>
                  <CardDescription>
                    Choose the plan that best fits your needs
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {plansLoading ? (
                    <div className="space-y-4">
                      {[1, 2, 3].map((i) => (
                        <Skeleton key={i} className="h-32 w-full" />
                      ))}
                    </div>
                  ) : (
                    <RadioGroup
                      value={selectedPlanId || ""}
                      onValueChange={setSelectedPlanId}
                      className="space-y-4"
                    >
                      {plans?.map((plan) => (
                        <div
                          key={plan.id}
                          className={`relative border-2 rounded-lg p-6 transition-all duration-200 cursor-pointer ${
                            selectedPlanId === plan.id
                              ? "border-accent bg-accent/5"
                              : "border-border hover:border-accent/50"
                          }`}
                          onClick={() => setSelectedPlanId(plan.id)}
                        >
                          <div className="flex items-start gap-4">
                            <RadioGroupItem value={plan.id} className="mt-1" />
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-2">
                                <div>
                                  <h3 className="text-lg font-semibold text-foreground">
                                    {plan.name}
                                    {plan.popular && (
                                      <span className="ml-2 text-xs bg-accent text-white px-2 py-1 rounded">
                                        Popular
                                      </span>
                                    )}
                                  </h3>
                                  <p className="text-sm text-muted-foreground">
                                    {plan.description}
                                  </p>
                                </div>
                                <div className="text-right">
                                  <div className="text-2xl font-bold text-foreground">
                                    {formatCurrency(plan.price)}
                                  </div>
                                  <div className="text-sm text-muted-foreground">
                                    /{plan.interval}
                                  </div>
                                </div>
                              </div>
                              <ul className="mt-4 space-y-2">
                                {plan.features.map((feature, idx) => (
                                  <li key={idx} className="flex items-center gap-2 text-sm">
                                    <CheckCircle2 className="h-4 w-4 text-success flex-shrink-0" />
                                    <span className="text-muted-foreground">{feature}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        </div>
                      ))}
                    </RadioGroup>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Step 2: Billing Details */}
            {currentStep === 2 && (
              <Card className="animate-fade-in-up">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="h-5 w-5" />
                    Billing Details
                  </CardTitle>
                  <CardDescription>
                    Enter your company billing information
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="companyName">Company Name *</Label>
                      <Input
                        id="companyName"
                        {...billingForm.register("companyName")}
                        placeholder="Acme Corporation"
                      />
                      {billingForm.formState.errors.companyName && (
                        <p className="text-sm text-destructive">
                          {billingForm.formState.errors.companyName.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="street">Street Address *</Label>
                      <Input
                        id="street"
                        {...billingForm.register("street")}
                        placeholder="123 Main Street"
                      />
                      {billingForm.formState.errors.street && (
                        <p className="text-sm text-destructive">
                          {billingForm.formState.errors.street.message}
                        </p>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="city">City *</Label>
                        <Input
                          id="city"
                          {...billingForm.register("city")}
                          placeholder="New York"
                        />
                        {billingForm.formState.errors.city && (
                          <p className="text-sm text-destructive">
                            {billingForm.formState.errors.city.message}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="state">State *</Label>
                        <Input
                          id="state"
                          {...billingForm.register("state")}
                          placeholder="NY"
                        />
                        {billingForm.formState.errors.state && (
                          <p className="text-sm text-destructive">
                            {billingForm.formState.errors.state.message}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="zipCode">ZIP Code *</Label>
                        <Input
                          id="zipCode"
                          {...billingForm.register("zipCode")}
                          placeholder="10001"
                        />
                        {billingForm.formState.errors.zipCode && (
                          <p className="text-sm text-destructive">
                            {billingForm.formState.errors.zipCode.message}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="country">Country *</Label>
                        <Input
                          id="country"
                          {...billingForm.register("country")}
                          placeholder="United States"
                        />
                        {billingForm.formState.errors.country && (
                          <p className="text-sm text-destructive">
                            {billingForm.formState.errors.country.message}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="taxId">Tax ID (Optional)</Label>
                      <Input
                        id="taxId"
                        {...billingForm.register("taxId")}
                        placeholder="12-3456789"
                      />
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}

            {/* Step 3: Payment Information */}
            {currentStep === 3 && (
              <Card className="animate-fade-in-up">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    Payment Information
                  </CardTitle>
                  <CardDescription>
                    Enter your payment details securely
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="cardholderName">Cardholder Name *</Label>
                      <Input
                        id="cardholderName"
                        {...paymentForm.register("cardholderName")}
                        placeholder="John Doe"
                      />
                      {paymentForm.formState.errors.cardholderName && (
                        <p className="text-sm text-destructive">
                          {paymentForm.formState.errors.cardholderName.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="cardNumber">Card Number *</Label>
                      <Input
                        id="cardNumber"
                        {...paymentForm.register("cardNumber", {
                          onChange: (e) => {
                            e.target.value = formatCardNumber(e.target.value)
                          },
                        })}
                        placeholder="1234 5678 9012 3456"
                        maxLength={19}
                      />
                      {paymentForm.formState.errors.cardNumber && (
                        <p className="text-sm text-destructive">
                          {paymentForm.formState.errors.cardNumber.message}
                        </p>
                      )}
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="expiryMonth">Month *</Label>
                        <Input
                          id="expiryMonth"
                          {...paymentForm.register("expiryMonth")}
                          placeholder="12"
                          maxLength={2}
                        />
                        {paymentForm.formState.errors.expiryMonth && (
                          <p className="text-sm text-destructive">
                            {paymentForm.formState.errors.expiryMonth.message}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="expiryYear">Year *</Label>
                        <Input
                          id="expiryYear"
                          {...paymentForm.register("expiryYear")}
                          placeholder="2025"
                          maxLength={4}
                        />
                        {paymentForm.formState.errors.expiryYear && (
                          <p className="text-sm text-destructive">
                            {paymentForm.formState.errors.expiryYear.message}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="cvv">CVV *</Label>
                        <Input
                          id="cvv"
                          type="password"
                          {...paymentForm.register("cvv")}
                          placeholder="123"
                          maxLength={4}
                        />
                        {paymentForm.formState.errors.cvv && (
                          <p className="text-sm text-destructive">
                            {paymentForm.formState.errors.cvv.message}
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
                  </form>
                </CardContent>
              </Card>
            )}

            {/* Step 4: Review */}
            {currentStep === 4 && (
              <Card className="animate-fade-in-up">
                <CardHeader>
                  <CardTitle>Review & Confirm</CardTitle>
                  <CardDescription>
                    Review your order details before completing the purchase
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Plan Summary */}
                  {selectedPlan && (
                    <div>
                      <h3 className="font-semibold text-foreground mb-3">Plan Selected</h3>
                      <div className="bg-muted/30 rounded-lg p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium text-foreground">{selectedPlan.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {selectedPlan.description}
                            </p>
                          </div>
                          <p className="font-semibold text-foreground">
                            {formatCurrency(selectedPlan.price)}/{selectedPlan.interval}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Billing Summary */}
                  <div>
                    <h3 className="font-semibold text-foreground mb-3">Billing Address</h3>
                    <div className="bg-muted/30 rounded-lg p-4">
                      <p className="text-foreground">
                        {billingForm.getValues().companyName}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {billingForm.getValues().street}
                        <br />
                        {billingForm.getValues().city}, {billingForm.getValues().state}{" "}
                        {billingForm.getValues().zipCode}
                        <br />
                        {billingForm.getValues().country}
                      </p>
                    </div>
                  </div>

                  {/* Promo Code */}
                  <div>
                    <Label htmlFor="promoCode">Promo Code</Label>
                    <div className="flex gap-2 mt-2">
                      <Input
                        id="promoCode"
                        value={promoCode}
                        onChange={(e) => handlePromoCodeChange(e.target.value)}
                        placeholder="Enter promo code"
                      />
                      {promoCodeValid && (
                        <div className="flex items-center gap-2 text-success text-sm">
                          <CheckCircle2 className="h-4 w-4" />
                          <span>Applied</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Terms */}
                  <div className="flex items-start gap-3">
                    <Checkbox
                      id="terms"
                      checked={termsAccepted}
                      onCheckedChange={(checked) => setTermsAccepted(checked === true)}
                    />
                    <Label
                      htmlFor="terms"
                      className="text-sm text-muted-foreground cursor-pointer"
                    >
                      I agree to the{" "}
                      <a href="/terms" className="text-accent hover:underline">
                        Terms of Service
                      </a>{" "}
                      and{" "}
                      <a href="/privacy" className="text-accent hover:underline">
                        Privacy Policy
                      </a>
                    </Label>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between">
              <Button
                variant="outline"
                onClick={handleBack}
                disabled={currentStep === 1}
              >
                Back
              </Button>
              {currentStep < 4 ? (
                <Button onClick={handleNext}>Continue</Button>
              ) : (
                <Button
                  onClick={handleCheckout}
                  disabled={
                    !termsAccepted ||
                    processCheckoutMutation.isPending ||
                    !selectedPlanId
                  }
                >
                  {processCheckoutMutation.isPending
                    ? "Processing..."
                    : "Complete Purchase"}
                </Button>
              )}
            </div>
          </div>

          {/* Sidebar: Order Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-8">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {invoiceLoading ? (
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                  </div>
                ) : invoicePreview ? (
                  <>
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Subtotal</span>
                        <span className="text-foreground">
                          {formatCurrency(invoicePreview.subtotal)}
                        </span>
                      </div>

                      {invoicePreview.discount > 0 && (
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Discount</span>
                          <span className="text-success">
                            -{formatCurrency(invoicePreview.discount)}
                          </span>
                        </div>
                      )}

                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Tax</span>
                        <span className="text-foreground">
                          {formatCurrency(invoicePreview.tax)}
                        </span>
                      </div>

                      <Separator />

                      <div className="flex justify-between text-lg font-bold">
                        <span className="text-foreground">Total</span>
                        <span className="text-foreground">
                          {formatCurrency(invoicePreview.total)}
                        </span>
                      </div>
                    </div>

                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => setShowInvoicePreview(true)}
                    >
                      View Invoice Details
                    </Button>
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Select a plan to see pricing
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Modals */}
      {invoicePreview && (
        <InvoicePreviewModal
          open={showInvoicePreview}
          onOpenChange={setShowInvoicePreview}
          invoice={invoicePreview}
        />
      )}

      {transactionData && (
        <SuccessModal
          open={showSuccessModal}
          transactionId={transactionData.transactionId}
          invoiceId={transactionData.invoiceId}
        />
      )}
    </div>
  )
}
