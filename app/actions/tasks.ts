'use server'

import { and, desc, eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { headers } from 'next/headers'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { tasks } from '@/lib/db/schema'
import {
  PRIORITIES,
  STATUSES,
  type TaskInput,
  type TaskPriority,
  type TaskStatus,
} from '@/lib/tasks'

type ActionResult = { ok: true } | { ok: false; error: string }

async function getUserId() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) throw new Error('Unauthorized')
  return session.user.id
}

function parseInput(input: TaskInput) {
  const title = String(input.title ?? '').trim()
  const description = String(input.description ?? '').trim()
  const dueDate = input.dueDate ? String(input.dueDate) : null

  if (!title) return { error: 'El título es obligatorio.' } as const
  if (title.length > 200)
    return { error: 'El título no puede superar 200 caracteres.' } as const
  if (description.length > 2000)
    return {
      error: 'La descripción no puede superar 2000 caracteres.',
    } as const
  if (!PRIORITIES.includes(input.priority as TaskPriority))
    return { error: 'Prioridad inválida.' } as const
  if (!STATUSES.includes(input.status as TaskStatus))
    return { error: 'Estado inválido.' } as const
  if (dueDate && !/^\d{4}-\d{2}-\d{2}$/.test(dueDate))
    return { error: 'Fecha límite inválida.' } as const

  return {
    data: {
      title,
      description: description || null,
      priority: input.priority,
      status: input.status,
      dueDate,
    },
  } as const
}

function revalidate() {
  revalidatePath('/')
  revalidatePath('/tareas')
}

export async function getTasks() {
  const userId = await getUserId()
  return db
    .select()
    .from(tasks)
    .where(eq(tasks.userId, userId))
    .orderBy(desc(tasks.createdAt))
}

export async function createTask(input: TaskInput): Promise<ActionResult> {
  const userId = await getUserId()
  const parsed = parseInput(input)
  if ('error' in parsed) return { ok: false, error: parsed.error! }
  await db.insert(tasks).values({ ...parsed.data, userId })
  revalidate()
  return { ok: true }
}

export async function updateTask(
  id: number,
  input: TaskInput,
): Promise<ActionResult> {
  const userId = await getUserId()
  const parsed = parseInput(input)
  if ('error' in parsed) return { ok: false, error: parsed.error! }
  await db
    .update(tasks)
    .set({ ...parsed.data, updatedAt: new Date() })
    .where(and(eq(tasks.id, id), eq(tasks.userId, userId)))
  revalidate()
  return { ok: true }
}

export async function setTaskStatus(
  id: number,
  status: TaskStatus,
): Promise<ActionResult> {
  const userId = await getUserId()
  if (!STATUSES.includes(status)) return { ok: false, error: 'Estado inválido.' }
  await db
    .update(tasks)
    .set({ status, updatedAt: new Date() })
    .where(and(eq(tasks.id, id), eq(tasks.userId, userId)))
  revalidate()
  return { ok: true }
}

export async function deleteTask(id: number): Promise<ActionResult> {
  const userId = await getUserId()
  await db.delete(tasks).where(and(eq(tasks.id, id), eq(tasks.userId, userId)))
  revalidate()
  return { ok: true }
}
