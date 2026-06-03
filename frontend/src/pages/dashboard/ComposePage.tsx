import { motion } from 'framer-motion'
import { ComposeForm } from '@/features/posts/components/ComposeForm'

export default function ComposePage() {
  return (
    <div className="max-w-2xl">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="mb-7"
      >
        <h1 className="text-2xl font-bold tracking-tight text-text-primary">Compose</h1>
        <p className="text-text-secondary mt-1 text-sm">
          Post to all your connected accounts at once
        </p>
      </motion.div>
      <ComposeForm />
    </div>
  )
}
