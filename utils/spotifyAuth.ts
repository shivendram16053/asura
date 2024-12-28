import axios from "axios";

const CLIENT_ID = `${process.env.SPOTIFY_CLIENT_ID}`;
const CLIENT_SECRET = `${process.env.SPOTIFY_CLIENT_SECRET}`;

export const getSpotifyToken = async (): Promise<string> => {
  const response = await axios.post(
    "https://accounts.spotify.com/api/token",
    new URLSearchParams({ grant_type: "client_credentials" }),
    {
      headers: {
        Authorization: `Basic ${Buffer.from(
          `${CLIENT_ID}:${CLIENT_SECRET}`
        ).toString("base64")}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
    }
  );

  return response.data.access_token;
};
