import { GoogleGenerativeAI, GenerativeModel } from "@google/generative-ai"
import fs from "fs"

interface OllamaResponse {
  response: string
  done: boolean
}

export class LLMHelper {
  private model: GenerativeModel | null = null
  private readonly systemPrompt = `
You are Wingman AI, the user's interview voice.

Your job is to generate direct, natural spoken answers in the first person ("I") — as if the user is answering live in an interview.

Do NOT describe how to answer or explain your reasoning.
Do NOT list options or steps.
Simply produce the final, fluent response that sounds confident, friendly, and professional.

Each answer should:
- Be concise (3–6 sentences).
- Sound natural when read aloud.
- Reflect the user's real experience as a QA Engineer (manual & automation testing, CI/CD, API testing, etc.).
- Use active voice and confident tone.
`
  private useOllama: boolean = false
  private ollamaModel: string = "llama3.2"
  private ollamaUrl: string = "http://localhost:11434"

  constructor(apiKey?: string, useOllama: boolean = false, ollamaModel?: string, ollamaUrl?: string) {
    this.useOllama = useOllama
    
    if (useOllama) {
      this.ollamaUrl = ollamaUrl || "http://localhost:11434"
      this.ollamaModel = ollamaModel || "gemma:latest" // Default fallback
      console.log(`[LLMHelper] Using Ollama with model: ${this.ollamaModel}`)
      
      // Auto-detect and use first available model if specified model doesn't exist
      this.initializeOllamaModel()
    } else if (apiKey) {
      const genAI = new GoogleGenerativeAI(apiKey)
      this.model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" })
      console.log("[LLMHelper] Using Google Gemini")
    } else {
      throw new Error("Either provide Gemini API key or enable Ollama mode")
    }
  }

  private async fileToGenerativePart(imagePath: string) {
    const imageData = await fs.promises.readFile(imagePath)
    return {
      inlineData: {
        data: imageData.toString("base64"),
        mimeType: "image/png"
      }
    }
  }

  private cleanJsonResponse(text: string): string {
    // Remove markdown code block syntax if present
    text = text.replace(/^```(?:json)?\n/, '').replace(/\n```$/, '');
    // Remove any leading/trailing whitespace
    text = text.trim();
    return text;
  }

