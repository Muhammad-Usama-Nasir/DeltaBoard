// components/ProjectCard.tsx
'use client'
import { useState } from 'react'
import { Project, Change, ChangeStatus } from '@/types'
import ChangeRow from './ChangeRow'

interface Props {
  project: Project
  changes: Change[]
  onAddChange: (projectId: string, data: Partial<Change>) => void
  onStatusChange: (change: Change, status: ChangeStatus) => void
  onDeleteChange: (change: Change) => void
  onDeleteProject: (project: Project) => void
}

const projectStatusStyles: Record<string, string> = {
  'Active':    'bg-green-50 text-green-700 border border-green-200',
  'On Hold':   'bg-gray-100 text-gray-600 border border-gray-200',
  'Completed': 'bg-blue-50 text-blue-700 border border-blue-200',
}

export default function ProjectCard({
  project, changes, onAddChange, onStatusChange, onDeleteChange, onDeleteProject
}: Props) {
  const [open, setOpen] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ title: '', description: '', requestedBy: '', value: '' })

  const pending = changes.filter(c => c.status === 'Pending').length
  const totalValue = changes.reduce((sum, c) => sum + c.value, 0)

  function handleSubmit() {
    if (!form.title.trim()) return
    onAddChange(project.id, {
      title: form.title,
      description: form.description,
      requestedBy: form.requestedBy,
      value: parseFloat(form.value) || 0,
    })
    setForm({ title: '', description: '', requestedBy: '', value: '' })
    setShowForm(false)
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
      
      {/* Header */}
      <div
        className="flex items-center justify-between px-5 py-4 cursor-pointer hover:bg-gray-50 transition-colors border-b border-gray-200"

        onClick={() => setOpen(!open)}
      >
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded font-mono">{project.id}</span>
          <p className="text-sm font-medium text-gray-900">{project.name}</p>
          <p className="text-xs text-gray-400">{project.clientName}</p>
          <span className={`text-xs px-2 py-0.5 rounded-md font-medium ${projectStatusStyles[project.status]}`}>
            {project.status}
          </span>
        </div>
        <div className="flex items-center gap-5 text-sm text-gray-500">
          <span>{pending} pending</span>
          <span className="font-medium text-gray-900">${totalValue.toLocaleString()}</span>
          <button
            onClick={(e) => { e.stopPropagation(); onDeleteProject(project) }}
            className="text-gray-300 hover:text-red-400 transition-colors text-lg leading-none"
          >×</button>
          <span className="text-gray-300 text-xs">{open ? '▲' : '▼'}</span>
        </div>
      </div>

      {/* Changes list */}
      {open && (
        <div className="border-t border-gray-100 px-5">
          
          {/* Column headers */}
          <div className="grid grid-cols-[1fr_100px_140px_32px] gap-3 py-2 border-b border-gray-200">
            <p className="text-xs text-gray-400">Change</p>
            <p className="text-xs text-gray-400 text-right">Value</p>
            <p className="text-xs text-gray-400 text-center">Update status</p>
            <p className="text-xs text-gray-400">Status</p>
            <div/>
          </div>

          {changes.length === 0 && (
            <p className="text-xs text-gray-400 py-4">No changes yet. Add one below.</p>
          )}

          {changes.map((change) => (
            <ChangeRow
              key={change.id}
              change={change}
              onStatusChange={onStatusChange}
              onDelete={onDeleteChange}
            />
          ))}

          {/* Add change form */}
          {showForm ? (
            <div className="py-3 flex flex-col gap-2">
              <input
                placeholder="Change title *"
                value={form.title}
                onChange={e => setForm({ ...form, title: e.target.value })}
                className="text-sm border border-gray-200 rounded-lg px-3 py-2 w-full focus:outline-none focus:border-gray-400"
              />
              <div className="grid grid-cols-2 gap-2">
                <input
                  placeholder="Requested by"
                  value={form.requestedBy}
                  onChange={e => setForm({ ...form, requestedBy: e.target.value })}
                  className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-gray-400"
                />
                <input
                  placeholder="Value ($)"
                  type="number"
                  value={form.value}
                  onChange={e => setForm({ ...form, value: e.target.value })}
                  className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-gray-400"
                />
              </div>
              <input
                placeholder="Description (optional)"
                value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })}
                className="text-sm border border-gray-200 rounded-lg px-3 py-2 w-full focus:outline-none focus:border-gray-400"
              />
              <div className="flex gap-2">
                <button
                  onClick={handleSubmit}
                  className="text-xs bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Add change
                </button>
                <button
                  onClick={() => setShowForm(false)}
                  className="text-xs text-gray-400 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowForm(true)}
              className="text-xs text-gray-400 hover:text-gray-700 py-3 transition-colors"
            >
              + Add change
            </button>
          )}
        </div>
      )}
    </div>
  )
}