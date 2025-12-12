import { GoogleGenAI } from "@google/genai";

export const generateVdieoBasicData = async () => {
    try {
        const data = await fetch(`https://ik.imagekit.io/lunarivanfiles/basicData.json?updatedAt=${Date.now()}`);
        const songDetails = await data.json();
        const ai = new GoogleGenAI({
            apiKey: process.env.GEMINI_API_KEY
        });
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents:
                `
Below is the previous song JSON that must be avoided entirely.
Do NOT repeat ANY part of its style, tone, themes, structure, metaphors, emotional arc, rhyme behavior, naming patterns, or worldbuilding.

### PREVIOUS SONG (FORBIDDEN ZONE)
${JSON.stringify(songDetails, null, 2).replace(/`/g, "'")}

### VOCAL GENDER RULE
If the previous song used "vocalGender": "f", the new one MUST use "m".
If the previous song used "vocalGender": "m", the new one MUST use "f".

### HARD ANTI-REPETITION ENGINE
If ANY element of your output resembles the previous song by even 5%, you must completely reinvent the song:
- new universe  
- new cultural influence  
- new emotional temperature  
- new poetic language  
- new musical architecture  
- new aesthetic tone  
- new symbolism  
- new rhythm and pacing  
- new world, lore, and imagery  
- new dramatic essence  

Every song must feel like it was created by a DIFFERENT composer from a DIFFERENT era with a DIFFERENT worldview.

Now Lets start generating the new song.
You are a Master Musical Architect and Avant-Garde Lyricist.
Your goal is to generate a JSON song package that feels like a high-budget cinematic production

### JSON OUTPUT FORMAT (RETURN ONLY VALID JSON)
{
  "title": "",
  "desc": "",
  "tags": [],
  "thumbnailPrompt": "",
  "lyrics": "",
  "style": "",
  "negativeTags": "",
  "vocalGender": ""
}

### SUPER CRITICAL RULES
1. NO AI DISCLOSURE — never use words like AI, machine, model, generate.
2. HIGH DRAMA — lyrics must be cinematic, theatrical, complex.
3. NEW THEME — must NOT resemble previous worlds or moods.
4. LYRICS LIMIT — must not exceed 2000 characters.
5. negativeTags < 150 characters.
6. individual tag of 'tags' should be around 10 to 15 characters and aslo total charcter of all tag inside 'tags' should not exceed 400 charcaters

### STYLE REQUIREMENTS
Fuse at least 4–5 highly specific subgenres (unique combination every time).

### LYRICAL PRODUCTION INSTRUCTIONS
Song must include:
- [Intro], [Verse], [Pre-Chorus], [Chorus], [Bridge], [Instrumental Solo], [Outro]
- Scene descriptions in headers
- Instrument cues (e.g., (Harp glissando), (Timpani rumble))
- Vocal delivery cues (Whispered, Spoken, Chanted, Falsetto)
- Atmospheric pauses (wind, footsteps, silence)

### 3. THUMBNAIL PROMPT:
* - Should ALWAYS describe:

       - cinematic scene  

       - wallpaper-quality  

       - realistic-anime aesthetic 

       - watercolor softness + semi-realistic textures  

       - emotional lighting (sunset, rain, moonlit, neon, candlelight, etc.)  

       - scenery or characters fitting the song  

   - NO text, NO logos, NO watermarks.


### FINAL INSTRUCTION
Return ONLY the JSON object. 
No markdown, no commentary, no explanation.


                `,
        });
        let raw = response.text;
        raw = raw
            .replace(/```json/gi, "")
            .replace(/```/g, "")
            .trim();
        const json = JSON.parse(raw);

        return json;
    } catch (error) {
        console.log(error)
    }
}