import React, { useEffect } from "react";
import { motion } from "framer-motion";
import {
  FaCheck,
  FaSave,
  FaArrowRight,
  FaPercentage,
  FaExclamationTriangle,
} from "react-icons/fa";
import LegalModal from "../LegalModal";
import toast from "react-hot-toast";

// Helper to safely parse comma-separated strings or arrays
const parseArtists = (input) => {
  if (!input) return [];
  return Array.isArray(input)
    ? input
    : input
        .split(",")
        .map((a) => a.trim())
        .filter(Boolean);
};

const TrackSplitManager = ({
  track,
  trackIndex,
  releaseData,
  updateSplits,
  applyToAll,
}) => {
  // Helper to extract names regardless of if they are strings or objects
  const getName = (val) => (typeof val === "string" ? val : val?.name);

  // Inside TrackSplitManager useEffect
  useEffect(() => {
    if (!track.splits || track.splits.length === 0) {
      // 1. Get artists from track, OR fallback to release level
      const pArtists =
        track.primaryArtists?.length > 0
          ? track.primaryArtists
          : releaseData.primaryArtists;
      const fArtists =
        track.featuredArtists?.length > 0
          ? track.featuredArtists
          : releaseData.featuredArtists;

      // 2. Use the parseArtists helper to turn strings into arrays
      const allArtists = [
        ...parseArtists(pArtists).map((name) => ({ name, role: "Primary" })),
        ...parseArtists(fArtists).map((name) => ({ name, role: "Featured" })),
      ];

      const initialSplits = allArtists.map((artist) => ({
        ...artist,
        // If it's just one person, give them 100% automatically
        percentage: allArtists.length === 1 ? 100 : 0,
      }));

      updateSplits(trackIndex, initialSplits);
    }
  }, [trackIndex, track.primaryArtists, releaseData.primaryArtists]);
  const total = (track.splits || []).reduce(
    (sum, s) => sum + Number(s.percentage || 0),
    0,
  );

  return (
    <div className="bg-[#050505] border border-[#B6B09F]/10 rounded-lg p-5 mb-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4 border-b border-[#B6B09F]/10 pb-4">
        <div>
          <h4 className="text-[#EAE4D5] font-bold">
            Track {trackIndex + 1}: {track.title}
          </h4>
          <p
            className={`text-[10px] mt-1 uppercase font-bold ${total === 100 ? "text-green-400" : "text-red-400"}`}
          >
            Current Total: {total}% {total !== 100 && "(Must be 100%)"}
          </p>
        </div>

        {/* ALBUM HELPER: Copy these splits to every other track */}
        {releaseData.tracks.length > 1 && (
          <button
            type="button"
            onClick={() => applyToAll(track.splits)}
            className="text-[10px] bg-[#B6B09F]/10 hover:bg-[#B6B09F]/20 text-[#B6B09F] px-3 py-2 rounded uppercase font-bold transition-all"
          >
            Apply these splits to all tracks
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-3">
        {track.splits?.map((split, idx) => (
          <div
            key={idx}
            className="flex items-center justify-between bg-[#0a0a0a] p-3 rounded"
          >
            <span className="text-sm text-[#EAE4D5]">
              {split.name}{" "}
              <span className="text-[10px] text-[#B6B09F]/50 ml-2">
                ({split.role})
              </span>
            </span>
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={split.percentage || ""}
                onChange={(e) => {
                  const newSplits = [...track.splits];
                  newSplits[idx].percentage = Number(e.target.value);
                  updateSplits(trackIndex, newSplits);
                }}
                className="w-16 bg-black border border-[#B6B09F]/20 rounded p-1 text-center text-sm outline-none focus:border-[#B6B09F]"
              />
              <span className="text-[#B6B09F] text-xs">%</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const Step3Review = ({
  releaseData,
  setData,
  setStep,
  handleSubmit,
  isSubmitting,
  uploadProgress,
  hasSigned,
  setHasSigned,
  legalName,
  setLegalName,
  isLegalModalOpen,
  setIsLegalModalOpen,
}) => {
  const handleUpdateSplits = (trackIndex, newSplits) => {
    setData((prev) => {
      const newTracks = [...prev.tracks];
      newTracks[trackIndex] = { ...newTracks[trackIndex], splits: newSplits };
      return { ...prev, tracks: newTracks };
    });
  };

  console.log(releaseData);

  // LOGIC: Calculate the display artist based on track data
  const displayArtist = (() => {
    if (!releaseData.tracks || releaseData.tracks.length === 0)
      return "Unknown Artist";

    // Get unique primary artists from the tracks
    const uniqueArtists = [
      ...new Set(releaseData.tracks.map((t) => t.primaryArtists || "Unknown")),
    ];

    // If all tracks have the same artist, return that name.
    // Otherwise, return "Various Artists"
    return uniqueArtists.length === 1 ? uniqueArtists[0] : "Various Artists";
  })();

  const applySplitsToAll = (sourceSplits) => {
    setData((prev) => ({
      ...prev,
      tracks: prev.tracks.map((track) => ({
        ...track,
        splits: [...sourceSplits], // Copy the split array to every track
      })),
    }));
    toast.success("Splits applied to all tracks");
  };

  // Global validation: Are ALL tracks currently at 100% split?
  const allSplitsValid = releaseData.tracks.every((t) => {
    const total = (t.splits || []).reduce(
      (sum, s) => sum + Number(s.percentage || 0),
      0,
    );
    return total === 100;
  });

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        {/* REVIEW SUMMARY */}
        <div className="p-6 bg-[#050505] border border-[#B6B09F]/10 rounded-xl">
          <h2 className="text-xl font-semibold text-[#EAE4D5] border-b border-[#B6B09F]/10 pb-2 mb-4">
            Final Review
          </h2>
          <div className="flex flex-col md:flex-row gap-6 mb-6">
            <div className="w-32 h-32 bg-[#0a0a0a] rounded-lg overflow-hidden border border-[#B6B09F]/10 flex-shrink-0">
              {releaseData.artwork ? (
                <img
                  src={releaseData.artwork}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-[#B6B09F]/30 text-xs">
                  No Cover
                </div>
              )}
            </div>
            <div className="grid grid-cols-2 gap-y-2 gap-x-6 text-sm flex-1">
              <div>
                <span className="text-[#B6B09F]">Title:</span>
                <p className="text-[#EAE4D5] font-medium">
                  {releaseData.title}
                </p>
              </div>
              <div>
                <span className="text-[#B6B09F]">Format:</span>
                <p className="text-[#EAE4D5] font-medium">
                  {releaseData.releaseType}
                </p>
              </div>
              <div>
                <span className="text-[#B6B09F]">Primary:</span>
                <p className="text-[#EAE4D5] font-medium">
                  {releaseData.primaryArtists}
                </p>
              </div>
              <div>
                <span className="text-[#B6B09F]">Featured:</span>
                <p className="text-[#EAE4D5] font-medium">
                  {releaseData.featuredArtists}
                </p>
              </div>
              <div>
                <span className="text-[#B6B09F]">Genre:</span>
                <p className="text-[#EAE4D5] font-medium">
                  {releaseData.genre}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ROYALTY SPLITS SECTION */}
        <div className="p-6 bg-[#0a0a0a]/50 border border-[#B6B09F]/10 rounded-xl">
          <div className="mb-4">
            <h2 className="text-xl font-semibold text-[#EAE4D5]">
              Collaborator Splits
            </h2>
            <p className="text-[#B6B09F] text-xs mt-1">
              Assign percentages for the Net Artist Pool (80% of total
              receipts).
            </p>
          </div>

          <div>
            {releaseData.tracks.map((track, idx) => (
              <TrackSplitManager
                key={idx}
                track={track}
                trackIndex={idx}
                releaseData={releaseData}
                updateSplits={handleUpdateSplits}
                applyToAll={applySplitsToAll}
              />
            ))}
          </div>
        </div>

        {/* LEGAL GATE */}
        <div
          className={`p-4 rounded-lg border transition-all ${hasSigned ? "bg-[#B6B09F]/10 border-[#B6B09F]/30" : "bg-[#0a0a0a] border-[#B6B09F]/10"}`}
        >
          <label className="flex items-start gap-3 cursor-pointer group">
            <div className="relative flex items-center justify-center mt-1">
              <input
                type="checkbox"
                checked={hasSigned}
                onChange={(e) => {
                  if (e.target.checked && !hasSigned) setIsLegalModalOpen(true);
                  else {
                    setHasSigned(false);
                    setLegalName("");
                  }
                }}
                className="w-4 h-4 appearance-none border border-[#B6B09F]/40 rounded bg-[#0a0a0a] checked:bg-[#EAE4D5] transition-all cursor-pointer"
              />
              {hasSigned && (
                <FaCheck className="absolute text-[#0a0a0a] text-[10px] pointer-events-none" />
              )}
            </div>
            <div className="flex-1">
              <span className="text-xs leading-relaxed text-[#B6B09F] block">
                I confirm I own 100% of the rights to this content. I agree to
                the{" "}
                <button
                  type="button"
                  onClick={() => setIsLegalModalOpen(true)}
                  className="text-[#EAE4D5] font-bold underline decoration-[#B6B09F]/50"
                >
                  80/20 Royalty Agreement
                </button>
                .
              </span>
              {hasSigned && (
                <div className="mt-3 bg-green-500/10 border border-green-500/20 rounded px-3 py-2 inline-block">
                  <p className="text-green-400 text-xs italic flex items-center gap-2">
                    <FaCheck className="text-[10px]" /> Signed by:{" "}
                    <span className="font-bold not-italic">{legalName}</span>
                  </p>
                </div>
              )}
            </div>
          </label>
        </div>

        {isSubmitting && (
          <div className="w-full bg-[#B6B09F]/10 h-1 rounded-full overflow-hidden mt-4">
            <div
              className="bg-[#EAE4D5] h-full transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        )}

        <div className="flex flex-col md:flex-row gap-4 mt-8">
          <button
            onClick={() => setStep(2)}
            disabled={isSubmitting}
            className="flex-1 py-4 border border-[#B6B09F]/20 text-[#B6B09F] font-bold rounded-lg hover:bg-[#B6B09F]/5 uppercase text-xs"
          >
            Back
          </button>

          <button
            onClick={() => handleSubmit(false)}
            disabled={isSubmitting || !hasSigned || !allSplitsValid} // Disable if math is wrong
            className={`flex-[2] py-4 rounded-lg font-bold text-xs uppercase transition-all flex items-center justify-center gap-2 ${
              hasSigned && allSplitsValid && !isSubmitting
                ? "bg-[#EAE4D5] text-[#0a0a0a] hover:bg-white"
                : "bg-[#B6B09F]/10 text-[#B6B09F]/40 cursor-not-allowed"
            }`}
          >
            {isSubmitting
              ? `Uploading (${uploadProgress}%)...`
              : !allSplitsValid
                ? "Fix Split Percentages"
                : "Submit Release"}
            {!isSubmitting && allSplitsValid && (
              <FaArrowRight className="text-sm" />
            )}
          </button>
        </div>
      </motion.div>

      <LegalModal
        isOpen={isLegalModalOpen}
        onClose={() => setIsLegalModalOpen(false)}
        legalName={legalName}
        setLegalName={setLegalName}
        onSign={() => {
          setHasSigned(true);
          setIsLegalModalOpen(false);
        }}
      />
    </>
  );
};

export default Step3Review;
