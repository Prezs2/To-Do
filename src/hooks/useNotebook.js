import { useLocalStorage } from "./useLocalStorage";
import { STORAGE_KEY, createInitialData, isNotebook } from "../domain/data";
import { notebookReducer } from "../domain/notebookReducer";

export function useNotebook() {
  const { value, setValue, error, retrySave } = useLocalStorage(
    STORAGE_KEY,
    createInitialData,
    isNotebook,
  );

  function dispatch(action) {
    // Usamos el estado más reciente, aunque haya varias actualizaciones seguidas.
    setValue((previous) => notebookReducer(previous, action));
  }

  return { notebook: value, dispatch, storageError: error, retrySave };
}
