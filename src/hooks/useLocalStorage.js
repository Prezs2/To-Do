import { useRef, useState } from "react";

export function useLocalStorage(key, createDefault, validate) {
  // Inicializador perezoso: leemos al montar, no en cada render.
  const [initial] = useState(() => {
    try {
      const raw = window.localStorage.getItem(key);
      if (raw === null) return { value: createDefault(), error: "" };
      const parsed = JSON.parse(raw);
      if (!validate(parsed)) throw new Error("Formato incompatible");
      return { value: parsed, error: "" };
    } catch {
      return {
        value: createDefault(),
        error:
          "No se pudieron leer los datos. Se muestran ejemplos; el contenido anterior no se sobrescribirá sin tu confirmación.",
      };
    }
  });
  const [value, setStoredValue] = useState(initial.value);
  const [error, setError] = useState(initial.error);
  // Solo se lee/escribe en acciones, nunca durante el render.
  const latestValue = useRef(initial.value);
  const blocked = useRef(Boolean(initial.error));

  function persist(nextValue) {
    try {
      window.localStorage.setItem(key, JSON.stringify(nextValue));
      setError("");
    } catch {
      setError(
        "No se pudo guardar. Tus cambios están en memoria; revisa el espacio o los permisos del navegador antes de cerrar.",
      );
    }
  }

  // Llamar desde un evento; admite un valor o una función pura.
  function setValue(nextValueOrUpdater) {
    const nextValue =
      typeof nextValueOrUpdater === "function"
        ? nextValueOrUpdater(latestValue.current)
        : nextValueOrUpdater;

    // La ref evita perder cambios si hay dos acciones antes del siguiente render.
    latestValue.current = nextValue;
    setStoredValue(nextValue);

    if (!blocked.current) persist(nextValue);
  }

  function retrySave() {
    if (
      blocked.current &&
      !window.confirm(
        "Guardar los datos actuales reemplazará el contenido anterior que no se pudo leer. ¿Continuar?",
      )
    )
      return;
    blocked.current = false;
    persist(latestValue.current);
  }

  return { value, setValue, error, retrySave };
}
