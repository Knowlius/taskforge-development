import { BarChart3 } from 'lucide-react'
import type { Task } from '@/lib/db/schema'
import { PRIORITIES, PRIORITY_LABELS, type TaskPriority } from '@/lib/tasks'

const dotCls: Record<TaskPriority, string> = {
  ALTA: 'bg-red-600',
  MEDIA: 'bg-amber-500',
  BAJA: 'bg-slate-500',
}

export function PriorityLoad({ tasks }: { tasks: Task[] }) {
  const rows = [...PRIORITIES].reverse().map((p) => {
    const list = tasks.filter((t) => t.priority === p)
    return {
      priority: p,
      total: list.length,
      done: list.filter((t) => t.status === 'COMPLETADA').length,
      progress: list.filter((t) => t.status === 'EN_PROGRESO').length,
      pending: list.filter((t) => t.status === 'PENDIENTE').length,
    }
  })

  return (
    <section className="rounded-lg border border-border bg-card shadow-sm">
      <header className="flex items-center justify-between border-b border-border bg-muted/40 px-5 py-4">
        <h2 className="flex items-center gap-2 font-semibold text-foreground">
          <BarChart3 className="size-4 text-primary" aria-hidden="true" />
          Carga por prioridad
        </h2>
        <div className="hidden items-center gap-3 text-xs text-muted-foreground sm:flex">
          <span className="flex items-center gap-1.5"><span className="size-2 rounded-sm bg-chart-1" aria-hidden="true" />Completadas</span>
          <span className="flex items-center gap-1.5"><span className="size-2 rounded-sm bg-chart-2" aria-hidden="true" />En progreso</span>
          <span className="flex items-center gap-1.5"><span className="size-2 rounded-sm bg-chart-3" aria-hidden="true" />Pendientes</span>
        </div>
      </header>
      <ul className="flex flex-col gap-6 px-5 py-5">
        {rows.map((r) => (
          <li key={r.priority}>
            <div className="mb-2 flex flex-wrap items-center justify-between gap-2 text-sm">
              <span className="flex items-center gap-2 font-medium text-foreground">
                <span className={`size-2.5 rounded-full ${dotCls[r.priority]}`} aria-hidden="true" />
                Prioridad {PRIORITY_LABELS[r.priority]}
              </span>
              <span className="text-muted-foreground">
                {r.total} tareas ({r.done} completadas, {r.progress} en progreso, {r.pending} pendientes)
              </span>
            </div>
            <div
              className="flex h-2 overflow-hidden rounded-full bg-muted"
              role="img"
              aria-label={`Prioridad ${PRIORITY_LABELS[r.priority]}: ${r.done} completadas, ${r.progress} en progreso, ${r.pending} pendientes`}
            >
              {r.total > 0 && (
                <>
                  <span className="bg-chart-1" style={{ width: `${(r.done / r.total) * 100}%` }} />
                  <span className="bg-chart-2" style={{ width: `${(r.progress / r.total) * 100}%` }} />
                  <span className="bg-chart-3" style={{ width: `${(r.pending / r.total) * 100}%` }} />
                </>
              )}
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}
