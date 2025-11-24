import { NextRequest, NextResponse } from "next/server";

/**
 * @swagger
 * /upload-image:
 *   post:
 *     summary: Upload an image
 *     description: Upload an image file to ImgBB service and get back the image URL
 *     tags: [Upload]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - image
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: Image file to upload (JPEG, PNG, GIF, etc.)
 *     responses:
 *       200:
 *         description: Image uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 imageUrl:
 *                   type: string
 *                   format: uri
 *                   description: Direct URL to the uploaded image
 *                   example: https://i.ibb.co/abc123/image.jpg
 *                 displayUrl:
 *                   type: string
 *                   format: uri
 *                   description: ImgBB display page URL
 *                   example: https://ibb.co/abc123
 *                 deleteUrl:
 *                   type: string
 *                   format: uri
 *                   description: URL to delete the uploaded image
 *                   example: https://ibb.co/abc123/delete
 *       400:
 *         description: No image provided or invalid request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error or upload service error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const image = formData.get("image");

    if (!image) {
      return NextResponse.json(
        { message: "No image provided" },
        { status: 400 },
      );
    }

    // Prepare form data for ImgBB
    const imgbbFormData = new FormData();
    imgbbFormData.append("image", image);

    const apiKey = process.env.IMGBB_API_KEY;
    if (!apiKey) {
      console.error("IMGBB_API_KEY is not configured");
      return NextResponse.json(
        { message: "Image upload service not configured" },
        { status: 500 },
      );
    }

    // Upload to ImgBB
    const imgbbResponse = await fetch(
      `https://api.imgbb.com/1/upload?key=${apiKey}`,
      {
        method: "POST",
        body: imgbbFormData,
      },
    );

    if (!imgbbResponse.ok) {
      console.error("ImgBB upload failed:", await imgbbResponse.text());
      return NextResponse.json(
        { message: "Failed to upload image" },
        { status: 500 },
      );
    }

    const imgbbData = await imgbbResponse.json();

    if (!imgbbData.success || !imgbbData.data?.url) {
      return NextResponse.json(
        { message: "Invalid response from image service" },
        { status: 500 },
      );
    }

    return NextResponse.json({
      imageUrl: imgbbData.data.url,
      displayUrl: imgbbData.data.display_url,
      deleteUrl: imgbbData.data.delete_url,
    });
  } catch (error) {
    console.error("Image upload error:", error);
    return NextResponse.json(
      { message: "Unable to upload image" },
      { status: 500 },
    );
  }
}
