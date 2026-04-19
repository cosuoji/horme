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

const Step2Tracks = ({
  data,
  setData,
  onNext,
  onBack,
  onSave,
  isSubmitting,
}) => {
  const [uploadProgress, setUploadProgress] = useState({});
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

    const newTracks = files.map((file, index) => ({
      id: `track-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      title: file.name.replace(/\.[^/.]+$/, ""),
      trackNumber: data.tracks.length + index + 1,
      file: file,
      isrc: "",
      explicit: false,
      // CRITICAL: Explicitly pull from the current state
      primaryArtists: data.primaryArtists || "Primary Artist",
      featuredArtists: data.featuredArtists || "Featured Artist",
      splits: [
        {
          name: data.primaryArtists || "Primary Artist",
          role: "Primary",
          percentage: 100,
        },
      ],
    }));

    setData((prev) => ({
      ...prev,
      tracks: [...prev.tracks, ...newTracks],
    }));

    newTracks.forEach((track, i) => {
      uploadTrackAudio(track.id, files[i]);
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
                className="bg-[#0a0a0a] border border-[#B6B09F]/10 rounded-xl p-6 relative group"
              >
                <div className="flex items-start gap-6">
                  {/* Drag Handle & Number */}
                  {uploadProgress[track.id] && (
                    <span>{uploadProgress[track.id]}%</span>
                  )}
                  <div className="flex flex-col items-center gap-4 mt-2">
                    <div className="cursor-grab active:cursor-grabbing text-[#B6B09F]/20 hover:text-[#EAE4D5] transition-colors">
                      <FaBars />
                    </div>
                    <span className="text-[10px] font-black text-[#B6B09F]/20">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                  </div>

                  {/* Form Content */}
                  <div className="flex-1 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className={labelStyle}>Track Title</label>
                        <input
                          type="text"
                          value={track.title}
                          onChange={(e) =>
                            updateTrack(index, "title", e.target.value)
                          }
                          className={inputStyle}
                        />
                      </div>
                      <div>
                        <label className={labelStyle}>ISRC (Optional)</label>
                        <input
                          type="text"
                          value={track.isrc}
                          placeholder="Leave blank to auto-generate"
                          onChange={(e) =>
                            updateTrack(index, "isrc", e.target.value)
                          }
                          className={inputStyle}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className={labelStyle}>Primary Artist(s)</label>
                        <input
                          type="text"
                          value={track.primaryArtists}
                          onChange={(e) =>
                            updateTrack(index, "primaryArtists", e.target.value)
                          }
                          className={inputStyle}
                        />
                      </div>
                      <div>
                        <label className={labelStyle}>Featured Artist(s)</label>
                        <input
                          type="text"
                          value={track.featuredArtists}
                          placeholder="e.g. Burna Boy"
                          onChange={(e) =>
                            updateTrack(
                              index,
                              "featuredArtists",
                              e.target.value,
                            )
                          }
                          className={inputStyle}
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <label className="flex items-center gap-3 cursor-pointer group/explicit">
                        <input
                          type="checkbox"
                          checked={track.explicit}
                          onChange={(e) =>
                            updateTrack(index, "explicit", e.target.checked)
                          }
                          className="w-4 h-4 accent-[#EAE4D5] bg-transparent border-[#B6B09F]/20 rounded"
                        />
                        <span className="text-[10px] uppercase tracking-widest text-[#B6B09F] group-hover/explicit:text-[#EAE4D5] transition-colors">
                          Explicit Content
                        </span>
                      </label>

                      <button
                        onClick={() => removeTrack(track.id)}
                        className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-red-500/40 hover:text-red-500 transition-colors"
                      >
                        <FaTrash size={10} /> Remove Track
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
            Review Release <FaArrowRight size={10} />
          </button>
        </div>
      </footer>
    </motion.div>
  );
};

export default Step2Tracks;
