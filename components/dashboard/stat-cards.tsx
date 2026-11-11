import { CheckCircle2, Hourglass, ListOrdered, Settings2 } from 'lucide-react'
import type { Task } from '@/lib/db/schema'
import { isOverdue } from '@/lib/tasks'
import { cn } from '@/lib/utils'

function pct(n: number, total: number) {
  return total === 0 ? '0%' : `${((n / total) * 100).toFixed(1)}%`
}

export function StatCards({ tasks }: { tasks: Task[] }) {
  const total = tasks.length
  const progress = tasks.filter((t) => t.status === 'EN_PROGRESO').length
  const done = tasks.filter((t) => t.status === 'COMPLETADA').length
  const pending = tasks.filter((t) => t.status === 'PENDIENTE').length
  const overdue = tasks.filter((t) => isOverdue(t.dueDate, t.status)).length

  const cards = [
    {
      label: 'Total de tareas',
      value: total,
      hint: overdue > 0 ? `${overdue} vencida${overdue === 1 ? '' : 's'}` : 'Sin tareas vencidas',
      icon: ListOrdered,
      accent: 'border-t-blue-900',
      hintCls: overdue > 0 ? 'text-red-600' : 'text-blue-700',
    },
    {
      label: 'Total en progreso',
      value: progress,
      hint: `${pct(progress, total)} en ejecución`,
      icon: Settings2,
      accent: 'border-t-sky-500',
      hintCls: 'text-sky-700',
    },
    {
      label: 'Total completadas',
      value: done,
      hint: `${pct(done, total)} del total`,
      icon: CheckCircle2,
      accent: 'border-t-emerald-500',
      hintCls: 'text-emerald-700',
    },
    {
      label: 'Pendientes / Backlog',
      value: pending,
      hint: `${pct(pending, total)} por iniciar`,
      icon: Hourglass,
      accent: 'border-t-slate-500',
      hintCls: 'text-muted-foreground',
    },
  ]

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
      {cards.map(({ label, value, hint, icon: Icon, accent, hintCls }) => (
        <div
          key={label}
          className={cn(
            'relative rounded-lg border border-border border-t-4 bg-card px-5 py-5 shadow-sm',
            accent,
          )}
        >
          <Icon
            className="absolute right-4 top-4 size-8 text-slate-300"
            aria-hidden="true"
          />
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {label}
          </p>
          <p className="mt-2 text-4xl font-bold tabular-nums text-foreground">
            {value}
          </p>
          <p className={cn('mt-3 text-xs font-medium', hintCls)}>{hint}</p>
        </div>
      ))}
    </div>
  )
}
