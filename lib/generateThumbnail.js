import { ImageResponse } from "@vercel/og";
import ImageKit from "imagekit";

export const generateThumbnail = async () => {
  try {
    console.log("🖼️ Generating Thumbnail…");

    const basicDataUrl=`https://ik.imagekit.io/lunarivanfiles/basicData.json?updatedAt=${Date.now()}`
    const bgUrl=`https://ik.imagekit.io/lunarivanfiles/bgImage.jpg?updatedAt=${Date.now()}`

    // ----------------------------------------------------
    // 1️⃣ Load basicData.json from ImageKit
    // ----------------------------------------------------
    const basicRes = await fetch(basicDataUrl);
    if (!basicRes.ok) throw new Error("Failed to fetch basicData.json");

    const basicData = await basicRes.json();
    const title = basicData.title || "Shunya";

    const fontRes = await fetch(
      "https://ik.imagekit.io/lunarivanfiles/LuckiestGuy-Regular.ttf"
    );

    const fontBuffer = await fontRes.arrayBuffer();

    // ----------------------------------------------------
    // 4️⃣ Generate thumbnail using OG renderer
    // ----------------------------------------------------
    const image = new ImageResponse(
      (
        <div
          style={{
            width: "1200px",
            height: "630px",
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
            style: "normal",
          },
        ],
      }
    );

    const arrayBuf = await image.arrayBuffer();
    const pngBuffer = Buffer.from(arrayBuf);

    // ----------------------------------------------------
    // 5️⃣ Upload thumbnail to ImageKit
    // ----------------------------------------------------
    const imagekit = new ImageKit({
        publicKey: process.env.IMAGEKIT_PUBLIC_URL,
        privateKey: process.env.IMAGEKIT_PRIVATE_URL,
        urlEndpoint: process.env.IMAGEKIT_ENDPOINT_URL
    });

    // 5️⃣ Upload thumbnail.jpg to ImageKit
    const thumbnailUpload = await imagekit.upload({
        file: pngBuffer,
        fileName: "thumbnail.jpg",
        fileId:process.env.THUMBNAIL_FILE_ID,
        overwriteFile: true,
        useUniqueFileName: false
    });

    console.log("✅ Thumbnail uploaded");
    
  } catch (err) {
    console.error("❌ Thumbnail generation error:", err);
    return null;
  }
};