// app/page.tsx
'use client'
import { useEffect, useState } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Project, Change, ChangeStatus } from '@/types'
import ProjectCard from '@/components/ProjectCard'

export default function Dashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()

  const [projects, setProjects] = useState<Project[]>([])
  const [changes, setChanges] = useState<Record<string, Change[]>>({})
  const [loading, setLoading] = useState(true)
  const [showAddProject, setShowAddProject] = useState(false)
  const [projectForm, setProjectForm] = useState({ name: '', clientName: '', status: 'Active', notes: '' })

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login')
    if (status === 'authenticated') fetchProjects()
  }, [status])

  async function fetchProjects() {
    setLoading(true)
    const res = await fetch('/api/projects')
    const data = await res.json()
    setProjects(data)
    // fetch changes for each project
    const allChanges: Record<string, Change[]> = {}
    await Promise.all(
      data.map(async (p: Project) => {
        const r = await fetch(`/api/changes?projectId=${p.id}`)
        allChanges[p.id] = await r.json()
      })
    )
    setChanges(allChanges)
    setLoading(false)
  }

  async function handleAddProject() {
    if (!projectForm.name.trim()) return
    const res = await fetch('/api/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(projectForm),
    })
    const newProject = await res.json()
    setProjects(prev => [...prev, newProject])
    setChanges(prev => ({ ...prev, [newProject.id]: [] }))
    setProjectForm({ name: '', clientName: '', status: 'Active', notes: '' })
    setShowAddProject(false)
  }

  async function handleAddChange(projectId: string, data: Partial<Change>) {
    const res = await fetch('/api/changes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...data, projectId }),
    })
    const newChange = await res.json()
    setChanges(prev => ({ ...prev, [projectId]: [...(prev[projectId] || []), newChange] }))
  }

  async function handleStatusChange(change: Change, status: ChangeStatus) {
    await fetch('/api/changes', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...change, status }),
    })
    setChanges(prev => ({
      ...prev,
      [change.projectId]: prev[change.projectId].map(c =>
        c.id === change.id ? { ...c, status } : c
      ),
    }))
  }

  async function handleDeleteChange(change: Change) {
    await fetch('/api/changes', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: change.id, projectId: change.projectId }),
    })
    setChanges(prev => ({
      ...prev,
      [change.projectId]: prev[change.projectId].filter(c => c.id !== change.id),
    }))
  }

  async function handleDeleteProject(project: Project) {
    await fetch('/api/projects', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: project.id }),
    })
    setProjects(prev => prev.filter(p => p.id !== project.id))
    setChanges(prev => { const n = { ...prev }; delete n[project.id]; return n })
  }

  // Summary stats
  const totalPending = Object.values(changes).flat().filter(c => c.status === 'Pending').length
  const totalDone = Object.values(changes).flat().filter(c => c.status === 'Done').length
  const totalValue = Object.values(changes).flat().reduce((sum, c) => sum + c.value, 0)

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-sm text-gray-400">Loading Deltaboard...</p>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">

      {/* Top nav */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-xl font-medium text-gray-900">Deltaboard</h1>
          <p className="text-sm text-gray-400 mt-0.5">{session?.user?.email}</p>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="text-xs text-gray-400 hover:text-gray-700 border border-gray-200 px-3 py-1.5 rounded-lg transition-colors"
        >
          Sign out
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-4 gap-3 mb-8">
        {[
          { label: 'Projects', value: projects.length },
          { label: 'Pending changes', value: totalPending },
          { label: 'Completed', value: totalDone },
          { label: 'Total value', value: `$${totalValue.toLocaleString()}` },
        ].map(stat => (
          <div key={stat.label} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
            <p className="text-xs text-gray-400 mb-1">{stat.label}</p>
            <p className="text-2xl font-medium text-gray-900">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Projects list */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-medium text-gray-700">Projects</h2>
        <button
          onClick={() => setShowAddProject(!showAddProject)}
          className="text-xs bg-gray-900 text-white px-3 py-1.5 rounded-lg hover:bg-gray-700 transition-colors"
        >
          + New project
        </button>
      </div>

      {/* Add project form */}
      {showAddProject && (
        <div className="bg-white border border-gray-200 rounded-xl p-5 mb-4 flex flex-col gap-3">
          <div className="grid grid-cols-2 gap-3">
            <input
              placeholder="Project name *"
              value={projectForm.name}
              onChange={e => setProjectForm({ ...projectForm, name: e.target.value })}
              className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-gray-400"
            />
            <input
              placeholder="Client name"
              value={projectForm.clientName}
              onChange={e => setProjectForm({ ...projectForm, clientName: e.target.value })}
              className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-gray-400"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <select
              value={projectForm.status}
              onChange={e => setProjectForm({ ...projectForm, status: e.target.value })}
              className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-gray-400"
            >
              <option>Active</option>
              <option>On Hold</option>
              <option>Completed</option>
            </select>
            <input
              placeholder="Notes (optional)"
              value={projectForm.notes}
              onChange={e => setProjectForm({ ...projectForm, notes: e.target.value })}
              className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-gray-400"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleAddProject}
              className="text-xs bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
            >
              Create project
            </button>
            <button
              onClick={() => setShowAddProject(false)}
              className="text-xs text-gray-400 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {projects.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-xl p-10 text-center">
          <p className="text-sm text-gray-400">No projects yet. Create your first one above.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {projects.map(project => (
            <ProjectCard
              key={project.id}
              project={project}
              changes={changes[project.id] || []}
              onAddChange={handleAddChange}
              onStatusChange={handleStatusChange}
              onDeleteChange={handleDeleteChange}
              onDeleteProject={handleDeleteProject}
            />
          ))}
        </div>
      )}
    </div>
  )
}