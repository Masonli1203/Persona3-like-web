import { ChapterShell } from '@/components/layout/chapter-shell';
import '../../components/layout/chapters.css';

export default function ModulesLayout({ children }: { children: React.ReactNode }) {
  return <ChapterShell>{children}</ChapterShell>;
}
