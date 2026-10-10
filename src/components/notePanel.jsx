import { useState } from "react";
import NoteEditor from "./noteEditor";
import "../styles/notes.css";

export default function NotesPanel({ notes, dispatch }) {
  const [creating, setCreating] = useState(false);
  const [editingId, setEditingId] = useState(null);

  return (
    <section aria-labelledby="notes-title" className="notes-section">
      <div className="section-heading">
        <div>
          <span className="eyebrow">IDEAS QUE SE QUEDAN</span>
          <h2 id="notes-title">
            Mi cuaderno <span className="count">{notes.length}</span>
          </h2>
        </div>
        <button
          className="button secondary"
          type="button"
          disabled={creating || editingId !== null}
          onClick={() => setCreating(true)}
        >
          + Nueva nota
        </button>
      </div>
      <p className="section-description">
        Un lugar tranquilo para pensar en voz escrita.
      </p>
      {creating && (
        <NoteEditor
          key="new"
          onCancel={() => setCreating(false)}
          onSave={(note) => {
            dispatch({ type: "note/add", note });
            setCreating(false);
          }}
        />
      )}
      {!creating && notes.length === 0 && (
        <div className="empty-state">
          <span aria-hidden="true">✎</span>
          <h3>Tu próxima idea vive aquí</h3>
          <p>Pulsa Nueva nota para escribirla.</p>
        </div>
      )}
      <div className="note-list">
        {notes.map((note) =>
          editingId === note.id ? (
            <NoteEditor
              key={note.id}
              note={note}
              onCancel={() => setEditingId(null)}
              onSave={(updated) => {
                dispatch({ type: "note/update", note: updated });
                setEditingId(null);
              }}
            />
          ) : (
            <article className="note-card" key={note.id}>
              <div className="note-top">
                <span className="note-mark" aria-hidden="true">
                  ✎
                </span>
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
                  disabled={creating || editingId !== null}
                  aria-label={`Editar nota ${note.title}`}
                  onClick={() => setEditingId(note.id)}
                >
                  Editar nota
                </button>
                <button
                  className="text-button danger"
                  type="button"
                  disabled={creating || editingId !== null}
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
          ),
        )}
      </div>
    </section>
  );
}
