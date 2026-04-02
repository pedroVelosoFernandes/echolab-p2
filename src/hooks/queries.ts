import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../lib/api-client';
import { Preset, Voice, MessagePack, VoiceSelection } from '../lib/types';

// Queries
export function usePresets() {
  return useQuery({
    queryKey: ['presets'],
    queryFn: async () => {
      const response = await apiClient.get<{ items: Preset[] }>('/me/presets');
      return response.items || [];
    },
    staleTime: 1000 * 60 * 10, // 10 mins
  });
}

export function useVoices() {
  return useQuery({
    queryKey: ['voices'],
    queryFn: async () => {
      const response = await apiClient.get<{ items: Voice[] }>('/voices');
      return response.items || [];
    },
    staleTime: 1000 * 60 * 60 * 24, // 24 hours (rarely changes)
  });
}

export function useMessagePacks() {
  return useQuery({
    queryKey: ['messagePacks'],
    queryFn: async () => {
      const response = await apiClient.get<{ items: MessagePack[] }>('/me/message-packs');
      return response.items || [];
    },
  });
}

export function useUserVoiceSelections() {
  return useQuery({
    queryKey: ['userVoiceSelections'],
    queryFn: async () => {
      const response = await apiClient.get<{ userId: string; tenantId: string; selections: VoiceSelection[] }>('/me/voice-selections');
      return response.selections || [];
    },
  });
}
