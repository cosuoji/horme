import { useEffect, useState } from "react";
import axios from "../../lib/axios";
import { toast } from "react-hot-toast";

const ReleaseApprovalQueue = () => {
  const [releases, setReleases] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchReleases = async () => {
    try {
      const res = await axios.get("/api/admin/releases");
      setReleases(res.data);
    } catch (error) {
      toast.error("Failed to load releases.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReleases();
  }, []);

  const handleAction = async (id, status) => {
    try {
      await axios.put(`/api/admin/releases/${id}`, { status });
      toast.success(`Release marked as ${status}`);
      setReleases((prev) => prev.filter((r) => r._id !== id));
    } catch (error) {
      toast.error("Failed to update release.");
    }
  };

  if (loading) return <div className="text-[#B6B09F]">Loading releases...</div>;

  return (
    <div>
      <h1 className="text-3xl font-bold mb-2">Release Queue</h1>
      <p className="text-[#B6B09F] mb-6">
        Review artwork, metadata, and audio before approval.
      </p>

      {releases.length === 0 ? (
        <div className="p-6 bg-[#050505] border border-[#B6B09F]/10 rounded-xl text-center text-[#B6B09F]/60">
          No pending releases to review.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {releases.map((release) => (
            <div
              key={release._id}
              className="bg-[#050505] border border-[#B6B09F]/10 rounded-xl p-6 flex flex-col justify-between"
            >
              <div className="flex gap-4">
                <div className="w-20 h-20 bg-[#B6B09F]/10 rounded-lg flex-shrink-0 overflow-hidden">
                  {release.artwork ? (
                    <img
                      src={release.artwork}
                      alt="Cover"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xs text-[#B6B09F]">
                      No Art
                    </div>
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[#EAE4D5]">
                    {release.title}
                  </h3>
                  <p className="text-sm text-[#B6B09F]">
                    {release?.primaryArtist?.stageName || "Unknown Artist"}
                  </p>
                  <p className="text-xs text-[#B6B09F]/60 mt-1">
                    UPC: {release.upc || "Unassigned"}
                  </p>
                </div>
              </div>

              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => handleAction(release._id, "distributed")}
                  className="flex-grow py-2 bg-[#EAE4D5] text-[#0a0a0a] font-bold rounded-lg hover:bg-opacity-90 transition-colors text-sm"
                >
                  Approve
                </button>
                <button
                  onClick={() => handleAction(release._id, "rejected")}
                  className="flex-grow py-2 border border-red-500/50 text-red-500 rounded-lg hover:bg-red-500/10 transition-colors text-sm"
                >
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ReleaseApprovalQueue;
