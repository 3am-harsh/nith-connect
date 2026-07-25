'use server';

import {
  submitClubRequest,
  getClubSubmissions,
  getApprovedClubs,
  approveClubSubmission,
  rejectClubSubmission
} from '@/lib/firestore';

export async function submitClubRequestAction(
  name: string,
  desc: string,
  category: string,
  contact: string,
  presidentName: string,
  presidentEmail: string,
  presidentDesignation: string,
  domains: string,
  userName: string,
  userEmail: string
) {
  try {
    return await submitClubRequest(
      name,
      desc,
      category,
      contact,
      presidentName,
      presidentEmail,
      presidentDesignation,
      domains,
      userName,
      userEmail
    );
  } catch (error) {
    console.error('Failed to submit club request action:', error);
    return false;
  }
}

export async function fetchClubSubmissionsAction() {
  try {
    return await getClubSubmissions();
  } catch (error) {
    console.error('Failed to fetch club submissions action:', error);
    return [];
  }
}

export async function fetchApprovedClubsAction() {
  try {
    return await getApprovedClubs();
  } catch (error) {
    console.error('Failed to fetch approved clubs action:', error);
    return [];
  }
}

export async function approveClubSubmissionAction(submissionId: string, devEmail: string) {
  try {
    return await approveClubSubmission(submissionId, devEmail);
  } catch (error) {
    console.error('Failed to approve club submission action:', error);
    return false;
  }
}

export async function rejectClubSubmissionAction(submissionId: string) {
  try {
    return await rejectClubSubmission(submissionId);
  } catch (error) {
    console.error('Failed to reject club submission action:', error);
    return false;
  }
}
