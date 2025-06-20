import React from 'react'
import {  Routes, Route, Navigate } from 'react-router-dom'
import HomePage from './pages/HomePage'
import SignUpPage from './pages/SignUpPage'
import LoginPage from './pages/LoginPage'
import NotificationsPage from './pages/NotificationsPage'
import ChatPage from './pages/ChatPage'
import CallPage from './pages/CallPage'
import OnboardingPage from './pages/SignUpPage'

import { Toaster } from 'react-hot-toast';

import useAuthUser from './hooks/useAuthUser'
// import PageLoader from './components/PageLoader'
import Layout from './components/Layout'


const App = () => {

  const {isLoading , authUser} = useAuthUser();

  const isAuthenticated = Boolean(authUser);
  const isOnboarded = authUser?.isOnboarded;

  // if(isLoading) return <PageLoader/>

  return (
    <div className='h-screen' data-theme='dark'>
        <Routes>
          <Route path="/" element={
            isAuthenticated && isOnboarded ? (
              <Layout>
                <HomePage/>
              </Layout>
            ) : (
              <Navigate to={!isAuthenticated ? "/login" : "/onboarding"} />
            )
          } />
          <Route path="/signup" element={<SignUpPage/>} />
          <Route path="/login" element={<LoginPage/>} />
          <Route path="/notifications" element={<NotificationsPage/>} />
          <Route path="/call" element={<CallPage/>} />
          <Route path="/chat" element={<ChatPage/>} />
          <Route path="/onboarding" element={ <OnboardingPage/> } />
        </Routes>
        <Toaster/>
    </div>

 
  )
}

export default App