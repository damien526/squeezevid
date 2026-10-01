/**
 * Size presets surfaced in the tool and mirrored by the landing pages.
 * Limits verified October 2026; keep the `note` fields honest and dated.
 */
export type Preset = {
  /** URL-safe id, also used as ?target= deep-link value. */
  id: string;
  /** Short chip label. */
  label: string;
  /** Target size in MB (binary). */
  mb: number;
  /** One-line context shown when the preset is active. */
  note: string;
};

export const PRESETS: Preset[] = [
  {
    id: 'discord',
    label: 'Discord · 20 MB',
    mb: 20,
    note: 'Discord’s free upload limit is 20 MB (since August 2026). Nitro Basic: 50 MB, Nitro: 1 GB.',
  },
  {
    id: 'email',
    label: 'Email · 18 MB',
    mb: 18,
    note: 'Gmail caps messages at 25 MB, but attachments are base64-encoded (+33%), so ~18 MB is the real ceiling for the file itself.',
  },
  {
    id: '8mb',
    label: '8 MB',
    mb: 8,
    note: 'The classic forum and webhook limit. Still the ceiling on many bots, wikis and older platforms.',
  },
  {
    id: '10mb',
    label: '10 MB',
    mb: 10,
    note: 'A common limit on ticket systems, CMSs and form uploads.',
  },
  {
    id: '25mb',
    label: '25 MB',
    mb: 25,
    note: 'The nominal Gmail/Outlook limit. Use the Email preset if the video travels as an attachment.',
  },
  {
    id: '50mb',
    label: '50 MB',
    mb: 50,
    note: 'Discord Nitro Basic, many LMS and job-application portals.',
  },
  {
    id: '100mb',
    label: '100 MB',
    mb: 100,
    note: 'A comfortable ceiling for most upload forms and shared drives.',
  },
];

export function presetById(id: string): Preset | undefined {
  return PRESETS.find((p) => p.id === id);
}
