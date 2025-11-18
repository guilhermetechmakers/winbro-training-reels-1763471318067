import { Check } from "lucide-react"
import { cn } from "@/lib/utils"

interface CheckoutProgressProps {
  currentStep: number
  steps: string[]
}

export function CheckoutProgress({ currentStep, steps }: CheckoutProgressProps) {
  return (
    <div className="w-full">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const stepNumber = index + 1
          const isCompleted = stepNumber < currentStep
          const isCurrent = stepNumber === currentStep

          return (
            <div key={step} className="flex items-center flex-1">
              <div className="flex flex-col items-center flex-1">
                <div
                  className={cn(
                    "flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-200",
                    isCompleted
                      ? "bg-accent border-accent text-white"
                      : isCurrent
                      ? "border-accent bg-accent/10 text-accent"
                      : "border-border bg-card text-muted-foreground"
                  )}
                >
                  {isCompleted ? (
                    <Check className="h-5 w-5" />
                  ) : (
                    <span className="text-sm font-medium">{stepNumber}</span>
                  )}
                </div>
                <span
                  className={cn(
                    "mt-2 text-xs font-medium transition-colors duration-200",
                    isCurrent
                      ? "text-foreground"
                      : isCompleted
                      ? "text-muted-foreground"
                      : "text-muted-foreground"
                  )}
                >
                  {step}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={cn(
                    "h-0.5 flex-1 mx-2 transition-colors duration-200",
                    isCompleted ? "bg-accent" : "bg-border"
                  )}
                />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
