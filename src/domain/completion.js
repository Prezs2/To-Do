export function isTaskCompleted(task) {
  return task.completed && task.subtasks.every((subtask) => subtask.completed);
}

export function isNoteCompleted(note) {
  return note.completed === true;
}
