"use client";

import type React from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Sparkles, Loader2 } from "lucide-react";

const poetryStyles = ["Haiku", "Sonnet", "Free Verse", "Limerick", "Ballad"];

interface PoemControlsProps {
  poetryStyle: string;
  onPoetryStyleChange: (style: string) => void;
  onGeneratePoem: () => void;
  isGenerating: boolean;
  canGenerate: boolean;
}

export function PoemControls({
  poetryStyle,
  onPoetryStyleChange,
  onGeneratePoem,
  isGenerating,
  canGenerate,
}: PoemControlsProps) {
  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-6 w-6 text-accent" />
          Craft Your Poem
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <Label
            htmlFor="poetryStyle"
            className="text-sm font-medium text-foreground/80"
          >
            Choose a Poetry Style
          </Label>
          <Select
            value={poetryStyle}
            onValueChange={onPoetryStyleChange}
            disabled={isGenerating}
          >
            <SelectTrigger id="poetryStyle" className="w-full mt-1">
              <SelectValue placeholder="Select style" />
            </SelectTrigger>
            <SelectContent>
              {poetryStyles.map((style) => (
                <SelectItem key={style} value={style}>
                  {style}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button
          onClick={onGeneratePoem}
          disabled={isGenerating || !canGenerate}
          className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
          size="lg"
        >
          {isGenerating ? (
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          ) : (
            <Sparkles className="mr-2 h-5 w-5" />
          )}
          {isGenerating ? "Generating..." : "Generate Poem"}
        </Button>
        {!canGenerate && (
          <p className="text-xs text-muted-foreground text-center">
            Please upload an image first for the AI to analyze.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
