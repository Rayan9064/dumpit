import { Save, Sparkles, Lock, Share2, Tag, Bell } from "lucide-react";
import { Card } from "../ui/card";

const features = [
  {
    icon: Save,
    title: "Quick Save Anything",
    description: "Instantly save links, posts, photos—no manual organizing required.",
  },
  {
    icon: Sparkles,
    title: "AI-Powered Summaries",
    description: "Let our AI enrich everything you save with context and insights.",
  },
  {
    icon: Lock,
    title: "Private & Public Modes",
    description: "Choose what's just for you, or curate collections to share.",
  },
  {
    icon: Share2,
    title: "Shareable Collections",
    description: "Build and share your favorite finds in one click.",
  },
  {
    icon: Tag,
    title: "Smart Tags",
    description: "Powerful search capabilities keep your content organized.",
  },
  {
    icon: Bell,
    title: "Reminders",
    description: "Timely nudges keep your digital memory fresh.",
  },
];

const Features = () => {
  return (
    <section id="features" className="py-24 relative">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16 animate-fade-in-up">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Everything You Need to{" "}
            <span className="bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
              Stay Organized
            </span>
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Powerful features designed to make personal knowledge management effortless
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card
                key={index}
                className="group p-6 bg-slate-800/50 border-slate-700/50 hover:border-blue-500/50 transition-all duration-300 hover:-translate-y-1"
              >
                <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center mb-4 group-hover:bg-blue-500/20 transition-colors">
                  <Icon className="w-6 h-6 text-blue-400" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-gray-400">{feature.description}</p>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Features;
