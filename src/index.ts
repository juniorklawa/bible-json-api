import fs from "fs";

const versionPath = "./versions/pt-br/nvi/";

// loop through the versionPath and get the books names
const booksNames = fs.readdirSync(versionPath);

// loop through the booksNames and get the books names
const books = booksNames.map((book) => {
  return {
    id: book,
    path: `${versionPath}/${book}`,
  };
});

// now inside each book folder get the book.id.json file and the you will have this structure:

//{
// "id": "1ch",
// "name": "1 Crônicas",
// "chapters": [
// [
// "Adão, Sete, Enos,",
