'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, useSpring, useTransform, animate } from 'framer-motion'

interface AnimatedCounterProps {
  value: number
  duration?: number
  className?: string
  style?: React.CSSProperties
}

export function AnimatedCounter({ value, duration = 1.2, className, style }: AnimatedCounterProps) {
  const [displayValue, setDisplayValue] = useState(0)
  const prevValue = useRef(0)

  useEffect(() => {
    const controls = animate(prevValue.current, value, {
      duration,
      ease: [0.25, 0.1, 0.25, 1],
      onUpdate(latest) {
        setDisplayValue(Math.round(latest))
      },
    })
    prevValue.current = value
    return () => controls.stop()
  }, [value, duration])

  return (
    <span className={className} style={style}>
      {displayValue.toLocaleString()}
    </span>
  )
}

/** Animated counter for floating-point values */
export function AnimatedFloat({
  value,
  duration = 1.0,
  decimals = 1,
  className,
  style,
}: {
  value: number
  duration?: number
  decimals?: number
  className?: string
  style?: React.CSSProperties
}) {
  const [displayValue, setDisplayValue] = useState(0)
  const prevValue = useRef(0)

  useEffect(() => {
    const controls = animate(prevValue.current, value, {
      duration,
      ease: [0.25, 0.1, 0.25, 1],
      onUpdate(latest) {
        setDisplayValue(latest)
      },
    })
    prevValue.current = value
    return () => controls.stop()
  }, [value, duration])

  return (
    <span className={className} style={style}>
      {displayValue.toFixed(decimals)}
    </span>
  )
}
