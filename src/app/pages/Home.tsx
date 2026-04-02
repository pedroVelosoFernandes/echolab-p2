import { useUserContext } from '../../hooks/useUserContext';
import { Mic2, Sliders, Package, Settings, FolderOpen, FileAudio, Sparkles, BookOpen, Lightbulb, Radio, Calendar, Tv2 } from 'lucide-react';
import { PageHeader } from '../components/PageHeader';
import { Link, useNavigate } from 'react-router';
import contentBgImage from 'figma:asset/8ae19cca138daf368a96bb8fbe23a98c7d881c2f.png';
import { tutorialMetadata } from '../data/tutorials';

export function Home() {
  const { userContext } = useUserContext();
  const navigate = useNavigate();

  // Landing page links
  const recentPages = [
    { name: 'Landing', path: '/' },
    { name: 'Pricing', path: '/pricing' },
    { name: 'Docs', path: '/docs' },
    { name: 'Contact', path: '/contact' },
  ];

  const handleStartWalkthrough = () => {
    localStorage.setItem('tutorial_sequence_index', '0');
    navigate('/app/synthesize');
  };

  return (
    <div className="h-full flex flex-col">
      <PageHeader
        title="Home"
        showFavorite
        showMenu
      />

      <div 
        className="flex-1 overflow-auto"
        style={{
          backgroundImage: `url(${contentBgImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      >
        <div className="max-w-screen-2xl mx-auto px-16 py-20">
          {/* Header */}
          <div className="mb-16">
            <h1 className="text-4xl font-light text-foreground mb-3">EchoLab</h1>
            <p className="text-base text-muted-foreground">Voice synthesis platform</p>
          </div>

          {/* Two column layout */}
          <div className="grid grid-cols-2 gap-24">
            {/* Left Column */}
            <div className="space-y-12">
              {/* Start Section */}
              <div>
                <h2 className="text-sm font-medium text-muted-foreground mb-6 uppercase tracking-wide">Start</h2>
                <div className="space-y-2">
                  <Link
                    to="/app/synthesize"
                    className="flex items-center gap-4 px-0 py-2 text-base text-[#4A9EFF] hover:text-[#5AA8FF] transition-colors group"
                  >
                    <FileAudio className="w-5 h-5" />
                    <span>Synthesize New Audio...</span>
                  </Link>
                  
                  <Link
                    to="/app/presets"
                    className="flex items-center gap-4 px-0 py-2 text-base text-[#4A9EFF] hover:text-[#5AA8FF] transition-colors group"
                  >
                    <FolderOpen className="w-5 h-5" />
                    <span>Open Preset...</span>
                  </Link>
                  
                  <Link
                    to="/app/voices"
                    className="flex items-center gap-4 px-0 py-2 text-base text-[#4A9EFF] hover:text-[#5AA8FF] transition-colors group"
                  >
                    <Mic2 className="w-5 h-5" />
                    <span>Browse Voices...</span>
                  </Link>
                  
                  <Link
                    to="/app/message-packs"
                    className="flex items-center gap-4 px-0 py-2 text-base text-[#4A9EFF] hover:text-[#5AA8FF] transition-colors group"
                  >
                    <Package className="w-5 h-5" />
                    <span>Manage Message Packs...</span>
                  </Link>
                  
                  <Link
                    to="/app/settings"
                    className="flex items-center gap-4 px-0 py-2 text-base text-[#4A9EFF] hover:text-[#5AA8FF] transition-colors group"
                  >
                    <Settings className="w-5 h-5" />
                    <span>Settings...</span>
                  </Link>
                </div>
              </div>

              {/* Recent Section */}
              <div>
                <h2 className="text-sm font-medium text-muted-foreground mb-6 uppercase tracking-wide">Recent</h2>
                <div className="space-y-2">
                  {recentPages.map((page, index) => (
                    <Link
                      key={index}
                      to={page.path}
                      className="block group"
                    >
                      <div className="flex items-center justify-between py-2.5 hover:bg-[#1a1a1a] px-3 -mx-3 rounded-lg transition-colors">
                        <span className="text-base text-[#4A9EFF] group-hover:text-[#5AA8FF]">{page.name}</span>
                        <span className="text-sm text-muted-foreground">Link</span>
                      </div>
                    </Link>
                  ))}
                  
                  <button className="flex items-center gap-3 px-0 py-2 text-base text-[#4A9EFF] hover:text-[#5AA8FF] transition-colors mt-4">
                    <span>More...</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Right Column - Walkthroughs */}
            <div>
              <h2 className="text-sm font-medium text-muted-foreground mb-6 uppercase tracking-wide">Walkthroughs</h2>
              <div className="space-y-5">
                {/* Get Started Card */}
                <div 
                  onClick={handleStartWalkthrough}
                  className="bg-[#1a1a1a] border border-[#242526] rounded-xl p-6 hover:bg-[#1f1f1f] transition-colors cursor-pointer group"
                >
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[#5e6ad2] to-[#7b85e0] flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                      <Sparkles className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-base font-medium text-foreground mb-2 group-hover:text-[#5e6ad2] transition-colors">Get started with EchoLab</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Take a guided tour through all of EchoLab's features. This will walk you through synthesizing audio, managing voices, and configuring settings.
                      </p>
                    </div>
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