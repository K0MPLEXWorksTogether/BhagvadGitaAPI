const { createClient } = require("@supabase/supabase-js");
const { config } = require("dotenv");

const fs = require("fs");
const path = require("path");
const os = require("os");
const express = require("express");

config();
const supabaseURL = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE;

const supabase = createClient(supabaseURL, supabaseKey);

async function saveMp3(chapter, verse) {
  try {
    const { data, error } = await supabase.storage
      .from("audio-files")
      .download(`${chapter}-${verse}.mp3`);

    if (error) {
      console.error(error);
      return;
    }

    const buffer = Buffer.from(await data.arrayBuffer());
    const filePath = path.join(os.tmpdir(), `${chapter}-${verse}.mp3`);

    fs.writeFileSync(filePath, buffer);
    return filePath;
  } catch (err) {
    console.error("Error in saving mp3: ", err);
  }
}

async function deleteMp3(filePath) {
  try {
    fs.unlinkSync(filePath);
    console.log("File at", filePath, "deleted successfully.");
  } catch (err) {
    console.error("Error deleteing file: ", err);
  }
}

module.exports = {
  deleteMp3,
  saveMp3
}