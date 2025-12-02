'use client'

import { ArrowRight } from "lucide-react";
import { Button } from "../ui/button";
import Link from "../ui/Link";

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-b from-slate-900 via-slate-900 to-slate-800">
      {/* Background effects */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-900/20 via-transparent to-transparent" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />

      <div className="container mx-auto px-6 py-20 relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-12">
          <div className="flex-1 text-center lg:text-left">
            <div className="flex flex-col space-y-6">
              <div className="inline-block mb-2">
                <span className="px-4 py-2 bg-blue-950/50 border border-blue-700/50 backdrop-blur-xl rounded-full text-sm font-medium text-blue-200">
                  Your Personal Digital Vault
                </span>
              </div>
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight flex flex-col lg:flex-row items-center justify-center lg:justify-start gap-4">
                <img src="/logo-with-text.png" alt="DumpIt Logo" className="w-32 h-auto inline-block mb-2 lg:mb-0" />
                <span>
                  Your Digital Memory.{" "}
                  <span className="bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
                    Organized.
                  </span>
                </span>
              </h1>
              <p className="text-xl text-gray-300 max-w-2xl mx-auto lg:mx-0">
                All your links, notes, and snapshots of inspiration—secure, searchable,
                and always in sync. Welcome to smarter personal storage.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link href="/dashboard" tabIndex={-1} className="contents">
                  <Button variant="hero" size="lg" className="group">
                    Get Started Free
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <Button
                  variant="glass"
                  size="lg"
                  onClick={() => {
                    const el = document.getElementById('features');
                    if (el) {
                      el.scrollIntoView({ behavior: 'smooth' });
                    }
                  }}
                >
                  See How It Works
                </Button>
              </div>
              <div className="flex items-center gap-8 justify-center lg:justify-start text-sm text-gray-400">
                <div className="flex items-center gap-2">
                  <div className="flex -space-x-2">
                    <div className="w-8 h-8 rounded-full bg-blue-500/20 border border-blue-500/50" />
                    <div className="w-8 h-8 rounded-full bg-blue-600/20 border border-blue-600/50" />
                    <div className="w-8 h-8 rounded-full bg-blue-700/20 border border-blue-700/50" />
                  </div>
                  <span>Join early users</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-yellow-400">★★★★★</span>
                  <span>5.0 rating</span>
                </div>
              </div>
            </div>
          </div>

          {/* Hero visual */}
          <div className="flex-1 relative">
            <div className="relative w-full max-w-lg mx-auto">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/30 to-blue-600/30 rounded-3xl blur-3xl opacity-30 animate-pulse" />
              <div className="relative z-10 w-full h-auto bg-gradient-to-br from-blue-900/50 to-slate-900/50 rounded-3xl border border-blue-700/50 p-8 backdrop-blur-xl">
                <div className="space-y-4">
                  <div className="h-40 bg-blue-800/30 rounded-xl" />
                  <div className="flex gap-4">
                    <div className="h-20 flex-1 bg-blue-800/30 rounded-lg" />
                    <div className="h-20 flex-1 bg-blue-800/30 rounded-lg" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
