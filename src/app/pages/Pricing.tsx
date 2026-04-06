import { ChevronDown, Mail, Calendar } from 'lucide-react';
import { Link } from 'react-router';

export function Pricing() {
  return (
    <div className="max-w-[1000px] mx-auto px-6 py-24 min-h-screen bg-[#0a0a0a]">
      <div className="text-center mb-16">
        <div className="flex items-center justify-center gap-4 mb-8">
          <div className="h-px w-8 bg-[#333]"></div>
          <span className="text-[#888] font-mono text-[11px] tracking-[0.2em] uppercase">Pricing</span>
          <div className="h-px w-8 bg-[#333]"></div>
        </div>
        <h1 className="text-5xl md:text-[64px] text-white tracking-tight" style={{ fontFamily: '"Playfair Display", serif' }}>
          Easiest way to synthesize voices
        </h1>
      </div>

      <div className="grid md:grid-cols-2 gap-8 max-w-[900px] mx-auto items-stretch">
        
        {/* Free Plan */}
        <div className="border border-[#222] bg-[#0a0a0a] p-10 flex flex-col hover:border-[#333] transition-colors rounded-sm relative">
          <div className="mb-10">
            <h3 className="text-[28px] text-white mb-2" style={{ fontFamily: '"Playfair Display", serif' }}>Free</h3>
            <p className="text-[#666] text-xs font-mono">No credit card required</p>
          </div>

          <div className="text-4xl text-white mb-10 font-medium tracking-tight">
            $0<span className="text-xl text-[#666] font-normal">/mo</span>
          </div>

          <ul className="space-y-5 mb-14 flex-1">
            <li className="flex items-start gap-4 text-[#aaa] font-mono text-[13px]">
              <div className="w-2 h-2 mt-1.5 bg-[#444] flex-shrink-0 rounded-[1px]" />
              100 synthesis requests/month
            </li>
            <li className="flex items-start gap-4 text-[#aaa] font-mono text-[13px]">
              <div className="w-2 h-2 mt-1.5 bg-[#444] flex-shrink-0 rounded-[1px]" />
              10 presets
            </li>
            <li className="flex items-start gap-4 text-[#aaa] font-mono text-[13px]">
              <div className="w-2 h-2 mt-1.5 bg-[#444] flex-shrink-0 rounded-[1px]" />
              Basic voices
            </li>
            <li className="flex items-start gap-4 text-[#aaa] font-mono text-[13px]">
              <div className="w-2 h-2 mt-1.5 bg-[#444] flex-shrink-0 rounded-[1px]" />
              Community support
            </li>
          </ul>

          <Link
            to="/signup"
            className="block w-full text-center py-3 border border-[#333] text-white hover:bg-[#111] transition-colors font-medium text-sm rounded-sm"
          >
            Get Started for Free
          </Link>
        </div>

        {/* Pro Plan */}
        <div className="border border-primary bg-[#0a0a0a] p-10 flex flex-col relative rounded-sm shadow-[0_0_50px_-15px_rgba(255,107,53,0.15)] relative">
          {/* Subtle top border highlight matching the image */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-primary" />

          <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4 mt-2">
            <h3 className="text-[28px] text-white" style={{ fontFamily: '"Playfair Display", serif' }}>Subscription</h3>
            <div className="flex items-baseline gap-3">
              <span className="text-[#666] line-through text-lg font-medium">$39</span>
              <span className="text-4xl text-white font-medium tracking-tight">
                $29<span className="text-xl text-[#666] font-normal">/mo</span>
              </span>
            </div>
          </div>

          <div className="border border-[#333] bg-[#111] p-4 flex items-center justify-between mb-10 cursor-pointer hover:bg-[#1a1a1a] rounded-sm transition-colors group">
            <span className="text-white font-mono text-sm">Unlimited credits</span>
            <div className="flex items-center gap-3">
              <span className="bg-primary/20 text-primary px-2 py-1 text-xs font-mono rounded-sm">Save 25%</span>
              <ChevronDown className="w-4 h-4 text-[#666] group-hover:text-white transition-colors" />
            </div>
          </div>

          <ul className="space-y-5 mb-14 flex-1">
            <li className="flex items-start gap-4 text-[#aaa] font-mono text-[13px]">
              <div className="w-2 h-2 mt-1.5 bg-[#444] flex-shrink-0 rounded-[1px]" />
              Unlimited synthesis
            </li>
            <li className="flex items-start gap-4 text-[#aaa] font-mono text-[13px]">
              <div className="w-2 h-2 mt-1.5 bg-[#444] flex-shrink-0 rounded-[1px]" />
              Unlimited presets & all voices
            </li>
            <li className="flex items-start gap-4 text-[#aaa] font-mono text-[13px]">
              <div className="w-2 h-2 mt-1.5 bg-[#444] flex-shrink-0 rounded-[1px]" />
              Message packs included
            </li>
            <li className="flex items-start gap-4 text-[#aaa] font-mono text-[13px]">
              <div className="w-2 h-2 mt-1.5 bg-[#444] flex-shrink-0 rounded-[1px]" />
              Priority support
            </li>
          </ul>

          <div>
            <Link
              to="/signup"
              className="block w-full text-center py-3 bg-primary text-primary-foreground hover:bg-primary/90 transition-colors font-medium text-sm rounded-sm"
            >
              Get Started
            </Link>
            <p className="text-center text-[#555] text-[11px] mt-4 font-mono tracking-wide">
              14-day satisfaction guarantee · Cancel anytime
            </p>
          </div>
        </div>

      </div>

      {/* Enterprise */}
      <div className="max-w-[900px] mx-auto mt-24 text-center">
        <div className="flex items-center justify-center gap-4 mb-8">
          <div className="h-px w-8 bg-[#333]"></div>
          <span className="text-[#888] font-mono text-[11px] tracking-[0.2em] uppercase">Enterprise</span>
          <div className="h-px w-8 bg-[#333]"></div>
        </div>
        
        <p className="text-[#888] font-mono text-[13px] mb-10 max-w-lg mx-auto leading-relaxed">
          Custom SLAs, zero data retention, dedicated Slack channel, and more
        </p>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            to="/contact"
            className="flex items-center justify-center gap-2.5 w-full sm:w-auto px-8 py-3 border border-[#333] text-[#ccc] hover:text-white hover:bg-[#111] transition-colors font-mono text-xs rounded-sm"
          >
            <Mail className="w-4 h-4" />
            Email us
          </Link>
          <Link
            to="/contact"
            className="flex items-center justify-center gap-2.5 w-full sm:w-auto px-8 py-3 border border-[#333] text-[#ccc] hover:text-white hover:bg-[#111] transition-colors font-mono text-xs rounded-sm"
          >
            <Calendar className="w-4 h-4" />
            Book a call
          </Link>
        </div>
      </div>
    </div>
  );
}