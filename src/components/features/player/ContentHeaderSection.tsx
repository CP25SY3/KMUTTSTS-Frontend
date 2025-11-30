import { ArrowLeft, Heart } from "lucide-react";
import { Button } from "../../ui/button";

export default function ContentHeaderSection({
  onBack,
  title,
  artist,
}: {
  onBack?: () => void;
  title: string;
  artist: string;
}) {
  return (
    <div className="relative z-10 flex items-center justify-between gap-4 shrink-0">
      <div className="flex items-center gap-3">
        {onBack && (
          <Button
            variant="ghost"
            size="icon"
            className="text-foreground hover:bg-muted rounded-full"
            onClick={onBack}
          >
            <ArrowLeft className="h-6 w-6" />
          </Button>
        )}
        <div className="flex flex-col">
          <span className="text-xs font-semibold tracking-[0.2em] text-muted-foreground uppercase">
            Now Playing
          </span>
          <span className="text-lg font-semibold leading-tight line-clamp-1">
            {title}
          </span>
          <span className="text-sm text-muted-foreground line-clamp-1">
            {artist}
          </span>
        </div>
      </div>

      <Button
        variant="ghost"
        size="icon"
        className="text-foreground hover:bg-muted rounded-full"
      >
        <Heart className="h-6 w-6" />
      </Button>
    </div>
  );
}
