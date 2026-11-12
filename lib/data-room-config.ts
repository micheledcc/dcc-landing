// Server-side only. Existing room_links keep their individually saved folder ID.
export function getDataRoomFolderId(): string {
  const id = process.env.GOOGLE_DRIVE_DATA_ROOM_FOLDER_ID?.trim() || "1GjNWfzNvPtFmsy0IMddsqy4ghlezjscD";
  if (!/^[A-Za-z0-9_-]+$/.test(id)) throw new Error("Invalid data-room folder ID");
  return id;
}
