import { isNoteCompleted } from "../domain/completion";

export default function NoteCard({ note, dispatch, onEdit, disabled }) {
  const completed = isNoteCompleted(note);

  return (
    <article className={`note-card ${completed ? "completed" : ""}`}>
      <div className="note-top">
        <label className="note-completion">
          <input
            type="checkbox"
            checked={completed}
            disabled={disabled}
            aria-label={`${completed ? "Reabrir" : "Completar"} nota ${note.title}`}
            onChange={() => dispatch({ type: "note/toggle", noteId: note.id })}
          />
          <span>{completed ? "Completada" : "Pendiente"}</span>
        </label>
        <time dateTime={note.updatedAt}>
          {new Intl.DateTimeFormat("es", {
            day: "numeric",
            month: "short",
          }).format(new Date(note.updatedAt))}
        </time>
      </div>
      <h3>{note.title}</h3>
      <p className="note-body">
        {note.body || "Esta nota todavía no tiene contenido."}
      </p>
      <div className="note-actions">
        <button
          className="text-button"
          type="button"
          disabled={disabled}
          aria-label={`Editar nota ${note.title}`}
          onClick={onEdit}
        >
          Editar nota
        </button>
        <button
          className="text-button danger"
          type="button"
          disabled={disabled}
          aria-label={`Eliminar nota ${note.title}`}
          onClick={() => {
            if (window.confirm(`¿Eliminar la nota «${note.title}»?`))
              dispatch({ type: "note/delete", noteId: note.id });
          }}
        >
          Eliminar
        </button>
      </div>
    </article>
  );
}
