import { useNotebook } from "./hooks/useNotebook";
import TaskBoard from "./components/taskBoard";
import NotesPanel from "./components/NotesPanel";

export default function App() {
  const { notebook, dispatch, storageError, retrySave } = useNotebook();
  const completed = notebook.tasks.filter((task) => task.completed).length;
  const total = notebook.tasks.length;
  const progress = total ? Math.round((completed / total) * 100) : 0;

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <a href="#main" className="brand">
          <span className="brand-symbol" aria-hidden="true">
            ✳
          </span>{" "}
          claridad<span className="brand-dot">.</span>
        </a>
        <p className="sidebar-caption">MENOS RUIDO. MÁS ESPACIO.</p>
        <nav aria-label="Secciones">
          <a href="#tasks-title">
            <span aria-hidden="true">☑</span> Mis tareas
          </a>
          <a href="#notes-title">
            <span aria-hidden="true">▤</span> Mi cuaderno
          </a>
        </nav>
        <div className="sidebar-message">
          <span aria-hidden="true">✧</span>
          <p>No necesitas hacerlo todo hoy.</p>
          <small>Solo el siguiente paso.</small>
        </div>
        <p className="local-label">
          <span aria-hidden="true">●</span> Tu espacio personal
        </p>
      </aside>
      <main id="main">
        <header className="page-header">
          <span className="eyebrow">TU DÍA, A TU RITMO</span>
          <span
            className={`storage-badge ${storageError ? "has-error" : ""}`}
            role="status"
          >
            {storageError ? "Guardado pendiente" : "Guardado en este navegador"}
          </span>
        </header>
        <div className="hero">
          <h1>
            Haz espacio para
            <br />
            <em>lo que importa.</em>
          </h1>
          <p>Organiza tus pendientes. Dale un lugar a tus ideas.</p>
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
        <div className="workspace">
          <TaskBoard tasks={notebook.tasks} dispatch={dispatch} />
          <NotesPanel notes={notebook.notes} dispatch={dispatch} />
        </div>
        <footer>
          Hecho para ir paso a paso.{" "}
          <span>Los cambios en tareas se guardan automáticamente.</span>
        </footer>
      </main>
    </div>
  );
}
