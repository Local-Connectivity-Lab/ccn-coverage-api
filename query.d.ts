type SiteStatus = 'active' | 'confirmed' | 'in-conversation';

type Site = {
  name: string;
  latitude: number;
  longitude: number;
  status: SiteStatus;
  address: string;
  cell_id?: string[]
};
