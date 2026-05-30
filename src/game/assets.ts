/**
 * Version of the assets.
 * Required for browser cache busting.
 * Use "-" as minor version separator (e.g. "v0-1")
 *
 */
const ASSETS_VERSION = "v0";

export function assetUrl(path: string): string {
  return `/assets/${ASSETS_VERSION}/${path}`;
}
