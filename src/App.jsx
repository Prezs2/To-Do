import { useNotebook } from './hooks/useNotebook';

export default function App() {
  const { notebook, dispatch, storageError } = useNotebook();
  return (
    <main>
      <button onClick={() => dispatch({
        type: 'task/add',
        task: { id: crypto.randomUUID(), title: 'Practicar', completed: false, subtasks: [] },
      })}>Crear tarea de prueba</button>
      {storageError && <p>{storageError}</p>}
      <pre>{JSON.stringify(notebook, null, 2)}</pre>
    </main>
  );
}