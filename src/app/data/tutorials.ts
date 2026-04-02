import { TutorialStep } from '../components/Tutorial';

// Synthesize Page Tutorial
export const synthesizeTutorial: TutorialStep[] = [
  {
    title: 'Welcome to Text to Speech',
    description: 'This is where you can convert any text into natural-sounding speech. Let\'s walk through the main features.',
    targetSelector: '[data-tutorial="text-input"]',
    position: 'right',
    highlightElement: true,
  },
  {
    title: 'Enter Your Text',
    description: 'Type or paste the text you want to convert to speech in this text area. You can enter up to several paragraphs.',
    targetSelector: '[data-tutorial="text-input"]',
    position: 'right',
    highlightElement: true,
  },
  {
    title: 'Choose Your Settings',
    description: 'You can either use a saved preset or manually configure the voice settings. Switch between modes using these tabs.',
    targetSelector: '[data-tutorial="mode-selector"]',
    position: 'bottom',
    highlightElement: true,
  },
  {
    title: 'Manual Settings',
    description: 'When in manual mode, you can fine-tune the language, gender, rate, pitch, and intonation to get the perfect voice.',
    targetSelector: '[data-tutorial="manual-settings"]',
    position: 'left',
    highlightElement: true,
  },
  {
    title: 'Generate Speech',
    description: 'Once you\'re ready, click the Synthesize button to generate your audio. The result will appear below with a play button.',
    targetSelector: '[data-tutorial="synthesize-button"]',
    position: 'top',
    highlightElement: true,
  },
  {
    title: 'Save as Preset',
    description: 'Love these settings? Save them as a preset for quick access later!',
    targetSelector: '[data-tutorial="save-preset"]',
    position: 'top',
    highlightElement: true,
  },
];

// Presets Page Tutorial
export const presetsTutorial: TutorialStep[] = [
  {
    title: 'Voice Presets',
    description: 'Presets let you save your favorite voice configurations for quick reuse. Let\'s explore how to manage them.',
  },
  {
    title: 'Create a New Preset',
    description: 'Click the "New Preset" button to create a new voice configuration with custom settings.',
    targetSelector: '[data-tutorial="new-preset"]',
    position: 'bottom',
    highlightElement: true,
  },
  {
    title: 'Preset Configuration',
    description: 'Each preset stores language, gender, and voice modulation settings (rate, pitch, intonation). All values range from 0.5 to 1.5.',
  },
  {
    title: 'Using Presets',
    description: 'Once saved, you can select presets in the Synthesize page for one-click voice configuration.',
  },
  {
    title: 'Delete Presets',
    description: 'You can delete presets you no longer need by clicking the trash icon on each preset card.',
  },
];

// Voices Page Tutorial
export const voicesTutorial: TutorialStep[] = [
  {
    title: 'Voice Selection',
    description: 'Here you can browse and select your preferred voices for different languages and genders.',
  },
  {
    title: 'Browse Available Voices',
    description: 'The table shows all available voices with their language, gender, provider, and quality information.',
    targetSelector: '[data-tutorial="voices-table"]',
    position: 'top',
    highlightElement: true,
  },
  {
    title: 'Select Your Favorites',
    description: 'Click on a voice to select it as your default for that language and gender combination. Selected voices appear with a checkmark.',
    targetSelector: '[data-tutorial="voices-table"]',
    position: 'top',
    highlightElement: true,
  },
  {
    title: 'Filter Voices',
    description: 'Use the language and gender filters to narrow down your options and find the perfect voice.',
    targetSelector: '[data-tutorial="voice-filters"]',
    position: 'bottom',
    highlightElement: true,
  },
  {
    title: 'Admin Features',
    description: 'Admins can create new voices, edit existing ones, and manage the voice catalog for all users.',
  },
];

// Message Packs Tutorial
export const messagePacksTutorial: TutorialStep[] = [
  {
    title: 'Message Packs',
    description: 'Message packs let you group multiple pre-written messages with their voice presets for batch announcements.',
  },
  {
    title: 'Create a Message Pack',
    description: 'Click "New Message Pack" to create a collection of messages. This is perfect for recurring announcements.',
    targetSelector: '[data-tutorial="new-pack"]',
    position: 'bottom',
    highlightElement: true,
  },
  {
    title: 'Add Messages',
    description: 'Each message in a pack has a unique name, text content, and an associated preset for voice configuration.',
  },
  {
    title: 'Manage Packs',
    description: 'You can view, edit, or delete entire packs, or remove individual messages from a pack.',
    targetSelector: '[data-tutorial="pack-list"]',
    position: 'top',
    highlightElement: true,
  },
  {
    title: 'Use in Announcements',
    description: 'Message packs can be used in Live Announcements and Scheduling for efficient batch communication.',
  },
];

