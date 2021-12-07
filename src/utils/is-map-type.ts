export default function isMapType(
  s: string,
): s is 'ping' | 'upload_speed' | 'download_speed' | 'dbm' {
  return s === 'ping' || s === 'upload_speed' || s === 'download_speed' || s === 'dbm';
}
