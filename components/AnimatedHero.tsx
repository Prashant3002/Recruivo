"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Check, User, Building, FileText, Briefcase, Search } from "lucide-react"

export function AnimatedHero() {
  const [isLoaded, setIsLoaded] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  
  useEffect(() => {
    try {
      setIsMounted(true)
      
      // Only start animations after component is mounted
      const timer = setTimeout(() => {
        setIsLoaded(true)
      }, 100)
      
      return () => clearTimeout(timer)
    } catch (err) {
      console.error("Error in AnimatedHero:", err);
      setError(err instanceof Error ? err : new Error('Unknown error in AnimatedHero'));
    }
  }, [])
  
  // If there's an error, show minimal fallback
  if (error) {
    return (
      <div className="relative w-full h-full min-h-[400px] bg-gradient-to-br from-primary/5 to-accent/5 rounded-lg flex items-center justify-center">
        <div className="text-center p-4">
          <h3 className="text-lg font-medium">Could not load animation</h3>
          <p className="text-sm text-muted-foreground">Please try refreshing the page</p>
        </div>
      </div>
    );
  }
  
  // Avoid hydration mismatch by only rendering when mounted
  if (!isMounted) {
    return <div className="relative w-full h-full min-h-[400px] bg-gradient-to-br from-primary/5 to-accent/5 rounded-lg" />
  }

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.3,
        delayChildren: 0.2
      }
    }
  }
  
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.5 }
    }
  }
  
  const connectingLineVariants = {
    hidden: { pathLength: 0 },
    visible: { 
      pathLength: 1,
      transition: { 
        duration: 1.5, 
        ease: "easeInOut" 
      }
    }
  }
  
  const pulseVariants = {
    pulse: {
      scale: [1, 1.05, 1],
      opacity: [0.7, 1, 0.7],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  }

  try {
    return (
      <div className="relative w-full h-full min-h-[400px] bg-gradient-to-br from-primary/5 to-accent/5 rounded-lg overflow-hidden">
        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          initial="hidden"
          animate={isLoaded ? "visible" : "hidden"}
          variants={containerVariants}
        >
          {/* Background grid pattern */}
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <motion.path 
              d="M0,0 L100,0 L100,100 L0,100 L0,0" 
              fill="none" 
              stroke="rgba(0,0,0,0.05)" 
              strokeWidth="0.5"
              strokeDasharray="5,5"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 1 }}
            />
            {/* Grid lines */}
            {[...Array(10)].map((_, i) => (
              <motion.line 
                key={`h-${i}`}
                x1="0" 
                y1={i * 10} 
                x2="100" 
                y2={i * 10} 
                stroke="rgba(0,0,0,0.05)" 
                strokeWidth="0.3"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 + i * 0.1, duration: 0.5 }}
              />
            ))}
            {[...Array(10)].map((_, i) => (
              <motion.line 
                key={`v-${i}`}
                x1={i * 10} 
                y1="0" 
                x2={i * 10} 
                y2="100" 
                stroke="rgba(0,0,0,0.05)" 
                strokeWidth="0.3"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 + i * 0.1, duration: 0.5 }}
              />
            ))}
          </svg>

          {/* Student element */}
          <motion.div 
            className="absolute top-1/4 left-1/4 flex flex-col items-center"
            variants={itemVariants}
          >
            <motion.div
              className="flex items-center justify-center w-12 h-12 bg-primary/10 rounded-full mb-2"
              variants={pulseVariants}
              animate="pulse"
            >
              <User className="h-6 w-6 text-primary" />
            </motion.div>
            <span className="text-sm font-medium">Student</span>
          </motion.div>

          {/* Recruiter element */}
          <motion.div 
            className="absolute top-1/4 right-1/4 flex flex-col items-center"
            variants={itemVariants}
          >
            <motion.div
              className="flex items-center justify-center w-12 h-12 bg-primary/10 rounded-full mb-2"
              variants={pulseVariants}
              animate="pulse"
            >
              <Building className="h-6 w-6 text-primary" />
            </motion.div>
            <span className="text-sm font-medium">Recruiter</span>
          </motion.div>

          {/* Resume element */}
          <motion.div 
            className="absolute bottom-1/4 left-1/4 flex flex-col items-center"
            variants={itemVariants}
          >
            <motion.div
              className="flex items-center justify-center w-12 h-12 bg-primary/10 rounded-full mb-2"
              variants={pulseVariants}
              animate="pulse"
            >
              <FileText className="h-6 w-6 text-primary" />
            </motion.div>
            <span className="text-sm font-medium">Resume</span>
          </motion.div>

          {/* Job element */}
          <motion.div 
            className="absolute bottom-1/4 right-1/4 flex flex-col items-center"
            variants={itemVariants}
          >
            <motion.div
              className="flex items-center justify-center w-12 h-12 bg-primary/10 rounded-full mb-2"
              variants={pulseVariants}
              animate="pulse"
            >
              <Briefcase className="h-6 w-6 text-primary" />
            </motion.div>
            <span className="text-sm font-medium">Job</span>
          </motion.div>

          {/* Center AI matching element */}
          <motion.div 
            className="absolute flex flex-col items-center"
            variants={itemVariants}
          >
            <motion.div
              className="flex items-center justify-center w-16 h-16 bg-primary rounded-full mb-2 text-white shadow-lg"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 1.5, duration: 0.5, type: "spring" }}
            >
              <Search className="h-8 w-8" />
            </motion.div>
            <span className="text-sm font-medium">AI Matching</span>
          </motion.div>

          {/* Connecting lines using SVG */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
            {/* Student to center */}
            <motion.path 
              d="M25,25 L50,50" 
              fill="none" 
              stroke="rgba(0,0,0,0.2)" 
              strokeWidth="0.5"
              strokeDasharray="5,2"
              variants={connectingLineVariants}
            />
            
            {/* Recruiter to center */}
            <motion.path 
              d="M75,25 L50,50" 
              fill="none" 
              stroke="rgba(0,0,0,0.2)" 
              strokeWidth="0.5"
              strokeDasharray="5,2"
              variants={connectingLineVariants}
            />
            
            {/* Resume to center */}
            <motion.path 
              d="M25,75 L50,50" 
              fill="none" 
              stroke="rgba(0,0,0,0.2)" 
              strokeWidth="0.5"
              strokeDasharray="5,2"
              variants={connectingLineVariants}
            />
            
            {/* Job to center */}
            <motion.path 
              d="M75,75 L50,50" 
              fill="none" 
              stroke="rgba(0,0,0,0.2)" 
              strokeWidth="0.5"
              strokeDasharray="5,2"
              variants={connectingLineVariants}
            />
          </svg>
          
          {/* Moving dots on lines */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
            <motion.circle 
              cx="0" 
              cy="0" 
              r="0.7" 
              fill="currentColor"
              className="text-primary"
              initial={{ cx: 25, cy: 25 }}
              animate={{ cx: 50, cy: 50 }}
              transition={{ duration: 2, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
            />
            
            <motion.circle 
              cx="0" 
              cy="0" 
              r="0.7" 
              fill="currentColor"
              className="text-primary"
              initial={{ cx: 75, cy: 25 }}
              animate={{ cx: 50, cy: 50 }}
              transition={{ duration: 2, repeat: Infinity, repeatType: "reverse", ease: "easeInOut", delay: 0.3 }}
            />
            
            <motion.circle 
              cx="0" 
              cy="0" 
              r="0.7" 
              fill="currentColor"
              className="text-primary"
              initial={{ cx: 25, cy: 75 }}
              animate={{ cx: 50, cy: 50 }}
              transition={{ duration: 2, repeat: Infinity, repeatType: "reverse", ease: "easeInOut", delay: 0.6 }}
            />
            
            <motion.circle 
              cx="0" 
              cy="0" 
              r="0.7" 
              fill="currentColor"
              className="text-primary"
              initial={{ cx: 75, cy: 75 }}
              animate={{ cx: 50, cy: 50 }}
              transition={{ duration: 2, repeat: Infinity, repeatType: "reverse", ease: "easeInOut", delay: 0.9 }}
            />
          </svg>
          
          {/* Success indicators animation */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
            <motion.circle 
              cx="50" 
              cy="50" 
              r="15" 
              fill="none"
              stroke="rgba(0,0,0,0.1)"
              strokeWidth="0.5"
              initial={{ scale: 0 }}
              animate={{ scale: [0, 1, 1.2, 1] }}
              transition={{ delay: 1.8, duration: 1.5, times: [0, 0.7, 0.9, 1] }}
            />
            
            <motion.circle 
              cx="50" 
              cy="50" 
              r="20" 
              fill="none"
              stroke="rgba(0,0,0,0.05)"
              strokeWidth="0.3"
              initial={{ scale: 0 }}
              animate={{ scale: [0, 1, 1.1, 1] }}
              transition={{ delay: 2, duration: 1.5, times: [0, 0.7, 0.9, 1] }}
            />
          </svg>
        </motion.div>
      </div>
    )
  } catch (err) {
    console.error("Error rendering AnimatedHero:", err);
    return (
      <div className="relative w-full h-full min-h-[400px] bg-gradient-to-br from-primary/5 to-accent/5 rounded-lg flex items-center justify-center">
        <div className="text-center p-4">
          <h3 className="text-lg font-medium">Could not load animation</h3>
          <p className="text-sm text-muted-foreground">Please try refreshing the page</p>
        </div>
      </div>
    );
  }
} 