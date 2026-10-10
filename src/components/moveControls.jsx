export default function MoveControls({ title, index, items, onMove }) {
  return (
    <div className="move-controls">
      <button
        type="button"
        className="icon-button"
        aria-label={`Subir ${title}`}
        title="Subir"
        disabled={index === 0}
        onClick={() => onMove(items[index].id, items[index - 1].id)}
      >
        ↑
      </button>
      <button
        type="button"
        className="icon-button"
        aria-label={`Bajar ${title}`}
        title="Bajar"
        disabled={index === items.length - 1}
        onClick={() => onMove(items[index].id, items[index + 1].id)}
      >
        ↓
      </button>
    </div>
  );
}