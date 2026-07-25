'use server';

import {
  createTimetableSubmission,
  getTimetableSubmissions,
  getApprovedTimetables,
  approveTimetableSubmission,
  rejectTimetableSubmission,
  type TimetableSubmission
} from '@/lib/firestore';

export async function submitTimetableAction(
  year: string,
  section: string,
  fileData: string,
  fileName: string,
  userName: string,
  userEmail: string,
  branch?: string
) {
  try {
    return await createTimetableSubmission({
      year,
      section,
      branch,
      file_data: fileData,
      file_name: fileName,
      uploaded_by: userName,
      uploaded_by_email: userEmail
    });
  } catch (error) {
    console.error('Failed to submit timetable:', error);
    return false;
  }
}

export async function fetchTimetableSubmissions() {
  try {
    return await getTimetableSubmissions();
  } catch (error) {
    console.error('Failed to fetch timetable submissions:', error);
    return [];
  }
}

export async function fetchApprovedTimetables() {
  try {
    return await getApprovedTimetables();
  } catch (error) {
    console.error('Failed to fetch approved timetables:', error);
    return [];
  }
}

export async function approveTimetableAction(
  submissionId: string,
  year: string,
  section: string,
  branch: string,
  fileData: string
) {
  try {
    return await approveTimetableSubmission(submissionId, year, section, branch, fileData);
  } catch (error) {
    console.error('Failed to approve timetable:', error);
    return false;
  }
}

export async function rejectTimetableAction(submissionId: string) {
  try {
    return await rejectTimetableSubmission(submissionId);
  } catch (error) {
    console.error('Failed to reject timetable:', error);
    return false;
  }
}
