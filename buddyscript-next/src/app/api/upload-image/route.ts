import { NextRequest, NextResponse } from "next/server";

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
