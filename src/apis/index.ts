import { UFile } from "@/types/file";
import axios, { HttpStatusCode } from "axios";

const apiInstance = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_API_SERVER}`,
})

export const getClient = (clientName: string) => {
  return apiInstance.get('/admin/client', {
    data: {
      client: clientName
    }
  }).then((res) => {
    if (res.status === 200) {
      return res.data.client
    }
    return undefined
  })
}

export const getInstructions = (clientName: string) => {
  return apiInstance.get('/admin/instruction', {
    data: {
      client: clientName
    }
  }).then((res) => {
    if (res.status === HttpStatusCode.Ok) {
      return res.data.instruction
    }
    return undefined
  })
}

export const updateInstructions = (clientName: string, instruction: string) => {
  return apiInstance.post('/admin/instruction', {
    client: clientName,
    instruction: instruction,
  }).then((res) => {
    if (res.status === HttpStatusCode.Ok) {
      return true
    } else {
      return false
    }
  })
}

export const getAllFiles = (clientName: string) => {
  return apiInstance.get('/admin/file/all', {
    data: {
      client: clientName
    }
  }).then((res) => {
    let tmp: UFile[] = []
    if (res.status === HttpStatusCode.Ok) {
      res.data.files.map((file: any) => {
        const date = new Date(file.createdAt)
        tmp = [
          ...tmp, {
            id: file.id,
            createdAt: date,
            originalName: file.originalName,
            size: file.size,
            uploadedPath: file.uploadedPath,
          }
        ]
      })
    }
    return tmp
  })
}

export const removeFile = (clientName: string, fileId: number) => {
  return apiInstance.delete(`/admin/file/${fileId}`, {
    data: {
      client: clientName
    }
  }).then((res) => {
    if (res.status === HttpStatusCode.Ok) {
      return true
    } else {
      return false
    }
  })
}

export const removeAllFiles = (clientName: string) => {
  return apiInstance.delete(`/admin/file/all`, {
    data: {
      client: clientName
    }
  }).then((res) => {
    if (res.status === HttpStatusCode.Ok) {
      return true
    } else {
      return false
    }
  })
}

export const uploadFile = (clientName: string, file: File) => {
  const formData = new FormData();
  formData.append('file', file)
  formData.append('client', clientName)
  return apiInstance.post('/admin/upload', formData).then((res) => {
    let tmp: {
      success: boolean,
      uploadedId: number,
      files: UFile[]
    } = {
      success: false,
      uploadedId: 0,
      files: []
    }
    if (res.status === HttpStatusCode.Ok && res.data.success) {
      let files: UFile[] = []
      res.data.files.map((file: any) => {
        const date = new Date(file.createdAt)
        files = [
          ...files, {
            id: file.id,
            createdAt: date,
            originalName: file.originalName,
            size: file.size,
            uploadedPath: file.uploadedPath,
          }
        ]
      })
      tmp = {
        success: true,
        uploadedId: res.data.uploadedId,
        files: files,
      }
    }
    return tmp
  })
}