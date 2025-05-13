
"use client";

import { useState, useEffect } from 'react';
import type { AnalyzeImageOutput } from '@/ai/flows/analyze-image';
import { analyzeImage } from '@/ai/flows/analyze-image';
import { generatePoem } from '@/ai/flows/generate-poem';

import { ImageUploader } from '@/components/app/picture-poet/ImageUploader';
import { PoemControls } from '@/components/app/picture-poet/PoemControls';
import { DownloadArtworkButton } from '@/components/app/picture-poet/DownloadArtworkButton';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function PicturePoetPage() {
  const [imageDataUri, setImageDataUri] = useState<string | null>(null);
  const [imageAnalysisResult, setImageAnalysisResult] = useState<AnalyzeImageOutput | null>(null);
  const [poem, setPoem] = useState<string | null>(null);
  const [poetryStyle, setPoetryStyle] = useState<string>('Free Verse');
  
  const [isLoadingAnalysis, setIsLoadingAnalysis] = useState(false);
  const [isLoadingPoem, setIsLoadingPoem] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { toast } = useToast();

  useEffect(() => {
    // Reset dependent states when image changes
    setImageAnalysisResult(null);
    setPoem(null);
    setError(null);
  }, [imageDataUri]);

  const handleImageSelected = async (dataUri: string) => {
    setImageDataUri(dataUri);
    setIsLoadingAnalysis(true);
    setError(null);
    setPoem(null); // Clear previous poem
    setImageAnalysisResult(null); // Clear previous analysis

    try {
      const analysis = await analyzeImage({ photoDataUri: dataUri });
      setImageAnalysisResult(analysis);
      toast({
        title: "Image Analysis Complete",
        description: "Ready to generate a poem!",
      });
    } catch (err) {
      console.error("Image analysis error:", err);
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred during image analysis.";
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
    setIsLoadingPoem(true);
    setError(null);
    setPoem(null); // Clear previous poem

    try {
      // Create a summary of the analysis for the poem prompt
      let analysisSummary = `Objects: ${imageAnalysisResult.objects.join(', ') || 'none'}. `;
      analysisSummary += `Themes: ${imageAnalysisResult.themes.join(', ') || 'none'}. `;
      analysisSummary += `Mood: ${imageAnalysisResult.mood || 'neutral'}.`;
      
      const result = await generatePoem({
        photoDataUri: imageDataUri,
        poetryStyle: poetryStyle,
        imageAnalysis: analysisSummary,
      });
      setPoem(result.poem);
      toast({
        title: "Poem Generated!",
        description: "Your picture poem is ready.",
      });
    } catch (err) {
      console.error("Poem generation error:", err);
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred during poem generation.";
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
        <h1 className="text-5xl font-bold text-primary tracking-tight">Picture Poet</h1>
        <p className="text-muted-foreground mt-2 text-lg">Transform your photos into beautiful poetry with AI.</p>
      </header>

      <main className="w-full max-w-6xl space-y-8">
        {error && (
          <Alert variant="destructive" className="shadow-md">
            <Terminal className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="grid md:grid-cols-2 gap-8 items-start">
          <ImageUploader onImageUpload={handleImageSelected} imageDataUri={imageDataUri} />
          
          <div className="space-y-6">
            <PoemControls
              poetryStyle={poetryStyle}
              onPoetryStyleChange={setPoetryStyle}
              onGeneratePoem={handleGeneratePoem}
              isGenerating={isLoadingPoem || isLoadingAnalysis} // Disable if any AI task is running
              canGenerate={!!imageAnalysisResult && !isLoadingAnalysis}
            />

            {isLoadingAnalysis && (
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle>Analyzing Image...</CardTitle>
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
                  <CardTitle className="text-lg">Image Insights</CardTitle>
                  <CardDescription>What the AI sees in your image.</CardDescription>
                </CardHeader>
                <CardContent className="text-sm space-y-1">
                  <p><strong>Objects:</strong> {imageAnalysisResult.objects.join(', ') || 'None detected'}</p>
                  <p><strong>Themes:</strong> {imageAnalysisResult.themes.join(', ') || 'None detected'}</p>
                  <p><strong>Mood:</strong> {imageAnalysisResult.mood || 'N/A'}</p>
                </CardContent>
              </Card>
            )}

            {isLoadingPoem && (
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle>Generating Poem...</CardTitle>
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
                  <CardTitle>Your Picture Poem</CardTitle>
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
        <p>&copy; {new Date().getFullYear()} Picture Poet. All rights reserved.</p>
      </footer>
    </div>
  );
}
