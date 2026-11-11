'use client'

import { useMemo, useState } from 'react'
import { Filter, List, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { Task } from '@/lib/db/schema'
import { taskCode } from '@/lib/tasks'
import { cn } from '@/lib/utils'
import { priorityItems, statusItems } from './task-dialogs'
import { TaskTable } from './task-table'

const ALL = 'ALL'
const statusFilterItems = [{ value: ALL, label: 'Estado: Todos' }, ...statusItems]
const priorityFilterItems = [
  { value: ALL, label: 'Prioridad: Todas' },
  ...priorityItems,
]

const VIEWS = [
  { value: 'all', label: 'Todas' },
  { value: 'active', label: 'Activas' },
  { value: 'done', label: 'Completadas' },
] as const
type View = (typeof VIEWS)[number]['value']

export function TaskManager({ tasks }: { tasks: Task[] }) {
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState<string>(ALL)
  const [priority, setPriority] = useState<string>(ALL)
  const [view, setView] = useState<View>('all')

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return tasks.filter((t) => {
      if (status !== ALL && t.status !== status) return false
      if (priority !== ALL && t.priority !== priority) return false
      if (view === 'active' && t.status === 'COMPLETADA') return false
      if (view === 'done' && t.status !== 'COMPLETADA') return false
      if (!q) return true
      return (
        t.title.toLowerCase().includes(q) ||
        (t.description ?? '').toLowerCase().includes(q) ||
        taskCode(t.id).toLowerCase().includes(q)
      )
    })
  }, [tasks, query, status, priority, view])

  const hasFilters =
    query !== '' || status !== ALL || priority !== ALL || view !== 'all'

  function clear() {
    setQuery('')
    setStatus(ALL)
    setPriority(ALL)
    setView('all')
  }

  return (
    <div className="flex flex-col gap-6">
      <section
        aria-label="Filtros"
        className="grid grid-cols-1 gap-3 rounded-lg border border-border bg-card p-4 shadow-sm md:grid-cols-[1.4fr_1fr_1fr_auto] md:gap-5 md:p-5"
      >
        <div className="flex items-stretch overflow-hidden rounded-md border border-input focus-within:ring-3 focus-within:ring-ring/50">
          <span className="flex w-10 items-center justify-center border-r border-input bg-muted text-muted-foreground">
            <Search className="size-4" aria-hidden="true" />
          </span>
          <Input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por título o código TF-…"
            aria-label="Buscar tareas"
            className="h-10 rounded-none border-0 focus-visible:ring-0"
          />
        </div>
        <Select
          items={statusFilterItems}
          value={status}
          onValueChange={(v) => setStatus(v ?? ALL)}
        >
          <SelectTrigger aria-label="Filtrar por estado" className="h-10! w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {statusFilterItems.map((i) => (
              <SelectItem key={i.value} value={i.value}>
                {i.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          items={priorityFilterItems}
          value={priority}
          onValueChange={(v) => setPriority(v ?? ALL)}
        >
          <SelectTrigger aria-label="Filtrar por prioridad" className="h-10! w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {priorityFilterItems.map((i) => (
              <SelectItem key={i.value} value={i.value}>
                {i.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          variant="outline"
          onClick={clear}
          disabled={!hasFilters}
          className="h-10 px-4"
        >
          <Filter aria-hidden="true" />
          Limpiar filtros
        </Button>
      </section>

      <section className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-muted/40 px-6 py-4">
          <h2 className="flex items-center gap-2 font-semibold text-foreground">
            <List className="size-4 text-primary" aria-hidden="true" />
            Tareas registradas ({filtered.length})
          </h2>
          <div
            role="group"
            aria-label="Vista rápida"
            className="flex overflow-hidden rounded border border-border text-xs"
          >
            {VIEWS.map((v) => (
              <button
                key={v.value}
                type="button"
                onClick={() => setView(v.value)}
                aria-pressed={view === v.value}
                className={cn(
                  'border-r border-border px-2.5 py-1 last:border-r-0 transition-colors',
                  view === v.value
                    ? 'bg-secondary font-semibold text-foreground'
                    : 'bg-card text-muted-foreground hover:bg-muted',
                )}
              >
                {v.label}
              </button>
            ))}
          </div>
        </div>
        <TaskTable
          tasks={filtered}
          emptyMessage={
            tasks.length === 0
              ? 'Aún no tienes tareas. Crea la primera para comenzar tu sprint.'
              : 'Ninguna tarea coincide con los filtros aplicados.'
          }
        />
      </section>
    </div>
  )
}
