import React, { useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { FaCheck, FaArrowRight } from "react-icons/fa";
import LegalModal from "../LegalModal";
import toast from "react-hot-toast";

const getUniqueParticipantsForTrack = (track, releaseData) => {
  const participants = new Map();

  const addParticipant = (name, role) => {
    if (!name) return;
    const cleanName = name.trim();
    if (cleanName && !participants.has(cleanName)) {
      participants.set(cleanName, role);
    }
  };

  // 1. Primary Artists (Track level first, then release level fallback)
  const pArtists = track.primaryArtists || releaseData.primaryArtists || "";
  pArtists.split(",").forEach((n) => addParticipant(n, "Primary"));

  // 2. Featured Artists
  const fArtists = track.featuredArtists || releaseData.featuredArtists || "";
  fArtists.split(",").forEach((n) => addParticipant(n, "Featured"));

  // 3. Writers
  if (Array.isArray(track.writers)) {
    track.writers.forEach((w) =>
      addParticipant(w.legalName, w.role || "Writer"),
    );
  }

  // 4. Additional Credits (Producers, Engineers, etc.)
  if (Array.isArray(track.additionalCredits)) {
    track.additionalCredits.forEach((c) =>
      addParticipant(c.name, c.role || "Credit"),
    );
  }

  return Array.from(participants, ([name, role]) => ({ name, role }));
};

const TrackSplitManager = ({
  track,
  trackIndex,
  releaseData,
  updateSplits,
  applyToAll,
}) => {
  useEffect(() => {
    const participants = getUniqueParticipantsForTrack(track, releaseData);

    // Create a fingerprint of current names to compare
    const currentParticipantNames = participants.map((p) => p.name).join("|");
    const existingSplitNames = (track.splits || [])
      .map((s) => s.name)
      .join("|");

    // If the names have changed (e.g., added a writer in the modal)
    if (currentParticipantNames !== existingSplitNames) {
      const newSplits = participants.map((p) => {
        // Try to preserve the percentage if the person already existed
        const existing = (track.splits || []).find((s) => s.name === p.name);
        return {
          name: p.name,
          role: p.role,
          percentage: existing
            ? existing.percentage
            : participants.length === 1
              ? 100
              : 0,
          user: null,
        };
      });

      updateSplits(trackIndex, newSplits);
    }
  }, [
    track.primaryArtists,
    track.featuredArtists,
    track.writers,
    track.additionalCredits,
  ]);

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
            Current Total: {total}% {total !== 100 && "(Must total 100%)"}
          </p>
        </div>

        {releaseData.tracks.length > 1 && (
          <button
            type="button"
            onClick={() => applyToAll(track.splits)}
            className="text-[10px] bg-[#B6B09F]/10 hover:bg-[#B6B09F]/20 text-[#B6B09F] px-3 py-2 rounded uppercase font-bold transition-all"
          >
            Apply these splits to all
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-3">
        {track.splits?.map((split, idx) => (
          <div
            key={idx}
            className="flex items-center justify-between bg-[#0a0a0a] p-3 rounded border border-[#B6B09F]/5"
          >
            <div className="flex flex-col">
              <span className="text-sm text-[#EAE4D5] font-medium">
                {split.name}
              </span>
              <span className="text-[10px] text-[#B6B09F]/50 uppercase tracking-wider">
                {split.role}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="0"
                max="100"
                value={split.percentage || ""}
                onChange={(e) => {
                  const newSplits = [...track.splits];
                  newSplits[idx].percentage = Number(e.target.value);
                  updateSplits(trackIndex, newSplits);
                }}
                className="w-16 bg-black border border-[#B6B09F]/20 rounded p-1 text-center text-sm text-[#EAE4D5] outline-none focus:border-[#B6B09F]"
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
  // Handle progress for both single number and object-based progress
  const overallProgress = useMemo(() => {
    if (typeof uploadProgress === "number") return uploadProgress;
    const values = Object.values(uploadProgress || {});
    return values.length
      ? Math.round(values.reduce((a, b) => a + b, 0) / values.length)
      : 0;
  }, [uploadProgress]);

  const handleUpdateSplits = (trackIndex, newSplits) => {
    setData((prev) => {
      const newTracks = [...prev.tracks];
      newTracks[trackIndex] = { ...newTracks[trackIndex], splits: newSplits };
      return { ...prev, tracks: newTracks };
    });
  };

  const applySplitsToAll = (sourceSplits) => {
    if (!sourceSplits) return;
    setData((prev) => ({
      ...prev,
      tracks: prev.tracks.map((track) => ({
        ...track,
        splits: sourceSplits.map((s) => ({ ...s })),
      })),
    }));
    toast.success("Splits copied to all tracks");
  };

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
        {/* RELEASE SUMMARY CARD */}
        <div className="p-6 bg-[#050505] border border-[#B6B09F]/10 rounded-xl">
          <h2 className="text-xl font-semibold text-[#EAE4D5] border-b border-[#B6B09F]/10 pb-2 mb-4">
            Final Review
          </h2>
          <div className="flex flex-col md:flex-row gap-6">
            <div className="w-32 h-32 bg-[#0a0a0a] rounded-lg overflow-hidden border border-[#B6B09F]/10 flex-shrink-0">
              {releaseData.artwork ? (
                <img
                  src={releaseData.artwork}
                  alt="Cover"
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
                <p className="text-[#EAE4D5]">{releaseData.title}</p>
              </div>
              <div>
                <span className="text-[#B6B09F]">Type:</span>
                <p className="text-[#EAE4D5]">{releaseData.releaseType}</p>
              </div>
              <div className="col-span-2">
                <span className="text-[#B6B09F]">Artists:</span>
                <p className="text-[#EAE4D5]">{releaseData.primaryArtists}</p>
              </div>
              <div>
                <span className="text-[#B6B09F]">Genre:</span>
                <p className="text-[#EAE4D5]">{releaseData.genre}</p>
              </div>
              <div>
                <span className="text-[#B6B09F]">Label:</span>
                <p className="text-[#EAE4D5]">{releaseData.label}</p>
              </div>
            </div>
          </div>
        </div>

        {/* COLLABORATOR SPLITS */}
        <div className="p-6 bg-[#0a0a0a]/50 border border-[#B6B09F]/10 rounded-xl">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-[#EAE4D5]">
              Collaborator Splits
            </h2>
            <p className="text-[#B6B09F] text-xs mt-1">
              Assign revenue shares for all participants. Total must equal 100%
              per track.
            </p>
          </div>
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

        {/* LEGAL SIGNATURE */}
        <div
          className={`p-4 rounded-lg border transition-all ${hasSigned ? "bg-[#B6B09F]/10 border-[#B6B09F]/30" : "bg-[#0a0a0a] border-[#B6B09F]/10"}`}
        >
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={hasSigned}
              onChange={(e) => {
                if (e.target.checked) setIsLegalModalOpen(true);
                else {
                  setHasSigned(false);
                  setLegalName("");
                }
              }}
              className="mt-1 w-4 h-4 appearance-none border border-[#B6B09F]/40 rounded bg-[#0a0a0a] checked:bg-[#EAE4D5] transition-all cursor-pointer"
            />
            <div className="flex-1">
              <span className="text-xs text-[#B6B09F]">
                I confirm ownership of this content and agree to the{" "}
                <button
                  type="button"
                  onClick={() => setIsLegalModalOpen(true)}
                  className="text-[#EAE4D5] font-bold underline"
                >
                  Royalty Agreement
                </button>
                .
              </span>
              {hasSigned && (
                <p className="text-green-400 text-xs italic mt-2 flex items-center gap-1">
                  <FaCheck /> Signed: {legalName}
                </p>
              )}
            </div>
          </label>
        </div>

        {/* ACTIONS */}
        {isSubmitting && (
          <div className="w-full bg-[#B6B09F]/10 h-1 rounded-full overflow-hidden mb-4">
            <div
              className="bg-[#EAE4D5] h-full transition-all duration-300"
              style={{ width: `${overallProgress}%` }}
            />
          </div>
        )}

        <div className="flex gap-4">
          <button
            onClick={() => setStep(2)}
            disabled={isSubmitting}
            className="flex-1 py-4 border border-[#B6B09F]/20 text-[#B6B09F] font-bold rounded-lg uppercase text-xs"
          >
            Back
          </button>
          <button
            onClick={() => handleSubmit(false)}
            disabled={isSubmitting || !hasSigned || !allSplitsValid}
            className={`flex-[2] py-4 rounded-lg font-bold text-xs uppercase transition-all flex items-center justify-center gap-2 ${hasSigned && allSplitsValid && !isSubmitting ? "bg-[#EAE4D5] text-[#0a0a0a] hover:bg-white" : "bg-[#B6B09F]/10 text-[#B6B09F]/40 cursor-not-allowed"}`}
          >
            {isSubmitting
              ? `Uploading ${overallProgress}%`
              : !allSplitsValid
                ? "Fix Splits"
                : "Submit Release"}
            {!isSubmitting && allSplitsValid && <FaArrowRight />}
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
