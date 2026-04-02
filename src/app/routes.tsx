import { createBrowserRouter } from 'react-router';
// HMR force reload
import { PublicLayout } from './layouts/PublicLayout';
import { DashboardLayout } from './layouts/DashboardLayout';
import { Landing } from './pages/Landing';
import { Pricing } from './pages/Pricing';
import { Contact } from './pages/Contact';
import { SignIn } from './pages/SignIn';
import { SignUp } from './pages/SignUp';
import { Home } from './pages/Home';
import { Voices } from './pages/Voices';
import { Presets } from './pages/Presets';
import { Synthesize } from './pages/Synthesize';
import { MessagePacks } from './pages/MessagePacks';
import { Scheduling } from './pages/Scheduling';
import { LiveAnnouncements } from './pages/LiveAnnouncements';
import { Receiver } from './pages/Receiver';
import { Settings } from './pages/Settings';

export const router = createBrowserRouter([
  {
    path: '/',
    Component: Landing, // Changed to use Landing directly
  },
  {
    Component: PublicLayout,
    children: [
      { path: 'pricing', Component: Pricing },
      { path: 'contact', Component: Contact },
      { path: 'signin', Component: SignIn },
      { path: 'signup', Component: SignUp },
    ],
  },
  {
    path: '/app',
    Component: DashboardLayout,
    children: [
      { index: true, Component: Home },
      { path: 'voices', Component: Voices },
      { path: 'presets', Component: Presets },
      { path: 'synthesize', Component: Synthesize },
      { path: 'message-packs', Component: MessagePacks },
      { path: 'scheduling', Component: Scheduling },
      { path: 'live-announcements', Component: LiveAnnouncements },
      { path: 'receiver', Component: Receiver },
      { path: 'settings', Component: Settings },
    ],
  },
]);