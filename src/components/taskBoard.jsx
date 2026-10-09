import { useState } from "react";
import AddItemForm from "./addItemForm";
import TaskCard from "./taskCard";
import { useReorder } from "../hooks/useReorder";

export default function TaskBoard({ tasks, dispatch }) {
  const [announcement, setAnnouncement] = useState("");
  function move(sourceId, targetId) {
    dispatch({ type: "task/reorder", sourceId, targetId });
    setAnnouncement("Orden de tareas actualizado.");
  }
  const { handleProps, targetProps } = useReorder("tasks", move);

  return (
    <section aria-labelledby="tasks-title" className="tasks-section">
      <div className="section-heading">
        <div>
          <span className="eyebrow">UN PASO A LA VEZ</span>
          <h2 id="tasks-title">
            Mis tareas <span className="count">{tasks.length}</span>
          </h2>
        </div>
      </div>
      <p className="section-description">
        De una idea grande a pequeños pasos posibles.
      </p>
      <AddItemForm
        label="Nueva tarea"
        placeholder="¿Qué quieres hacer?"
        onAdd={(title) =>
          dispatch({
            type: "task/add",
            task: {
              id: crypto.randomUUID(),
              title,
              completed: false,
              subtasks: [],
            },
          })
        }
      />
      <p className="order-hint">
        Arrastra desde ⠿ o usa ↑ ↓ para cambiar el orden.
      </p>
      <p className="sr-only" role="status">
        {announcement}
      </p>
      {tasks.length === 0 && (
        <div className="empty-state">
          <span aria-hidden="true">✧</span>
          <h3>Espacio para empezar</h3>
          <p>Crea tu primera tarea arriba.</p>
        </div>
      )}
      <ul className="task-list">
        {tasks.map((task, index) => (
          <TaskCard
            key={task.id}
            task={task}
            index={index}
            tasks={tasks}
            dispatch={dispatch}
            onMove={move}
            handleProps={handleProps(task.id)}
            targetProps={targetProps(task.id)}
          />
        ))}
      </ul>
    </section>
  );
}
