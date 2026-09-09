import { cn } from '../ui'

type LogoVariant = 'dark' | 'light' | 'white'

const SRC: Record<LogoVariant, { src: string; filter?: string }> = {
  dark: { src: '/images/logo.png' },
  light: { src: '/images/logo-light.png' },
  white: { src: '/images/logo.png', filter: 'brightness-0 invert' },
}

export function Logo({ variant = 'dark', className }: { variant?: LogoVariant; className?: string }) {
  const { src, filter } = SRC[variant]
  return (
    <img
      src={src}
      alt="Шохин Тур"
      width={2560}
      height={957}
      className={cn('h-9 w-auto object-contain md:h-11', filter, className)}
    />
  )
}