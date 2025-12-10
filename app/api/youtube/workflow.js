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

export const runWorkFlow = async (stage) => {
    try {
        console.log("---- Workflow Started ----");

        if (stage == "basicDataGenerationStart") {

            // Generate basic data
            const basicData = await generateVdieoBasicData();
            console.log("Basic Data Generated:", basicData.title);

            // Convert JSON → Buffer
            const buffer = Buffer.from(JSON.stringify(basicData, null, 2), "utf8");


            // upload a basicData file to imagekit
            const imageUpload = await imagekit.upload({
                file: buffer,
                fileName: "basicData.json",
                fileId: "6938f10e5c7cd75eb803eac5",
                overwriteFile: true,
                useUniqueFileName: false
            });

            console.log("Upload Success:");

            console.log("📤 basicData.json uploaded: on imagekit");
            return await runWorkFlow("songGenerationStart");
        }

        if (stage == "songGenerationStart") {
            // Start generating song
            const songGeneration = await generateSong();
            console.log("🎵 Song generation started", songGeneration);

            return {
                success: true,
                status: "waiting_for_song"
            };
        }

        if (stage == "startSubtitlesGeneration") {
            console.log("🎬 Generating subtitles…");

            const subtitlesUrl = await generateSubtitles();

            console.log("subtitles generate and saved to imagekit");
            return await runWorkFlow("startBgImageGeneration");
        }

        if (stage == "startBgImageGeneration") {
            console.log("Generating BgImage...");

            const bgImage = await generateBgImage();

            console.log("BgImage generated and saved to imagekit");
            return await runWorkFlow("startThubnailGeneration");
        }

        if (stage == "startThubnailGeneration") {
            console.log("Generating Thubnail...");

            const thubnail = await generateThumbnail();

            console.log("Thubnail generated and saved to imagekit");
            return await runWorkFlow("startGithubAction");
        }

        if (stage == "startGithubAction") {
            console.log("Starting Github Action...");
        
            const githubAction = await fetch("https://youtube-render.vercel.app/api/demo-trigger", {
                method: "GET"
            });
        
            if (!githubAction.ok) {
                const errText = await githubAction.text();
                throw new Error(`Failed to trigger GitHub Action (${githubAction.status}): ${errText}`);
            }
        
            const githubActionRes = await githubAction.json();
            console.log("Github Action Started:", githubActionRes);
        
            return { success: true, message: "Workflow complete — GitHub Action triggered." };
        }        


    } catch (error) {
        console.error("❌ Workflow Failed:", error);
        return {
            success: false,
            error: error.message,
        };
    }
};