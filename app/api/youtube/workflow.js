import ImageKit from "imagekit";
import { generateVdieoBasicData } from "@/lib/generateVideoBasicData";
import { generateSong } from "@/lib/generateSong";
import { generateSubtitles } from "@/lib/generateSubtitles";
import { generateBgImage } from "@/lib/generateBgImage";
import { generateThumbnail } from "@/lib/generateThumbnail";

/**
 * 🔐 In-memory lock (minimum protection)
 * NOTE: For production use Redis / DB lock
 */
let workflowRunning = false;

const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_URL,
  privateKey: process.env.IMAGEKIT_PRIVATE_URL,
  urlEndpoint: process.env.IMAGEKIT_ENDPOINT_URL,
});

export const runWorkFlow = async (initialStage) => {
  if (workflowRunning) {
    console.log("⚠️ Workflow already running, skipping duplicate call");
    return;
  }

  workflowRunning = true;

  try {
    console.log("---- Workflow Started ----");

    let stage = initialStage;

    while (stage) {
      console.log(`Stage: ${stage}`);

      // ==============================
      // BASIC DATA GENERATION
      // ==============================
      if (stage === "basicDataGenerationStart") {
        const basicData = await generateVdieoBasicData();
        console.log("✅ Basic Data Generated:", basicData.title);

        const buffer = Buffer.from(
          JSON.stringify(basicData, null, 2),
          "utf8"
        );

        await imagekit.upload({
          file: buffer,
          fileName: "basicData.json",
          fileId: process.env.BASICDATA_FILE_ID,
          overwriteFile: true,
          useUniqueFileName: false,
        });

        console.log("📤 basicData.json uploaded to ImageKit");

        stage = "songGenerationStart";
        continue;
      }

      // ==============================
      // SONG GENERATION (STOP HERE)
      // ==============================
      if (stage === "songGenerationStart") {
        console.log("🎵 Starting song generation...");
        await generateSong();

        // Stop workflow until callback resumes it
        console.log("⏸️ Waiting for song generation callback");
        return;
      }

      // ==============================
      // SUBTITLES
      // ==============================
      if (stage === "startSubtitlesGeneration") {
        console.log("🎬 Generating subtitles...");
        await generateSubtitles();

        // stage = "startBgImageGeneration";
        // continue;
      }

      // ==============================
      // BACKGROUND IMAGE
      // ==============================
      if (stage === "startBgImageGeneration") {
        console.log("🖼️ Generating background image...");
        await generateBgImage();

        stage = "startThubnailGeneration";
        continue;
      }

      // ==============================
      // THUMBNAIL
      // ==============================
      if (stage === "startThubnailGeneration") {
        console.log("📸 Generating thumbnail...");
        await generateThumbnail();

        stage = "startGithubAction";
        continue;
      }

      // ==============================
      // GITHUB ACTION
      // ==============================
      if (stage === "startGithubAction") {
        console.log("🚀 Triggering GitHub Action...");

        const res = await fetch(
          "https://youtube-render.vercel.app/api/demo-trigger",
          { method: "GET" }
        );

        if (!res.ok) {
          const text = await res.text();
          throw new Error(`GitHub Action failed: ${text}`);
        }

        console.log("✅ GitHub Action triggered:", await res.json());
        return;
      }

      console.warn("⚠️ Unknown stage:", stage);
      return;
    }
  } catch (err) {
    console.error("❌ Workflow Failed:", err.message);
  } finally {
    // 🔓 Always release lock
    workflowRunning = false;
    console.log("🔓 Workflow lock released");
  }
};
