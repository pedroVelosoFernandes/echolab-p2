import { useState, useEffect } from 'react';
import { PageHeader } from '../components/PageHeader';
import { Radio, Wifi, WifiOff, Play, Pause, Volume2, Edit2, Trash2, Plus, Monitor } from 'lucide-react';
import { toast } from 'sonner';
import contentBgImage from '../../assets/8ae19cca138daf368a96bb8fbe23a98c7d881c2f.png';
import { useUserContext } from '../../hooks/useUserContext';
import { Tutorial, useTutorial } from '../components/Tutorial';
import { tutorialMetadata } from '../data/tutorials';

interface Device {
  id: string;
  name: string;
  deviceId: string;
  userId: string;
  registeredAt: string;
  physicalDeviceId: string; // ID único do dispositivo físico que registrou
}

interface WebSocketConnection {
  id: string;
  deviceId: string;
  isListening: boolean;
  connectedAt: string;
}

interface AudioAnnouncement {
  id: string;
  audioUrl: string;
  receivedAt: string;
  played: boolean;
  name: string;
}

// Gera ou recupera um ID único para este dispositivo físico
const getPhysicalDeviceId = (): string => {
  const STORAGE_KEY = 'echolab_physical_device_id';
  let deviceId = localStorage.getItem(STORAGE_KEY);
  
  if (!deviceId) {
    // Gera um ID único baseado em várias características do navegador/dispositivo
    deviceId = `device_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem(STORAGE_KEY, deviceId);
  }
  
  return deviceId;
};

export function Receiver() {
  const { user } = useUserContext();
  const isAdmin = user?.isAdmin || false;
  const currentPhysicalDeviceId = getPhysicalDeviceId();

  const [devices, setDevices] = useState<Device[]>([
    { id: '1', name: 'Reception Display', deviceId: 'dev-001', userId: 'user-1', registeredAt: '2026-03-28T10:00:00', physicalDeviceId: getPhysicalDeviceId() },
    { id: '2', name: 'Main Hall Speaker', deviceId: 'dev-002', userId: 'user-1', registeredAt: '2026-03-28T11:00:00', physicalDeviceId: getPhysicalDeviceId() },
    { id: '3', name: 'Office Room A', deviceId: 'dev-003', userId: 'user-2', registeredAt: '2026-03-29T08:00:00', physicalDeviceId: getPhysicalDeviceId() },
  ]);

  const [currentDevice, setCurrentDevice] = useState<Device | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [wsConnection, setWsConnection] = useState<WebSocketConnection | null>(null);
  const [autoPlay, setAutoPlay] = useState(true);
  const [announcements, setAnnouncements] = useState<AudioAnnouncement[]>([]);
  
  const [showRegisterForm, setShowRegisterForm] = useState(false);
  const [deviceName, setDeviceName] = useState('');
  const [editingDevice, setEditingDevice] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  const { isOpen: isTutorialOpen, openTutorial, handleClose: closeTutorial } = useTutorial('receiver');

  // Filtra apenas dispositivos registrados NESTE dispositivo físico
  const myDevices = devices.filter(d => d.physicalDeviceId === currentPhysicalDeviceId);
  const otherDevices = devices.filter(d => d.physicalDeviceId !== currentPhysicalDeviceId);

  // Cada sessão de navegador só pode ter UM dispositivo registrado
  const myDevice = myDevices.length > 0 ? myDevices[0] : null;
  const canRegisterDevice = myDevice === null;

  // Verifica se um dispositivo pode ser usado neste dispositivo físico
  const canUseDevice = (device: Device): boolean => {
    return device.physicalDeviceId === currentPhysicalDeviceId;
  };

  // Sincroniza currentDevice com myDevice
  useEffect(() => {
    if (myDevice && (!currentDevice || currentDevice.id !== myDevice.id)) {
      setCurrentDevice(myDevice);
    } else if (!myDevice && currentDevice) {
      setCurrentDevice(null);
      setIsConnected(false);
      setWsConnection(null);
    }
  }, [myDevice, currentDevice]);

  // Mock WebSocket connection
  const handleConnect = () => {
    if (!currentDevice) {
      toast.error('Please register a device first');
      return;
    }

    // Validação de segurança
    if (!canUseDevice(currentDevice)) {
      toast.error('Security error: This device can only be connected from the device where it was registered');
      return;
    }

    // Mock WebSocket connection
    const connection: WebSocketConnection = {
      id: `ws-${Math.random().toString(36).substr(2, 9)}`,
      deviceId: currentDevice.deviceId,
      isListening: true,
      connectedAt: new Date().toISOString(),
    };

    setWsConnection(connection);
    setIsConnected(true);
    toast.success('Connected to WebSocket');
  };

  const handleDisconnect = () => {
    setWsConnection(null);
    setIsConnected(false);
    toast.info('Disconnected from WebSocket');
  };

  const handleRegisterDevice = () => {
    if (!deviceName.trim()) {
      toast.error('Please enter a device name');
      return;
    }

    const newDevice: Device = {
      id: Math.random().toString(36).substr(2, 9),
      name: deviceName,
      deviceId: `dev-${Math.random().toString(36).substr(2, 6)}`,
      userId: user?.userId || 'current-user',
      registeredAt: new Date().toISOString(),
      physicalDeviceId: getPhysicalDeviceId(),
    };

    setDevices([...devices, newDevice]);
    setCurrentDevice(newDevice);
    setDeviceName('');
    setShowRegisterForm(false);
    toast.success('Device registered successfully');
  };

  const handleEditDevice = (deviceId: string) => {
    if (!editName.trim()) {
      toast.error('Please enter a device name');
      return;
    }

    setDevices(devices.map(d => 
      d.id === deviceId ? { ...d, name: editName } : d
    ));

    if (currentDevice?.id === deviceId) {
      setCurrentDevice({ ...currentDevice, name: editName });
    }

    setEditingDevice(null);
    setEditName('');
    toast.success('Device name updated');
  };

  const handleDeleteDevice = (deviceId: string) => {
    if (!isAdmin) {
      toast.error('Only admins can delete devices');
      return;
    }

    setDevices(devices.filter(d => d.id !== deviceId));
    
    if (currentDevice?.id === deviceId) {
      setCurrentDevice(null);
      setIsConnected(false);
      setWsConnection(null);
    }

    toast.success('Device deleted');
  };

  const handlePlayAnnouncement = (announcementId: string) => {
    // Mock playing audio
    setAnnouncements(announcements.map(a =>
      a.id === announcementId ? { ...a, played: true } : a
    ));
    toast.success('Playing announcement');
  };

  // Mock receiving announcements
  useEffect(() => {
    if (!isConnected || !wsConnection) return;

    const interval = setInterval(() => {
      // Simulate receiving an announcement every 30 seconds
      const newAnnouncement: AudioAnnouncement = {
        id: Math.random().toString(36).substr(2, 9),
        audioUrl: `https://example.com/audio/${Math.random().toString(36).substr(2, 9)}.mp3`,
        receivedAt: new Date().toISOString(),
        played: autoPlay,
        name: `Announcement ${announcements.length + 1}`,
      };

      setAnnouncements(prev => [newAnnouncement, ...prev]);
      
      if (autoPlay) {
        toast.success('Auto-playing announcement');
      } else {
        toast.info('New announcement received');
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [isConnected, wsConnection, autoPlay, announcements.length]);

  return (
    <div className="h-full flex flex-col">
      <PageHeader
        title="Receiver"
        showFavorite
        showMenu
        onTutorialClick={openTutorial}
        actions={
          <div className="flex items-center gap-4">
            {isConnected && (
              <div className="flex items-center gap-3 px-4 py-2 bg-green-500/20 border border-green-500/30 rounded-lg">
                <Wifi className="w-5 h-5 text-green-400" />
                <span className="text-sm font-medium text-green-400">Connected</span>
              </div>
            )}
            {!showRegisterForm && canRegisterDevice && (
              <button
                data-tutorial="register-device"
                onClick={() => setShowRegisterForm(true)}
                className="px-4 py-2 text-base font-medium bg-[#1a1a1a] hover:bg-[#242526] border border-[#242526] rounded-lg transition-colors flex items-center gap-3 shadow-sm"
              >
                <Plus className="w-5 h-5" />
                Register Device
              </button>
            )}
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
        <div className="max-w-screen-2xl mx-auto space-y-8">
          {/* Register Device Form */}
          {showRegisterForm && (
            <div className="p-8 bg-[#1a1a1a]/50 border border-[#242526] rounded-xl space-y-6">
              <h2 className="text-xl font-medium text-foreground">Register New Device</h2>
              
              <div>
                <label className="text-sm font-medium text-muted-foreground mb-3 block uppercase tracking-wide">
                  Device Name
                </label>
                <input
                  type="text"
                  value={deviceName}
                  onChange={(e) => setDeviceName(e.target.value)}
                  placeholder="e.g. Reception Display"
                  className="w-full bg-[#1a1a1a] border border-[#242526] rounded-lg px-4 py-3 text-base text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  onKeyDown={(e) => e.key === 'Enter' && handleRegisterDevice()}
                />
              </div>

              <div className="flex gap-4">
                <button
                  onClick={handleRegisterDevice}
                  className="px-6 py-3 bg-primary hover:bg-primary/90 text-white text-base rounded-lg transition-colors"
                >
                  Register
                </button>
                <button
                  onClick={() => {
                    setShowRegisterForm(false);
                    setDeviceName('');
                  }}
                  className="px-6 py-3 bg-[#1a1a1a] hover:bg-[#242526] border border-[#242526] text-foreground text-base rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Current Device */}
          {currentDevice && (
            <div className="p-8 bg-[#1a1a1a]/50 border border-[#242526] rounded-xl space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-medium text-foreground mb-2">Current Device</h2>
                  <p className="text-base text-muted-foreground">{currentDevice.name}</p>
                  <p className="text-sm text-muted-foreground">ID: {currentDevice.deviceId}</p>
                </div>

                <div className="flex items-center gap-3">
                  {!isConnected ? (
                    <button
                      data-tutorial="connect"
                      onClick={handleConnect}
                      className="px-6 py-3 bg-primary hover:bg-primary/90 text-white text-base rounded-lg transition-colors flex items-center gap-3"
                    >
                      <Wifi className="w-5 h-5" />
                      Connect
                    </button>
                  ) : (
                    <button
                      onClick={handleDisconnect}
                      className="px-6 py-3 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-red-400 text-base rounded-lg transition-colors flex items-center gap-3"
                    >
                      <WifiOff className="w-5 h-5" />
                      Disconnect
                    </button>
                  )}
                </div>
              </div>

              {isConnected && (
                <div className="pt-6 border-t border-[#242526]" data-tutorial="autoplay">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={autoPlay}
                      onChange={(e) => setAutoPlay(e.target.checked)}
                      className="w-5 h-5 rounded border-[#242526] text-primary focus:ring-primary"
                    />
                    <span className="text-base text-foreground">Auto-play announcements</span>
                  </label>
                </div>
              )}
            </div>
          )}

          {/* All Devices */}
          <div className="space-y-6">
            <h2 className="text-xl font-medium text-foreground">All Devices</h2>

            <div className="space-y-3">
              {myDevices.length === 0 ? (
                <div className="text-center py-16 text-muted-foreground">
                  <Monitor className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p className="text-base">No devices registered</p>
                </div>
              ) : (
                myDevices.map((device) => (
                  <div
                    key={device.id}
                    className={`p-6 border rounded-xl transition-colors ${
                      currentDevice?.id === device.id
                        ? 'bg-primary/10 border-primary'
                        : 'bg-[#1a1a1a]/50 border-[#242526] hover:bg-[#1a1a1a]'
                    }`}
                  >
                    {editingDevice === device.id ? (
                      <div className="flex items-center gap-3">
                        <input
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="flex-1 bg-[#1a1a1a] border border-[#242526] rounded-lg px-4 py-2 text-base text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                          onKeyDown={(e) => e.key === 'Enter' && handleEditDevice(device.id)}
                        />
                        <button
                          onClick={() => handleEditDevice(device.id)}
                          className="px-4 py-2 bg-primary hover:bg-primary/90 text-white text-sm rounded-lg transition-colors"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => {
                            setEditingDevice(null);
                            setEditName('');
                          }}
                          className="px-4 py-2 bg-[#1a1a1a] hover:bg-[#242526] border border-[#242526] text-foreground text-sm rounded-lg transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-4">
                            <h3 className="text-base font-medium text-foreground">{device.name}</h3>
                            {currentDevice?.id === device.id && (
                              <span className="px-3 py-1 bg-primary/20 text-primary text-sm rounded-md">
                                Current
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mt-2">
                            ID: {device.deviceId} • Registered: {new Date(device.registeredAt).toLocaleDateString()}
                          </p>
                        </div>

                        <div className="flex items-center gap-3">
                          {!currentDevice && canUseDevice(device) && (
                            <button
                              onClick={() => setCurrentDevice(device)}
                              className="px-3 py-1.5 bg-[#1a1a1a] hover:bg-[#242526] border border-[#242526] text-foreground text-xs rounded transition-colors"
                            >
                              Use
                            </button>
                          )}
                          <button
                            onClick={() => {
                              setEditingDevice(device.id);
                              setEditName(device.name);
                            }}
                            className="p-1.5 hover:bg-[#242526] rounded transition-colors"
                          >
                            <Edit2 className="w-4 h-4 text-muted-foreground" />
                          </button>
                          {isAdmin && (
                            <button
                              onClick={() => handleDeleteDevice(device.id)}
                              className="p-1.5 hover:bg-[#242526] rounded transition-colors"
                            >
                              <Trash2 className="w-4 h-4 text-red-400" />
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Received Announcements */}
          {isConnected && (
            <div className="space-y-4" data-tutorial="announcements">
              <h2 className="text-lg font-medium text-foreground">Received Announcements</h2>

              <div className="space-y-2">
                {announcements.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Radio className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p className="text-sm">No announcements received yet</p>
                    <p className="text-xs mt-1">Announcements will appear here when sent</p>
                  </div>
                ) : (
                  announcements.map((announcement) => (
                    <div
                      key={announcement.id}
                      className={`p-4 border rounded transition-colors ${
                        announcement.played
                          ? 'bg-[#1a1a1a]/30 border-[#242526]/50 opacity-60'
                          : 'bg-[#1a1a1a]/50 border-[#242526] hover:bg-[#1a1a1a]'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3">
                            <Volume2 className="w-4 h-4 text-muted-foreground" />
                            <div>
                              <h3 className="text-sm font-medium text-foreground">{announcement.name}</h3>
                              <p className="text-xs text-muted-foreground mt-1">
                                Received: {new Date(announcement.receivedAt).toLocaleString()}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {announcement.played ? (
                            <span className="px-3 py-1.5 bg-green-500/20 text-green-400 text-xs rounded flex items-center gap-2">
                              <Pause className="w-3 h-3" />
                              Played
                            </span>
                          ) : (
                            <button
                              onClick={() => handlePlayAnnouncement(announcement.id)}
                              className="px-3 py-1.5 bg-primary hover:bg-primary/90 text-white text-xs rounded transition-colors flex items-center gap-2"
                            >
                              <Play className="w-3 h-3" />
                              Play
                            </button>
                          )}
                        </div>
                      </div>

                      <div className="mt-2 text-xs text-muted-foreground font-mono bg-[#0a0a0a] px-2 py-1 rounded">
                        {announcement.audioUrl}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <Tutorial
        steps={tutorialMetadata.receiver.steps}
        isOpen={isTutorialOpen}
        onClose={closeTutorial}
      />
    </div>
  );
}