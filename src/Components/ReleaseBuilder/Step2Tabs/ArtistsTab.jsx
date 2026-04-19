import React from "react";
import { FaPlus, FaTrash, FaCopy, FaUserCircle } from "react-icons/fa";

const ArtistsTab = ({ track, onUpdate, onApplyToAll }) => {
  // Helper to ensure we are always mapping over an array of objects
  const parseArtistData = (data) => {
    if (Array.isArray(data)) return data;
    if (typeof data === "string" && data.trim() !== "") {
      return data.split(",").map((name) => ({
        name: name.trim(),
        user: null,
      }));
    }
    return [];
  };

  const primaries = parseArtistData(track.primaryArtists);
  const featured = parseArtistData(track.featuredArtists);

  const updateList = (field, index, value) => {
    const currentList = parseArtistData(track[field]);
    const newList = [...currentList];
    newList[index] = { ...newList[index], name: value };

    // Convert back to string for the parent state/backend
    const stringValue = newList.map((a) => a.name).join(", ");
    onUpdate(field, stringValue);
  };

  const addArtist = (field) => {
    const currentList = parseArtistData(track[field]);
    const newList = [...currentList, { name: "", user: null }];

    const stringValue = newList.map((a) => a.name).join(", ");
    onUpdate(field, stringValue);
  };

  const removeArtist = (field, index) => {
    const currentList = parseArtistData(track[field]);
    const newList = currentList.filter((_, i) => i !== index);

    const stringValue = newList.map((a) => a.name).join(", ");
    onUpdate(field, stringValue);
  };

  return (
    <div className="space-y-8">
      {/* Primary Artists */}
      <section className="space-y-4">
        <div className="flex justify-between items-center border-b border-[#B6B09F]/10 pb-2">
          <h4 className="text-[10px] text-[#B6B09F] uppercase tracking-[0.2em] font-bold">
            Primary Artists
          </h4>
          <button
            onClick={() => onApplyToAll("primaryArtists")}
            className="text-[9px] text-[#B6B09F]/40 hover:text-[#EAE4D5] flex items-center gap-2 uppercase tracking-widest transition-all"
          >
            <FaCopy size={10} /> Sync Primaries
          </button>
        </div>

        {primaries.length === 0 && (
          <p className="text-[10px] text-[#B6B09F]/30 italic">
            No primary artists added.
          </p>
        )}

        {primaries.map((artist, idx) => (
          <div
            key={`pri-${idx}`}
            className="flex items-center gap-4 group animate-in fade-in slide-in-from-top-1"
          >
            <FaUserCircle className="text-[#B6B09F]/20 group-hover:text-[#EAE4D5]/40 transition-colors" />
            <input
              value={artist.name}
              onChange={(e) =>
                updateList("primaryArtists", idx, e.target.value)
              }
              placeholder="Stage Name"
              className="flex-1 bg-transparent border-b border-[#B6B09F]/10 py-2 text-sm text-[#EAE4D5] focus:border-[#EAE4D5] outline-none transition-colors"
            />
            <button
              onClick={() => removeArtist("primaryArtists", idx)}
              className="text-red-500/20 hover:text-red-500 p-2 transition-colors"
            >
              <FaTrash size={12} />
            </button>
          </div>
        ))}

        <button
          onClick={() => addArtist("primaryArtists")}
          className="text-[10px] text-[#EAE4D5]/60 hover:text-[#EAE4D5] flex items-center gap-2 pt-2 transition-all"
        >
          <FaPlus size={8} /> Add Primary Artist
        </button>
      </section>

      {/* Featured Artists */}
      <section className="space-y-4">
        <div className="flex justify-between items-center border-b border-[#B6B09F]/10 pb-2">
          <h4 className="text-[10px] text-[#B6B09F] uppercase tracking-[0.2em] font-bold">
            Featured Artists
          </h4>
        </div>

        {featured.map((artist, idx) => (
          <div
            key={`feat-${idx}`}
            className="flex items-center gap-4 animate-in fade-in slide-in-from-top-1"
          >
            <input
              value={artist.name}
              onChange={(e) =>
                updateList("featuredArtists", idx, e.target.value)
              }
              placeholder="e.g. Burna Boy"
              className="flex-1 bg-transparent border-b border-[#B6B09F]/10 py-2 text-sm text-[#EAE4D5] focus:border-[#EAE4D5] outline-none transition-colors"
            />
            <button
              onClick={() => removeArtist("featuredArtists", idx)}
              className="text-red-500/20 hover:text-red-500 p-2 transition-colors"
            >
              <FaTrash size={12} />
            </button>
          </div>
        ))}

        <button
          onClick={() => addArtist("featuredArtists")}
          className="text-[10px] text-[#EAE4D5]/60 hover:text-[#EAE4D5] flex items-center gap-2 pt-2 transition-all"
        >
          <FaPlus size={8} /> Add Featured Artist
        </button>
      </section>
    </div>
  );
};

export default ArtistsTab;
