import { runWorkFlow } from "@/app/api/youtube/workflow";
import ImageKit from "imagekit";

export const generateSubtitles = async () => {
    try {
        console.log("🎧 Generating subtitles…");

        const audioUrl = `https://ik.imagekit.io/lunarivanfiles/audio.mp3?updatedAt=${Date.now()}`;
        console.log("Using audio:", audioUrl);

        // 1️⃣ DOWNLOAD the audio file first (ElevenLabs requires binary)
        const audioResponse = await fetch(audioUrl);
        const audioBuffer = Buffer.from(await audioResponse.arrayBuffer());

        // 2️⃣ Create multipart/form-data
        const form = new FormData();
        form.append("file", new Blob([audioBuffer]), "audio.mp3");
        form.append("model_id", "scribe_v1");

        // 3️⃣ Send request to ElevenLabs
        const response = await fetch("https://api.elevenlabs.io/v1/speech-to-text", {
            method: "POST",
            headers: {
                "xi-api-key": process.env.ELEVENLABS_API_KEY,
            },
            body: form
        });

        if (!response.ok) {
            const txt = await response.text();
            throw new Error("ElevenLabs STT failed: " + txt);
        }

        const result = await response.json();
        console.log("📝 Subtitles received from ElevenLabs");

        // 4️⃣ Convert subtitles to buffer
        const subtitleBuffer = Buffer.from(JSON.stringify(result, null, 2));

        const imagekit = new ImageKit({
            publicKey: process.env.IMAGEKIT_PUBLIC_URL,
            privateKey: process.env.IMAGEKIT_PRIVATE_URL,
            urlEndpoint: process.env.IMAGEKIT_ENDPOINT_URL
        });

        // 5️⃣ Upload subtitles.json to ImageKit
        const subtitleUpload = await imagekit.upload({
            file: subtitleBuffer,
            fileName: "subtitles.json",
            fileId: "69392dbc5c7cd75eb8ef9df6",
            overwriteFile: true,
            useUniqueFileName: false
        });

        console.log("✅ Subtitles uploaded:");

    } catch (err) {
        console.error("❌ Subtitle generation failed:", err);
        return null;
    }
};
