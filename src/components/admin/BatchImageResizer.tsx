import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { ImageIcon, Loader2, CheckCircle2, XCircle, RefreshCw } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

// Target dimensions for optimal social media previews
const TARGET_WIDTH = 1200;
const TARGET_HEIGHT = 630;

interface ResizeResult {
  fileName: string;
  status: "success" | "error" | "skipped";
  message: string;
  originalSize?: { width: number; height: number };
  newSize?: { width: number; height: number };
}

/**
 * Resize an image to exactly 1200x630 pixels for optimal OG image display.
 */
const resizeImageToOG = (imageUrl: string): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    if (!ctx) {
      reject(new Error("Failed to get canvas context"));
      return;
    }

    img.onload = () => {
      // Set canvas to target OG dimensions
      canvas.width = TARGET_WIDTH;
      canvas.height = TARGET_HEIGHT;

      // Calculate source dimensions to maintain aspect ratio with cover behavior
      const targetAspect = TARGET_WIDTH / TARGET_HEIGHT;
      const sourceAspect = img.width / img.height;

      let sourceX = 0;
      let sourceY = 0;
      let sourceWidth = img.width;
      let sourceHeight = img.height;

      if (sourceAspect > targetAspect) {
        // Image is wider - crop sides
        sourceWidth = img.height * targetAspect;
        sourceX = (img.width - sourceWidth) / 2;
      } else {
        // Image is taller - crop top/bottom
        sourceHeight = img.width / targetAspect;
        sourceY = (img.height - sourceHeight) / 2;
      }

      // Fill with white background first (in case of transparency)
      ctx.fillStyle = "#FFFFFF";
      ctx.fillRect(0, 0, TARGET_WIDTH, TARGET_HEIGHT);

      // Draw the resized image
      ctx.drawImage(
        img,
        sourceX,
        sourceY,
        sourceWidth,
        sourceHeight,
        0,
        0,
        TARGET_WIDTH,
        TARGET_HEIGHT
      );

      // Convert to blob with high quality JPEG
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error("Failed to create image blob"));
          }
        },
        "image/jpeg",
        0.9
      );
    };

    img.onerror = () => {
      reject(new Error("Failed to load image"));
    };

    img.src = imageUrl;
  });
};

/**
 * Get image dimensions from URL
 */
const getImageDimensions = (imageUrl: string): Promise<{ width: number; height: number }> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve({ width: img.width, height: img.height });
    img.onerror = () => reject(new Error("Failed to load image"));
    img.src = imageUrl;
  });
};

