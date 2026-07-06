import { google } from "googleapis";

function getAuth() {
  const key = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
  if (!key) throw new Error("GOOGLE_SERVICE_ACCOUNT_KEY not set");

  const credentials = JSON.parse(
    Buffer.from(key, "base64").toString("utf-8")
  );

  return new google.auth.GoogleAuth({
    credentials,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
}

function getSheetId() {
  const id = process.env.GOOGLE_SHEET_ID;
  if (!id) throw new Error("GOOGLE_SHEET_ID not set");
  return id;
}

function getRange() {
  return process.env.GOOGLE_SHEET_RANGE || "Sheet1";
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
