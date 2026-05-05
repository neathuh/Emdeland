/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export enum Language {
  RU = 'ru',
  KZ = 'kz',
}

export enum Gender {
  MALE = 'male',
  FEMALE = 'female',
  OTHER = 'other',
}

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface UserProfile {
  name: string;
  age: number;
  gender: Gender;
  weight?: number;
  height?: number;
  allergies?: string;
  chronicDiseases?: string;
  medications?: string;
  lifestyle?: {
    sleep: string;
    nutrition: string;
    sport: string;
  };
}

export interface HealthRecord {
  id: string;
  date: string;
  symptoms: string;
  answers: Record<string, string>;
  analysis: string;
  recommendations: string[];
  severity: 'low' | 'medium' | 'high' | 'emergency';
}

export interface TrackingEntry {
  date: string;
  wellbeing: number; // 1-10
  symptoms: string[];
}

export interface DoctorAppointment {
  id: string;
  doctorType: string;
  date: string;
  time: string;
  description: string;
  status: 'pending' | 'confirmed' | 'cancelled';
}

export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
}
