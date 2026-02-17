export interface CravingLog {
  id: string;
  timestamp: string;
  intensity: number;
  factors: string[];
  location: string;
  mood: string;
  outcome: 'not_acted' | 'smoked';
  quantity?: number;
  copingMethods?: string[];
  notes: string;
}
