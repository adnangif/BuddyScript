/**
 * Upload an image file to ImgBB via our API endpoint
 * @param file The image file to upload
 * @param token JWT authentication token
 * @returns The uploaded image URL
 * @throws Error if upload fails
 */
export async function uploadImage(file: File, token: string): Promise<string> {
    // Validate file type
    if (!file.type.startsWith("image/")) {
        throw new Error("File must be an image");
    }

    // Validate file size (max 32MB as per ImgBB limits)
    const maxSize = 32 * 1024 * 1024; // 32MB in bytes
    if (file.size > maxSize) {
        throw new Error("Image size must be less than 32MB");
    }

    const formData = new FormData();
    formData.append("image", file);

    const response = await fetch("/api/upload-image", {
        method: "POST",
        headers: {
            Authorization: `Bearer ${token}`,
        },
        body: formData,
    });

    if (!response.ok) {
        const errorData = await response
            .json()
            .catch(() => ({ message: "Failed to upload image" }));
        throw new Error(errorData.message ?? "Failed to upload image");
    }

    const data = await response.json();

    if (!data.imageUrl) {
        throw new Error("No image URL returned from upload");
    }

    return data.imageUrl;
}
