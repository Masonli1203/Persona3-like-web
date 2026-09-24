export function MediaPlaceholder({
  label = 'MEDIA COMING SOON',
  code,
  tone = 'dark',
}: {
  label?: string;
  code: string;
  tone?: 'dark' | 'blue' | 'light';
}) {
  return (
    <div
      className={`work-media media-${tone}`}
      role="img"
      aria-label={`${code}: ${label.toLowerCase()}`}
    >
      <div className="work-media-top micro">
        <span>{code}</span>
        <span>16:9</span>
      </div>
      <div className="work-media-center">
        <span className="media-bracket" aria-hidden="true">
          ⌜
        </span>
        <span className="micro">{label}</span>
        <span className="media-bracket" aria-hidden="true">
          ⌟
        </span>
      </div>
      <div className="work-media-bottom micro">
        <span>VISUAL PLACEHOLDER</span>
        <span aria-hidden="true">+</span>
      </div>
    </div>
  );
}
