import type { Provider } from 'next-auth/providers';
import { generateSteamState, validateSteamResponse, fetchSteamProfile } from './steam-auth';

export interface SteamProfile {
  steamid: string;
  communityvisibilitystate: number;
  profilestate: number;
  personaname: string;
  commentpermission: number;
  profileurl: string;
  avatar: string;
  avatarmedium: string;
  avatarfull: string;
  avatarhash: string;
  lastlogoff: number;
  personastate: number;
  realname: string;
  primaryclanid: string;
  timecreated: number;
  personastateflags: number;
  loccountrycode: string;
}

export default function SteamProvider(options: {
  clientId: string;
  clientSecret: string;
}): Provider {
  return {
    id: 'steam',
    name: 'Steam',
    type: 'oauth',
    authorization: {
      url: 'https://steamcommunity.com/openid/login',
      params: {
        'openid.ns': 'http://specs.openid.net/auth/2.0',
        'openid.mode': 'checkid_setup',
        'openid.return_to': `${process.env.NEXTAUTH_URL}/api/auth/callback/steam`,
        'openid.realm': process.env.NEXTAUTH_URL,
        'openid.identity': 'http://specs.openid.net/auth/2.0/identifier_select',
        'openid.claimed_id': 'http://specs.openid.net/auth/2.0/identifier_select',
        'openid.ns.sreg': 'http://openid.net/extensions/sreg/1.1',
        'openid.sreg.required': 'email',
      },
    },
    token: {
      url: 'https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002',
      params: {
        key: options.clientSecret,
      },
    },
    userinfo: {
      url: 'https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002',
      params: {
        key: options.clientSecret,
      },
      async request({ tokens, provider }) {
        try {
          const steamId = validateSteamResponse(tokens);
          return await fetchSteamProfile(steamId);
        } catch (error) {
          console.error('Error fetching Steam profile:', error);
          throw error;
        }
      },
    },
    profile(profile) {
      return {
        id: profile.steamid,
        name: profile.personaname,
        image: profile.avatarfull,
        email: null,
      };
    },
    options,
  };
} 