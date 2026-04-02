import { useState, useEffect } from 'react';
import { apiClient } from '../../lib/api-client';
import { Preset, PresetCreate } from '../../lib/types';
import { Plus, X, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { PageHeader } from '../components/PageHeader';
import contentBgImage from 'figma:asset/8ae19cca138daf368a96bb8fbe23a98c7d881c2f.png';
import { usePresets } from '../../hooks/queries';
import { Tutorial, useTutorial } from '../components/Tutorial';
import { tutorialMetadata } from '../data/tutorials';

export function Presets() {
  const { data: presets = [], isLoading: loading, refetch: fetchPresets } = usePresets();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const { isOpen: isTutorialOpen, openTutorial, handleClose: closeTutorial } = useTutorial('presets');

  async function handleDelete(presetId: string) {
    if (!confirm('Are you sure you want to delete this preset?')) return;

    try {
      await apiClient.delete(`/me/presets/${presetId}`);
      toast.success('Preset deleted');
      fetchPresets();
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete preset');
    }
  }

  return (
    <div className="h-full flex flex-col">
      <PageHeader
        title="Presets"
        onTutorialClick={openTutorial}
        showFavorite
        showMenu
        actions={
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground border border-input-border rounded-lg hover:bg-secondary/80 transition-colors shadow-[0px_1px_1px_0px_rgba(0,0,0,0.15)] text-sm font-medium"
            data-tutorial="new-preset"
          >
            <Plus className="w-5 h-5" />
            New Preset
          </button>
        }
      />

      <div className="flex-1 overflow-auto p-8">
        <div className="max-w-screen-2xl mx-auto">
          {loading ? (
            <div className="text-center py-16 text-muted-foreground text-base">Loading presets...</div>
          ) : presets.length === 0 ? (
            <div className="bg-[#1a1a1a] border border-[#242526] rounded-xl p-16 text-center">
              <p className="text-muted-foreground mb-6 text-base">No presets yet</p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="text-sm text-foreground font-medium hover:text-accent transition-colors"
              >
                Create your first preset
              </button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {presets.map((preset) => (
                <div
                  key={preset.presetId}
                  className="bg-[#1a1a1a] border border-[#242526] rounded-xl p-5 hover:bg-[#1f1f1f] transition-all group"
                >
                  {/* Header with name and delete button */}
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-base font-medium text-foreground">{preset.name}</h3>
                    <button
                      onClick={() => handleDelete(preset.presetId)}
                      className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-all"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Tags/Pills */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className="px-3 py-1 bg-[#151515] border border-[#2a2a2a] rounded-md text-xs text-[#A6ABB2]">
                      {preset.language}
                    </span>
                    <span className="px-3 py-1 bg-[#151515] border border-[#2a2a2a] rounded-md text-xs text-[#A6ABB2] capitalize">
                      {preset.gender}
                    </span>
                  </div>

                  {/* Parameters */}
                  <div className="flex items-center gap-4 text-xs">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[#666666]">Rate</span>
                      <span className="text-[#A6ABB2] font-medium">{preset.rate.toFixed(1)}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[#666666]">Pitch</span>
                      <span className="text-[#A6ABB2] font-medium">{preset.pitch.toFixed(1)}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[#666666]">Intone</span>
                      <span className="text-[#A6ABB2] font-medium">{preset.intonation.toFixed(1)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {showCreateModal && (
            <CreatePresetModal
              onClose={() => setShowCreateModal(false)}
              onSuccess={() => {
                setShowCreateModal(false);
                fetchPresets();
              }}
            />
          )}
        </div>
      </div>

      <Tutorial
        steps={tutorialMetadata.presets.steps}
        isOpen={isTutorialOpen}
        onClose={closeTutorial}
      />
    </div>
  );
}

function CreatePresetModal({
  onClose,
  onSuccess,
}: {
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [formData, setFormData] = useState<PresetCreate>({
    name: '',
    language: 'en-US',
    gender: 'female',
    rate: 1.0,
    pitch: 1.0,
    intonation: 1.0,
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

  const clamp = (value: number) => Math.max(0.5, Math.min(1.5, value));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const data = {
        ...formData,
        rate: clamp(formData.rate),
        pitch: clamp(formData.pitch),
        intonation: clamp(formData.intonation),
      };
      await apiClient.post('/me/presets', data);
      toast.success('Preset created successfully');
      onSuccess();
    } catch (error: any) {
      toast.error(error.message || 'Failed to create preset');
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
            <h2 className="text-base font-medium text-foreground">Create Preset</h2>
            <button
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-secondary-foreground mb-2">Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3 bg-input border border-input-border rounded-lg text-base text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                placeholder="My Preset"
                required
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

            <div>
              <label className="block text-sm font-medium text-secondary-foreground mb-2">
                Rate: {formData.rate.toFixed(2)}
              </label>
              <input
                type="range"
                min="0.5"
                max="1.5"
                step="0.1"
                value={formData.rate}
                onChange={(e) => setFormData({ ...formData, rate: parseFloat(e.target.value) })}
                className="w-full accent-accent h-2"
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-2">
                <span>0.5</span>
                <span>1.5</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary-foreground mb-2">
                Pitch: {formData.pitch.toFixed(2)}
              </label>
              <input
                type="range"
                min="0.5"
                max="1.5"
                step="0.1"
                value={formData.pitch}
                onChange={(e) => setFormData({ ...formData, pitch: parseFloat(e.target.value) })}
                className="w-full accent-accent h-2"
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-2">
                <span>0.5</span>
                <span>1.5</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary-foreground mb-2">
                Intonation: {formData.intonation.toFixed(2)}
              </label>
              <input
                type="range"
                min="0.5"
                max="1.5"
                step="0.1"
                value={formData.intonation}
                onChange={(e) =>
                  setFormData({ ...formData, intonation: parseFloat(e.target.value) })
                }
                className="w-full accent-accent h-2"
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-2">
                <span>0.5</span>
                <span>1.5</span>
              </div>
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