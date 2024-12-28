import { NextRequest, NextResponse } from "next/server";
import { searchSongs } from "../../../utils/searchSongs";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const query = searchParams.get("q");

  if (!query) {
    return NextResponse.json(
      { error: "Query parameter 'q' is required" },
      { status: 400 }
    );
  }

  try {
    const songs = await searchSongs(query);
    return NextResponse.json({ tracks: songs });
  } catch (error) {
    console.error("Error fetching songs:", error);

    return NextResponse.json(
      { error: "Failed to fetch songs" },
      { status: 500 }
    );
  }
}
