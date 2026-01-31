import { cn } from '@/lib/utils'

interface LogoProps {
  className?: string
  showText?: boolean
}

export function Logo({ className, showText = true }: LogoProps) {
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <svg
        viewBox="0 0 40 40"
        fill="none"
        className="h-8 w-8 flex-shrink-0"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="logoGradBack" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ec4899" />
            <stop offset="50%" stopColor="#a855f7" />
            <stop offset="100%" stopColor="#7c3aed" />
          </linearGradient>
          <linearGradient id="logoGradFront" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#f472b6" />
            <stop offset="40%" stopColor="#ec4899" />
            <stop offset="100%" stopColor="#db2777" />
          </linearGradient>
          <linearGradient id="logoGradShadow" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#9333ea" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#7c3aed" stopOpacity="0.2" />
          </linearGradient>
        </defs>
        <path d="M8 5 L23 20 L8 35 L13 35 L28 20 L13 5 Z" fill="url(#logoGradBack)" />
        <path d="M10 7 L22 20 L10 33 L13 33 L25 20 L13 7 Z" fill="url(#logoGradShadow)" />
        <path d="M5 8 L20 23 L5 38 L10 38 L25 23 L10 8 Z" fill="url(#logoGradFront)" />
      </svg>
      {showText && (
        <span className="text-xl font-bold bg-gradient-to-r from-pink-500 to-violet-500 bg-clip-text text-transparent">
          BlastMail
        </span>
      )}
    </div>
  )
}

export function LogoIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 40 40"
      fill="none"
      className={cn('h-8 w-8', className)}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="iconGradBack" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ec4899" />
          <stop offset="50%" stopColor="#a855f7" />
          <stop offset="100%" stopColor="#7c3aed" />
        </linearGradient>
        <linearGradient id="iconGradFront" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#f472b6" />
          <stop offset="40%" stopColor="#ec4899" />
          <stop offset="100%" stopColor="#db2777" />
        </linearGradient>
        <linearGradient id="iconGradShadow" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#9333ea" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#7c3aed" stopOpacity="0.2" />
        </linearGradient>
      </defs>
      <path d="M8 5 L23 20 L8 35 L13 35 L28 20 L13 5 Z" fill="url(#iconGradBack)" />
      <path d="M10 7 L22 20 L10 33 L13 33 L25 20 L13 7 Z" fill="url(#iconGradShadow)" />
      <path d="M5 8 L20 23 L5 38 L10 38 L25 23 L10 8 Z" fill="url(#iconGradFront)" />
    </svg>
  )
}
