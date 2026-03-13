// app/api/changes/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getProjects, getChanges, addChange, updateChange, deleteChange } from '@/lib/sheets'
import { Change } from '@/types'

async function getSession() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) return null
  return session as typeof session & { user: { email: string } }
}

async function userOwnsProject(email: string, projectId: string) {
  const projects = await getProjects(email)
  return projects.find((p) => p.id === projectId)
}

export async function GET(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const projectId = req.nextUrl.searchParams.get('projectId')
  if (!projectId) return NextResponse.json({ error: 'projectId required' }, { status: 400 })

  try {
    const owns = await userOwnsProject(session.user.email, projectId)
    if (!owns) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const changes = await getChanges(projectId)
    return NextResponse.json(changes)
  } catch (err) {
    return NextResponse.json({ error: 'Failed to fetch changes' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const body = await req.json()
    const owns = await userOwnsProject(session.user.email, body.projectId)
    if (!owns) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const change: Change = {
      ...body,
      id: `C${Date.now()}`,
      dateRequested: new Date().toISOString().split('T')[0],
      status: 'Pending',
      dateCompleted: '',
    }
    await addChange(change)
    return NextResponse.json(change, { status: 201 })
  } catch (err) {
    return NextResponse.json({ error: 'Failed to add change' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const body = await req.json()
    const owns = await userOwnsProject(session.user.email, body.projectId)
    if (!owns) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const change: Change = {
      ...body,
      dateCompleted:
        body.status === 'Done'
          ? new Date().toISOString().split('T')[0]
          : body.dateCompleted || '',
    }
    await updateChange(change)
    return NextResponse.json({ success: true })
  } catch (err) {
    return NextResponse.json({ error: 'Failed to update change' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { id, projectId } = await req.json()
    const owns = await userOwnsProject(session.user.email, projectId)
    if (!owns) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    await deleteChange(id)
    return NextResponse.json({ success: true })
  } catch (err) {
    return NextResponse.json({ error: 'Failed to delete change' }, { status: 500 })
  }
}