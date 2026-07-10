import { google } from "googleapis";

function getAuth() {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const refreshToken = process.env.GOOGLE_REFRESH_TOKEN;

  if (!clientId || !clientSecret || !refreshToken) {
    throw new Error(
      "GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, and GOOGLE_REFRESH_TOKEN must be set"
    );
  }

  const oauth2 = new google.auth.OAuth2(clientId, clientSecret);
  oauth2.setCredentials({ refresh_token: refreshToken });
  return oauth2;
}

function getSheetId() {
  const id = process.env.GOOGLE_SHEET_ID;
  if (!id) throw new Error("GOOGLE_SHEET_ID not set");
  return id;
}

function getRange() {
  const range = process.env.GOOGLE_SHEET_RANGE || "Sheet1";
  // Quote sheet names with spaces for the API
  if (range.includes(" ") && !range.startsWith("'")) {
    return `'${range}'`;
  }
  return range;
}

export async function readPipeline(): Promise<{
  headers: string[];
  rows: Record<string, string>[];
}> {
  const sheets = google.sheets({ version: "v4", auth: getAuth() });
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: getSheetId(),
    range: getRange(),
  });

  const values = res.data.values || [];
  if (values.length === 0) return { headers: [], rows: [] };

  const headers = values[0] as string[];
  const rows = values.slice(1).map((row) => {
    const obj: Record<string, string> = {};
    headers.forEach((h, i) => {
      obj[h] = (row[i] as string) || "";
    });
    return obj;
  });

  return { headers, rows };
}

export async function appendRow(
  data: Record<string, string>,
  adminName: string
) {
  const sheets = google.sheets({ version: "v4", auth: getAuth() });
  const { headers } = await readPipeline();

  // Ensure tracking columns exist
  if (!headers.includes("_modified_by")) headers.push("_modified_by");
  if (!headers.includes("_modified_at")) headers.push("_modified_at");

  data["_modified_by"] = adminName;
  data["_modified_at"] = new Date().toISOString();

  const row = headers.map((h) => data[h] || "");

  await sheets.spreadsheets.values.append({
    spreadsheetId: getSheetId(),
    range: getRange(),
    valueInputOption: "USER_ENTERED",
    requestBody: { values: [row] },
  });
}

export async function updateRow(
  rowIndex: number,
  data: Record<string, string>,
  adminName: string
) {
  const sheets = google.sheets({ version: "v4", auth: getAuth() });
  const { headers } = await readPipeline();

  data["_modified_by"] = adminName;
  data["_modified_at"] = new Date().toISOString();

  const row = headers.map((h) => data[h] || "");
  const sheetRange = getRange();
  const range = `${sheetRange}!A${rowIndex + 2}`; // +2: 1-indexed + header row

  await sheets.spreadsheets.values.update({
    spreadsheetId: getSheetId(),
    range,
    valueInputOption: "USER_ENTERED",
    requestBody: { values: [row] },
  });
}

// ============================================================
// Unified pipeline: reads all 3 tabs, normalizes into common shape
// Does NOT affect readPipeline() which share links depend on
// ============================================================

export interface PipelineRow {
  name: string;
  type: string;
  amount: string;
  stage: string;
  prob: string;
  weighted: string;
  nextAction: string;
  owner: string;
  notes: string;
  email: string;
  lastUpdate: string;
  source: "commitments" | "angels-pipeline" | "vc-pipeline";
  sourceTab: string;
  sourceRowIndex: number;
  raw: Record<string, string>;
}

async function readSheetTab(tabName: string): Promise<{
  headers: string[];
  rows: Record<string, string>[];
}> {
  const sheets = google.sheets({ version: "v4", auth: getAuth() });
  const quotedTab = tabName.includes(" ") ? `'${tabName}'` : tabName;
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: getSheetId(),
    range: quotedTab,
  });
  const values = res.data.values || [];
  if (values.length === 0) return { headers: [], rows: [] };
  const headers = values[0] as string[];
  const rows = values.slice(1).map((row) => {
    const obj: Record<string, string> = {};
    headers.forEach((h, i) => { obj[h] = (row[i] as string) || ""; });
    return obj;
  });
  return { headers, rows };
}

function normalizeRow(
  raw: Record<string, string>,
  source: PipelineRow["source"],
  sourceTab: string,
  sourceRowIndex: number,
  inferredType?: string
): PipelineRow {
  // Map columns based on source
  const isCommitments = source === "commitments";
  const isVC = source === "vc-pipeline";

  return {
    name: raw["Name"] || raw["Fund"] || "",
    type: raw["Type"] || inferredType || "",
    amount: raw["Amount ($)"] || raw["Target ($)"] || "",
    stage: raw["Stage"] || "",
    prob: raw["Prob"] || "",
    weighted: raw["Weighted ($)"] || "",
    nextAction: raw["Next Action"] || "",
    owner: raw["Owner"] || "",
    notes: raw["Profile / Notes"] || raw["Notes"] || "",
    email: raw["Email"] || "",
    lastUpdate: raw["Last Update"] || raw["_modified_at"] || "",
    source,
    sourceTab,
    sourceRowIndex,
    raw,
  };
}

export async function readAllPipeline(): Promise<PipelineRow[]> {
  const [commitments, angels, vcs] = await Promise.all([
    readSheetTab("Master - Commitments").catch(() => ({ headers: [], rows: [] })),
    readSheetTab("Angels - Pipeline").catch(() => ({ headers: [], rows: [] })),
    readSheetTab("VC - Pipeline").catch(() => ({ headers: [], rows: [] })),
  ]);

  const all: PipelineRow[] = [];

  commitments.rows.forEach((raw, i) => {
    all.push(normalizeRow(raw, "commitments", "Master - Commitments", i));
  });

  angels.rows.forEach((raw, i) => {
    all.push(normalizeRow(raw, "angels-pipeline", "Angels - Pipeline", i, "Angel"));
  });

  vcs.rows.forEach((raw, i) => {
    all.push(normalizeRow(raw, "vc-pipeline", "VC - Pipeline", i, "VC"));
  });

  return all;
}

export async function updateSourceRow(
  sourceTab: string,
  rowIndex: number,
  updates: Record<string, string>,
  adminName: string
) {
  const sheets = google.sheets({ version: "v4", auth: getAuth() });
  const { headers, rows } = await readSheetTab(sourceTab);

  if (rowIndex < 0 || rowIndex >= rows.length) {
    throw new Error("Invalid row index");
  }

  const merged = { ...rows[rowIndex], ...updates };
  // Add tracking if the tab supports it
  if (headers.includes("_modified_by") || sourceTab === "Master - Commitments") {
    merged["_modified_by"] = adminName;
    merged["_modified_at"] = new Date().toISOString();
  }

  const row = headers.map((h) => merged[h] || "");
  const quotedTab = sourceTab.includes(" ") ? `'${sourceTab}'` : sourceTab;
  const range = `${quotedTab}!A${rowIndex + 2}`;

  await sheets.spreadsheets.values.update({
    spreadsheetId: getSheetId(),
    range,
    valueInputOption: "USER_ENTERED",
    requestBody: { values: [row] },
  });
}
