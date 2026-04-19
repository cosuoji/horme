import React, { useState, useEffect } from "react";
import { motion, Reorder } from "framer-motion";
import {
  FaArrowRight,
  FaArrowLeft,
  FaUpload,
  FaInfoCircle,
  FaMusic,
  FaBars,
  FaTrash,
  FaPlus,
  FaSave,
  FaCheck,
  FaClock,
} from "react-icons/fa";
import axios from "../../lib/axios";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { useParams } from "react-router-dom";
import LegalModal from "../../Components/LegalModal";

const NewReleaseBuilder = () => {
  const [step, setStep] = useState(1);
  const navigate = useNavigate();
  const [artworkUploading, setArtworkUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [artworkPreview, setArtworkPreview] = useState(null);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [uploadProgress, setUploadProgress] = useState(0);
  const { id } = useParams(); // Get ID from URL if it exists
  const [isLoading, setIsLoading] = useState(!!id); // Load if we have an ID
  const [isLegalModalOpen, setIsLegalModalOpen] = useState(false);
  const [legalName, setLegalName] = useState("");
  const [hasSigned, setHasSigned] = useState(false);

  useEffect(() => {
    if (id) {
      const fetchReleaseData = async () => {
        try {
          const { data } = await axios.get(`/api/releases/${id}`);

          // Map backend data back to frontend state format
          setReleaseData({
            ...data,
            primaryArtists:
              data.primaryArtists?.map((a) => a.name).join(", ") || "",
            // Convert featuredArtists objects back to comma-separated string for the input
            featuredArtists:
              data.featuredArtists?.map((a) => a.name).join(", ") || "",
            // Format date for <input type="date">
            releaseDate: data.releaseDate ? data.releaseDate.split("T")[0] : "",
            preOrderDate: data.preOrderDate
              ? data.preOrderDate.split("T")[0]
              : "",
            // Map tracks back to the state format
            tracks: data.tracks.map((t) => ({
              ...t,
              featuredArtists:
                t.featuredArtists?.map((a) => a.name).join(", ") || "",
            })),
          });

          setArtworkPreview(data.artwork);
          setSavedReleaseId(data._id); // Crucial: sets the ID so handleSubmit updates instead of creates
        } catch (error) {
          toast.error("Failed to load draft.");
        } finally {
          setIsLoading(false);
        }
      };
      fetchReleaseData();
    }
  }, [id]);

  // 🚀 PRO-TIP: Track the MongoDB ID to prevent duplicates
  const [savedReleaseId, setSavedReleaseId] = useState(null);

  // Master State for the Release
  const [releaseData, setReleaseData] = useState({
    releaseType: "Single",
    title: "",
    primaryArtists: "",
    featuredArtists: "",
    artwork: null,
    releaseDate: "",
    preOrderDate: "",
    timeZone: "Local Time",
    genre: "",
    label: "",
    language: "English",
    cLine: "",
    pLine: "",
    hasUPC: false,
    upcCode: "",
    tracks: [],
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setReleaseData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleArtworkUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const localUrl = URL.createObjectURL(file);
    setArtworkPreview(localUrl);

    if (file.size > 10 * 1024 * 1024) {
      toast.error("File is too large. Max size for covers is 10MB.");
      return;
    }

    const formDataToSend = new FormData();
    formDataToSend.append("artwork", file);
    formDataToSend.append("releaseTitle", releaseData.title || "untitled");

    setArtworkUploading(true);
    try {
      const { data } = await axios.post(
        "/api/releases/release-artwork",
        formDataToSend,
        { headers: { "Content-Type": "multipart/form-data" } },
      );

      setReleaseData((prev) => ({ ...prev, artwork: data.imageUrl }));
      setArtworkPreview(data.imageUrl);
      toast.success("Artwork uploaded!");
    } catch (error) {
      toast.error("Failed to upload artwork.");
      setArtworkPreview(null);
    } finally {
      setArtworkUploading(false);
    }
  };

  // 🚀 REWRITTEN: Now handles Drafts and Final Submissions
  const handleSubmit = async (isDraft = false) => {
    console.group(isDraft ? "📝 Saving Draft" : "🚀 Starting Submission");

    // 1. Validation Logic
    if (!isDraft && (!releaseData.tracks || releaseData.tracks.length === 0)) {
      toast.error("Please add at least one track.");
      console.groupEnd();
      return;
    }

    if (!isDraft && !releaseData.title) {
      toast.error("Release title is required.");
      console.groupEnd();
      return;
    }

    setIsSubmitting(true);
    const toastId = toast.loading(
      isDraft ? "Saving progress..." : "Initiating upload...",
    );

    try {
      const uploadedTracks = [];

      // 2. Track Upload Loop
      // We skip S3 if it's a draft and files aren't ready,
      // OR if the track already has a fileUrl (resuming a draft)
      for (let i = 0; i < releaseData.tracks.length; i++) {
        const track = releaseData.tracks[i];

        // If resuming a draft, skip upload if we already have the S3 URL
        if (track.fileUrl) {
          uploadedTracks.push(track);
          continue;
        }

        // If it's a draft and the user hasn't selected a file yet, skip this track
        if (isDraft && !track.file) {
          uploadedTracks.push({
            ...track,
            featuredArtists: track.featuredArtists
              ? track.featuredArtists.split(",").map((a) => a.trim())
              : [],
          });
          continue;
        }

        // Standard Upload Logic for final submission or new files in draft
        if (track.file) {
          const { data: presignedData } = await axios.post(
            "/api/releases/get-presigned-url",
            {
              fileName: track.file.name,
              fileType: track.file.type,
              releaseTitle: releaseData.title,
            },
          );

          await axios.put(presignedData.uploadUrl, track.file, {
            headers: { "Content-Type": track.file.type },
            onUploadProgress: (p) =>
              setUploadProgress(Math.round((p.loaded * 100) / p.total)),
            transformRequest: [
              (data, headers) => {
                if (headers) delete headers["Authorization"];
                return data;
              },
            ],
          });

          uploadedTracks.push({
            title: track.title,
            fileUrl: presignedData.fileUrl,
            fileKey: presignedData.fileKey,
            isrc: track.isrc,
            explicit: track.explicit,
            genre: track.genre,
            trackNumber: i + 1,
            primaryArtists: track.primaryArtists
              ? track.primaryArtists
                  .split(",")
                  .map((a) => a.trim())
                  .filter(Boolean)
              : [],
            // Existing featured logic
            featuredArtists: track.featuredArtists
              ? track.featuredArtists
                  .split(",")
                  .map((a) => a.trim())
                  .filter(Boolean)
              : [],
          });
          setUploadProgress(0);
        }
      }

      // 3. Final Payload (Includes releaseId for upserting)
      const finalPayload = {
        releaseId: savedReleaseId, // 👈 KEY: Tells backend to update instead of create
        isDraft: isDraft,
        releaseTitle: releaseData.title,
        releaseType: releaseData.releaseType,
        artworkUrl: releaseData.artwork,
        releaseDate: releaseData.releaseDate,
        preOrderDate: releaseData.preOrderDate,
        timeZone: releaseData.timeZone,
        genre: releaseData.genre,
        label: releaseData.label,
        language: releaseData.language,
        cLine: releaseData.cLine,
        pLine: releaseData.pLine,
        upc: releaseData.hasUPC ? releaseData.upcCode : "",
        primaryArtists: releaseData.primaryArtists
          ? releaseData.primaryArtists
              .split(",")
              .map((a) => a.trim())
              .filter(Boolean)
          : [],

        // Format Featured Artists
        featuredArtists: releaseData.featuredArtists
          ? releaseData.featuredArtists
              .split(",")
              .map((a) => a.trim())
              .filter(Boolean)
          : [],
        tracks: uploadedTracks,

        legalConsent: isDraft
          ? undefined
          : {
              agreed: hasSigned,
              signedName: legalName,
            },
      };

      const response = await axios.post("/api/releases", finalPayload);

      // 4. Update the Saved ID from the response
      if (response.data.release?._id) {
        setSavedReleaseId(response.data.release._id);
      }

      toast.success(isDraft ? "Draft saved!" : "Release submitted!", {
        id: toastId,
      });

      // If it was a final submission, move to dashboard.
      // If it was a draft, stay here so they can keep working!
      if (!isDraft) {
        setTimeout(() => navigate("/dashboard/releases"), 1500);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "An error occurred.", {
        id: toastId,
      });
    } finally {
      setIsSubmitting(false);
      console.groupEnd();
    }
  };

  const inputStyle =
    "w-full px-4 py-3 bg-[#0a0a0a] border border-[#B6B09F]/20 rounded-lg text-[#EAE4D5] placeholder-[#B6B09F]/50 focus:border-[#EAE4D5] focus:outline-none transition-colors";
  const labelStyle = "block text-[#EAE4D5] text-sm mb-2";

  const validateStep1 = () => {
    const { title, artwork, releaseDate, genre, language, hasUPC, upcCode } =
      releaseData;
    if (!title.trim()) return "Please enter a release title.";
    if (!artwork) return "Please upload your cover artwork.";
    if (!releaseDate) return "Please select an original release date.";
    if (!genre.trim()) return "Please enter a primary genre.";
    if (!language.trim()) return "Please specify the language.";
    if (hasUPC && !upcCode.trim())
      return "Please enter your UPC code or uncheck the box.";
    return null;
  };
  if (isLoading) return <div className="text-[#EAE4D5]">Loading Draft...</div>;

  return (
    <div className="max-w-4xl mx-auto pb-12">
      {/* HEADER & PROGRESS BAR */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-[#EAE4D5]">
              Create New Release
            </h1>
            <div className="flex items-center gap-3 mt-2">
              <span className="text-[10px] text-[#B6B09F]/60 flex items-center gap-1.5 uppercase tracking-widest bg-[#B6B09F]/5 px-3 py-1 rounded-full border border-[#B6B09F]/10">
                <FaClock className="text-[#EAE4D5]/40" />
                Draft expires in 10 Days
              </span>
              {savedReleaseId && (
                <span className="text-[10px] text-green-400/60 flex items-center gap-1.5 uppercase tracking-widest bg-green-400/5 px-3 py-1 rounded-full border border-green-400/10">
                  ID: {savedReleaseId.slice(-6)} (Saved)
                </span>
              )}
            </div>
          </div>

          {/* 💾 QUICK SAVE BUTTON (Available on all steps) */}
          <button
            onClick={() => handleSubmit(true)}
            disabled={isSubmitting || !releaseData.title}
            className="flex items-center gap-2 px-4 py-2 border border-[#B6B09F]/20 text-[#B6B09F] text-xs font-bold rounded-lg hover:bg-[#B6B09F]/10 transition-all disabled:opacity-30 uppercase tracking-widest"
          >
            <FaSave /> Save Progress
          </button>
        </div>

        <div className="flex gap-2 mt-8">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className={`h-2 flex-1 rounded-full transition-all duration-500 ${
                step >= i ? "bg-[#EAE4D5]" : "bg-[#B6B09F]/20"
              }`}
            ></div>
          ))}
        </div>
        <div className="flex justify-between text-xs text-[#B6B09F] mt-2 font-medium uppercase tracking-wider">
          <span>1. Details & Artwork</span>
          <span>2. Tracks & Audio</span>
          <span>3. Review</span>
        </div>
      </div>

      {/* STEP 1: RELEASE DETAILS */}
      {step === 1 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="p-6 bg-[#050505] border border-[#B6B09F]/10 rounded-xl space-y-4">
            <h2 className="text-xl font-semibold text-[#EAE4D5] border-b border-[#B6B09F]/10 pb-2">
              Format & Title
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={labelStyle}>Release Type</label>
                <select
                  name="releaseType"
                  value={releaseData.releaseType}
                  onChange={handleChange}
                  className={inputStyle}
                >
                  <option value="Single">Single (1-3 Tracks)</option>
                  <option value="EP">EP (4-6 Tracks)</option>
                  <option value="Album">Album (7+ Tracks)</option>
                  <option value="Compilation">Compilation</option>
                </select>
              </div>
              <div>
                <label className={labelStyle}>Release Title</label>
                <input
                  type="text"
                  name="title"
                  value={releaseData.title}
                  onChange={handleChange}
                  className={inputStyle}
                  placeholder="e.g. Midnight Genesis"
                />
              </div>
            </div>
          </div>

          <div className="p-6 bg-[#050505] border border-[#B6B09F]/10 rounded-xl">
            <h2 className="text-xl font-semibold text-[#EAE4D5] mb-4 border-b border-[#B6B09F]/10 pb-2">
              Cover Artwork
            </h2>
            <div className="flex flex-col md:flex-row gap-6 items-start">
              <div className="w-48 h-48 bg-[#0a0a0a] border-2 border-dashed border-[#B6B09F]/30 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0 relative group">
                {/* 🖼️ PREVIEW & IMAGE LOGIC */}
                {artworkPreview || releaseData.artwork ? (
                  <div className="relative w-full h-full">
                    <img
                      src={artworkPreview || releaseData.artwork}
                      alt="Artwork"
                      className={`w-full h-full object-cover transition-opacity duration-300 ${
                        artworkUploading
                          ? "opacity-40 blur-[2px]"
                          : "opacity-100"
                      }`}
                    />

                    {/* Subtle loading spinner overlay while uploading */}
                    {artworkUploading && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50">
                        <div className="w-8 h-8 border-2 border-t-[#EAE4D5] border-[#B6B09F]/10 rounded-full animate-spin mb-2"></div>
                        <span className="text-xs text-[#EAE4D5] font-medium">
                          Uploading...
                        </span>
                      </div>
                    )}
                  </div>
                ) : (
                  /* Empty State */
                  <div className="text-center text-[#B6B09F]/50">
                    <FaUpload className="text-2xl mx-auto mb-2" />
                    <span className="text-sm">Upload Cover</span>
                  </div>
                )}

                {/* Invisible file input covering the whole box */}
                <input
                  type="file"
                  accept="image/jpeg, image/png"
                  onChange={handleArtworkUpload}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  disabled={artworkUploading}
                />
              </div>

              <div className="space-y-3">
                <div className="flex items-start gap-2 text-sm text-[#B6B09F] bg-[#B6B09F]/10 p-4 rounded-lg">
                  <FaInfoCircle className="text-[#EAE4D5] mt-0.5 flex-shrink-0" />
                  <p>
                    <strong>Artwork Guidelines:</strong> Must be a perfect
                    square. Recommended size is 3000x3000px. JPG or PNG formats
                    only.
                    <br />
                    <br />
                    <em>
                      Note: All artwork is manually reviewed before DSP
                      submission.
                    </em>
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="p-6 bg-[#050505] border border-[#B6B09F]/10 rounded-xl space-y-4">
            <h2 className="text-xl font-semibold text-[#EAE4D5] border-b border-[#B6B09F]/10 pb-2">
              Schedule
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className={labelStyle}>Original Release Date</label>
                <input
                  type="date"
                  name="releaseDate"
                  value={releaseData.releaseDate}
                  onChange={handleChange}
                  className={inputStyle}
                />
              </div>
              <div>
                <label className={labelStyle}>Pre-order Date (Optional)</label>
                <input
                  type="date"
                  name="preOrderDate"
                  value={releaseData.preOrderDate}
                  onChange={handleChange}
                  className={inputStyle}
                />
              </div>
              <div>
                <label className={labelStyle}>Time Zone</label>
                <select
                  name="timeZone"
                  value={releaseData.timeZone}
                  onChange={handleChange}
                  className={inputStyle}
                >
                  <option value="Local Time">
                    Listener's Local Time (Midnight)
                  </option>
                  <option value="EST">EST (Global Simultaneous)</option>
                  <option value="GMT">GMT (Global Simultaneous)</option>
                </select>
              </div>
            </div>
          </div>

          <div className="p-6 bg-[#050505] border border-[#B6B09F]/10 rounded-xl space-y-4">
            <h2 className="text-xl font-semibold text-[#EAE4D5] border-b border-[#B6B09F]/10 pb-2">
              Release Metadata
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className={labelStyle}>Primary Genre</label>
                <input
                  type="text"
                  name="genre"
                  value={releaseData.genre}
                  onChange={handleChange}
                  className={inputStyle}
                />
              </div>
              <div>
                <label className={labelStyle}>Record Label</label>
                <input
                  type="text"
                  name="label"
                  value={releaseData.label}
                  onChange={handleChange}
                  className={inputStyle}
                  placeholder="Leave blank to use artist name"
                />
              </div>
              <div>
                <label className={labelStyle}>Language</label>
                <input
                  type="text"
                  name="language"
                  value={releaseData.language}
                  onChange={handleChange}
                  className={inputStyle}
                />
              </div>
            </div>
            {/* ARTIST METADATA */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div>
                <label className={labelStyle}>Primary Artists</label>
                <input
                  type="text"
                  name="primaryArtists"
                  value={releaseData.primaryArtists}
                  onChange={handleChange}
                  className={inputStyle}
                  placeholder="e.g. Olu, Skepta (comma separated)"
                />
                <p className="text-xs text-[#B6B09F]/70 mt-1">
                  The main artists on the release.
                </p>
              </div>
              <div>
                <label className={labelStyle}>Featured Artists</label>
                <input
                  type="text"
                  name="featuredArtists"
                  value={releaseData.featuredArtists}
                  onChange={handleChange}
                  className={inputStyle}
                  placeholder="e.g. Burna Boy, Wizkid (comma separated)"
                />
                <p className="text-xs text-[#B6B09F]/70 mt-1">
                  Guest appearances (optional).
                </p>
              </div>
            </div>

            {/* COPYRIGHT LINES */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div>
                <label className={labelStyle}>© Copyright Line (cLine)</label>
                <input
                  type="text"
                  name="cLine"
                  value={releaseData.cLine}
                  onChange={handleChange}
                  className={inputStyle}
                  placeholder="e.g. 2026 Motion Works"
                />
              </div>
              <div>
                <label className={labelStyle}>℗ Phonogram Line (pLine)</label>
                <input
                  type="text"
                  name="pLine"
                  value={releaseData.pLine}
                  onChange={handleChange}
                  className={inputStyle}
                  placeholder="e.g. 2026 Motion Works"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-[#B6B09F]/10">
              <label className="flex items-center space-x-3 cursor-pointer mb-4">
                <input
                  type="checkbox"
                  name="hasUPC"
                  checked={releaseData.hasUPC}
                  onChange={handleChange}
                  className="w-4 h-4 accent-[#EAE4D5]"
                />
                <span className="text-[#EAE4D5] font-medium">
                  I already have a UPC/EAN code
                </span>
              </label>

              {releaseData.hasUPC && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                >
                  <input
                    type="text"
                    name="upcCode"
                    value={releaseData.upcCode}
                    onChange={handleChange}
                    className={inputStyle}
                    placeholder="Enter your 12 or 13 digit UPC/EAN"
                  />
                </motion.div>
              )}
              {!releaseData.hasUPC && (
                <p className="text-sm text-[#B6B09F]">
                  We will generate a free UPC code for you automatically.
                </p>
              )}
            </div>
          </div>

          <div className="flex flex-col md:flex-row justify-end gap-3 pt-6 border-t border-[#B6B09F]/10">
            <button
              onClick={() => handleSubmit(true)}
              disabled={isSubmitting || !releaseData.title}
              className="flex items-center justify-center gap-2 px-6 py-3 border border-[#B6B09F]/30 text-[#EAE4D5] font-bold rounded-lg hover:bg-[#B6B09F]/10 transition-colors disabled:opacity-30"
            >
              <FaSave className="text-sm" /> Save Draft
            </button>
            <button
              onClick={() => {
                const error = validateStep1();
                if (error) {
                  toast.error(error);
                  return;
                }
                // We save as draft automatically when moving forward to ensure data is synced
                handleSubmit(true);
                setStep(2);
              }}
              disabled={isSubmitting}
              className="flex items-center justify-center gap-2 px-8 py-3 bg-[#EAE4D5] text-[#0a0a0a] font-bold rounded-lg hover:bg-opacity-90 transition-colors"
            >
              Continue to Tracks <FaArrowRight className="text-sm" />
            </button>
          </div>
        </motion.div>
      )}

      {/* STEP 2: TRACKS & AUDIO */}
      {step === 2 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="p-6 bg-[#050505] border border-[#B6B09F]/10 rounded-xl">
            <h2 className="text-xl font-semibold text-[#EAE4D5] mb-2 border-b border-[#B6B09F]/10 pb-2">
              Upload Tracks
            </h2>
            <p className="text-[#B6B09F] text-sm mb-4">
              Upload your master files. WAV is highly recommended for
              distribution.
            </p>
            <div className="relative border-2 border-dashed border-[#B6B09F]/20 rounded-lg p-10 text-center hover:border-[#EAE4D5]/50 transition-colors cursor-pointer">
              <input
                type="file"
                multiple
                accept="audio/wav, audio/mpeg, audio/mp3"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                onChange={(e) => {
                  const files = Array.from(e.target.files);
                  const newTracks = files.map((file) => ({
                    id: `${file.name}-${Date.now()}-${Math.random()}`,
                    title: file.name.replace(/\.[^/.]+$/, ""),
                    file: file,
                    isrc: "",
                    explicit: false,
                    primaryArtists: releaseData.primaryArtists || "", // 🚀 New: track-specific primary artists
                    featuredArtists: "", // 🚀 Existing
                  }));
                  setReleaseData((prev) => ({
                    ...prev,
                    tracks: [...prev.tracks, ...newTracks],
                  }));
                }}
              />
              <FaMusic className="text-3xl text-[#B6B09F]/40 mx-auto mb-3" />
              <p className="text-[#EAE4D5] font-medium">
                Drag & drop your audio files here
              </p>
              <p className="text-[#B6B09F]/60 text-xs mt-1">
                Supports WAV and MP3 (Max 200MB per file)
              </p>
            </div>
          </div>

          <div className="p-6 bg-[#050505] border border-[#B6B09F]/10 rounded-xl">
            <div className="flex justify-between items-center mb-4 border-b border-[#B6B09F]/10 pb-2">
              <h2 className="text-xl font-semibold text-[#EAE4D5]">
                Tracklist
              </h2>
              <span className="text-sm text-[#B6B09F]">
                {releaseData.tracks.length} Tracks
              </span>
            </div>

            {releaseData.tracks.length === 0 ? (
              <div className="text-center py-10 text-[#B6B09F]/40">
                <p>No tracks uploaded yet.</p>
              </div>
            ) : (
              <Reorder.Group
                axis="y"
                values={releaseData.tracks}
                onReorder={(newOrder) =>
                  setReleaseData((prev) => ({ ...prev, tracks: newOrder }))
                }
                className="space-y-3"
              >
                {releaseData.tracks.map((track, index) => (
                  <Reorder.Item
                    key={track.id}
                    value={track}
                    className="bg-[#0a0a0a] border border-[#B6B09F]/10 rounded-lg p-4 flex items-center gap-4 group cursor-grab active:cursor-grabbing"
                  >
                    <div className="text-[#B6B09F]/40 group-hover:text-[#B6B09F] transition-colors">
                      <FaBars />
                    </div>
                    <div className="text-sm font-bold text-[#EAE4D5]/40 w-5">
                      {String(index + 1).padStart(2, "0")}
                    </div>
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs text-[#B6B09F] mb-1 block">
                          Track Title
                        </label>
                        <input
                          type="text"
                          value={track.title}
                          onChange={(e) => {
                            const updated = [...releaseData.tracks];
                            updated[index].title = e.target.value;
                            setReleaseData((prev) => ({
                              ...prev,
                              tracks: updated,
                            }));
                          }}
                          className="w-full bg-transparent border-b border-[#B6B09F]/20 focus:border-[#EAE4D5] outline-none text-[#EAE4D5] text-sm py-1 transition-colors"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-[#B6B09F] mb-1 block">
                          ISRC (Optional)
                        </label>
                        <input
                          type="text"
                          value={track.isrc}
                          placeholder="Auto-generated if left blank"
                          onChange={(e) => {
                            const updated = [...releaseData.tracks];
                            updated[index].isrc = e.target.value;
                            setReleaseData((prev) => ({
                              ...prev,
                              tracks: updated,
                            }));
                          }}
                          className="w-full bg-transparent border-b border-[#B6B09F]/20 focus:border-[#EAE4D5] outline-none text-[#EAE4D5] text-sm py-1 transition-colors"
                        />
                      </div>
                    </div>
                    {/* FEATURED ARTISTS (TRACK LEVEL) */}
                    {/* Replace the existing Artist section inside Reorder.Item */}
                    <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 col-span-1 md:col-span-2">
                      {/* TRACK PRIMARY ARTISTS */}
                      <div>
                        <label className="text-xs text-[#B6B09F] mb-1 block">
                          Track Primary Artist(s)
                        </label>
                        <input
                          type="text"
                          value={track.primaryArtists || ""}
                          placeholder="Main artist name(s), comma separated"
                          onChange={(e) => {
                            const updated = [...releaseData.tracks];
                            updated[index].primaryArtists = e.target.value;
                            setReleaseData((prev) => ({
                              ...prev,
                              tracks: updated,
                            }));
                          }}
                          className="w-full bg-transparent border-b border-[#B6B09F]/20 focus:border-[#EAE4D5] outline-none text-[#EAE4D5] text-sm py-1 transition-colors"
                        />
                        <p className="text-[10px] text-[#B6B09F]/50 mt-1">
                          Appears as "Artist A & Artist B"
                        </p>
                      </div>

                      {/* TRACK FEATURED ARTISTS */}
                      <div>
                        <label className="text-xs text-[#B6B09F] mb-1 block">
                          Track Featured Artist(s)
                        </label>
                        <input
                          type="text"
                          value={track.featuredArtists || ""}
                          placeholder="Features, comma separated"
                          onChange={(e) => {
                            const updated = [...releaseData.tracks];
                            updated[index].featuredArtists = e.target.value;
                            setReleaseData((prev) => ({
                              ...prev,
                              tracks: updated,
                            }));
                          }}
                          className="w-full bg-transparent border-b border-[#B6B09F]/20 focus:border-[#EAE4D5] outline-none text-[#EAE4D5] text-sm py-1 transition-colors"
                        />
                        <p className="text-[10px] text-[#B6B09F]/50 mt-1">
                          Appears as "Artist A feat. Artist C"
                        </p>
                      </div>
                    </div>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <span className="text-xs text-[#B6B09F]">Explicit</span>
                      <input
                        type="checkbox"
                        checked={track.explicit}
                        onChange={(e) => {
                          const updated = [...releaseData.tracks];
                          updated[index].explicit = e.target.checked;
                          setReleaseData((prev) => ({
                            ...prev,
                            tracks: updated,
                          }));
                        }}
                        className="w-4 h-4 accent-[#EAE4D5]"
                      />
                    </label>
                    <button
                      onClick={() =>
                        setReleaseData((prev) => ({
                          ...prev,
                          tracks: prev.tracks.filter((t) => t.id !== track.id),
                        }))
                      }
                      className="text-[#B6B09F]/40 hover:text-red-500 transition-colors ml-2"
                    >
                      <FaTrash />
                    </button>
                  </Reorder.Item>
                ))}
              </Reorder.Group>
            )}
          </div>

          <div className="flex flex-col md:flex-row justify-between gap-4 pt-6 border-t border-[#B6B09F]/10">
            <button
              onClick={() => setStep(1)}
              className="flex items-center justify-center gap-2 px-6 py-3 border border-[#B6B09F]/30 text-[#EAE4D5] rounded-lg hover:bg-[#B6B09F]/10 transition-colors"
            >
              <FaArrowLeft className="text-sm" /> Back to Details
            </button>

            <div className="flex flex-col md:flex-row gap-3">
              <button
                onClick={() => handleSubmit(true)}
                disabled={isSubmitting}
                className="flex items-center justify-center gap-2 px-6 py-3 border border-[#B6B09F]/30 text-[#EAE4D5] font-bold rounded-lg hover:bg-[#B6B09F]/10 transition-colors disabled:opacity-30"
              >
                <FaSave className="text-sm" /> Save Draft
              </button>
              <button
                onClick={() => {
                  handleSubmit(true);
                  setStep(3);
                }}
                disabled={releaseData.tracks.length === 0 || isSubmitting}
                className="flex items-center justify-center gap-2 px-8 py-3 bg-[#EAE4D5] text-[#0a0a0a] font-bold rounded-lg hover:bg-opacity-90 transition-colors disabled:opacity-30"
              >
                Review Release <FaArrowRight className="text-sm" />
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* STEP 3: REVIEW & SUBMIT */}
      {step === 3 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="p-6 bg-[#050505] border border-[#B6B09F]/10 rounded-xl">
            <h2 className="text-xl font-semibold text-[#EAE4D5] border-b border-[#B6B09F]/10 pb-2 mb-4">
              Final Review
            </h2>
            <div className="flex flex-col md:flex-row gap-6 mb-6">
              <div className="w-32 h-32 bg-[#0a0a0a] rounded-lg overflow-hidden border border-[#B6B09F]/10 flex-shrink-0">
                <img
                  src={releaseData.artwork}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
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
                  <span className="text-[#B6B09F]">Genre:</span>
                  <p className="text-[#EAE4D5] font-medium">
                    {releaseData.genre}
                  </p>
                </div>
                <div>
                  <span className="text-[#B6B09F]">Date:</span>
                  <p className="text-[#EAE4D5] font-medium">
                    {releaseData.releaseDate}
                  </p>
                </div>
                <div>
                  <span className="text-[#B6B09F]">Label:</span>
                  <p className="text-[#EAE4D5] font-medium">
                    {releaseData.label || "Self-Released"}
                  </p>
                </div>
                <div>
                  <span className="text-[#B6B09F]">UPC:</span>
                  <p className="text-[#EAE4D5] font-medium">
                    {releaseData.hasUPC
                      ? releaseData.upcCode
                      : "Auto-Generated"}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-[#0a0a0a] border border-[#B6B09F]/10 rounded-lg p-4">
              <h3 className="text-[#EAE4D5] font-medium mb-2 border-b border-[#B6B09F]/10 pb-1">
                Tracklist Order
              </h3>
              <ul className="space-y-1">
                {releaseData.tracks.map((track, idx) => (
                  <li
                    key={idx}
                    className="text-sm text-[#B6B09F] flex justify-between"
                  >
                    <span>
                      {idx + 1}. {track.title}
                    </span>
                    {track.explicit && (
                      <span className="text-xs text-red-400 font-bold uppercase">
                        Explicit
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* 🚀 UPDATED LEGAL GATE */}
          <div
            className={`p-4 rounded-lg border transition-all ${
              hasSigned
                ? "bg-[#B6B09F]/10 border-[#B6B09F]/30"
                : "bg-red-500/5 border-red-500/20"
            }`}
          >
            <label className="flex items-start gap-3 cursor-pointer group">
              <div className="relative flex items-center justify-center mt-1">
                <input
                  type="checkbox"
                  checked={hasSigned}
                  onChange={(e) => {
                    if (e.target.checked && !hasSigned) {
                      setIsLegalModalOpen(true);
                    } else {
                      setHasSigned(false);
                      setLegalName("");
                    }
                  }}
                  className="w-4 h-4 appearance-none border border-[#B6B09F]/40 rounded bg-[#0a0a0a] checked:bg-[#EAE4D5] checked:border-[#EAE4D5] transition-all cursor-pointer"
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
                    onClick={(e) => {
                      e.preventDefault();
                      setIsLegalModalOpen(true);
                    }}
                    className="text-[#EAE4D5] font-bold underline decoration-[#B6B09F]/50 hover:decoration-white transition-all"
                  >
                    80/20 Royalty Split & Distribution Agreement
                  </button>
                  , where 80% of net receipts are paid to my account.
                </span>

                {/* 🚀 SIGNATURE RECEIPT */}
                {hasSigned && (
                  <div className="mt-3 bg-green-500/10 border border-green-500/20 rounded px-3 py-2 inline-block">
                    <p className="text-green-400 text-xs italic flex items-center gap-2">
                      <FaCheck className="text-[10px]" /> Signed electronically
                      by:{" "}
                      <span className="font-bold not-italic">{legalName}</span>
                    </p>
                  </div>
                )}
              </div>
            </label>
          </div>

          {/* Progress Bar (Shows up during upload) */}
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
              className="flex-1 py-4 border border-[#B6B09F]/20 text-[#B6B09F] font-bold rounded-lg hover:bg-[#B6B09F]/5 transition-all disabled:opacity-50 uppercase tracking-widest text-xs"
            >
              Back to Tracks
            </button>

            {/* Added an explicit "Save as Draft" here too, in case they aren't ready to split royalties yet */}
            <button
              onClick={() => handleSubmit(true)}
              disabled={isSubmitting}
              className="flex-1 py-4 border border-[#B6B09F]/20 text-[#EAE4D5] font-bold rounded-lg hover:bg-[#B6B09F]/5 transition-all disabled:opacity-50 uppercase tracking-widest text-xs flex items-center justify-center gap-2"
            >
              <FaSave /> Save Draft
            </button>

            <button
              onClick={() => handleSubmit(false)}
              disabled={isSubmitting || !hasSigned}
              className={`flex-[2] py-4 rounded-lg font-bold text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${
                hasSigned && !isSubmitting
                  ? "bg-[#EAE4D5] text-[#0a0a0a] hover:bg-white"
                  : "bg-[#B6B09F]/10 text-[#B6B09F]/40 cursor-not-allowed"
              }`}
            >
              {isSubmitting
                ? `Uploading (${uploadProgress}%)...`
                : "Submit Release for Review"}
              {!isSubmitting && <FaArrowRight className="text-sm" />}
            </button>
          </div>
        </motion.div>
      )}

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
    </div>
  );
};

export default NewReleaseBuilder;