  private async callOllama(prompt: string): Promise<string> {
    try {
      const response = await fetch(`${this.ollamaUrl}/api/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: this.ollamaModel,
          prompt: prompt,
          stream: false,
          options: {
            temperature: 0.7,
            top_p: 0.9,
          }
        }),
      })

      if (!response.ok) {
        throw new Error(`Ollama API error: ${response.status} ${response.statusText}`)
      }

      const data: OllamaResponse = await response.json()
      return data.response
    } catch (error) {
      console.error("[LLMHelper] Error calling Ollama:", error)
      throw new Error(`Failed to connect to Ollama: ${error.message}. Make sure Ollama is running on ${this.ollamaUrl}`)
    }
  }

  private async checkOllamaAvailable(): Promise<boolean> {
    try {
      const response = await fetch(`${this.ollamaUrl}/api/tags`)
      return response.ok
    } catch {
      return false
    }
  }

  private async initializeOllamaModel(): Promise<void> {
    try {
      const availableModels = await this.getOllamaModels()
      if (availableModels.length === 0) {
        console.warn("[LLMHelper] No Ollama models found")
        return
      }

      // Check if current model exists, if not use the first available
      if (!availableModels.includes(this.ollamaModel)) {
        this.ollamaModel = availableModels[0]
        console.log(`[LLMHelper] Auto-selected first available model: ${this.ollamaModel}`)
      }

      // Test the selected model works
      const testResult = await this.callOllama("Hello")
      console.log(`[LLMHelper] Successfully initialized with model: ${this.ollamaModel}`)
    } catch (error) {
      console.error(`[LLMHelper] Failed to initialize Ollama model: ${error.message}`)
      // Try to use first available model as fallback
      try {
        const models = await this.getOllamaModels()
        if (models.length > 0) {
          this.ollamaModel = models[0]
          console.log(`[LLMHelper] Fallback to: ${this.ollamaModel}`)
        }
      } catch (fallbackError) {
        console.error(`[LLMHelper] Fallback also failed: ${fallbackError.message}`)
      }
    }
  }

  // --- Extract problem/summary from images ---
  public async extractProblemFromImages(imagePaths: string[]) {
    try {
      const imageParts = await Promise.all(imagePaths.map(p => this.fileToGenerativePart(p)));

      const prompt = `${this.systemPrompt}
  You are viewing images that contain an interview question or technical scenario.
  Describe briefly, in natural first-person language ("I"), what the question or situation is about, as if I'm explaining it to an interviewer.
  Then give a clear, confident spoken answer that I could say during an interview.
  Be concise (3–6 sentences). Do NOT output JSON or code blocks.`;

      const result = await this.model.generateContent([prompt, ...imageParts]);
      const response = await result.response;
      return { text: response.text(), timestamp: Date.now() };
    } catch (err) {
      console.error("Error extracting problem from images:", err);
      throw err;
    }
  }

  // --- Generate a spoken interview answer ---
  public async generateSolution(problemInfo: any) {
    const prompt = `${this.systemPrompt}
  You are preparing me to answer this interview question or scenario:
  ${JSON.stringify(problemInfo, null, 2)}

  Respond in natural spoken first-person English, as if I'm speaking in the interview.
  Be confident, concise (3–6 sentences), and professional.
  Do NOT return JSON, reasoning, or code blocks — only the final answer I would say aloud.`;

    try {
      console.log("[LLMHelper] Calling Gemini LLM for spoken solution...");
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      console.log("[LLMHelper] Gemini LLM returned spoken result.");
      return { text, timestamp: Date.now() };
    } catch (err) {
      console.error("[LLMHelper] Error in generateSolution:", err);
      throw err;
    }
  }

  // --- Debug solution with new images (still conversational) ---
  public async debugSolutionWithImages(problemInfo: any, currentCode: string, debugImagePaths: string[]) {
    try {
      const imageParts = await Promise.all(debugImagePaths.map(p => this.fileToGenerativePart(p)));

      const prompt = `${this.systemPrompt}
  Given this interview question or task:
  ${JSON.stringify(problemInfo, null, 2)}

  And my current draft answer or approach:
  ${currentCode}

  Using the new information visible in these images, refine my answer.
  Output a short, improved, confident first-person response suitable for speaking aloud.
  Do NOT include JSON or reasoning — only the updated spoken answer.`;

      const result = await this.model.generateContent([prompt, ...imageParts]);
      const response = await result.response;
      return { text: response.text(), timestamp: Date.now() };
    } catch (err) {
      console.error("Error debugging solution with images:", err);
      throw err;
    }
  }

  // --- Analyze audio (spoken question) and generate direct reply ---
  public async analyzeAudioFile(audioPath: string) {
    try {
      const audioData = await fs.promises.readFile(audioPath);
      const audioPart = {
        inlineData: {
          data: audioData.toString("base64"),
          mimeType: "audio/mp3",
        },
      };

      const prompt = `${this.systemPrompt}
  Listen to this audio interview question.
  Transcribe its content internally (do not show the transcription) and then respond in the first person as if I'm answering it directly in the interview.
  Keep it short (3–6 sentences), confident, and conversational.`;

      const result = await this.model.generateContent([prompt, audioPart]);
      const response = await result.response;
      return { text: response.text(), timestamp: Date.now() };
    } catch (err) {
      console.error("Error analyzing audio file:", err);
      throw err;
    }
  }

  // --- Analyze audio from Base64 source ---
  public async analyzeAudioFromBase64(data: string, mimeType: string) {
    try {
      const audioPart = {
        inlineData: {
          data,
          mimeType,
        },
      };

      const prompt = `${this.systemPrompt}
  Listen to this interview question.
  Reply directly in first person ("I") with a short, natural spoken answer as if I'm responding to the interviewer.
  Be confident, clear, and concise (3–6 sentences).`;

      const result = await this.model.generateContent([prompt, audioPart]);
      const response = await result.response;
      return { text: response.text(), timestamp: Date.now() };
    } catch (err) {
      console.error("Error analyzing audio from base64:", err);
      throw err;
    }
  }

  // --- Analyze image (visual interview prompt or diagram) ---
  public async analyzeImageFile(imagePath: string) {
    try {
      const imageData = await fs.promises.readFile(imagePath);
      const imagePart = {
        inlineData: {
          data: imageData.toString("base64"),
          mimeType: "image/png",
        },
      };

      const prompt = `${this.systemPrompt}
  Look at this image and understand what interview question or topic it represents.
  Then answer directly in first person as if I'm explaining it to the interviewer.
  Keep the response short, confident, and spoken in natural English (3–6 sentences).`;

      const result = await this.model.generateContent([prompt, imagePart]);
      const response = await result.response;
      return { text: response.text(), timestamp: Date.now() };
    } catch (err) {
      console.error("Error analyzing image file:", err);
      throw err;
    }
  }

  public async chatWithGemini(message: string): Promise<string> {
    try {
      if (this.useOllama) {
        return this.callOllama(message);
      } else if (this.model) {
        const result = await this.model.generateContent(message);
        const response = await result.response;
        return response.text();
      } else {
        throw new Error("No LLM provider configured");
      }
    } catch (error) {
      console.error("[LLMHelper] Error in chatWithGemini:", error);
      throw error;
    }
  }

  public async chat(message: string): Promise<string> {
    return this.chatWithGemini(message);
  }

  public isUsingOllama(): boolean {
    return this.useOllama;
  }

  public async getOllamaModels(): Promise<string[]> {
    if (!this.useOllama) return [];
    
    try {
      const response = await fetch(`${this.ollamaUrl}/api/tags`);
      if (!response.ok) throw new Error('Failed to fetch models');
      
      const data = await response.json();
      return data.models?.map((model: any) => model.name) || [];
    } catch (error) {
      console.error("[LLMHelper] Error fetching Ollama models:", error);
      return [];
    }
  }

  public getCurrentProvider(): "ollama" | "gemini" {
    return this.useOllama ? "ollama" : "gemini";
  }

  public getCurrentModel(): string {
    return this.useOllama ? this.ollamaModel : "gemini-2.0-flash";
  }

  public async switchToOllama(model?: string, url?: string): Promise<void> {
    this.useOllama = true;
    if (url) this.ollamaUrl = url;
    
    if (model) {
      this.ollamaModel = model;
    } else {
      // Auto-detect first available model
      await this.initializeOllamaModel();
    }
    
    console.log(`[LLMHelper] Switched to Ollama: ${this.ollamaModel} at ${this.ollamaUrl}`);
  }

  public async switchToGemini(apiKey?: string): Promise<void> {
    if (apiKey) {
      const genAI = new GoogleGenerativeAI(apiKey);
      this.model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    }
    
    if (!this.model && !apiKey) {
      throw new Error("No Gemini API key provided and no existing model instance");
    }
    
    this.useOllama = false;
    console.log("[LLMHelper] Switched to Gemini");
  }

  public async testConnection(): Promise<{ success: boolean; error?: string }> {
    try {
      if (this.useOllama) {
        const available = await this.checkOllamaAvailable();
        if (!available) {
          return { success: false, error: `Ollama not available at ${this.ollamaUrl}` };
        }
        // Test with a simple prompt
        await this.callOllama("Hello");
        return { success: true };
      } else {
        if (!this.model) {
          return { success: false, error: "No Gemini model configured" };
        }
        // Test with a simple prompt
        const result = await this.model.generateContent("Hello");
        const response = await result.response;
        const text = response.text(); // Ensure the response is valid
        if (text) {
          return { success: true };
        } else {
          return { success: false, error: "Empty response from Gemini" };
        }
      }
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
} 