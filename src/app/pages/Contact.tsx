import { BookOpen, MessageSquare, Github, Code, ArrowRight } from 'lucide-react';
import { Link } from 'react-router';

export function Contact() {
  return (
    <div className="max-w-[1000px] mx-auto px-6 py-24 min-h-screen bg-[#0a0a0a]">
      <div className="text-center mb-16">
        <div className="flex items-center justify-center gap-4 mb-8">
          <div className="h-px w-8 bg-[#333]"></div>
          <span className="text-[#888] font-mono text-[11px] tracking-[0.2em] uppercase">Resources</span>
          <div className="h-px w-8 bg-[#333]"></div>
        </div>
        <h1 className="text-5xl md:text-[64px] text-white tracking-tight leading-tight mb-6" style={{ fontFamily: '"Playfair Display", serif' }}>
          Everything you need<br />
          <span className="italic text-[#eaeaea]">to build with voice.</span>
        </h1>
        <p className="text-[#888] text-lg max-w-xl mx-auto">
          Explore our guides, API references, and community resources to get the most out of EchoLab.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6 max-w-[900px] mx-auto mb-20">
        <a href="#" className="group border border-[#222] bg-[#0a0a0a] p-8 flex flex-col hover:border-[#444] transition-colors rounded-sm">
          <BookOpen className="w-6 h-6 text-[#5e6ad2] mb-6" />
          <h3 className="text-2xl text-white mb-3" style={{ fontFamily: '"Playfair Display", serif' }}>Documentation</h3>
          <p className="text-[#888] text-sm mb-8 flex-1">Read our comprehensive guides and API reference to integrate voice synthesis into your applications.</p>
          <div className="flex items-center gap-2 text-[#aaa] font-mono text-[13px] group-hover:text-white transition-colors">
            Read docs <ArrowRight className="w-3 h-3" />
          </div>
        </a>

        <a href="#" className="group border border-[#222] bg-[#0a0a0a] p-8 flex flex-col hover:border-[#444] transition-colors rounded-sm">
          <Code className="w-6 h-6 text-[#5e6ad2] mb-6" />
          <h3 className="text-2xl text-white mb-3" style={{ fontFamily: '"Playfair Display", serif' }}>API Reference</h3>
          <p className="text-[#888] text-sm mb-8 flex-1">Detailed endpoint documentation, authentication guides, and SDK examples for developers.</p>
          <div className="flex items-center gap-2 text-[#aaa] font-mono text-[13px] group-hover:text-white transition-colors">
            View API <ArrowRight className="w-3 h-3" />
          </div>
        </a>

        <a href="#" className="group border border-[#222] bg-[#0a0a0a] p-8 flex flex-col hover:border-[#444] transition-colors rounded-sm">
          <MessageSquare className="w-6 h-6 text-[#5e6ad2] mb-6" />
          <h3 className="text-2xl text-white mb-3" style={{ fontFamily: '"Playfair Display", serif' }}>Community</h3>
          <p className="text-[#888] text-sm mb-8 flex-1">Join our Discord community to ask questions, share projects, and learn from other developers.</p>
          <div className="flex items-center gap-2 text-[#aaa] font-mono text-[13px] group-hover:text-white transition-colors">
            Join Discord <ArrowRight className="w-3 h-3" />
          </div>
        </a>

        <a href="https://github.com/pedroVelosoFernandes/echolab-p2" target="_blank" rel="noopener noreferrer" className="group border border-[#222] bg-[#0a0a0a] p-8 flex flex-col hover:border-[#444] transition-colors rounded-sm">
          <Github className="w-6 h-6 text-[#5e6ad2] mb-6" />
          <h3 className="text-2xl text-white mb-3" style={{ fontFamily: '"Playfair Display", serif' }}>GitHub</h3>
          <p className="text-[#888] text-sm mb-8 flex-1">Check out our open source examples, starter templates, and contribute to the community.</p>
          <div className="flex items-center gap-2 text-[#aaa] font-mono text-[13px] group-hover:text-white transition-colors">
            View repository <ArrowRight className="w-3 h-3" />
          </div>
        </a>
      </div>

      <div className="max-w-[600px] mx-auto border border-[#222] bg-[#111] p-10 rounded-sm relative shadow-[0_0_50px_-15px_rgba(94,106,210,0.15)] mt-16">
        <div className="absolute top-0 left-0 right-0 h-1 bg-[#5e6ad2]" />
        <div className="text-center mb-8">
          <h3 className="text-[28px] text-white mb-2 mt-2" style={{ fontFamily: '"Playfair Display", serif' }}>Need help?</h3>
          <p className="text-[#666] text-xs font-mono">Send us a message directly</p>
        </div>
        
        <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <input
                type="text"
                className="w-full bg-[#0a0a0a] border border-[#222] text-white px-4 py-3 text-sm focus:outline-none focus:border-[#444] transition-colors font-mono rounded-sm placeholder-[#444]"
                placeholder="Name"
              />
            </div>
            <div>
              <input
                type="email"
                className="w-full bg-[#0a0a0a] border border-[#222] text-white px-4 py-3 text-sm focus:outline-none focus:border-[#444] transition-colors font-mono rounded-sm placeholder-[#444]"
                placeholder="Email"
              />
            </div>
          </div>
          <div>
            <textarea
              rows={4}
              className="w-full bg-[#0a0a0a] border border-[#222] text-white px-4 py-3 text-sm focus:outline-none focus:border-[#444] transition-colors font-mono rounded-sm resize-none placeholder-[#444]"
              placeholder="How can we help?"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-[#5e6ad2] hover:bg-[#4b55a8] text-white py-3 text-sm font-medium transition-colors rounded-sm flex items-center justify-center gap-2"
          >
            Send Message
          </button>
        </form>
      </div>
    </div>
  );
}
