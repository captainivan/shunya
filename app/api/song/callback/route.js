import ImageKit from "imagekit";
import { runWorkFlow } from "../../youtube/workflow";

export async function POST(req) {
    try {
        const body = await req.json();
        console.log("🎵 Music Callback Received:", body);

        const callbackType = body?.data?.callbackType;

        // ⏳ Not finished yet
        if (callbackType !== "complete") {
            console.log("⏳ Music not finished yet. Stage:", callbackType);
            return Response.json({ ok: true, stage: callbackType });
        }

        console.log("✔ COMPLETE CALLBACK DETECTED");

        const rawData = body?.data?.data;

        if (!rawData || !Array.isArray(rawData) || rawData.length === 0) {
            console.log("❌ No audio data array found");
            return Response.json({ ok: false, error: "No audio data array" });
        }

        // Extract audio URL
        const audioObj = rawData.find(
            (item) => item.audio_url || item.audioUrl
        );

        if (!audioObj) {
            console.log("❌ No audio URL found");
            return Response.json({ ok: false, error: "audio URL missing" });
        }

        const audioUrl = audioObj.audio_url || audioObj.audioUrl;
        console.log("🔗 Final Audio URL:", audioUrl);

        // Download audio file
        const audioRes = await fetch(audioUrl);
        const audioBuffer = Buffer.from(await audioRes.arrayBuffer());

        // Upload to ImageKit
        const imagekit = new ImageKit({
            publicKey: process.env.IMAGEKIT_PUBLIC_URL,
            privateKey: process.env.IMAGEKIT_PRIVATE_URL,
            urlEndpoint: process.env.IMAGEKIT_ENDPOINT_URL
        });

        // upload a local file
        const audioUpload = await imagekit.upload({
            file: audioBuffer,
            fileName: "audio.mp3",
            fileId: "6938f6d25c7cd75eb83409a6",
            overwriteFile: true,
            useUniqueFileName: false
        });

        console.log("📤 Audio uploaded to imageKit");


        await runWorkFlow("startSubtitlesGeneration");

        return Response.json({
            ok: true,
            status: "saved"
        });

    } catch (err) {
        console.error("❌ Callback Error:", err);
        return Response.json({ ok: false, error: err.message }, { status: 500 });
    }
}