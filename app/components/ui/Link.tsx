'use client'

import NextLink from 'next/link'
import { ReactNode } from 'react'

interface LinkProps {
  href: string
  children: ReactNode
  className?: string
  tabIndex?: number
}

export default function Link({ href, children, className, tabIndex }: LinkProps) {
  // Check if it's an anchor link
  if (href.startsWith('#')) {
    return (
      <a
        href={href}
        className={className}
        tabIndex={tabIndex}
        onClick={(e) => {
          e.preventDefault()
          const element = document.querySelector(href)
          if (element) {
            element.scrollIntoView({ behavior: 'smooth' })
          }
        }}
      >
        {children}
      </a>
    )
  }

  return (
    <NextLink href={href} className={className} tabIndex={tabIndex}>
      {children}
    </NextLink>
  )
}
