import { cn } from "@/lib/utils"
import { ElementType, ComponentPropsWithoutRef } from "react"

interface StarBorderProps<T extends ElementType> {
  as?: T
  color?: string
  speed?: string
  className?: string
  children: React.ReactNode
}

export function StarBorder<T extends ElementType = "button">({
  as,
  className,
  color,
  speed = "6s",
  children,
  ...props
}: StarBorderProps<T> & Omit<ComponentPropsWithoutRef<T>, keyof StarBorderProps<T>>) {
  const Component = as || "button"
  const defaultColor = color || "hsl(var(--success))"

  return (
    <Component 
      className={cn(
        "relative inline-block py-[1px] overflow-hidden rounded-[20px]",
        className
      )} 
      {...props}
    >
      {/* Point qui bouge en bas (de droite à gauche) */}
      <div
        className="absolute w-[50px] h-[50px] -bottom-[25px] animate-star-movement-bottom z-0"
        style={{
          background: `radial-gradient(circle, #16A085 0%, #16A085 10%, transparent 70%)`,
          animationDuration: speed,
          opacity: 0.2,
          right: '-25px',
          filter: 'blur(1px)',
        }}
      />
      
      {/* Point qui bouge en haut (de gauche à droite) */}
      <div
        className="absolute w-[50px] h-[50px] -top-[25px] animate-star-movement-top z-0"
        style={{
          background: `radial-gradient(circle, #16A085 0%, #16A085 10%, transparent 70%)`,
          animationDuration: speed,
          opacity: 0.3,
          left: '-25px',
          filter: 'blur(1px)',
        }}
      />
      
      <div className={cn(
        "relative z-[1] text-foreground text-center text-base py-4 px-6 rounded-[20px]",
        "bg-gradient-to-b from-background/10 to-muted/10",
        "dark:from-background/10 dark:to-muted/10"
      )}>
        {children}
      </div>
    </Component>
  )
}