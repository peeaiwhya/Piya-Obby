import { GoogleGenAI, Type, Schema } from "@google/genai";
import { LevelBlock, BlockType } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const levelSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    blocks: {
      type: Type.ARRAY,
      description: "List of blocks that make up the level.",
      items: {
        type: Type.OBJECT,
        properties: {
          x: { type: Type.NUMBER, description: "X coordinate (0-4000)" },
          y: { type: Type.NUMBER, description: "Y coordinate (0-600). 0 is top, 600 is bottom. Ground is usually around 500-550." },
          width: { type: Type.NUMBER, description: "Width of the block" },
          height: { type: Type.NUMBER, description: "Height of the block" },
          type: { 
            type: Type.STRING, 
            enum: [BlockType.PLATFORM, BlockType.LAVA, BlockType.FINISH, BlockType.CHECKPOINT],
            description: "Type of the game object"
          },
          color: { type: Type.STRING, description: "Hex color code suitable for the theme" }
        },
        required: ["x", "y", "width", "height", "type", "color"]
      }
    },
    backgroundColor: { type: Type.STRING, description: "Hex code for sky/background color" }
  },
  required: ["blocks", "backgroundColor"]
};

export const generateLevel = async (prompt: string, difficulty: string): Promise<{ blocks: LevelBlock[], backgroundColor: string }> => {
  try {
    const model = 'gemini-2.5-flash';
    
    const sysInstruct = `
      You are a professional Level Designer for a 2D Platformer "Obby" (Obstacle Course) game.
      Coordinate System: 
      - X starts at 0. Positive X is right.
      - Y starts at 0 (top) to 600 (bottom).
      - Player spawns at x=50, y=400.
      
      Design Guidelines:
      1. **Linear Progression**: Create a course from Left (X=0) to Right (X=3000 to 5000).
      2. **Physics Constraints**:
         - Max Horizontal Jump: ~180px.
         - Max Vertical Jump: ~120px.
         - Do not place platforms too far apart.
      3. **Block Types**:
         - 'platform': Safe ground. Use varied sizes.
         - 'lava': Instant death. Place at the bottom of the world (Y=580) or on top of platforms as traps.
         - 'checkpoint': Safe zones. Place one every ~800-1000 pixels on a safe platform.
         - 'finish': A large distinctive block at the very end.
      4. **Difficulty Configuration ('${difficulty}')**:
         - Easy: Continuous ground, few gaps, lava only at the very bottom Y=590.
         - Medium: Floating platforms, moderate gaps (50-100px), some lava traps.
         - Hard: Small platforms, large gaps (120-150px), verticality, tricky jumps, lots of lava.
      5. **Aesthetics**:
         - Use 'backgroundColor' to match the theme mood.
         - Use 'color' for blocks that fit the theme: "${prompt}".
         
      Important: Ensure there is a platform under the spawn point (x=50, y=450-500).
    `;

    const response = await ai.models.generateContent({
      model: model,
      contents: `Generate a level JSON based on this theme: ${prompt}`,
      config: {
        systemInstruction: sysInstruct,
        responseMimeType: "application/json",
        responseSchema: levelSchema,
        temperature: 0.7, // Slightly creative but structured
      }
    });

    const json = JSON.parse(response.text);
    return json;
  } catch (error) {
    console.error("Gemini Level Generation Error:", error);
    throw error;
  }
};
