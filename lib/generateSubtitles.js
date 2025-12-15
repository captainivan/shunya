import ImageKit from "imagekit";
import { AssemblyAI } from "assemblyai";

export const generateSubtitles = async () => {
    try {
        console.log("🎧 Generating subtitles…");

        const audioUrl = `https://ik.imagekit.io/lunarivanfiles/audio.mp3?updatedAt=${Date.now()}`;
        console.log("Using audio:", audioUrl);

        const client = new AssemblyAI({
            apiKey: process.env.ASSEMBLY_AI_API_KEY,
        });

        const params = {
            audio: audioUrl,
            speech_models: ["universal"],
        };

        const transcript = await client.transcripts.transcribe(params);

        console.log("📝 Subtitles received");

        const subtitleJson = {
            id: transcript.id,
            text: transcript.text,
            words: transcript.words,
            utterances: transcript.utterances,
            confidence: transcript.confidence,
        };

        const subtitleBuffer = Buffer.from(
            JSON.stringify(subtitleJson, null, 2)
        );

        const imagekit = new ImageKit({
            publicKey: process.env.IMAGEKIT_PUBLIC_URL,
            privateKey: process.env.IMAGEKIT_PRIVATE_URL,
            urlEndpoint: process.env.IMAGEKIT_ENDPOINT_URL,
        });

        const upload = await imagekit.upload({
            file: subtitleBuffer,
            fileName: "subtitles.json",
            overwriteFile: true,
            useUniqueFileName: false,
            fileId: process.env.SUBTITLES_FILE_ID,
        });

        console.log("✅ Subtitles uploaded successfully");
        return upload;

    } catch (err) {
        console.error("❌ Subtitle generation failed:", err);
        return null;
    }
};
