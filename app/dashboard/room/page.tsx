import { getAuth } from "@/lib/auth";
import { listRoomLinks, getAllRoomAnalytics } from "@/lib/room";
import { RoomManager } from "./room-manager";

export const dynamic = "force-dynamic";

export default async function RoomDashboardPage() {
  const auth = await getAuth();
  if (!auth) return null;

  const [links, analytics] = await Promise.all([
    listRoomLinks(),
    getAllRoomAnalytics(),
  ]);

  return (
    <div>
      <h1 className="mb-6 font-['Spectral',Georgia,serif] text-3xl font-light">
        Data Room
      </h1>
      <RoomManager initialLinks={links as any[]} analytics={analytics} />
    </div>
  );
}
