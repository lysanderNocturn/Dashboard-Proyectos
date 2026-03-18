import * as React from "react"
import { cn } from "@/lib/utils"

/**
 * Card Component with multiple variants and enhanced UI/UX
 * 
 * Variants:  
 * - default: Standard card with subtle shadow
 * - elevated: Enhanced shadow for depth
 * - interactive: Clickable card with hover effects
 * - outlined: Card with border only
 * - gradient: Card with gradient background
 * 
 * Features:
 * - Animation support
 * - Status indicators
 * - Icon slots
 * - Loading states
 */
const Card = React.forwardRef(({ 
  className, 
  variant = "default",
  interactive = false,
  animation = "none",
  status = null,
  padding = "default",
  hoverEffect = true,
  onClick,
  children,
  ...props 
}, ref) => {
  const variants = {
    default: "border border-gray-200 bg-white shadow-sm",
    elevated: "border border-gray-100 bg-white shadow-md hover:shadow-lg",
    interactive: "border border-gray-200 bg-white shadow-sm hover:shadow-lg hover:border-primary/30 cursor-pointer transition-all duration-300 hover:-translate-y-1",
    outlined: "border-2 border-gray-300 bg-white hover:border-primary/50",
    gradient: "border-none bg-gradient-to-br from-white to-gray-50 shadow-md",
    glass: "border border-white/20 bg-white/80 backdrop-blur-sm shadow-lg",
  }

  const paddingSizes = {
    none: "p-0",
    small: "p-3",
    default: "p-6",
    large: "p-8",
  }

  const animations = {
    none: "",
    fade: "animate-fadeIn",
    slide: "animate-slideIn",
    scale: "transition-transform hover:scale-[1.02]",
    bounce: "transition-all hover:-translate-y-2",
  }

  const statusColors = {
    success: "border-l-4 border-l-green-500",
    warning: "border-l-4 border-l-amber-500",
    error: "border-l-4 border-l-red-500",
    info: "border-l-4 border-l-blue-500",
    pending: "border-l-4 border-l-amber-500",
  }

  return (
    <div
      ref={ref}
      className={cn(
        "rounded-xl overflow-hidden",
        variants[variant],
        paddingSizes[padding],
        animations[animation],
        status && statusColors[status],
        interactive && variant === "default" && "hover:shadow-lg hover:border-primary/30 cursor-pointer transition-all duration-300 hover:-translate-y-1",
        onClick && "cursor-pointer",
        className
      )}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => e.key === 'Enter' && onClick(e) : undefined}
      {...props}
    >
      {children}
    </div>
  )
})
Card.displayName = "Card"

// Card with decorative header
const CardHeader = React.forwardRef(({ 
  className, 
  showIcon = false,
  icon = null,
  action = null,
  ...props 
}, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 pb-4", className)}
    {...props}
  >
    {(showIcon || icon || action) && (
      <div className="flex items-center justify-between">
        {icon && (
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              {icon}
            </div>
          </div>
        )}
        {action && <div>{action}</div>}
      </div>
    )}
  </div>
))
CardHeader.displayName = "CardHeader"

// Card title with optional description
const CardTitle = React.forwardRef(({ 
  className, 
  description = null,
  ...props 
}, ref) => (
  <div>
    <h3
      ref={ref}
      className={cn(
        "text-xl font-semibold leading-none tracking-tight text-gray-900",
        className
      )}
      {...props}
    />
    {description && (
      <p className="text-sm text-gray-500 mt-1">{description}</p>
    )}
  </div>
))
CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-gray-500", className)}
    {...props}
  />
))
CardDescription.displayName = "CardDescription"

const CardContent = React.forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("", className)} {...props} />
))
CardContent.displayName = "CardContent"

const CardFooter = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center pt-4 mt-4 border-t border-gray-100", className)}
    {...props}
  />
))
CardFooter.displayName = "CardFooter"

// Status Badge Component for Cards
const CardStatus = ({ 
  status = "pending",
  size = "default",
  showDot = true,
  pulse = false,
  className 
}) => {
  const statusConfig = {
    success: { 
      bg: "bg-green-100", 
      text: "text-green-700", 
      dot: "bg-green-500",
      label: "Completado"
    },
    warning: { 
      bg: "bg-amber-100", 
      text: "text-amber-700", 
      dot: "bg-amber-500",
      label: "Pendiente"
    },
    error: { 
      bg: "bg-red-100", 
      text: "text-red-700", 
      dot: "bg-red-500",
      label: "Error"
    },
    info: { 
      bg: "bg-blue-100", 
      text: "text-blue-700", 
      dot: "bg-blue-500",
      label: "En Progreso"
    },
    pending: { 
      bg: "bg-gray-100", 
      text: "text-gray-700", 
      dot: "bg-gray-500",
      label: "Pendiente"
    },
  }

  const sizes = {
    small: "text-xs px-2 py-0.5",
    default: "text-xs px-2.5 py-1",
    large: "text-sm px-3 py-1.5",
  }

  const config = statusConfig[status] || statusConfig.pending
  const sizeClass = sizes[size] || sizes.default

  return (
    <span className={cn(
      "inline-flex items-center gap-1.5 rounded-full font-medium",
      config.bg,
      config.text,
      sizeClass,
      pulse && "animate-pulse",
      className
    )}>
      {showDot && (
        <span className={cn("w-1.5 h-1.5 rounded-full", config.dot)} />
      )}
      {config.label}
    </span>
  )
}

