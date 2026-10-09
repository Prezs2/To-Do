import { useState } from 'react';

const DRAG_TYPE = 'application/x-claridad-item';

export function useReorder(scope, onMove) {
  const [draggingId, setDraggingId] = useState(null);
  const [overId, setOverId] = useState(null);

  function handleProps(id) {
    return {
      draggable: true,
      onDragStart(event) {
        event.stopPropagation();
        event.dataTransfer.setData(DRAG_TYPE, JSON.stringify({ scope, id }));
        event.dataTransfer.effectAllowed = 'move';
        setDraggingId(id);
      },
      onDragEnd() { setDraggingId(null); setOverId(null); },
    };
  }

  function targetProps(id) {
    return {
      onDragOver(event) {
        if (!event.dataTransfer.types.includes(DRAG_TYPE)) return;
        event.preventDefault();
        event.stopPropagation();
        event.dataTransfer.dropEffect = 'move';
        setOverId(id);
      },
      onDrop(event) {
        event.preventDefault();
        event.stopPropagation();
        try {
          const data = JSON.parse(event.dataTransfer.getData(DRAG_TYPE));
          if (data.scope === scope && typeof data.id === 'string') onMove(data.id, id);
        } catch { /* Una carga externa o incompleta se ignora. */ }
        setDraggingId(null);
        setOverId(null);
      },
      'data-dragging': draggingId === id,
      'data-over': overId === id && draggingId !== id,
    };
  }

  return { handleProps, targetProps };
}