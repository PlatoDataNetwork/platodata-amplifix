import { useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Upload, Trash2, Loader2, ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface DefaultFeaturedImage {
  id: string;
  image_url: string;
  created_at: string;
}

const DefaultFeaturedImages = () => {
  const queryClient = useQueryClient();
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  // Fetch all default featured images
  const { data: images, isLoading } = useQuery({
    queryKey: ["default-featured-images"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("default_featured_images")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as DefaultFeaturedImage[];
    },
  });

  // Delete image mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("default_featured_images")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["default-featured-images"] });
      toast.success("Image deleted");
    },
    onError: (error) => {
      toast.error(`Failed to delete: ${error.message}`);
    },
  });

  // Process files for upload
  const processFiles = async (files: FileList | File[]) => {
    if (!files || files.length === 0) return;

    setIsUploading(true);
    let successCount = 0;
    let errorCount = 0;

    try {
      for (const file of Array.from(files)) {
        if (!file.type.startsWith("image/")) {
          toast.error(`${file.name} is not an image`);
          errorCount++;
          continue;
        }

        // Upload to Supabase Storage
        const fileExt = file.name.split(".").pop();
        const fileName = `default-${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from("article-images")
          .upload(fileName, file);

        if (uploadError) {
          toast.error(`Failed to upload ${file.name}: ${uploadError.message}`);
          errorCount++;
          continue;
        }

        // Get the public URL
        const { data: { publicUrl } } = supabase.storage
          .from("article-images")
          .getPublicUrl(fileName);

        // Save to database
        const { error: dbError } = await supabase
          .from("default_featured_images")
          .insert({ image_url: publicUrl });

        if (dbError) {
          toast.error(`Failed to save ${file.name}: ${dbError.message}`);
          errorCount++;
          continue;
        }

        successCount++;
      }

      if (successCount > 0) {
        toast.success(`${successCount} image${successCount > 1 ? "s" : ""} uploaded successfully`);
        queryClient.invalidateQueries({ queryKey: ["default-featured-images"] });
      }
    } finally {
      setIsUploading(false);
    }
  };

  // Handle file input change
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      await processFiles(files);
      // Reset the input
      e.target.value = "";
    }
  };

  // Drag and drop handlers
  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Only set dragging to false if we're leaving the drop zone entirely
    if (e.currentTarget.contains(e.relatedTarget as Node)) return;
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      await processFiles(files);
    }
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Default Featured Images</h2>
        <p className="text-muted-foreground mt-1">
          Upload multiple images that will be randomly assigned to articles without featured images.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Upload Images</CardTitle>
          <CardDescription>
            Drag and drop images or click to select
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onClick={() => !isUploading && document.getElementById("multi_image_upload")?.click()}
            className={cn(
              "relative border-2 border-dashed rounded-lg p-8 transition-all cursor-pointer",
              "flex flex-col items-center justify-center gap-3",
              isDragging 
                ? "border-primary bg-primary/5" 
                : "border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/30",
              isUploading && "pointer-events-none opacity-60"
            )}
          >
            {isUploading ? (
              <>
                <Loader2 className="w-10 h-10 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">Uploading...</p>
              </>
            ) : isDragging ? (
              <>
                <Upload className="w-10 h-10 text-primary" />
                <p className="text-sm font-medium text-primary">Drop images here</p>
              </>
            ) : (
              <>
                <Upload className="w-10 h-10 text-muted-foreground" />
                <div className="text-center">
                  <p className="text-sm font-medium">Drag and drop images here</p>
                  <p className="text-xs text-muted-foreground mt-1">or click to browse</p>
                </div>
              </>
            )}
            <input
              id="multi_image_upload"
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleFileUpload}
            />
          </div>
          <p className="text-xs text-muted-foreground mt-3 text-center">
            {images?.length ?? 0} images in pool
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Image Pool</CardTitle>
          <CardDescription>
            These images will be randomly used when articles don't have a featured image
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
          ) : images && images.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {images.map((image) => (
                <div
                  key={image.id}
                  className="group relative aspect-video rounded-lg overflow-hidden border border-border bg-muted"
                >
                  <img
                    src={image.image_url}
                    alt="Default featured"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Button
                      variant="destructive"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => deleteMutation.mutate(image.id)}
                      disabled={deleteMutation.isPending}
                    >
                      {deleteMutation.isPending ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                <ImageIcon className="w-8 h-8 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground">No images in pool yet</p>
              <p className="text-sm text-muted-foreground mt-1">
                Upload images to start using random featured images
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DefaultFeaturedImages;
