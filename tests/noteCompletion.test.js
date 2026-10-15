import test from 'node:test';
import assert from 'node:assert/strict';
import { isNoteCompleted } from '../src/domain/completion.js';
import { notebookReducer as reduce } from '../src/domain/notebookReducer.js';
import { STORAGE_KEY, isNotebook } from '../src/domain/data.js';

function freezeDeep(value) {
  Object.freeze(value);
  Object.values(value).forEach((child) => {
    if (child && typeof child === 'object' && !Object.isFrozen(child)) freezeDeep(child);
  });
  return value;
}

function createNote(overrides = {}) {
  return {
    id: 'legacy-note',
    title: 'Plan del proyecto',
    body: 'Primera línea\nSegunda línea',
    updatedAt: '2026-10-09T12:00:00.000Z',
    ...overrides,
  };
}

function createNotebook(note = createNote()) {
  return {
    version: 1,
    tasks: [{ id: 'task', title: 'Tarea existente', completed: false, subtasks: [] }],
    notes: [note, createNote({ id: 'other-note', title: 'Otra nota' })],
  };
}

test('las notas solo se clasifican completadas con el booleano true', () => {
  assert.equal(isNoteCompleted(createNote({ completed: true })), true);
  assert.equal(isNoteCompleted(createNote()), false);

  for (const completed of [false, undefined, null, 'true', 'false', 0, 1, [], {}]) {
    assert.equal(isNoteCompleted(createNote({ completed })), false);
  }
});

test('los datos v1 con notas antiguas siguen siendo válidos y pendientes sin migración', () => {
  const original = freezeDeep(createNotebook());
  const restored = JSON.parse(JSON.stringify(original));

  assert.equal(STORAGE_KEY, 'claridad:notebook:v1');
  assert.equal(isNotebook(restored), true);
  assert.equal(restored.version, 1);
  assert.deepEqual(restored, original);
  assert.equal(restored.notes.some(isNoteCompleted), false);
  assert.equal(Object.hasOwn(restored.notes[0], 'completed'), false);
});

test('añadir notas asigna pendiente por defecto y conserva un estado explícito', () => {
  const original = freezeDeep(createNotebook());
  const added = reduce(original, {
    type: 'note/add', note: createNote({ id: 'new-note' }),
  });
  assert.equal(added.notes[0].completed, false);
  assert.equal(isNoteCompleted(added.notes[0]), false);
  assert.strictEqual(added.notes[1], original.notes[0]);
  assert.equal(original.notes.length, 2);

  const completed = reduce(added, {
    type: 'note/add', note: createNote({ id: 'completed-note', completed: true }),
  });
  assert.equal(isNoteCompleted(completed.notes[0]), true);
  assert.equal(isNotebook(completed), true);
});

test('completar y reabrir una nota antigua conserva contenido, fecha y los demás registros', () => {
  const original = freezeDeep(createNotebook(createNote({ metadata: { project: 'Personal' } })));
  const completed = reduce(original, { type: 'note/toggle', noteId: 'legacy-note' });

  assert.equal(isNoteCompleted(completed.notes[0]), true);
  assert.deepEqual(completed.notes[0], { ...original.notes[0], completed: true });
  assert.strictEqual(completed.notes[1], original.notes[1]);
  assert.strictEqual(completed.tasks, original.tasks);
  assert.strictEqual(completed.notes[0].metadata, original.notes[0].metadata);
  assert.equal(Object.hasOwn(original.notes[0], 'completed'), false);

  const reopened = reduce(freezeDeep(completed), { type: 'note/toggle', noteId: 'legacy-note' });
  assert.equal(isNoteCompleted(reopened.notes[0]), false);
  assert.deepEqual(reopened.notes[0], { ...original.notes[0], completed: false });
  assert.equal(completed.notes[0].completed, true);
});

test('guardar y recuperar JSON mantiene notas completadas y pendientes con sus contenidos', () => {
  const original = createNotebook();
  const completed = reduce(original, { type: 'note/toggle', noteId: 'legacy-note' });
  const restored = JSON.parse(JSON.stringify(completed));

  assert.equal(isNotebook(restored), true);
  assert.deepEqual(restored, completed);
  assert.deepEqual(restored.notes.filter(isNoteCompleted).map((note) => note.id), ['legacy-note']);
  assert.deepEqual(restored.notes.filter((note) => !isNoteCompleted(note)).map((note) => note.id), ['other-note']);
  assert.equal(restored.notes[0].body, original.notes[0].body);
  assert.equal(restored.notes[0].updatedAt, original.notes[0].updatedAt);
});

test('editar una nota completada sin enviar completed conserva su estado y otros campos', () => {
  const original = freezeDeep(createNotebook(createNote({
    completed: true,
    metadata: { project: 'Personal' },
  })));
  const state = reduce(original, {
    type: 'note/update',
    note: {
      id: 'legacy-note',
      title: ' Plan revisado ',
      body: 'Contenido revisado',
      updatedAt: '2026-10-14T15:00:00.000Z',
    },
  });

  assert.equal(isNoteCompleted(state.notes[0]), true);
  assert.equal(state.notes[0].title, 'Plan revisado');
  assert.equal(state.notes[0].body, 'Contenido revisado');
  assert.equal(state.notes[0].updatedAt, '2026-10-14T15:00:00.000Z');
  assert.strictEqual(state.notes[0].metadata, original.notes[0].metadata);
  assert.strictEqual(state.notes[1], original.notes[1]);
  assert.equal(original.notes[0].title, 'Plan del proyecto');
  assert.equal(isNotebook(state), true);
});

test('eliminar una nota completada conserva las otras notas y las tareas', () => {
  const original = freezeDeep(createNotebook(createNote({ completed: true })));
  const state = reduce(original, { type: 'note/delete', noteId: 'legacy-note' });

  assert.deepEqual(state.notes.map((note) => note.id), ['other-note']);
  assert.strictEqual(state.notes[0], original.notes[1]);
  assert.strictEqual(state.tasks, original.tasks);
  assert.equal(original.notes.length, 2);
  assert.equal(isNotebook(state), true);
});

test('el validador acepta estados booleanos y rechaza tipos inválidos en notas', () => {
  assert.equal(isNotebook(createNotebook(createNote())), true);
  assert.equal(isNotebook(createNotebook(createNote({ completed: false }))), true);
  assert.equal(isNotebook(createNotebook(createNote({ completed: true }))), true);

  for (const completed of ['true', 'false', null, 0, 1]) {
    assert.equal(isNotebook(createNotebook(createNote({ completed }))), false);
  }
});
