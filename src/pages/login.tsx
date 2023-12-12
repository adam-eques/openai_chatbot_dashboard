import { getClient } from "@/apis";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useCookies } from "react-cookie";


export default function Login() {
  const [cookies, setCookie, removeCookie] = useCookies(['user'])
  const router = useRouter()

  const [name, setName] = useState("")
  const login = (name: string) => async () => {
    try {
      const clientInfo = await getClient(name)
      if (clientInfo) {
        setCookie('user', clientInfo)
        router.push('/', { scroll: false })
      } else {
        alert("user is not exist")
      }
    } catch (error) {
      console.error(error)
      alert(error)
    }
  }
  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen overflow-hidden">
      <div className="w-full p-6 bg-white rounded-md shadow-md lg:max-w-xl">
        <h1 className="text-3xl font-bold text-center text-gray-700">Login</h1>
        <div className="mt-6">
          <div className="mb-4">
            <label
              htmlFor="name"
              className="block text-sm font-semibold text-gray-800"
            >
              Name
            </label>
            <input
              type="text"
              className="block w-full px-4 py-2 mt-2 text-gray-700 bg-white border rounded-md focus:border-gray-400 focus:ring-gray-300 focus:outline-none focus:ring focus:ring-opacity-40"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="mt-2">
            <button
              className="w-full px-4 py-2 tracking-wide text-white transition-colors duration-200 transform bg-gray-700 rounded-md hover:bg-gray-600 focus:outline-none focus:bg-gray-600"
              onClick={login(name)}
            >
              Login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}