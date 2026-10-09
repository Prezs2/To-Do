export const STORAGE_KEY = "TO-DO:notebook:v1";

export function createInitialData() {
  return {
    version: 1,
    tasks: [
      {
        id: "task-learn",
        title: "Construir mi primera app",
        completed: false,
        subtasks: [
          {
            id: "sub-state",
            title: "Entender el estado de React",
            completed: true,
          },
          {
            id: "sub-components",
            title: "Separar los componentes",
            completed: false,
          },
        ],
      },
      {
        id: "task-ideas",
        title: "Anotar las ideas de la semana",
        completed: false,
        subtasks: [],
      },
      {
        id: "task-start",
        title: "Dar el primer paso",
        completed: true,
        subtasks: [],
      },
    ],
    notes: [
      {
        id: "note-welcome",
        title: "Un lugar para mis ideas",
        body: "Las ideas pequeñas también merecen un espacio.\n\nUsa este cuaderno para guardar lo que aprendes, planear tu día o empezar algo nuevo.",
        updatedAt: "2026-10-09T12:00:00.000Z",
      },
    ],
  };
}

export function isNotebook(value) {
  const ids = new Set();
  const validId = (id) => {
    if (typeof id !== "string" || !id || !ids.has(id)) return false;
    ids.add(id);
    return value;
  };

  const validItem = (item) =>
    item &&
    validId(item.id) &&
    typeof item.title === "string" &&
    item.title.trim().length > 0 &&
    typeof item.completed === "boolean";

  return Boolean(
    value &&
    value.version === 1 &&
    Array.isArray(value.tasks) &&
    Array.isArray(value.notes) &&
    value.tasks.every(
      (task) =>
        validItem(task) &&
        Array.isArray(task.subtasks) &&
        task.subtasks.every(validItem),
    ) &&
    value.notes.every(
      (note) =>
        note &&
        validId(note.id) &&
        typeof note.title === "string" &&
        note.title.trim().length > 0 &&
        typeof note.body === "string" &&
        typeof note.updatedAt === "string" &&
        Number.isFinite(Date.parse(note.updatedAt)),
    ),
  );
}
