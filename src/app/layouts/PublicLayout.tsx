import { Outlet, Link } from 'react-router';
import { Mic, Github } from 'lucide-react';

export function PublicLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-[#0a0a0a] text-white font-sans">
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
      <main className="flex-1">
        <Outlet />
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
    </div>
  );
}