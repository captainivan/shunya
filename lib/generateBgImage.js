import ImageKit from "imagekit";


export const generateBgImage = async () => {
    try {
        console.log("🖼️ Generating Background Image…");

        const basicDataUrl = `https://ik.imagekit.io/lunarivanfiles/basicData.json?updatedAt=${Date.now()}`


        // 1️⃣ Fetch basicData.json from imageKit
        const res = await fetch(basicDataUrl);
        if (!res.ok) throw new Error("Failed to load basicData.json from imageKit");

        const basicData = await res.json();
        const prompt = basicData.thumbnailPrompt || basicData.title || "art";

        console.log("🎨 Using prompt:", prompt);

        // 2️⃣ Call your Cloudflare Worker image generator
        const imgRes = await fetch("https://image-gen.ivancap7777.workers.dev", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${process.env.IMAGE_GEN_API_KEY}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ prompt }),
        });

        if (!imgRes.ok) {
            const errText = await imgRes.text();
            throw new Error(`Image generation failed (${imgRes.status}): ${errText}`);
        }


        const arrayBuffer = await imgRes.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // 3️⃣ Upload background image to imageKit
        const imagekit = new ImageKit({
            publicKey: process.env.IMAGEKIT_PUBLIC_URL,
            privateKey: process.env.IMAGEKIT_PRIVATE_URL,
            urlEndpoint: process.env.IMAGEKIT_ENDPOINT_URL
        });

        // 5️⃣ Upload subtitles.json to ImageKit
        const bgImageUpload = await imagekit.upload({
            file: buffer,
            fileName: "bgImage.jpg",
            fileId:process.env.BGIMAGE_FILE_ID,
            overwriteFile: true,
            useUniqueFileName: false
        });

        console.log("✅ Background image uploaded:");



    } catch (err) {
        console.error("❌ BgImage generation error:", err);
        return null;
    }
};