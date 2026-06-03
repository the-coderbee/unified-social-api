import { forwardRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { Spinner } from './Spinner'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
}

const variantMap = {
  primary:
    'bg-accent text-white hover:bg-accent-hover font-medium shadow-sm shadow-black/20',
  secondary:
    'bg-surface-2 text-text-primary hover:bg-surface-3 border border-surface-3',
  ghost:
    'text-text-secondary hover:text-text-primary hover:bg-surface-1',
  danger:
    'bg-error/10 text-error hover:bg-error/20 border border-error/30',
}

const sizeMap = {
  sm: 'h-8 px-3 text-sm rounded-lg gap-1.5',
  md: 'h-9 px-4 text-sm rounded-lg gap-2',
  lg: 'h-10 px-5 text-base rounded-xl gap-2',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      loading = false,
      disabled,
      children,
      className,
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || loading

    return (
      <motion.button
        ref={ref}
        whileTap={isDisabled ? {} : { scale: 0.97 }}
        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
        disabled={isDisabled}
        className={cn(
          'inline-flex items-center justify-center cursor-pointer select-none transition-colors',
          'disabled:opacity-50 disabled:pointer-events-none',
          variantMap[variant],
          sizeMap[size],
          className
        )}
        {...(props as object)}
      >
        <AnimatePresence mode="wait" initial={false}>
          {loading ? (
            <motion.span
              key="spinner"
              initial={{ opacity: 0, filter: 'blur(4px)' }}
              animate={{ opacity: 1, filter: 'blur(0px)' }}
              exit={{ opacity: 0, filter: 'blur(4px)' }}
              transition={{ duration: 0.12 }}
              className="flex items-center gap-2"
            >
              <Spinner size="sm" />
              <span>{children}</span>
            </motion.span>
          ) : (
            <motion.span
              key="content"
              initial={{ opacity: 0, filter: 'blur(4px)' }}
              animate={{ opacity: 1, filter: 'blur(0px)' }}
              exit={{ opacity: 0, filter: 'blur(4px)' }}
              transition={{ duration: 0.12 }}
              className="flex items-center gap-2"
            >
              {children}
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>
    )
  }
)

Button.displayName = 'Button'
