import './App.css'
import { Home } from './pages/Home'
import LightRays  from './components/ui/Background'
import { Button } from './components/ui/Button'
import { BrowserRouter, useNavigate } from 'react-router-dom'
import { Route, Routes } from 'react-router-dom'
import { motion } from "framer-motion"

import { Signup } from './pages/Signup'
import { Signin } from './pages/Signin'

const sectionVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: "easeOut", staggerChildren: 0.2 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.5, ease: "easeOut" },
  },
};

function All() {
  const navigate = useNavigate();

  return (
    <div className="w-full min-h-screen bg-gray-950 text-slate-300 font-poppin">
      
      <div className="fixed inset-0 z-0 pointer-events-none">
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

      <div className="relative z-10">
        <div className="relative w-full h-screen text-center flex flex-col items-center justify-center">
          <div className="relative z-10 w-full">
            <Home 
              title="Dev Hub"
              welcomeMessage="Welcome to Dev Hub 🚀"
              headLine="Connect. Code. Collaborate."
              description="The social network where developers share knowledge"
              line="build strong friendships and grow together as one"
            />
            
            <div className='flex justify-center space-x-8 mt-8'>
              <Button label='Get Started' textColor='text-white' backgroundColor='bg-blue-600' onClick={() => navigate('/signup')} />
              <Button label='Sign in' textColor='text-slate-800' backgroundColor='bg-slate-200' onClick={() => navigate('/signin')} />
            </div>
          </div>
        </div>

        <motion.section
          className="py-24 bg-black/20 backdrop-blur-sm"
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-4xl font-bold mb-4 text-slate-100">What is Dev Hub?</h2>
            <p className="text-slate-400 mb-16 max-w-2xl mx-auto">
              A purpose-built platform designed for developers to thrive. No distractions, just pure collaboration and growth.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <FeatureCard title="Connect with Developers" description="Find and befriend developers worldwide based on shared interests and skills."/>
              <FeatureCard title="Share Code & Notes" description="Exchange snippets, learning resources, and helpful tips in a collaborative environment."/>
              <FeatureCard title="Collaborate Together" description="Chat, share entire projects, and get feedback from peers to build better software, faster."/>
            </div>
          </div>
        </motion.section>

        <motion.section
          className="py-24"
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-4xl font-bold mb-16 text-slate-100">How It Works</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
              <StepCard step="1" title="Create Profile" description="Showcase your unique skills, projects, and what you're passionate about learning."/>
              <StepCard step="2" title="Find Friends" description="Our smart search helps you connect with the developers you're looking for."/>
              <StepCard step="3" title="Share & Learn" description="Post your insights, ask questions, and contribute to a growing library of knowledge."/>
            </div>
          </div>
        </motion.section>

        <motion.section
          className="py-24 bg-black/20 backdrop-blur-sm"
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
        >
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-4xl font-bold mb-4 text-slate-100">See What Developers Are Sharing</h2>
            <p className="text-slate-400 mb-12">"Join thousands of developers already connected!"</p>
            <div className="relative h-96 flex justify-center items-center -rotate-3">
              <SampleCodeCard />
              <SampleNoteCard />
              <SampleProfileCard />
            </div>
          </div>
        </motion.section>

        <section className="py-24 text-center">
          <div className="container mx-auto px-4">
            <h2 className="text-4xl font-bold mb-6 text-slate-100">Ready to Join the Community?</h2>
            <button
              onClick={() => navigate('/signup')}
              className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-10 py-4 rounded-lg font-bold text-lg hover:scale-105 transform transition-all duration-300"
            >
              Get Started - It's Free!
            </button>
          </div>
        </section>
        
        <footer className="border-t border-gray-800 text-slate-500">
          <div className="container mx-auto px-4 py-8 flex flex-col md:flex-row justify-between items-center text-sm">
            <p>&copy; {new Date().getFullYear()} Dev Hub. All rights reserved.</p>
            <div className="flex gap-6 mt-4 md:mt-0">
              <a href="#" className="hover:text-slate-300">About</a>
              <a href="#" className="hover:text-slate-300">Contact</a>
              <a href="#" className="hover:text-slate-300">Privacy Policy</a>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<All />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/signin" element={<Signin />} />
      </Routes>
    </BrowserRouter>
  )
}

const FeatureCard = ({ title, description }) => (
  <motion.div variants={cardVariants} className="bg-gray-900 p-8 rounded-2xl border border-gray-800">
    <h3 className="text-xl font-bold mb-2 text-slate-100">{title}</h3>
    <p className="text-slate-400">{description}</p>
  </motion.div>
);

const StepCard = ({ step, title, description }) => (
  <motion.div variants={cardVariants} className="bg-transparent p-6 rounded-lg relative">
    <div className="absolute -top-4 -left-4 text-7xl font-bold text-gray-800 z-0">{step}</div>
    <div className="relative z-10">
      <h3 className="text-xl font-bold mb-2 text-slate-100">{title}</h3>
      <p className="text-slate-400">{description}</p>
    </div>
  </motion.div>
);

const SampleCodeCard = () => (
    <motion.div initial={{ y: 20, rotate: 5 }} whileInView={{ y: 0, rotate: -8, transition: { duration: 0.5 }}} viewport={{ once: true }} className="absolute w-72 bg-gray-800 rounded-lg shadow-2xl p-4 border border-gray-700 z-10">
        <div className="flex items-center mb-2"><span className="w-3 h-3 rounded-full bg-red-500 mr-1.5"></span><span className="w-3 h-3 rounded-full bg-yellow-500 mr-1.5"></span><span className="w-3 h-3 rounded-full bg-green-500"></span><p className="text-xs text-gray-400 ml-auto">utils/api.ts</p></div>
        <pre className="text-xs text-left bg-gray-900/50 p-2 rounded overflow-x-auto"><code className="text-sky-300">export const <span className="text-yellow-300">fetchData</span> = <span className="text-purple-400">async</span> () ={'>'} ...</code></pre>
    </motion.div>
);

const SampleNoteCard = () => (
    <motion.div initial={{ y: -10, rotate: -5 }} whileInView={{ y: 0, rotate: 5, transition: { duration: 0.5 }}} viewport={{ once: true }} className="absolute w-64 bg-[#f8e9a2] text-gray-800 rounded-lg shadow-xl p-4 z-20">
        <h4 className="font-bold border-b border-gray-400 pb-1 mb-2">React Hooks Quick Tip</h4>
        <p className="text-xs">Remember to use `useEffect` with an empty dependency array `[]` to run an effect only once...</p>
    </motion.div>
);

const SampleProfileCard = () => (
    <motion.div initial={{ y: 20, rotate: 8 }} whileInView={{ y: 0, rotate: 12, transition: { duration: 0.5 }}} viewport={{ once: true }} className="absolute w-56 bg-gray-700 rounded-xl shadow-2xl p-4 border border-gray-600 z-0">
        <div className="flex items-center gap-3"><div className="w-10 h-10 rounded-full bg-purple-500"></div><div><h5 className="font-bold text-sm text-slate-100">Jane Doe</h5><p className="text-xs text-slate-400">Frontend Developer</p></div></div>
    </motion.div>
);

export default App;