import {
  boolean,
  integer,
  jsonb,
  numeric,
  pgTable,
  text,
  uuid,
} from "drizzle-orm/pg-core";
import { timestamps } from "./_shared";
import { complexityEnum, pricingMethodEnum, priorityLevelEnum } from "./enums";

export const featureCategories = pgTable("feature_categories", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  position: integer("position").default(0).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  ...timestamps,
});

export const featureModules = pgTable("feature_modules", {
  id: uuid("id").defaultRandom().primaryKey(),
  categoryId: uuid("category_id").references(() => featureCategories.id, {
    onDelete: "set null",
  }),
  name: text("name").notNull(),
  description: text("description"),
  defaultEstimateHours: numeric("default_estimate_hours", {
    precision: 10,
    scale: 2,
  }),
  defaultPrice: numeric("default_price", { precision: 14, scale: 2 }),
  complexity: complexityEnum("complexity").default("medium"),
  isActive: boolean("is_active").default(true).notNull(),
  tags: jsonb("tags"),
  notes: text("notes"),
  ...timestamps,
});

export const featureItems = pgTable("feature_items", {
  id: uuid("id").defaultRandom().primaryKey(),
  moduleId: uuid("module_id")
    .notNull()
    .references(() => featureModules.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  description: text("description"),
  estimateHours: numeric("estimate_hours", { precision: 10, scale: 2 }),
  estimateDays: numeric("estimate_days", { precision: 10, scale: 2 }),
  fixedPrice: numeric("fixed_price", { precision: 14, scale: 2 }),
  hourlyRate: numeric("hourly_rate", { precision: 14, scale: 2 }),
  unit: text("unit"),
  defaultQuantity: numeric("default_quantity", {
    precision: 10,
    scale: 2,
  }).default("1"),
  pricingMethod: pricingMethodEnum("pricing_method").default("fixed"),
  complexity: complexityEnum("complexity").default("medium"),
  defaultPriority: priorityLevelEnum("default_priority").default("medium"),
  definitionOfDone: text("definition_of_done"),
  isActive: boolean("is_active").default(true).notNull(),
  position: integer("position").default(0).notNull(),
  ...timestamps,
});

export const featureChecklists = pgTable("feature_checklists", {
  id: uuid("id").defaultRandom().primaryKey(),
  featureItemId: uuid("feature_item_id")
    .notNull()
    .references(() => featureItems.id, { onDelete: "cascade" }),
  label: text("label").notNull(),
  kind: text("kind").default("development"), // development | testing
  position: integer("position").default(0).notNull(),
  ...timestamps,
});

export const featureDependencies = pgTable("feature_dependencies", {
  id: uuid("id").defaultRandom().primaryKey(),
  featureItemId: uuid("feature_item_id")
    .notNull()
    .references(() => featureItems.id, { onDelete: "cascade" }),
  dependsOnId: uuid("depends_on_id")
    .notNull()
    .references(() => featureItems.id, { onDelete: "cascade" }),
  ...timestamps,
});
