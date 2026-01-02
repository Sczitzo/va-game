import type { ParticipantListUpdatePayload } from '@/types/websocket';

interface ParticipantListProps {
  participants: ParticipantListUpdatePayload['participants'];
}

export function ParticipantList({ participants }: ParticipantListProps) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-lg font-semibold mb-4">
        Participants ({participants.length})
      </h2>
      
      {participants.length === 0 ? (
        <p className="text-gray-500">No participants yet</p>
      ) : (
        <div className="space-y-2">
          {participants.map((participant) => (
            <div
              key={participant.id}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
            >
              <span className="font-medium">{participant.nickname}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

