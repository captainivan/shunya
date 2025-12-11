import ImageKit from "imagekit";
const ELEVENLABS_API_KEY = [
    process.env.ELEVENLABS_API_KEY_1,
    process.env.ELEVENLABS_API_KEY_2,
    process.env.ELEVENLABS_API_KEY_3
]
export const generateSubtitles = async () => {
    try {
        console.log("🎧 Generating subtitles…");

        const audioUrl = `https://ik.imagekit.io/lunarivanfiles/audio.mp3?updatedAt=${Date.now()}`;
        console.log("Using audio:", audioUrl);

        // Download audio
        const audioResponse = await fetch(audioUrl);
        const audioBuffer = Buffer.from(await audioResponse.arrayBuffer());

        // FormData
        const form = new FormData();
        form.append("file", new Blob([audioBuffer]), "audio.mp3");
        form.append("model_id", "scribe_v1");

        for (let i = 0; i < ELEVENLABS_API_KEY.length; i++) {
            const key = ELEVENLABS_API_KEY[i];
            if (!key) continue;

            console.log(`🔑 Trying API key ${i + 1}/${ELEVENLABS_API_KEY.length}`);

            try {
                const response = await fetch("https://api.elevenlabs.io/v1/speech-to-text", {
                    method: "POST",
                    headers: {
                        "xi-api-key": key,
                    },
                    body: form
                });

                if (!response.ok) {
                    const txt = await response.text();
                    console.warn(`❌ Key ${i+1} failed:`, txt);
                    continue; // TRY NEXT KEY
                }

                const result = await response.json();
                console.log("📝 Subtitles received from ElevenLabs");

                const subtitleBuffer = Buffer.from(JSON.stringify(result, null, 2));

                const imagekit = new ImageKit({
                    publicKey: process.env.IMAGEKIT_PUBLIC_URL,
                    privateKey: process.env.IMAGEKIT_PRIVATE_URL,
                    urlEndpoint: process.env.IMAGEKIT_ENDPOINT_URL
                });

                const subtitleUpload = await imagekit.upload({
                    file: subtitleBuffer,
                    fileName: "subtitles.json",
                    fileId:process.env.SUBTITLES_FILE_ID,
                    overwriteFile: true,
                    useUniqueFileName: false
                });

                console.log("✅ Subtitles uploaded");
                return subtitleUpload;

            } catch (err) {
                console.warn(`⚠️ Error using key ${i+1}:`, err.message);
                continue;
            }
        }

        console.error("❌ All API keys failed.");
        return null;

    } catch (err) {
        console.error("❌ Subtitle generation failed:", err);
        return null;
    }
};
