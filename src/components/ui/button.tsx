
import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 !rounded-md !border !shadow-md",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90 border-primary/20 !rounded-md !border-solid",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90 border-destructive/20 !rounded-md !border-solid",
        outline:
          "border-input bg-background hover:bg-accent hover:text-accent-foreground !border-slate-300 !rounded-md !border-solid",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80 border-secondary/20 !rounded-md !border-solid",
        ghost: "hover:bg-accent hover:text-accent-foreground !border-transparent !rounded-md",
        link: "text-primary underline-offset-4 hover:underline !border-transparent !rounded-md",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 px-3",
        lg: "h-11 px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, style, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size }), "!rounded-md !border !border-solid !shadow-md", className)}
        ref={ref}
        style={{
          borderRadius: '6px !important',
          border: '1px solid',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24)',
          ...style
        }}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
