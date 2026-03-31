import React, { useState } from "react";
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
} from "react-icons/fa";
import axios from "../../lib/axios";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const NewReleaseBuilder = () => {
  const [step, setStep] = useState(1);
  const navigate = useNavigate();
  const [artworkUploading, setArtworkUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [artworkPreview, setArtworkPreview] = useState(null);

  // Master State for the Release
  const [releaseData, setReleaseData] = useState({
    releaseType: "Single",
    title: "",
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

    // 1. Set local preview immediately for UX
    const localUrl = URL.createObjectURL(file);
    setArtworkPreview(localUrl);

    if (file.size > 10 * 1024 * 1024) {
      toast.error("File is too large. Max size for covers is 10MB.");
      return;
    }

    const formDataToSend = new FormData();
    formDataToSend.append("artwork", file);
    // Pass the title so the backend can create the folder
    formDataToSend.append("releaseTitle", releaseData.title || "untitled");

    setArtworkUploading(true);
    try {
      const { data } = await axios.post(
        "/api/releases/release-artwork",
        formDataToSend,
        { headers: { "Content-Type": "multipart/form-data" } },
      );

      setReleaseData((prev) => ({ ...prev, artwork: data.imageUrl }));
      // 2. Once uploaded, we can replace the local preview with the real S3 URL
      setArtworkPreview(data.imageUrl);
      toast.success("Artwork uploaded!");
    } catch (error) {
      toast.error("Failed to upload artwork.");
      setArtworkPreview(null); // Clear preview on error
    } finally {
      setArtworkUploading(false);
    }
  };

  // 🚀 NEW: The Master Submission Loop
  const handleSubmit = async () => {
    console.group("🚀 Starting Submission Process");
    console.log("Initial Release Data:", releaseData);

    if (!releaseData.tracks || releaseData.tracks.length === 0) {
      console.warn("Aborting: No tracks found.");
      toast.error("Please add at least one track.");
      console.groupEnd();
      return;
    }

    setIsSubmitting(true);
    const toastId = toast.loading("Initiating upload process...");

    try {
      const uploadedTracks = [];

      for (let i = 0; i < releaseData.tracks.length; i++) {
        const track = releaseData.tracks[i];
        console.group(`🎵 Processing Track ${i + 1}: ${track.title}`);

        // Safety Check 1: File existence
        if (!track.file) {
          throw new Error(`File missing for track: ${track.title}`);
        }
        console.log("Track File Object:", track.file);

        // --- STEP A: Presigned URL ---
        console.log("Step A: Requesting Presigned URL...");
        const { data: presignedData } = await axios.post(
          "/api/releases/get-presigned-url",
          {
            fileName: track.file.name,
            fileType: track.file.type,
            releaseTitle: releaseData.title,
          },
        );
        console.log("Step A Success. Received:", presignedData);

        // --- STEP B: S3 Upload ---
        console.log("Step B: Sending PUT request to S3...");

        // FIXED: Safer way to handle the header cleanup to avoid the "null to object" error
        await axios.put(presignedData.uploadUrl, track.file, {
          headers: {
            "Content-Type": track.file.type,
          },
          transformRequest: [
            (data, headers) => {
              // Only attempt to delete if headers actually exist
              if (headers) {
                if (headers.common) delete headers.common["Authorization"];
                delete headers["Authorization"];
              }
              return data;
            },
          ],
        });
        console.log("Step B Success: File is in S3.");

        uploadedTracks.push({
          title: track.title,
          fileUrl: presignedData.fileUrl,
          fileKey: presignedData.fileKey,
          isrc: track.isrc,
          explicit: track.explicit,
          genre: track.genre,
          trackNumber: i + 1,
          featuredArtists: track.featuredArtists
            ? track.featuredArtists
                .split(",")
                .map((a) => a.trim())
                .filter(Boolean)
            : [],
        });

        console.groupEnd(); // End Track Group
      }

      // --- STEP C: Final Mongo Save ---
      console.group("💾 Saving to Database");
      const finalPayload = {
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
        // Split the release-level string into an array
        featuredArtists: releaseData.featuredArtists
          ? releaseData.featuredArtists
              .split(",")
              .map((a) => a.trim())
              .filter(Boolean)
          : [],
        tracks: uploadedTracks,
      };
      console.log("Final Payload being sent to /api/releases:", finalPayload);

      await axios.post("/api/releases", finalPayload);
      console.log("Step C Success: Database updated.");
      console.groupEnd();

      toast.success("Release submitted successfully!", { id: toastId });
      setTimeout(() => navigate("/dashboard/releases"), 1500);
    } catch (error) {
      console.error("❌ SUBMISSION ERROR:");
      console.log("Error Name:", error.name);
      console.log("Error Message:", error.message);
      if (error.response) {
        console.log("Server Response Data:", error.response.data);
      }

      toast.error(error.message || "An error occurred during upload.", {
        id: toastId,
      });
    } finally {
      setIsSubmitting(false);
      console.groupEnd(); // End Main Process Group
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

  return (
    <div className="max-w-4xl mx-auto pb-12">
      {/* HEADER & PROGRESS BAR */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#EAE4D5]">
          Create New Release
        </h1>
        <div className="flex gap-2 mt-6">
          <div
            className={`h-2 flex-1 rounded-full ${step >= 1 ? "bg-[#EAE4D5]" : "bg-[#B6B09F]/20"}`}
          ></div>
          <div
            className={`h-2 flex-1 rounded-full ${step >= 2 ? "bg-[#EAE4D5]" : "bg-[#B6B09F]/20"}`}
          ></div>
          <div
            className={`h-2 flex-1 rounded-full ${step >= 3 ? "bg-[#EAE4D5]" : "bg-[#B6B09F]/20"}`}
          ></div>
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
            {/* FEATURED ARTISTS (RELEASE LEVEL) */}
            <div className="mt-4">
              <label className={labelStyle}>
                Featured Artists (Release Level)
              </label>
              <input
                type="text"
                name="featuredArtists"
                value={releaseData.featuredArtists}
                onChange={handleChange}
                className={inputStyle}
                placeholder="e.g. Burna Boy, Wizkid (comma separated)"
              />
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
                  placeholder="e.g. 2026 Horme Music Worldwide"
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
                  placeholder="e.g. 2026 Horme Music Worldwide"
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

          <div className="flex justify-end">
            <button
              onClick={() => {
                const error = validateStep1();
                if (error) {
                  toast.error(error);
                  return;
                }
                setStep(2);
              }}
              className="flex items-center gap-2 px-6 py-3 bg-[#EAE4D5] text-[#0a0a0a] font-bold rounded-lg hover:bg-opacity-90 transition-colors"
            >
              Save & Next: Add Tracks <FaArrowRight className="text-sm" />
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
                    featuredArtists: "",
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
                    <div className="mt-2 col-span-1 md:col-span-2">
                      <label className="text-xs text-[#B6B09F] mb-1 block">
                        Track Featured Artists
                      </label>
                      <input
                        type="text"
                        value={track.featuredArtists || ""}
                        placeholder="Comma separated names..."
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

          <div className="flex justify-between">
            <button
              onClick={() => setStep(1)}
              className="flex items-center gap-2 px-6 py-3 border border-[#B6B09F]/30 text-[#EAE4D5] rounded-lg hover:bg-[#B6B09F]/10 transition-colors"
            >
              <FaArrowLeft className="text-sm" /> Back to Details
            </button>
            <button
              onClick={() => setStep(3)}
              disabled={releaseData.tracks.length === 0}
              className="flex items-center gap-2 px-6 py-3 bg-[#EAE4D5] text-[#0a0a0a] font-bold rounded-lg hover:bg-opacity-90 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              Save & Next: Review <FaArrowRight className="text-sm" />
            </button>
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

          <div className="bg-[#B6B09F]/5 border border-[#B6B09F]/20 p-4 rounded-lg text-sm text-[#B6B09F] flex gap-3">
            <FaInfoCircle className="text-[#EAE4D5] mt-0.5 flex-shrink-0" />
            <p>
              By submitting this release, you confirm that you own all master
              rights or have full clearance for all samples used. Your release
              and artwork will be manually reviewed by our team before being
              delivered to DSPs.
            </p>
          </div>

          <div className="flex justify-between">
            <button
              onClick={() => setStep(2)}
              className="flex items-center gap-2 px-6 py-3 border border-[#B6B09F]/30 text-[#EAE4D5] rounded-lg hover:bg-[#B6B09F]/10 transition-colors"
              disabled={isSubmitting}
            >
              <FaArrowLeft className="text-sm" /> Back to Tracks
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex items-center gap-2 px-6 py-3 bg-[#EAE4D5] text-[#0a0a0a] font-bold rounded-lg hover:bg-opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting
                ? "Uploading Masters..."
                : "Submit Release for Review"}{" "}
              <FaArrowRight className="text-sm" />
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default NewReleaseBuilder;
