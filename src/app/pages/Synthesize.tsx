import { useState, useEffect } from 'react';
import { apiClient } from '../../lib/api-client';
import { Preset, SynthesizeRequest, SynthesizeResponse, Voice } from '../../lib/types';
import { Play, Save, Sparkles, Lightbulb, X } from 'lucide-react';
import { toast } from 'sonner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { PageHeader } from '../components/PageHeader';
import contentBgImage from '../../assets/8ae19cca138daf368a96bb8fbe23a98c7d881c2f.png';
import { useVoices, usePresets } from '../../hooks/queries';
import { Tutorial, useTutorial } from '../components/Tutorial';
import { tutorialMetadata } from '../data/tutorials';

type SourceMode = 'preset' | 'manual';

export function Synthesize() {
  const { data: presets = [], refetch: fetchPresets } = usePresets();
  const { data: allVoices = [] } = useVoices();
  const voices = allVoices.filter((v: Voice) => v.enabled);
  const { isOpen: isTutorialOpen, openTutorial, handleClose: closeTutorial } = useTutorial('synthesize');

  const [text, setText] = useState('');
  const [sourceMode, setSourceMode] = useState<SourceMode>('manual');
  const [selectedPresetId, setSelectedPresetId] = useState<string>('');
  
  // Manual settings
  const [language, setLanguage] = useState('en-US');
  const [gender, setGender] = useState('female');
  const [rate, setRate] = useState(1.0);
  const [pitch, setPitch] = useState(1.0);
  const [intonation, setIntonation] = useState(1.0);

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SynthesizeResponse | null>(null);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showTipsDialog, setShowTipsDialog] = useState(false);

  // Get unique languages from enabled voices
  const availableLanguages = Array.from(new Set(voices.map((v: Voice) => v.language))).sort();

  async function handleSynthesize() {
    if (!text.trim()) {
      toast.error('Please enter some text');
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      let request: SynthesizeRequest;

      if (sourceMode === 'preset' && selectedPresetId) {
        request = { text, presetId: selectedPresetId };
      } else {
        request = {
          text,
          language,
          gender,
          rate: Math.max(0.5, Math.min(1.5, rate)),
          pitch: Math.max(0.5, Math.min(1.5, pitch)),
          intonation: Math.max(0.5, Math.min(1.5, intonation)),
        };
      }

      const response = await apiClient.post<SynthesizeResponse>('/me/synthesize', request);
      setResult(response);
      // toast.success removed - silent operation
    } catch (error: any) {
      toast.error(error.message || 'Failed to synthesize audio');
    } finally {
      setLoading(false);
    }
  }

  async function handleSaveAsPreset(name: string) {
    try {
      await apiClient.post('/me/presets', {
        name,
        language,
        gender,
        rate: Math.max(0.5, Math.min(1.5, rate)),
        pitch: Math.max(0.5, Math.min(1.5, pitch)),
        intonation: Math.max(0.5, Math.min(1.5, intonation)),
      });
      // toast.success removed - silent operation
      setShowSaveModal(false);
      fetchPresets();
    } catch (error: any) {
      toast.error(error.message || 'Failed to save preset');
    }
  }

  return (
    <div className="h-full flex flex-col">
      <PageHeader
        title="Synthesize"
        onTutorialClick={openTutorial}
        showFavorite
        showMenu
      />

      <div className="flex-1 overflow-auto">
        <div className="max-w-screen-2xl mx-auto px-10 py-10">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-14">
            {/* Main Content */}
            <div className="space-y-10">
              {/* Text Input */}
              <div data-tutorial="text-input">
                <div className="flex items-center gap-2 mb-4">
                  <label className="block text-base font-medium text-foreground">Text to synthesize</label>
                  <button
                    onClick={() => setShowTipsDialog(true)}
                    className="flex items-center justify-center w-6 h-6 rounded-full border-2 border-yellow-500 hover:bg-yellow-500/10 transition-colors"
                    title="Special commands"
                  >
                    <Lightbulb className="w-4 h-4 text-yellow-500" />
                  </button>
                </div>
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  rows={6}
                  className="w-full px-0 py-3 bg-transparent border-0 border-b border-[#242526] text-base text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-[#393a4b] resize-none transition-colors"
                  placeholder="Enter the text you want to synthesize..."
                />
              </div>

              {/* Source Selection */}
              <div data-tutorial="mode-selector">
                <label className="block text-base font-medium text-foreground mb-4">Configuration source</label>
                <Select
                  value={sourceMode === 'preset' && selectedPresetId ? selectedPresetId : 'manual'}
                  onValueChange={(value) => {
                    if (value === 'manual') {
                      setSourceMode('manual');
                      setSelectedPresetId('');
                    } else {
                      setSourceMode('preset');
                      setSelectedPresetId(value);
                    }
                  }}
                >
                  <SelectTrigger className="w-full max-w-md text-base py-6">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="manual" className="text-base py-3">Configure manually</SelectItem>
                    {presets.map((preset) => (
                      <SelectItem key={preset.presetId} value={preset.presetId} className="text-base py-3">
                        {preset.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Manual Settings */}
              {sourceMode === 'manual' && (
                <>
                  <div className="pt-5" data-tutorial="manual-settings">
                    <h3 className="text-base font-medium text-foreground mb-5">Voice parameters</h3>
                    <div className="space-y-8">
                      <div className="grid grid-cols-2 gap-8">
                        <div>
                          <label className="block text-sm text-muted-foreground mb-3">Language</label>
                          <Select value={language} onValueChange={setLanguage}>
                            <SelectTrigger className="text-base py-6">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {availableLanguages.map(lang => (
                                <SelectItem key={lang} value={lang} className="text-base py-3">{lang}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <label className="block text-sm text-muted-foreground mb-3">Gender</label>
                          <Select value={gender} onValueChange={setGender}>
                            <SelectTrigger className="text-base py-6">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="female" className="text-base py-3">Female</SelectItem>
                              <SelectItem value="male" className="text-base py-3">Male</SelectItem>
                              <SelectItem value="neutral" className="text-base py-3">Neutral</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <label className="text-sm text-muted-foreground">Rate</label>
                          <span className="text-sm font-medium text-foreground">{rate.toFixed(2)}</span>
                        </div>
                        <input
                          type="range"
                          min="0.5"
                          max="1.5"
                          step="0.1"
                          value={rate}
                          onChange={(e) => setRate(parseFloat(e.target.value))}
                          className="w-full h-1.5 rounded-full appearance-none cursor-pointer bg-[#393a4b] [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:size-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:cursor-pointer [&::-moz-range-thumb]:size-5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:cursor-pointer"
                        />
                        <div className="flex justify-between text-xs text-muted-foreground mt-2">
                          <span>Slower</span>
                          <span>Faster</span>
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <label className="text-sm text-muted-foreground">Pitch</label>
                          <span className="text-sm font-medium text-foreground">{pitch.toFixed(2)}</span>
                        </div>
                        <input
                          type="range"
                          min="0.5"
                          max="1.5"
                          step="0.1"
                          value={pitch}
                          onChange={(e) => setPitch(parseFloat(e.target.value))}
                          className="w-full h-1.5 rounded-full appearance-none cursor-pointer bg-[#393a4b] [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:size-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:cursor-pointer [&::-moz-range-thumb]:size-5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:cursor-pointer"
                        />
                        <div className="flex justify-between text-xs text-muted-foreground mt-2">
                          <span>Lower</span>
                          <span>Higher</span>
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <label className="text-sm text-muted-foreground">Intonation</label>
                          <span className="text-sm font-medium text-foreground">{intonation.toFixed(2)}</span>
                        </div>
                        <input
                          type="range"
                          min="0.5"
                          max="1.5"
                          step="0.1"
                          value={intonation}
                          onChange={(e) => setIntonation(parseFloat(e.target.value))}
                          className="w-full h-1.5 rounded-full appearance-none cursor-pointer bg-[#393a4b] [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:size-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:cursor-pointer [&::-moz-range-thumb]:size-5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:cursor-pointer"
                        />
                        <div className="flex justify-between text-xs text-muted-foreground mt-2">
                          <span>Flat</span>
                          <span>Expressive</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3" data-tutorial="save-preset">
                    <button
                      onClick={() => setShowSaveModal(true)}
                      className="flex items-center gap-2.5 px-5 py-2.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <Save className="w-5 h-5" />
                      Save as preset
                    </button>
                  </div>
                </>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-8">
              {/* Status */}
              <div>
                <h3 className="text-sm text-muted-foreground mb-4">Status</h3>
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${result ? 'bg-green-500' : loading ? 'bg-yellow-500' : 'bg-[#393a4b]'}`} />
                  <span className="text-base text-foreground">
                    {result ? 'Ready' : loading ? 'Processing' : 'Idle'}
                  </span>
                </div>
              </div>

              {/* Generate Button */}
              <div data-tutorial="synthesize-button">
                <button
                  onClick={handleSynthesize}
                  disabled={loading || !text.trim()}
                  className="w-full px-5 py-3.5 bg-primary text-primary-foreground rounded-lg text-base font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-[0_0_15px_rgba(139,92,246,0.5)] hover:shadow-[0_0_25px_rgba(139,92,246,0.7)]"
                >
                  {loading ? 'Generating...' : 'Generate Audio'}
                </button>
              </div>

              {/* Current Configuration */}
              <div>
                <h3 className="text-sm text-muted-foreground mb-4">Configuration</h3>
                <div className="space-y-3 min-h-[80px]">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Mode</span>
                    <span className="text-foreground capitalize">{sourceMode}</span>
                  </div>
                  {sourceMode === 'manual' && (
                    <>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Language</span>
                        <span className="text-foreground">{language}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Gender</span>
                        <span className="text-foreground capitalize">{gender}</span>
                      </div>
                    </>
                  )}
                  {sourceMode === 'preset' && selectedPresetId && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Preset</span>
                      <span className="text-foreground">
                        {presets.find(p => p.presetId === selectedPresetId)?.name}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Result */}
              {result && (
                <div>
                  <h3 className="text-sm text-muted-foreground mb-4">Result</h3>
                  <div className="space-y-4">
                    {result.cached && (
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full bg-blue-500" />
                        <span className="text-sm text-muted-foreground">Cached result</span>
                      </div>
                    )}
                    <audio controls src={result.url} className="w-full h-12" />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {showSaveModal && (
        <SavePresetModal
          onClose={() => setShowSaveModal(false)}
          onSave={handleSaveAsPreset}
        />
      )}

      {showTipsDialog && (
        <TipsDialog onClose={() => setShowTipsDialog(false)} />
      )}

      <Tutorial
        steps={tutorialMetadata.synthesize.steps}
        isOpen={isTutorialOpen}
        onClose={closeTutorial}
      />
    </div>
  );
}

function SavePresetModal({
  onClose,
  onSave,
}: {
  onClose: () => void;
  onSave: (name: string) => void;
}) {
  const [name, setName] = useState('');

  useEffect(() => {
    function handleEscape(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        onClose();
      }
    }
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (name.trim()) {
      onSave(name);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-6">
      <div 
        className="relative border border-border rounded-xl max-w-md w-full p-8 shadow-xl overflow-hidden"
        style={{
          backgroundImage: `url(${contentBgImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          transform: 'scaleX(-1)'
        }}
      >
        <div style={{ transform: 'scaleX(-1)' }}>
          <h2 className="text-base font-medium text-foreground mb-6">Save as Preset</h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-secondary-foreground mb-2">Preset Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 bg-input border border-input-border rounded-lg text-base text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                placeholder="My Preset"
                autoFocus
                required
              />
            </div>
            <div className="flex gap-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-3 border border-input-border bg-secondary text-secondary-foreground rounded-lg text-sm font-medium hover:bg-secondary/80 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-3 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
              >
                Save
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

function TipsDialog({
  onClose,
}: {
  onClose: () => void;
}) {
  useEffect(() => {
    function handleEscape(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        onClose();
      }
    }
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onClose]);

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
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-base font-medium text-foreground">Special Commands</h2>
            <button
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="space-y-6 text-base">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <code className="bg-[#2a2a3a] text-primary px-3 py-1.5 rounded-lg text-sm font-mono">pause[500ms]</code>
              </div>
              <p className="text-muted-foreground text-sm">Inserts a pause in the speech. Specify duration in milliseconds (e.g., 500ms, 1000ms).</p>
            </div>

            <div>
              <div className="flex items-center gap-3 mb-2">
                <code className="bg-[#2a2a3a] text-primary px-3 py-1.5 rounded-lg text-sm font-mono">characters[abc]</code>
              </div>
              <p className="text-muted-foreground text-sm">Spells out each character individually. Useful for acronyms or letter-by-letter pronunciation.</p>
            </div>

            <div>
              <div className="flex items-center gap-3 mb-2">
                <code className="bg-[#2a2a3a] text-primary px-3 py-1.5 rounded-lg text-sm font-mono">numbers[123]</code>
              </div>
              <p className="text-muted-foreground text-sm">Reads each digit separately instead of as a complete number (\"one two three\" vs \"one hundred twenty-three\").</p>
            </div>
          </div>

          <div className="flex justify-end mt-8">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              Got it
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}