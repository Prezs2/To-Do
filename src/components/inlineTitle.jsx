import { useState } from 'react';

export default function InlineTitle({ title, onSave }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(title);

  function submit(event) {
    event.preventDefault();
    if (!draft.trim()) return;
    onSave(draft.trim());
    setEditing(false);
  }

  if (editing) return (
    <form className="inline-editor" onSubmit={submit}>
      <input aria-label="Nuevo título" value={draft} maxLength={160} required autoFocus
        onChange={(event) => setDraft(event.target.value)}
        onKeyDown={(event) => { if (event.key === 'Escape') setEditing(false); }} />
      <button className="text-button" type="submit" disabled={!draft.trim()}>Guardar</button>
      <button className="text-button" type="button" onClick={() => setEditing(false)}>Cancelar</button>
    </form>
  );

  return (
    <div className="editable-title">
      <span>{title}</span>
      <button className="text-button" type="button" aria-label={`Editar ${title}`}
        onClick={() => { setDraft(title); setEditing(true); }}>Editar</button>
    </div>
  );
}