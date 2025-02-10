import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { versions, books, verses } from "./schema";
import fs from "fs";
import path from "path";

// Database connection
const connectionString = "CONNECTION STRING HERE";
const client = postgres(connectionString);
const db = drizzle(client);

const BATCH_SIZE = 1000; // Adjust this based on your needs

async function migrate() {
  try {
    console.log("Starting migration...");

    // Insert NVI version
    const [version] = await db
      .insert(versions)
      .values({
        code: "nvi",
        language: "pt-br",
        name: "Nova Versão Internacional",
      })
      .returning();

    const versionPath = "./versions/pt-br/nvi/";
    const booksNames = fs.readdirSync(versionPath);

    // Prepare all books data first
    const booksData = booksNames.map((bookDir) => {
      const bookPath = path.join(versionPath, bookDir, `${bookDir}.json`);
      const bookData = JSON.parse(fs.readFileSync(bookPath, "utf-8"));
      return {
        bookDir,
        data: bookData,
      };
    });

    // Batch insert books
    const bookRecords = await db
      .insert(books)
      .values(
        booksData.map((book, index) => ({
          versionId: version.id,
          abbreviation: book.data.id,
          name: book.data.name,
          order: index + 1,
        }))
      )
      .returning();

    console.log(`Inserted ${bookRecords.length} books`);

    // Process verses in batches
    for (let i = 0; i < bookRecords.length; i++) {
      const bookRecord = bookRecords[i];
      const bookData = booksData[i].data;
      const versesData = [];

      // Prepare verses data
      for (
        let chapterIndex = 0;
        chapterIndex < bookData.chapters.length;
        chapterIndex++
      ) {
        const chapter = bookData.chapters[chapterIndex];
        for (let verseIndex = 0; verseIndex < chapter.length; verseIndex++) {
          versesData.push({
            bookId: bookRecord.id,
            chapter: chapterIndex + 1,
            verse: verseIndex + 1,
            text: chapter[verseIndex],
          });
        }
      }

      // Insert verses in batches
      for (let j = 0; j < versesData.length; j += BATCH_SIZE) {
        const batch = versesData.slice(j, j + BATCH_SIZE);
        await db.insert(verses).values(batch);

        // Log progress
        const progress = Math.min(j + BATCH_SIZE, versesData.length);
        console.log(
          `${bookData.name}: Inserted ${progress}/${versesData.length} verses`
        );
      }

      console.log(`Completed book: ${bookData.name}`);
    }

    console.log("Migration completed successfully");
  } catch (error) {
    console.error("Migration failed:", error);
  } finally {
    await client.end();
  }
}

migrate();
