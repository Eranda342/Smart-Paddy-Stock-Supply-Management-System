import { Link, useNavigate } from "react-router-dom";
import { Sprout, User, Building2 } from "lucide-react";

export default function RoleSelectionPage() {

  const navigate = useNavigate();

  const handleRoleSelect = (role) => {

    // Clear previous registration data
    localStorage.removeItem("accountInfo");

    // Save selected role for registration steps
    localStorage.setItem("role", role);

    // Navigate to account information page
    navigate("/register/account");
  };

  return (
    <div className="min-h-screen bg-background">

      {/* HEADER */}
      <div className="flex items-center justify-between px-12 py-6 border-b border-border">

        <Link to="/" className="flex items-center gap-3">

          <div className="w-10 h-10 bg-[#22C55E] rounded-lg flex items-center justify-center">
            <Sprout className="w-6 h-6 text-[#0F1115]" />
          </div>

          <span className="text-2xl font-semibold">
            AgroBridge
          </span>

        </Link>

        <Link
          to="/"
          className="text-muted-foreground hover:text-foreground transition-colors"
        >
          Back to Home
        </Link>

      </div>


      {/* PROGRESS BAR */}
      <div className="max-w-2xl mx-auto mt-8 px-8">

        <div className="flex items-center justify-center gap-2 mb-2">

          <div className="w-8 h-8 bg-[#22C55E] text-[#0F1115] rounded-full flex items-center justify-center font-medium">
            1
          </div>

          <div className="w-20 h-1 bg-border"></div>

          <div className="w-8 h-8 bg-muted text-muted-foreground rounded-full flex items-center justify-center font-medium">
            2
          </div>

          <div className="w-20 h-1 bg-border"></div>

          <div className="w-8 h-8 bg-muted text-muted-foreground rounded-full flex items-center justify-center font-medium">
            3
          </div>

        </div>

        <p className="text-center text-sm text-muted-foreground">
          Step 1 of 3
        </p>

      </div>


      {/* CONTENT */}
      <div className="flex items-center justify-center px-12 py-16">

        <div className="w-full max-w-3xl">

          <div className="text-center mb-12">

            <h1 className="text-4xl font-semibold mb-3">
              How will you use AgroBridge?
            </h1>

            <p className="text-lg text-muted-foreground">
              Select your role to get started
            </p>

          </div>


          <div className="grid grid-cols-2 gap-6">

            {/* FARMER CARD */}
            <button
              onClick={() => handleRoleSelect("FARMER")}
              className="bg-card border-2 border-border hover:border-[#22C55E] rounded-2xl p-10 text-left transition-all duration-200 hover:shadow-lg group"
            >

              <div className="w-16 h-16 bg-[#22C55E]/10 group-hover:bg-[#22C55E]/20 rounded-xl flex items-center justify-center mb-6 transition-colors">
                <User className="w-8 h-8 text-[#22C55E]" />
              </div>

              <h2 className="text-2xl font-semibold mb-3">
                Farmer
              </h2>

              <p className="text-muted-foreground mb-4">
                List your paddy harvests, negotiate with rice mill owners,
                and manage your sales.
              </p>

              <ul className="space-y-2 text-sm text-muted-foreground">

                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-[#22C55E] rounded-full"></div>
                  Create and manage paddy listings
                </li>

                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-[#22C55E] rounded-full"></div>
                  Negotiate prices directly
                </li>

                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-[#22C55E] rounded-full"></div>
                  Track transactions and transport
                </li>

              </ul>

            </button>


            {/* MILL OWNER CARD */}
            <button
              onClick={() => handleRoleSelect("MILL_OWNER")}
              className="bg-card border-2 border-border hover:border-[#22C55E] rounded-2xl p-10 text-left transition-all duration-200 hover:shadow-lg group"
            >

              <div className="w-16 h-16 bg-[#22C55E]/10 group-hover:bg-[#22C55E]/20 rounded-xl flex items-center justify-center mb-6 transition-colors">
                <Building2 className="w-8 h-8 text-[#22C55E]" />
              </div>

              <h2 className="text-2xl font-semibold mb-3">
                Rice Mill Owner
              </h2>

              <p className="text-muted-foreground mb-4">
                Browse paddy listings, negotiate with farmers,
                and manage procurement logistics.
              </p>

              <ul className="space-y-2 text-sm text-muted-foreground">

                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-[#22C55E] rounded-full"></div>
                  Browse verified paddy listings
                </li>

                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-[#22C55E] rounded-full"></div>
                  Manage procurement & vehicles
                </li>

                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-[#22C55E] rounded-full"></div>
                  Coordinate transport logistics
                </li>

              </ul>

            </button>

          </div>

        </div>

      </div>

    </div>
  );
}