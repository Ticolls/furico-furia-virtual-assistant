"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { sendMessage, fetchMessages } from "@/lib/api"
import type { Message } from "@/lib/types"
import ReactMarkdown from 'react-markdown';

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    loadMessages()
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  useEffect(() => {
    if (!isLoading) {
      inputRef.current?.focus()
    }
  }, [isLoading, messages])

  const loadMessages = async () => {
    try {
      setIsLoading(true)
      const data = await fetchMessages()
      setMessages(data)
    } catch (error) {
      console.error("Error fetching messages:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      content: input,
      role: "user",
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    try {
      await sendMessage(input)

      await loadMessages()
    } catch (error) {
      console.error("Error sending message:", error)
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white text-gray-900 flex flex-col items-center justify-center p-4 sm:p-6 relative">
      <div className="absolute top-0 left-0 w-full h-16 bg-black skew-y-[-2deg] transform -translate-y-6 z-0"></div>
      <div className="absolute bottom-0 right-0 w-full h-16 bg-black skew-y-[2deg] transform translate-y-6 z-0"></div>

      <div className="w-full max-w-2xl mx-auto z-10">
        <div className="mb-4 flex justify-center">
          <div
            className="w-24 h-24 rounded-full border-2 border-white shadow-lg p-1 bg-cover bg-no-repeat"
            style={{ backgroundImage: "url('/furico.png')", backgroundPosition: "center 12%" }}
          ></div>
        </div>

        <div className="text-center mb-6 max-w-lg mx-auto">
          <h1 className="text-xl font-bold text-gray-900 mb-2 uppercase tracking-wider">FURICO BOT</h1>
          <p className="text-gray-700 text-sm">
            Converse com o assistente virtual da FURIA. Pergunte sobre resultados de partidas e membros do time.
          </p>
        </div>

        <Card className="bg-white border-0 shadow-2xl overflow-hidden relative">
          <div className="absolute top-0 right-0 w-16 h-16">
            <div className="absolute top-0 right-0 w-full h-full bg-black transform rotate-45 translate-x-8 -translate-y-8"></div>
          </div>

          <CardHeader className="bg-black text-white p-4 flex justify-between items-center relative z-10">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
              <h2 className="text-lg font-bold uppercase tracking-wider">CHAT COM FURICO</h2>
            </div>
            <div className="text-xs text-gray-400">FURIA ESPORTS</div>
          </CardHeader>

          <CardContent className="p-0 relative">
            <div className="absolute inset-0 bg-grid-pattern opacity-5 pointer-events-none"></div>

            <div className="h-[450px] overflow-y-auto p-5 space-y-5 relative z-10">
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <div className="p-6 rounded-lg bg-gray-100 border border-gray-200 max-w-md">
                    <p className="text-gray-700">
                      Olá! Como posso ajudar? Pergunte-me sobre o time de Counter-Strike da FURIA, seus membros ou
                      resultados de partidas.
                    </p>
                  </div>
                </div>
              ) : (
                messages.map((message) => (
                  <div key={message.timestamp.toString()} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                    {message.role === "assistant" && (
                        <div
                        className="w-8 h-8 rounded-full flex-shrink-0 mr-2 flex items-center justify-center overflow-hidden bg-cover bg-no-repeat"
                        style={{ backgroundImage: "url('/furico.png')", backgroundPosition: "center 12%" }}
                      ></div>
                    )}
                    <div
                      className={`max-w-[85%] rounded-lg px-5 py-3 shadow-md ${
                        message.role === "user"
                          ? "bg-black text-white clip-message-user"
                          : "bg-gray-100 text-gray-900 border-l-4 border-black clip-message-assistant"
                      }`}
                    >
                      <ReactMarkdown>{message.content}</ReactMarkdown>
                    </div>
                  </div>
                ))
              )}

              {isLoading && (
                <div className="flex justify-start">
                  <div className="w-8 h-8 rounded-full bg-black flex-shrink-0 mr-2 flex items-center justify-center overflow-hidden">
                    <span className="text-xs text-white">F</span>
                  </div>
                  <div className="max-w-[85%] rounded-lg px-5 py-3 bg-gray-100 text-gray-900 border-l-4 border-black shadow-md">
                    <div className="flex items-center gap-2">
                      <div className="animate-pulse flex items-center">
                        <span className="inline-block w-2 h-2 bg-black rounded-full mr-1 animate-[bounce_1s_infinite_0ms]"></span>
                        <span className="inline-block w-2 h-2 bg-black rounded-full mr-1 animate-[bounce_1s_infinite_200ms]"></span>
                        <span className="inline-block w-2 h-2 bg-black rounded-full animate-[bounce_1s_infinite_400ms]"></span>
                        <span className="ml-2">Furico está pensando</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </CardContent>

          <CardFooter className="border-t border-gray-200 p-4 bg-gray-50">
            <form onSubmit={handleSendMessage} className="flex gap-3 w-full">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={isLoading ? "Aguarde a resposta do Furico..." : "Pergunte algo ao Furico..."}
                className="flex-1 bg-white text-gray-900 rounded-md px-5 py-3 focus:outline-none focus:ring-2 focus:ring-black/30 border border-gray-300 placeholder-gray-500"
                disabled={isLoading}
              />
              <Button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="bg-black hover:bg-gray-800 text-white rounded-md p-3 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send size={20} />
              </Button>
            </form>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
