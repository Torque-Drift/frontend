import axios from "axios";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const user_id = searchParams.get("user_id");
    if (!user_id) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }
    const token = process.env.BOT_TOKEN;
    if (!token) {
      return NextResponse.json(
        { error: "Bot token not configured" },
        { status: 500 }
      );
    }
    const TELEGRAM_API = `https://api.telegram.org/bot${token}`;
    const { data: photoData } = await axios.get(
      `${TELEGRAM_API}/getUserProfilePhotos`,
      {
        params: {
          user_id,
          limit: 1,
        },
        timeout: 5000,
      }
    );
    if (!photoData?.result?.photos?.length) {
      return NextResponse.json({ userPhotoUrl: null });
    }
    const fileId = photoData.result.photos[0][0].file_id;
    const { data: fileData } = await axios.get(`${TELEGRAM_API}/getFile`, {
      params: { file_id: fileId },
      timeout: 5000,
    });
    const userPhotoUrl = `https://api.telegram.org/file/bot${token}/${fileData.result.file_path}`;
    return NextResponse.json({ userPhotoUrl });
  } catch (error) {
    console.error("Error fetching profile picture:", error);
    if (axios.isAxiosError(error)) {
      const status = error.response?.status || 500;
      const message =
        error.response?.data?.description || "Failed to fetch profile picture";
      return NextResponse.json({ error: message }, { status });
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
