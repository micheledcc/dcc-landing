// Keep reference IDs in URLs and selections. Resolve only their content on the server.
export const DRIVE_FOLDER = "application/vnd.google-apps.folder";
export const DRIVE_SHORTCUT = "application/vnd.google-apps.shortcut";

export interface DriveMetadata {
  id?: string | null;
  name?: string | null;
  mimeType?: string | null;
  size?: string | null;
  modifiedTime?: string | null;
  trashed?: boolean | null;
  shortcutDetails?: {
    targetId?: string | null;
    targetMimeType?: string | null;
    targetResourceKey?: string | null;
  } | null;
}

export interface DriveTransport {
  list(folderId: string, pageToken?: string): Promise<{
    files?: DriveMetadata[] | null;
    nextPageToken?: string | null;
  }>;
  metadata(fileId: string, resourceKey?: string): Promise<DriveMetadata>;
}

export interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  size: number;
  modifiedTime: string;
  isFolder: boolean;
  children?: DriveFile[];
  path?: string;
}

export async function resolveDriveReference(transport: DriveTransport, reference: DriveMetadata) {
  if (!reference.id || !reference.name || reference.trashed) throw new Error("File unavailable");
  let content = reference;
  let resourceKey: string | undefined;
  if (reference.mimeType === DRIVE_SHORTCUT) {
    const details = reference.shortcutDetails;
    if (!details?.targetId || details.targetMimeType === DRIVE_FOLDER) {
      throw new Error("Only file shortcuts are supported in the data room");
    }
    resourceKey = details.targetResourceKey || undefined;
    content = await transport.metadata(details.targetId, resourceKey);
  }
  if (!content.id || !content.mimeType || content.trashed ||
      content.mimeType === DRIVE_SHORTCUT || content.mimeType === DRIVE_FOLDER) {
    throw new Error("File unavailable");
  }
  return {
    contentId: content.id,
    resourceKey,
    file: {
      id: reference.id,
      name: reference.name,
      mimeType: content.mimeType,
      size: Number(content.size || 0),
      modifiedTime: content.modifiedTime || "",
      isFolder: false,
    } satisfies DriveFile,
  };
}

export async function readDriveTree(
  transport: DriveTransport,
  folderId: string,
  allowedFileIds?: string[] | null,
  pathPrefix = "",
  ancestors = new Set<string>()
): Promise<DriveFile[]> {
  if (ancestors.has(folderId)) throw new Error("Folder cycle");
  const visited = new Set(ancestors).add(folderId);
  const children: DriveMetadata[] = [];
  let pageToken: string | undefined;
  const pages = new Set<string>();
  do {
    const page = await transport.list(folderId, pageToken);
    children.push(...(page.files || []));
    pageToken = page.nextPageToken || undefined;
    if (pageToken && pages.has(pageToken)) throw new Error("Repeated Drive page");
    if (pageToken) pages.add(pageToken);
  } while (pageToken);

  const items = await Promise.all(children.map(async (reference): Promise<DriveFile | null> => {
    if (!reference.id || !reference.name || reference.trashed) return null;
    const path = pathPrefix ? `${pathPrefix}/${reference.name}` : reference.name;
    if (reference.mimeType === DRIVE_FOLDER) {
      const children = await readDriveTree(transport, reference.id, allowedFileIds, path, visited);
      // Empty folders have no investor content, including when no filter is supplied.
      if (!children.length) return null;
      return { id: reference.id, name: reference.name, mimeType: DRIVE_FOLDER,
        size: 0, modifiedTime: reference.modifiedTime || "", isFolder: true, children, path };
    }
    // A selected shortcut never authorizes its target ID as a separate URL or selection.
    if (allowedFileIds && !allowedFileIds.includes(reference.id)) return null;
    const resolved = await resolveDriveReference(transport, reference);
    return { ...resolved.file, path };
  }));
  return items.filter((item): item is DriveFile => item !== null);
}

export function flattenDriveTree(tree: DriveFile[]): DriveFile[] {
  return tree.flatMap((item) => item.isFolder ? flattenDriveTree(item.children || []) : [item]);
}
