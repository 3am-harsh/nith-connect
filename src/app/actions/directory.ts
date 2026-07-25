'use server';

import { 
  getFirestoreDirectoryContacts, 
  createFirestoreDirectoryContact, 
  deleteFirestoreDirectoryContact,
  DirectoryContact 
} from '@/lib/firestore';

export async function fetchDirectoryContactsAction(): Promise<DirectoryContact[]> {
  return getFirestoreDirectoryContacts();
}

export async function addDirectoryContactAction(contact: Omit<DirectoryContact, 'id'>) {
  try {
    return createFirestoreDirectoryContact(contact);
  } catch (error) {
    console.error('Action failed to add contact:', error);
    return false;
  }
}

export async function deleteDirectoryContactAction(contactId: string) {
  try {
    return deleteFirestoreDirectoryContact(contactId);
  } catch (error) {
    console.error('Action failed to delete contact:', error);
    return false;
  }
}
