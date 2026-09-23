import 'server-only';
import Mux from '@mux/mux-node';
let client: Mux | undefined;
/** Only call inside server code that actually needs the Management API. Playback needs no credentials. */
export function getMuxClient() {
  const tokenId = process.env.MUX_TOKEN_ID;
  const tokenSecret = process.env.MUX_TOKEN_SECRET;
  if (!tokenId || !tokenSecret)
    throw new Error('Mux Management API requires MUX_TOKEN_ID and MUX_TOKEN_SECRET.');
  return (client ??= new Mux({ tokenId, tokenSecret }));
}
/** Internal read-only connection check. Do not expose as a public route. */
export async function verifyMuxConnection() {
  await getMuxClient().video.assets.list({ limit: 1 });
  return { connected: true };
}
