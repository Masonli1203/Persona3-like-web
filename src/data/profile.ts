import { site } from './site';
import type { ProjectId } from './works';

type ProfileProject = {
  projectId: ProjectId;
  medium: string;
  description: string;
};
export const profile = {
  name: site.name,
  fullName: 'Your full name',
  role: site.role,
  location: site.location,
  email: '',
  cv: '',
  portrait: '/images/profile-placeholder.svg',
  summary:
    'A sample profile. Replace the biography, education, experience, and contact details with your own.',
  introduction: [
    'Introduce yourself here: what you make, what interests you, and what you are working on.',
    'All entries on this page are placeholders. Add only experience and claims that you can support.',
  ],
  education: [
    {
      school: 'Your school',
      degree: 'Your degree or course',
      location: 'City, country',
      period: 'Start – End',
    },
  ],
  experience: [
    {
      company: 'Your organization',
      role: 'Your role',
      period: 'Start – End',
      location: 'City, country',
      description: 'Describe your responsibilities and one concrete contribution.',
    },
  ],
  projects: [
    {
      projectId: 'sample-project',
      medium: 'Interactive study',
      description: 'Replace this example with a project you have made.',
    },
  ] satisfies ProfileProject[],
  skills: [{ category: 'Your discipline', tools: 'Tools you use' }],
  languages: [{ name: 'Your language', level: 'Your proficiency' }],
  awards: [
    { name: 'Your award or recognition', institution: 'Awarding organization', period: 'Year' },
  ],
};
