import {
  boolean,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

export const firms = pgTable("firms", {
  id: uuid("id").defaultRandom().primaryKey(),
  clerkUserId: text("clerk_user_id").notNull().unique(),
  name: text("name").notNull().default("My firm"),
  retainDays: integer("retain_days").notNull().default(90),
  autoDeleteExports: boolean("auto_delete_exports").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const templates = pgTable("templates", {
  id: text("id").primaryKey(),
  firmId: uuid("firm_id")
    .notNull()
    .references(() => firms.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  description: text("description").notNull().default(""),
  sections: jsonb("sections").$type<string[]>().notNull().default([]),
  toneNotes: text("tone_notes").notNull().default(""),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const mandates = pgTable("mandates", {
  id: text("id").primaryKey(),
  firmId: uuid("firm_id")
    .notNull()
    .references(() => firms.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  client: text("client").notNull(),
  role: text("role").notNull(),
  geography: text("geography").notNull().default(""),
  criteria: jsonb("criteria").$type<unknown[]>().notNull().default([]),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const dossiers = pgTable("dossiers", {
  id: text("id").primaryKey(),
  firmId: uuid("firm_id")
    .notNull()
    .references(() => firms.id, { onDelete: "cascade" }),
  candidateName: text("candidate_name").notNull(),
  targetRole: text("target_role").notNull(),
  client: text("client").notNull(),
  status: text("status").notNull().default("draft"),
  step: text("step").notNull().default("ingest"),
  mandateId: text("mandate_id").notNull(),
  templateId: text("template_id").notNull(),
  sources: jsonb("sources").$type<unknown[]>().notNull().default([]),
  claims: jsonb("claims").$type<unknown[]>().notNull().default([]),
  sections: jsonb("sections").$type<unknown[]>().notNull().default([]),
  qaIssues: jsonb("qa_issues").$type<unknown[]>().notNull().default([]),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  approvedAt: timestamp("approved_at", { withTimezone: true }),
});

export const auditEvents = pgTable("audit_events", {
  id: text("id").primaryKey(),
  firmId: uuid("firm_id")
    .notNull()
    .references(() => firms.id, { onDelete: "cascade" }),
  action: text("action").notNull(),
  actor: text("actor").notNull(),
  entityType: text("entity_type").notNull(),
  entityId: text("entity_id").notNull(),
  detail: text("detail"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});
