
import { InventoryItem, Hospital, Category } from './types';

export const CATEGORIES: Category[] = ['Medicine', 'PPE', 'Surgical', 'Diagnostics', 'Other'];

export const MY_HOSPITAL_ID = 'hosp-001';

export const MOCK_HOSPITALS: Hospital[] = [
  { id: 'hosp-001', name: 'St. Mary\'s General Hospital', location: 'Downtown', distance: '0km', rating: 4.8 },
  { id: 'hosp-002', name: 'Green Valley Medical Center', location: 'Westside', distance: '4.2km', rating: 4.5 },
  { id: 'hosp-003', name: 'Riverfront Children\'s Hospital', location: 'Eastside', distance: '12.8km', rating: 4.9 },
  { id: 'hosp-004', name: 'North Memorial Health', location: 'North District', distance: '8.5km', rating: 4.2 },
];

export const MOCK_INVENTORY: InventoryItem[] = [
  {
    id: 'item-1',
    name: 'Amoxicillin 500mg Capsules',
    category: 'Medicine',
    quantity: 250,
    unit: 'Boxes',
    expirationDate: '2025-06-15',
    condition: 'New',
    status: 'Available',
    hospitalId: 'hosp-001',
    description: 'Surplus stock from over-ordering for seasonal needs.'
  },
  {
    id: 'item-2',
    name: 'N95 Respirator Masks',
    category: 'PPE',
    quantity: 1200,
    unit: 'Pieces',
    expirationDate: '2026-12-01',
    condition: 'New',
    status: 'Available',
    hospitalId: 'hosp-001',
    description: 'Bulk surplus from emergency preparedness reserve.'
  },
  {
    id: 'item-3',
    name: 'Disposable Scalpels (Size 10)',
    category: 'Surgical',
    quantity: 45,
    unit: 'Boxes (10ct)',
    expirationDate: '2024-09-30',
    condition: 'New',
    status: 'Available',
    hospitalId: 'hosp-002',
    description: 'Switching to different supplier, current stock unused.'
  },
  {
    id: 'item-4',
    name: 'Rapid Antigen Test Kits',
    category: 'Diagnostics',
    quantity: 500,
    unit: 'Kits',
    expirationDate: '2024-05-20',
    condition: 'New',
    status: 'Available',
    hospitalId: 'hosp-003',
    description: 'Short dated surplus needs immediate utilization.'
  }
];
