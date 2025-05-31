export interface INFT {
  tokenId: number;
  uri: string;
  name: string;
  description: string;
  image: string;
  image_site: string;
  animation_site: string;
  animation_url: string;
  power: number;
  rarity: string;
  attributes: {
    trait_type: string;
    value: string;
  }[];
  metadata: any;
}
