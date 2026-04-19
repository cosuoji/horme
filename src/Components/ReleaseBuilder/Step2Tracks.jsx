import React, { useState } from "react";
import { motion, Reorder } from "framer-motion";
import {
  FaMusic,
  FaBars,
  FaTrash,
  FaArrowLeft,
  FaArrowRight,
  FaSave,
  FaPlus,
} from "react-icons/fa";
import axios from "../../lib/axios";
import { toast } from "react-hot-toast";
import ArtistsTab from "./Step2Tabs/ArtistsTab";
import WritersTab from "./Step2Tabs/WritersTab";
import CreditsTab from "./Step2Tabs/CreditsTab";
import SplitsTab from "./Step2Tabs/SplitsTab";

const Step2Tracks = ({
  data,
  setData,
  onNext,
  onBack,
  onSave,
  isSubmitting,
}) => {
  const [uploadProgress, setUploadProgress] = useState({});
  const [editingTrackIndex, setEditingTrackIndex] = useState(null);
  const [activeTab, setActiveTab] = useState("artists"); // "artists", "writers", "credits", "splits"

  const uploadTrackAudio = async (trackId, file) => {
    try {
      // 1. GET THE PRESIGNED URL (Send JSON, not FormData)
      const { data: uploadInfo } = await axios.post(
        "/api/releases/get-presigned-url",
        {
          fileName: file.name,
          fileType: file.type,
          releaseTitle: data.title || "untitled",
        },
      );

      const { uploadUrl, fileUrl, fileKey } = uploadInfo;

      // 2. UPLOAD DIRECTLY TO S3
      // Use the uploadUrl from the backend. Note: We use 'file.type' as a header.
      await axios.put(uploadUrl, file, {
        headers: { "Content-Type": file.type },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total,
          );
          setUploadProgress((prev) => ({
            ...prev,
            [trackId]: percentCompleted,
          }));
          // If you have a progress state, update it here
        },
      });

      setData((prev) => ({
        ...prev,
        tracks: prev.tracks.map((t) =>
          t.id === trackId ? { ...t, fileUrl, fileKey } : t,
        ),
      }));

      toast.success(`${file.name} uploaded successfully!`);
    } catch (err) {
      console.error("Upload error:", err);
      toast.error(`Failed to upload ${file.name}`);
    }
  };

  // Handle file uploads and create track objects

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);

    const newTracks = files.map((file, index) => {
      // 1. Generate a UNIQUE ID for EACH track inside the loop
      const trackId = `track-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      // 2. Initialize progress for this specific ID
      setUploadProgress((prev) => ({ ...prev, [trackId]: 0 }));

      return {
        id: trackId, // Unique to this specific file
        title: file.name.replace(/\.[^/.]+$/, ""),
        trackNumber: data.tracks.length + index + 1,
        file: file,
        isrc: "",
        explicit: false,
        primaryArtists: Array.isArray(data.primaryArtists)
          ? data.primaryArtists
          : [{ name: data.primaryArtists || "Primary Artist", user: null }],
        featuredArtists: [],
        writers: [],
        additionalCredits: [],
        splits: [
          {
            name: data.primaryArtists?.[0]?.name || "Primary Artist",
            role: "Primary",
            percentage: 100,
          },
        ],
      };
    });

    // Update state with the array of unique tracks
    setData((prev) => ({
      ...prev,
      tracks: [...prev.tracks, ...newTracks],
    }));

    // Trigger individual uploads
    newTracks.forEach((track) => {
      uploadTrackAudio(track.id, track.file);
    });
  };

  // Update specific track fields

  const updateTrack = (index, field, value) => {
    setData((prev) => {
      const updatedTracks = [...prev.tracks];
      const currentTrack = { ...updatedTracks[index], [field]: value };

      // Function to turn "Artist A, Artist B" into ["Artist A", "Artist B"]
      const parseArtistString = (str) =>
        str
          .split(",")
          .map((s) => s.trim())
          .filter((s) => s !== "");

      if (field === "primaryArtists" || field === "featuredArtists") {
        const primaryList = parseArtistString(
          currentTrack.primaryArtists || "",
        );
        const featuredList = parseArtistString(
          currentTrack.featuredArtists || "",
        );

        // 1. Map Primary Artists to Splits
        const primarySplits = primaryList.map((name, i) => {
          const existing = currentTrack.splits?.find(
            (s) => s.name === name && s.role === "Primary",
          );
          return {
            name,
            role: "Primary",
            // Split 100% equally among primaries by default (e.g., 50/50 if there are two)
            percentage: existing
              ? existing.percentage
              : Math.floor(100 / primaryList.length),
          };
        });

        // 2. Map Featured Artists to Splits
        const featuredSplits = featuredList.map((name) => {
          const existing = currentTrack.splits?.find(
            (s) => s.name === name && s.role === "Featured",
          );
          return {
            name,
            role: "Featured",
            percentage: existing ? existing.percentage : 0,
          };
        });

        // 3. Combine them
        currentTrack.splits = [...primarySplits, ...featuredSplits];
      }

      updatedTracks[index] = currentTrack;
      return { ...prev, tracks: updatedTracks };
    });
  };

  const updateTrackMetadata = (field, newValue) => {
    setData((prev) => {
      const updatedTracks = [...prev.tracks];
      updatedTracks[editingTrackIndex] = {
        ...updatedTracks[editingTrackIndex],
        [field]: newValue,
      };
      return { ...prev, tracks: updatedTracks };
    });
  };

  // Remove a track
  const removeTrack = (trackId) => {
    setData((prev) => ({
      ...prev,
      tracks: prev.tracks.filter((t) => t.id !== trackId),
    }));
  };

  const isAnyTrackUploading = Object.values(uploadProgress).some(
    (p) => p > 0 && p < 100,
  );

  const applyToAllTracks = (field) => {
    const valueToCopy = data.tracks[editingTrackIndex][field];

    // Ensure we deep copy the array so tracks don't share the same reference
    const clonedValue = JSON.parse(JSON.stringify(valueToCopy));

    setData((prev) => ({
      ...prev,
      tracks: prev.tracks.map((t) => ({
        ...t,
        [field]: clonedValue,
      })),
    }));
  };

  // Helper to close and reset
  const closeMetadataModal = () => {
    setEditingTrackIndex(null);
    setActiveTab("artists");
  };

  const applyCreditsToAll = () => {
    const currentCredits = data.tracks[editingTrackIndex].additionalCredits;

    // Clone to avoid reference issues
    const clonedCredits = JSON.parse(JSON.stringify(currentCredits));

    setData((prev) => ({
      ...prev,
      tracks: prev.tracks.map((track) => ({
        ...track,
        additionalCredits: clonedCredits,
      })),
    }));

    toast.success("Credits synced across all tracks");
  };

  const addCredit = () => {
    const updatedTracks = [...data.tracks];
    updatedTracks[editingTrackIndex].additionalCredits.push({
      name: "",
      role: "",
    });
    setData({ ...data, tracks: updatedTracks });
  };

  const removeCredit = (creditIndex) => {
    const updatedTracks = [...data.tracks];
    updatedTracks[editingTrackIndex].additionalCredits.splice(creditIndex, 1);
    setData({ ...data, tracks: updatedTracks });
  };

  // Styles inherited from Step 1
  const inputStyle =
    "w-full bg-transparent border-b border-[#B6B09F]/20 focus:border-[#EAE4D5] outline-none text-[#EAE4D5] text-sm py-2 transition-colors placeholder-[#B6B09F]/30";
  const labelStyle =
    "text-[10px] text-[#B6B09F] uppercase tracking-[0.2em] font-bold mb-1 block opacity-70";
  const sectionCard = "p-6 bg-[#050505] border border-[#B6B09F]/10 rounded-xl";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-8"
    >
      {/* UPLOAD ZONE */}
      <section className={sectionCard}>
        <div className="flex items-center justify-between border-b border-[#B6B09F]/10 pb-4 mb-6">
          <h2 className="text-xl font-serif text-[#EAE4D5]">Upload Audio</h2>
          <span className="text-[10px] text-[#B6B09F]/50 uppercase tracking-widest">
            Step 2.1
          </span>
        </div>

        <div className="relative border-2 border-dashed border-[#B6B09F]/20 rounded-xl p-12 text-center hover:border-[#EAE4D5]/40 transition-all group bg-[#0a0a0a]/50">
          <input
            type="file"
            multiple
            accept="audio/wav, audio/mpeg, audio/mp3"
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            onChange={handleFileUpload}
          />
          <div className="space-y-4">
            <div className="w-16 h-16 bg-[#B6B09F]/5 rounded-full flex items-center justify-center mx-auto group-hover:scale-110 transition-transform duration-500">
              <FaMusic className="text-2xl text-[#B6B09F]/40 group-hover:text-[#EAE4D5]" />
            </div>
            <div>
              <p className="text-[#EAE4D5] font-medium tracking-wide">
                Drag & drop master files
              </p>
              <p className="text-[#B6B09F]/50 text-xs mt-2 uppercase tracking-widest">
                WAV (Preferred) or MP3 • Max 200MB
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* TRACKLIST */}
      <section className={sectionCard}>
        <div className="flex justify-between items-center mb-6 border-b border-[#B6B09F]/10 pb-4">
          <h2 className="text-xl font-serif text-[#EAE4D5]">Tracklist</h2>
          <span className="text-[10px] text-[#B6B09F] uppercase tracking-[0.2em] bg-[#B6B09F]/5 px-3 py-1 rounded-full border border-[#B6B09F]/10">
            {data.tracks.length} {data.tracks.length === 1 ? "Track" : "Tracks"}
          </span>
        </div>

        {data.tracks.length === 0 ? (
          <div className="text-center py-20 border border-[#B6B09F]/5 rounded-xl bg-[#0a0a0a]/30">
            <p className="text-[#B6B09F]/30 text-xs uppercase tracking-[0.3em]">
              No tracks staged for release
            </p>
          </div>
        ) : (
          <Reorder.Group
            axis="y"
            values={data.tracks}
            onReorder={(newOrder) =>
              setData((prev) => ({ ...prev, tracks: newOrder }))
            }
            className="space-y-4"
          >
            {data.tracks.map((track, index) => (
              <Reorder.Item
                key={track.id}
                value={track}
                className="bg-[#0a0a0a] border border-[#B6B09F]/10 rounded-xl p-4 relative group hover:border-[#B6B09F]/30 transition-all"
              >
                <div className="flex items-center gap-6">
                  {/* Drag & Number */}
                  <div className="flex items-center gap-4">
                    <div className="cursor-grab active:cursor-grabbing text-[#B6B09F]/20 hover:text-[#EAE4D5]">
                      <FaBars size={14} />
                    </div>
                    <span className="text-[10px] font-black text-[#B6B09F]/20 w-4">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                  </div>

                  {/* Title & Progress */}
                  <div className="flex-1 flex items-center justify-between">
                    <div>
                      <h3 className="text-[#EAE4D5] text-sm font-medium tracking-wide">
                        {track.title || "Untitled Track"}
                      </h3>
                      {uploadProgress[track.id] < 100 && (
                        <div className="w-32 h-1 bg-[#B6B09F]/10 rounded-full mt-2 overflow-hidden">
                          <div
                            className="h-full bg-[#EAE4D5] transition-all duration-300"
                            style={{ width: `${uploadProgress[track.id]}%` }}
                          />
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-4">
                      <button
                        onClick={() => setEditingTrackIndex(index)} // We'll define this state
                        className="px-4 py-2 border border-[#B6B09F]/20 rounded-full text-[9px] uppercase tracking-[0.2em] text-[#B6B09F] hover:text-[#EAE4D5] hover:border-[#EAE4D5] transition-all"
                      >
                        Edit Track Info
                      </button>

                      <button
                        onClick={() => removeTrack(track.id)}
                        className="p-2 text-red-500/20 hover:text-red-500 transition-colors"
                      >
                        <FaTrash size={12} />
                      </button>
                    </div>
                  </div>
                </div>
              </Reorder.Item>
            ))}
          </Reorder.Group>
        )}
      </section>

      {/* NAVIGATION ACTIONS */}
      <footer className="flex flex-col md:flex-row justify-between items-center gap-6 pt-10 border-t border-[#B6B09F]/10">
        <button
          onClick={onBack}
          className="flex items-center gap-3 text-[#B6B09F] hover:text-[#EAE4D5] text-[10px] font-bold uppercase tracking-[0.3em] transition-all"
        >
          <FaArrowLeft className="text-xs" /> Back to Details
        </button>

        <div className="flex items-center gap-4 w-full md:w-auto">
          <button
            onClick={onSave}
            disabled={isSubmitting || data.tracks.length === 0}
            className="flex-1 md:flex-none px-6 py-4 border border-[#B6B09F]/20 text-[#B6B09F] text-[10px] font-bold uppercase tracking-[0.3em] rounded-full hover:bg-[#B6B09F]/5 transition-all disabled:opacity-20"
          >
            Save Draft
          </button>

          <button
            onClick={onNext}
            disabled={
              isSubmitting || data.tracks.length === 0 || isAnyTrackUploading
            }
            className="flex-1 md:flex-none px-12 py-4 bg-[#EAE4D5] text-[#0a0a0a] font-black text-xs uppercase tracking-[0.2em] rounded-full hover:bg-white hover:scale-105 active:scale-95 transition-all duration-300 flex items-center justify-center gap-3 shadow-xl disabled:opacity-20 disabled:grayscale"
          >
            {isAnyTrackUploading ? (
              <span className="flex items-center gap-2">
                Uploading Tracks...{" "}
                <div className="w-3 h-3 border-2 border-black/20 border-t-black rounded-full animate-spin" />
              </span>
            ) : (
              <>
                Review Release <FaArrowRight size={10} />
              </>
            )}
          </button>
        </div>
      </footer>

      {/* METADATA MODAL */}
      {editingTrackIndex !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onClick={closeMetadataModal}
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
          />

          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="relative bg-[#050505] border border-[#B6B09F]/20 rounded-2xl w-full max-w-4xl max-h-[85vh] flex flex-col overflow-hidden shadow-2xl"
          >
            {/* HEADER */}
            <header className="p-6 border-b border-[#B6B09F]/10 flex justify-between items-center bg-[#0a0a0a]">
              <div>
                <span className="text-[10px] text-[#B6B09F]/40 uppercase tracking-[0.3em] mb-1 block">
                  Track Metadata — {editingTrackIndex + 1} of{" "}
                  {data.tracks.length}
                </span>
                <h2 className="text-xl font-serif text-[#EAE4D5]">
                  {data.tracks[editingTrackIndex].title || "Untitled Track"}
                </h2>
              </div>
              <button
                onClick={closeMetadataModal}
                className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/5 text-[#B6B09F] transition-colors"
              >
                <FaPlus className="rotate-45" /> {/* Using FaPlus as an 'X' */}
              </button>
            </header>

            {/* TAB NAVIGATION */}
            <nav className="flex px-6 border-b border-[#B6B09F]/10 bg-[#0a0a0a] overflow-x-auto no-scrollbar">
              {["artists", "writers", "credits"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`py-4 px-6 text-[10px] uppercase tracking-[0.2em] font-bold border-b-2 transition-all whitespace-nowrap ${
                    activeTab === tab
                      ? "border-[#EAE4D5] text-[#EAE4D5]"
                      : "border-transparent text-[#B6B09F]/30 hover:text-[#B6B09F]"
                  }`}
                >
                  {tab === "artists" && "Artist Roles"}
                  {tab === "writers" && "Writer Roles"}
                  {tab === "credits" && "Additional Credits"}
                </button>
              ))}
            </nav>
            {/* DYNAMIC TAB CONTENT */}
            <div className="flex-1 overflow-y-auto p-8 bg-[#050505] custom-scrollbar">
              {activeTab === "artists" && (
                <ArtistsTab
                  track={data.tracks[editingTrackIndex]}
                  onUpdate={updateTrackMetadata}
                  onApplyToAll={applyToAllTracks}
                />
              )}

              {activeTab === "writers" && (
                <WritersTab
                  track={data.tracks[editingTrackIndex]}
                  onUpdate={updateTrackMetadata}
                  onApplyToAll={applyToAllTracks}
                />
              )}

              {activeTab === "credits" && (
                <CreditsTab
                  track={data.tracks[editingTrackIndex]}
                  onUpdate={updateTrackMetadata}
                  onApplyToAll={applyToAllTracks}
                />
              )}
            </div>

            {/* FOOTER */}
            <footer className="p-6 border-t border-[#B6B09F]/10 bg-[#0a0a0a] flex justify-end">
              <button
                onClick={closeMetadataModal}
                className="px-8 py-3 bg-[#EAE4D5] text-black text-[10px] font-black uppercase tracking-widest rounded-full hover:scale-105 active:scale-95 transition-all"
              >
                Confirm Details
              </button>
            </footer>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
};

export default Step2Tracks;
