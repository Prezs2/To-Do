export default function CompletedGroup({ title, count, children }) {
  return (
    <details className="completed-group">
      <summary>
        {title} <span className="count">{count}</span>
      </summary>
      <div className="completed-content">{children}</div>
    </details>
  );
}
