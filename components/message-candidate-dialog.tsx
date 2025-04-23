"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Loader2, Mail, Send } from "lucide-react"

interface MessageCandidateDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  candidate: {
    id: string
    name: string
    email: string
  } | null
  onSend: (message: string) => void
}

export function MessageCandidateDialog({
  open,
  onOpenChange,
  candidate,
  onSend
}: MessageCandidateDialogProps) {
  const [message, setMessage] = useState("")
  const [isSending, setIsSending] = useState(false)

  if (!candidate) return null

  const handleSend = async () => {
    if (!message.trim()) return
    
    setIsSending(true)
    // Simulate sending a message
    setTimeout(() => {
      onSend(message)
      setMessage("")
      setIsSending(false)
      onOpenChange(false)
    }, 1000)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Message {candidate.name}</DialogTitle>
          <DialogDescription>
            Send a message to this candidate regarding their application
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="flex items-center gap-2 text-sm mb-2">
            <Mail className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Recipient:</span>
            <span>{candidate.email}</span>
          </div>
          
          <Textarea
            placeholder={`Hello ${candidate.name}, I'd like to discuss your application...`}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="min-h-[150px]"
          />
          
          <p className="text-xs text-muted-foreground">
            Your message will be sent to the candidate's email address. They will be able to reply directly.
          </p>
        </div>

        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            disabled={isSending}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSend}
            disabled={!message.trim() || isSending}
          >
            {isSending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                Send Message
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 