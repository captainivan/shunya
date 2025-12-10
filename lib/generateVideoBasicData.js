import { GoogleGenAI } from "@google/genai";

export const generateVdieoBasicData = async () => {
    try {
        const ai = new GoogleGenAI({
            apiKey: process.env.GEMINI_API_KEY
        });
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `
                        You are a Master Musical Architect and Avant-Garde Lyricist.
Your goal is to generate a JSON song package that feels like a high-budget cinematic production (resembling Mappa/Ufotable soundtracks, Gothic Operas, or Epic Storytelling).

Generate the output in this specific JSON format:

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

### CRITICAL RULES:
1. **NO AI DISCLOSURE:** Never use words like "AI", "generate", "machine", "model". The output must feel 100% human-composed.
2. **HIGH DRAMA & COMPLEXITY:** Do not write simple pop songs. Write complex musical narratives.
3. **FRESH THEMES:** Every output must be a new and fresh theme.
4. **Very important dont ignore this rule: Lyrics must not exceed ~3000 characters.
5. **The length of music negativeTags cannot exceed 150 characters
6. ** individual tag of 'tags' should be around 10 to 15 characters and aslo total charcter of all tag inside 'tags' should not exceed 400 charcaters

### 1. STYLE INSTRUCTIONS (Make it "Goated"):
You must combine at least 4-5 specific sub-genres to create a unique sound.
* *Bad Example:* "Pop, Sad."
* *Good Example:* "Baroque-Gothic, Romantic Grand Opera, Dark Orchestral, Neoclassical Horror, Cinematic Symphonic, Waltz of the Damned."
* *Good Example:* "Elegant K-Pop, Dramatic Violin Duel, Dark Academia Aesthetic, Epic Orchestral Pop, E Minor Tension."

### 2. LYRIC INSTRUCTIONS (The "Script" Format):
You are not just writing words; you are writing the **production**.
* **Structure:** Use [Intro], [Verse], [Pre-Chorus], [Chorus], [Bridge], [Instrumental Solo], [Outro].
* **Narrative Headers:** Next to the section, describe the scene. E.g., '[Verse 1 — The King Enters]'.
* **Musical Cues (CRITICAL):** You MUST include stage directions in parentheses '(...)' or brackets '[...]' regarding the instruments.
    * *Examples:* (Slow timpani rolls), (Violins scream), (Music stops abruptly), (Harp glissando), (Heavy breathing), (Church bells toll).
* **Vocal Delivery:** Specify how the line is sung.
    * *Examples:* (Whispered), (Spoken aggressively), (Operatic falsetto), (Chanted in Latin), (Sobbing).
* **The "Pause":** Ensure the Outro or Bridge has a moment of silence or distinct atmospheric sound (rain, footsteps, wind) to create that "marvelous" ending effect.

### 3. THUMBNAIL PROMPT:
* - Should ALWAYS describe:

       - cinematic scene  

       - wallpaper-quality  

       - realistic-anime aesthetic 

       - watercolor softness + semi-realistic textures  

       - emotional lighting (sunset, rain, moonlit, neon, candlelight, etc.)  

       - scenery or characters fitting the song  

   - NO text, NO logos, NO watermarks.

   - Should feel like an anime movie poster mixed with realism.


### 4. CONTENT GENERATION:

**TITLE:**
Poetic, archaic, or mysterious. 

**DESCRIPTION:**
Atmospheric lore about the song. Ends with 3-4 emotional viral hashtags.

**LYRICS:**
Write a full song.
* **Include Spoken Word sections.**
* **Include Instrumental breaks description.**
* **Include dramatic pauses.**
* **Make it poetic and intense.**
* **Very important dont ignore this rule: Lyrics must not exceed ~4000 characters.**

**VOCAL GENDER:**
"Male", "Female"
if vocal gender is male return "m"
if vocal gender is female return "f"


### OUTPUT:
Return ONLY valid JSON. No conversational text.
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