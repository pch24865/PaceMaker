import { Navigation } from "@/components/layout/Navigation"
import { Route, Routes } from "react-router-dom"
import SignInPage from "@/pages/SignInPage"
import SignUpPage from "@/pages/SignUpPage"
import { Toaster } from "sonner"

import { useTheme } from "@/contexts/ThemeProvider"
import NotePage from "@/pages/NotePage"
import RequireAuth from "@/components/auth/RequireAuth"
import RequireGuest from "@/components/auth/RequireGuest"
import StudyPage from "@/pages/StudyPage"
import { NoteProvider } from "@/contexts/NoteProvider"
import PartyPage from "@/pages/PartyPage"


function App() {
  const { theme } = useTheme()

  return (
    <>
      <Navigation />
      <Toaster theme={theme as any} position="top-center" duration={5000} closeButton={true} />
      <div className="h-[calc(100vh-4rem)] overflow-y-auto">
        <Routes>
          <Route path="/signin" element={<RequireGuest><SignInPage /></RequireGuest>} />
          <Route path="/signup" element={<RequireGuest><SignUpPage /></RequireGuest>} />
          <Route path="/note" element={<RequireAuth><NoteProvider><NotePage /></NoteProvider></RequireAuth>} />
          <Route path="/study" element={<RequireAuth><StudyPage /></RequireAuth>} />
          <Route path="/party" element={<PartyPage/>} />
        </Routes>
      </div>
    </>
  )
}

export default App
