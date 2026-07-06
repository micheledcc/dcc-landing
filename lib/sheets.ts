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
