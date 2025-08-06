import './App.css'
import { Home } from './pages/Home'
import LightRays from './components/ui/Background'
import { Button } from './components/ui/Button'
import { BrowserRouter, useNavigate } from 'react-router-dom'
import { Route, Routes } from 'react-router-dom'
import { Signup } from './pages/Signup'
import { Signin } from './pages/Signin'

function All() {
  const navigate = useNavigate();

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-gray-950 text-center flex items-center justify-center">
      <div className="absolute inset-0 z-0 pointer-events-none">
        <LightRays
          raysOrigin="top-center"
          raysColor="#878282"
          raysSpeed={0.7}
          lightSpread={9}
          rayLength={0.8}
          followMouse={true}
          mouseInfluence={false}
          noiseAmount={0.1}
          distortion={0.05}
        />
      </div>
            
        <div className="relative z-10 w-full">
        <Home 
          title="Dev Hub"
          welcomeMessage="Welcome to DevHub 🚀"
          headLine="Connect․ Code․ Collaborate․"
          description="The social network where developers share knowledge"
          line="build strong friendships and grow together as one"
        />
        <div className='flex justify-center space-x-8'>
          <Button label='Get Started' textColor='text-black' backgroundColor='bg-blue-600' onClick={() => {
            navigate('/signup');
          }} />
          
          <Button label='Sign in' textColor='text-black' backgroundColor='bg-slate-200' onClick={() => {
            navigate('/signin');
          }}/>
        </div>
      </div>
    </div>
  )
}

function App () {
  return (
    <BrowserRouter>
    <Routes>
      <Route path="/" element={<All />} />
      <Route path="/signup" element={<Signup />} />
      <Route path='/signin' element={<Signin />}/>
    </Routes>
    </BrowserRouter>
  )
}

export default App;
