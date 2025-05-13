"use client";

import type React from "react";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface DownloadArtworkButtonProps {
  imageDataUri: string;
  poemText: string;
  poetryStyle: string; // Used for filename
}

export function DownloadArtworkButton({
  imageDataUri,
  poemText,
  poetryStyle,
}: DownloadArtworkButtonProps) {
  const { toast } = useToast();

  const handleDownload = async () => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      toast({
        title: "Error",
        description: "Could not create canvas for download.",
        variant: "destructive",
      });
      return;
    }

    const image = new Image();
    image.onload = () => {
      const padding = 40; // Padding around content
      const poemAreaHeightEstimate =
        poemText.split("\n").length * 24 + padding * 2; // Estimate based on line height

      const imageAspectRatio = image.naturalWidth / image.naturalHeight;
      const displayWidth = Math.min(800, image.naturalWidth); // Max width for image part
      const displayHeight = displayWidth / imageAspectRatio;

      canvas.width = displayWidth + padding * 2;
      canvas.height = displayHeight + poemAreaHeightEstimate + padding; // Add padding below poem too

      // Background
      ctx.fillStyle =
        getComputedStyle(document.documentElement)
          .getPropertyValue("--card")
          .trim() || "#fdfbf8"; // Use card background color
      const cardBgHsl = getComputedStyle(document.documentElement)
        .getPropertyValue("--card")
        .trim();
      if (cardBgHsl) {
        // Convert HSL string to actual HSL color if needed, or use a fallback
        // Example: "40 40% 98%" -> "hsl(40, 40%, 98%)"
        // For simplicity, using a hex approximation or a fixed color if parsing fails.
        // This part could be more robust by parsing HSL values.
        try {
          const [h, s, l] = cardBgHsl.split(" ").map(parseFloat);
          ctx.fillStyle = `hsl(${h}, ${s}%, ${l}%)`;
        } catch (e) {
          ctx.fillStyle = "#fdfbf8"; // Fallback light beige
        }
      } else {
        ctx.fillStyle = "#fdfbf8";
      }
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw Image
      ctx.drawImage(image, padding, padding, displayWidth, displayHeight);

      // Draw Poem
      ctx.font = "18px serif"; // Elegant serif font for the poem
      const poemFgHsl = getComputedStyle(document.documentElement)
        .getPropertyValue("--card-foreground")
        .trim();
      if (poemFgHsl) {
        try {
          const [h, s, l] = poemFgHsl.split(" ").map(parseFloat);
          ctx.fillStyle = `hsl(${h}, ${s}%, ${l}%)`;
        } catch (e) {
          ctx.fillStyle = "#3C2F2F"; // Fallback dark brown
        }
      } else {
        ctx.fillStyle = "#3C2F2F"; // Dark brown for text
      }

      const poemLines = poemText.split("\n");
      let currentY = displayHeight + padding * 2; // Start Y below image and padding
      const lineHeight = 24;
      const textMaxWidth = canvas.width - padding * 2;

      poemLines.forEach((line) => {
        // Basic text wrapping
        let currentLineText = "";
        const words = line.split(" ");
        for (const word of words) {
          const testLine = currentLineText + word + " ";
          const metrics = ctx.measureText(testLine);
          if (metrics.width > textMaxWidth && currentLineText.length > 0) {
            ctx.fillText(currentLineText.trim(), padding, currentY);
            currentY += lineHeight;
            currentLineText = word + " ";
          } else {
            currentLineText = testLine;
          }
        }
        ctx.fillText(currentLineText.trim(), padding, currentY);
        currentY += lineHeight;
      });

      // Adjust canvas height to fit poem precisely if it was underestimated
      const finalPoemBottom = currentY - lineHeight + padding; // currentY is next line's start, subtract one lineHeight, add bottom padding
      if (finalPoemBottom > canvas.height) {
        // This case should be rare if poemAreaHeightEstimate is generous
        // Or, if it's smaller, we can crop:
        const tempCanvas = document.createElement("canvas");
        tempCanvas.width = canvas.width;
        tempCanvas.height = Math.max(
          displayHeight + padding * 2,
          finalPoemBottom,
        ); // ensure image is not cropped
        const tempCtx = tempCanvas.getContext("2d");
        if (tempCtx) {
          tempCtx.drawImage(canvas, 0, 0);
          canvas.height = tempCanvas.height; // This is effectively done by using tempCanvas below
          const dataUrl = tempCanvas.toDataURL("image/png");
          const link = document.createElement("a");
          link.download = `PicturePoem_${poetryStyle.replace(/\s+/g, "_")}.png`;
          link.href = dataUrl;
          link.click();
          toast({
            title: "Download Started",
            description: "Your artwork is being downloaded.",
          });
          return;
        }
      } else if (finalPoemBottom < canvas.height) {
        // Crop canvas to actual content height
        const tempCanvas = document.createElement("canvas");
        tempCanvas.width = canvas.width;
        tempCanvas.height = finalPoemBottom;
        const tempCtx = tempCanvas.getContext("2d");
        if (tempCtx) {
          tempCtx.drawImage(canvas, 0, 0);
          const dataUrl = tempCanvas.toDataURL("image/png");
          const link = document.createElement("a");
          link.download = `PicturePoem_${poetryStyle.replace(/\s+/g, "_")}.png`;
          link.href = dataUrl;
          link.click();
          toast({
            title: "Download Started",
            description: "Your artwork is being downloaded.",
          });
          return;
        }
      }

      const dataUrl = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.download = `PicturePoem_${poetryStyle.replace(/\s+/g, "_")}.png`;
      link.href = dataUrl;
      link.click();

      toast({
        title: "Download Started",
        description: "Your artwork is being downloaded.",
      });
    };
    image.onerror = () => {
      toast({
        title: "Error",
        description: "Could not load image for download.",
        variant: "destructive",
      });
    };
    image.src = imageDataUri;
  };

  return (
    <Button onClick={handleDownload} variant="outline" className="w-full">
      <Download className="mr-2 h-4 w-4" />
      Download Artwork
    </Button>
  );
}
