import Mux from '@mux/mux-node';
const tokenId = process.env.MUX_TOKEN_ID;
const tokenSecret = process.env.MUX_TOKEN_SECRET;
if (!tokenId || !tokenSecret) {
  console.log(
    'Skipped: set MUX_TOKEN_ID and MUX_TOKEN_SECRET to check the Management API. Public playback does not require them.',
  );
} else {
  try {
    await new Mux({ tokenId, tokenSecret }).video.assets.list({ limit: 1 });
    console.log('Mux Management API connection verified (read-only).');
  } catch (error) {
    console.error(
      `Mux connection failed (HTTP ${error.status ?? 'unavailable'}). Check token permissions and network access.`,
    );
    process.exitCode = 1;
  }
}
