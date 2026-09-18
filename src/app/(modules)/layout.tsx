import { ModuleShell } from '@/components/module-shell';
import './modules.css';

export default function ModulesLayout({ children }: { children: React.ReactNode }) {
  return <ModuleShell>{children}</ModuleShell>;
}
