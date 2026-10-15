import test from 'node:test';
import assert from 'node:assert/strict';
import { isTaskCompleted } from '../src/domain/completion.js';
import { notebookReducer as reduce } from '../src/domain/notebookReducer.js';
import { isNotebook } from '../src/domain/data.js';

function freezeDeep(value) {
  Object.freeze(value);
  Object.values(value).forEach((child) => {
    if (child && typeof child === 'object' && !Object.isFrozen(child)) freezeDeep(child);
  });
  return value;
}

function createTask(overrides = {}) {
  return {
    id: 'project',
    title: 'Preparar el proyecto',
    completed: true,
    subtasks: [
      { id: 'plan', title: 'Planear', completed: true },
      { id: 'deliver', title: 'Entregar', completed: true },
    ],
    ...overrides,
  };
}

function createNotebook(task) {
  return {
    version: 1,
    tasks: [task, { id: 'other', title: 'Otra tarea', completed: false, subtasks: [] }],
    notes: [],
  };
}

test('una tarea sin subtareas se completa y se reabre con su casilla', () => {
  const original = freezeDeep(createNotebook(createTask({ completed: false, subtasks: [] })));
  assert.equal(isTaskCompleted(original.tasks[0]), false);

  const completed = reduce(original, { type: 'task/toggle', taskId: 'project' });
  assert.equal(isTaskCompleted(completed.tasks[0]), true);

  const reopened = reduce(completed, { type: 'task/toggle', taskId: 'project' });
  assert.equal(isTaskCompleted(reopened.tasks[0]), false);
  assert.equal(original.tasks[0].completed, false);
});

test('terminar las subtareas no completa una tarea principal desmarcada', () => {
  const original = freezeDeep(createNotebook(createTask({ completed: false })));
  assert.equal(isTaskCompleted(original.tasks[0]), false);

  const completed = reduce(original, { type: 'task/toggle', taskId: 'project' });
  assert.equal(isTaskCompleted(completed.tasks[0]), true);
  assert.strictEqual(completed.tasks[0].subtasks, original.tasks[0].subtasks);
});

test('marcar la tarea principal no oculta una subtarea todavía pendiente', () => {
  const original = freezeDeep(createNotebook(createTask({
    completed: false,
    subtasks: [{ id: 'pending', title: 'Paso pendiente', completed: false }],
  })));

  const state = reduce(original, { type: 'task/toggle', taskId: 'project' });
  assert.equal(state.tasks[0].completed, true);
  assert.equal(state.tasks[0].subtasks[0].completed, false);
  assert.equal(isTaskCompleted(state.tasks[0]), false);
});

test('completar la última subtarea termina la tarea marcada sin mutar el estado anterior', () => {
  const original = freezeDeep(createNotebook(createTask({
    subtasks: [
      { id: 'plan', title: 'Planear', completed: true },
      { id: 'deliver', title: 'Entregar', completed: false },
    ],
  })));
  assert.equal(isTaskCompleted(original.tasks[0]), false);

  const state = reduce(original, {
    type: 'subtask/toggle', taskId: 'project', subtaskId: 'deliver',
  });

  assert.equal(isTaskCompleted(state.tasks[0]), true);
  assert.equal(state.tasks[0].completed, true);
  assert.equal(original.tasks[0].subtasks[1].completed, false);
  assert.strictEqual(state.tasks[0].subtasks[0], original.tasks[0].subtasks[0]);
  assert.strictEqual(state.tasks[1], original.tasks[1]);
});

test('desmarcar una subtarea devuelve una tarea completada a pendientes', () => {
  const original = freezeDeep(createNotebook(createTask()));
  assert.equal(isTaskCompleted(original.tasks[0]), true);

  const state = reduce(original, {
    type: 'subtask/toggle', taskId: 'project', subtaskId: 'deliver',
  });

  assert.equal(isTaskCompleted(state.tasks[0]), false);
  assert.equal(state.tasks[0].completed, true);
  assert.equal(original.tasks[0].subtasks[1].completed, true);
});

test('desmarcar la tarea principal la reabre aunque sus subtareas sigan terminadas', () => {
  const original = freezeDeep(createNotebook(createTask()));
  const state = reduce(original, { type: 'task/toggle', taskId: 'project' });

  assert.equal(isTaskCompleted(state.tasks[0]), false);
  assert.strictEqual(state.tasks[0].subtasks, original.tasks[0].subtasks);
  assert.equal(isTaskCompleted(original.tasks[0]), true);
});

test('añadir una subtarea pendiente reabre la tarea y completarla vuelve a terminarla', () => {
  const original = freezeDeep(createNotebook(createTask()));
  const withNewStep = reduce(original, {
    type: 'subtask/add',
    taskId: 'project',
    subtask: { id: 'review', title: 'Revisar', completed: false },
  });

  assert.equal(isTaskCompleted(withNewStep.tasks[0]), false);
  assert.equal(withNewStep.tasks[0].completed, true);
  assert.equal(original.tasks[0].subtasks.length, 2);
  assert.strictEqual(withNewStep.tasks[1], original.tasks[1]);

  const completed = reduce(withNewStep, {
    type: 'subtask/toggle', taskId: 'project', subtaskId: 'review',
  });
  assert.equal(isTaskCompleted(completed.tasks[0]), true);
});

test('recargar JSON conserva la clasificación de tareas con el formato guardado actual', () => {
  const original = createNotebook(createTask());
  const withNewStep = reduce(original, {
    type: 'subtask/add',
    taskId: 'project',
    subtask: { id: 'review', title: 'Revisar', completed: false },
  });
  const completedOther = reduce(withNewStep, { type: 'task/toggle', taskId: 'other' });
  const restored = JSON.parse(JSON.stringify(completedOther));

  assert.equal(isNotebook(restored), true);
  assert.equal(restored.version, 1);
  assert.deepEqual(restored, completedOther);
  assert.deepEqual(restored.tasks.filter(isTaskCompleted).map((task) => task.id), ['other']);
  assert.deepEqual(restored.tasks.filter((task) => !isTaskCompleted(task)).map((task) => task.id), ['project']);
  assert.equal(restored.tasks[0].completed, true);
});
