import { Link } from "react-router-dom";
import { Sprout, ShieldCheck, MessageSquare, DollarSign, TruckIcon } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">

      {/* HERO SECTION */}
      <div className="relative h-screen overflow-hidden">

        {/* Background Image */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              "linear-gradient(rgba(15,17,21,0.7), rgba(15,17,21,0.7)), url('https://images.unsplash.com/photo-1658169139208-c8c49ac873ae?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1920')",
          }}
        />

        {/* NAVBAR */}
        <nav className="relative z-10 flex items-center justify-between px-[60px] py-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#22C55E] rounded-lg flex items-center justify-center">
              <Sprout className="w-6 h-6 text-[#0F1115]" />
            </div>
            <span className="text-2xl font-semibold text-white">AgroBridge</span>
          </div>

          <Link
            to="/login"
            className="px-6 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all duration-200"
          >
            Login
          </Link>
        </nav>

        {/* HERO CONTENT */}
        <div className="relative z-10 flex flex-col items-center justify-center h-[calc(100vh-88px)] text-center px-[60px]">

          <h1 className="text-6xl font-bold text-white mb-6 max-w-4xl">
            Digitizing Sri Lanka's Paddy Marketplace
          </h1>

          <p className="text-xl text-white/90 mb-10 max-w-2xl">
            Connecting Farmers and Rice Mill Owners through a secure, verified digital platform
          </p>

          <div className="flex gap-4">

            <Link
              to="/register/role"
              className="px-8 py-3 bg-[#22C55E] hover:bg-[#16A34A] text-[#0F1115] rounded-lg transition-all duration-200 shadow-lg"
            >
              Get Started
            </Link>

            <Link
              to="/login"
              className="px-8 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all duration-200 backdrop-blur-sm"
            >
              Login
            </Link>

          </div>
        </div>
      </div>

      {/* FEATURES SECTION */}
      <div className="max-w-[1320px] mx-auto px-[60px] py-20">

        <h2 className="text-4xl font-semibold text-center mb-16">
          Key Features
        </h2>

        <div className="grid grid-cols-4 gap-6">

          <div className="bg-card border border-border rounded-2xl p-6 hover:shadow-lg transition-shadow duration-200">
            <div className="w-12 h-12 bg-[#22C55E]/10 rounded-xl flex items-center justify-center mb-4">
              <ShieldCheck className="w-6 h-6 text-[#22C55E]" />
            </div>

            <h3 className="text-xl mb-3">Secure Verified Trading</h3>

            <p className="text-muted-foreground">
              Admin-verified accounts ensure trusted transactions between parties
            </p>
          </div>

          <div className="bg-card border border-border rounded-2xl p-6 hover:shadow-lg transition-shadow duration-200">
            <div className="w-12 h-12 bg-[#22C55E]/10 rounded-xl flex items-center justify-center mb-4">
              <MessageSquare className="w-6 h-6 text-[#22C55E]" />
            </div>

            <h3 className="text-xl mb-3">Direct Negotiation</h3>

            <p className="text-muted-foreground">
              Communicate directly with buyers and sellers for better deals
            </p>
          </div>

          <div className="bg-card border border-border rounded-2xl p-6 hover:shadow-lg transition-shadow duration-200">
            <div className="w-12 h-12 bg-[#22C55E]/10 rounded-xl flex items-center justify-center mb-4">
              <DollarSign className="w-6 h-6 text-[#22C55E]" />
            </div>

            <h3 className="text-xl mb-3">Transparent Pricing</h3>

            <p className="text-muted-foreground">
              Clear pricing structure with real-time market information
            </p>
          </div>

          <div className="bg-card border border-border rounded-2xl p-6 hover:shadow-lg transition-shadow duration-200">
            <div className="w-12 h-12 bg-[#22C55E]/10 rounded-xl flex items-center justify-center mb-4">
              <TruckIcon className="w-6 h-6 text-[#22C55E]" />
            </div>

            <h3 className="text-xl mb-3">Transport Coordination</h3>

            <p className="text-muted-foreground">
              Streamlined logistics and delivery management
            </p>
          </div>

        </div>
      </div>

      {/* HOW IT WORKS */}
      <div className="bg-muted py-20">

        <div className="max-w-[1320px] mx-auto px-[60px]">

          <h2 className="text-4xl font-semibold text-center mb-16">
            How It Works
          </h2>

          <div className="grid grid-cols-4 gap-8">

            {[
              {
                step: "01",
                title: "Register",
                desc: "Create your account as a Farmer or Rice Mill Owner",
              },
              {
                step: "02",
                title: "Get Verified",
                desc: "Submit required documents for admin verification",
              },
              {
                step: "03",
                title: "Trade Paddy",
                desc: "List or browse paddy harvests and negotiate prices",
              },
              {
                step: "04",
                title: "Arrange Transport",
                desc: "Coordinate delivery and complete the transaction",
              },
            ].map((item) => (
              <div key={item.step} className="text-center">

                <div className="w-16 h-16 bg-[#22C55E] rounded-full flex items-center justify-center text-2xl font-bold text-[#0F1115] mx-auto mb-4">
                  {item.step}
                </div>

                <h3 className="text-xl mb-2">{item.title}</h3>

                <p className="text-muted-foreground">{item.desc}</p>

              </div>
            ))}

          </div>
        </div>
      </div>

      {/* FOOTER */}
      <footer className="border-t border-border py-12">

        <div className="max-w-[1320px] mx-auto px-[60px]">

          <div className="flex justify-between items-center">

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#22C55E] rounded-lg flex items-center justify-center">
                <Sprout className="w-6 h-6 text-[#0F1115]" />
              </div>

              <span className="text-xl font-semibold">AgroBridge</span>
            </div>

            <div className="flex gap-8 text-muted-foreground">
              <a href="#" className="hover:text-foreground transition-colors">About</a>
              <a href="#" className="hover:text-foreground transition-colors">Contact</a>
              <a href="#" className="hover:text-foreground transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-foreground transition-colors">Terms</a>
            </div>

          </div>

          <div className="mt-8 text-center text-sm text-muted-foreground">
            © 2026 AgroBridge. All rights reserved.
          </div>

        </div>

      </footer>
    </div>
  );
}