import { db } from "@/config/db";
import { ProjectsTable, ScreenConfigTable } from "@/config/schema";
import { and, eq, desc } from "drizzle-orm";
import { ProjectType, ScreenConfigType } from "@/types/types";

export interface ProjectDetailResponse {
  projectDetails: ProjectType | undefined;
  screenConfig: ScreenConfigType[];
}

export async function createProject(
  projectId: string,
  userInput: string,
  device: string,
  theme: string,
  email: string,
  hasPremium: boolean
): Promise<ProjectType> {
  // Free-tier project limit removed — unlimited projects for now.
  // (hasPremium is kept as a parameter so callers don't need to change,
  // but it is currently unused by this function.)

  const res = await db.insert(ProjectsTable).values({
    projectId,
    userInput,
    device,
    theme,
    userId: email,
  }).returning();

  return res[0] as unknown as ProjectType;
}

export async function getProjectDetail(projectId: string, email: string): Promise<ProjectDetailResponse> {
  const res = await db.select()
    .from(ProjectsTable)
    .where(and(eq(ProjectsTable.projectId, projectId), eq(ProjectsTable.userId, email)));

  const screenConfig = await db.select()
    .from(ScreenConfigTable)
    .where(eq(ScreenConfigTable.projectId, projectId));

  return {
    projectDetails: res[0] as unknown as ProjectType | undefined,
    screenConfig: screenConfig as unknown as ScreenConfigType[],
  };
}

export async function getAllUserProjects(email: string): Promise<ProjectType[]> {
  const projects = await db.select()
    .from(ProjectsTable)
    .where(eq(ProjectsTable.userId, email))
    .orderBy(desc(ProjectsTable.id));

  return projects as unknown as ProjectType[];
}

export async function updateProject(
  projectId: string,
  projectName: string | undefined,
  theme: string | undefined,
  logo: string | undefined
): Promise<ProjectType> {
  const res = await db.update(ProjectsTable).set({
    projectName,
    theme,
    logo,
  }).where(eq(ProjectsTable.projectId, projectId)).returning();

  return res[0] as unknown as ProjectType;
}

export async function deleteScreen(projectId: string, screenId: string): Promise<void> {
  await db.delete(ScreenConfigTable).where(
    and(
      eq(ScreenConfigTable.projectId, projectId),
      eq(ScreenConfigTable.screenId, screenId)
    )
  );
}

export interface DesignTokensExport {
  projectName: string;
  device: string;
  theme: string;
  colors: Record<string, string>;
  spacing: number[];
  borderRadius: Record<string, string>;
  typography: {
    fontFamily: string;
    scale: Record<string, string>;
  };
  screens: Array<{ id: string; name: string; purpose: string }>;
}

export async function exportDesignSystem(projectId: string): Promise<DesignTokensExport> {
  const projects = await db.select().from(ProjectsTable).where(eq(ProjectsTable.projectId, projectId));
  const project = projects[0];
  if (!project) throw new Error('ProjectNotFound');

  const screens = await db.select().from(ScreenConfigTable).where(eq(ScreenConfigTable.projectId, projectId));

  // Dynamically import theme data to keep controller lightweight
  const { THEMES } = await import('@/data/Theme');
  const themeKey = (project.theme ?? 'AURORA_INK') as keyof typeof THEMES;
  const theme = THEMES[themeKey] ?? THEMES['AURORA_INK'];

  const colors: Record<string, string> = {
    background: theme.background,
    foreground: theme.foreground,
    card: theme.card,
    cardForeground: theme.cardForeground,
    primary: theme.primary,
    primaryForeground: theme.primaryForeground,
    secondary: theme.secondary,
    secondaryForeground: theme.secondaryForeground,
    muted: theme.muted,
    mutedForeground: theme.mutedForeground,
    accent: theme.accent,
    accentForeground: theme.accentForeground,
    destructive: theme.destructive,
    border: theme.border,
    input: theme.input,
    ring: theme.ring,
  };

  if (theme.chart) {
    theme.chart.forEach((c, i) => { colors[`chart${i + 1}`] = c; });
  }

  return {
    projectName: project.projectName ?? 'Untitled Project',
    device: project.device ?? 'WEBSITE',
    theme: themeKey,
    colors,
    spacing: [4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96],
    borderRadius: {
      none: '0px',
      sm: '0.25rem',
      default: theme.radius ?? '0.5rem',
      md: '0.75rem',
      lg: '1rem',
      xl: '1.5rem',
      '2xl': '2rem',
      full: '9999px',
    },
    typography: {
      fontFamily: 'Inter, system-ui, sans-serif',
      scale: {
        xs: '0.75rem',
        sm: '0.875rem',
        base: '1rem',
        lg: '1.125rem',
        xl: '1.25rem',
        '2xl': '1.5rem',
        '3xl': '1.875rem',
        '4xl': '2.25rem',
      },
    },
    screens: screens.map(s => ({
      id: s.screenId,
      name: s.screenName ?? '',
      purpose: s.purpose ?? '',
    })),
  };
}