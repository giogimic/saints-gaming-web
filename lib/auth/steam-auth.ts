import crypto from 'crypto';

export function generateSteamState() {
  return crypto.randomBytes(16).toString('hex');
}

export function validateSteamResponse(response: any) {
  if (!response['openid.mode'] || response['openid.mode'] !== 'id_res') {
    throw new Error('Invalid OpenID response mode');
  }

  if (!response['openid.claimed_id']) {
    throw new Error('Missing claimed_id in response');
  }

  // Extract Steam ID from the claimed_id
  const steamId = response['openid.claimed_id'].split('/').pop();
  if (!steamId) {
    throw new Error('Could not extract Steam ID from response');
  }

  return steamId;
}

export function getSteamProfileUrl(steamId: string) {
  return `https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${process.env.STEAM_API_KEY}&steamids=${steamId}`;
}

export async function fetchSteamProfile(steamId: string) {
  const response = await fetch(getSteamProfileUrl(steamId));
  const data = await response.json();
  
  if (!data.response?.players?.[0]) {
    throw new Error('Could not fetch Steam profile');
  }

  return data.response.players[0];
} 