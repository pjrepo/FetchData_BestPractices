import type { Todo } from '../types'

interface Props {
  todo: Todo
  onToggle: (id: number, completed: boolean) => void
  onDelete: (id: number) => void
  busy?: boolean
}

export default function TodoItem({ todo, onToggle, onDelete, busy }: Props) {
  return (
    <li className={`todo-item ${todo.completed ? 'done' : ''}`}>
      <label className="todo-check">
        <input
          type="checkbox"
          checked={todo.completed}
          onChange={() => onToggle(todo.id, !todo.completed)}
          disabled={busy}
          aria-label={`Mark ${todo.title} as ${todo.completed ? 'incomplete' : 'complete'}`}
        />
        <span />
      </label>
      <span className="todo-title">{todo.title}</span>
      <button className="danger" onClick={() => onDelete(todo.id)} disabled={busy}>
        Delete
      </button>
    </li>
  )
}
