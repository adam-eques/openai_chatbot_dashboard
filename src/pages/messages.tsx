import { getMessages } from "@/apis";
import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";
import { SmartToyOutlined } from "../components/Icons";

type Message = {
  id: string,
  role: "user" | "bot",
  message: string,
  createdAt: Date
}

export default function Messages() {
  const router = useRouter()
  const { threadId } = router.query

  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const scrollRef = useRef<HTMLDivElement>(null);

  const handleScroll = () => {
    if (scrollRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;

      if (scrollTop + clientHeight === scrollHeight) {
        // Call your function here when scroll is at the bottom
        console.log('Scrolled to the bottom');
        setIsLoading(true)
      }
    }
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.addEventListener('scroll', handleScroll);
    }

    return () => {
      if (scrollRef.current) {
        scrollRef.current.removeEventListener('scroll', handleScroll);
      }
    };
  }, [])

  useEffect(() => {
    if (threadId && isLoading) {
      console.log("initial")
      
      const tId = threadId as string
      let newMsgs: Message[] = []
      console.log("tId", tId)
      if (tId) {
        console.log("origin", messages)
        const last = messages.at(messages.length - 1)
        let after = ""
        if (last) {
          after = last.id
        }
        console.log("after", after)
        getMessages(tId, { limit: 100, order: "asc", after: after }).then((msgs) => {
          console.log(msgs)
          newMsgs = msgs.map((msg: any): Message => {
            let tmpmsgs = ""
            msg.content.forEach((cont: any, idx: number) => {
              if (idx > 0) {
                tmpmsgs += "\n"
              }
              tmpmsgs += cont.text.value
            })
            return {
              id: msg.id,
              role: msg.role === "user" ? "user" : "bot",
              message: tmpmsgs,
              createdAt: new Date(msg.created_at)
            }
          })
          setMessages((origin1: Message[]) => {
            return [
              ...origin1,
              ...newMsgs,
            ]
          })
          setIsLoading(false)
        }).catch((reason) => {
          console.error(reason)
        })
      }
    }
  }, [threadId, isLoading])

  return (
    <>
      <Head>
        <title>messages</title>
      </Head>
      <div className="p-2 sm:p-6 justify-between flex flex-col h-screen max-w-4xl m-auto">
        <div className="flex sm:items-center justify-between py-3 px-4 border-b-2 border-gray-200">
          <div className="relative flex items-center space-x-4">
            <div className="flex flex-col leading-tight">
              <div className="text-2xl mt-1 flex items-center">
                <span className="text-gray-700 mr-3">Message History</span>
              </div>
              <span className="text-lg text-gray-600">ThreadId: { threadId }</span>
            </div>
          </div>
        </div>
        <div
          id="messages"
          ref={scrollRef}
          className="flex flex-col space-y-4 p-3 overflow-y-auto scrollbar-thumb-blue scrollbar-thumb-rounded scrollbar-track-blue-lighter scrollbar-w-2 scrolling-touch"
        >
          {messages.map((value: Message, idx: number) => {
            return (
              <div key={idx} className="chat-message">
                <div className={`flex items-end ${value.role === "user" ? "justify-end" : ""}`}>
                  <div className={`flex flex-col space-y-2 text-0.95rem max-w-[75%] mx-2 ${value.role === "user" ? "order-1 items-end" : "order-2 items-start"}`}>
                    <div>
                      <span className={`px-5 py-3 rounded-lg inline-block ${value.role === "user" ? "rounded-br-none bg-blue-600 text-white" : "rounded-bl-none bg-[#f2f2f2] text-black"}`}>
                        {value.message}
                      </span>
                    </div>
                  </div>
                  {value.role === "bot" && (<SmartToyOutlined className="w-7 h-7" />)}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </>
  )
}