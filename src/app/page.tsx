"use client";

import { useState, useEffect } from "react";
import type { AnalyzeImageOutput } from "@/ai/flows/analyze-image";
import { analyzeImage } from "@/ai/flows/analyze-image";
import { generatePoem } from "@/ai/flows/generate-poem";

import { ImageUploader } from "@/components/app/picture-poet/ImageUploader";
import { PoemControls } from "@/components/app/picture-poet/PoemControls";
import { DownloadArtworkButton } from "@/components/app/picture-poet/DownloadArtworkButton";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Terminal, Languages } from "lucide-react"; // Added Languages icon
import { useToast } from "@/hooks/use-toast";

const supportedLanguages = [
  { value: "English", label: "English" },
  { value: "Spanish", label: "Español" },
  { value: "French", label: "Français" },
  { value: "German", label: "Deutsch" },
  { value: "Japanese", label: "日本語" },
  { value: "Hindi", label: "हिन्दी" },
  { value: "Portuguese", label: "Português" },
  { value: "Italian", label: "Italiano" },
  { value: "Sinhala", label: "සිංහල" },
];

export default function PicturePoetPage() {
  const [imageDataUri, setImageDataUri] = useState<string | null>(null);
  const [imageAnalysisResult, setImageAnalysisResult] =
    useState<AnalyzeImageOutput | null>(null);
  const [poem, setPoem] = useState<string | null>(null);
  const [poetryStyle, setPoetryStyle] = useState<string>("Free Verse");
  const [selectedLanguage, setSelectedLanguage] = useState<string>("English"); // Added language state

  const [isLoadingAnalysis, setIsLoadingAnalysis] = useState(false);
  const [isLoadingPoem, setIsLoadingPoem] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { toast } = useToast();

  useEffect(() => {
    // Reset dependent states when image or language changes
    setImageAnalysisResult(null);
    setPoem(null);
    setError(null);
  }, [imageDataUri, selectedLanguage]);

  const handleImageSelected = async (dataUri: string) => {
    if (!selectedLanguage) {
      setError("Please select a language first.");
      toast({
        title: "Language Not Selected",
        description: "You must select a language before analyzing an image.",
        variant: "destructive",
      });
      return;
    }
    setImageDataUri(dataUri);
    setIsLoadingAnalysis(true);
    setError(null);
    setPoem(null);
    setImageAnalysisResult(null);

    try {
      const analysis = await analyzeImage({
        photoDataUri: dataUri,
        language: selectedLanguage,
      });
      setImageAnalysisResult(analysis);
      toast({
        title: "Image Analysis Complete",
        description: "Ready to generate a poem!",
      });
    } catch (err) {
      console.error("Image analysis error:", err);
      const errorMessage =
        err instanceof Error
          ? err.message
          : "An unknown error occurred during image analysis.";
      setError(`Failed to analyze image: ${errorMessage}`);
      toast({
        title: "Analysis Error",
        description: `Could not analyze image. ${errorMessage}`,
        variant: "destructive",
      });
    } finally {
      setIsLoadingAnalysis(false);
    }
  };

  const handleGeneratePoem = async () => {
    if (!imageDataUri || !imageAnalysisResult) {
      setError("Cannot generate poem without image and analysis.");
      toast({
        title: "Missing Information",
        description: "Please upload and analyze an image first.",
        variant: "destructive",
      });
      return;
    }
    if (!selectedLanguage) {
      setError("Please select a language first.");
      toast({
        title: "Language Not Selected",
        description: "You must select a language for poem generation.",
        variant: "destructive",
      });
      return;
    }
    setIsLoadingPoem(true);
    setError(null);
    setPoem(null);

    try {
      let analysisSummary = `Objects: ${imageAnalysisResult.objects.join(", ") || "none"}. `;
      analysisSummary += `Themes: ${imageAnalysisResult.themes.join(", ") || "none"}. `;
      analysisSummary += `Mood: ${imageAnalysisResult.mood || "neutral"}.`;

      const result = await generatePoem({
        photoDataUri: imageDataUri,
        poetryStyle: poetryStyle,
        imageAnalysis: analysisSummary,
        language: selectedLanguage,
      });
      setPoem(result.poem);
      toast({
        title: "Poem Generated!",
        description: "Your picture poem is ready.",
      });
    } catch (err) {
      console.error("Poem generation error:", err);
      const errorMessage =
        err instanceof Error
          ? err.message
          : "An unknown error occurred during poem generation.";
      setError(`Failed to generate poem: ${errorMessage}`);
      toast({
        title: "Poem Generation Error",
        description: `Could not generate poem. ${errorMessage}`,
        variant: "destructive",
      });
    } finally {
      setIsLoadingPoem(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center p-4 sm:p-8">
      <header className="mb-8 text-center">
        <h1 className="text-5xl font-bold text-primary tracking-tight">
          Picture Poet
        </h1>
        <p className="text-muted-foreground mt-2 text-lg">
          Transform your photos into beautiful poetry with AI.
        </p>
      </header>

      <main className="w-full max-w-6xl space-y-8">
        {error && (
          <Alert variant="destructive" className="shadow-md">
            <Terminal className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Languages className="h-6 w-6 text-primary" />
              Choose Your Language
            </CardTitle>
            <CardDescription>
              Select the language for image analysis and poem generation.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Select
              value={selectedLanguage}
              onValueChange={(value) => {
                setSelectedLanguage(value);
                // If an image is already uploaded, re-trigger analysis implicitly by useEffect or explicitly
                if (imageDataUri) {
                  setImageAnalysisResult(null); // Clear old analysis
                  setPoem(null); // Clear old poem
                  // Optionally, you could auto-trigger analysis here, or let user re-initiate.
                  // For now, let user re-initiate by uploading again or making it clear analysis needs to be redone.
                  toast({
                    title: "Language Changed",
                    description: `Language set to ${value}. Please re-upload or re-analyze the image if needed.`,
                  });
                }
              }}
              disabled={isLoadingAnalysis || isLoadingPoem}
            >
              <SelectTrigger className="w-full md:w-1/2 lg:w-1/3">
                <SelectValue placeholder="Select language" />
              </SelectTrigger>
              <SelectContent>
                {supportedLanguages.map((lang) => (
                  <SelectItem key={lang.value} value={lang.value}>
                    {lang.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-2 gap-8 items-start">
          <ImageUploader
            onImageUpload={handleImageSelected}
            imageDataUri={imageDataUri}
            disabled={!selectedLanguage || isLoadingAnalysis}
          />

          <div className="space-y-6">
            <PoemControls
              poetryStyle={poetryStyle}
              onPoetryStyleChange={setPoetryStyle}
              onGeneratePoem={handleGeneratePoem}
              isGenerating={isLoadingPoem || isLoadingAnalysis}
              canGenerate={
                !!imageAnalysisResult &&
                !isLoadingAnalysis &&
                !!selectedLanguage
              }
            />

            {isLoadingAnalysis && (
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle>
                    Analyzing Image in {selectedLanguage}...
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 pt-0">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-1/2" />
                </CardContent>
              </Card>
            )}

            {imageAnalysisResult && !isLoadingAnalysis && (
              <Card className="shadow-md bg-card">
                <CardHeader>
                  <CardTitle className="text-lg">
                    Image Insights ({selectedLanguage})
                  </CardTitle>
                  <CardDescription>
                    What the AI sees in your image.
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-sm space-y-1">
                  <p>
                    <strong>Objects:</strong>{" "}
                    {imageAnalysisResult.objects.join(", ") || "None detected"}
                  </p>
                  <p>
                    <strong>Themes:</strong>{" "}
                    {imageAnalysisResult.themes.join(", ") || "None detected"}
                  </p>
                  <p>
                    <strong>Mood:</strong> {imageAnalysisResult.mood || "N/A"}
                  </p>
                </CardContent>
              </Card>
            )}

            {isLoadingPoem && (
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle>
                    Generating Poem in {selectedLanguage}...
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 pt-0">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-5/6" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-5/6" />
                  <Skeleton className="h-4 w-2/3" />
                </CardContent>
              </Card>
            )}

            {poem && !isLoadingPoem && (
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle>Your Picture Poem ({selectedLanguage})</CardTitle>
                  <CardDescription>Style: {poetryStyle}</CardDescription>
                </CardHeader>
                <CardContent>
                  <pre className="font-serif text-base sm:text-lg whitespace-pre-wrap p-4 bg-background rounded-md border border-border leading-relaxed">
                    {poem}
                  </pre>
                </CardContent>
                <CardFooter>
                  {imageDataUri && poem && (
                    <DownloadArtworkButton
                      imageDataUri={imageDataUri}
                      poemText={poem}
                      poetryStyle={poetryStyle}
                    />
                  )}
                </CardFooter>
              </Card>
            )}
          </div>
        </div>
      </main>
      <footer className="mt-12 text-center text-sm text-muted-foreground">
        <p>
          &copy; {new Date().getFullYear()} Picture Poet. All rights reserved.
        </p>
        <p>Developed with ❤️ by Minjxnx</p>
      </footer>
    </div>
  );
}
