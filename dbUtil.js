const dotenv = require("dotenv");
const libsql = require("@libsql/client");
const data = require("./data.json");

dotenv.config();

const turso = libsql.createClient({
  url: process.env.TURSO_DB_URL,
  authToken: process.env.TURSO_DB_API_TOKEN,
});

async function createTable() {
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS verses (
      chapter INTEGER,
      verse INTEGER,
      originalVerse TEXT,
      transliteration TEXT,
      translation TEXT,
      commentary TEXT,
      wordMeanings TEXT
    );
  `;

  try {
    await turso.execute(createTableQuery);
    console.log("Table 'verses' created successfully.");
  } catch (err) {
    console.error("Error creating table: ", err);
  }
}

async function selectTableHead() {
  const selectTableHeadQuery = `SELECT * FROM verses LIMIT 5`;

  try {
    const head = await turso.execute(selectTableHeadQuery);
    return head.rows;
  } catch (err) {
    console.error("Error selecting table: ", err);
  }
}

async function insertData() {
  const insertDataQuery = `
    INSERT INTO verses (chapter, verse, originalVerse, transliteration, translation, commentary, wordMeanings)
    VALUES (?, ?, ?, ?, ?, ?, ?);
  `;

  const batchQueries = [];

  try {
    for (const verse of data) {
      const {
        chapter,
        verse: verseNumber,
        originalVerse,
        transliteration,
        translation,
        commentary,
        wordMeanings,
      } = verse;

      batchQueries.push({
        sql: insertDataQuery,
        args: [
          chapter,
          verseNumber,
          originalVerse,
          transliteration,
          translation,
          commentary,
          wordMeanings,
        ],
      });

      if (batchQueries.length >= 100) {
        await turso.batch(batchQueries, "write");
        console.log(`Batch of ${batchQueries.length} verses inserted.`);
        batchQueries.length = 0;
      }
    }

    if (batchQueries.length > 0) {
      await turso.batch(batchQueries, "write");
      console.log(`Batch of ${batchQueries.length} verses inserted.`);
    }

    console.log("All verses inserted successfully.");
  } catch (err) {
    console.error("Error inserting data: ", err);
  }
}

async function verseData(chapter, verse) {
  const verseDataQuery = `SELECT * FROM verses WHERE chapter=? AND verse=?;`;

  try {
    const data = await turso.execute(verseDataQuery, [chapter, verse]);
    return data.rows[0];
  } catch (err) {
    console.error("Error retrieving verse data: ", err);
  }
}

async function truncateTable() {
  const truncateTableQuery = `DELETE FROM verses`;

  try {
    await turso.execute(truncateTableQuery);
    console.log("'verses' table successfully truncated.");
  } catch (err) {
    console.log("Error truncating table: ", err);
  }
}

const main = async () => {
  console.log(await verseData(1, 1));
};

module.exports = {
  verseData
}