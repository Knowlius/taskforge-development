'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import {
  ArrowRight,
  KeyRound,
  Loader2,
  Lock,
  LogIn,
  Mail,
  ShieldCheck,
  User,
  UserPlus,
} from 'lucide-react'
import { authClient } from '@/lib/auth-client'

type Mode = 'sign-in' | 'sign-up'

const inputWrap =
  'flex items-stretch overflow-hidden rounded-md border border-white/10 bg-[#1b2434] focus-within:border-sky-400/60 focus-within:ring-2 focus-within:ring-sky-400/20'
const iconCell =
  'flex w-11 shrink-0 items-center justify-center border-r border-white/10 bg-white/[0.03] text-slate-400'
const fieldInput =
  'w-full bg-transparent px-3.5 py-3 text-[15px] text-slate-100 placeholder:text-slate-500 outline-none'
const labelCls =
  'mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-400'

export function AuthForm({ mode }: { mode: Mode }) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)
  const isSignUp = mode === 'sign-up'

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setPending(true)
    const form = new FormData(e.currentTarget)
    const email = String(form.get('email') ?? '').trim()
    const password = String(form.get('password') ?? '')

    const result = isSignUp
      ? await authClient.signUp.email({
          email,
          password,
          name: String(form.get('name') ?? '').trim(),
        })
      : await authClient.signIn.email({
          email,
          password,
          rememberMe: form.get('remember') === 'on',
        })

    if (result.error) {
      console.error('[auth]', result.error)
      setError(
        isSignUp
          ? 'No se pudo crear la cuenta. Revisa los datos e inténtalo de nuevo.'
          : 'Credenciales inválidas. Verifica tu correo y contraseña.',
      )
      setPending(false)
      return
    }
    router.push('/')
    router.refresh()
  }

  return (
    <main className="flex min-h-svh flex-col items-center justify-center bg-[radial-gradient(ellipse_at_top_right,#1e293b_0%,#0f172a_45%,#0a0f1c_100%)] px-4 py-10">
      <div className="w-full max-w-[410px] rounded-xl border border-white/15 bg-[#111a2b]/90 p-8 shadow-2xl shadow-black/40 backdrop-blur">
        <div className="flex flex-col items-center text-center">
          <Image
            src="/logo.png"
            alt="TaskForge"
            width={96}
            height={96}
            className="mb-2 h-20 w-auto rounded-md"
            priority
          />
          <h1 className="text-2xl font-bold tracking-tight text-white">
            TASK<span className="font-medium text-sky-400">FORGE</span>
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Gestor de Tareas y Sprints Personales
          </p>
          <span className="mt-3 inline-flex items-center gap-1 rounded-full border border-sky-500/40 bg-sky-500/10 px-3 py-1 text-xs font-medium text-sky-300">
            <ShieldCheck className="size-3.5" aria-hidden="true" />
            Sesión segura con cookies HTTP-only
          </span>
        </div>

        <form onSubmit={onSubmit} className="mt-8 flex flex-col gap-5">
          {isSignUp && (
            <div>
              <label htmlFor="name" className={labelCls}>
                <User className="size-3.5" aria-hidden="true" />
                Nombre completo
              </label>
              <div className={inputWrap}>
                <span className={iconCell} aria-hidden="true">
                  <User className="size-4" />
                </span>
                <input
                  id="name"
                  name="name"
                  required
                  autoComplete="name"
                  placeholder="Alex Rivera"
                  className={fieldInput}
                />
              </div>
            </div>
          )}

          <div>
            <label htmlFor="email" className={labelCls}>
              <Mail className="size-3.5" aria-hidden="true" />
              Correo electrónico
            </label>
            <div className={inputWrap}>
              <span className={iconCell} aria-hidden="true">
                <User className="size-4" />
              </span>
              <input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="email"
                placeholder="tu@correo.com"
                className={fieldInput}
              />
            </div>
          </div>

          <div>
            <label htmlFor="password" className={labelCls}>
              <Lock className="size-3.5" aria-hidden="true" />
              Contraseña de acceso
            </label>
            <div className={inputWrap}>
              <span className={iconCell} aria-hidden="true">
                <KeyRound className="size-4" />
              </span>
              <input
                id="password"
                name="password"
                type="password"
                required
                minLength={8}
                autoComplete={isSignUp ? 'new-password' : 'current-password'}
                placeholder="Mínimo 8 caracteres"
                className={fieldInput}
              />
            </div>
          </div>

          {!isSignUp && (
            <label className="flex cursor-pointer items-center gap-2.5 text-sm font-medium text-slate-300">
              <input
                type="checkbox"
                name="remember"
                defaultChecked
                className="size-4 accent-blue-500"
              />
              Mantener sesión activa
            </label>
          )}

          {error && (
            <p
              role="alert"
              className="rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300"
            >
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={pending}
            className="mt-1 inline-flex items-center justify-center gap-2 rounded-md border border-sky-400/40 bg-gradient-to-r from-blue-800 to-sky-600 px-4 py-3 text-[15px] font-semibold text-white shadow-lg shadow-sky-500/20 transition hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 disabled:opacity-60"
          >
            {pending ? (
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            ) : isSignUp ? (
              <UserPlus className="size-4" aria-hidden="true" />
            ) : (
              <LogIn className="size-4" aria-hidden="true" />
            )}
            {isSignUp ? 'Crear cuenta' : 'Iniciar Sesión en Workspace'}
          </button>
        </form>

        <div className="mt-6 border-t border-white/10 pt-5 text-center text-sm text-slate-400">
          {isSignUp ? '¿Ya tienes cuenta?' : '¿Aún no tienes cuenta?'}
          <Link
            href={isSignUp ? '/sign-in' : '/sign-up'}
            className="mt-1.5 flex items-center justify-center gap-1.5 font-medium text-sky-400 hover:text-sky-300"
          >
            <ArrowRight className="size-4" aria-hidden="true" />
            {isSignUp ? 'Iniciar sesión' : 'Crear una cuenta gratuita'}
          </Link>
        </div>
      </div>
      <p className="mt-5 flex items-center gap-1.5 text-xs text-slate-500">
        <Lock className="size-3" aria-hidden="true" />
        Contraseñas cifradas con hash seguro • TaskForge
      </p>
    </main>
  )
}
