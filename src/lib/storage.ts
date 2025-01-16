import { supabase } from './supabase'

export async function uploadMedia(file: File, userId: string) {
  try {
    // 生成唯一文件名
    const fileExt = file.name.split('.').pop()
    const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`
    const filePath = `${userId}/${fileName}`

    // 上传文件到 Storage
    const { error: uploadError } = await supabase.storage
      .from('media')
      .upload(filePath, file)

    if (uploadError) throw uploadError

    // 获取文件的公共 URL
    const { data: { publicUrl } } = supabase.storage
      .from('media')
      .getPublicUrl(filePath)

    return { filePath, publicUrl }
  } catch (error) {
    console.error('Error uploading file:', error)
    throw error
  }
} 