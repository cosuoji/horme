const AdminOverview = () => {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Platform Overview</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 bg-[#050505] border border-[#B6B09F]/20 rounded-xl">
          <p className="text-[#B6B09F] text-sm">Total Artists</p>
          <p className="text-4xl font-bold mt-2">0</p>
        </div>
        <div className="p-6 bg-[#050505] border border-[#B6B09F]/20 rounded-xl">
          <p className="text-[#B6B09F] text-sm">Pending Releases</p>
          <p className="text-4xl font-bold mt-2 text-yellow-500">0</p>
        </div>
        <div className="p-6 bg-[#050505] border border-[#B6B09F]/20 rounded-xl">
          <p className="text-[#B6B09F] text-sm">Pending Withdrawals</p>
          <p className="text-4xl font-bold mt-2 text-red-400">$0.00</p>
        </div>
      </div>
    </div>
  );
};
export default AdminOverview;
