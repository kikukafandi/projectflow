import {
  boolean,
  date,
  integer,
  numeric,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { timestamps } from "./_shared";
import { priorityLevelEnum, taskStatusEnum } from "./enums";
import { projectFeatures } from "./scope";
import { projectPhases, projects } from "./projects";

export const tasks = pgTable("tasks", {
  id: uuid("id").defaultRandom().primaryKey(),
  projectId: uuid("project_id")
    .notNull()
    .references(() => projects.id, { onDelete: "cascade" }),
  phaseId: uuid("phase_id").references(() => projectPhases.id, {
    onDelete: "set null",
  }),
  sourceFeatureId: uuid("source_feature_id").references(
    () => projectFeatures.id,
    { onDelete: "set null" },
  ),
  title: text("title").notNull(),
  description: text("description"),
  status: taskStatusEnum("status").default("backlog").notNull(),
  priority: priorityLevelEnum("priority").default("medium").notNull(),
  priorityScore: integer("priority_score").default(0).notNull(),
  estimateHours: numeric("estimate_hours", { precision: 10, scale: 2 }),
  actualHours: numeric("actual_hours", { precision: 10, scale: 2 }),
  startDate: date("start_date"),
  deadline: date("deadline"),
  completedAt: timestamp("completed_at", { withTimezone: true }),
  definitionOfDone: text("definition_of_done"),
  notes: text("notes"),
  position: integer("position").default(0).notNull(),
  ...timestamps,
});

export const taskChecklists = pgTable("task_checklists", {
  id: uuid("id").defaultRandom().primaryKey(),
  taskId: uuid("task_id")
    .notNull()
    .references(() => tasks.id, { onDelete: "cascade" }),
  label: text("label").notNull(),
  required: boolean("required").default(false).notNull(),
  done: boolean("done").default(false).notNull(),
  position: integer("position").default(0).notNull(),
  ...timestamps,
});

export const taskDependencies = pgTable("task_dependencies", {
  id: uuid("id").defaultRandom().primaryKey(),
  taskId: uuid("task_id")
    .notNull()
    .references(() => tasks.id, { onDelete: "cascade" }),
  dependsOnId: uuid("depends_on_id")
    .notNull()
    .references(() => tasks.id, { onDelete: "cascade" }),
  ...timestamps,
});

export const dailyFocusItems = pgTable("daily_focus_items", {
  id: uuid("id").defaultRandom().primaryKey(),
  taskId: uuid("task_id")
    .notNull()
    .references(() => tasks.id, { onDelete: "cascade" }),
  focusDate: date("focus_date").notNull(),
  position: integer("position").default(0).notNull(),
  done: boolean("done").default(false).notNull(),
  note: text("note"),
  ...timestamps,
});
