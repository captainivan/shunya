import ImageKit from "imagekit";
import satori from "satori";
import sharp from "sharp";

export const generateThumbnail = async () => {
  try {
    console.log("🖼️ Generating Thumbnail…");

    const basicDataUrl = `https://ik.imagekit.io/lunarivanfiles/basicData.json?updatedAt=${Date.now()}`;
    const bgUrl = `https://ik.imagekit.io/lunarivanfiles/bgImage.jpg?updatedAt=${Date.now()}`;

    // 1️⃣ Fetch basic data
    const basicRes = await fetch(basicDataUrl);
    if (!basicRes.ok) throw new Error("Failed to fetch basicData.json");

    const basicData = await basicRes.json();
    const title = basicData.title || "Shunya";

    // 2️⃣ Load font
    const fontRes = await fetch(
      "https://ik.imagekit.io/lunarivanfiles/LuckiestGuy-Regular.ttf"
    );
    const fontBuffer = Buffer.from(await fontRes.arrayBuffer());

    // 3️⃣ Render SVG via Satori
    const svg = await satori(
      (
        <div
          style={{
            width: 1200,
            height: 630,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            position: "relative",
            overflow: "hidden",
            backgroundColor: "black",
          }}
        >
          <img
            src={bgUrl}
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />

          <div
            style={{
              position: "absolute",
              bottom: "24%",
              width: "100%",
              textAlign: "center",
              fontSize: 120,
              fontFamily: "LuckiestGuy",
              color: "white",
              WebkitTextStroke: "4px black",
              textShadow:
                "0 4px 10px rgba(0,0,0,0.9), 0 0 25px rgba(0,0,0,0.85)",
              padding: "0 40px",
            }}
          >
            {title.toUpperCase()}
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
        fonts: [
          {
            name: "LuckiestGuy",
            data: fontBuffer,
            weight: 400,
            style: "normal",
          },
        ],
      }
    );

    // 4️⃣ Convert SVG → PNG using Sharp
    const pngBuffer = await sharp(Buffer.from(svg)).png().toBuffer();

    // 5️⃣ Upload PNG to ImageKit
    const imagekit = new ImageKit({
      publicKey: process.env.IMAGEKIT_PUBLIC_URL,
      privateKey: process.env.IMAGEKIT_PRIVATE_URL,
      urlEndpoint: process.env.IMAGEKIT_ENDPOINT_URL,
    });

    await imagekit.upload({
      file: pngBuffer,
      fileName: "thumbnail.jpg",
      fileId: process.env.THUMBNAIL_FILE_ID,
      overwriteFile: true,
      useUniqueFileName: false,
    });

    console.log("✅ Thumbnail uploaded");
  } catch (err) {
    console.error("❌ Thumbnail generation error:", err);
    return null;
  }
};
