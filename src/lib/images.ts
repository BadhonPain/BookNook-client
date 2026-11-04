export async function uploadBookCover(file: File) {
  const apiKey = process.env.NEXT_PUBLIC_IMGBB_API_KEY;
  if (!apiKey) {
    throw new Error("Image uploads are not configured. Add NEXT_PUBLIC_IMGBB_API_KEY to .env.local.");
  }

  const formData = new FormData();
  formData.set("image", file);

  let response: Response;
  try {
    response = await fetch(`https://api.imgbb.com/1/upload?key=${encodeURIComponent(apiKey)}`, {
      method: "POST",
      body: formData,
    });
  } catch {
    throw new Error("Could not reach the image service. Please try again.");
  }

  const result = (await response.json().catch(() => null)) as
    | { success?: boolean; data?: { display_url?: string; url?: string }; error?: { message?: string } }
    | null;
  const imageUrl = result?.data?.display_url || result?.data?.url;
  if (!response.ok || !result?.success || !imageUrl) {
    throw new Error(result?.error?.message || "The image could not be uploaded.");
  }
  return imageUrl;
}
