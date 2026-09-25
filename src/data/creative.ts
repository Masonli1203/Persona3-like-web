export const creativeCategories = [
  { id: 'vfx-film', number: '01', title: 'VFX / FILM', cover: '/images/sample-film.svg' },
  { id: '3d', number: '02', title: '3D', cover: '/images/sample-3d.svg' },
  { id: 'ai-experiments', number: '03', title: 'AI EXPERIMENTS', cover: '/images/sample-ai.svg' },
  { id: 'photography', number: '04', title: 'PHOTOGRAPHY', cover: '/images/sample-photo.svg' },
] as const;
export type CreativeCategory = (typeof creativeCategories)[number]['id'];
export type GalleryImage = {
  src: string;
  thumbnail: string;
  alt: string;
  width: number;
  height: number;
  placeholder?: boolean;
};
type ProjectBase = {
  slug: string;
  title: string;
  category: CreativeCategory;
  year?: string;
  subtitle?: string;
  description?: string;
  coverImage?: string;
  tools?: string[];
  featured?: boolean;
};
export type CreativeProject = ProjectBase &
  (
    | {
        mediaType: 'mux-video';
        muxPlaybackId?: string;
        videoSrc?: string;
        previewVideo?: string;
        gallery?: GalleryImage[];
      }
    | { mediaType: 'gallery'; category: 'photography'; gallery: GalleryImage[] }
  );

// Supply your own public playback ID or local videoSrc. No account identifiers ship here.
export const creativeProjects: CreativeProject[] = [
  {
    slug: 'film-study',
    title: 'Film Study',
    category: 'vfx-film',
    mediaType: 'mux-video',
    subtitle: 'Video placeholder',
    description: 'Add a local videoSrc or your public Mux playback ID to show a film.',
    coverImage: '/images/sample-film.svg',
  },
  {
    slug: 'form-study',
    title: 'Form Study',
    category: '3d',
    mediaType: 'mux-video',
    subtitle: 'Animation placeholder',
    coverImage: '/images/sample-3d.svg',
  },
  {
    slug: 'motion-study',
    title: 'Motion Study',
    category: 'ai-experiments',
    mediaType: 'mux-video',
    subtitle: 'Experiment placeholder',
    coverImage: '/images/sample-ai.svg',
  },
  {
    slug: 'sample-series',
    title: 'Sample Series',
    category: 'photography',
    mediaType: 'gallery',
    description: 'Abstract placeholders for your photographs.',
    coverImage: '/images/sample-photo.svg',
    gallery: [
      {
        src: '/images/sample-photo.svg',
        thumbnail: '/images/sample-photo.svg',
        alt: 'Abstract blue geometry, sample image one',
        width: 1200,
        height: 800,
        placeholder: true,
      },
      {
        src: '/images/sample-ai.svg',
        thumbnail: '/images/sample-ai.svg',
        alt: 'Abstract yellow geometry, sample image two',
        width: 1200,
        height: 800,
        placeholder: true,
      },
    ],
  },
];
