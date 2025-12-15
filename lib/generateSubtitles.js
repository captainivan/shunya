import ImageKit from "imagekit";
import { AssemblyAI } from "assemblyai";

const ASSEMBLY_AI_API_KEYS = [
    process.env.ASSEMBLY_AI_API_KEY_1,
    process.env.ASSEMBLY_AI_API_KEY_2,
    process.env.ASSEMBLY_AI_API_KEY_3,
]

export const generateSubtitles = async () => {
    console.log("🎧 Generating subtitles…");

    const audioUrl = `https://ik.imagekit.io/lunarivanfiles/audio.mp3?updatedAt=${Date.now()}`;
    console.log("Using audio:", audioUrl);

    let transcript = null;
    let lastError = null;

    for (let i = 0; i < ASSEMBLY_AI_API_KEYS.length; i++) {
        const key = ASSEMBLY_AI_API_KEYS[i];
        if (!key) continue;

        console.log(`🔑 Trying API key ${i + 1}/${ASSEMBLY_AI_API_KEYS.length}`);

        try {
            const client = new AssemblyAI({ apiKey: key });

            const response = await client.transcripts.transcribe({
                audio: audioUrl,
                speech_models: ["universal"],
            });

            if (response.status === "completed") {
                console.log("✅ Transcription completed:", response.id);
                transcript = response;
                break;
            }

            if (response.status === "error") {
                console.error(`❌ API key ${i + 1} failed:`, response.error);
                lastError = response.error;
                continue;
            }

            console.warn(`⏳ API key ${i + 1} returned status:`, response.status);
            lastError = response.status;

        } catch (err) {
            console.error(`🔥 API key ${i + 1} threw error:`, err.message);
            lastError = err;
            continue;
        }
    }

    if (!transcript) {
        throw new Error(`All AssemblyAI API keys failed: ${lastError}`);
    }

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
};
