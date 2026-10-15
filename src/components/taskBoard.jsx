import { useState } from "react";
import AddItemForm from "./addItemForm";
import TaskCard from "./taskCard";
import CompletedGroup from "./completedGroup";
import { useReorder } from "../hooks/useReorder";
import { isTaskCompleted } from "../domain/completion";
import "../styles/tasks.css";

function TaskList({ tasks, dispatch, scope, onAnnounce }) {
  function move(sourceId, targetId) {
    dispatch({ type: "task/reorder", sourceId, targetId });
    onAnnounce("Orden de tareas actualizado.");
  }
  const { handleProps, targetProps } = useReorder(scope, move);

  return (
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
  );
}

export default function TaskBoard({ tasks, dispatch }) {
  const [announcement, setAnnouncement] = useState("");
  const pending = tasks.filter((task) => !isTaskCompleted(task));
  const completed = tasks.filter(isTaskCompleted);

  return (
    <section aria-labelledby="tasks-title" className="tasks-section">
      <div className="section-heading">
        <div>
          <span className="eyebrow">UN PASO A LA VEZ</span>
          <h2 id="tasks-title">
            Mis tareas <span className="count">{pending.length}</span>
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
      {pending.length === 0 && (
        <div className="empty-state">
          <span aria-hidden="true">✧</span>
          <h3>{tasks.length ? "Todo al día" : "Espacio para empezar"}</h3>
          <p>
            {tasks.length
              ? "Tus tareas finalizadas están en Completadas. Puedes crear otra arriba."
              : "Crea tu primera tarea arriba."}
          </p>
        </div>
      )}
      <TaskList
        tasks={pending}
        dispatch={dispatch}
        scope="tasks:pending"
        onAnnounce={setAnnouncement}
      />
      {completed.length > 0 && (
        <CompletedGroup title="Tareas completadas" count={completed.length}>
          <TaskList
            tasks={completed}
            dispatch={dispatch}
            scope="tasks:completed"
            onAnnounce={setAnnouncement}
          />
        </CompletedGroup>
      )}
    </section>
  );
}
