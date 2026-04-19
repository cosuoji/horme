import React from "react";
import { FaPlus, FaTrash, FaCopy } from "react-icons/fa";

const WritersTab = ({ track, onUpdate, onApplyToAll }) => {
  const writers = track.writers || [];

  const addWriter = () => {
    onUpdate("writers", [...writers, { legalName: "", role: "Composer" }]);
  };

  const updateWriter = (index, key, value) => {
    const updated = [...writers];
    updated[index][key] = value;
    onUpdate("writers", updated);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center border-b border-[#B6B09F]/10 pb-4">
        <div className="space-y-1">
          <p className="text-[10px] text-[#B6B09F] uppercase tracking-widest font-bold">
            Writers & Publishers
          </p>
          <p className="text-[9px] text-[#B6B09F]/40 italic">
            Use legal names only for royalty collection.
          </p>
        </div>
        <button
          onClick={() => onApplyToAll("writers")}
          className="text-[9px] text-[#B6B09F]/40 hover:text-[#EAE4D5] flex items-center gap-2 uppercase tracking-widest"
        >
          <FaCopy size={10} /> Apply to All
        </button>
      </div>

      <div className="space-y-6">
        {writers.map((writer, idx) => (
          <div
            key={idx}
            className="flex flex-col md:flex-row gap-4 p-4 bg-[#B6B09F]/5 rounded-lg border border-[#B6B09F]/5 relative"
          >
            <div className="flex-1">
              <label className="text-[9px] text-[#B6B09F]/40 uppercase mb-1 block tracking-tighter">
                Legal Full Name
              </label>
              <input
                value={writer.legalName}
                onChange={(e) => updateWriter(idx, "legalName", e.target.value)}
                className="w-full bg-transparent border-b border-[#B6B09F]/20 py-2 text-sm text-[#EAE4D5] focus:border-[#EAE4D5] outline-none"
              />
            </div>
            <div className="w-full md:w-48">
              <label className="text-[9px] text-[#B6B09F]/40 uppercase mb-1 block">
                Role
              </label>
              <select
                value={writer.role}
                onChange={(e) => updateWriter(idx, "role", e.target.value)}
                className="w-full bg-[#0a0a0a] border-b border-[#B6B09F]/20 py-2 text-sm text-[#EAE4D5] outline-none appearance-none"
              >
                <option value="Composer">Composer</option>
                <option value="Lyricist">Lyricist</option>
              </select>
            </div>
            <button
              onClick={() =>
                onUpdate(
                  "writers",
                  writers.filter((_, i) => i !== idx),
                )
              }
              className="md:mt-4 text-red-500/40 hover:text-red-500"
            >
              <FaTrash size={12} />
            </button>
          </div>
        ))}
      </div>

      <button
        onClick={addWriter}
        className="w-full py-4 border border-dashed border-[#B6B09F]/20 text-[#B6B09F]/60 hover:text-[#EAE4D5] hover:border-[#EAE4D5]/40 transition-all rounded-xl text-[10px] uppercase tracking-widest flex items-center justify-center gap-2"
      >
        <FaPlus size={10} /> Add Writer
      </button>
    </div>
  );
};

export default WritersTab;
