import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import type { ComponentPropsWithoutRef } from 'react'

type ButtonVariant = 'primary' | 'ghost' | 'outline'
type ButtonSize = 'sm' | 'md' | 'lg'

interface ButtonProps extends ComponentPropsWithoutRef<'button'> {
  variant?: ButtonVariant
  size?: ButtonSize
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'bg-gradient-to-r from-accent-from via-accent-mid to-accent-to text-white font-semibold shadow-glow-accent hover:opacity-90 active:opacity-80',
  ghost:
    'bg-transparent text-text-secondary hover:text-text-primary hover:bg-surface-2',
  outline:
    'bg-transparent border border-border text-text-primary hover:border-border-active hover:bg-surface-1',
}

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'px-3.5 py-1.5 text-sm rounded-lg',
  md: 'px-4 py-2 text-sm rounded-lg',
  lg: 'px-6 py-3 text-base rounded-xl',
}

export default function Button({
  variant = 'primary',
  size = 'md',
  className,
  children,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <motion.button
      whileTap={{ scale: disabled ? 1 : 0.97 }}
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      className={cn(
        'inline-flex items-center justify-center gap-2 cursor-pointer select-none',
        'transition-colors duration-150 font-medium',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      disabled={disabled}
      {...(props as object)}
    >
      {children}
    </motion.button>
  )
}
