import {
  date,
  integer,
  numeric,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { timestamps } from "./_shared";
import { clients } from "./clients";
import { priorityLevelEnum, projectStatusEnum, projectTypeEnum } from "./enums";

export const projects = pgTable("projects", {
  id: uuid("id").defaultRandom().primaryKey(),
  code: text("code").notNull().unique(),
  name: text("name").notNull(),
  clientId: uuid("client_id")
    .notNull()
    .references(() => clients.id, { onDelete: "restrict" }),
  type: projectTypeEnum("type").default("website").notNull(),
  description: text("description"),
  goal: text("goal"),
  targetUsers: text("target_users"),
  startDate: date("start_date"),
  deadline: date("deadline"),
  clientBudget: numeric("client_budget", { precision: 14, scale: 2 }),
  projectValue: numeric("project_value", { precision: 14, scale: 2 }),
  status: projectStatusEnum("status").default("lead").notNull(),
  priority: priorityLevelEnum("priority").default("medium").notNull(),
  progress: integer("progress").default(0).notNull(), // 0..100
  internalNotes: text("internal_notes"),
  archivedAt: timestamp("archived_at", { withTimezone: true }),
  ...timestamps,
});

export const projectPhases = pgTable("project_phases", {
  id: uuid("id").defaultRandom().primaryKey(),
  projectId: uuid("project_id")
    .notNull()
    .references(() => projects.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  position: integer("position").default(0).notNull(),
  ...timestamps,
});

export const projectMilestones = pgTable("project_milestones", {
  id: uuid("id").defaultRandom().primaryKey(),
  projectId: uuid("project_id")
    .notNull()
    .references(() => projects.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  dueDate: date("due_date"),
  position: integer("position").default(0).notNull(),
  ...timestamps,
});

export const projectFiles = pgTable("project_files", {
  id: uuid("id").defaultRandom().primaryKey(),
  projectId: uuid("project_id")
    .notNull()
    .references(() => projects.id, { onDelete: "cascade" }),
  fileId: uuid("file_id"),
  label: text("label"),
  ...timestamps,
});
