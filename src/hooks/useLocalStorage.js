import { useRef, useState } from "react";

export function useLocalStorage(key, createDefault, validate) {
  // 1. Recuperar los datos al montar el hook.
  const [initial] = useState(() => {
    try {
      const raw = window.localStorage.getItem(key);

      if (raw === null) {
        return { value: createDefault(), error: "" };
      }

      const parsed = JSON.parse(raw);

      if (!validate(parsed)) {
        throw new Error("Formato incompatible");
      }

      return { value: parsed, error: "" };
    } catch {
      return {
        value: createDefault(),
        error:
          "No se pudieron leer los datos. Se muestran ejemplos; " +
          "el contenido anterior no se sobrescribirá sin tu confirmación.",
      };
    }
  });

  // 2. Estado que React utiliza para mostrar la interfaz.
  const [value, setStoredValue] = useState(initial.value);
  const [error, setError] = useState(initial.error);

  // 3. Valores internos que conservamos entre renders.
  const latestValue = useRef(initial.value);
  const blocked = useRef(Boolean(initial.error));

  // 4. Guardar y comunicar el resultado.
  function persist(nextValue) {
    try {
      window.localStorage.setItem(key, JSON.stringify(nextValue));
      setError("");
    } catch {
      setError(
        "No se pudo guardar. Tus cambios están en memoria; " +
          "revisa el espacio o los permisos del navegador antes de cerrar.",
      );
    }
  }

  // 5. Actualizar los datos desde una acción del usuario.
  function setValue(nextValueOrUpdater) {
    const nextValue =
      typeof nextValueOrUpdater === "function"
        ? nextValueOrUpdater(latestValue.current)
        : nextValueOrUpdater;

    latestValue.current = nextValue;
    setStoredValue(nextValue);

    if (!blocked.current) {
      persist(nextValue);
    }
  }

  // 6. Reintentar sin necesitar otra modificación.
  function retrySave() {
    if (
      blocked.current &&
      !window.confirm(
        "Guardar los datos actuales reemplazará el contenido anterior " +
          "que no se pudo leer. ¿Continuar?",
      )
    ) {
      return;
    }

    blocked.current = false;
    persist(latestValue.current);
  }

  return { value, setValue, error, retrySave };
}