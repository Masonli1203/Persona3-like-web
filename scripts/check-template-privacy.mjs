import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

// This guard applies to the shared starter. Customize it when making a personal fork.
const files = [
  ...new Set(
    execFileSync('git', ['ls-files', '-co', '--exclude-standard', '-z'], { encoding: 'utf8' })
      .split('\0')
      .filter(Boolean),
  ),
];
const problems = [];
for (const file of files) {
  if (
    /^(?:resources|output|verification|design)\//.test(file) ||
    /(?:^|\/)\.env(?!\.example$)/.test(file)
  )
    problems.push(`${file}: local/private file`);
  if (/^(?:src|public)\//.test(file) && /\.(?:pdf|jpg|jpeg|png|webp|mp4|mov)$/i.test(file))
    problems.push(`${file}: personal-media risk; starter uses neutral SVGs`);
  if (
    !/\.(?:ts|tsx|js|mjs|json|svg|md|css|yml)$/.test(file) ||
    file.startsWith('scripts/check-template-privacy')
  )
    continue;
  const text = readFileSync(file, 'utf8');
  if (/-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/.test(text))
    problems.push(`${file}: private key`);
  if (/(?:ghp_|github_pat_)[A-Za-z0-9_]{20,}/.test(text)) problems.push(`${file}: access token`);
  if (/data:image\/(?:jpeg|png|webp);base64,/i.test(text))
    problems.push(`${file}: embedded raster media`);
  if (file.startsWith('src/')) {
    if (/[\w.+-]+@[\w.-]+\.(?:com|net|org|edu)\b/.test(text))
      problems.push(`${file}: populated email`);
    if (/muxPlaybackId:\s*['"][A-Za-z0-9]+['"]/.test(text))
      problems.push(`${file}: populated playback ID`);
    if (/[A-Za-z]:[\\/](?:Users|home)[\\/]/.test(text)) problems.push(`${file}: machine path`);
  }
}
if (problems.length) {
  console.error(problems.join('\n'));
  process.exitCode = 1;
} else
  console.log(
    `Privacy guard passed for ${files.length} template files. Review all new assets manually before publishing.`,
  );
