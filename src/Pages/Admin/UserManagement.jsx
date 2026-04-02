import { useEffect, useState } from "react";
import axios from "../../lib/axios";
import { toast } from "react-hot-toast";

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      const res = await axios.get("/api/admin/users");
      setUsers(res.data);
    } catch (error) {
      toast.error("Failed to load users.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleManualVerify = async (id) => {
    try {
      await axios.put(`/api/admin/users/${id}/verify`, { status: "verified" });
      toast.success("User manually verified!");
      setUsers((prev) =>
        prev.map((u) =>
          u._id === id
            ? { ...u, verification: { ...u.verification, status: "verified" } }
            : u,
        ),
      );
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  if (loading) return <div className="text-[#B6B09F]">Loading users...</div>;

  return (
    <div>
      <h1 className="text-3xl font-bold mb-2">Artist Management</h1>
      <p className="text-[#B6B09F] mb-6">
        View, monitor, and manually verify platform users.
      </p>

      <div className="bg-[#050505] border border-[#B6B09F]/10 rounded-xl overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-[#B6B09F]/5 text-[#EAE4D5] text-sm uppercase">
            <tr>
              <th className="px-6 py-4">Stage Name</th>
              <th className="px-6 py-4">Legal Name</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#B6B09F]/10">
            {users.map((user) => {
              const status = user.verification?.status || "unverified";
              return (
                <tr key={user._id} className="text-[#EAE4D5] text-sm">
                  <td className="px-6 py-4">
                    <p className="font-bold">{user.stageName}</p>
                    <p className="text-xs text-[#B6B09F]">{user.email}</p>
                  </td>
                  <td className="px-6 py-4">{user.legalName}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`text-xs font-bold px-2 py-1 rounded ${
                        status === "verified"
                          ? "bg-green-500/10 text-green-400"
                          : status === "pending"
                            ? "bg-yellow-500/10 text-yellow-400"
                            : "bg-red-500/10 text-red-400"
                      }`}
                    >
                      {status.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    {status !== "verified" && (
                      <button
                        onClick={() => handleManualVerify(user._id)}
                        className="px-3 py-1.border border-[#B6B09F]/40 text-[#EAE4D5] text-xs rounded hover:border-[#EAE4D5] transition-colors"
                      >
                        Manually Verify
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserManagement;
