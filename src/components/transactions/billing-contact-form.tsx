import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  useBillingContacts,
  useUpdateBillingContact,
} from "@/hooks/use-transactions"
import { Skeleton } from "@/components/ui/skeleton"
import { Building2 } from "lucide-react"

const billingContactSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  companyName: z.string().min(2, "Company name must be at least 2 characters"),
  street: z.string().min(5, "Street address is required"),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State is required"),
  zipCode: z.string().regex(/^\d{5}(-\d{4})?$/, "Invalid ZIP code"),
  country: z.string().min(2, "Country is required"),
  taxId: z.string().optional(),
})

type BillingContactForm = z.infer<typeof billingContactSchema>

interface BillingContactFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function BillingContactForm({ open, onOpenChange }: BillingContactFormProps) {
  const { data: contacts, isLoading } = useBillingContacts()
  const updateContactMutation = useUpdateBillingContact()

  const defaultContact = contacts?.[0] // Use first contact as default, or create new

  const form = useForm<BillingContactForm>({
    resolver: zodResolver(billingContactSchema),
    defaultValues: defaultContact
      ? {
          name: defaultContact.name,
          email: defaultContact.email,
          phone: defaultContact.phone || "",
          companyName: defaultContact.companyName,
          street: defaultContact.address.street,
          city: defaultContact.address.city,
          state: defaultContact.address.state,
          zipCode: defaultContact.address.zipCode,
          country: defaultContact.address.country,
          taxId: defaultContact.taxId || "",
        }
      : {
          name: "",
          email: "",
          phone: "",
          companyName: "",
          street: "",
          city: "",
          state: "",
          zipCode: "",
          country: "United States",
          taxId: "",
        },
  })

  // Reset form when contact data changes
  if (defaultContact && form.getValues().name !== defaultContact.name) {
    form.reset({
      name: defaultContact.name,
      email: defaultContact.email,
      phone: defaultContact.phone || "",
      companyName: defaultContact.companyName,
      street: defaultContact.address.street,
      city: defaultContact.address.city,
      state: defaultContact.address.state,
      zipCode: defaultContact.address.zipCode,
      country: defaultContact.address.country,
      taxId: defaultContact.taxId || "",
    })
  }

  const handleSubmit = async (data: BillingContactForm) => {
    if (!defaultContact) {
      // In a real app, you'd have a create mutation
      onOpenChange(false)
      return
    }

    try {
      await updateContactMutation.mutateAsync({
        contactId: defaultContact.id,
        data: {
          name: data.name,
          email: data.email,
          phone: data.phone,
          companyName: data.companyName,
          address: {
            street: data.street,
            city: data.city,
            state: data.state,
            zipCode: data.zipCode,
            country: data.country,
          },
          taxId: data.taxId,
        },
      })
      onOpenChange(false)
    } catch (error) {
      // Error handled by mutation
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Billing Contact Information
          </DialogTitle>
          <DialogDescription>
            Update your billing contact details for invoices and receipts
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="space-y-4 py-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        ) : (
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 py-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  {...form.register("name")}
                  placeholder="John Doe"
                />
                {form.formState.errors.name && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.name.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  {...form.register("email")}
                  placeholder="john@example.com"
                />
                {form.formState.errors.email && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.email.message}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                type="tel"
                {...form.register("phone")}
                placeholder="+1 (555) 123-4567"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="companyName">Company Name *</Label>
              <Input
                id="companyName"
                {...form.register("companyName")}
                placeholder="Acme Corporation"
              />
              {form.formState.errors.companyName && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.companyName.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="street">Street Address *</Label>
              <Input
                id="street"
                {...form.register("street")}
                placeholder="123 Main Street"
              />
              {form.formState.errors.street && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.street.message}
                </p>
              )}
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="city">City *</Label>
                <Input
                  id="city"
                  {...form.register("city")}
                  placeholder="New York"
                />
                {form.formState.errors.city && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.city.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="state">State *</Label>
                <Input
                  id="state"
                  {...form.register("state")}
                  placeholder="NY"
                />
                {form.formState.errors.state && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.state.message}
                  </p>
                )}
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="zipCode">ZIP Code *</Label>
                <Input
                  id="zipCode"
                  {...form.register("zipCode")}
                  placeholder="10001"
                />
                {form.formState.errors.zipCode && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.zipCode.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="country">Country *</Label>
                <Input
                  id="country"
                  {...form.register("country")}
                  placeholder="United States"
                />
                {form.formState.errors.country && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.country.message}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="taxId">Tax ID (Optional)</Label>
              <Input
                id="taxId"
                {...form.register("taxId")}
                placeholder="12-3456789"
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={updateContactMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={updateContactMutation.isPending}
              >
                {updateContactMutation.isPending ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
