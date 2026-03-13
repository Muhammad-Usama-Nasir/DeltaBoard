// types/index.ts

export type ChangeStatus = 'Pending' | 'In Progress' | 'Done'

export interface Project {
  id: string           // e.g. "P001"
  name: string
  clientName: string
  startDate: string
  status: 'Active' | 'On Hold' | 'Completed'
  notes: string
  ownerEmail: string   // ties project to a user
}

export interface Change {
  id: string           // e.g. "C001"
  projectId: string    // foreign key → Project.id
  title: string
  description: string
  requestedBy: string
  dateRequested: string
  status: ChangeStatus
  value: number        // in dollars/currency
  dateCompleted: string
}

export interface User {
  name: string
  email: string
  image: string
}