import { useState } from 'react';
import { PageHeader } from '../components/PageHeader';
import { Send, Radio, Package, Link as LinkIcon, Users, Clock, FileText } from 'lucide-react';
import { toast } from 'sonner';
import contentBgImage from 'figma:asset/8ae19cca138daf368a96bb8fbe23a98c7d881c2f.png';
import { usePresets, useMessagePacks } from '../../hooks/queries';
import { Tutorial, useTutorial } from '../components/Tutorial';
import { tutorialMetadata } from '../data/tutorials';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';

interface Recipient {
  id: string;
  name: string;
  deviceId: string;
  isOnline: boolean;
}

interface AnnouncementHistory {
  id: string;
  type: 'text' | 'message-pack';
  content: string;
  deliveryMethod: 'callback' | 'recipients';
  recipients?: string[];
  timestamp: string;
  status: 'sent' | 'delivered' | 'failed';
}

export function LiveAnnouncements() {
  const [contentType, setContentType] = useState<'text' | 'message-pack'>('text');
  const [deliveryMethod, setDeliveryMethod] = useState<'callback' | 'recipients'>('recipients');
  const [textContent, setTextContent] = useState('');
  const [selectedMessagePack, setSelectedMessagePack] = useState('');
  const [selectedPreset, setSelectedPreset] = useState('');
  const [callbackUrl, setCallbackUrl] = useState('');
  const [selectedRecipients, setSelectedRecipients] = useState<string[]>([]);
  const [sendToAll, setSendToAll] = useState(true);
  const { isOpen: isTutorialOpen, openTutorial, handleClose: closeTutorial } = useTutorial('live-announcements');

  // Replaced manual fetch with React Query hooks (no duplicate fetches!)
  const { data: messagePacks = [], isLoading: loadingMessagePacks } = useMessagePacks();
  const { data: presets = [], isLoading: loadingPresets } = usePresets();

  const [recipients, setRecipients] = useState<Recipient[]>([
    { id: '1', name: 'Reception Display', deviceId: 'dev-001', isOnline: true },
    { id: '2', name: 'Main Hall Speaker', deviceId: 'dev-002', isOnline: true },
    { id: '3', name: 'Warehouse Monitor', deviceId: 'dev-003', isOnline: false },
    { id: '4', name: 'Office Room A', deviceId: 'dev-004', isOnline: true },
  ]);
  const [history, setHistory] = useState<AnnouncementHistory[]>([
    {
      id: '1',
      type: 'text',
      content: 'Emergency announcement test',
      deliveryMethod: 'recipients',
      recipients: ['Reception Display', 'Main Hall Speaker'],
      timestamp: '2026-03-29T10:30:00',
      status: 'delivered',
    },
    {
      id: '2',
      type: 'message-pack',
      content: 'Morning Announcements Pack',
      deliveryMethod: 'callback',
      timestamp: '2026-03-29T08:00:00',
      status: 'sent',
    },
  ]);

  const onlineCount = recipients.filter(r => r.isOnline).length;

  const handleSend = () => {
    if (contentType === 'text' && !textContent.trim()) {
      toast.error('Please enter text content');
      return;
    }

    if (contentType === 'message-pack' && !selectedMessagePack) {
      toast.error('Please select a message pack');
      return;
    }

    if (contentType === 'text' && !selectedPreset) {
      toast.error('Please select a voice preset');
      return;
    }

    if (deliveryMethod === 'callback' && !callbackUrl.trim()) {
      toast.error('Please enter a callback URL');
      return;
    }

    if (deliveryMethod === 'recipients' && !sendToAll && selectedRecipients.length === 0) {
      toast.error('Please select at least one recipient');
      return;
    }

    // Mock sending announcement
    const newAnnouncement: AnnouncementHistory = {
      id: Math.random().toString(36).substr(2, 9),
      type: contentType,
      content: contentType === 'text' ? textContent : messagePacks.find(mp => mp.id === selectedMessagePack)?.name || '',
      deliveryMethod,
      recipients: deliveryMethod === 'recipients' 
        ? sendToAll 
          ? recipients.filter(r => r.isOnline).map(r => r.name)
          : selectedRecipients.map(id => recipients.find(r => r.id === id)?.name || '')
        : undefined,
      timestamp: new Date().toISOString(),
      status: 'sent',
    };

    setHistory([newAnnouncement, ...history]);
    toast.success('Announcement sent successfully');

    // Reset form
    setTextContent('');
    setSelectedMessagePack('');
    setSelectedPreset('');
    setCallbackUrl('');
    setSelectedRecipients([]);
    setSendToAll(true);
  };

  const toggleRecipient = (recipientId: string) => {
    if (selectedRecipients.includes(recipientId)) {
      setSelectedRecipients(selectedRecipients.filter(id => id !== recipientId));
    } else {
      setSelectedRecipients([...selectedRecipients, recipientId]);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered': return 'bg-green-500/20 text-green-400';
      case 'sent': return 'bg-blue-500/20 text-blue-400';
      case 'failed': return 'bg-red-500/20 text-red-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  return (
    <div className="h-full flex flex-col">
      <PageHeader
        title="Live Announcements"
        onTutorialClick={openTutorial}
        showFavorite
        showMenu
        actions={
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-4 py-2 bg-[#1a1a1a] border border-[#242526] rounded">
              <Radio className="w-5 h-5 text-green-400" />
              <span className="text-sm text-muted-foreground">
                {onlineCount} online
              </span>
            </div>
          </div>
        }
      />

      <div
        className="flex-1 overflow-auto p-8"
        style={{
          backgroundImage: `url(${contentBgImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      >
        <div className="max-w-screen-2xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Send Announcement Form */}
          <div className="space-y-8">
            <h2 className="text-xl font-semibold text-foreground">Send Announcement</h2>

            {/* Content Type */}
            <div>
              <label className="text-sm font-medium text-muted-foreground mb-3 block uppercase tracking-wide">
                Content Type
              </label>
              <div className="flex gap-4">
                <button
                  onClick={() => setContentType('text')}
                  className={`flex-1 px-5 py-4 border rounded transition-colors flex items-center justify-center gap-2 text-base ${
                    contentType === 'text'
                      ? 'bg-primary border-primary text-white'
                      : 'bg-[#1a1a1a] border-[#242526] text-muted-foreground hover:border-primary'
                  }`}
                >
                  <FileText className="w-5 h-5" />
                  Text
                </button>
                <button
                  onClick={() => setContentType('message-pack')}
                  className={`flex-1 px-5 py-4 border rounded transition-colors flex items-center justify-center gap-2 text-base ${
                    contentType === 'message-pack'
                      ? 'bg-primary border-primary text-white'
                      : 'bg-[#1a1a1a] border-[#242526] text-muted-foreground hover:border-primary'
                  }`}
                >
                  <Package className="w-5 h-5" />
                  Message Pack
                </button>
              </div>
            </div>

            {/* Conditionally rendered content - without the fixed min-height as requested */}
            {contentType === 'text' ? (
              <div className="space-y-8">
                <div>
                  <label className="text-sm font-medium text-muted-foreground mb-3 block uppercase tracking-wide">
                    Text Content
                  </label>
                  <textarea
                    value={textContent}
                    onChange={(e) => setTextContent(e.target.value)}
                    placeholder="Enter your announcement text..."
                    rows={4}
                    className="w-full bg-[#1a1a1a] border border-[#242526] rounded px-4 py-3 text-base text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>

                {/* Voice Preset */}
                <div>
                  <label className="text-sm font-medium text-muted-foreground mb-3 block uppercase tracking-wide">
                    Voice Preset
                  </label>
                  <Select
                    value={selectedPreset}
                    onValueChange={setSelectedPreset}
                  >
                    <SelectTrigger className="px-4 py-3 text-base h-auto">
                      <SelectValue placeholder="Choose a voice preset..." />
                    </SelectTrigger>
                    <SelectContent>
                      {presets.map((preset) => (
                        <SelectItem key={preset.id || preset.presetId} value={preset.id || preset.presetId} className="text-base py-2">
                          {preset.name} ({preset.language}, {preset.gender})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            ) : (
              <div>
                <label className="text-sm font-medium text-muted-foreground mb-3 block uppercase tracking-wide">
                  Select Message Pack
                </label>
                <Select
                  value={selectedMessagePack}
                  onValueChange={setSelectedMessagePack}
                >
                  <SelectTrigger className="px-4 py-3 text-base h-auto">
                    <SelectValue placeholder="Choose a message pack..." />
                  </SelectTrigger>
                  <SelectContent>
                    {messagePacks.map((pack) => (
                      <SelectItem key={pack.id || pack.packId} value={pack.id || pack.packId} className="text-base py-2">
                        {pack.name} ({pack.messages.length} messages)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Delivery Method */}
            <div>
              <label className="text-sm font-medium text-muted-foreground mb-3 block uppercase tracking-wide">
                Delivery Method
              </label>
              <div className="flex gap-4">
                <button
                  onClick={() => setDeliveryMethod('recipients')}
                  className={`flex-1 px-5 py-4 border rounded transition-colors flex items-center justify-center gap-2 text-base ${
                    deliveryMethod === 'recipients'
                      ? 'bg-primary border-primary text-white'
                      : 'bg-[#1a1a1a] border-[#242526] text-muted-foreground hover:border-primary'
                  }`}
                >
                  <Users className="w-5 h-5" />
                  Recipients
                </button>
                <button
                  onClick={() => setDeliveryMethod('callback')}
                  className={`flex-1 px-5 py-4 border rounded transition-colors flex items-center justify-center gap-2 text-base ${
                    deliveryMethod === 'callback'
                      ? 'bg-primary border-primary text-white'
                      : 'bg-[#1a1a1a] border-[#242526] text-muted-foreground hover:border-primary'
                  }`}
                >
                  <LinkIcon className="w-5 h-5" />
                  Callback URL
                </button>
              </div>
            </div>

            {/* Recipients Selection */}
            {deliveryMethod === 'recipients' && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                    Select Recipients
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={sendToAll}
                      onChange={(e) => setSendToAll(e.target.checked)}
                      className="w-4 h-4 rounded border-[#242526] text-primary focus:ring-primary"
                    />
                    <span className="text-sm text-muted-foreground">Send to all online</span>
                  </label>
                </div>
                <div className="space-y-3">
                  {recipients.map((recipient) => (
                    <button
                      key={recipient.id}
                      onClick={() => !sendToAll && toggleRecipient(recipient.id)}
                      disabled={sendToAll || !recipient.isOnline}
                      className={`w-full px-4 py-3 border rounded text-base transition-colors flex items-center justify-between ${
                        sendToAll || !recipient.isOnline
                          ? 'opacity-50 cursor-not-allowed bg-[#1a1a1a] border-[#242526] text-muted-foreground'
                          : selectedRecipients.includes(recipient.id)
                          ? 'bg-primary border-primary text-white'
                          : 'bg-[#1a1a1a] border-[#242526] text-foreground hover:border-primary'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Radio className={`w-4 h-4 ${recipient.isOnline ? 'text-green-400' : 'text-gray-500'}`} />
                        <span>{recipient.name}</span>
                      </div>
                      <span className="text-sm opacity-60">{recipient.deviceId}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Callback URL */}
            {deliveryMethod === 'callback' && (
              <div>
                <label className="text-sm font-medium text-muted-foreground mb-3 block uppercase tracking-wide">
                  Callback URL
                </label>
                <input
                  type="url"
                  value={callbackUrl}
                  onChange={(e) => setCallbackUrl(e.target.value)}
                  placeholder="https://api.example.com/callback"
                  className="w-full bg-[#1a1a1a] border border-[#242526] rounded px-4 py-3 text-base text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
            )}

            {/* Send Button */}
            <button
              onClick={handleSend}
              className="w-full px-5 py-4 bg-primary hover:bg-primary/90 text-white text-base font-medium rounded transition-colors flex items-center justify-center gap-2"
            >
              <Send className="w-5 h-5" />
              Send Announcement
            </button>
          </div>

          {/* History */}
          <div className="space-y-8">
            <h2 className="text-xl font-semibold text-foreground">History</h2>

            <div className="space-y-4">
              {history.length === 0 ? (
                <div className="text-center py-16 text-muted-foreground">
                  <Clock className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p className="text-base">No announcements sent yet</p>
                </div>
              ) : (
                history.map((item) => (
                  <div
                    key={item.id}
                    className="p-5 bg-[#1a1a1a]/50 border border-[#242526] rounded hover:bg-[#1a1a1a] transition-colors"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        {item.type === 'text' ? (
                          <FileText className="w-5 h-5 text-muted-foreground" />
                        ) : (
                          <Package className="w-5 h-5 text-muted-foreground" />
                        )}
                        <span className="text-base font-medium text-foreground">{item.content}</span>
                      </div>
                      <span className={`px-2.5 py-1 rounded text-sm ${getStatusColor(item.status)}`}>
                        {item.status}
                      </span>
                    </div>

                    <div className="space-y-2 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        <span>{new Date(item.timestamp).toLocaleString()}</span>
                      </div>
                      
                      {item.deliveryMethod === 'recipients' && item.recipients && (
                        <div className="flex items-start gap-2">
                          <Users className="w-4 h-4 mt-0.5" />
                          <span className="flex-1 leading-relaxed">{item.recipients.join(', ')}</span>
                        </div>
                      )}

                      {item.deliveryMethod === 'callback' && (
                        <div className="flex items-center gap-2">
                          <LinkIcon className="w-4 h-4" />
                          <span>Callback URL</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      <Tutorial
        steps={tutorialMetadata['live-announcements'].steps}
        isOpen={isTutorialOpen}
        onClose={closeTutorial}
      />
    </div>
  );
}