import * as React from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  blur?: number
  opacity?: number
  borderOpacity?: number
  hoverScale?: number
}

const GlassCard = React.forwardRef<HTMLDivElement, GlassCardProps>(
  ({ 
    className, 
    children, 
    blur = 10,
    opacity = 0.1,
    borderOpacity = 0.2,
    hoverScale = 1.02,
    ...props 
  }, ref) => {
    return (
      <motion.div
        ref={ref}
        className={cn(
          "rounded-lg border border-white/20 bg-white/10 backdrop-blur-md shadow-lg",
          className
        )}
        style={{
          backdropFilter: `blur(${blur}px)`,
          backgroundColor: `rgba(255, 255, 255, ${opacity})`,
          borderColor: `rgba(255, 255, 255, ${borderOpacity})`,
        }}
        whileHover={{
          scale: hoverScale,
          backgroundColor: `rgba(255, 255, 255, ${opacity + 0.05})`,
          transition: { duration: 0.2 }
        }}
        {...props}
      >
        {children}
      </motion.div>
    )
  }
)
GlassCard.displayName = "GlassCard"

export { GlassCard } 