export default function BatchImageResizer() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentFile, setCurrentFile] = useState<string | null>(null);
  const [results, setResults] = useState<ResizeResult[]>([]);
  const [totalFiles, setTotalFiles] = useState(0);
  const [processedFiles, setProcessedFiles] = useState(0);

  const processAllImages = async () => {
    setIsProcessing(true);
    setProgress(0);
    setResults([]);
    setProcessedFiles(0);

    try {
      // List all files in the article-images bucket
      const { data: files, error: listError } = await supabase.storage
        .from("article-images")
        .list("", { limit: 1000 });

      if (listError) {
        toast.error(`Failed to list images: ${listError.message}`);
        setIsProcessing(false);
        return;
      }

      // Filter to only image files
      const imageFiles = files?.filter(
        (f) => f.name.match(/\.(jpg|jpeg|png|gif|webp)$/i) && !f.name.startsWith(".")
      ) || [];

      if (imageFiles.length === 0) {
        toast.info("No images found in storage");
        setIsProcessing(false);
        return;
      }

      setTotalFiles(imageFiles.length);
      const newResults: ResizeResult[] = [];

      for (let i = 0; i < imageFiles.length; i++) {
        const file = imageFiles[i];
        setCurrentFile(file.name);
        setProcessedFiles(i + 1);
        setProgress(Math.round(((i + 1) / imageFiles.length) * 100));

        try {
          // Get public URL
          const { data: { publicUrl } } = supabase.storage
            .from("article-images")
            .getPublicUrl(file.name);

          // Check current dimensions
          const originalDimensions = await getImageDimensions(publicUrl);

          // Skip if already correct size
          if (originalDimensions.width === TARGET_WIDTH && originalDimensions.height === TARGET_HEIGHT) {
            newResults.push({
              fileName: file.name,
              status: "skipped",
              message: "Already 1200×630",
              originalSize: originalDimensions,
            });
            setResults([...newResults]);
            continue;
          }

          // Resize the image
          const resizedBlob = await resizeImageToOG(publicUrl);

          // Delete the old file
          const { error: deleteError } = await supabase.storage
            .from("article-images")
            .remove([file.name]);

          if (deleteError) {
            throw new Error(`Delete failed: ${deleteError.message}`);
          }

          // Upload the resized version with same name
          const { error: uploadError } = await supabase.storage
            .from("article-images")
            .upload(file.name, resizedBlob, {
              contentType: "image/jpeg",
              upsert: true,
            });

          if (uploadError) {
            throw new Error(`Upload failed: ${uploadError.message}`);
          }

          newResults.push({
            fileName: file.name,
            status: "success",
            message: `Resized from ${originalDimensions.width}×${originalDimensions.height}`,
            originalSize: originalDimensions,
            newSize: { width: TARGET_WIDTH, height: TARGET_HEIGHT },
          });
        } catch (err) {
          newResults.push({
            fileName: file.name,
            status: "error",
            message: err instanceof Error ? err.message : "Unknown error",
          });
        }

        setResults([...newResults]);
      }

      const successCount = newResults.filter((r) => r.status === "success").length;
      const skippedCount = newResults.filter((r) => r.status === "skipped").length;
      const errorCount = newResults.filter((r) => r.status === "error").length;

      toast.success(
        `Batch complete: ${successCount} resized, ${skippedCount} skipped, ${errorCount} errors`
      );
    } catch (err) {
      toast.error(`Batch process failed: ${err instanceof Error ? err.message : "Unknown error"}`);
    } finally {
      setIsProcessing(false);
      setCurrentFile(null);
    }
  };

  const successCount = results.filter((r) => r.status === "success").length;
  const skippedCount = results.filter((r) => r.status === "skipped").length;
  const errorCount = results.filter((r) => r.status === "error").length;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Batch Image Resizer</h2>
        <p className="text-muted-foreground mt-1">
          Resize all images in storage to 1200×630 for optimal social media previews.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <ImageIcon className="h-5 w-5" />
            Resize All Featured Images
          </CardTitle>
          <CardDescription>
            This will process all images in the article-images bucket and resize them to exactly
            1200×630 pixels. Images already at this size will be skipped.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            onClick={processAllImages}
            disabled={isProcessing}
            className="w-full sm:w-auto"
          >
            {isProcessing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4 mr-2" />
                Start Batch Resize
              </>
            )}
          </Button>

          {isProcessing && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Processing: {currentFile}</span>
                <span>
                  {processedFiles} / {totalFiles}
                </span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          )}

          {results.length > 0 && (
            <div className="space-y-3">
              <div className="flex gap-4 text-sm">
                <span className="text-primary">
                  ✓ {successCount} resized
                </span>
                <span className="text-muted-foreground">⊘ {skippedCount} skipped</span>
                {errorCount > 0 && (
                  <span className="text-destructive">✗ {errorCount} errors</span>
                )}
              </div>

              <ScrollArea className="h-64 border rounded-md">
                <div className="p-3 space-y-1">
                  {results.map((result, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 text-sm py-1 border-b border-border/50 last:border-0"
                    >
                      {result.status === "success" && (
                        <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                      )}
                      {result.status === "skipped" && (
                        <div className="h-4 w-4 rounded-full border-2 border-muted-foreground/50 shrink-0" />
                      )}
                      {result.status === "error" && (
                        <XCircle className="h-4 w-4 text-destructive shrink-0" />
                      )}
                      <span className="font-mono text-xs truncate flex-1">{result.fileName}</span>
                      <span className="text-muted-foreground text-xs shrink-0">
                        {result.message}
                      </span>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
