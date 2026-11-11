export const PRIORITIES = ['BAJA', 'MEDIA', 'ALTA'] as const
export const STATUSES = ['PENDIENTE', 'EN_PROGRESO', 'COMPLETADA'] as const

export type TaskPriority = (typeof PRIORITIES)[number]
export type TaskStatus = (typeof STATUSES)[number]

export type TaskInput = {
  title: string
  description?: string | null
  priority: TaskPriority
  status: TaskStatus
  dueDate?: string | null
}

export const PRIORITY_LABELS: Record<TaskPriority, string> = {
  BAJA: 'Baja',
  MEDIA: 'Media',
  ALTA: 'Alta',
}

export const STATUS_LABELS: Record<TaskStatus, string> = {
  PENDIENTE: 'Pendiente',
  EN_PROGRESO: 'En Progreso',
  COMPLETADA: 'Completada',
}

export function taskCode(id: number) {
  return `TF-${String(id).padStart(3, '0')}`
}

const dateFormatter = new Intl.DateTimeFormat('es-ES', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
  timeZone: 'UTC',
})

export function formatDueDate(dueDate: string | null) {
  if (!dueDate) return 'Sin fecha'
  return dateFormatter.format(new Date(`${dueDate}T00:00:00Z`))
}

export function isOverdue(dueDate: string | null, status: TaskStatus) {
  if (!dueDate || status === 'COMPLETADA') return false
  const today = new Date().toISOString().slice(0, 10)
  return dueDate < today
}
