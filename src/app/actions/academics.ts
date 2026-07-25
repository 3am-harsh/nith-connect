'use server';

import {
  addAcademicFile,
  fetchAcademicFiles,
  fetchAllAcademicFiles,
  deleteAcademicFile,
  type AcademicFile,
  type AcademicTab,
} from '@/lib/firestore';

export async function addAcademicFileAction(
  data: Omit<AcademicFile, 'id' | 'uploaded_at'>
): Promise<boolean> {
  try {
    return await addAcademicFile(data);
  } catch (error) {
    console.error('addAcademicFileAction error:', error);
    return false;
  }
}

export async function fetchAcademicFilesAction(tab: AcademicTab): Promise<AcademicFile[]> {
  try {
    return await fetchAcademicFiles(tab);
  } catch (error) {
    console.error('fetchAcademicFilesAction error:', error);
    return [];
  }
}

export async function fetchAllAcademicFilesAction(): Promise<AcademicFile[]> {
  try {
    return await fetchAllAcademicFiles();
  } catch (error) {
    console.error('fetchAllAcademicFilesAction error:', error);
    return [];
  }
}

export async function deleteAcademicFileAction(fileId: string): Promise<boolean> {
  try {
    return await deleteAcademicFile(fileId);
  } catch (error) {
    console.error('deleteAcademicFileAction error:', error);
    return false;
  }
}
