import { Database } from './types';

declare global {
  type SupabaseDatabase = Database;
} 