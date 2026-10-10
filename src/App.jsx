import { useNotebook } from "./hooks/useNotebook";
import TaskBoard from "./components/taskBoard";
import NotesPanel from "./components/notePanel";

export default function App() {
  const { notebook, dispatch, storageError, retrySave } = useNotebook();
  const completed = notebook.tasks.filter((task) => task.completed).length;
  const total = notebook.tasks.length;
  const progress = total ? Math.round((completed / total) * 100) : 0;

  return (
    <div className="app-shell">
      <aside className="notes-sidebar" aria-label="Cuaderno de notas">
        <NotesPanel notes={notebook.notes} dispatch={dispatch} />
      </aside>
      <main id="main" className="main-content">
        <div className="hero">
          <h1>
            Organización de <em>notas y tareas</em> para proyectos.
          </h1>
          <span className="hero-art" aria-hidden="true">
            ✳
          </span>
        </div>
        {storageError && (
          <div className="storage-error" role="alert">
            <p>{storageError}</p>
            <button
              type="button"
              className="button secondary"
              onClick={retrySave}
            >
              Guardar datos actuales
            </button>
          </div>
        )}
        <div className="overview">
          <div>
            <span className="metric">{total - completed}</span>
            <span>tareas por hacer</span>
          </div>
          <div>
            <span className="metric">{completed}</span>
            <span>tareas completadas</span>
          </div>
          <div>
            <span className="metric">{notebook.notes.length}</span>
            <span>ideas en tu cuaderno</span>
          </div>
          <div className="progress-block">
            <div>
              <span>Tu avance</span>
              <strong>{progress}%</strong>
            </div>
            <progress
              value={completed}
              max={total || 1}
              aria-label="Tareas completadas"
            />
          </div>
        </div>
        <TaskBoard tasks={notebook.tasks} dispatch={dispatch} />
      </main>
    </div>
  );
}
