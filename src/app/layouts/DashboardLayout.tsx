import { useEffect, useState, useRef } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router';
import { useAuth } from '../../hooks/useAuth';
import { useUserContext } from '../../hooks/useUserContext';
import { Home, Mic, Settings, ListMusic, Music, LogOut, Shield, ChevronDown, Calendar, Radio, Headphones } from 'lucide-react';
import bgImage from '../../assets/8542e48dd8de51097ffa4fb3b8192a03ffa65fb4.png';
import contentBgImage from '../../assets/8ae19cca138daf368a96bb8fbe23a98c7d881c2f.png';

export function DashboardLayout() {
  const { user, loading: authLoading, signOut } = useAuth();
  const { userContext, loading: contextLoading } = useUserContext();
  const navigate = useNavigate();
  const location = useLocation();
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/signin');
    }
  }, [user, authLoading, navigate]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (authLoading || contextLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-sm text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const navItems = [
    { path: '/app', label: 'Home', icon: Home },
    { path: '/app/voices', label: 'Voices', icon: Mic },
    { path: '/app/presets', label: 'Presets', icon: ListMusic },
    { path: '/app/synthesize', label: 'Synthesize', icon: Music },
    { path: '/app/message-packs', label: 'Message Packs', icon: ListMusic },
    { path: '/app/scheduling', label: 'Scheduling', icon: Calendar },
    { path: '/app/live-announcements', label: 'Live Announcements', icon: Radio },
    { path: '/app/receiver', label: 'Receiver', icon: Headphones },
  ];

  const isActive = (path: string) => {
    if (path === '/app') {
      return location.pathname === '/app';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div 
      className="min-h-screen flex"
      style={{
        backgroundImage: `url(${bgImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      {/* Sidebar */}
      <aside className="w-[240px] flex flex-col">
        <div className="px-4 py-4" ref={dropdownRef}>
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="w-full flex items-center gap-3 hover:bg-[#1a1a1a] rounded-lg px-3 py-2 transition-colors relative"
          >
            <div className="w-8 h-8 rounded-md bg-accent flex items-center justify-center flex-shrink-0">
              <span className="font-medium text-white text-base">E</span>
            </div>
            <span className="font-medium text-[#e6e6e6] text-base">EchoLab</span>
            <div className="flex items-center gap-1.5 ml-auto">
              {userContext?.isAdmin && (
                <Shield className="w-4 h-4" style={{ color: 'rgb(242, 201, 76)' }} />
              )}
              <ChevronDown className={`w-4 h-4 text-[#A6ABB2] transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
            </div>
          </button>

          {showDropdown && (
            <div className="absolute left-4 mt-2 w-[208px] py-1.5 bg-[#1a1a1a] border border-[#242526] rounded-lg shadow-xl z-50">
              <Link
                to="/app/settings"
                onClick={() => setShowDropdown(false)}
                className="flex items-center gap-3 px-4 py-2.5 text-sm text-[#A6ABB2] hover:text-[#e6e6e6] hover:bg-[#242526] transition-colors"
              >
                <Settings className="w-5 h-5" />
                Settings
              </Link>
              <div className="h-px bg-[#242526] my-1.5" />
              <button
                onClick={() => {
                  setShowDropdown(false);
                  signOut();
                }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-[#A6ABB2] hover:text-[#e6e6e6] hover:bg-[#242526] transition-colors"
              >
                <LogOut className="w-5 h-5" />
                Sign out
              </button>
            </div>
          )}
        </div>
        
        <nav className="flex-1 px-3 py-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                  active
                    ? 'bg-[#1a1a1a] text-[#e6e6e6]'
                    : 'text-[#A6ABB2] hover:text-[#e6e6e6] hover:bg-[#151515]'
                }`}
              >
                <Icon className="w-5 h-5 shrink-0" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main content with rounded corners */}
      <main className="flex-1 p-6 overflow-auto">
        <div 
          className="h-full rounded-xl border border-[#242526] overflow-auto"
          style={{
            backgroundImage: `url(${contentBgImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
          }}
        >
          <Outlet />
        </div>
      </main>
    </div>
  );
}