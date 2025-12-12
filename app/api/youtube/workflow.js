import ImageKit from "imagekit";
import { generateVdieoBasicData } from "@/lib/generateVideoBasicData";
import { generateSong } from "@/lib/generateSong";
import { generateSubtitles } from "@/lib/generateSubtitles";
import { generateBgImage } from "@/lib/generateBgImage";
import { generateThumbnail } from "@/lib/generateThumbnail";


const imagekit = new ImageKit({
    publicKey: process.env.IMAGEKIT_PUBLIC_URL,
    privateKey: process.env.IMAGEKIT_PRIVATE_URL,
    urlEndpoint: process.env.IMAGEKIT_ENDPOINT_URL
});

export const runWorkFlow = async (initialStage) => {
    try {
        console.log("---- Workflow Started ----");

        let stage = initialStage;

        while (stage) {
            console.log(`Stage: ${stage}`);

            if (stage === "basicDataGenerationStart") {
                const basicData = await generateVdieoBasicData();
                console.log("Basic Data Generated:", basicData.title);

                const buffer = Buffer.from(JSON.stringify(basicData, null, 2), "utf8");

                await imagekit.upload({
                    file: buffer,
                    fileName: "basicData.json",
                    fileId: process.env.BASICDATA_FILE_ID,
                    overwriteFile: true,
                    useUniqueFileName: false
                });

                console.log("📤 basicData.json uploaded: on imagekit");
                stage = "songGenerationStart";
                continue;
            }

            if (stage === "songGenerationStart") {
                const songGen = await generateSong();
                console.log("🎵 Song generation started", songGen);

                // STOP workflow here until callback arrives
                return { success: true, waiting_for: "song_generation" };
            }

            if (stage === "startSubtitlesGeneration") {
                console.log("🎬 Generating subtitles…");

                await generateSubtitles();
                console.log("subtitles generate and saved to imagekit");

                stage = "startBgImageGeneration";
                continue;
            }

            if (stage === "startBgImageGeneration") {
                console.log("Generating BgImage...");

                await generateBgImage();
                console.log("BgImage generated and saved to imagekit");

                stage = "startThubnailGeneration";
                continue;
            }

            if (stage === "startThubnailGeneration") {
                console.log("Generating Thubnail...");

                await generateThumbnail();
                console.log("Thubnail generated and saved to imagekit");

                stage = "startGithubAction";
                continue;
            }

            if (stage === "startGithubAction") {
                console.log("Starting Github Action...");

                const res = await fetch("https://youtube-render.vercel.app/api/demo-trigger", {
                    method: "GET",
                });

                if (!res.ok) {
                    const text = await res.text();
                    throw new Error(`Failed to trigger GitHub Action: ${text}`);
                }

                console.log("Github Action Started:", await res.json());
                return { success: true, message: "Workflow complete" };
            }

            // Safety stop
            console.warn("Reached unknown stage:", stage);
            return { success: false, error: "Unknown stage " + stage };
        }

    } catch (err) {
        console.error("❌ Workflow Failed:", err);
        return { success: false, error: err.message };
    }
};
