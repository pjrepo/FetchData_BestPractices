import { useState } from 'react'

interface Props {
  onAdd: (title: string) => void
  isPending?: boolean
}

export default function TodoForm({ onAdd, isPending }: Props) {
  const [title, setTitle] = useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const t = title.trim()
    if (!t) return
    onAdd(t)
    setTitle('')
  }

  return (
    <form onSubmit={handleSubmit} className="todo-form">
      <input
        type="text"
        placeholder="Add a new task..."
        value={title}
        onChange={e => setTitle(e.target.value)}
        disabled={isPending}
        aria-label="New todo title"
      />
      <button type="submit" disabled={isPending || !title.trim()}>
        {isPending ? 'Adding…' : 'Add'}
      </button>
    </form>
  )
}
