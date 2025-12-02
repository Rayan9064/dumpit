import { Globe, Smartphone, MessageSquare, Folder } from "lucide-react";

const Vision = () => {
  const sources = [
    { icon: Globe, label: "Browser tabs", color: "text-blue-400" },
    { icon: Smartphone, label: "Phone gallery", color: "text-blue-500" },
    { icon: MessageSquare, label: "Chat messages", color: "text-blue-600" },
    { icon: Folder, label: "Desktop files", color: "text-blue-300" },
  ];

  return (
    <section className="py-24 relative overflow-hidden bg-gradient-to-b from-slate-900 to-slate-900/50">
      <div className="container mx-auto px-6">
        <div className="max-w-4xl mx-auto text-center space-y-8 animate-fade-in-up">
          <h2 className="text-4xl md:text-5xl font-bold">
            Stop Losing{" "}
            <span className="bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
              What Matters
            </span>
          </h2>

          <p className="text-xl text-gray-300 leading-relaxed">
            You find gems every day—bookmarks, screenshots, ideas, recipes—scattered
            across chats, emails, and devices. DumpIt unifies them into one beautifully
            organized vault, putting privacy and control in your hands.
          </p>

          {/* Visual representation of scattered to organized */}
          <div className="relative py-16">
            <div className="flex items-center justify-center gap-8 flex-wrap">
              {/* Scattered sources */}
              <div className="grid grid-cols-2 gap-4 animate-fade-in-up">
                {sources.map((source, index) => {
                  const Icon = source.icon;
                  return (
                    <div
                      key={index}
                      className="w-20 h-20 rounded-xl bg-blue-950/30 border border-blue-700/50 backdrop-blur-xl flex flex-col items-center justify-center gap-1 animate-float"
                      style={{ animationDelay: `${index * 0.2}s` }}
                    >
                      <Icon className={`w-6 h-6 ${source.color}`} />
                      <span className="text-xs text-gray-400">{source.label}</span>
                    </div>
                  );
                })}
              </div>

              {/* Arrow */}
              <div className="text-4xl text-blue-500 animate-pulse">→</div>

              {/* Unified vault */}
              <div className="w-32 h-32 rounded-2xl bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center shadow-lg shadow-blue-500/25 animate-glow-pulse">
                <Folder className="w-12 h-12 text-white" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Vision;
