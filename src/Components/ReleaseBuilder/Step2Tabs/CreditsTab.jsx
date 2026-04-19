import { FaPlus, FaTrash, FaCopy } from "react-icons/fa";

const CreditsTab = ({ track, onUpdate, onApplyToAll }) => {
  const credits = track.additionalCredits || [];

  const addRow = () =>
    onUpdate("additionalCredits", [...credits, { name: "", role: "" }]);

  const removeRow = (index) => {
    const filtered = credits.filter((_, i) => i !== index);
    onUpdate("additionalCredits", filtered);
  };

  const updateRow = (index, key, value) => {
    const updated = [...credits];
    updated[index][key] = value;
    onUpdate("additionalCredits", updated);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center border-b border-[#B6B09F]/10 pb-4">
        <p className="text-[10px] text-[#B6B09F]/50 uppercase tracking-widest">
          Studio & Engineering Credits
        </p>
        <button
          onClick={() => onApplyToAll("additionalCredits")}
          className="flex items-center gap-2 text-[9px] uppercase tracking-widest text-[#B6B09F] hover:text-[#EAE4D5] transition-colors"
        >
          <FaCopy size={10} /> Apply to All Tracks
        </button>
      </div>

      <div className="space-y-4">
        {credits.map((item, index) => (
          <div
            key={index}
            className="flex items-end gap-4 animate-in fade-in slide-in-from-top-1"
          >
            <div className="flex-1">
              <label className="text-[9px] text-[#B6B09F]/40 uppercase mb-2 block">
                Role
              </label>
              <input
                placeholder="e.g. Producer"
                value={item.role}
                onChange={(e) => updateRow(index, "role", e.target.value)}
                className="w-full bg-[#0a0a0a] border-b border-[#B6B09F]/20 py-2 text-sm text-[#EAE4D5] focus:border-[#EAE4D5] outline-none transition-colors"
              />
            </div>
            <div className="flex-1">
              <label className="text-[9px] text-[#B6B09F]/40 uppercase mb-2 block">
                Name
              </label>
              <input
                placeholder="Full Name"
                value={item.name}
                onChange={(e) => updateRow(index, "name", e.target.value)}
                className="w-full bg-[#0a0a0a] border-b border-[#B6B09F]/20 py-2 text-sm text-[#EAE4D5] focus:border-[#EAE4D5] outline-none transition-colors"
              />
            </div>
            <button
              onClick={() => removeRow(index)}
              className="p-2 text-red-500/30 hover:text-red-500 transition-colors mb-1"
            >
              <FaTrash size={12} />
            </button>
          </div>
        ))}
      </div>

      <button
        onClick={addRow}
        className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-[#EAE4D5] bg-[#B6B09F]/5 hover:bg-[#B6B09F]/10 px-4 py-3 rounded-lg transition-all border border-[#B6B09F]/10 w-full justify-center"
      >
        <FaPlus size={10} /> Add Contributor
      </button>
    </div>
  );
};

export default CreditsTab;
