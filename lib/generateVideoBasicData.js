import { GoogleGenAI } from "@google/genai";
import { songGenre } from "./genreData";

export const generateVdieoBasicData = async () => {
    try {
        const genre = songGenre[Math.floor(Math.random() * songGenre.length)]
        const data = await fetch(`https://ik.imagekit.io/lunarivanfiles/basicData.json?updatedAt=${Date.now()}`);
        const songDetails = await data.json();
        const ai = new GoogleGenAI({
            apiKey: process.env.GEMINI_API_KEY
        });
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            generationConfig: {
                temperature: 1.25,
                topP: 0.9,
                topK: 80
            },
            contents:
                `
Below is the previous song JSON that must be avoided entirely.

================ FORBIDDEN ZONE =================
Do NOT repeat, echo, mirror, or resemble ANY part of the previous song:
- style or genre handling
- tone or emotional arc
- structure or section flow
- metaphors or symbolism
- rhyme behavior or lyric pacing
- naming logic or titles
- worldbuilding or narrative logic

${JSON.stringify(songDetails, null, 2).replace(/`/g, "'")}

================================================

You are now creating a COMPLETELY NEW song.

GENRE FOCUS: ${genre} Genre

The song MUST clearly belong to ${genre} Genre,
but must exist in a DIFFERENT:
- universe
- era
- culture
- worldview
- emotional philosophy

No creative decision may be reused from the previous song.

---------------- VOCAL RULE ----------------
If previous "vocalGender" was "f" → MUST be "m".
If previous "vocalGender" was "m" → MUST be "f".
--------------------------------------------

---------------- HARD RESET ----------------
If ANY similarity is detected, you MUST internally discard
the song and rebuild it from zero with:
- new setting
- new emotional temperature
- new musical architecture
- new symbolism system
- new rhythm logic
- new dramatic intent

The result must feel written by a DIFFERENT composer
from a DIFFERENT historical moment.
--------------------------------------------

You are a Master Musical Architect and Avant-Garde Lyricist.
Create a VIRAL-LEVEL, cinematic, high-budget song
that fully embodies ${genre} Genre.

================ OUTPUT FORMAT =================
RETURN ONLY VALID JSON:

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
================================================

================ ABSOLUTE RULES ================
1. NO AI DISCLOSURE — never mention AI, model, system, generation.
2. HIGH IMPACT — emotionally intense, memorable, dramatic.
3. STRONG IDENTITY — instantly recognizable as ${genre} Genre.
4. LYRICS ≤ 2000 characters.
5. negativeTags ≤ 150 characters.
6. Each tag: 10–15 characters.
   Total tag characters ≤ 400.
================================================

================ STYLE DESIGN ==================
Fuse ${genre} Genre with 4–5 distinct sub-styles.
The fusion must feel:
- bold
- modern
- non-generic
- non-template
================================================

=========== LYRICAL STRUCTURE ==================
Lyrics MUST include all sections:
[Intro]
[Verse]
[Pre-Chorus]
[Chorus]
[Bridge]
[Instrumental Solo]
[Outro]

Each section MUST include:
- brief scene description
- instrument cues (e.g., (Harp glissando), (Low bass pulse))
- vocal delivery cues (Whispered, Chanted, Falsetto, Spoken)
- atmospheric pauses (wind, silence, footsteps)
================================================

=========== THUMBNAIL PROMPT RULES ==============
thumbnailPrompt MUST describe:
- cinematic scene
- wallpaper-quality framing
- realistic-anime aesthetic
- watercolor softness + semi-realistic textures
- strong emotional lighting (sunset, rain, moonlight, neon, candlelight)
- characters or scenery matching the song’s world

STRICTLY FORBIDDEN:
- text
- logos
- watermarks
================================================

FINAL COMMAND:
Return ONLY the JSON object.
No markdown.
No commentary.
No explanation.



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