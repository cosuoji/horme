import { useEffect, useState } from "react";
import axios from "../../lib/axios";
import { toast } from "react-hot-toast";

const WithdrawalManager = () => {
  const [withdrawals, setWithdrawals] = useState([]);
  const [loading, setLoading] = useState(true);

  // State for the rejection modal
  const [selectedWithdrawal, setSelectedWithdrawal] = useState(null);
  const [notes, setNotes] = useState("");

  const fetchWithdrawals = async () => {
    try {
      const res = await axios.get("/api/admin/withdrawals");
      setWithdrawals(res.data);
    } catch (error) {
      toast.error("Failed to load withdrawals.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWithdrawals();
  }, []);

  const handleProcess = async (id, action, adminNotes = "") => {
    try {
      const res = await axios.put(`/api/admin/withdrawals/${id}`, {
        action,
        notes: adminNotes,
      });
      toast.success(res.data.message);
      // Remove the processed withdrawal from the UI list
      setWithdrawals((prev) => prev.filter((w) => w._id !== id));
      setSelectedWithdrawal(null);
      setNotes("");
    } catch (error) {
      toast.error(error.response?.data?.message || "Action failed");
    }
  };

  if (loading) return <div className="text-[#B6B09F]">Loading requests...</div>;

  return (
    <div>
      <h1 className="text-3xl font-bold mb-2">Withdrawal Requests</h1>
      <p className="text-[#B6B09F] mb-6">
        Review and process artist payout requests.
      </p>

      {withdrawals.length === 0 ? (
        <div className="p-6 bg-[#050505] border border-[#B6B09F]/10 rounded-xl text-center text-[#B6B09F]/60">
          No pending withdrawal requests.
        </div>
      ) : (
        <div className="bg-[#050505] border border-[#B6B09F]/10 rounded-xl overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-[#B6B09F]/5 text-[#EAE4D5] text-sm uppercase">
              <tr>
                <th className="px-6 py-4">Artist</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">Requested On</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#B6B09F]/10">
              {withdrawals.map((req) => (
                <tr key={req._id} className="text-[#EAE4D5] text-sm">
                  <td className="px-6 py-4">
                    <p className="font-bold">
                      {req.artistId?.stageName || "Unknown Artist"}
                    </p>
                    <p className="text-xs text-[#B6B09F]">
                      {req.artistId?.email}
                    </p>
                  </td>
                  <td className="px-6 py-4 font-mono font-bold">
                    {req.currency === "NGN" ? "₦" : "$"}
                    {req.amount.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-[#B6B09F]">
                    {new Date(req.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-right space-x-3">
                    <button
                      onClick={() => handleProcess(req._id, "approve")}
                      className="px-4 py-2 bg-green-500/10 text-green-400 rounded hover:bg-green-500/20 transition-colors"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => setSelectedWithdrawal(req)}
                      className="px-4 py-2 bg-red-500/10 text-red-400 rounded hover:bg-red-500/20 transition-colors"
                    >
                      Reject
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Rejection Modal */}
      {selectedWithdrawal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="bg-[#0a0a0a] border border-[#B6B09F]/20 p-8 rounded-xl max-w-md w-full mx-4">
            <h2 className="text-2xl font-bold text-[#EAE4D5] mb-2">
              Reject Withdrawal
            </h2>
            <p className="text-[#B6B09F] mb-4 text-sm">
              Are you sure you want to reject this payout of{" "}
              <span className="text-[#EAE4D5] font-bold">
                {selectedWithdrawal.currency === "NGN" ? "₦" : "$"}
                {selectedWithdrawal.amount.toLocaleString()}
              </span>
              ? The funds will be refunded to their wallet.
            </p>

            <label className="block text-[#EAE4D5] text-sm font-medium mb-2">
              Reason (Optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-4 py-3 bg-transparent border border-[#B6B09F]/40 rounded-lg text-[#EAE4D5] focus:border-[#EAE4D5] outline-none transition-colors mb-6 h-24 text-sm"
              placeholder="Invalid bank details, suspicious activity, etc."
            />

            <div className="flex gap-4">
              <button
                onClick={() =>
                  handleProcess(selectedWithdrawal._id, "reject", notes)
                }
                className="flex-grow py-3 bg-red-500 text-white font-bold rounded-lg hover:bg-red-600 transition-colors text-sm"
              >
                Confirm Reject
              </button>
              <button
                onClick={() => {
                  setSelectedWithdrawal(null);
                  setNotes("");
                }}
                className="px-6 py-3 border border-[#B6B09F]/40 text-[#EAE4D5] rounded-lg hover:border-[#EAE4D5] transition-colors text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WithdrawalManager;
