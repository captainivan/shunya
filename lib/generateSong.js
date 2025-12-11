const KIE_KEYS = [
  process.env.KIE_API_KEY_1,
  process.env.KIE_API_KEY_2,
  process.env.KIE_API_KEY_3,
  process.env.KIE_API_KEY_4,
  process.env.KIE_API_KEY_5,
  process.env.KIE_API_KEY_6,
  process.env.KIE_API_KEY_7,
  process.env.KIE_API_KEY_8,
  process.env.KIE_API_KEY_9,
  process.env.KIE_API_KEY_10,
  process.env.KIE_API_KEY_11
];

export const generateSong = async () => {
  try {
    console.log("🎶 Loading basicData.json from ImageKit...");

    // ImageKit public URL to load basicData.json
    const basicDataUrl = `https://ik.imagekit.io/lunarivanfiles/basicData.json?updatedAt=${Date.now()}`

    // Fetch JSON from Supabase
    const basicDataRes = await fetch(basicDataUrl);
    const basicData = await basicDataRes.json();

    console.log("Using basicData for song:", basicData.title);

    // Prepare request body for KIE API
    const requestBody = {
      prompt: basicData.lyrics,
      style: basicData.style,
      title: basicData.title,
      customMode: true,
      instrumental: false,
      model: "V5",
      callBackUrl: `${process.env.BASE_URL}/api/song/callback`,
      negativeTags: basicData.negativeTags,
      vocalGender: basicData.vocalGender,
      styleWeight: 0.65,
      weirdnessConstraint: 0.65,
      audioWeight: 0.65,
    };

    let lastError = null;

    // Try each API key
    for (let i = 0; i < KIE_KEYS.length; i++) {
      const key = KIE_KEYS[i];
      if (!key) continue;

      console.log(`🔑 Trying API key ${i + 1}/${KIE_KEYS.length}`);

      const response = await fetch("https://api.kie.ai/api/v1/generate", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${key}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();

      // If success
      if (data?.data?.taskId) {
        console.log("🎧 Success using key", i + 1);
        return data.data; // return taskId + job data
      }

      console.error("❌ Key failed:", data);
      lastError = data;
    }

    throw new Error(
      "All KIE API keys failed. Last error: " + JSON.stringify(lastError)
    );

  } catch (error) {
    console.error("❌ generateSong() ERROR:", error);
    return null;
  }
};