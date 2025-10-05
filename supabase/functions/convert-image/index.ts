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

    // Create canvas and resize
    const canvas = new OffscreenCanvas(width, height);
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      return json({ error: "Failed to get canvas context" }, 500);
    }

    ctx.drawImage(imageBitmap, 0, 0, width, height);

    // Convert to WebP
    const webpBlob = await canvas.convertToBlob({
      type: "image/webp",
      quality: quality,
    });

    // Convert to base64
    const arrayBuffer = await webpBlob.arrayBuffer();
    const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));

    console.log(`Image converted: ${imageBitmap.width}x${imageBitmap.height} -> ${width}x${height}`);

    return json({
      image: base64,
      width,
      height,
      originalWidth: imageBitmap.width,
      originalHeight: imageBitmap.height,
    });

  } catch (error) {
    console.error("Image conversion error:", error);
    return json({ error: error.message }, 500);
  }
});
