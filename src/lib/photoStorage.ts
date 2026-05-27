// 照片存储 - 使用数据库 + Vercel Blob

import { put } from '@vercel/blob';

export interface CloudPhoto {
  id: string
  url: string
  title: string
  date: string
  category: string
  createdAt: number
}

// 上传照片到 Vercel Blob 并保存到数据库
export async function uploadPhotoToCloud(file: File, title: string, category: string): Promise<CloudPhoto> {
  // 上传到 Vercel Blob
  const timestamp = Date.now()
  const random = Math.random().toString(36).slice(2, 8)
  const filename = `photo-${timestamp}-${random}.${file.name.split('.').pop()}`
  
  const blob = await put(filename, file, {
    access: 'public',
    contentType: file.type,
  })

  const photo: CloudPhoto = {
    id: `photo-${timestamp}-${random}`,
    url: blob.url,
    title: title || `${category} · ${new Date().toLocaleDateString('zh-CN')}`,
    date: new Date().toISOString().split('T')[0],
    category,
    createdAt: timestamp,
  }

  // 保存到数据库
  const response = await fetch('/api/photos', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(photo)
  })

  if (!response.ok) {
    throw new Error('保存照片到数据库失败')
  }

  return photo
}

// 从数据库获取所有照片
export async function getAllCloudPhotos(): Promise<CloudPhoto[]> {
  const response = await fetch('/api/photos')
  if (!response.ok) {
    throw new Error('获取照片失败')
  }
  return response.json()
}

// 删除照片
export async function deleteCloudPhoto(id: string): Promise<void> {
  const response = await fetch(`/api/photos/${id}`, {
    method: 'DELETE'
  })
  
  if (!response.ok) {
    throw new Error('删除照片失败')
  }
}

// 按分类获取照片
export async function getCloudPhotosByCategory(category: string): Promise<CloudPhoto[]> {
  const photos = await getAllCloudPhotos()
  return photos.filter(p => p.category === category)
}
