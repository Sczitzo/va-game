import { MediaType } from '@prisma/client';

interface MediaPlayerProps {
  media: {
    id: string;
    url: string;
    type: MediaType;
    name: string;
    description: string | null;
  };
}

export function MediaPlayer({ media }: MediaPlayerProps) {
  switch (media.type) {
    case 'VIDEO':
      return (
        <div className="space-y-2">
          <video
            controls
            className="w-full rounded-lg"
            aria-label={`Video: ${media.name}`}
            title={media.name}
          >
            <source src={media.url} />
            Your browser does not support the video tag.
          </video>
          {media.description && (
            <p className="text-sm text-gray-600 italic px-1">{media.description}</p>
          )}
        </div>
      );

    case 'AUDIO':
      return (
        <div className="space-y-2">
          <audio
            controls
            className="w-full"
            aria-label={`Audio: ${media.name}`}
            title={media.name}
          >
            <source src={media.url} />
            Your browser does not support the audio tag.
          </audio>
          {media.description && (
            <p className="text-sm text-gray-600 italic px-1">{media.description}</p>
          )}
        </div>
      );

    case 'IMAGE':
      return (
        <img
          src={media.url}
          alt={media.description || media.name || "Session media"}
          title={media.name}
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
            className="text-blue-600 hover:underline focus-visible-ring flex flex-col gap-1"
            aria-label={`View Document: ${media.name} (opens in new tab)`}
          >
            <span className="font-semibold">{media.name}</span>
            {media.description && (
              <span className="text-sm text-gray-600 font-normal">{media.description}</span>
            )}
            <span className="text-xs text-gray-500 mt-1">Opens in new tab</span>
          </a>
        </div>
      );

    default:
      return null;
  }
}

