export interface AuthCredentials {
  email: string;
  password: string;
}

export interface SignUpData extends AuthCredentials {
  passwordConfirm: string;
}

export interface Critter extends BaseModel {
  species_name: string;
  date_spotted: string;
  photo: string;
  notes: string;
  user_id: string;
  nick_name: string;
  latitude: string;
  longitude: string;
}
export interface BaseModel {
  id?: string;
  created?: string;
  updated?: string;
}

export interface ImageMetadata {
  dateSpotted: string;
  location: { lat: number; lng: number } | null;
}
