import { useId, useState } from "react";

export default function NoteEditor({ note, onSave, onCancel }) {
  const id = useId();
  const [title, setTitle] = useState(note?.title ?? "");
  const [body, setBody] = useState(note?.body ?? "");
  const dirty = title !== (note?.title ?? "") || body !== (note?.body ?? "");

  function submit(event) {
    event.preventDefault();
    if (!title.trim()) return;
    onSave({
      id: note?.id ?? crypto.randomUUID(),
      title: title.trim(),
      body,
      updatedAt: new Date().toISOString(),
    });
  }

  return (
    <form className="note-editor" onSubmit={submit}>
      <label htmlFor={`${id}-title`}>Título</label>
      <input
        id={`${id}-title`}
        value={title}
        onChange={(event) => setTitle(event.target.value)}
        required
        maxLength={160}
        autoFocus
        placeholder="Dale nombre a tu idea"
      />
      <label htmlFor={`${id}-body`}>Tu nota</label>
      <textarea
        id={`${id}-body`}
        value={body}
        onChange={(event) => setBody(event.target.value)}
        maxLength={20000}
        rows={8}
        placeholder="Empieza a escribir…"
      />
      <p className="draft-hint">
        El borrador se guarda al pulsar Guardar nota.
      </p>
      <div className="editor-actions">
        <button
          type="submit"
          className="button primary"
          disabled={!title.trim()}
        >
          Guardar nota
        </button>
        <button
          type="button"
          className="button secondary"
          onClick={() => {
            if (
              !dirty ||
              window.confirm("¿Descartar los cambios de este borrador?")
            )
              onCancel();
          }}
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}