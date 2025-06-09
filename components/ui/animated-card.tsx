import * as React from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface AnimatedCardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverScale?: number
  hoverRotate?: number
  hoverY?: number
  hoverX?: number
  duration?: number
}

const AnimatedCard = React.forwardRef<HTMLDivElement, AnimatedCardProps>(
  ({ 
    className, 
    children, 
    hoverScale = 1.02, 
    hoverRotate = 0, 
    hoverY = -5, 
    hoverX = 0,
    duration = 0.2,
    ...props 
  }, ref) => {
    return (
      <motion.div
        ref={ref}
        className={cn(
          "rounded-lg border-2 border-black bg-card text-card-foreground shadow-md",
          className
        )}
        whileHover={{
          scale: hoverScale,
          rotate: hoverRotate,
          y: hoverY,
          x: hoverX,
          transition: { duration }
        }}
        {...props}
      >
        {children}
      </motion.div>
    )
  }
)
AnimatedCard.displayName = "AnimatedCard"

export { AnimatedCard } 