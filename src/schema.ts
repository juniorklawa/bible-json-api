import { pgTable, serial, varchar, integer, text } from "drizzle-orm/pg-core";

/**
 * Tabela de versões da Bíblia.
 * Cada versão tem um código (por exemplo, "nvi"), linguagem e nome.
 */
export const versions = pgTable("versions", {
  id: serial("id").primaryKey(),
  code: varchar("code", { length: 10 }).notNull(), // Ex.: "nvi"
  language: varchar("language", { length: 10 }).notNull(), // Ex.: "pt-br"
  name: varchar("name", { length: 100 }).notNull(), // Ex.: "Nova Versão Internacional"
});

/**
 * Tabela de livros da Bíblia.
 * Cada livro está associado a uma versão (caso a numeração ou ordem possa variar) ou pode ser única.
 * Aqui, associamos o livro a uma versão para maior flexibilidade.
 */
export const books = pgTable("books", {
  id: serial("id").primaryKey(),
  versionId: integer("version_id")
    .notNull()
    .references(() => versions.id), // Relação com a tabela versions
  abbreviation: varchar("abbreviation", { length: 10 }).notNull(), // Ex.: "Gn" para Gênesis
  name: varchar("name", { length: 100 }).notNull(), // Ex.: "Gênesis"
  order: integer("order").notNull(), // Ex.: 1 para o primeiro livro
});

/**
 * Tabela de versículos.
 * Cada versículo faz referência a um livro (que já contém informações sobre a versão),
 * além de conter o capítulo, o número do versículo e o texto.
 */
export const verses = pgTable("verses", {
  id: serial("id").primaryKey(),
  bookId: integer("book_id")
    .notNull()
    .references(() => books.id), // Relação com a tabela books
  chapter: integer("chapter").notNull(),
  verse: integer("verse").notNull(),
  text: text("text").notNull(),
});