// Live Announcements Tutorial
export const liveAnnouncementsTutorial: TutorialStep[] = [
  {
    title: 'Live Announcements',
    description: 'Send real-time announcements to connected devices or callback URLs. Perfect for urgent communications.',
  },
  {
    title: 'Choose Content Type',
    description: 'You can send either plain text (with a preset) or an entire message pack.',
    targetSelector: '[data-tutorial="content-type"]',
    position: 'right',
    highlightElement: true,
  },
  {
    title: 'Select Delivery Method',
    description: 'Choose between sending to specific recipients or calling a webhook URL.',
    targetSelector: '[data-tutorial="delivery-method"]',
    position: 'right',
    highlightElement: true,
  },
  {
    title: 'Monitor Recipients',
    description: 'View which devices are online and ready to receive announcements in real-time.',
    targetSelector: '[data-tutorial="recipients"]',
    position: 'left',
    highlightElement: true,
  },
  {
    title: 'Send Announcement',
    description: 'Once configured, click Send to broadcast your announcement immediately.',
    targetSelector: '[data-tutorial="send-button"]',
    position: 'top',
    highlightElement: true,
  },
  {
    title: 'View History',
    description: 'Track all your sent announcements and their delivery status in the history section.',
    targetSelector: '[data-tutorial="history"]',
    position: 'top',
    highlightElement: true,
  },
];

// Scheduling Tutorial
export const schedulingTutorial: TutorialStep[] = [
  {
    title: 'Scheduled Announcements',
    description: 'Set up recurring announcements that play automatically at specified times and days.',
  },
  {
    title: 'Create a Schedule',
    description: 'Click "New Schedule" to create a new automated announcement schedule.',
    targetSelector: '[data-tutorial="new-schedule"]',
    position: 'bottom',
    highlightElement: true,
  },
  {
    title: 'Set Time Range',
    description: 'Define the start and end dates/times for your announcement schedule. Don\'t forget to set the timezone!',
  },
  {
    title: 'Choose Playback Times',
    description: 'Select specific times or an interval for playback. For example, every 30 minutes or at 8am, 12pm, and 5pm.',
  },
  {
    title: 'Select Days',
    description: 'Choose which days of the week or month the announcement should play. Perfect for business hours.',
  },
  {
    title: 'Set Priority',
    description: 'Assign priority levels (1-10) and choose if the announcement can be interrupted by higher priority ones.',
  },
  {
    title: 'Activate Schedule',
    description: 'Once created, you can activate, pause, or delete schedules from the main list.',
    targetSelector: '[data-tutorial="schedule-list"]',
    position: 'top',
    highlightElement: true,
  },
];

// Receiver Tutorial
export const receiverTutorial: TutorialStep[] = [
  {
    title: 'Receiver Setup',
    description: 'This page turns your browser into a receiver device that can play announcements automatically.',
  },
  {
    title: 'Register Your Device',
    description: 'First, register this device with a friendly name so you can identify it in the system.',
    targetSelector: '[data-tutorial="register-device"]',
    position: 'bottom',
    highlightElement: true,
  },
  {
    title: 'Connect to WebSocket',
    description: 'After registering, connect to start listening for incoming announcements in real-time.',
    targetSelector: '[data-tutorial="connect"]',
    position: 'right',
    highlightElement: true,
  },
  {
    title: 'Auto-Play Settings',
    description: 'Enable auto-play to automatically play announcements when they arrive. Perfect for public displays.',
    targetSelector: '[data-tutorial="autoplay"]',
    position: 'left',
    highlightElement: true,
  },
  {
    title: 'Announcement Queue',
    description: 'All received announcements appear here. You can manually play them if auto-play is disabled.',
    targetSelector: '[data-tutorial="announcements"]',
    position: 'top',
    highlightElement: true,
  },
  {
    title: 'Device Management',
    description: 'Manage your registered devices from here. Each physical device can only have one registration.',
  },
];

// Settings Tutorial
export const settingsTutorial: TutorialStep[] = [
  {
    title: 'Settings',
    description: 'Manage your account preferences, notifications, and application settings here.',
  },
  {
    title: 'Profile Settings',
    description: 'Update your profile information, email, and password.',
    targetSelector: '[data-tutorial="profile"]',
    position: 'right',
    highlightElement: true,
  },
  {
    title: 'Notification Preferences',
    description: 'Configure how and when you want to be notified about announcements and system events.',
    targetSelector: '[data-tutorial="notifications"]',
    position: 'right',
    highlightElement: true,
  },
  {
    title: 'API Access',
    description: 'Generate API keys for programmatic access to EchoLab features.',
    targetSelector: '[data-tutorial="api"]',
    position: 'right',
    highlightElement: true,
  },
];

// Tutorial metadata for each page
export const tutorialMetadata = {
  synthesize: {
    title: 'Text to Speech Tutorial',
    steps: synthesizeTutorial,
  },
  presets: {
    title: 'Voice Presets Tutorial',
    steps: presetsTutorial,
  },
  voices: {
    title: 'Voice Selection Tutorial',
    steps: voicesTutorial,
  },
  'message-packs': {
    title: 'Message Packs Tutorial',
    steps: messagePacksTutorial,
  },
  'live-announcements': {
    title: 'Live Announcements Tutorial',
    steps: liveAnnouncementsTutorial,
  },
  scheduling: {
    title: 'Scheduling Tutorial',
    steps: schedulingTutorial,
  },
  receiver: {
    title: 'Receiver Setup Tutorial',
    steps: receiverTutorial,
  },
  settings: {
    title: 'Settings Tutorial',
    steps: settingsTutorial,
  },
};
