import StreamCard from "./ContentCard";

// Mock data for university streams
const streamData = [
  {
    id: "1",
    title: "Advanced Data Structures & Algorithms - Live Coding Session",
    streamerName: "Prof. Anderson",
    game: "Computer Science",
    viewerCount: "1.2k",
    thumbnail: "",
    isLive: false,
  },
  {
    id: "2", 
    title: "Mechanical Engineering Workshop: 3D Printing Projects",
    streamerName: "Dr. Mitchell",
    game: "Engineering",
    viewerCount: "2.8k",
    thumbnail: "",
    isLive: false,
  },
  {
    id: "3",
    title: "Annual Research Symposium: AI in Healthcare",
    streamerName: "Dr. Sarah Chen",
    game: "Research Presentation",
    viewerCount: "5.7k",
    thumbnail: "",
    isLive: false,
  },
  {
    id: "4",
    title: "Career Fair 2024: Tech Industry Representatives",
    streamerName: "Career Services",
    game: "Career Fair", 
    viewerCount: "4.5k",
    thumbnail: "",
    isLive: false,
  },
  {
    id: "5",
    title: "Final Year Project Defense: Smart Home IoT System",
    streamerName: "Alex Rodriguez",
    game: "Final Year Project",
    viewerCount: "1.2k", 
    thumbnail: "",
    isLive: false,
  },
  {
    id: "6",
    title: "Mathematics Seminar: Introduction to Calculus III",
    streamerName: "Prof. Williams",
    game: "Mathematics",
    viewerCount: "890",
    thumbnail: "",
    isLive: false,
  },
  {
    id: "7",
    title: "Chemistry Lab Session: Organic Synthesis Experiments",
    streamerName: "Dr. Thompson",
    game: "Chemistry",
    viewerCount: "1.5k",
    thumbnail: "",
    isLive: false,
  },
  {
    id: "8",
    title: "University Orientation Week: Welcome New Students",
    streamerName: "Student Affairs",
    game: "Orientation",
    viewerCount: "3.2k",
    thumbnail: "",
    isLive: false,
  },
];

export default function StreamGrid() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4">
      {streamData.map((stream) => (
        <StreamCard
          key={stream.id}
          title={stream.title}
          creatorName={stream.streamerName}
          subject={stream.game}
          viewerCount={stream.viewerCount}
          thumbnail={stream.thumbnail}
          isLive={stream.isLive}
        />
      ))}
    </div>
  );
}
