import { MediaType } from '@prisma/client';

interface MediaPlayerProps {
  media: {
    id: string;
    url: string;
    type: MediaType;
  };
}

export function MediaPlayer({ media }: MediaPlayerProps) {
  switch (media.type) {
    case 'VIDEO':
      return (
        <video
          controls
          className="w-full rounded-lg"
          aria-label={`Video: ${media.url}`}
        >
          <source src={media.url} />
          Your browser does not support the video tag.
        </video>
      );

    case 'AUDIO':
      return (
        <audio
          controls
          className="w-full"
          aria-label={`Audio: ${media.url}`}
        >
          <source src={media.url} />
          Your browser does not support the audio tag.
        </audio>
      );

    case 'IMAGE':
      return (
        <img
          src={media.url}
          alt="Session media"
          className="w-full rounded-lg"
        />
      );

    case 'DOCUMENT':
      return (
        <div className="border-2 border-black rounded-lg p-4">
          <a
            href={media.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline focus-visible-ring"
          >
            View Document (opens in new tab)
          </a>
        </div>
      );

    default:
      return null;
  }
}

