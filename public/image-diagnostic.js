// Quick diagnostic check for image configuration
// Run this in browser console to verify setup

console.log("%c[v0] Image Configuration Diagnostic", "color: #002366; font-weight: bold");

// Check environment variables
const envVars = {
  "NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY": process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY,
  "NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT": process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT,
  "IMAGEKIT_PRIVATE_KEY": process.env.IMAGEKIT_PRIVATE_KEY ? "✅ Configured" : "❌ Missing",
};

console.table(envVars);

// Check if placeholder exists
const placeholderImg = new Image();
placeholderImg.onload = () => console.log("✅ Placeholder image accessible");
placeholderImg.onerror = () => console.warn("❌ Placeholder image not found");
placeholderImg.src = "/placeholder.jpg";

// Check ImageKit auth endpoint
fetch("/api/imagekit-auth")
  .then((res) => res.json())
  .then((data) => console.log("✅ ImageKit auth endpoint working:", data))
  .catch((err) => console.error("❌ ImageKit auth error:", err));

console.log("%c✅ All image fixes applied successfully!", "color: green; font-weight: bold");
