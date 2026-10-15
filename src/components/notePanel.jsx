import { useState } from "react";
import NoteEditor from "./noteEditor";
import NoteCard from "./noteCard";
import CompletedGroup from "./completedGroup";
import { isNoteCompleted } from "../domain/completion";
import "../styles/notes.css";

export default function NotesPanel({ notes, dispatch }) {
  const [creating, setCreating] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const pending = notes.filter((note) => !isNoteCompleted(note));
  const completed = notes.filter(isNoteCompleted);
  const busy = creating || editingId !== null;

  function renderNote(note) {
    return editingId === note.id ? (
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
      <NoteCard
        key={note.id}
        note={note}
        dispatch={dispatch}
        disabled={busy}
        onEdit={() => setEditingId(note.id)}
      />
    );
  }

  return (
    <section aria-labelledby="notes-title" className="notes-section">
      <div className="section-heading">
        <div>
          <span className="eyebrow">IDEAS QUE SE QUEDAN</span>
          <h2 id="notes-title">
            Mi cuaderno <span className="count">{pending.length}</span>
          </h2>
        </div>
        <button
          className="button secondary"
          type="button"
          disabled={busy}
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
      {!creating && pending.length === 0 && (
        <div className="empty-state">
          <span aria-hidden="true">✎</span>
          <h3>{notes.length ? "Tus notas están al día" : "Tu próxima idea vive aquí"}</h3>
          <p>
            {notes.length
              ? "Puedes consultar tus notas completadas más abajo."
              : "Pulsa Nueva nota para escribirla."}
          </p>
        </div>
      )}
      <div className="note-list">{pending.map(renderNote)}</div>
      {completed.length > 0 && (
        <CompletedGroup title="Notas completadas" count={completed.length}>
          <div className="note-list">{completed.map(renderNote)}</div>
        </CompletedGroup>
      )}
    </section>
  );
}