// Stat Card Component - Enhanced for dashboard/stats
const CardStat = React.forwardRef(({ 
  title,
  value,
  description,
  icon,
  trend = null,
  trendValue = null,
  variant = "default",
  color = "primary",
  className,
  ...props
}, ref) => {
  const colorGradients = {
    primary: "from-primary/10 to-primary/5",
    success: "from-green-50 to-green-100",
    warning: "from-amber-50 to-amber-100",
    error: "from-red-50 to-red-100",
    info: "from-blue-50 to-blue-100",
    purple: "from-purple-50 to-purple-100",
  }

  const iconColors = {
    primary: "bg-primary/20 text-primary",
    success: "bg-green-100 text-green-600",
    warning: "bg-amber-100 text-amber-600",
    error: "bg-red-100 text-red-600",
    info: "bg-blue-100 text-blue-600",
    purple: "bg-purple-100 text-purple-600",
  }

  return (
    <Card
      ref={ref}
      variant={variant}
      className={cn(
        "relative overflow-hidden group",
        className
      )}
      {...props}
    >
      {/* Decorative background gradient */}
      <div className={cn(
        "absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-300",
        colorGradients[color] || colorGradients.primary
      )} />
      
      {/* Decorative circles */}
      <div className="absolute -top-8 -right-8 w-24 h-24 rounded-full bg-gray-100/50" />
      <div className="absolute -bottom-4 -left-4 w-16 h-16 rounded-full bg-gray-50/50" />
      
      <CardContent className="relative z-10">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
            <p className="text-3xl font-bold text-gray-900 mb-1">{value}</p>
            {description && (
              <p className="text-sm text-gray-600">{description}</p>
            )}
            {trend !== null && trendValue !== null && (
              <div className={cn(
                "inline-flex items-center gap-1 mt-2 text-sm font-medium",
                trend === "up" ? "text-green-600" : "text-red-600"
              )}>
                <span>{trend === "up" ? "↑" : "↓"}</span>
                <span>{trendValue}</span>
              </div>
            )}
          </div>
          
          {icon && (
            <div className={cn(
              "p-3 rounded-xl transition-transform duration-300 group-hover:scale-110",
              iconColors[color] || iconColors.primary
            )}>
              {icon}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
})
CardStat.displayName = "CardStat"

// Loading Skeleton for Cards
const CardSkeleton = ({ 
  variant = "default",
  hasHeader = true,
  hasFooter = false,
  lines = 3,
  className 
}) => {
  return (
    <Card variant={variant} className={cn("animate-pulse", className)}>
      {hasHeader && (
        <CardHeader>
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-2" />
          <div className="h-4 bg-gray-100 rounded w-1/2" />
        </CardHeader>
      )}
      <CardContent>
        {Array.from({ length: lines }).map((_, i) => (
          <div 
            key={i} 
            className={cn(
              "bg-gray-100 rounded mb-2",
              i === lines - 1 ? "w-2/3" : "w-full"
            )}
            style={{ height: '16px' }}
          />
        ))}
      </CardContent>
      {hasFooter && (
        <CardFooter>
          <div className="h-8 bg-gray-200 rounded w-20" />
        </CardFooter>
      )}
    </Card>
  )
}

// Empty State Card
const CardEmpty = ({ 
  icon = null,
  title,
  description,
  action = null,
  className 
}) => {
  return (
    <Card variant="outlined" className={cn("text-center py-12", className)}>
      <CardContent>
        {icon && (
          <div className="mx-auto w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
            <span className="text-3xl text-gray-400">{icon}</span>
          </div>
        )}
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
        {description && (
          <p className="text-gray-500 mb-6 max-w-sm mx-auto">{description}</p>
        )}
        {action && <div>{action}</div>}
      </CardContent>
    </Card>
  )
}

// Progress Card Component
const CardProgress = React.forwardRef(({ 
  title,
  value,
  total,
  label,
  showPercentage = true,
  color = "primary",
  size = "default",
  className,
  ...props
}, ref) => {
  const percentage = total > 0 ? Math.round((value / total) * 100) : 0
  
  const sizes = {
    small: { height: "h-1.5", text: "text-sm" },
    default: { height: "h-2", text: "text-base" },
    large: { height: "h-3", text: "text-lg" },
  }

  const colors = {
    primary: "bg-primary",
    success: "bg-green-500",
    warning: "bg-amber-500",
    error: "bg-red-500",
    info: "bg-blue-500",
  }

  const sizeConfig = sizes[size] || sizes.default
  const colorConfig = colors[color] || colors.primary

  return (
    <Card ref={ref} className={cn(className)} {...props}>
      <CardContent>
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">{title}</span>
          {showPercentage && (
            <span className={cn("font-bold", sizeConfig.text)}>{percentage}%</span>
          )}
        </div>
        
        <div className={cn(
          "w-full bg-gray-100 rounded-full overflow-hidden",
          sizeConfig.height
        )}>
          <div 
            className={cn(
              "h-full rounded-full transition-all duration-500 ease-out",
              colorConfig
            )}
            style={{ width: `${Math.min(percentage, 100)}%` }}
          />
        </div>
        
        {label && (
          <p className="text-xs text-gray-500 mt-2">{label}</p>
        )}
      </CardContent>
    </Card>
  )
})
CardProgress.displayName = "CardProgress"

export { 
  Card, 
  CardHeader, 
  CardFooter, 
  CardTitle, 
  CardDescription, 
  CardContent,
  CardStatus,
  CardStat,
  CardSkeleton,
  CardEmpty,
  CardProgress
}
