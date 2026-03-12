export interface PersonWithMosque {
  id: string;
  firstName: string;
  lastName: string;
  address: string;
  city: string;
  zipCode: string;
  lat: number | null;
  lng: number | null;
  phone: string | null;
  email: string | null;
  notes: string | null;
  mosqueId: string | null;
  mosque: MosqueBasic | null;
  createdAt: string;
  updatedAt: string;
}

export interface MosqueBasic {
  id: string;
  name: string;
  address: string;
  city: string;
  lat: number | null;
  lng: number | null;
}

export interface MosqueWithCount extends MosqueBasic {
  _count?: { persons: number };
}
