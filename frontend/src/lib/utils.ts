import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs))
}

export function getInitials(email: string): string {
  const [local] = email.split('@')
  const parts = local.split(/[._-]/).filter(Boolean)
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase()
  }
  return local.slice(0, 2).toUpperCase()
}

export function truncateEmail(email: string, maxLength = 24): string {
  if (email.length <= maxLength) return email
  const atIndex = email.indexOf('@')
  if (atIndex === -1) return email.slice(0, maxLength) + '…'
  const local = email.slice(0, atIndex)
  const domain = email.slice(atIndex)
  const available = maxLength - domain.length - 1
  if (available <= 0) return email.slice(0, maxLength) + '…'
  return local.slice(0, available) + '…' + domain
}

export function formatDate(iso: string): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(iso))
}
