import type { Message, ApiResponse } from "./types"
import { config } from "./config"

export async function fetchMessages(): Promise<Message[]> {
  try {
    const response = await fetch(`${config.apiUrl}/message`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    })

    if (!config.debug) {
      console.log("Fetch messages response:", response)
    }

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`)
    }

    const data: ApiResponse = await response.json()
    return data.conversationHistory || []
  } catch (error) {
    console.error("Error fetching messages:", error)
    throw error
  }
}


export async function sendMessage(content: string): Promise<string | undefined> {
  try {

    const response = await fetch(`${config.apiUrl}/message`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({ message: content }),
    })

    if (config.debug) {
      console.log("Send message response:", response)
    }

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`)
    }

    const data: ApiResponse = await response.json()
    return data.answer
  } catch (error) {
    console.error("Error sending message:", error)
    throw error
  }
}






