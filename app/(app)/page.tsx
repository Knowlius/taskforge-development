import Link from 'next/link'
import { List, SquarePen } from 'lucide-react'
import { getTasks } from '@/app/actions/tasks'
import { PageHeader } from '@/components/page-header'
import { PriorityLoad } from '@/components/dashboard/priority-load'
import { StatCards } from '@/components/dashboard/stat-cards'
import { StatusDonut } from '@/components/dashboard/status-donut'
import { NewTaskButton, TaskDialogProvider } from '@/components/tasks/task-dialogs'
import { TaskTable } from '@/components/tasks/task-table'

export default async function DashboardPage() {
  const tasks = await getTasks()
  const counts = {
    COMPLETADA: tasks.filter((t) => t.status === 'COMPLETADA').length,
    EN_PROGRESO: tasks.filter((t) => t.status === 'EN_PROGRESO').length,
    PENDIENTE: tasks.filter((t) => t.status === 'PENDIENTE').length,
  }
  const upcoming = tasks
    .filter((t) => t.status !== 'COMPLETADA')
    .sort((a, b) => (a.dueDate ?? '9999').localeCompare(b.dueDate ?? '9999'))
    .slice(0, 5)

  return (
    <TaskDialogProvider>
      <div className="flex flex-col gap-6">
        <PageHeader
          title="Sprint Personal — Visión General"
          description="Supervisión de entregables, distribución de estados y seguimiento de tus fechas límite."
        >
          <NewTaskButton />
        </PageHeader>

        <StatCards tasks={tasks} />

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[2fr_3fr]">
          <StatusDonut counts={counts} />
          <PriorityLoad tasks={tasks} />
        </div>

        <section className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-muted/40 px-6 py-4">
            <h2 className="flex items-center gap-2 font-semibold text-foreground">
              <List className="size-4 text-primary" aria-hidden="true" />
              Próximas tareas clave
            </h2>
            <Link
              href="/tareas"
              className="inline-flex h-9 items-center gap-1.5 rounded-md bg-primary px-3.5 text-sm font-medium text-primary-foreground transition hover:bg-primary/90"
            >
              <SquarePen className="size-4" aria-hidden="true" />
              Abrir administrador completo
            </Link>
          </div>
          <TaskTable
            tasks={upcoming}
            showDescription={false}
            emptyMessage={
              tasks.length === 0
                ? 'Aún no tienes tareas. Crea la primera para comenzar tu sprint.'
                : '¡Todo completado! No hay tareas activas.'
            }
          />
        </section>
      </div>
    </TaskDialogProvider>
  )
}
