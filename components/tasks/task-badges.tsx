import {
  ArrowDown,
  ArrowUp,
  CheckCircle2,
  CircleDashed,
  Loader,
  Minus,
} from 'lucide-react'
import {
  PRIORITY_LABELS,
  STATUS_LABELS,
  type TaskPriority,
  type TaskStatus,
} from '@/lib/tasks'
import { cn } from '@/lib/utils'

const priorityStyles: Record<TaskPriority, string> = {
  ALTA: 'border-red-200 bg-red-50 text-red-700',
  MEDIA: 'border-amber-200 bg-amber-50 text-amber-700',
  BAJA: 'border-slate-200 bg-slate-50 text-slate-600',
}

const priorityIcons = { ALTA: ArrowUp, MEDIA: Minus, BAJA: ArrowDown }

export function PriorityBadge({ priority }: { priority: TaskPriority }) {
  const Icon = priorityIcons[priority]
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded border px-2 py-0.5 text-xs font-semibold',
        priorityStyles[priority],
      )}
    >
      <Icon className="size-3" aria-hidden="true" />
      {PRIORITY_LABELS[priority]}
    </span>
  )
}

export const statusStyles: Record<TaskStatus, string> = {
  COMPLETADA: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  EN_PROGRESO: 'border-sky-200 bg-sky-50 text-sky-700',
  PENDIENTE: 'border-slate-200 bg-slate-100 text-slate-600',
}

const statusIcons = {
  COMPLETADA: CheckCircle2,
  EN_PROGRESO: Loader,
  PENDIENTE: CircleDashed,
}

export function StatusContent({ status }: { status: TaskStatus }) {
  const Icon = statusIcons[status]
  return (
    <>
      <Icon className="size-3.5" aria-hidden="true" />
      {STATUS_LABELS[status]}
    </>
  )
}
