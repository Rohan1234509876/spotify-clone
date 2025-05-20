import { Route, Routes } from "react-router-dom"
import HomePage from "./pages/HomePage"
import AuthCallbackPage from "./pages/AuthCallbackPage"
import { AuthenticateWithRedirectCallback } from "@clerk/clerk-react"
import MainLayout from "./layout/MainLayout"

import AlbumPage from "./pages/AlbumPage"
import  AdminPage  from "./pages/admin/AdminPage"




function App() {
  return (
    <>
    <Routes>
    
    <Route
					path='/sso-callback'
					element={<AuthenticateWithRedirectCallback signUpForceRedirectUrl={"/auth-callback"} />}
				/>
    <Route path="/auth-callback" element={<AuthCallbackPage/>} />
    <Route path="/admin" element={<AdminPage/>} />
    <Route element={<MainLayout/>}>
    <Route path="/" element={<HomePage/>} />
    
    <Route path="/albums/:albumId" element={<AlbumPage/>} />

    </Route>
    
    </Routes>
    
    </>
  )
}

export default App
