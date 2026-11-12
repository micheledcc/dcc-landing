export function snapshotRoomSelection(availableIds: string[], requested: unknown, allowEmpty = true): string[] {
  const selected = requested ?? availableIds;
  if (!Array.isArray(selected) || (!allowEmpty && !selected.length) ||
      !selected.every((id) => typeof id === "string" && availableIds.includes(id))) {
    throw new Error("Choose files from this data room");
  }
  return [...new Set(selected as string[])];
}
