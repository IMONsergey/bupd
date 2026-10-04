'use client'

// Adapted from Motion Primitives' TransitionPanel (MIT, Ibelick).
// https://github.com/ibelick/motion-primitives/blob/main/components/core/transition-panel.tsx
import React from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'

export function TransitionPanel({ children, activeKey, className }: {
  children: React.ReactNode
  activeKey: string
  className?: string
}) {
  const reduced = useReducedMotion()
  return <div className={className}>
    <AnimatePresence initial={false} mode="wait">
      <motion.div key={activeKey}
        initial={{ opacity: 0, y: reduced ? 0 : 5 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: reduced ? 0 : -3 }}
        transition={{ duration: reduced ? 0 : .14 }}>
        {children}
      </motion.div>
    </AnimatePresence>
  </div>
}
