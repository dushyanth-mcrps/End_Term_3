import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from 'firebase/firestore'
import { db } from './firebase'

function getResourcesCollection(userId) {
  if (!userId) {
    throw new Error('A valid userId is required.')
  }

  return collection(db, 'users', userId, 'resources')
}

function getResourceDoc(userId, resourceId) {
  if (!resourceId) {
    throw new Error('A valid resourceId is required.')
  }

  return doc(db, 'users', userId, 'resources', resourceId)
}

export async function getResources(userId) {
  const resourceQuery = query(
    getResourcesCollection(userId),
    orderBy('createdAt', 'desc'),
  )
  const snapshot = await getDocs(resourceQuery)

  return snapshot.docs.map((resourceDoc) => ({
    id: resourceDoc.id,
    ...resourceDoc.data(),
  }))
}

export async function addResource(userId, resource) {
  const docRef = await addDoc(getResourcesCollection(userId), {
    title: resource.title,
    link: resource.link,
    notes: resource.notes,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })

  return docRef.id
}

export async function editResource(userId, resourceId, updates) {
  await updateDoc(getResourceDoc(userId, resourceId), {
    title: updates.title,
    link: updates.link,
    notes: updates.notes,
    updatedAt: serverTimestamp(),
  })
}

export async function removeResource(userId, resourceId) {
  await deleteDoc(getResourceDoc(userId, resourceId))
}
