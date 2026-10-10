import test from 'node:test';
import assert from 'node:assert/strict';
import { notebookReducer as reduce, reorder } from '../src/domain/notebookReducer.js';
import { createInitialData, isNotebook } from '../src/domain/data.js';

function freezeDeep(value) {
  Object.freeze(value);
  Object.values(value).forEach((child) => {
    if (child && typeof child === 'object' && !Object.isFrozen(child)) freezeDeep(child);
  });
  return value;
}

test('CRUD de tareas conserva el estado original y elimina sus subtareas', () => {
  const original = freezeDeep(createInitialData());
  let state = reduce(original, { type: 'task/add', task: { id: 'test', title: 'Nueva', completed: false, subtasks: [] } });
  state = reduce(state, { type: 'task/rename', taskId: 'test', title: ' Modificada ' });
  state = reduce(state, { type: 'task/toggle', taskId: 'test' });
  assert.equal(state.tasks.at(-1).title, 'Modificada');
  assert.equal(state.tasks.at(-1).completed, true);
  assert.equal(original.tasks.length, 3);
  state = reduce(state, { type: 'task/delete', taskId: 'task-learn' });
  assert.equal(state.tasks.some((task) => task.id === 'task-learn'), false);
  assert.equal(isNotebook(state), true);
});

test('CRUD de subtareas afecta solamente a su tarea', () => {
  const original = freezeDeep(createInitialData());
  let state = reduce(original, { type: 'subtask/add', taskId: 'task-ideas', subtask: { id: 'new-sub', title: 'Paso', completed: false } });
  state = reduce(state, { type: 'subtask/rename', taskId: 'task-ideas', subtaskId: 'new-sub', title: 'Paso editado' });
  state = reduce(state, { type: 'subtask/toggle', taskId: 'task-ideas', subtaskId: 'new-sub' });
  assert.deepEqual(state.tasks[1].subtasks[0], { id: 'new-sub', title: 'Paso editado', completed: true });
  assert.strictEqual(state.tasks[0], original.tasks[0]);
  state = reduce(state, { type: 'subtask/delete', taskId: 'task-ideas', subtaskId: 'new-sub' });
  assert.equal(state.tasks[1].subtasks.length, 0);
});

test('reordenar funciona en ambas direcciones, con IDs ausentes y sin mutación', () => {
  const original = freezeDeep([{ id: 'a' }, { id: 'b' }, { id: 'c' }]);
  assert.deepEqual(reorder(original, 'a', 'c').map((item) => item.id), ['b', 'c', 'a']);
  assert.deepEqual(reorder(original, 'c', 'a').map((item) => item.id), ['c', 'a', 'b']);
  assert.strictEqual(reorder(original, 'x', 'b'), original);
  assert.strictEqual(reorder(original, 'a', 'a'), original);
  assert.deepEqual(original.map((item) => item.id), ['a', 'b', 'c']);
});

test('reordenar tareas y subtareas no cruza listas', () => {
  const original = freezeDeep(createInitialData());
  const state = reduce(original, { type: 'subtask/reorder', taskId: 'task-learn', sourceId: 'sub-components', targetId: 'sub-state' });
  assert.equal(state.tasks[0].subtasks[0].id, 'sub-components');
  assert.equal(state.tasks[1].subtasks.length, 0);
  const tasks = reduce(state, { type: 'task/reorder', sourceId: 'task-start', targetId: 'task-learn' });
  assert.equal(tasks.tasks[0].id, 'task-start');
});

test('CRUD de notas guarda texto y fecha y sobrevive a JSON', () => {
  const original = freezeDeep(createInitialData());
  const note = { id: 'note-test', title: 'Título', body: 'Texto\nSegunda línea', updatedAt: '2026-10-09T13:00:00.000Z' };
  let state = reduce(original, { type: 'note/add', note });
  state = reduce(state, { type: 'note/update', note: { ...note, body: 'Actualizada' } });
  assert.equal(state.notes[0].body, 'Actualizada');
  const restored = JSON.parse(JSON.stringify(state));
  assert.deepEqual(restored, state);
  assert.equal(isNotebook(restored), true);
  state = reduce(state, { type: 'note/delete', noteId: note.id });
  assert.equal(state.notes.length, original.notes.length);
});

test('validador rechaza esquemas rotos, fechas inválidas e IDs duplicados', () => {
  assert.equal(isNotebook(null), false);
  assert.equal(isNotebook({ version: 1, tasks: [], notes: [] }), true);
  assert.equal(isNotebook({ ...createInitialData(), version: 2 }), false);
  const broken = createInitialData();
  broken.tasks[0].subtasks = null;
  assert.equal(isNotebook(broken), false);
  const duplicate = createInitialData();
  duplicate.tasks[1].id = duplicate.tasks[0].id;
  assert.equal(isNotebook(duplicate), false);
  const invalidDate = createInitialData();
  invalidDate.notes[0].updatedAt = 'fecha inválida';
  assert.equal(isNotebook(invalidDate), false);
});

test('editar títulos vacíos se ignora y acciones desconocidas son inocuas', () => {
  const original = freezeDeep(createInitialData());
  assert.strictEqual(reduce(original, { type: 'task/rename', taskId: 'task-learn', title: ' ' }), original);
  assert.strictEqual(reduce(original, { type: 'subtask/rename', taskId: 'task-learn', title: ' ' }), original);
  assert.strictEqual(reduce(original, { type: 'note/update', note: { ...original.notes[0], title: ' ' } }), original);
  assert.strictEqual(reduce(original, { type: 'unknown' }), original);
});