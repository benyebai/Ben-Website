export default function ListPanel({
  title,
  subtitle,
  items,
  onSelectItem,
  className = "",
}) {
  return (
    <section
      className={`content-section ${className}`.trim()}
      aria-labelledby={`${title}-title`}
    >
      <h2 id={`${title}-title`}>{title}</h2>
      {subtitle && (
        <p className="section-subscript">
          <small>{subtitle}</small>
        </p>
      )}
      <ul className="section-list">
        {items.map((item) => (
          <li key={item.title}>
            {onSelectItem ? (
              <button type="button" onClick={() => onSelectItem(item)}>
                {item.title}
              </button>
            ) : (
              <a href={item.href}>{item.title}</a>
            )}
            {item.meta && <span>{item.meta}</span>}
            {item.description && (
              <small className="section-item-description">
                {item.description}
              </small>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
