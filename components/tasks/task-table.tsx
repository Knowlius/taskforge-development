'use client'

import { useOptimistic, useTransition } from 'react'
import { AlertTriangle, CalendarDays, Pencil, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { setTaskStatus } from '@/app/actions/tasks'
import type { Task } from '@/lib/db/schema'
import {
  STATUS_LABELS,
  type TaskStatus,
  formatDueDate,
  isOverdue,
  taskCode,
} from '@/lib/tasks'
import { cn } from '@/lib/utils'
import { PriorityBadge, StatusContent, statusStyles } from './task-badges'
import { useTaskDialogs } from './task-dialogs'

const NEXT_STATUS: Record<TaskStatus, TaskStatus> = {
  PENDIENTE: 'COMPLETADA',
  EN_PROGRESO: 'COMPLETADA',
  COMPLETADA: 'PENDIENTE',
}

export function TaskTable({
  tasks,
  showDescription = true,
  emptyMessage = 'No hay tareas que coincidan.',
}: {
  tasks: Task[]
  showDescription?: boolean
  emptyMessage?: string
}) {
  const [optimisticTasks, applyStatus] = useOptimistic(
    tasks,
    (state, { id, status }: { id: number; status: TaskStatus }) =>
      state.map((t) => (t.id === id ? { ...t, status } : t)),
  )
  const [, startTransition] = useTransition()
  const { openEdit, openDelete } = useTaskDialogs()

  function toggle(task: Task) {
    const status = NEXT_STATUS[task.status]
    startTransition(async () => {
      applyStatus({ id: task.id, status })
      const res = await setTaskStatus(task.id, status)
      if (!res.ok) toast.error(res.error)
    })
  }

  if (optimisticTasks.length === 0) {
    return (
      <p className="px-6 py-14 text-center text-sm text-muted-foreground">
        {emptyMessage}
      </p>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[820px] text-sm">
        <thead>
          <tr className="border-b-2 border-border text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            <th scope="col" className="px-6 py-3.5">ID</th>
            <th scope="col" className="px-4 py-3.5">Título{showDescription && ' y descripción'}</th>
            <th scope="col" className="px-4 py-3.5">Prioridad</th>
            <th scope="col" className="px-4 py-3.5">Estado</th>
            <th scope="col" className="px-4 py-3.5">Fecha límite</th>
            <th scope="col" className="px-6 py-3.5 text-right">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {optimisticTasks.map((task) => {
            const overdue = isOverdue(task.dueDate, task.status)
            const done = task.status === 'COMPLETADA'
            return (
              <tr key={task.id} className="transition-colors hover:bg-muted/50">
                <td className="px-6 py-4 align-middle">
                  <span className="rounded bg-sky-50 px-1.5 py-0.5 font-mono text-xs font-medium text-sky-700">
                    {taskCode(task.id)}
                  </span>
                </td>
                <td className="max-w-md px-4 py-4">
                  <p
                    className={cn(
                      'font-semibold text-foreground text-pretty',
                      done && 'text-muted-foreground line-through',
                    )}
                  >
                    {task.title}
                  </p>
                  {showDescription && task.description && (
                    <p className="mt-0.5 line-clamp-2 text-[13px] text-muted-foreground">
                      {task.description}
                    </p>
                  )}
                </td>
                <td className="px-4 py-4">
                  <PriorityBadge priority={task.priority} />
                </td>
                <td className="px-4 py-4">
                  <button
                    type="button"
                    onClick={() => toggle(task)}
                    title={
                      done
                        ? 'Marcar como pendiente'
                        : 'Marcar como completada'
                    }
                    aria-label={`Estado: ${STATUS_LABELS[task.status]}. ${done ? 'Marcar como pendiente' : 'Marcar como completada'}`}
                    className={cn(
                      'inline-flex items-center gap-1 rounded border px-2 py-0.5 text-xs font-semibold transition hover:brightness-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                      statusStyles[task.status],
                    )}
                  >
                    <StatusContent status={task.status} />
                  </button>
                </td>
                <td className="px-4 py-4">
                  <span
                    className={cn(
                      'inline-flex items-center gap-1.5 whitespace-nowrap',
                      overdue ? 'font-medium text-red-600' : 'text-muted-foreground',
                    )}
                  >
                    {overdue ? (
                      <AlertTriangle className="size-3.5" aria-hidden="true" />
                    ) : (
                      <CalendarDays className="size-3.5" aria-hidden="true" />
                    )}
                    {formatDueDate(task.dueDate)}
                    {overdue && <span className="sr-only">(vencida)</span>}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex justify-end gap-1.5">
                    <button
                      type="button"
                      onClick={() => openEdit(task)}
                      aria-label={`Editar ${taskCode(task.id)}`}
                      className="flex size-7 items-center justify-center rounded border border-border bg-card text-blue-700 transition hover:bg-blue-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <Pencil className="size-3.5" aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      onClick={() => openDelete(task)}
                      aria-label={`Eliminar ${taskCode(task.id)}`}
                      className="flex size-7 items-center justify-center rounded border border-border bg-card text-red-600 transition hover:bg-red-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <Trash2 className="size-3.5" aria-hidden="true" />
                    </button>
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
