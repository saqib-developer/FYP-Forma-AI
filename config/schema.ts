import { date, integer, json, pgTable, text, varchar } from "drizzle-orm/pg-core";

export const usersTable = pgTable("users", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: varchar({ length: 255 }).notNull(),
  email: varchar({ length: 255 }).notNull().unique(),
  credits: integer().default(5),
});

export const ProjectsTable = pgTable('project', {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  userId: varchar().notNull().references(() => usersTable?.email),
  projectId: varchar().notNull().unique(),
  userInput: varchar().notNull(),
  device: varchar(),
  createdAt: date().defaultNow(),
  config: json(),
  projectVisualDescription: text(),
  theme: varchar(),
  projectName: varchar(),
  logo: text(),
})

export const ScreenConfigTable = pgTable('screenConfig', {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  projectId: varchar().notNull().references(() => ProjectsTable?.projectId),
  screenId: varchar().notNull(),
  screenName: varchar(),
  purpose: varchar(),
  screenDescription: varchar(),
  code:text(),
  aiReview: json()
})

export const UserThemesTable = pgTable('userThemes', {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  userId: varchar().notNull().references(() => usersTable?.email),
  themeName: varchar().notNull(),
  themeData: text().notNull(), // will hold stringified CUSTOM:{...} JSON
  createdAt: date().defaultNow(),
})
 