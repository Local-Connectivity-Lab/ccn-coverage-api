import { MapType } from '../types/query';

export default function isValidMapType(s: string): s is MapType {
  return (
    s === 'ping' ||
    s === 'upload_speed' ||
    s === 'download_speed' ||
    s === 'dbm'
  );
}
