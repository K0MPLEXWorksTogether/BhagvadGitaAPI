const { verseData } = require("./dbUtil.js");
const express = require("express");
const app = express();
const port = 3000;

app.get("/", async (req, res) => {
  return res.status(200).json({"message": "Welcome to the bhagvad gita API. Available routes are /verse and /audio."})
})

app.get("/verse", async (req, res) => {
  try {
    const chapter = req.query.chapter;
    const verse = req.query.verse;

    if (!chapter || !verse || isNaN(chapter) || isNaN(verse)) {
      return res
        .status(400)
        .json({
          error: "Chapter and verse must be numbers, and greater than 0.",
        });
    } else {
        console.log(`Request recieved for ${chapter}, ${verse}.`)
    }

    const data = await verseData(parseInt(chapter), parseInt(verse));

    if (!data) {
      res.status(404).json({ error: "Verse not found." });
    }

    res.status(200).json(data);
  } catch (err) {
    console.error("Error Occured: ", err);
    res
      .status(500)
      .json({ error: "An unexpected error occured. Try again later." });
  }
});

app.listen(port, () => {
    console.log(`Server Running At http://localhost:${port}`)
})
