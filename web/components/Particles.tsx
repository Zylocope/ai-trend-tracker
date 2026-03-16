'use client'

import { useEffect } from 'react'

export default function Particles() {
  useEffect(() => {
    const container = document.getElementById('particles')
    if (!container || container.children.length > 0) return

    for (let i = 0; i < 22; i++) {
      const p = document.createElement('div')
      p.className = 'particle'
      p.style.left = Math.random() * 100 + '%'
      p.style.animationDelay = Math.random() * 15 + 's'
      p.style.animationDuration = (15 + Math.random() * 10) + 's'
      p.style.background = Math.random() > 0.5 ? 'var(--accent-gold)' : 'var(--accent-teal)'
      container.appendChild(p)
    }
  }, [])

  return <div id="particles" className="fixed inset-0 pointer-events-none z-0 overflow-hidden" />
}
