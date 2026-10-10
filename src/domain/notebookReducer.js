// Reordena una copia; nunca modifica el arreglo recibido.
export function reorder(items, sourceId, targetId) {
  const from = items.findIndex((item) => item.id === sourceId);
  const to = items.findIndex((item) => item.id === targetId);
  if (from < 0 || to < 0 || from === to) return items;
  const copy = [...items];
  const [moved] = copy.splice(from, 1);
  copy.splice(to, 0, moved);
  return copy;
}

export function notebookReducer(state, action) {
  const updateTask = (transform) => ({
    ...state,
    tasks: state.tasks.map((task) =>
      task.id === action.taskId ? transform(task) : task,
    ),
  });

  switch (action.type) {
    case "task/add":
      return { ...state, tasks: [...state.tasks, action.task] };
    case "task/rename":
      return action.title.trim()
        ? updateTask((task) => ({ ...task, title: action.title.trim() }))
        : state;
    case "task/toggle":
      return updateTask((task) => ({ ...task, completed: !task.completed }));
    case "task/delete":
      return {
        ...state,
        tasks: state.tasks.filter((task) => task.id !== action.taskId),
      };
    case "task/reorder":
      return {
        ...state,
        tasks: reorder(state.tasks, action.sourceId, action.targetId),
      };
    case "subtask/add":
      return updateTask((task) => ({
        ...task,
        subtasks: [...task.subtasks, action.subtask],
      }));
    case "subtask/rename":
      if (!action.title.trim()) return state;
      return updateTask((task) => ({
        ...task,
        subtasks: task.subtasks.map((subtask) =>
          subtask.id === action.subtaskId
            ? { ...subtask, title: action.title.trim() }
            : subtask,
        ),
      }));
    case "subtask/toggle":
      return updateTask((task) => ({
        ...task,
        subtasks: task.subtasks.map((subtask) =>
          subtask.id === action.subtaskId
            ? { ...subtask, completed: !subtask.completed }
            : subtask,
        ),
      }));
    case "subtask/delete":
      return updateTask((task) => ({
        ...task,
        subtasks: task.subtasks.filter(
          (subtask) => subtask.id !== action.subtaskId,
        ),
      }));
    case "subtask/reorder":
      return updateTask((task) => ({
        ...task,
        subtasks: reorder(task.subtasks, action.sourceId, action.targetId),
      }));
    case "note/add":
      return { ...state, notes: [action.note, ...state.notes] };
    case "note/update":
      return action.note.title.trim()
        ? {
            ...state,
            notes: state.notes.map((note) =>
              note.id === action.note.id
                ? { ...action.note, title: action.note.title.trim() }
                : note,
            ),
          }
        : state;
    case "note/delete":
      return {
        ...state,
        notes: state.notes.filter((note) => note.id !== action.noteId),
      };
    default:
      return state;
  }
}
