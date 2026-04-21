const SnippetPlayer = ({ url }) => {
  const [playing, setPlaying] = useState(false);
  const audioRef = React.useRef(new Audio(url));

  const togglePlay = () => {
    if (playing) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setPlaying(!playing);
  };

  return (
    <button
      onClick={togglePlay}
      className={`flex items-center gap-2 text-sm px-4 py-2 rounded-lg transition-colors ${
        playing
          ? "bg-[#EAE4D5] text-black"
          : "bg-[#B6B09F]/5 text-[#B6B09F] hover:text-[#EAE4D5]"
      }`}
    >
      {playing ? <FaTimes /> : <FaPlayCircle />}
      {playing ? "Stop Preview" : "Play 30s Snippet"}
    </button>
  );
};

export default SnippetPlayer;
