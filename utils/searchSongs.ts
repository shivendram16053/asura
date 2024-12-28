import axios from "axios";
import { getSpotifyToken } from "./spotifyAuth";

export const searchSongs = async (query: string) => {
  try {
    const token = await getSpotifyToken();

    const response = await axios.get("https://api.spotify.com/v1/search", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params: {
        q: query,
        type: "track",
        limit: 10,
      },
    });

    return response.data.tracks.items;
  } catch (error) {
    console.error("Spotify API error:", error);
    throw new Error("Failed to fetch songs from Spotify");
  }
};
