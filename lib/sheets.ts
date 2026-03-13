// lib/sheets.ts
import { google } from 'googleapis'
import { Project, Change } from '@/types'

function getAuth() {
  return new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    },
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  })
}

function getSheets() {
  return google.sheets({ version: 'v4', auth: getAuth() })
}

const SHEET_ID = process.env.GOOGLE_SHEET_ID!

// ─── PROJECTS ───────────────────────────────────────────

export async function getProjects(ownerEmail: string): Promise<Project[]> {
  const sheets = getSheets()
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: 'Projects!A2:G',
  })
  const rows = res.data.values || []
  return rows
    .map((row) => ({
      id: row[0],
      name: row[1],
      clientName: row[2],
      startDate: row[3],
      status: row[4],
      notes: row[5],
      ownerEmail: row[6],
    }))
    .filter((p) => p.ownerEmail === ownerEmail) as Project[]
}

export async function addProject(project: Project): Promise<void> {
  const sheets = getSheets()
  await sheets.spreadsheets.values.append({
    spreadsheetId: SHEET_ID,
    range: 'Projects!A:G',
    valueInputOption: 'RAW',
    requestBody: {
      values: [[
        project.id,
        project.name,
        project.clientName,
        project.startDate,
        project.status,
        project.notes,
        project.ownerEmail,
      ]],
    },
  })
}

export async function updateProject(project: Project): Promise<void> {
  const sheets = getSheets()
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: 'Projects!A2:A',
  })
  const rows = res.data.values || []
  const rowIndex = rows.findIndex((r) => r[0] === project.id)
  if (rowIndex === -1) throw new Error('Project not found')
  const sheetRow = rowIndex + 2
  await sheets.spreadsheets.values.update({
    spreadsheetId: SHEET_ID,
    range: `Projects!A${sheetRow}:G${sheetRow}`,
    valueInputOption: 'RAW',
    requestBody: {
      values: [[
        project.id,
        project.name,
        project.clientName,
        project.startDate,
        project.status,
        project.notes,
        project.ownerEmail,
      ]],
    },
  })
}

export async function deleteProject(projectId: string): Promise<void> {
  const sheets = getSheets()
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: 'Projects!A2:A',
  })
  const rows = res.data.values || []
  const rowIndex = rows.findIndex((r) => r[0] === projectId)
  if (rowIndex === -1) throw new Error('Project not found')
  const sheetRow = rowIndex + 2
  await sheets.spreadsheets.values.clear({
    spreadsheetId: SHEET_ID,
    range: `Projects!A${sheetRow}:G${sheetRow}`,
  })
}

// ─── CHANGES ────────────────────────────────────────────

export async function getChanges(projectId: string): Promise<Change[]> {
  const sheets = getSheets()
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: 'Changes!A2:I',
  })
  const rows = res.data.values || []
  return rows
    .filter((row) => row[1] === projectId)
    .map((row) => ({
      id: row[0],
      projectId: row[1],
      title: row[2],
      description: row[3],
      requestedBy: row[4],
      dateRequested: row[5],
      status: row[6],
      value: parseFloat(row[7]) || 0,
      dateCompleted: row[8] || '',
    })) as Change[]
}

export async function addChange(change: Change): Promise<void> {
  const sheets = getSheets()
  await sheets.spreadsheets.values.append({
    spreadsheetId: SHEET_ID,
    range: 'Changes!A:I',
    valueInputOption: 'RAW',
    requestBody: {
      values: [[
        change.id,
        change.projectId,
        change.title,
        change.description,
        change.requestedBy,
        change.dateRequested,
        change.status,
        change.value,
        change.dateCompleted,
      ]],
    },
  })
}

export async function updateChange(change: Change): Promise<void> {
  const sheets = getSheets()
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: 'Changes!A2:A',
  })
  const rows = res.data.values || []
  const rowIndex = rows.findIndex((r) => r[0] === change.id)
  if (rowIndex === -1) throw new Error('Change not found')
  const sheetRow = rowIndex + 2
  await sheets.spreadsheets.values.update({
    spreadsheetId: SHEET_ID,
    range: `Changes!A${sheetRow}:I${sheetRow}`,
    valueInputOption: 'RAW',
    requestBody: {
      values: [[
        change.id,
        change.projectId,
        change.title,
        change.description,
        change.requestedBy,
        change.dateRequested,
        change.status,
        change.value,
        change.dateCompleted,
      ]],
    },
  })
}

export async function deleteChange(changeId: string): Promise<void> {
  const sheets = getSheets()
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: 'Changes!A2:A',
  })
  const rows = res.data.values || []
  const rowIndex = rows.findIndex((r) => r[0] === changeId)
  if (rowIndex === -1) throw new Error('Change not found')
  const sheetRow = rowIndex + 2
  await sheets.spreadsheets.values.clear({
    spreadsheetId: SHEET_ID,
    range: `Changes!A${sheetRow}:I${sheetRow}`,
  })
}