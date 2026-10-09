import { useId, useState } from 'react';

export default function AddItemForm({ label, placeholder, onAdd, compact = false }) {
  const id = useId();
  const [title, setTitle] = useState('');

  function handleSubmit(event) {
    event.preventDefault();
    const clean = title.trim();
    if (!clean) return;
    onAdd(clean);
    setTitle('');
  }

  return (
    <form onSubmit={handleSubmit} className={`add-form ${compact ? 'compact' : ''}`}>
      <label className="sr-only" htmlFor={id}>{label}</label>
      <input id={id} value={title} onChange={(event) => setTitle(event.target.value)}
        placeholder={placeholder} maxLength={160} required />
      <button type="submit" className={compact ? 'button secondary' : 'button primary'} disabled={!title.trim()}>
        <span aria-hidden="true">+</span> {compact ? 'Añadir' : 'Crear tarea'}
      </button>
    </form>
  );
}