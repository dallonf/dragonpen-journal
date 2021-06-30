import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable("journal_entries", (table) => {
    table.uuid("id").notNullable().primary();
    table.string("user_id").notNullable();
    table.dateTime("timestamp").notNullable().defaultTo(knex.raw("NOW()"));
    table.text("text");

    table.dateTime("created_at").notNullable().defaultTo(knex.raw("NOW()"));
    table.dateTime("updated_at").notNullable().defaultTo(knex.raw("NOW()"));
    table.index("timestamp");
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable("journal_entries");
}
