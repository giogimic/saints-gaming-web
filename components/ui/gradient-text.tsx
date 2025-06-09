import * as React from "react"
import { cn } from "@/lib/utils"

interface GradientTextProps extends React.HTMLAttributes<HTMLSpanElement> {
  gradient?: string
  animate?: boolean
}

const GradientText = React.forwardRef<HTMLSpanElement, GradientTextProps>(
  ({ 
    className, 
    children, 
    gradient = "from-primary via-secondary to-primary",
    animate = true,
    ...props 
  }, ref) => {
    return (
      <span
        ref={ref}
        className={cn(
          "bg-clip-text text-transparent bg-gradient-to-r",
          gradient,
          animate && "animate-gradient",
          className
        )}
        {...props}
      >
        {children}
      </span>
    )
  }
)
GradientText.displayName = "GradientText"

export { GradientText } 