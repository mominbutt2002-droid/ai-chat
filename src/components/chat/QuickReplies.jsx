export function QuickReplies({ items, onSelect, disabled }) {
  return (
    <div className="quick-replies" role="group" aria-label="Быстрые ответы">
      {items.map((label) => (
        <button
          key={label}
          type="button"
          className="quick-replies__chip"
          disabled={disabled}
          onClick={() => onSelect(label)}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
