"use server";

/**
 * @fileOverview Image analysis AI agent.
 *
 * - analyzeImage - A function that handles the image analysis process.
 * - AnalyzeImageInput - The input type for the analyzeImage function.
 * - AnalyzeImageOutput - The return type for the analyzeImage function.
 */

import { ai } from "@/ai/genkit";
import { z } from "genkit";

const AnalyzeImageInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'.",
    ),
  language: z
    .string()
    .describe(
      'The target language for the analysis, e.g., "Spanish", "French", "English".',
    ),
});
export type AnalyzeImageInput = z.infer<typeof AnalyzeImageInputSchema>;

const AnalyzeImageOutputSchema = z.object({
  objects: z
    .array(z.string())
    .describe(
      "List of objects detected in the image, in the specified language.",
    ),
  themes: z
    .array(z.string())
    .describe(
      "List of themes inferred from the image, in the specified language.",
    ),
  mood: z
    .string()
    .describe(
      "Overall mood or emotion conveyed by the image, in the specified language.",
    ),
});
export type AnalyzeImageOutput = z.infer<typeof AnalyzeImageOutputSchema>;

export async function analyzeImage(
  input: AnalyzeImageInput,
): Promise<AnalyzeImageOutput> {
  return analyzeImageFlow(input);
}

const prompt = ai.definePrompt({
  name: "analyzeImagePrompt",
  input: { schema: AnalyzeImageInputSchema },
  output: { schema: AnalyzeImageOutputSchema },
  prompt: `You are an AI expert in image analysis. Your task is to analyze the provided image.
Identify key objects, themes, and the overall mood.
IMPORTANT: Your entire response, including the lists of objects, themes, and the mood description, MUST be in {{{language}}}.

Image: {{media url=photoDataUri}}

Objects: (Provide as a list of strings in {{{language}}})
Themes: (Provide as a list of strings in {{{language}}})
Mood: (Describe in {{{language}}})`,
});

const analyzeImageFlow = ai.defineFlow(
  {
    name: "analyzeImageFlow",
    inputSchema: AnalyzeImageInputSchema,
    outputSchema: AnalyzeImageOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  },
);
