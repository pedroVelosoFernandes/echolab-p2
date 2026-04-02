import { useState, useEffect } from 'react';
import { apiClient, ApiError } from '../../lib/api-client';
import { Voice, VoiceCreate, VoiceSelection } from '../../lib/types';
import { useUserContext } from '../../hooks/useUserContext';
import { Plus, X, Volume2, Check, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { PageHeader } from '../components/PageHeader';
import contentBgImage from '../../assets/8ae19cca138daf368a96bb8fbe23a98c7d881c2f.png';
import { useVoices, useUserVoiceSelections } from '../../hooks/queries';
import { useQueryClient } from '@tanstack/react-query';
import { Tutorial, useTutorial } from '../components/Tutorial';
import { tutorialMetadata } from '../data/tutorials';

export function Voices() {
  const queryClient = useQueryClient();
  const { data: voices = [], isLoading: voicesLoading } = useVoices();
  const { data: selectedVoices = [], isLoading: selectionsLoading } = useUserVoiceSelections();

  
  const loading = voicesLoading || selectionsLoading;

  const [showCreateModal, setShowCreateModal] = useState(false);
  const { isOpen: isTutorialOpen, openTutorial, handleClose: closeTutorial } = useTutorial('voices');
  const { userContext } = useUserContext();

  async function toggleVoiceSelection(voice: Voice) {
    const isSelected = selectedVoices.some(
      s => s.language === voice.language && s.gender === voice.gender && s.voiceId === voice.voiceId
    );

    let newSelections: VoiceSelection[];
    
    if (isSelected) {
      // Check if this is the only voice selected for this language
      const voicesInLanguage = voices.filter(v => v.language === voice.language && v.enabled);
      const selectionsInLanguage = selectedVoices.filter(s => s.language === voice.language);
      
      if (selectionsInLanguage.length <= 1 && voicesInLanguage.length > 1) {
        return;
      }
      
      // Remove selection for this language/gender combo
      newSelections = selectedVoices.filter(
        s => !(s.language === voice.language && s.gender === voice.gender)
      );
    } else {
      // Remove any existing selection for this language/gender combo and add new one
      newSelections = [
        ...selectedVoices.filter(
          s => !(s.language === voice.language && s.gender === voice.gender)
        ),
        {
          language: voice.language,
          gender: voice.gender,
          voiceId: voice.voiceId,
        }
      ];
    }
    
    // Optimistic update
    const previousSelections = selectedVoices;
    queryClient.setQueryData(['userVoiceSelections'], newSelections);
    
    try {
      // Update all selections at once
      await apiClient.put('/me/voice-selections', {
        selections: newSelections
      });
      // Invalidate to refetch silently in background if needed
      queryClient.invalidateQueries({ queryKey: ['userVoiceSelections'] });
    } catch (error: any) {
      // Revert on error
      queryClient.setQueryData(['userVoiceSelections'], previousSelections);
      toast.error(error.message || 'Failed to update voice selection');
    }
  }

  function isVoiceSelected(voice: Voice): boolean {
    return selectedVoices.some(
      s => s.language === voice.language && s.gender === voice.gender && s.voiceId === voice.voiceId
    );
  }

  // Group voices by language
  const voicesByLanguage = voices.reduce((acc, voice) => {
    if (!acc[voice.language]) {
      acc[voice.language] = { male: [], female: [], neutral: [] };
    }
    if (voice.gender === 'male') {
      acc[voice.language].male.push(voice);
    } else if (voice.gender === 'female') {
      acc[voice.language].female.push(voice);
    } else {
      acc[voice.language].neutral.push(voice);
    }
    return acc;
  }, {} as Record<string, { male: Voice[]; female: Voice[]; neutral: Voice[] }>);

  return (
    <div className="h-full flex flex-col">
      <PageHeader
        title="Voices"
        onTutorialClick={openTutorial}
        showFavorite
        showMenu
        actions={
          userContext?.isAdmin ? (
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground border border-input-border rounded-lg hover:bg-secondary/80 transition-colors shadow-[0px_1px_1px_0px_rgba(0,0,0,0.15)] text-sm font-medium"
            >
              <Plus className="w-5 h-5" />
              New Voice
            </button>
          ) : undefined
        }
      />

      <div className="flex-1 overflow-auto p-8">
        <div className="max-w-screen-2xl mx-auto">
          {loading ? (
            <div className="text-center py-16 text-muted-foreground text-base">Loading voices...</div>
          ) : voices.length === 0 ? (
            <div className="text-center py-16">
              <Volume2 className="w-16 h-16 text-muted-foreground mx-auto mb-6" />
              <p className="text-muted-foreground text-base">No voices available</p>
            </div>
          ) : (
            <div className="space-y-12">
              {Object.entries(voicesByLanguage).map(([language, genderGroups], langIndex) => (
                <div key={language}>
                  {langIndex > 0 && (
                    <div className="border-t border-[#242526] mb-12" />
                  )}
                  
                  <h2 className="text-base font-medium text-foreground mb-6">
                    {language}
                  </h2>

                  <div className="space-y-8">
                    {/* Male Voices */}
                    {genderGroups.male.length > 0 && (
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground mb-4 uppercase tracking-wide">Male</h3>
                        <div className="space-y-2">
                          {genderGroups.male.map((voice) => (
                            <VoiceCard
                              key={voice.voiceId}
                              voice={voice}
                              isAdmin={userContext?.isAdmin ?? false}
                              onSelect={toggleVoiceSelection}
                              isSelected={isVoiceSelected(voice)}
                            />
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Female Voices */}
                    {genderGroups.female.length > 0 && (
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground mb-4 uppercase tracking-wide">Female</h3>
                        <div className="space-y-2">
                          {genderGroups.female.map((voice) => (
                            <VoiceCard
                              key={voice.voiceId}
                              voice={voice}
                              isAdmin={userContext?.isAdmin ?? false}
                              onSelect={toggleVoiceSelection}
                              isSelected={isVoiceSelected(voice)}
                            />
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Neutral Voices */}
                    {genderGroups.neutral.length > 0 && (
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground mb-4 uppercase tracking-wide">Neutral</h3>
                        <div className="space-y-2">
                          {genderGroups.neutral.map((voice) => (
                            <VoiceCard
                              key={voice.voiceId}
                              voice={voice}
                              isAdmin={userContext?.isAdmin ?? false}
                              onSelect={toggleVoiceSelection}
                              isSelected={isVoiceSelected(voice)}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {showCreateModal && (
        <CreateVoiceModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            // fetchVoices(); - wait, react-query invalidates
          }}
        />
      )}

      <Tutorial
        steps={tutorialMetadata.voices.steps}
        isOpen={isTutorialOpen}
        onClose={closeTutorial}
      />
    </div>
  );
}

function VoiceCard({
  voice,
  isAdmin,
  onSelect,
  isSelected,
}: {
  voice: Voice;
  isAdmin: boolean;
  onSelect: (voice: Voice) => void;
  isSelected: boolean;
}) {
  const qualities = voice.qualities?.join(', ') || '';
  
  // Only show enabled voices to regular users
  if (!voice.enabled && !isAdmin) {
    return null;
  }
  
  return (
    <div
      className={`relative px-8 py-5 rounded-lg transition-all ${
        voice.enabled ? 'cursor-pointer hover:bg-[#1a1a1a]' : 'cursor-not-allowed opacity-50'
      } ${isSelected ? 'bg-[#1a1a1a]' : ''}`}
      onClick={() => voice.enabled && onSelect(voice)}
    >
      <div className="flex items-center gap-6">
        {/* Selection indicator */}
        <div className="flex-shrink-0">
          {isSelected ? (
            <div className="w-6 h-6 rounded-full bg-accent flex items-center justify-center">
              <Check className="w-4 h-4 text-white" />
            </div>
          ) : (
            <div className="w-6 h-6 rounded-full border-2 border-[#242526]" />
          )}
        </div>

        {/* Provider - fixed width */}
        <div className="flex-shrink-0 w-24">
          <p className="text-sm text-muted-foreground truncate">{voice.provider}</p>
        </div>

        {/* Voice name - takes remaining space */}
        <div className="flex-1 min-w-0">
          <h4 className="text-base text-foreground truncate">
            {voice.displayName || voice.voiceKey}
          </h4>
        </div>

        {/* Divider line */}
        <div className="w-px h-8 bg-[#242526] flex-shrink-0" />

        {/* Right side info */}
        <div className="flex items-center gap-6 flex-shrink-0">
          {qualities && (
            <span className="text-sm text-muted-foreground px-3 py-1.5 rounded-md bg-muted/30">
              {qualities}
            </span>
          )}
          
          {isAdmin && (
            <span className={`text-sm px-3 py-1.5 rounded-md ${voice.enabled ? 'bg-accent/10 text-accent' : 'bg-destructive/10 text-destructive'}`}>
              {voice.enabled ? 'Enabled' : 'Disabled'}
            </span>
          )}
          
          <button
            className="w-10 h-10 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-[#242526]"
            onClick={(e) => {
              e.stopPropagation();
              // Play preview (placeholder)
            }}
          >
            <Volume2 className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}

function CreateVoiceModal({
  onClose,
  onSuccess,
}: {
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [formData, setFormData] = useState<VoiceCreate>({
    provider: 'polly',
    voiceKey: '',
    language: 'en-US',
    gender: 'female',
    qualities: [],
    displayName: '',
    enabled: true,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    function handleEscape(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        onClose();
      }
    }
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      await apiClient.post('/admin/voices', formData);
      toast.success('Voice created successfully');
      onSuccess();
    } catch (error: any) {
      toast.error(error.message || 'Failed to create voice');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-6">
      <div 
        className="relative border border-border rounded-xl max-w-lg w-full p-8 shadow-xl overflow-hidden"
        style={{
          backgroundImage: `url(${contentBgImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          transform: 'scaleX(-1)'
        }}
      >
        <div style={{ transform: 'scaleX(-1)' }}>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-base font-medium text-foreground">Create Voice</h2>
            <button
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-secondary-foreground mb-2">Provider</label>
              <input
                type="text"
                value={formData.provider}
                onChange={(e) => setFormData({ ...formData, provider: e.target.value })}
                className="w-full px-4 py-3 bg-input border border-input-border rounded-lg text-base text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary-foreground mb-2">Voice Key</label>
              <input
                type="text"
                value={formData.voiceKey}
                onChange={(e) => setFormData({ ...formData, voiceKey: e.target.value })}
                className="w-full px-4 py-3 bg-input border border-input-border rounded-lg text-base text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary-foreground mb-2">Display Name</label>
              <input
                type="text"
                value={formData.displayName}
                onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                className="w-full px-4 py-3 bg-input border border-input-border rounded-lg text-base text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                placeholder="Optional"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-secondary-foreground mb-2">Language</label>
                <input
                  type="text"
                  value={formData.language}
                  onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                  className="w-full px-4 py-3 bg-input border border-input-border rounded-lg text-base text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                  placeholder="en-US"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-foreground mb-2">Gender</label>
                <select
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                  className="w-full px-4 py-3 bg-input border border-input-border rounded-lg text-base text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                  required
                >
                  <option value="female">Female</option>
                  <option value="male">Male</option>
                  <option value="neutral">Neutral</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="enabled"
                checked={formData.enabled}
                onChange={(e) => setFormData({ ...formData, enabled: e.target.checked })}
                className="w-4 h-4 rounded border-input-border"
              />
              <label htmlFor="enabled" className="text-sm text-secondary-foreground">
                Enabled
              </label>
            </div>

            <div className="flex gap-4 pt-6 border-t border-border">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-3 border border-input-border bg-secondary text-secondary-foreground rounded-lg text-sm font-medium hover:bg-secondary/80 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-4 py-3 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Creating...' : 'Create'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}