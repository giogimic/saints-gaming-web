import type { Provider } from "next-auth/providers";

interface SteamProfile {
  steamid: string;
  personaname: string;
  avatarfull: string;
}

const SteamProvider = (): Provider => ({
  id: "steam",
  name: "Steam",
  type: "oauth",
  version: "2.0",
  authorization: {
    url: "https://steamcommunity.com/openid/login",
    params: {
      "openid.ns": "http://specs.openid.net/auth/2.0",
      "openid.mode": "checkid_setup",
      "openid.return_to": process.env.NEXTAUTH_URL + "/api/auth/callback/steam",
      "openid.realm": process.env.NEXTAUTH_URL,
      "openid.identity": "http://specs.openid.net/auth/2.0/identifier_select",
      "openid.claimed_id": "http://specs.openid.net/auth/2.0/identifier_select",
    },
  },
  token: {
    url: "https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/",
    params: {
      key: process.env.STEAM_API_KEY,
    },
  },
  userinfo: {
    url: "https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/",
    params: {
      key: process.env.STEAM_API_KEY,
    },
  },
  profile(profile: any) {
    return {
      id: profile.steamid,
      name: profile.personaname,
      image: profile.avatarfull,
      email: null,
    };
  },
  options: {
    clientId: process.env.STEAM_API_KEY,
    clientSecret: process.env.STEAM_API_KEY,
  },
});

export default SteamProvider; 