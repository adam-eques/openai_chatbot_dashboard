import { getAllFiles, getInstructions, removeFile, updateInstructions, uploadFile } from "@/apis";
import { UFile } from "@/types/file";
import Head from "next/head";
import { useRouter } from "next/navigation";
import { ChangeEvent, useEffect, useState } from "react";
import { useCookies } from "react-cookie";

const MAX_FILES = 20;

export default function Home() {  
  const [cookies, setCookie, removeCookie] = useCookies(['user'])
  const router = useRouter()

  const [clientName, setClientName] = useState("")
  const [Instruction, setInstruction] = useState("")
  const [files, setFiles] = useState<UFile[]>([])
  const [instrEditable, setInstrEditable] = useState(false)
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    const userInfo = cookies.user
    if (!userInfo) {
      router.push('/login', { scroll: false })
    }
    setClientName(cookies.user?.name)
    getInstructions(cookies.user?.name).then((value) => {
      if (typeof value === "string") {
        setInstruction(value)
      }
    }).catch((reason) => {
      console.error(reason)
    })
    getAllFiles(cookies.user?.name).then((value) => {
      setFiles(value)
    }).catch((reason) => {
      console.error(reason)
    })
  }, [])

  const deleteFile = (clientName: string, id: number) => async () => {
    try {
      const success = await removeFile(clientName, id)
      if (success) {
        setFiles((value) => {
          const tmp = value.filter((v) => v.id !== id)
          return tmp
        })
      }
      alert("File was removed successfully")
    } catch (error) {
      console.error(error)
      alert("Failed to remove file")
    }
  }

  const updateInstr = (clientName: string, instr: string) => async () => {
    try {
      const success = await updateInstructions(clientName, instr)
      if (success) {
        setInstrEditable(false)
      }
    } catch (error) {
      console.error(error)
    }
  }

  const fileUpload = (clientName: string) => (event: ChangeEvent<HTMLInputElement>) => {
    if (files.length >= 20) {
      alert("Only 20 files can be uploaded")
      return
    }
    const file = event.target.files?.item(0)
    if (file) {
      console.log(file.size)
      // if (file.size >= ) {
      //   return
      // }
      switch (file.type) {
        case "application/pdf":
        case "text/plain":
        case "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
          setUploading(true)
          uploadFile(clientName, file).then((res) => {
            if (res.success) {
              setFiles(res.files)
              alert("Uploaded Successfully")
            } else {
              alert("Failed to upload")
            }
            setUploading(false)
          }).catch((reason: any) => {
            console.error(reason)
            setUploading(false)
          })
          break;
        default:
          alert('Unsupported format')
          break;
      }
    }
  }

  const logout = () => {
    removeCookie('user')
    router.push('/login')
  }
  
  return (
    <>
      <Head>
        <title>dashboard</title>
      </Head>
      <main className="flex flex-col px-10 pt-10">
        <div className="mb-7">
          <h1 className="float-left text-3xl">
            {clientName}
          </h1>
          <button
            type="button"
            className="text-white bg-gray-800 hover:bg-gray-900 focus:outline-none focus:ring-4 focus:ring-gray-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-gray-800 dark:hover:bg-gray-700 dark:focus:ring-gray-700 dark:border-gray-700 float-right"
            onClick={logout}
          >
            Logout
          </button>
        </div>
        <div>
          <label htmlFor="large-input" className="mb-2 text-lg font-medium text-gray-900 dark:text-white">Instruction</label>
          <button
            type="button"
            className="text-white bg-gray-800 hover:bg-gray-900 focus:outline-none focus:ring-4 focus:ring-gray-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-gray-800 dark:hover:bg-gray-700 dark:focus:ring-gray-700 dark:border-gray-700 float-right"
            onClick={
              instrEditable ? updateInstr(clientName, Instruction) : () => { setInstrEditable(true) }
            }
          >
            {instrEditable ? "Save" : "Edit"}
          </button>
        </div>
        <div className="mb-6">
          <textarea
            id="large-input"
            className="block w-full p-4 text-gray-900 border border-gray-300 rounded-lg bg-gray-50 sm:text-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            value={Instruction}
            readOnly={!instrEditable}
            onChange={(e) => {if (instrEditable) {setInstruction(e.target.value)}} }
          />
        </div>
        <div className="">
          <label htmlFor="large-input" className="mb-2 text-lg font-medium text-gray-900 dark:text-white">{`Files (${files.length}/${MAX_FILES})`}</label>
          <div className="relative inline-block float-right">
            <label htmlFor="file" className="text-white bg-gray-800 hover:bg-gray-900 focus:outline-none focus:ring-4 focus:ring-gray-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-gray-800 dark:hover:bg-gray-700 dark:focus:ring-gray-700 dark:border-gray-700 cursor-pointer">
              { uploading ? "Uploading..." : "Upload File" }
            </label>
            <input
              id="file"
              name="file"
              type="file"
              className="absolute opacity-0 top-0 left-0 w-0 h-0"
              accept=".docx, .txt, .pdf"
              onChange={fileUpload(clientName)}
              disabled={uploading}
            />
          </div>
        </div>
        <div className="overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 sm:px-6 lg:px-8">
            <div className="overflow-hidden">
              <table className="min-w-full text-left text-sm font-light">
                <thead className="border-b font-medium dark:border-neutral-500">
                  <tr>
                    <th scope="col" className="px-6 py-4">No</th>
                    <th scope="col" className="px-6 py-4">FileName</th>
                    <th scope="col" className="px-6 py-4">Size(byte)</th>
                    <th scope="col" className="px-6 py-4">Uploaded at</th>
                    <th scope="col" className="px-6 py-4 float-right">Edit</th>
                  </tr>
                </thead>
                <tbody>
                  {files.map((value, idx) => {
                    return (
                      <tr key={value.id} className="border-b dark:border-neutral-500">
                        <td className="whitespace-nowrap px-6 py-4 font-medium">{idx + 1}</td>
                        <td className="whitespace-nowrap px-6 py-4">{value.originalName}</td>
                        <td className="whitespace-nowrap px-6 py-4">{value.size}</td>
                        <td className="whitespace-nowrap px-6 py-4">{value.createdAt.toISOString() }</td>
                        <td className="whitespace-nowrap px-6 py-4">
                          <button
                            type="button"
                            className="text-white bg-gray-800 hover:bg-gray-900 focus:outline-none focus:ring-4 focus:ring-gray-300 font-medium rounded-lg text-sm px-2 py-1.5 me-2 mb-2 dark:bg-gray-800 dark:hover:bg-gray-700 dark:focus:ring-gray-700 dark:border-gray-700 float-right"
                            onClick={deleteFile(clientName, value.id)}
                          >
                            remove
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}

// export const getServerSideProps = requireAuthentication((_context: any) => {
//     // Your normal `getServerSideProps` code here
// })
