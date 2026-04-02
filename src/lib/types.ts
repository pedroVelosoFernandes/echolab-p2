// API types based on backend schema

export interface UserContext {
  userId: string;
  tenantId: string;
  isAdmin: boolean;
  groups: string[];
}

export interface Voice {
  voiceId: string;
  provider: string;
  voiceKey: string;
  language: string;
  gender: string;
  qualities: string[];
  displayName?: string;
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface VoiceCreate {
  provider: string;
  voiceKey: string;
  language: string;
  gender: string;
  qualities?: string[];
  displayName?: string;
  enabled: boolean;
}

export interface Preset {
  presetId: string;
  userId: string;
  name: string;
  language: string;
  gender: string;
  rate: number;
  pitch: number;
  intonation: number;
}

export interface PresetCreate {
  name: string;
  language: string;
  gender: string;
  rate: number;
  pitch: number;
  intonation: number;
}

export interface MessagePackMessage {
  messageName: string;
  presetId: string;
  messageText: string;
}

export interface MessagePack {
  packId: string;
  userId: string;
  name: string;
  messages: MessagePackMessage[];
  createdAt: string;
  updatedAt: string;
}

export interface MessagePackCreate {
  name: string;
  messages: MessagePackMessage[];
}

export interface MessagePackUpdate {
  name?: string;
  messages?: MessagePackMessage[];
}

export interface SynthesizeRequest {
  text: string;
  presetId?: string;
  language?: string;
  gender?: string;
  rate?: number;
  pitch?: number;
  intonation?: number;
}

export interface SynthesizeResponse {
  url: string;
  cached: boolean;
}

export interface VoiceSelection {
  language: string;
  gender: string;
  voiceId: string;
}

export interface TenantDefaultVoice {
  language: string;
  gender: string;
  voiceId: string;
}
