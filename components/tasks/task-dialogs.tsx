'use client'

import { createContext, useContext, useState, useTransition } from 'react'
import { Loader2, Plus, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { createTask, deleteTask, updateTask } from '@/app/actions/tasks'
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import type { Task } from '@/lib/db/schema'
import {
  PRIORITIES,
  PRIORITY_LABELS,
  STATUSES,
  STATUS_LABELS,
  type TaskPriority,
  type TaskStatus,
  taskCode,
} from '@/lib/tasks'

type Ctx = {
  openCreate: () => void
  openEdit: (task: Task) => void
  openDelete: (task: Task) => void
}

const TaskDialogContext = createContext<Ctx | null>(null)

export function useTaskDialogs() {
  const ctx = useContext(TaskDialogContext)
  if (!ctx) throw new Error('useTaskDialogs must be used within TaskDialogProvider')
  return ctx
}

export const priorityItems = PRIORITIES.map((v) => ({
  value: v,
  label: PRIORITY_LABELS[v],
}))
export const statusItems = STATUSES.map((v) => ({
  value: v,
  label: STATUS_LABELS[v],
}))

export function TaskDialogProvider({ children }: { children: React.ReactNode }) {
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Task | null>(null)
  const [formKey, setFormKey] = useState(0)
  const [toDelete, setToDelete] = useState<Task | null>(null)
  const [deleting, startDelete] = useTransition()

  const ctx: Ctx = {
    openCreate: () => {
      setEditing(null)
      setFormKey((k) => k + 1)
      setFormOpen(true)
    },
    openEdit: (task) => {
      setEditing(task)
      setFormKey((k) => k + 1)
      setFormOpen(true)
    },
    openDelete: (task) => setToDelete(task),
  }

  function confirmDelete() {
    if (!toDelete) return
    const task = toDelete
    startDelete(async () => {
      const res = await deleteTask(task.id)
      if (res.ok) toast.success(`Tarea ${taskCode(task.id)} eliminada`)
      else toast.error(res.error)
      setToDelete(null)
    })
  }

  return (
    <TaskDialogContext.Provider value={ctx}>
      {children}

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="sm:max-w-lg">
          <TaskForm
            key={formKey}
            task={editing}
            onDone={() => setFormOpen(false)}
          />
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={toDelete !== null}
        onOpenChange={(open) => !open && setToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar esta tarea?</AlertDialogTitle>
            <AlertDialogDescription>
              {toDelete
                ? `"${toDelete.title}" (${taskCode(toDelete.id)}) se eliminará de forma permanente.`
                : ''}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancelar</AlertDialogCancel>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={deleting}
            >
              {deleting ? (
                <Loader2 className="animate-spin" aria-hidden="true" />
              ) : (
                <Trash2 aria-hidden="true" />
              )}
              Eliminar
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </TaskDialogContext.Provider>
  )
}

function TaskForm({ task, onDone }: { task: Task | null; onDone: () => void }) {
  const [priority, setPriority] = useState<TaskPriority>(task?.priority ?? 'MEDIA')
  const [status, setStatus] = useState<TaskStatus>(task?.status ?? 'PENDIENTE')
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = new FormData(e.currentTarget)
    const input = {
      title: String(form.get('title') ?? ''),
      description: String(form.get('description') ?? ''),
      dueDate: String(form.get('dueDate') ?? '') || null,
      priority,
      status,
    }
    setError(null)
    startTransition(async () => {
      const res = task ? await updateTask(task.id, input) : await createTask(input)
      if (!res.ok) {
        setError(res.error)
        return
      }
      toast.success(task ? 'Tarea actualizada' : 'Tarea creada')
      onDone()
    })
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-5">
      <DialogHeader>
        <DialogTitle>
          {task ? `Editar tarea ${taskCode(task.id)}` : 'Nueva tarea'}
        </DialogTitle>
        <DialogDescription>
          {task
            ? 'Actualiza los campos y guarda los cambios.'
            : 'Define el entregable, su prioridad y fecha límite.'}
        </DialogDescription>
      </DialogHeader>

      <div className="flex flex-col gap-2">
        <Label htmlFor="title">Título</Label>
        <Input
          id="title"
          name="title"
          required
          maxLength={200}
          defaultValue={task?.title}
          placeholder="Ej. Implementar middleware de autenticación"
          autoFocus
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="description">
          Descripción <span className="font-normal text-muted-foreground">(opcional)</span>
        </Label>
        <Textarea
          id="description"
          name="description"
          maxLength={2000}
          rows={3}
          defaultValue={task?.description ?? ''}
          placeholder="Detalles, criterios de aceptación…"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="flex flex-col gap-2">
          <Label id="priority-label">Prioridad</Label>
          <Select
            items={priorityItems}
            value={priority}
            onValueChange={(v) => v && setPriority(v as TaskPriority)}
          >
            <SelectTrigger aria-labelledby="priority-label" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {priorityItems.map((i) => (
                <SelectItem key={i.value} value={i.value}>
                  {i.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col gap-2">
          <Label id="status-label">Estado</Label>
          <Select
            items={statusItems}
            value={status}
            onValueChange={(v) => v && setStatus(v as TaskStatus)}
          >
            <SelectTrigger aria-labelledby="status-label" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {statusItems.map((i) => (
                <SelectItem key={i.value} value={i.value}>
                  {i.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="dueDate">Fecha límite</Label>
          <Input
            id="dueDate"
            name="dueDate"
            type="date"
            defaultValue={task?.dueDate ?? ''}
          />
        </div>
      </div>

      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onDone} disabled={pending}>
          Cancelar
        </Button>
        <Button type="submit" disabled={pending}>
          {pending && <Loader2 className="animate-spin" aria-hidden="true" />}
          {task ? 'Guardar cambios' : 'Crear tarea'}
        </Button>
      </DialogFooter>
    </form>
  )
}

export function NewTaskButton({ label = 'Nueva Tarea' }: { label?: string }) {
  const { openCreate } = useTaskDialogs()
  return (
    <Button size="lg" onClick={openCreate} className="h-10 px-4">
      <Plus aria-hidden="true" />
      {label}
    </Button>
  )
}
