export default function isMeasurementType(
  s: string,
): s is 'ping' | 'upload_speed' | 'download_speed' {
  return s === 'ping' || s === 'upload_speed' || s === 'download_speed';
}
