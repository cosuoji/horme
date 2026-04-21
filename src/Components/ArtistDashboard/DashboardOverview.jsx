import { useUserStore } from "../../store/useUserStore";
import { FaMusic, FaEye, FaWallet } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "../../lib/axios";
const DashboardOverview = () => {
  const { user } = useUserStore();
  const navigate = useNavigate();

  const [releases, setReleases] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchReleases = async () => {
      try {
        // Assuming your axios instance is configured to pass the auth token
        // e.g., headers: { Authorization: `Bearer ${user.token}` }
        const { data } = await axios.get("/api/releases");
        setReleases(data);
      } catch (error) {
        console.error("Failed to fetch dashboard releases", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchReleases();
  }, []);

  const stats = [
    {
      name: "Total Streams",
      value: "0", // Update this when you have stream tracking
      icon: <FaEye />,
      color: "text-blue-400",
    },
    {
      name: "Active Releases",
      value: isLoading ? "..." : releases.length.toString(),
      icon: <FaMusic />,
      color: "text-green-400",
    },
    {
      name: "Balance",
      value: "₦0.00", // Update this when you connect your wallet/revenue logic
      icon: <FaWallet />,
      color: "text-[#EAE4D5]",
    },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#EAE4D5]">
          Welcome back, {user?.stageName || "Artist"}
        </h1>
        <p className="text-[#B6B09F] mt-1">
          Here is a quick look at your catalog's performance.
        </p>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="bg-[#0a0a0a] border border-[#B6B09F]/10 p-6 rounded-xl hover:border-[#B6B09F]/30 transition-colors"
          >
            <div className="flex justify-between items-center mb-4">
              <span className="text-[#B6B09F] text-sm font-medium uppercase tracking-wider">
                {stat.name}
              </span>
              <span className={`${stat.color} text-xl`}>{stat.icon}</span>
            </div>
            <p className="text-3xl font-bold text-[#EAE4D5]">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Conditional Rendering: Only show Empty State if no releases */}
      {!isLoading && releases.length === 0 && (
        <div className="bg-[#0a0a0a] border border-[#B6B09F]/10 p-10 rounded-xl text-center">
          <div className="max-w-md mx-auto">
            <FaMusic className="text-5xl text-[#B6B09F]/30 mx-auto mb-6" />
            <h2 className="text-xl font-bold text-[#EAE4D5] mb-2">
              Ready to distribute your music?
            </h2>
            <p className="text-[#B6B09F] mb-6">
              Submit your tracks to start appearing on global streaming
              platforms and tracking your royalties.
            </p>
            <button
              onClick={() => navigate("/dashboard/releases/new")}
              className="px-6 py-3 bg-[#EAE4D5] text-[#0a0a0a] font-bold rounded-lg hover:bg-opacity-90 transition-colors"
            >
              Upload Your First Release
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardOverview;
