import { useState } from "react";
import { useUserStore } from "../../store/useUserStore";
import { FaWallet, FaShieldAlt, FaArrowUp } from "react-icons/fa";
import { toast } from "react-hot-toast";

const WalletPage = () => {
  const { user, loading, verifyBvn } = useUserStore();
  const [showBvnModal, setShowBvnModal] = useState(false);
  const [bvnValue, setBvnValue] = useState("");

  const balance = user?.walletBalance || 0;
  const isBvnVerified = user?.bvnStatus === "verified";

  const handleBvnSubmit = async () => {
    // Basic frontend validation before hitting the backend
    if (bvnValue.length !== 11 || !/^\d+$/.test(bvnValue)) {
      return toast.error("BVN must be exactly 11 digits");
    }

    const success = await verifyBvn(bvnValue);
    if (success) {
      setShowBvnModal(false);
      setBvnValue("");
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#EAE4D5]">Wallet & Payouts</h1>
        <p className="text-[#B6B09F] mt-1">
          Manage your earnings and withdraw to your bank account.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Balance Card */}
        <div className="lg:col-span-2 bg-[#0a0a0a] border border-[#B6B09F]/10 p-8 rounded-xl flex flex-col justify-between h-[220px]">
          <div>
            <p className="text-[#B6B09F] text-sm uppercase tracking-wider font-medium">
              Available Balance
            </p>
            <h2 className="text-5xl font-bold text-[#EAE4D5] mt-2">
              ₦{balance.toLocaleString()}
            </h2>
          </div>

          <div className="flex gap-4">
            <button
              disabled={!isBvnVerified || balance <= 0}
              className="flex items-center gap-2 px-6 py-3 bg-[#EAE4D5] text-[#0a0a0a] font-bold rounded-lg hover:bg-opacity-90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <FaArrowUp /> Withdraw
            </button>

            {!isBvnVerified && (
              <button
                onClick={() => setShowBvnModal(true)}
                className="flex items-center gap-2 px-6 py-3 border border-[#B6B09F]/40 text-[#EAE4D5] font-bold rounded-lg hover:border-[#EAE4D5] transition-colors"
              >
                <FaShieldAlt /> Verify BVN
              </button>
            )}
          </div>
        </div>

        {/* Account Security / BVN Status Card */}
        <div className="bg-[#050505] border border-[#B6B09F]/10 p-6 rounded-xl">
          <h3 className="text-lg font-bold text-[#EAE4D5] mb-4">
            Payout Security
          </h3>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-[#B6B09F]">Identity Verification</span>
              {isBvnVerified ? (
                <span className="text-green-400 text-sm font-bold bg-green-500/10 px-2 py-1 rounded">
                  VERIFIED
                </span>
              ) : (
                <span className="text-yellow-400 text-sm font-bold bg-yellow-500/10 px-2 py-1 rounded">
                  PENDING
                </span>
              )}
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[#B6B09F]">Account Type</span>
              <span className="text-[#EAE4D5] font-medium">Artist</span>
            </div>
          </div>

          {!isBvnVerified && (
            <div className="mt-6 p-4 bg-[#B6B09F]/5 border border-[#B6B09F]/10 rounded-lg text-sm">
              <p className="text-[#B6B09F]">
                To comply with regulatory requirements in Nigeria, you must link
                your BVN before initiating any withdrawals.
              </p>
            </div>
          )}
        </div>

        {/* Transaction History (Placeholder) */}
        <div className="lg:col-span-3 bg-[#0a0a0a] border border-[#B6B09F]/10 p-6 rounded-xl">
          <h3 className="text-lg font-bold text-[#EAE4D5] mb-4">
            Recent Transactions
          </h3>
          <div className="text-center py-8 text-[#B6B09F]/60">
            <FaWallet className="text-3xl mx-auto mb-3" />
            <p>No transaction history to show yet.</p>
          </div>
        </div>
      </div>

      {/* BVN Modal */}
      {showBvnModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="bg-[#0a0a0a] border border-[#B6B09F]/20 p-8 rounded-xl max-w-md w-full mx-4">
            <h2 className="text-2xl font-bold text-[#EAE4D5] mb-2">
              Verify Identity
            </h2>
            <p className="text-[#B6B09F] mb-6 text-sm">
              Input your 11-digit BVN. This does not give us access to your
              accounts, it only verifies your legal identity.
            </p>

            <input
              type="text"
              maxLength={11}
              value={bvnValue}
              onChange={(e) => setBvnValue(e.target.value.replace(/\D/g, ""))} // Only allow numbers
              disabled={loading}
              className="w-full px-4 py-3 bg-transparent border border-[#B6B09F]/40 rounded-lg text-[#EAE4D5] focus:border-[#EAE4D5] outline-none transition-colors mb-6 text-center text-xl tracking-widest disabled:opacity-50"
              placeholder="12345678901"
            />

            <div className="flex gap-4">
              <button
                onClick={handleBvnSubmit}
                disabled={loading || bvnValue.length !== 11}
                className="flex-grow py-3 bg-[#EAE4D5] text-[#0a0a0a] font-bold rounded-lg hover:bg-opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Verifying..." : "Verify"}
              </button>
              <button
                onClick={() => {
                  setShowBvnModal(false);
                  setBvnValue("");
                }}
                className="px-6 py-3 border border-[#B6B09F]/40 text-[#EAE4D5] rounded-lg hover:border-red-400 transition-colors"
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

export default WalletPage;
