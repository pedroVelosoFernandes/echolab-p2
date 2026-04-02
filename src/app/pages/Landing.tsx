import { useState } from 'react';
import { Link } from 'react-router';
import { Mic, Zap, Shield, Home as HomeIcon, ListMusic, Music, Settings, BarChart, ChevronRight, Play, FolderOpen, FileAudio, Package, Calendar, Radio, Headphones, ChevronDown, Sparkles, Lightbulb, Star, MoreHorizontal, Mic2, Sliders, Check, Volume2, Plus, Wifi, Pause, Monitor, Edit2, Trash2, Users, Link as LinkIcon, Github } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Use same backgrounds as dashboard for authenticity
import dashboardBg from 'figma:asset/8542e48dd8de51097ffa4fb3b8192a03ffa65fb4.png';
import contentBg from 'figma:asset/8ae19cca138daf368a96bb8fbe23a98c7d881c2f.png';

export function Landing() {
  const [activeTab, setActiveTab] = useState('home');

  const navItems = [
    { id: 'home', label: 'Home', icon: HomeIcon },
    { id: 'voices', label: 'Voices', icon: Mic },
    { id: 'presets', label: 'Presets', icon: ListMusic },
    { id: 'synthesize', label: 'Synthesize', icon: Music },
    { id: 'message-packs', label: 'Message Packs', icon: Package },
    { id: 'scheduling', label: 'Scheduling', icon: Calendar },
    { id: 'live-announcements', label: 'Live Announcements', icon: Radio },
    { id: 'receiver', label: 'Receiver', icon: Headphones },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-sans selection:bg-[#5e6ad2] selection:text-white pb-24">
      {/* Header matching PublicLayout */}
      <header className="sticky top-0 z-50 bg-[#0a0a0a]">
        <div className="max-w-[1200px] mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link to="/" className="flex items-center gap-2 text-xl font-medium tracking-tight">
              <div className="w-7 h-7 rounded-md bg-gradient-to-tr from-[#5e6ad2] to-[#8a94e8] flex items-center justify-center">
                <Mic className="w-4 h-4 text-white" />
              </div>
              EchoLab
            </Link>
          </div>
          
          <nav className="hidden md:flex items-center gap-8">
            <Link to="/pricing" className="text-[#a1a1aa] hover:text-white transition-colors text-sm font-medium">Pricing</Link>
            <Link to="/contact" className="text-[#a1a1aa] hover:text-white transition-colors text-sm font-medium flex items-center gap-1">Resources <span className="text-[10px] opacity-50"></span></Link>
          </nav>

          <div className="flex items-center gap-6">
            <a href="https://github.com/pedroVelosoFernandes/echolab-p2" target="_blank" rel="noopener noreferrer" className="hidden md:flex items-center gap-2 text-[#a1a1aa] hover:text-white transition-colors text-sm font-medium">
              <Github className="w-4 h-4" />
              
            </a>
            <Link to="/signin" className="bg-[#5e6ad2] text-white px-5 py-2 text-sm font-medium hover:bg-[#4b55a8] transition-colors flex items-center gap-2">
              Login
              <span className="flex items-center justify-center w-4 h-4 rounded text-[10px] bg-black/20 font-mono">L</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-[1200px] mx-auto px-6 pt-32 pb-16 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-4xl mx-auto"
        >
          <h1 
            className="leading-[1] mb-6 text-white text-[96px]" 
            style={{ fontFamily: '"Playfair Display", serif' }}
          >
            VOICE SYNTHESIS <br />
            <span className="italic text-[#eaeaea]">made magical.</span>
          </h1>
          <p className="text-xl text-[#888] mb-10 leading-relaxed max-w-2xl mx-auto">
            Create natural-sounding voice content with advanced AI.<br/>
            Customize voices, save presets, and generate high-quality audio in seconds.
          </p>
          <div className="flex items-center justify-center">
            <Link to="/signup" className="bg-[#5e6ad2] text-white px-10 py-4 font-medium hover:bg-[#4b55a8] transition-colors flex items-center justify-center text-lg">
              Get Started
            </Link>
          </div>
        </motion.div>

        {/* Trusted by */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-28 mb-16"
        >
          <p className="text-[#444] text-xs font-mono tracking-widest uppercase mb-8">Trusted by teams at</p>
          <div className="flex flex-wrap items-center justify-center gap-12 md:gap-20 opacity-30 grayscale filter">
            {/* Using text for mock logos instead of images for simplicity, matching the style */}
            <span className="text-2xl font-bold font-sans tracking-tighter">Eng4Sys</span>
          </div>
        </motion.div>

        {/* Learn more arrow */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="flex flex-col items-center justify-center mt-12 mb-16 text-[#444]"
        >
          <span className="text-sm font-mono tracking-widest mb-4">Learn more</span>
          <ChevronDown className="w-5 h-5 animate-bounce" />
        </motion.div>

        {/* Interactive Mock App Window */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.8 }}
          className="mt-12 mx-auto max-w-5xl rounded-sm border border-[#242526] overflow-hidden flex flex-col relative text-left"
          style={{ height: '700px', backgroundColor: '#0a0a0a' }}
        >
          {/* ... */}
          {/* Mock Window Header */}
          <div className="h-10 border-b border-[#242526] bg-[#141414] flex items-center px-4 gap-2 z-30 relative">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
              <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
            </div>
            <div className="mx-auto text-xs text-gray-500 font-medium tracking-wide">echolab.app</div>
          </div>

          {/* Mock App Body */}
          <div className="flex-1 flex overflow-hidden relative" style={{
            backgroundImage: `url(${dashboardBg})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
          }}>

            {/* Sidebar */}
            <aside className="w-[180px] flex flex-col bg-transparent z-10">
              <div className="px-3 py-3">
                <button className="w-full flex items-center gap-2 hover:bg-[#1a1a1a] rounded px-2 py-1.5 transition-colors relative">
                  <div className="w-5 h-5 rounded bg-[#5e6ad2] flex items-center justify-center flex-shrink-0">
                    <span className="font-medium text-white text-[11px]">E</span>
                  </div>
                  <span className="font-medium text-[#e6e6e6] text-[13px]">EchoLab</span>
                  <div className="flex items-center gap-1 ml-auto">
                    <Shield className="w-3 h-3" style={{ color: 'rgb(242, 201, 76)' }} />
                    <ChevronDown className="w-3 h-3 text-[#A6ABB2]" />
                  </div>
                </button>
              </div>

              <nav className="flex-1 px-2 py-2 space-y-0.5">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveTab(item.id)}
                      className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded text-[13px] transition-colors ${
                        isActive
                          ? 'bg-[#1a1a1a] text-[#e6e6e6]'
                          : 'text-[#A6ABB2] hover:text-[#e6e6e6] hover:bg-[#151515]'
                      }`}
                    >
                      <Icon className="w-4 h-4 shrink-0" />
                      {item.label}
                    </button>
                  );
                })}
              </nav>
            </aside>

            {/* Main Content Container */}
            <main className="flex-1 p-4 overflow-hidden z-10">
              <div 
                className="h-full rounded-xl border border-[#242526] overflow-hidden flex flex-col bg-[#0a0a0a]"
                style={{
                  backgroundImage: `url(${contentBg})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  backgroundRepeat: 'no-repeat'
                }}
              >
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="h-full flex flex-col"
                  >
                    {activeTab === 'home' && <MockHomeView />}
                    {activeTab === 'voices' && <MockVoicesView />}
                    {activeTab === 'presets' && <MockPresetsView />}
                    {activeTab === 'synthesize' && <MockSynthesizeView />}
                    {activeTab === 'message-packs' && <MockMessagePacksView />}
                    {activeTab === 'scheduling' && <MockSchedulingView />}
                    {activeTab === 'live-announcements' && <MockLiveAnnouncementsView />}
                    {activeTab === 'receiver' && <MockReceiverView />}
                  </motion.div>
                </AnimatePresence>
              </div>
            </main>
          </div>
        </motion.div>
      </main>

      <footer className="border-t border-[#222] py-12 mt-20">
        <div className="max-w-[1200px] mx-auto px-6 flex flex-col md:flex-row items-center justify-between">
          <div className="flex items-center gap-2 text-lg font-medium tracking-tight mb-4 md:mb-0 text-white opacity-50">
            <div className="w-5 h-5 rounded bg-white flex items-center justify-center">
              <Mic className="w-3 h-3 text-black" />
            </div>
            EchoLab
          </div>
          <div className="text-sm text-[#666]">
            © 2026 EchoLab. All rights reserved.
          </div>
        </div>
      </footer>

      {/* Floating Toggle */}
      
    </div>
  );
}

// ------------------------------------------------------------------------------------------------
// UI Components
// ------------------------------------------------------------------------------------------------

function MockPageHeader({ title, actions }: { title: string, actions?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between px-6 h-12 flex-shrink-0 border-b border-[#242526] bg-transparent">
      <div className="flex items-center gap-2">
        <h1 className="text-sm font-medium text-white">{title}</h1>
        <button className="text-gray-500 hover:text-[#f2c94c] transition-colors" title="Add to favorites">
          <Star className="w-4 h-4" />
        </button>
        <button className="text-gray-500 hover:text-white transition-colors" title="More options">
          <MoreHorizontal className="w-4 h-4" />
        </button>
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}

// ------------------------------------------------------------------------------------------------
// Mock Views
// ------------------------------------------------------------------------------------------------

function MockHomeView() {
  return (
    <div className="h-full flex flex-col">
      <MockPageHeader title="Home" />
      <div className="flex-1 overflow-auto">
        <div className="max-w-7xl mx-auto px-12 py-16">
          <div className="mb-12">
            <h1 className="text-3xl font-light text-white mb-2">EchoLab</h1>
            <p className="text-sm text-gray-400">Voice synthesis platform</p>
          </div>
          <div className="grid grid-cols-2 gap-16">
            <div className="space-y-10">
              <div>
                <h2 className="text-xs font-medium text-gray-500 mb-4 uppercase tracking-wide">Start</h2>
                <div className="space-y-1">
                  <div className="flex items-center gap-3 px-0 py-1.5 text-sm text-[#4A9EFF] hover:text-[#5AA8FF] transition-colors group cursor-default">
                    <FileAudio className="w-4 h-4" /><span>Synthesize New Audio...</span>
                  </div>
                  <div className="flex items-center gap-3 px-0 py-1.5 text-sm text-[#4A9EFF] hover:text-[#5AA8FF] transition-colors group cursor-default">
                    <FolderOpen className="w-4 h-4" /><span>Open Preset...</span>
                  </div>
                  <div className="flex items-center gap-3 px-0 py-1.5 text-sm text-[#4A9EFF] hover:text-[#5AA8FF] transition-colors group cursor-default">
                    <Mic2 className="w-4 h-4" /><span>Browse Voices...</span>
                  </div>
                  <div className="flex items-center gap-3 px-0 py-1.5 text-sm text-[#4A9EFF] hover:text-[#5AA8FF] transition-colors group cursor-default">
                    <Package className="w-4 h-4" /><span>Manage Message Packs...</span>
                  </div>
                  <div className="flex items-center gap-3 px-0 py-1.5 text-sm text-[#4A9EFF] hover:text-[#5AA8FF] transition-colors group cursor-default">
                    <Settings className="w-4 h-4" /><span>Settings...</span>
                  </div>
                </div>
              </div>
              <div>
                <h2 className="text-xs font-medium text-gray-500 mb-4 uppercase tracking-wide">Recent</h2>
                <div className="space-y-1">
                  {['Landing', 'Pricing', 'Docs', 'Contact'].map((page, index) => (
                    <div key={index} className="block group cursor-default">
                      <div className="flex items-center justify-between py-1.5 hover:bg-[#1a1a1a] px-2 -mx-2 rounded transition-colors">
                        <span className="text-sm text-[#4A9EFF] group-hover:text-[#5AA8FF]">{page}</span>
                        <span className="text-xs text-gray-500">Link</span>
                      </div>
                    </div>
                  ))}
                  <button className="flex items-center gap-2 px-0 py-1.5 text-sm text-[#4A9EFF] hover:text-[#5AA8FF] transition-colors mt-2">
                    <span>More...</span>
                  </button>
                </div>
              </div>
            </div>
            <div>
              <h2 className="text-xs font-medium text-gray-500 mb-4 uppercase tracking-wide">Walkthroughs</h2>
              <div className="space-y-3">
                <div className="bg-[#1a1a1a] border border-[#242526] rounded p-4 hover:bg-[#1f1f1f] transition-colors">
                  <div className="flex items-start gap-3 mb-2">
                    <div className="w-8 h-8 rounded bg-gradient-to-br from-[#FF6B9D] to-[#C239B3] flex items-center justify-center flex-shrink-0">
                      <Sparkles className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-sm font-medium text-white mb-1">Get started with EchoLab</h3>
                      <p className="text-xs text-gray-400 mb-3">Learn how to select voices, create presets, and synthesize audio</p>
                      <div className="h-1 bg-[#242526] rounded-full overflow-hidden">
                        <div className="h-full bg-[#4A9EFF] w-1/3" />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="border-l-2 border-[#4A9EFF] pl-3 py-1">
                  <h3 className="text-sm font-medium text-white mb-1 flex items-center gap-2">
                    <Lightbulb className="w-4 h-4 text-[#4A9EFF]" />Learn the Fundamentals
                  </h3>
                </div>
                <div className="bg-[#1a1a1a] border border-[#242526] rounded px-4 py-3 hover:bg-[#1f1f1f] transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded bg-[#242526] flex items-center justify-center flex-shrink-0">
                      <FileAudio className="w-3.5 h-3.5 text-gray-400" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-sm text-white">Create your first synthesis</h3>
                    </div>
                    <span className="text-xs px-2 py-0.5 rounded bg-[#FF6B9D]/20 text-[#FF6B9D]">Updated</span>
                  </div>
                </div>
                <div className="bg-[#1a1a1a] border border-[#242526] rounded px-4 py-3 hover:bg-[#1f1f1f] transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded bg-[#242526] flex items-center justify-center flex-shrink-0">
                      <Mic2 className="w-3.5 h-3.5 text-gray-400" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-sm text-white">Configure voice selections</h3>
                    </div>
                    <span className="text-xs px-2 py-0.5 rounded bg-[#FF6B9D]/20 text-[#FF6B9D]">Preview</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MockVoicesView() {
  const voices = [
    { name: 'Adam', provider: 'elevenlabs', lang: 'en-US', gender: 'male', qualities: 'Deep, Narration', selected: true },
    { name: 'Marcus', provider: 'polly', lang: 'en-US', gender: 'male', qualities: 'Energetic, Promo', selected: false },
    { name: 'Sarah', provider: 'elevenlabs', lang: 'en-GB', gender: 'female', qualities: 'Clear, News', selected: true },
    { name: 'Elena', provider: 'google', lang: 'es-ES', gender: 'female', qualities: 'Warm', selected: false },
  ];

  return (
    <div className="h-full flex flex-col">
      <MockPageHeader 
        title="Voices" 
        actions={
          <button className="flex items-center gap-2 px-3 py-1.5 bg-[#242526] text-white border border-[#393a4b] rounded hover:bg-[#2a2b2c] transition-colors shadow-[0px_1px_1px_0px_rgba(0,0,0,0.15)] text-[11px]">
            <Plus className="w-4 h-4" />
            New Voice
          </button>
        } 
      />
      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* en-US Group */}
          <div>
            <h2 className="text-sm font-medium text-white mb-4">en-US</h2>
            <div className="space-y-6">
              <div>
                <h3 className="text-xs font-medium text-gray-500 mb-3 uppercase tracking-wide">Male</h3>
                <div>
                  {voices.filter(v => v.lang === 'en-US' && v.gender === 'male').map(v => (
                    <div key={v.name} className={`relative px-6 py-3.5 transition-all hover:bg-[#1a1a1a] cursor-default ${v.selected ? 'bg-[#1a1a1a]' : ''}`}>
                      <div className="flex items-center gap-4">
                        <div className="flex-shrink-0">
                          {v.selected ? (
                            <div className="w-4 h-4 rounded-full bg-[#5e6ad2] flex items-center justify-center">
                              <Check className="w-2.5 h-2.5 text-white" />
                            </div>
                          ) : (
                            <div className="w-4 h-4 rounded-full border border-[#242526]" />
                          )}
                        </div>
                        <div className="flex-shrink-0 w-20">
                          <p className="text-xs text-gray-500 truncate">{v.provider}</p>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm text-white truncate">{v.name}</h4>
                        </div>
                        <div className="w-px h-6 bg-[#242526] flex-shrink-0" />
                        <div className="flex items-center gap-4 flex-shrink-0">
                          <span className="text-xs text-gray-400 px-2 py-1 rounded bg-[#242526]/50">{v.qualities}</span>
                          <span className="text-xs px-2 py-1 rounded bg-[#5e6ad2]/10 text-[#5e6ad2]">Enabled</span>
                          <button className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-white transition-colors rounded hover:bg-[#242526]">
                            <Volume2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-[#242526] mb-8" />
          
          {/* en-GB Group */}
          <div>
            <h2 className="text-sm font-medium text-white mb-4">en-GB</h2>
            <div className="space-y-6">
              <div>
                <h3 className="text-xs font-medium text-gray-500 mb-3 uppercase tracking-wide">Female</h3>
                <div>
                  {voices.filter(v => v.lang === 'en-GB').map(v => (
                    <div key={v.name} className={`relative px-6 py-3.5 transition-all hover:bg-[#1a1a1a] cursor-default ${v.selected ? 'bg-[#1a1a1a]' : ''}`}>
                      <div className="flex items-center gap-4">
                        <div className="flex-shrink-0">
                          {v.selected ? (
                            <div className="w-4 h-4 rounded-full bg-[#5e6ad2] flex items-center justify-center">
                              <Check className="w-2.5 h-2.5 text-white" />
                            </div>
                          ) : (
                            <div className="w-4 h-4 rounded-full border border-[#242526]" />
                          )}
                        </div>
                        <div className="flex-shrink-0 w-20">
                          <p className="text-xs text-gray-500 truncate">{v.provider}</p>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm text-white truncate">{v.name}</h4>
                        </div>
                        <div className="w-px h-6 bg-[#242526] flex-shrink-0" />
                        <div className="flex items-center gap-4 flex-shrink-0">
                          <span className="text-xs text-gray-400 px-2 py-1 rounded bg-[#242526]/50">{v.qualities}</span>
                          <span className="text-xs px-2 py-1 rounded bg-[#5e6ad2]/10 text-[#5e6ad2]">Enabled</span>
                          <button className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-white transition-colors rounded hover:bg-[#242526]">
                            <Volume2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MockPresetsView() {
  const presets = [
    { name: 'Morning Announcement', language: 'en-US', gender: 'male', rate: 1.0, pitch: 1.2, intonation: 1.0 },
    { name: 'Emergency Broadcast', language: 'en-US', gender: 'female', rate: 1.2, pitch: 1.0, intonation: 1.5 },
    { name: 'Waiting Room Loop', language: 'es-ES', gender: 'female', rate: 0.9, pitch: 1.0, intonation: 1.0 },
    { name: 'Elevator Floors', language: 'en-GB', gender: 'male', rate: 1.0, pitch: 1.0, intonation: 1.0 },
    { name: 'Store Closing', language: 'en-US', gender: 'neutral', rate: 0.8, pitch: 0.9, intonation: 0.8 },
  ];

  return (
    <div className="h-full flex flex-col">
      <MockPageHeader 
        title="Presets" 
        actions={
          <button className="flex items-center gap-2 px-3 py-1.5 bg-[#242526] text-white border border-[#393a4b] rounded hover:bg-[#2a2b2c] transition-colors shadow-[0px_1px_1px_0px_rgba(0,0,0,0.15)] text-[11px]">
            <Plus className="w-4 h-4" />
            New Preset
          </button>
        } 
      />
      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
            {presets.map((preset, i) => (
              <div key={i} className="bg-[#1a1a1a] border border-[#242526] rounded-lg p-3 hover:bg-[#1f1f1f] transition-all group">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-sm font-medium text-white">{preset.name}</h3>
                  <button className="opacity-0 group-hover:opacity-100 text-gray-500 hover:text-red-500 transition-all">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  <span className="px-2 py-0.5 bg-[#151515] border border-[#2a2a2a] rounded text-[10px] text-[#A6ABB2]">
                    {preset.language}
                  </span>
                  <span className="px-2 py-0.5 bg-[#151515] border border-[#2a2a2a] rounded text-[10px] text-[#A6ABB2] capitalize">
                    {preset.gender}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-[10px]">
                  <div className="flex items-center gap-1">
                    <span className="text-[#666666]">Rate</span>
                    <span className="text-[#A6ABB2] font-medium">{preset.rate.toFixed(1)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-[#666666]">Pitch</span>
                    <span className="text-[#A6ABB2] font-medium">{preset.pitch.toFixed(1)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-[#666666]">Intone</span>
                    <span className="text-[#A6ABB2] font-medium">{preset.intonation.toFixed(1)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function MockSynthesizeView() {
  return (
    <div className="h-full flex flex-col">
      <MockPageHeader title="Synthesize" />
      <div className="flex-1 overflow-auto">
        <div className="max-w-7xl mx-auto px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-12">
            {/* Left Col */}
            <div className="space-y-8">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <label className="block text-sm font-medium text-white">Text to synthesize</label>
                  <button className="flex items-center justify-center w-5 h-5 rounded-full border-2 border-yellow-500/80 hover:bg-yellow-500/10 transition-colors">
                    <Lightbulb className="w-3 h-3 text-yellow-500/80" />
                  </button>
                </div>
                <textarea
                  readOnly
                  rows={6}
                  className="w-full px-0 py-2 bg-transparent border-0 border-b border-[#242526] text-sm text-gray-200 placeholder:text-gray-500 focus:outline-none focus:border-[#393a4b] resize-none transition-colors"
                  defaultValue="Welcome to EchoLab. This is a demonstration of our advanced voice synthesis technology."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-3">Configuration source</label>
                <div className="w-full max-w-md bg-[#141414] border border-[#242526] rounded-md px-3 py-2 text-sm text-white flex items-center justify-between">
                  <span>Configure manually</span>
                  <ChevronDown className="w-4 h-4 text-gray-500" />
                </div>
              </div>

              <div className="pt-4">
                <h3 className="text-sm font-medium text-white mb-4">Voice parameters</h3>
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs text-gray-500 mb-2">Language</label>
                      <div className="w-full bg-[#141414] border border-[#242526] rounded-md px-3 py-2 text-sm text-white flex items-center justify-between">
                        <span>en-US</span>
                        <ChevronDown className="w-4 h-4 text-gray-500" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-2">Gender</label>
                      <div className="w-full bg-[#141414] border border-[#242526] rounded-md px-3 py-2 text-sm text-white flex items-center justify-between">
                        <span>Male</span>
                        <ChevronDown className="w-4 h-4 text-gray-500" />
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs text-gray-500">Rate</label>
                      <span className="text-xs font-medium text-white">1.00</span>
                    </div>
                    <div className="w-full h-1 bg-[#393a4b] rounded-full relative">
                      <div className="absolute w-4 h-4 bg-white rounded-full top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 shadow" />
                    </div>
                    <div className="flex justify-between text-[10px] text-gray-500 mt-2">
                      <span>Slower</span>
                      <span>Faster</span>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs text-gray-500">Pitch</label>
                      <span className="text-xs font-medium text-white">1.00</span>
                    </div>
                    <div className="w-full h-1 bg-[#393a4b] rounded-full relative">
                      <div className="absolute w-4 h-4 bg-white rounded-full top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 shadow" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Col */}
            <div className="space-y-6">
              <div>
                <h3 className="text-xs text-gray-500 mb-3">Status</h3>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                  <span className="text-sm text-white">Ready</span>
                </div>
              </div>

              <div>
                <button className="w-full px-4 py-2.5 bg-[#5e6ad2] text-white rounded text-sm hover:bg-[#4b55a8] transition-all shadow-[0_0_15px_rgba(94,106,210,0.5)]">
                  Generate Audio
                </button>
              </div>

              <div>
                <h3 className="text-xs text-gray-500 mb-3">Configuration</h3>
                <div className="space-y-2 min-h-[60px]">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-500">Mode</span>
                    <span className="text-white capitalize">Manual</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-500">Language</span>
                    <span className="text-white">en-US</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-500">Gender</span>
                    <span className="text-white capitalize">Male</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-xs text-gray-500 mb-3">Result</h3>
                <div className="space-y-3">
                  <div className="w-full h-10 bg-[#141414] border border-[#242526] rounded-md flex items-center px-3 gap-3">
                    <Play className="w-4 h-4 text-white" />
                    <div className="flex-1 h-1 bg-[#242526] rounded-full"></div>
                    <span className="text-xs text-gray-500">0:04</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MockMessagePacksView() {
  return (
    <div className="h-full flex flex-col">
      <MockPageHeader 
        title="Message Packs" 
        actions={
          <button className="flex items-center gap-2 px-3 py-1.5 bg-[#242526] text-white border border-[#393a4b] rounded hover:bg-[#2a2b2c] transition-colors shadow-[0px_1px_1px_0px_rgba(0,0,0,0.15)] text-[11px]">
            <Plus className="w-4 h-4" />
            New Pack
          </button>
        } 
      />
      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-6xl mx-auto space-y-3">
          {[
            { name: 'Morning Announcements', date: '3/29/2026', count: 4, expanded: false },
            { name: 'Emergency Broadcasts', date: '3/25/2026', count: 2, expanded: true },
            { name: 'Closing Routine', date: '3/28/2026', count: 3, expanded: false },
          ].map((pack, i) => (
            <div key={i} className="bg-[#1a1a1a] border border-[#242526] rounded-lg overflow-hidden">
              <div className="p-4 flex justify-between items-center">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="font-medium text-white text-sm">{pack.name}</h3>
                    <span className="text-[11px] text-gray-500">{pack.count} messages</span>
                  </div>
                  <p className="text-[11px] text-gray-500">Created {pack.date}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button className="text-blue-400 hover:text-blue-300 p-1.5 transition-colors">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button className="px-3 py-1.5 text-xs text-white bg-[#242526] rounded hover:bg-[#2a2b2c] transition-colors">
                    {pack.expanded ? 'Hide' : 'Show'}
                  </button>
                  <button className="text-red-400 hover:text-red-300 p-1.5 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              {pack.expanded && (
                <div className="border-t border-[#242526] bg-[#151515] p-4">
                  <div className="space-y-2">
                    <div className="bg-[#1a1a1a] border border-[#242526] rounded p-3">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-xs font-medium text-white">Fire Alarm</span>
                        <button className="text-gray-500 hover:text-red-500 transition-colors">
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                      <p className="text-xs text-gray-300 mb-2">Attention everyone. A fire alarm has been activated. Please evacuate the building immediately through the nearest exit.</p>
                      <p className="text-[11px] text-gray-500">Preset ID: Emergency Broadcast</p>
                    </div>
                    <div className="bg-[#1a1a1a] border border-[#242526] rounded p-3">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-xs font-medium text-white">Weather Warning</span>
                        <button className="text-gray-500 hover:text-red-500 transition-colors">
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                      <p className="text-xs text-gray-300 mb-2">Severe weather approaching. Please remain indoors and stay away from windows.</p>
                      <p className="text-[11px] text-gray-500">Preset ID: Emergency Broadcast</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function MockSchedulingView() {
  return (
    <div className="h-full flex flex-col">
      <MockPageHeader 
        title="Scheduling" 
        actions={
          <button className="px-3 py-1.5 text-sm bg-[#1a1a1a] border border-[#242526] rounded text-white">
            New Schedule
          </button>
        } 
      />
      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="bg-[#1a1a1a]/50 border border-[#242526] rounded-lg p-5 flex items-start justify-between">
            <div>
              <h3 className="text-base font-medium text-white mb-1">Morning Promotion</h3>
              <div className="flex items-center gap-3 text-xs text-gray-400 mb-3">
                <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> Apr 01 - Dec 31</span>
                <span className="flex items-center gap-1"><Radio className="w-3 h-3" /> Area A, Area B</span>
              </div>
              <div className="flex gap-2">
                <span className="px-2 py-0.5 bg-[#242526] rounded text-[10px] text-gray-300">08:00</span>
                <span className="px-2 py-0.5 bg-[#242526] rounded text-[10px] text-gray-300">12:00</span>
                <span className="px-2 py-0.5 bg-[#242526] rounded text-[10px] text-gray-300">17:00</span>
              </div>
            </div>
            <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded">Active</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function MockLiveAnnouncementsView() {
  return (
    <div className="h-full flex flex-col">
      <MockPageHeader 
        title="Live Announcements" 
        actions={
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-[#1a1a1a] border border-[#242526] rounded">
              <Radio className="w-4 h-4 text-green-400" />
              <span className="text-xs text-gray-500">3 online</span>
            </div>
          </div>
        }
      />
      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-6">
            <h2 className="text-lg font-medium text-white">Send Announcement</h2>
            <div>
              <label className="text-xs font-medium text-gray-500 mb-2 block uppercase tracking-wide">Content Type</label>
              <div className="flex gap-3">
                <button className="flex-1 px-4 py-3 bg-[#5e6ad2] border border-[#5e6ad2] text-white rounded transition-colors flex items-center justify-center gap-2">
                  <FileAudio className="w-4 h-4" /> Text
                </button>
                <button className="flex-1 px-4 py-3 bg-[#1a1a1a] border border-[#242526] text-gray-500 rounded transition-colors flex items-center justify-center gap-2 hover:border-[#5e6ad2]">
                  <Package className="w-4 h-4" /> Message Pack
                </button>
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 mb-2 block uppercase tracking-wide">Text Content</label>
              <textarea
                placeholder="Enter your announcement text..."
                rows={4}
                className="w-full bg-[#1a1a1a] border border-[#242526] rounded px-3 py-2 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:ring-[#5e6ad2]"
                defaultValue="Please welcome our new team members."
              />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 mb-2 block uppercase tracking-wide">Voice Preset</label>
              <div className="w-full bg-[#1a1a1a] border border-[#242526] rounded px-3 py-2 text-sm text-white flex justify-between items-center cursor-default">
                Morning Announcement (en-US, male)
                <ChevronDown className="w-4 h-4 text-gray-500" />
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 mb-2 block uppercase tracking-wide">Delivery Method</label>
              <div className="flex gap-3">
                <button className="flex-1 px-4 py-3 bg-[#5e6ad2] border border-[#5e6ad2] text-white rounded transition-colors flex items-center justify-center gap-2">
                  <Users className="w-4 h-4" /> Recipients
                </button>
                <button className="flex-1 px-4 py-3 bg-[#1a1a1a] border border-[#242526] text-gray-500 rounded transition-colors flex items-center justify-center gap-2 hover:border-[#5e6ad2]">
                  <LinkIcon className="w-4 h-4" /> Callback URL
                </button>
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Select Recipients</label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" defaultChecked className="rounded border-[#242526] text-[#5e6ad2] focus:ring-[#5e6ad2]" />
                  <span className="text-xs text-gray-500">Send to all online</span>
                </label>
              </div>
              <div className="space-y-2">
                <button className="w-full px-3 py-2 border rounded text-sm transition-colors flex items-center justify-between opacity-50 cursor-not-allowed bg-[#1a1a1a] border-[#242526] text-gray-500">
                  <div className="flex items-center gap-2">
                    <Radio className="w-3 h-3 text-green-400" />
                    <span>Reception Display</span>
                  </div>
                  <span className="text-xs opacity-60">dev-001</span>
                </button>
                <button className="w-full px-3 py-2 border rounded text-sm transition-colors flex items-center justify-between opacity-50 cursor-not-allowed bg-[#1a1a1a] border-[#242526] text-gray-500">
                  <div className="flex items-center gap-2">
                    <Radio className="w-3 h-3 text-green-400" />
                    <span>Main Hall Speaker</span>
                  </div>
                  <span className="text-xs opacity-60">dev-002</span>
                </button>
              </div>
            </div>
            <button className="w-full px-4 py-3 bg-[#5e6ad2] hover:bg-[#4b55a8] text-white text-sm rounded transition-colors flex items-center justify-center gap-2">
              <Play className="w-4 h-4" /> Send Announcement
            </button>
          </div>
          <div className="space-y-6">
            <h2 className="text-lg font-medium text-white">History</h2>
            <div className="space-y-3">
              <div className="p-4 bg-[#1a1a1a]/50 border border-[#242526] rounded hover:bg-[#1a1a1a] transition-colors">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <FileAudio className="w-4 h-4 text-gray-500" />
                    <span className="text-sm font-medium text-white">Emergency announcement test</span>
                  </div>
                  <span className="px-2 py-0.5 rounded text-xs bg-green-500/20 text-green-400">delivered</span>
                </div>
                <div className="space-y-1 text-xs text-gray-500">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3 h-3" />
                    <span>3/29/2026, 10:30:00 AM</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Users className="w-3 h-3 mt-0.5" />
                    <span className="flex-1">Reception Display, Main Hall Speaker</span>
                  </div>
                </div>
              </div>
              <div className="p-4 bg-[#1a1a1a]/50 border border-[#242526] rounded hover:bg-[#1a1a1a] transition-colors">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Package className="w-4 h-4 text-gray-500" />
                    <span className="text-sm font-medium text-white">Morning Announcements Pack</span>
                  </div>
                  <span className="px-2 py-0.5 rounded text-xs bg-blue-500/20 text-blue-400">sent</span>
                </div>
                <div className="space-y-1 text-xs text-gray-500">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3 h-3" />
                    <span>3/29/2026, 8:00:00 AM</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <LinkIcon className="w-3 h-3" />
                    <span>Callback URL</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MockReceiverView() {
  return (
    <div className="h-full flex flex-col">
      <MockPageHeader 
        title="Receiver" 
        actions={
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-green-500/20 border border-green-500/30 rounded">
              <Wifi className="w-4 h-4 text-green-400" />
              <span className="text-xs text-green-400">Connected</span>
            </div>
          </div>
        } 
      />
      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="p-6 bg-[#1a1a1a]/50 border border-[#242526] rounded space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-medium text-white mb-1">Current Device</h2>
                <p className="text-sm text-gray-400">Reception Display</p>
                <p className="text-xs text-gray-500">ID: dev-001</p>
              </div>
              <button className="px-4 py-2 bg-red-500/20 border border-red-500/30 text-red-400 text-sm rounded flex items-center gap-2">
                Disconnect
              </button>
            </div>
            <div className="pt-4 border-t border-[#242526]">
              <label className="flex items-center gap-2">
                <input type="checkbox" defaultChecked className="rounded bg-[#242526] border-[#393a4b]" />
                <span className="text-sm text-white">Auto-play announcements</span>
              </label>
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-lg font-medium text-white">Received Announcements</h2>
            <div className="space-y-2">
              <div className="p-4 border border-[#242526]/50 bg-[#1a1a1a]/30 rounded opacity-60">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Volume2 className="w-4 h-4 text-gray-500" />
                    <div>
                      <h3 className="text-sm font-medium text-white">Announcement 1</h3>
                      <p className="text-xs text-gray-500 mt-1">Received: Today, 10:45 AM</p>
                    </div>
                  </div>
                  <span className="px-3 py-1.5 bg-green-500/20 text-green-400 text-xs rounded flex items-center gap-2">
                    <Pause className="w-3 h-3" /> Played
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
