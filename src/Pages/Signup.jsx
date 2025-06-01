import { SignUp } from '@clerk/clerk-react'
import React from 'react'

const Signup = () => {
    return (
        <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
              {/* Animated background elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-1/4 left-10 w-32 h-32 rounded-full bg-[#EAE4D5] mix-blend-overlay animate-float"></div>
        <div className="absolute bottom-1/3 right-20 w-40 h-40 rounded-full bg-[#B6B09F] mix-blend-overlay animate-float-delay"></div>
      </div>
          <div className="w-full max-w-md mx-auto">
            <SignUp signInUrl='/login'
              appearance={{
                elements: {
                  rootBox: "w-full",
                  card: "bg-[#1a1a1a]/90 backdrop-blur-sm border border-[#B6B09F]/20",
                  headerTitle: "text-[#EAE4D5]",
                  headerSubtitle: "text-[#B6B09F]",
                  socialButtons: "gap-2",
                  socialButton: "hover:bg-[#ffffff10] transition",
                  formFieldLabel: "text-[#EAE4D5]",
                  formFieldInput: "bg-[#0a0a0a] border-[#B6B09F]/30 text-[#EAE4D5] focus:border-[#EAE4D5]",
                  footerActionText: "text-[#B6B09F]",
                  footerActionLink: "text-[#EAE4D5] hover:text-white transition",
                  dividerLine: "bg-[#B6B09F]/30",
                  dividerText: "text-[#B6B09F]",
                }
              }}
            />
          </div>
        </div>
      
      )
    }

export default Signup