import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { json } from "../_shared/json.ts";

const MAX_SIZE = 1920;
const WEBP_QUALITY = 0.85;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { image, maxWidth = MAX_SIZE, maxHeight = MAX_SIZE, quality = WEBP_QUALITY } = await req.json();

    if (!image) {
      return json({ error: "No image data provided" }, 400);
    }

    // Decode base64 image
    const imageData = Uint8Array.from(atob(image), c => c.charCodeAt(0));

    // Use Deno's built-in image processing
    const blob = new Blob([imageData]);
    const imageBitmap = await createImageBitmap(blob);

    // Calculate new dimensions while maintaining aspect ratio
    let width = imageBitmap.width;
    let height = imageBitmap.height;

    if (width > maxWidth || height > maxHeight) {
      const ratio = Math.min(maxWidth / width, maxHeight / height);
      width = Math.floor(width * ratio);
      height = Math.floor(height * ratio);
    }

    // Note: Image conversion to WebP not available in Deno edge runtime
    // Return original image with calculated dimensions
    console.log(`Image dimensions calculated: ${imageBitmap.width}x${imageBitmap.height} -> ${width}x${height}`);

    return json({
      image: image,
      width,
      height,
      originalWidth: imageBitmap.width,
      originalHeight: imageBitmap.height,
      note: "WebP conversion not available in edge runtime"
    });

  } catch (error) {
    console.error("Image conversion error:", error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return json({ error: errorMessage }, 500);
  }
});
