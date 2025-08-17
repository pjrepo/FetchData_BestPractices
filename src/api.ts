import type { Todo } from './types'

const BASE = 'https://jsonplaceholder.typicode.com'

export async function fetchTodos(limit = 20): Promise<Todo[]> {
  const res = await fetch(`${BASE}/todos?_limit=${limit}`)
  if (!res.ok) throw new Error(`Failed to fetch todos: ${res.status}`)
  return res.json()
}

export async function addTodo(title: string): Promise<Todo> {
  const res = await fetch(`${BASE}/todos`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, completed: false, userId: 1 })
  })
  if (!res.ok) throw new Error(`Failed to add todo: ${res.status}`)
  return res.json()
}

export async function toggleTodo(id: number, completed: boolean): Promise<Todo> {
  const res = await fetch(`${BASE}/todos/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ completed })
  })
  if (!res.ok) throw new Error(`Failed to toggle todo: ${res.status}`)
  return res.json()
}

export async function deleteTodo(id: number): Promise<{ id: number }> {
  const res = await fetch(`${BASE}/todos/${id}`, { method: 'DELETE' })
  if (!res.ok) throw new Error(`Failed to delete todo: ${res.status}`)
  return { id }
}
