import InlineTitle from "./inlineTitle";
import MoveControls from "./moveControls";
import SubtaskList from "./subtaskList";
import { isTaskCompleted } from "../domain/completion";

export default function TaskCard({
  task,
  index,
  tasks,
  dispatch,
  onMove,
  handleProps,
  targetProps,
}) {
  const done = task.subtasks.filter((subtask) => subtask.completed).length;
  const completed = isTaskCompleted(task);

  return (
    <li
      className={`task-card ${completed ? "completed" : ""}`}
      {...targetProps}
    >
      <div className="task-top">
        <span
          className="drag-handle"
          aria-hidden="true"
          title="Arrastrar tarea"
          {...handleProps}
        >
          ⠿
        </span>
        <input
          type="checkbox"
          checked={task.completed}
          aria-label={`${task.completed ? "Reabrir" : "Completar"} tarea ${task.title}`}
          onChange={() => dispatch({ type: "task/toggle", taskId: task.id })}
        />
        <InlineTitle
          title={task.title}
          onSave={(title) =>
            dispatch({ type: "task/rename", taskId: task.id, title })
          }
        />
        <MoveControls
          title={task.title}
          index={index}
          items={tasks}
          onMove={onMove}
        />
        <button
          className="text-button danger"
          type="button"
          aria-label={`Eliminar tarea ${task.title}`}
          onClick={() => {
            if (
              window.confirm(`¿Eliminar «${task.title}» y todas sus subtareas?`)
            )
              dispatch({ type: "task/delete", taskId: task.id });
          }}
        >
          Eliminar
        </button>
      </div>
      <div className="task-meta">
        <span className={`pill ${completed ? "done" : ""}`}>
          {completed
            ? "Completada"
            : task.completed
              ? "Subtareas pendientes"
              : "Pendiente"}
        </span>
        {task.subtasks.length > 0 && (
          <span>
            {done} de {task.subtasks.length} pasos
          </span>
        )}
      </div>
      <details className="task-details">
        <summary>
          Subtareas <span>({task.subtasks.length})</span>
        </summary>
        <SubtaskList task={task} dispatch={dispatch} />
      </details>
    </li>
  );
}
