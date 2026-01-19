import { useState, useCallback } from 'react';
import { UserProfileType, RecordingPreferences, DEFAULT_PROFILES } from '@/types';

const STORAGE_KEY = 'recap-user-profile';

interface StoredProfile {
  type: UserProfileType;
  customPreferences?: RecordingPreferences;
}

export const useUserProfile = () => {
  const [profileType, setProfileType] = useState<UserProfileType>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed: StoredProfile = JSON.parse(stored);
        return parsed.type;
      }
    } catch {
      // Ignore parse errors
    }
    return 'developer'; // Default profile
  });

  const [customPreferences, setCustomPreferences] = useState<RecordingPreferences>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed: StoredProfile = JSON.parse(stored);
        if (parsed.customPreferences) {
          return parsed.customPreferences;
        }
      }
    } catch {
      // Ignore parse errors
    }
    return DEFAULT_PROFILES.custom.preferences;
  });

  const saveToStorage = useCallback((type: UserProfileType, prefs?: RecordingPreferences) => {
    const data: StoredProfile = {
      type,
      customPreferences: prefs,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, []);

  const changeProfile = useCallback((type: UserProfileType) => {
    setProfileType(type);
    saveToStorage(type, customPreferences);
  }, [customPreferences, saveToStorage]);

  const updateCustomPreferences = useCallback((prefs: RecordingPreferences) => {
    setCustomPreferences(prefs);
    if (profileType === 'custom') {
      saveToStorage('custom', prefs);
    }
  }, [profileType, saveToStorage]);

  const getCurrentPreferences = useCallback((): RecordingPreferences => {
    if (profileType === 'custom') {
      return customPreferences;
    }
    return DEFAULT_PROFILES[profileType].preferences;
  }, [profileType, customPreferences]);

  return {
    profileType,
    customPreferences,
    changeProfile,
    updateCustomPreferences,
    getCurrentPreferences,
    currentProfile: DEFAULT_PROFILES[profileType],
  };
};
