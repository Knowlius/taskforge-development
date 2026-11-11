import { getTasks } from '@/app/actions/tasks'
import { PageHeader } from '@/components/page-header'
import { NewTaskButton, TaskDialogProvider } from '@/components/tasks/task-dialogs'
import { TaskManager } from '@/components/tasks/task-manager'

export const metadata = { title: 'Gestión de Tareas — TaskForge' }

export default async function TasksPage() {
  const tasks = await getTasks()
  return (
    <TaskDialogProvider>
      <div className="flex flex-col gap-6">
        <PageHeader
          title="Administrador de Tareas"
          description="Crea, edita, filtra y monitorea estados y plazos de entrega."
        >
          <NewTaskButton label="Crear Nueva Tarea" />
        </PageHeader>
        <TaskManager tasks={tasks} />
      </div>
    </TaskDialogProvider>
  )
}
