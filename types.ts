
export type Category = 'Medicine' | 'PPE' | 'Surgical' | 'Diagnostics' | 'Other';

export interface InventoryItem {
  id: string;
  name: string;
  category: Category;
  quantity: number;
  unit: string;
  expirationDate: string;
  condition: 'New' | 'Like New';
  status: 'Available' | 'Reserved' | 'Swapped';
  hospitalId: string;
  description: string;
}

export interface Hospital {
  id: string;
  name: string;
  location: string;
  distance: string;
  rating: number;
}

export interface SwapRequest {
  id: string;
  fromHospitalId: string;
  toHospitalId: string;
  offeredItemId: string;
  requestedItemId: string;
  status: 'Pending' | 'Accepted' | 'Rejected' | 'Completed';
  createdAt: string;
}

export interface AnalysisResult {
  riskLevel: 'Low' | 'Medium' | 'High';
  recommendations: string[];
  potentialSavings: string;
}
