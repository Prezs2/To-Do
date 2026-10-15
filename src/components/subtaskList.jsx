import AddItemForm from "./addItemForm";
import InlineTitle from "./inlineTitle";
import MoveControls from "./moveControls";
import { useReorder } from "../hooks/useReorder";

export default function SubtaskList({ task, dispatch }) {
  const move = (sourceId, targetId) =>
    dispatch({ type: "subtask/reorder", taskId: task.id, sourceId, targetId });
  const { handleProps, targetProps } = useReorder(`subtasks:${task.id}`, move);

  return (
    <div className="subtasks">
      <ul className="subtask-list">
        {task.subtasks.map((subtask, index) => (
          <li
            key={subtask.id}
            className={`subtask ${subtask.completed ? "completed" : ""}`}
            {...targetProps(subtask.id)}
          >
            <span
              className="drag-handle"
              aria-hidden="true"
              title="Arrastrar subtarea"
              {...handleProps(subtask.id)}
            >
              ⠿
            </span>
            <input
              type="checkbox"
              checked={subtask.completed}
              aria-label={`Completar subtarea ${subtask.title}`}
              onChange={() =>
                dispatch({
                  type: "subtask/toggle",
                  taskId: task.id,
                  subtaskId: subtask.id,
                })
              }
            />
            <InlineTitle
              title={subtask.title}
              onSave={(title) =>
                dispatch({
                  type: "subtask/rename",
                  taskId: task.id,
                  subtaskId: subtask.id,
                  title,
                })
              }
            />
            <div className="subtask-actions">
              <MoveControls
                title={subtask.title}
                index={index}
                items={task.subtasks}
                onMove={move}
              />
              <button
                type="button"
                className="text-button danger"
                aria-label={`Eliminar subtarea ${subtask.title}`}
                onClick={() => {
                  if (window.confirm(`¿Eliminar la subtarea «${subtask.title}»?`))
                    dispatch({
                      type: "subtask/delete",
                      taskId: task.id,
                      subtaskId: subtask.id,
                    });
                }}
              >
                Eliminar
              </button>
            </div>
          </li>
        ))}
      </ul>
      <AddItemForm
        compact
        label={`Nueva subtarea de ${task.title}`}
        placeholder="Un paso más pequeño…"
        onAdd={(title) =>
          dispatch({
            type: "subtask/add",
            taskId: task.id,
            subtask: { id: crypto.randomUUID(), title, completed: false },
          })
        }
      />
    </div>
  );
}
