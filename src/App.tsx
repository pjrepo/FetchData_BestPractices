import { useMemo } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { addTodo, deleteTodo, fetchTodos, toggleTodo } from './api'
import type { Todo } from './types'
import TodoForm from './components/TodoForm'
import TodoItem from './components/TodoItem'

export default function App() {
  const qc = useQueryClient()

  // READ: fetch todo list — no useEffect anywhere
  const { data, isPending, isError, error } = useQuery({
    queryKey: ['todos'],
    queryFn: () => fetchTodos(20)
  })

  const todos = data ?? []

  // WRITE: add todo with optimistic update
  const addMutation = useMutation({
    mutationFn: addTodo,
    // Optimistic update
    onMutate: async (title: string) => {
      await qc.cancelQueries({ queryKey: ['todos'] })
      const prev = qc.getQueryData<Todo[]>(['todos']) ?? []
      const optimistic: Todo = {
        id: -Math.floor(Math.random() * 1_000_000), // temp negative id
        title,
        completed: false,
        userId: 1
      }
      qc.setQueryData<Todo[]>(['todos'], [...prev, optimistic])
      return { prev, optimisticId: optimistic.id }
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) qc.setQueryData<Todo[]>(['todos'], ctx.prev)
    },
    onSuccess: (created, _vars, ctx) => {
      // Replace temp id with real id (JSONPlaceholder does not persist, but we keep UI consistent)
      qc.setQueryData<Todo[]>(['todos'], (current = []) =>
        current.map(t => (t.id === ctx?.optimisticId ? { ...created, id: created.id || Math.abs(ctx!.optimisticId), completed: false } : t))
      )
    }
  })

  // WRITE: toggle completed — optimistic
  const toggleMutation = useMutation({
    mutationFn: ({ id, completed }: { id: number; completed: boolean }) => toggleTodo(id, completed),
    onMutate: async ({ id, completed }) => {
      await qc.cancelQueries({ queryKey: ['todos'] })
      const prev = qc.getQueryData<Todo[]>(['todos']) ?? []
      qc.setQueryData<Todo[]>(['todos'], prev.map(t => (t.id === id ? { ...t, completed } : t)))
      return { prev }
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) qc.setQueryData<Todo[]>(['todos'], ctx.prev)
    }
  })

  // WRITE: delete — optimistic
  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteTodo(id),
    onMutate: async (id: number) => {
      await qc.cancelQueries({ queryKey: ['todos'] })
      const prev = qc.getQueryData<Todo[]>(['todos']) ?? []
      qc.setQueryData<Todo[]>(['todos'], prev.filter(t => t.id !== id))
      return { prev }
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) qc.setQueryData<Todo[]>(['todos'], ctx.prev)
    }
  })

  const busy = addMutation.isPending || toggleMutation.isPending || deleteMutation.isPending

  const completedCount = useMemo(() => todos.filter(t => t.completed).length, [todos])

  return (
    <div className="container">
      <header>
        <h1>Todos</h1>
        {/* <p className="muted">TanStack Query for reads/writes — no <code>useEffect</code>.</p> */}
      </header>

      <TodoForm onAdd={(title) => addMutation.mutate(title)} isPending={addMutation.isPending} />

      {isPending && <div className="state">Loading…</div>}
      {isError && <div className="state error">Error: {(error as Error).message}</div>}

      {!isPending && !isError && (
        <>
          <ul className="todo-list">
            {todos.map(t => (
              <TodoItem
                key={t.id}
                todo={t}
                onToggle={(id, completed) => toggleMutation.mutate({ id, completed })}
                onDelete={(id) => deleteMutation.mutate(id)}
                busy={busy}
              />
            ))}
          </ul>

          <footer className="footer">
            <span>
              {completedCount}/{todos.length} completed
            </span>
          </footer>
        </>
      )}
    </div>
  )
}
