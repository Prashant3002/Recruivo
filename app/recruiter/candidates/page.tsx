"use client"

import { useState, useEffect, useCallback } from "react"
import { RecruiterDashboardLayout } from "@/components/recruiter-dashboard-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  Search, 
  Filter, 
  Download, 
  Eye, 
  MessageSquare,
  FileText,
  Wifi,
  WifiOff,
  RefreshCcw
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useToast } from "@/components/ui/use-toast"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { CandidateDetailsDialog } from "@/components/candidate-details-dialog"
import { MessageCandidateDialog } from "@/components/message-candidate-dialog"
import { Socket, io } from "socket.io-client"
import { SOCKET_EVENTS } from "@/lib/socketClient"

// Candidate interface
interface Candidate {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  jobTitle?: string;
  company?: string;
  appliedDate: Date;
  status: string;
  skills: string[];
  resume?: string;
}

// Job interface
interface Job {
  _id: string;
  title: string;
}

export default function CandidatesPage() {
  const [activeTab, setActiveTab] = useState("all")
  const [candidates, setCandidates] = useState<Candidate[]>([])
  const [displayCandidates, setDisplayCandidates] = useState<Candidate[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedJobId, setSelectedJobId] = useState("all")
  const [jobs, setJobs] = useState<Job[]>([])
  const { toast } = useToast()
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null)
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false)
  const [messageDialogOpen, setMessageDialogOpen] = useState(false)
  
  // Socket.IO related state
  const [socket, setSocket] = useState<Socket | null>(null)
  const [isSocketConnected, setIsSocketConnected] = useState(false)
  const [dataTimestamp, setDataTimestamp] = useState<number>(Date.now())
  
  // Polling state
  const [pollingInterval, setPollingInterval] = useState<NodeJS.Timeout | null>(null)
  const [pollingIntervalSeconds, setPollingIntervalSeconds] = useState<number>(30)
  const pollingOptions = [
    { value: 0, label: "Off" },
    { value: 10, label: "10 sec" },
    { value: 30, label: "30 sec" },
    { value: 60, label: "1 min" },
    { value: 300, label: "5 min" }
  ]

  // Process candidate data for consistent format
  const processCandidateData = (candidateData: any): Candidate => {
    const candidateName = candidateData.name || 
                         candidateData.studentName || 
                         (candidateData.userInfo && candidateData.userInfo.name) ||
                         'Unknown';
                         
    const candidateEmail = candidateData.email || 
                          candidateData.studentEmail || 
                          (candidateData.userInfo && candidateData.userInfo.email) ||
                          '';
    
    const candidateSkills = candidateData.skills || 
                           (candidateData.studentInfo && candidateData.studentInfo.skills) ||
                           (candidateData.student && candidateData.student.skills) ||
                           [];
    
    // Extract resume URL from various potential sources
    const resumeUrl = candidateData.resume || 
                     candidateData.resumeUrl || 
                     (candidateData.studentInfo && candidateData.studentInfo.resumeUrl) ||
                     (candidateData.student && candidateData.student.resumeUrl) ||
                     '';
    
    return {
      id: candidateData.id || candidateData._id?.toString(),
      name: candidateName,
      email: candidateEmail,
      avatar: candidateData.avatar || '/placeholder.svg?height=40&width=40',
      jobTitle: candidateData.jobTitle || (candidateData.jobInfo && candidateData.jobInfo.title) || 'Unknown Position',
      company: candidateData.company || (candidateData.jobInfo && candidateData.jobInfo.company) || '',
      appliedDate: new Date(candidateData.appliedDate || candidateData.appliedAt || Date.now()),
      status: candidateData.status || 'new',
      skills: Array.isArray(candidateSkills) ? candidateSkills : ['Not specified'],
      resume: resumeUrl
    };
  };

  // Fetch candidates from API
  const fetchCandidates = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Prepare query parameters
      const params = new URLSearchParams();
      if (activeTab !== 'all') {
        params.set('status', activeTab);
      }
      if (selectedJobId !== 'all') {
        params.set('jobId', selectedJobId);
      }
      if (searchQuery) {
        params.set('search', searchQuery);
      }
      
      console.log('Fetching candidates with params:', params.toString());
      
      // Add timestamp to prevent caching
      params.set('_t', Date.now().toString());
      
      // First try the main endpoint
      const mainEndpoint = `/api/recruiter/candidates/hardcoded-fallback?${params.toString()}`;
      console.log('Attempting to fetch from:', mainEndpoint);
      
      const response = await fetch(mainEndpoint);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch candidates: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('Candidates data fetched:', data);
      
      if (data.success) {
        const fetchedCandidates = data.data.candidates || [];
        const processedCandidates = fetchedCandidates.map(processCandidateData);
        
        setCandidates(processedCandidates);
        setDisplayCandidates(processedCandidates);
        
        // Get jobs for filtering
        if (data.data.jobs && data.data.jobs.length > 0) {
          setJobs(data.data.jobs);
        }
        
        // Update timestamp
        setDataTimestamp(data.timestamp || Date.now());
      } else {
        throw new Error(data.message || 'Failed to fetch candidates');
      }
    } catch (err) {
      console.error('Error fetching candidates:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      
      // Show error toast
      toast({
        title: "Error",
        description: "Failed to fetch candidates. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [activeTab, selectedJobId, searchQuery, toast]);

  // Handle search input change
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    
    if (!query.trim()) {
      setDisplayCandidates(candidates);
      return;
    }
    
    // Filter candidates locally for immediate response
    const filtered = candidates.filter(candidate => 
      candidate.name.toLowerCase().includes(query.toLowerCase()) ||
      candidate.email.toLowerCase().includes(query.toLowerCase()) ||
      candidate.jobTitle?.toLowerCase().includes(query.toLowerCase()) ||
      candidate.skills.some(skill => skill.toLowerCase().includes(query.toLowerCase()))
    );
    
    setDisplayCandidates(filtered);
  };

  // Handle job filter change
  const handleJobChange = (value: string) => {
    setSelectedJobId(value);
  };

  // Handle refresh button click
  const handleRefresh = async () => {
    await fetchCandidates();
    
    toast({
      title: "Refreshed",
      description: "Candidate list has been updated.",
    });
  };

  // Format date for display
  const formatDate = (dateString: string | Date) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // Show candidate details
  const showCandidateDetails = (candidate: Candidate) => {
    setSelectedCandidate(candidate);
    setDetailsDialogOpen(true);
  };

  // Handle message candidate
  const handleMessageCandidate = (candidate: Candidate) => {
    setSelectedCandidate(candidate);
    setMessageDialogOpen(true);
  };

  // Handle sending message
  const handleSendMessage = (message: string) => {
    if (!selectedCandidate) return;
    
    toast({
      title: "Message Sent",
      description: `Your message to ${selectedCandidate.name} has been sent.`,
    });
    
    setMessageDialogOpen(false);
  };

  // Normalize Google Drive resume URL
  const normalizeResumeUrl = (url: string): string => {
    if (!url) return '';
    
    try {
      // Check if it's a Google Drive URL
      if (url.includes('drive.google.com')) {
        // Format 1: https://drive.google.com/file/d/FILE_ID/view
        let fileIdMatch = url.match(/\/file\/d\/([^\/]+)/);
        
        // Format 2: https://drive.google.com/open?id=FILE_ID
        if (!fileIdMatch) {
          fileIdMatch = url.match(/[?&]id=([^&]+)/);
        }
        
        // If we found a file ID, construct a properly formatted URL
        if (fileIdMatch && fileIdMatch[1]) {
          const fileId = fileIdMatch[1];
          return `https://drive.google.com/file/d/${fileId}/view`;
        }
      }
      
      // Not a recognized Google Drive format or already properly formatted
      return url;
    } catch (error) {
      console.error("Error normalizing URL:", error);
      // Return original URL if there's any error in processing
      return url;
    }
  };

  // Open resume URL
  const openResumeUrl = (resumeUrl?: string) => {
    if (!resumeUrl) {
      toast({
        title: "No Resume",
        description: "This candidate has not uploaded a resume.",
        variant: "destructive",
      });
      return;
    }
    
    const normalizedUrl = normalizeResumeUrl(resumeUrl);
    window.open(normalizedUrl, "_blank");
  };

  // Handle status update
  const handleStatusUpdate = async (candidate: Candidate, newStatus: string) => {
    try {
      setLoading(true);
      
      // Update status in database
      const response = await fetch(`/api/recruiter/candidates/update-status`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          candidateId: candidate.id,
          status: newStatus
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to update candidate status');
      }
      
      // Update local state
      setCandidates(prevCandidates => 
        prevCandidates.map(c => 
          c.id === candidate.id ? { ...c, status: newStatus } : c
        )
      );
      
      // Show success toast
      toast({
        title: "Status Updated",
        description: `${candidate.name} has been marked as ${newStatus}`,
      });
    } catch (error) {
      console.error('Error updating candidate status:', error);
      
      // Show error toast
      toast({
        title: "Update Failed",
        description: "Could not update candidate status. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Initialize socket connection
  useEffect(() => {
    let socketConnection: Socket;
    
    const initSocket = async () => {
      try {
        console.log('Initializing Socket.IO connection');
        
        // First check if socket server is available
        const socketCheckResponse = await fetch('/api/socket');
        const socketServerData = await socketCheckResponse.json();
        
        // Check if socket server was properly initialized
        if (socketServerData.fallback) {
          console.log('Socket server in fallback mode, real-time updates unavailable');
          setIsSocketConnected(false);
          return; // Don't try to connect if server is in fallback mode
        }
        
        // Connect to the socket
        try {
          socketConnection = io({
            path: '/api/socket',
            addTrailingSlash: false,
            reconnectionAttempts: 3,
            timeout: 5000,
            autoConnect: true,
            forceNew: true,
            reconnection: true,
            reconnectionDelay: 1000,
            reconnectionDelayMax: 5000
          });
          
          setSocket(socketConnection);
          
          // Socket event handlers
          socketConnection.on(SOCKET_EVENTS.CONNECT, () => {
            console.log('Socket connected successfully');
            setIsSocketConnected(true);
            
            // Join room for all recruiters
            socketConnection.emit(SOCKET_EVENTS.JOIN_RECRUITER_ROOM, 'all');
            
            toast({
              title: "Real-time updates enabled",
              description: "You will now receive candidate updates in real time",
            });
          });
          
          socketConnection.on(SOCKET_EVENTS.CONNECTION_ERROR, (err) => {
            console.error('Socket connection error:', err);
            setIsSocketConnected(false);
          });
          
          socketConnection.on(SOCKET_EVENTS.DISCONNECT, () => {
            console.log('Socket disconnected');
            setIsSocketConnected(false);
          });
          
          // Handle real-time candidate updates
          socketConnection.on(SOCKET_EVENTS.CANDIDATES_UPDATED, (data) => {
            const { candidate, timestamp } = data;
            console.log('Received real-time candidate update:', candidate);
            
            // Update timestamp
            setDataTimestamp(timestamp);
            
            // Process candidate data
            const processedCandidate = processCandidateData(candidate);
            
            // Update candidate list
            setCandidates(prevCandidates => {
              const existingIndex = prevCandidates.findIndex(c => c.id === processedCandidate.id);
              
              if (existingIndex >= 0) {
                // Update existing candidate
                const updatedCandidates = [...prevCandidates];
                updatedCandidates[existingIndex] = processedCandidate;
                return updatedCandidates;
              } else {
                // Add new candidate
                return [processedCandidate, ...prevCandidates];
              }
            });
            
            // Toast notification
            toast({
              title: "New application received",
              description: `${candidate.name} applied for ${candidate.jobTitle}`,
            });
          });
          
          // Handle specific new applications
          socketConnection.on(SOCKET_EVENTS.NEW_APPLICATION, (data) => {
            const { candidate } = data;
            console.log('Received new application:', candidate);
            
            toast({
              title: "New application for your job",
              description: `${candidate.name} applied for ${candidate.jobTitle}`,
            });
          });
        } catch (socketError) {
          console.error('Error during socket setup:', socketError);
          setIsSocketConnected(false);
        }
      } catch (error) {
        console.error('Failed to initialize socket:', error);
        setIsSocketConnected(false);
      }
    };
    
    initSocket();
    
    // Cleanup function
    return () => {
      if (socket) {
        console.log('Cleaning up socket connection');
        socket.disconnect();
      }
    };
  }, [toast]);

  // Setup polling as fallback
  useEffect(() => {
    if (pollingInterval) {
      clearInterval(pollingInterval);
    }
    
    if (pollingIntervalSeconds > 0) {
      console.log(`Setting up polling every ${pollingIntervalSeconds} seconds`);
      
      const interval = setInterval(() => {
        console.log(`Polling candidates at ${new Date().toISOString()}`);
        fetchCandidates();
      }, pollingIntervalSeconds * 1000);
      
      setPollingInterval(interval);
      
      return () => {
        clearInterval(interval);
      };
    }
  }, [pollingIntervalSeconds, fetchCandidates]);

  // Initial data fetch
  useEffect(() => {
    fetchCandidates();
  }, [fetchCandidates]);

  // Filter candidates when tab changes
  useEffect(() => {
    if (activeTab === 'all') {
      setDisplayCandidates(candidates);
    } else {
      setDisplayCandidates(candidates.filter(candidate => candidate.status === activeTab));
    }
  }, [activeTab, candidates]);

  return (
    <RecruiterDashboardLayout>
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Candidates</h1>
            <p className="text-muted-foreground">Manage and track candidates for your open positions</p>
          </div>
          <div className="flex items-center gap-2">
            <p className="text-xs text-muted-foreground">
              Last updated: {new Date(dataTimestamp).toLocaleTimeString()}
              {pollingIntervalSeconds > 0 && !isSocketConnected && ` (Auto-refresh: ${pollingIntervalSeconds}s)`}
            </p>
            
            {isSocketConnected ? (
              <div className="flex items-center text-green-500 text-xs mr-2">
                <Wifi className="h-4 w-4 mr-1" />
                <span>Real-time</span>
              </div>
            ) : (
              <div className="flex items-center text-amber-500 text-xs mr-2">
                <WifiOff className="h-4 w-4 mr-1" />
                <span>Polling</span>
              </div>
            )}
            
            <Select value={pollingIntervalSeconds.toString()} onValueChange={(value) => setPollingIntervalSeconds(parseInt(value))}>
              <SelectTrigger className="w-[100px]">
                <SelectValue placeholder="Refresh" />
              </SelectTrigger>
              <SelectContent>
                {pollingOptions.map(option => (
                  <SelectItem key={option.value} value={option.value.toString()}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Button variant="outline" size="icon" onClick={handleRefresh} disabled={loading}>
              <RefreshCcw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search candidates..."
                className="pl-8"
                value={searchQuery}
                onChange={handleSearch}
              />
            </div>
            
            <Select value={selectedJobId} onValueChange={handleJobChange}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by job" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Jobs</SelectItem>
                {jobs.map((job) => (
                  <SelectItem key={job._id} value={job._id}>{job.title}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Button variant="outline" size="icon">
              <Download className="h-4 w-4" />
            </Button>
          </div>

          <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="new">New</TabsTrigger>
              <TabsTrigger value="shortlisted">Shortlisted</TabsTrigger>
              <TabsTrigger value="interview">Interview</TabsTrigger>
              <TabsTrigger value="rejected">Rejected</TabsTrigger>
            </TabsList>
            <TabsContent value="all" className="space-y-4">
              <CandidatesTable 
                candidates={displayCandidates}
                loading={loading}
                onViewDetails={showCandidateDetails}
                onMessageCandidate={handleMessageCandidate}
                onViewResume={openResumeUrl}
                formatDate={formatDate}
                onStatusChange={handleStatusUpdate}
              />
            </TabsContent>
            <TabsContent value="new" className="space-y-4">
              <CandidatesTable 
                candidates={displayCandidates}
                loading={loading}
                onViewDetails={showCandidateDetails}
                onMessageCandidate={handleMessageCandidate}
                onViewResume={openResumeUrl}
                formatDate={formatDate}
                onStatusChange={handleStatusUpdate}
              />
            </TabsContent>
            <TabsContent value="shortlisted" className="space-y-4">
              <CandidatesTable 
                candidates={displayCandidates}
                loading={loading}
                onViewDetails={showCandidateDetails}
                onMessageCandidate={handleMessageCandidate}
                onViewResume={openResumeUrl}
                formatDate={formatDate}
                onStatusChange={handleStatusUpdate}
              />
            </TabsContent>
            <TabsContent value="interview" className="space-y-4">
              <CandidatesTable 
                candidates={displayCandidates}
                loading={loading}
                onViewDetails={showCandidateDetails}
                onMessageCandidate={handleMessageCandidate}
                onViewResume={openResumeUrl}
                formatDate={formatDate}
                onStatusChange={handleStatusUpdate}
              />
            </TabsContent>
            <TabsContent value="rejected" className="space-y-4">
              <CandidatesTable 
                candidates={displayCandidates}
                loading={loading}
                onViewDetails={showCandidateDetails}
                onMessageCandidate={handleMessageCandidate}
                onViewResume={openResumeUrl}
                formatDate={formatDate}
                onStatusChange={handleStatusUpdate}
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>
      
      {selectedCandidate && (
        <>
          <CandidateDetailsDialog
            open={detailsDialogOpen}
            onOpenChange={setDetailsDialogOpen}
            candidate={selectedCandidate}
            onViewResume={() => openResumeUrl(selectedCandidate.resume)}
          />
          
          <MessageCandidateDialog
            open={messageDialogOpen}
            onOpenChange={setMessageDialogOpen}
            candidate={selectedCandidate}
            onSendMessage={handleSendMessage}
          />
        </>
      )}
    </RecruiterDashboardLayout>
  )
}

// CandidatesTable component to display the candidates
function CandidatesTable({
  candidates,
  loading,
  onViewDetails,
  onMessageCandidate,
  onViewResume,
  formatDate,
  onStatusChange
}: {
  candidates: Candidate[]
  loading: boolean
  onViewDetails: (candidate: Candidate) => void
  onMessageCandidate: (candidate: Candidate) => void
  onViewResume: (resumeUrl?: string) => void
  formatDate: (dateString: string | Date) => string
  onStatusChange: (candidate: Candidate, newStatus: string) => void
}) {
  // Status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "shortlisted":
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Shortlisted</Badge>
      case "interview":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Interview</Badge>
      case "rejected":
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Rejected</Badge>
      case "reviewed":
        return <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-100">Reviewed</Badge>
      case "new":
      default:
        return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">New</Badge>
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!candidates.length) {
    return (
      <Card className="border border-dashed">
        <CardContent className="flex flex-col items-center justify-center p-6 text-center space-y-2">
          <div className="text-4xl">🔍</div>
          <CardTitle className="text-xl font-medium">No candidates found</CardTitle>
          <p className="text-sm text-muted-foreground">
            Try adjusting your filters or search criteria
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Candidate</TableHead>
            <TableHead>Job</TableHead>
            <TableHead>Applied</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Resume</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {candidates.map((candidate) => (
            <TableRow key={candidate.id}>
              <TableCell>
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={candidate.avatar} alt={candidate.name} />
                    <AvatarFallback>{candidate.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <div className="font-medium">{candidate.name}</div>
                    <div className="text-xs text-muted-foreground">{candidate.email}</div>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <div className="font-medium">{candidate.jobTitle}</div>
                <div className="text-xs text-muted-foreground">{candidate.company}</div>
              </TableCell>
              <TableCell>{formatDate(candidate.appliedDate)}</TableCell>
              <TableCell>
                <Select 
                  defaultValue={candidate.status} 
                  onValueChange={(value) => onStatusChange(candidate, value)}
                >
                  <SelectTrigger className="w-[130px] h-8">
                    <SelectValue>
                      {getStatusBadge(candidate.status)}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new">
                      <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">New</Badge>
                    </SelectItem>
                    <SelectItem value="reviewed">
                      <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-100">Reviewed</Badge>
                    </SelectItem>
                    <SelectItem value="shortlisted">
                      <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Shortlisted</Badge>
                    </SelectItem>
                    <SelectItem value="interview">
                      <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Interview</Badge>
                    </SelectItem>
                    <SelectItem value="rejected">
                      <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Rejected</Badge>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </TableCell>
              <TableCell>
                <Button 
                  variant="ghost"
                  size="icon"
                  onClick={() => onViewResume(candidate.resume)}
                  disabled={!candidate.resume}
                  title={candidate.resume ? "View Resume" : "No Resume Available"}
                >
                  <FileText className="h-4 w-4" />
                </Button>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onViewDetails(candidate)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onMessageCandidate(candidate)}
                  >
                    <MessageSquare className="h-4 w-4" />
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <Filter className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>View Details</DropdownMenuItem>
                      <DropdownMenuItem>Send Message</DropdownMenuItem>
                      <DropdownMenuItem>View Resume</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
} 