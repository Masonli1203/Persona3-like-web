export function SectionHeading({
  number,
  title,
  description,
}: {
  number: string;
  title: string;
  description: string;
}) {
  return (
    <header className="module-heading" data-chapter={number}>
      <h1>
        {title}
        <span className="chapter-dot">.</span>
      </h1>
      <p>{description}</p>
    </header>
  );
}
