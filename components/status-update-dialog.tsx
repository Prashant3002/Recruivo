"use client"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  XCircle 
} from "lucide-react"

interface StatusUpdateDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  candidate: {
    id: string
    name: string
  } | null
  newStatus: string
  onConfirm: () => void
  onCancel: () => void
}

export function StatusUpdateDialog({
  open,
  onOpenChange,
  candidate,
  newStatus,
  onConfirm,
  onCancel
}: StatusUpdateDialogProps) {
  if (!candidate) return null

  const getStatusIcon = () => {
    switch (newStatus) {
      case "Approved":
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case "Pending":
        return <Clock className="h-5 w-5 text-yellow-500" />
      case "Rejected":
        return <XCircle className="h-5 w-5 text-red-500" />
      case "Review":
      default:
        return <AlertCircle className="h-5 w-5 text-blue-500" />
    }
  }

  const getStatusClass = () => {
    switch (newStatus) {
      case "Approved":
        return "text-green-600 bg-green-50 border-green-100"
      case "Pending":
        return "text-yellow-600 bg-yellow-50 border-yellow-100"
      case "Rejected":
        return "text-red-600 bg-red-50 border-red-100"
      case "Review":
      default:
        return "text-blue-600 bg-blue-50 border-blue-100"
    }
  }

  const handleClose = () => {
    onOpenChange(false)
    onCancel()
  }

  const handleConfirm = () => {
    onOpenChange(false)
    onConfirm()
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Change Candidate Status</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to change {candidate.name}'s status to <strong>{newStatus}</strong>?
          </AlertDialogDescription>
        </AlertDialogHeader>
        
        <div className={`flex items-center gap-2 p-3 my-2 rounded border ${getStatusClass()}`}>
          {getStatusIcon()}
          <div>
            <p className="font-medium">New Status: {newStatus}</p>
            <p className="text-sm opacity-80">
              {newStatus === "Approved" && "The candidate will be moved to the approved list."}
              {newStatus === "Pending" && "The candidate will be moved to the pending list."}
              {newStatus === "Rejected" && "The candidate will be moved to the rejected list."}
              {newStatus === "Review" && "The candidate will be moved to the review list."}
            </p>
          </div>
        </div>
        
        <AlertDialogFooter>
          <AlertDialogCancel onClick={handleClose}>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleConfirm}>
            Confirm
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
} 