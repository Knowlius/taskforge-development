'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { ChevronDown, Gauge, ListChecks, LogOut, Zap } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { authClient } from '@/lib/auth-client'
import { cn } from '@/lib/utils'

const NAV = [
  { href: '/', label: 'Dashboard & Sprint', icon: Gauge },
  { href: '/tareas', label: 'Gestión de Tareas', icon: ListChecks },
]

export function initials(name: string) {
  return (
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((p) => p[0]?.toUpperCase())
      .join('') || '?'
  )
}

export function AppHeader({ name, email }: { name: string; email: string }) {
  const pathname = usePathname()
  const router = useRouter()

  async function signOut() {
    await authClient.signOut()
    router.push('/sign-in')
    router.refresh()
  }

  return (
    <header className="sticky top-0 z-30 bg-nav text-nav-foreground shadow-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2.5">
          <Image
            src="/logo.png"
            alt=""
            width={36}
            height={36}
            className="size-9 rounded-md object-cover object-top"
          />
          <span className="text-xl font-bold tracking-tight text-white">
            TaskForge
          </span>
        </Link>
        <span className="hidden items-center gap-1 rounded-full border border-sky-400/50 bg-sky-400/10 px-2.5 py-0.5 text-xs font-medium text-sky-300 md:inline-flex">
          <Zap className="size-3" aria-hidden="true" />
          Sprint Personal
        </span>

        <nav aria-label="Principal" className="ml-2 flex h-full items-stretch">
          {NAV.map(({ href, label, icon: Icon }) => {
            const active = pathname === href
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'flex items-center gap-2 px-3 text-sm font-medium transition-colors sm:px-4',
                  active
                    ? 'bg-white/5 text-sky-400'
                    : 'text-slate-300 hover:bg-white/5 hover:text-white',
                )}
              >
                <Icon className="size-4" aria-hidden="true" />
                <span className="hidden sm:inline">{label}</span>
              </Link>
            )
          })}
        </nav>

        <div className="ml-auto">
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm text-slate-200 outline-none hover:bg-white/5 focus-visible:ring-2 focus-visible:ring-sky-400">
              <span className="flex size-7 items-center justify-center rounded-full bg-blue-700 text-[11px] font-bold text-white">
                {initials(name)}
              </span>
              <span className="hidden max-w-40 truncate md:inline">{name}</span>
              <ChevronDown className="size-4 text-slate-400" aria-hidden="true" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuGroup>
                <DropdownMenuLabel className="flex flex-col">
                  <span className="truncate font-semibold text-foreground">
                    {name}
                  </span>
                  <span className="truncate text-xs font-normal text-muted-foreground">
                    {email}
                  </span>
                </DropdownMenuLabel>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={signOut}>
                <LogOut aria-hidden="true" />
                Cerrar sesión
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
