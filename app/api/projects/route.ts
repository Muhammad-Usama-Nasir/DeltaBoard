// app/api/projects/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getProjects, addProject, updateProject, deleteProject } from '@/lib/sheets'
import { Project } from '@/types'

async function getSession() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) return null
  return session as typeof session & { user: { email: string } }
}

export async function GET() {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const projects = await getProjects(session.user.email)
    return NextResponse.json(projects)
  } catch (err) {
    return NextResponse.json({ error: 'Failed to fetch projects' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const body = await req.json()
    const project: Project = {
      ...body,
      id: `P${Date.now()}`,
      ownerEmail: session.user.email,
      startDate: new Date().toISOString().split('T')[0],
    }
    await addProject(project)
    return NextResponse.json(project, { status: 201 })
  } catch (err) {
    return NextResponse.json({ error: 'Failed to add project' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const body = await req.json()
    const projects = await getProjects(session.user.email)
    const owns = projects.find((p) => p.id === body.id)
    if (!owns) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    await updateProject({ ...body, ownerEmail: session.user.email })
    return NextResponse.json({ success: true })
  } catch (err) {
    return NextResponse.json({ error: 'Failed to update project' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { id } = await req.json()
    const projects = await getProjects(session.user.email)
    const owns = projects.find((p) => p.id === id)
    if (!owns) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    await deleteProject(id)
    return NextResponse.json({ success: true })
  } catch (err) {
    return NextResponse.json({ error: 'Failed to delete project' }, { status: 500 })
  }
}