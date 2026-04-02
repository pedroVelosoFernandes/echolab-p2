import { useState, useEffect } from 'react';
import { apiClient } from '../../lib/api-client';
import { MessagePack, MessagePackCreate, MessagePackUpdate, Preset, MessagePackMessage } from '../../lib/types';
import { Plus, X, Trash2, Package, Edit } from 'lucide-react';
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
import { useMessagePacks, usePresets } from '../../hooks/queries';
import { Tutorial, useTutorial } from '../components/Tutorial';
import { tutorialMetadata } from '../data/tutorials';

export function MessagePacks() {
  const { data: packs = [], isLoading: loading, refetch: fetchPacks } = useMessagePacks();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingPack, setEditingPack] = useState<MessagePack | null>(null);
  const [expandedPack, setExpandedPack] = useState<string | null>(null);
  const { isOpen: isTutorialOpen, openTutorial, handleClose: closeTutorial } = useTutorial('message-packs');

  async function handleDeletePack(packId: string) {
    if (!confirm('Are you sure you want to delete this message pack?')) return;

    try {
      await apiClient.delete(`/me/message-packs/${packId}`);
      toast.success('Message pack deleted');
      fetchPacks();
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete message pack');
    }
  }

  async function handleDeleteMessage(packId: string, messageName: string) {
    if (!confirm('Are you sure you want to delete this message?')) return;

    try {
      await apiClient.delete(`/me/message-packs/${packId}/messages/${messageName}`);
      toast.success('Message deleted');
      fetchPacks();
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete message');
    }
  }

  return (
    <div className="h-full flex flex-col">
      <PageHeader
        title="Message Packs"
        onTutorialClick={openTutorial}
        showFavorite
        showMenu
        actions={
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground border border-input-border rounded-lg hover:bg-secondary/80 transition-colors shadow-[0px_1px_1px_0px_rgba(0,0,0,0.15)] text-sm font-medium"
          >
            <Plus className="w-5 h-5" />
            New Pack
          </button>
        }
      />

      <div className="flex-1 overflow-auto p-8">
        <div className="max-w-screen-2xl mx-auto">
          {loading ? (
            <div className="text-center py-16 text-muted-foreground text-base">Loading message packs...</div>
          ) : packs.length === 0 ? (
            <div className="bg-[#1a1a1a] border border-[#242526] rounded-xl p-16 text-center">
              <Package className="w-16 h-16 text-muted-foreground mx-auto mb-6" />
              <p className="text-muted-foreground mb-6 text-base">No message packs yet</p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="text-sm text-foreground font-medium hover:text-accent transition-colors"
              >
                Create your first message pack
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {packs.map((pack) => (
                <div
                  key={pack.packId}
                  className="bg-[#1a1a1a] border border-[#242526] rounded-xl overflow-hidden"
                >
                  <div 
                    className="p-6 flex justify-between items-center cursor-pointer hover:bg-[#1f1f1f] transition-colors"
                    onClick={() => setExpandedPack(expandedPack === pack.packId ? null : pack.packId)}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-2">
                        <h3 className="font-medium text-foreground text-base">{pack.name}</h3>
                        <span className="text-sm text-muted-foreground">
                          {pack.messages.length} message{pack.messages.length !== 1 ? 's' : ''}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Created {new Date(pack.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingPack(pack);
                        }}
                        className="text-blue-400 hover:text-blue-300 p-2 transition-colors"
                        title="Edit pack"
                      >
                        <Edit className="w-5 h-5" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeletePack(pack.packId);
                        }}
                        className="text-red-400 hover:text-red-300 p-2 transition-colors"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  {expandedPack === pack.packId && (
                    <div className="border-t border-[#242526] bg-[#151515] p-6">
                      <div className="space-y-4">
                        {pack.messages.map((message) => (
                          <div
                            key={message.messageName}
                            className="bg-[#1a1a1a] border border-[#242526] rounded-lg p-5"
                          >
                            <div className="flex justify-between items-start mb-3">
                              <span className="text-sm font-medium text-foreground">
                                {message.messageName}
                              </span>
                              <button
                                onClick={() =>
                                  handleDeleteMessage(pack.packId, message.messageName)
                                }
                                className="text-muted-foreground hover:text-destructive transition-colors"
                              >
                                <X className="w-5 h-5" />
                              </button>
                            </div>
                            <p className="text-sm text-foreground mb-3">{message.messageText}</p>
                            <p className="text-xs text-muted-foreground">Preset ID: {message.presetId}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {showCreateModal && (
        <CreatePackModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            fetchPacks();
          }}
        />
      )}

      {editingPack && (
        <EditPackModal
          pack={editingPack}
          onClose={() => setEditingPack(null)}
          onSuccess={() => {
            setEditingPack(null);
            fetchPacks();
          }}
        />
      )}

      <Tutorial
        steps={tutorialMetadata['message-packs'].steps}
        isOpen={isTutorialOpen}
        onClose={closeTutorial}
      />
    </div>
  );
}

function CreatePackModal({
  onClose,
  onSuccess,
}: {
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [name, setName] = useState('');
  const [messages, setMessages] = useState<MessagePackMessage[]>([]);
  const [loading, setLoading] = useState(false);

  const { data: presets = [] } = usePresets();

  useEffect(() => {
    function handleEscape(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        onClose();
      }
    }
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  function addMessage() {
    setMessages([
      ...messages,
      {
        messageName: '',
        presetId: presets[0]?.presetId || '',
        messageText: '',
      },
    ]);
  }

  function updateMessage(index: number, field: keyof MessagePackMessage, value: string) {
    const updated = [...messages];
    updated[index] = { ...updated[index], [field]: value };
    setMessages(updated);
  }

  function removeMessage(index: number) {
    setMessages(messages.filter((_, i) => i !== index));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (messages.length === 0) {
      toast.error('Add at least one message');
      return;
    }

    // Check for unique message names
    const names = messages.map((m) => m.messageName);
    if (new Set(names).size !== names.length) {
      toast.error('Message names must be unique');
      return;
    }

    setLoading(true);

    try {
      const data: MessagePackCreate = { name, messages };
      await apiClient.post('/me/message-packs', data);
      toast.success('Message pack created successfully');
      onSuccess();
    } catch (error: any) {
      toast.error(error.message || 'Failed to create message pack');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div
        className="relative border border-border rounded-xl max-w-4xl w-full p-8 my-8 shadow-xl overflow-hidden"
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
            <h2 className="text-base font-medium text-foreground">Create Message Pack</h2>
            <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-secondary-foreground mb-2">Pack Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 bg-input border border-input-border rounded-lg text-base text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                placeholder="My Message Pack"
                required
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-3">
                <label className="block text-xs font-medium text-secondary-foreground">Messages</label>
                <button
                  type="button"
                  onClick={addMessage}
                  disabled={presets.length === 0}
                  className="flex items-center gap-1.5 px-2.5 py-1 text-xs bg-secondary text-secondary-foreground border border-input-border rounded hover:bg-secondary/80 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Message
                </button>
              </div>

              {presets.length === 0 && (
                <p className="text-xs text-muted-foreground mb-3">
                  You need to create presets first before adding messages.
                </p>
              )}

              <div className="space-y-2.5 max-h-96 overflow-y-auto">
                {messages.map((message, index) => (
                  <div key={index} className="border border-border bg-muted rounded p-3 space-y-2.5">
                    <div className="flex justify-between items-start">
                      <span className="text-xs font-medium text-secondary-foreground">
                        Message {index + 1}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeMessage(index)}
                        className="text-muted-foreground hover:text-destructive"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div>
                      <label className="block text-[11px] text-muted-foreground mb-1">Name</label>
                      <input
                        type="text"
                        value={message.messageName}
                        onChange={(e) => updateMessage(index, 'messageName', e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-input border border-input-border rounded text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                        placeholder="Unique message name"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] text-muted-foreground mb-1">Preset</label>
                      <Select
                        value={message.presetId}
                        onValueChange={(value) => updateMessage(index, 'presetId', value)}
                        className="w-full px-2.5 py-1.5 bg-input border border-input-border rounded text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                        required
                      >
                        <SelectTrigger className="w-full px-2.5 py-1.5 bg-input border border-input-border rounded text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring">
                          <SelectValue placeholder="Select a preset">
                            {presets.find((preset) => preset.presetId === message.presetId)?.name}
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent className="w-full px-2.5 py-1.5 bg-input border border-input-border rounded text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring">
                          {presets.map((preset) => (
                            <SelectItem key={preset.presetId} value={preset.presetId}>
                              {preset.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="block text-[11px] text-muted-foreground mb-1">Text</label>
                      <textarea
                        value={message.messageText}
                        onChange={(e) => updateMessage(index, 'messageText', e.target.value)}
                        rows={2}
                        className="w-full px-2.5 py-1.5 bg-input border border-input-border rounded text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring resize-none"
                        placeholder="Message text"
                        required
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-2.5 pt-4 border-t border-border">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-3 py-2 border border-input-border bg-secondary text-secondary-foreground rounded text-xs hover:bg-secondary/80 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || messages.length === 0}
                className="flex-1 px-3 py-2 bg-primary text-primary-foreground rounded text-xs hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Creating...' : 'Create Pack'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

function EditPackModal({
  pack,
  onClose,
  onSuccess,
}: {
  pack: MessagePack;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [name, setName] = useState(pack.name);
  const [messages, setMessages] = useState<MessagePackMessage[]>(pack.messages);
  const [loading, setLoading] = useState(false);

  const { data: presets = [] } = usePresets();

  useEffect(() => {
    function handleEscape(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        onClose();
      }
    }
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  function addMessage() {
    setMessages([
      ...messages,
      {
        messageName: '',
        presetId: presets[0]?.presetId || '',
        messageText: '',
      },
    ]);
  }

  function updateMessage(index: number, field: keyof MessagePackMessage, value: string) {
    const updated = [...messages];
    updated[index] = { ...updated[index], [field]: value };
    setMessages(updated);
  }

  function removeMessage(index: number) {
    setMessages(messages.filter((_, i) => i !== index));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (messages.length === 0) {
      toast.error('Add at least one message');
      return;
    }

    // Check for unique message names
    const names = messages.map((m) => m.messageName);
    if (new Set(names).size !== names.length) {
      toast.error('Message names must be unique');
      return;
    }

    setLoading(true);

    try {
      const data: MessagePackUpdate = { name, messages };
      await apiClient.put(`/me/message-packs/${pack.packId}`, data);
      toast.success('Message pack updated successfully');
      onSuccess();
    } catch (error: any) {
      toast.error(error.message || 'Failed to update message pack');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div
        className="relative border border-border rounded-xl max-w-4xl w-full p-8 my-8 shadow-xl overflow-hidden"
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
            <h2 className="text-base font-medium text-foreground">Edit Message Pack</h2>
            <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-secondary-foreground mb-2">Pack Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 bg-input border border-input-border rounded-lg text-base text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                placeholder="My Message Pack"
                required
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-3">
                <label className="block text-xs font-medium text-secondary-foreground">Messages</label>
                <button
                  type="button"
                  onClick={addMessage}
                  disabled={presets.length === 0}
                  className="flex items-center gap-1.5 px-2.5 py-1 text-xs bg-secondary text-secondary-foreground border border-input-border rounded hover:bg-secondary/80 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Message
                </button>
              </div>

              {presets.length === 0 && (
                <p className="text-xs text-muted-foreground mb-3">
                  You need to create presets first before adding messages.
                </p>
              )}

              <div className="space-y-2.5 max-h-96 overflow-y-auto">
                {messages.map((message, index) => (
                  <div key={index} className="border border-border bg-muted rounded p-3 space-y-2.5">
                    <div className="flex justify-between items-start">
                      <span className="text-xs font-medium text-secondary-foreground">
                        Message {index + 1}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeMessage(index)}
                        className="text-muted-foreground hover:text-destructive"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div>
                      <label className="block text-[11px] text-muted-foreground mb-1">Name</label>
                      <input
                        type="text"
                        value={message.messageName}
                        onChange={(e) => updateMessage(index, 'messageName', e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-input border border-input-border rounded text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                        placeholder="Unique message name"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] text-muted-foreground mb-1">Preset</label>
                      <Select
                        value={message.presetId}
                        onValueChange={(value) => updateMessage(index, 'presetId', value)}
                        className="w-full px-2.5 py-1.5 bg-input border border-input-border rounded text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                        required
                      >
                        <SelectTrigger className="w-full px-2.5 py-1.5 bg-input border border-input-border rounded text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring">
                          <SelectValue placeholder="Select a preset">
                            {presets.find((preset) => preset.presetId === message.presetId)?.name}
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent className="w-full px-2.5 py-1.5 bg-input border border-input-border rounded text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring">
                          {presets.map((preset) => (
                            <SelectItem key={preset.presetId} value={preset.presetId}>
                              {preset.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="block text-[11px] text-muted-foreground mb-1">Text</label>
                      <textarea
                        value={message.messageText}
                        onChange={(e) => updateMessage(index, 'messageText', e.target.value)}
                        rows={2}
                        className="w-full px-2.5 py-1.5 bg-input border border-input-border rounded text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring resize-none"
                        placeholder="Message text"
                        required
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-2.5 pt-4 border-t border-border">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-3 py-2 border border-input-border bg-secondary text-secondary-foreground rounded text-xs hover:bg-secondary/80 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || messages.length === 0}
                className="flex-1 px-3 py-2 bg-primary text-primary-foreground rounded text-xs hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Updating...' : 'Update Pack'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}