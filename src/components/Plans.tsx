import { Check, Rocket, Wrench, Building2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

export const Plans = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleUpgrade = (plan: string) => {
    if (plan === 'enterprise') {
      toast({
        title: "Contact request sent",
        description: "Our team will contact you shortly.",
      });
    } else {
      toast({
        title: "Upgrade initiated",
        description: `Upgrading to ${plan} plan...`,
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#1A1F2C] text-white p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-12">
          <h1 className="text-3xl font-bold mb-2">Plans & Billing</h1>
          <p className="text-gray-400">Choose the perfect plan for your needs</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Starter Plan */}
          <div className="bg-[#222531] rounded-xl p-6 flex flex-col">
            <div className="flex items-center gap-2 mb-4">
              <Wrench className="h-5 w-5" />
              <h2 className="text-xl font-semibold">STARTER</h2>
            </div>
            <div className="mb-6">
              <span className="text-3xl font-bold">$20</span>
              <span className="text-gray-400"> / month</span>
            </div>
            <p className="text-gray-400 mb-6">Perfect for hobby and occasional use:</p>
            <ul className="space-y-4 mb-8 flex-grow">
              <li className="flex items-center gap-2">
                <Check className="h-5 w-5 text-green-500" />
                <span>Everything in Free, plus:</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-5 w-5 text-green-500" />
                <span>Go beyond daily limits with a monthly limit</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-5 w-5 text-green-500" />
                <span>Unlimited private projects</span>
              </li>
            </ul>
            <button
              onClick={() => handleUpgrade('starter')}
              className="w-full py-2 px-4 bg-white text-black rounded-lg hover:bg-gray-100 transition-colors"
            >
              Upgrade to Starter
            </button>
          </div>

          {/* Launch Plan */}
          <div className="bg-[#222531] rounded-xl p-6 flex flex-col">
            <div className="flex items-center gap-2 mb-4">
              <Rocket className="h-5 w-5" />
              <h2 className="text-xl font-semibold">LAUNCH</h2>
            </div>
            <div className="mb-6">
              <span className="text-3xl font-bold">$50</span>
              <span className="text-gray-400"> / month</span>
            </div>
            <p className="text-gray-400 mb-6">For individuals working on small projects:</p>
            <ul className="space-y-4 mb-8 flex-grow">
              <li className="flex items-center gap-2">
                <Check className="h-5 w-5 text-green-500" />
                <span>Everything in Starter, plus:</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-5 w-5 text-green-500" />
                <span>2.5x monthly limits</span>
              </li>
            </ul>
            <button
              onClick={() => handleUpgrade('launch')}
              className="w-full py-2 px-4 bg-white text-black rounded-lg hover:bg-gray-100 transition-colors"
            >
              Upgrade to Launch
            </button>
          </div>

          {/* Scale1 Plan */}
          <div className="bg-[#222531] rounded-xl p-6 flex flex-col">
            <div className="flex items-center gap-2 mb-4">
              <Building2 className="h-5 w-5" />
              <h2 className="text-xl font-semibold">SCALE1</h2>
            </div>
            <div className="mb-6">
              <span className="text-3xl font-bold">$100</span>
              <span className="text-gray-400"> / month</span>
            </div>
            <p className="text-gray-400 mb-6">For individuals working on larger projects:</p>
            <ul className="space-y-4 mb-8 flex-grow">
              <li className="flex items-center gap-2">
                <Check className="h-5 w-5 text-green-500" />
                <span>Everything in Launch, plus:</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-5 w-5 text-green-500" />
                <span>Larger message limits</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-5 w-5 text-green-500" />
                <span>Early access to new features</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-5 w-5 text-green-500" />
                <span>VIP events</span>
              </li>
            </ul>
            <button
              onClick={() => handleUpgrade('scale1')}
              className="w-full py-2 px-4 bg-white text-black rounded-lg hover:bg-gray-100 transition-colors"
            >
              Upgrade to Scale 1
            </button>
          </div>

          {/* Enterprise Plan */}
          <div className="bg-[#222531] rounded-xl p-6 flex flex-col">
            <div className="flex items-center gap-2 mb-4">
              <Building2 className="h-5 w-5" />
              <h2 className="text-xl font-semibold">ENTERPRISE</h2>
            </div>
            <div className="mb-6">
              <span className="text-gray-400">Contact us for:</span>
            </div>
            <ul className="space-y-4 mb-8 flex-grow">
              <li className="flex items-center gap-2">
                <Check className="h-5 w-5 text-green-500" />
                <span>Custom messaging limits</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-5 w-5 text-green-500" />
                <span>A dedicated product specialist</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-5 w-5 text-green-500" />
                <span>Custom integrations</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-5 w-5 text-green-500" />
                <span>Dedicated support & account management</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-5 w-5 text-green-500" />
                <span>Expert architecture & debugging support</span>
              </li>
            </ul>
            <button
              onClick={() => handleUpgrade('enterprise')}
              className="w-full py-2 px-4 bg-white text-black rounded-lg hover:bg-gray-100 transition-colors"
            >
              Contact us
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};