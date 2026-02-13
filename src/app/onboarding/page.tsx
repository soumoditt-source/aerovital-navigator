'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Mic, User as UserIcon } from 'lucide-react'
import { useUserStore } from '@/stores/userStore'
import { User } from '@/types'

type Message = {
  id: string
  text: string
  sender: 'ai' | 'user'
}

export default function Onboarding() {
  const router = useRouter()
  const setUser = useUserStore(state => state.setUser)
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', text: "Hi! I'm AeroVital. I'm here to protect your health from air pollution. To get started, what's your name?", sender: 'ai' }
  ])
  const [input, setInput] = useState('')
  const [stage, setStage] = useState(1)
  const [userData, setUserData] = useState<Partial<User>>({
    medicalConditions: { cardiovascular: false, respiratory: false, metabolic: false, specificConditions: [] },
    medications: []
  })

  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSend = () => {
    if (!input.trim()) return

    const userMsg: Message = { id: Date.now().toString(), text: input, sender: 'user' }
    setMessages(prev => [...prev, userMsg])
    processInput(input)
    setInput('')
  }

  const processInput = (text: string) => {
    // Determine next step based on current stage
    setTimeout(() => {
      let nextMsg = ''

      switch (stage) {
        case 1: // Name
          setUserData(prev => ({ ...prev, name: text }))
          nextMsg = `Nice to meet you, ${text}! How old are you?`
          setStage(2)
          break
        case 2: // Age
          setUserData(prev => ({ ...prev, age: parseInt(text) || 30 }))
          nextMsg = "Got it. What's your height (cm) and weight (kg)? (e.g. 175 70)"
          setStage(3)
          break
        case 3: // Height/Weight
          const [h, w] = text.split(/[\s,]+/).map(Number)
          setUserData(prev => ({ ...prev, height: h || 170, weight: w || 70 }))
          nextMsg = "Do you have any heart or lung conditions? (Asthma, COPD, Heart Disease, etc.)"
          setStage(4)
          break
        case 4: // Conditions
          const hasConditions = text.toLowerCase().includes('yes') || text.toLowerCase().includes('asthma') || text.toLowerCase().includes('heart')
          setUserData(prev => ({
            ...prev,
            medicalConditions: {
              ...prev.medicalConditions!,
              cardiovascular: text.toLowerCase().includes('heart'),
              respiratory: text.toLowerCase().includes('asthma') || text.toLowerCase().includes('copd')
            }
          }))
          nextMsg = "Are you currently taking any medications?"
          setStage(5)
          break
        case 5: // Meds
          setUserData(prev => ({ ...prev, medications: [text] }))
          nextMsg = "How often do you exercise? (Daily, Weekly, Rarely)"
          setStage(6)
          break
        case 6: // Exercise
          setUserData(prev => ({
            ...prev,
            fitnessLevel: text.toLowerCase().includes('daily') ? 'advanced' : text.toLowerCase().includes('weekly') ? 'intermediate' : 'beginner'
          }))
          nextMsg = "Perfect! Calculating your health profile..."
          setStage(7)

          // Finish onboarding
          setTimeout(() => {
            const finalUser: User = {
              id: Date.now().toString(),
              name: userData.name || 'User',
              age: userData.age || 30,
              weight: userData.weight || 70,
              height: userData.height || 170,
              bmi: (userData.weight || 70) / (((userData.height || 170) / 100) ** 2),
              medicalConditions: userData.medicalConditions as any,
              medications: userData.medications || [],
              fitnessLevel: userData.fitnessLevel || 'intermediate',
              createdAt: new Date().toISOString()
            }
            setUser(finalUser)
            router.push('/dashboard')
          }, 1500)
          break
      }

      setMessages(prev => [...prev, { id: Date.now().toString(), text: nextMsg, sender: 'ai' }])
    }, 600)
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white p-4 shadow-sm flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-full text-blue-600">
            <UserIcon size={20} />
          </div>
          <div>
            <h2 className="font-bold">AeroVital AI</h2>
            <p className="text-xs text-green-600 flex items-center gap-1">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              Online
            </p>
          </div>
        </div>
        <div className="w-32 bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-500"
            style={{ width: `${(stage / 7) * 100}%` }}
          ></div>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <AnimatePresence>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] p-4 rounded-2xl ${msg.sender === 'user'
                    ? 'bg-blue-600 text-white rounded-br-none'
                    : 'bg-white text-gray-800 shadow-sm rounded-bl-none border border-gray-100'
                  }`}
              >
                {msg.text}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white border-t border-gray-100">
        <div className="flex gap-2 items-center bg-gray-50 p-2 rounded-full border border-gray-200 focus-within:border-blue-500 transition-colors">
          <button className="p-2 text-gray-400 hover:text-blue-600 transition">
            <Mic size={20} />
          </button>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Type your answer..."
            className="flex-1 bg-transparent outline-none text-gray-800 placeholder-gray-400"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim()}
            className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:opacity-50 disabled:hover:bg-blue-600 transition"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  )
}
