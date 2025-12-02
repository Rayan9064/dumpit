import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { Check } from "lucide-react";
import Link from "../ui/Link";

const plans = [
  {
    name: "Free",
    price: "$0",
    description: "All the basics—forever, for everyone.",
    features: [
      "Unlimited saves",
      "Basic organization",
      "Mobile & desktop sync",
      "Public collections",
      "Community support",
    ],
    cta: "Get Started",
    popular: false,
  },
  {
    name: "Pro",
    price: "$4.99",
    period: "/month",
    description: "Unlimited storage, advanced sharing, and AI-powered features.",
    features: [
      "Everything in Free",
      "Unlimited storage",
      "AI summaries & tags",
      "Advanced search",
      "Priority support",
      "Custom branding",
    ],
    cta: "Upgrade to Pro",
    popular: true,
  },
];

const Pricing = () => {
  return (
    <section className="py-24 relative">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Simple,{" "}
            <span className="bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
              Transparent Pricing
            </span>
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Start for free, upgrade when you need more
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {plans.map((plan, index) => (
            <Card
              key={index}
              className={`relative p-8 bg-slate-800/50 border-slate-700/50 ${
                plan.popular ? "border-blue-500/50 shadow-lg shadow-blue-500/10" : ""
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="px-4 py-1 bg-blue-500 text-white text-sm font-medium rounded-full">
                    Most Popular
                  </span>
                </div>
              )}

              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-5xl font-bold text-white">{plan.price}</span>
                  {plan.period && <span className="text-gray-400">{plan.period}</span>}
                </div>
                <p className="text-gray-400 mt-2">{plan.description}</p>
              </div>

              <ul className="space-y-4 mb-8">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-center gap-3 text-gray-300">
                    <Check className="w-5 h-5 text-blue-400 flex-shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>

              <Link href="/dashboard" className="block">
                <Button
                  variant={plan.popular ? "hero" : "glass"}
                  size="lg"
                  className="w-full"
                >
                  {plan.cta}
                </Button>
              </Link>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Pricing;
