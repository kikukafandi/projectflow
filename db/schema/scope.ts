import {
  boolean,
  integer,
  numeric,
  pgTable,
  text,
  uuid,
} from "drizzle-orm/pg-core";
import { timestamps } from "./_shared";
import { complexityEnum, scopeStatusEnum } from "./enums";
import { featureItems, featureModules } from "./features";
import { projectPhases, projects } from "./projects";

/** Snapshot of a library module attached to a project (PRD §37.1). */
export const projectModules = pgTable("project_modules", {
  id: uuid("id").defaultRandom().primaryKey(),
  projectId: uuid("project_id")
    .notNull()
    .references(() => projects.id, { onDelete: "cascade" }),
  sourceModuleId: uuid("source_module_id").references(() => featureModules.id, {
    onDelete: "set null",
  }),
  phaseId: uuid("phase_id").references(() => projectPhases.id, {
    onDelete: "set null",
  }),
  name: text("name").notNull(),
  description: text("description"),
  position: integer("position").default(0).notNull(),
  ...timestamps,
});

/** Snapshot of a library feature into a project scope. */
export const projectFeatures = pgTable("project_features", {
  id: uuid("id").defaultRandom().primaryKey(),
  projectId: uuid("project_id")
    .notNull()
    .references(() => projects.id, { onDelete: "cascade" }),
  projectModuleId: uuid("project_module_id").references(
    () => projectModules.id,
    { onDelete: "set null" },
  ),
  sourceFeatureId: uuid("source_feature_id").references(() => featureItems.id, {
    onDelete: "set null",
  }),
  name: text("name").notNull(),
  description: text("description"),
  quantity: numeric("quantity", { precision: 10, scale: 2 }).default("1"),
  unit: text("unit"),
  estimateHours: numeric("estimate_hours", { precision: 10, scale: 2 }),
  unitPrice: numeric("unit_price", { precision: 14, scale: 2 }).default("0"),
  complexity: complexityEnum("complexity").default("medium"),
  status: scopeStatusEnum("status").default("included").notNull(),
  definitionOfDone: text("definition_of_done"),
  notes: text("notes"),
  position: integer("position").default(0).notNull(),
  ...timestamps,
});

export const projectFeatureChecklists = pgTable("project_feature_checklists", {
  id: uuid("id").defaultRandom().primaryKey(),
  projectFeatureId: uuid("project_feature_id")
    .notNull()
    .references(() => projectFeatures.id, { onDelete: "cascade" }),
  label: text("label").notNull(),
  done: boolean("done").default(false).notNull(),
  position: integer("position").default(0).notNull(),
  ...timestamps,
});

export const projectFeatureDependencies = pgTable(
  "project_feature_dependencies",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    projectFeatureId: uuid("project_feature_id")
      .notNull()
      .references(() => projectFeatures.id, { onDelete: "cascade" }),
    dependsOnId: uuid("depends_on_id")
      .notNull()
      .references(() => projectFeatures.id, { onDelete: "cascade" }),
    ...timestamps,
  },
);
