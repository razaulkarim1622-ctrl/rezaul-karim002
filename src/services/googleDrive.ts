import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithPopup, 
  GoogleAuthProvider, 
  onAuthStateChanged, 
  User as FirebaseUser,
  signOut
} from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Firebase App
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);

export const DRIVE_SCOPES = [
  'https://www.googleapis.com/auth/drive',
  'https://www.googleapis.com/auth/drive.file',
  'https://www.googleapis.com/auth/drive.appdata'
];

const provider = new GoogleAuthProvider();
DRIVE_SCOPES.forEach(scope => provider.addScope(scope));

// In-memory token cache (never stored in localStorage/sessionStorage per security guidelines)
let cachedAccessToken: string | null = null;
let isSigningIn = false;

export interface DriveFileItem {
  id: string;
  name: string;
  mimeType: string;
  size?: string;
  createdTime: string;
  modifiedTime: string;
  webViewLink?: string;
}

// Auth State Listener
export const initGoogleAuth = (
  onAuthSuccess?: (user: FirebaseUser, token: string) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, async (user: FirebaseUser | null) => {
    if (user && cachedAccessToken) {
      if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
    } else {
      if (!isSigningIn) {
        cachedAccessToken = null;
        if (onAuthFailure) onAuthFailure();
      }
    }
  });
};

// Sign in with Google to obtain Drive access token
export const signInWithGoogleDrive = async (): Promise<{ user: FirebaseUser; accessToken: string }> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error('Google Drive এক্সেস টোকেন পাওয়া যায়নি');
    }
    cachedAccessToken = credential.accessToken;
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error: any) {
    console.error('Google Drive sign in failed:', error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

export const getDriveAccessToken = (): string | null => {
  return cachedAccessToken;
};

export const signOutGoogleDrive = async (): Promise<void> => {
  try {
    await signOut(auth);
  } finally {
    cachedAccessToken = null;
  }
};

// ---------------- GOOGLE DRIVE REST API v3 ----------------

// Helper to find or create "MRT Regular Khata Backups" folder
async function getOrCreateBackupFolder(accessToken: string): Promise<string | null> {
  try {
    const query = encodeURIComponent("name = 'MRT Regular Khata Backups' and mimeType = 'application/vnd.google.apps.folder' and trashed = false");
    const searchRes = await fetch(`https://www.googleapis.com/drive/v3/files?q=${query}&fields=files(id,name)`, {
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    const searchData = await searchRes.json();
    if (searchData.files && searchData.files.length > 0) {
      return searchData.files[0].id;
    }

    // Create folder
    const createRes = await fetch('https://www.googleapis.com/drive/v3/files', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: 'MRT Regular Khata Backups',
        mimeType: 'application/vnd.google.apps.folder',
        description: 'Automatic and manual backups from MRT Regular Khata software'
      })
    });
    const folder = await createRes.json();
    return folder.id || null;
  } catch (err) {
    console.warn('Folder check failed, saving to root:', err);
    return null;
  }
}

// List Khata backups from Google Drive
export const listKhataBackupsFromDrive = async (): Promise<DriveFileItem[]> => {
  const token = getDriveAccessToken();
  if (!token) throw new Error('গুগল ড্রাইভ কানেক্ট করা নেই');

  const query = encodeURIComponent("name contains 'MRT_Khata' and trashed = false");
  const url = `https://www.googleapis.com/drive/v3/files?q=${query}&orderBy=modifiedTime desc&fields=files(id,name,mimeType,size,createdTime,modifiedTime,webViewLink)&pageSize=30`;

  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` }
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error?.message || 'গুগল ড্রাইভ থেকে ফাইল তালিকা আনতে সমস্যা হয়েছে');
  }

  const data = await response.json();
  return data.files || [];
};

// Upload Backup File directly to Google Drive
export const uploadBackupToGoogleDrive = async (
  fileName: string,
  content: string,
  mimeType: string = 'text/csv'
): Promise<DriveFileItem> => {
  const token = getDriveAccessToken();
  if (!token) throw new Error('গুগল ড্রাইভ কানেক্ট করা নেই। অনুগ্রহ করে প্রথমে সাইন-ইন করুন।');

  const folderId = await getOrCreateBackupFolder(token);

  // Multipart upload to Google Drive v3
  const metadata: any = {
    name: fileName,
    mimeType: mimeType,
    description: 'MRT Regular Khata Business Backup'
  };

  if (folderId) {
    metadata.parents = [folderId];
  }

  const boundary = '-------314159265358979323846';
  const delimiter = `\r\n--${boundary}\r\n`;
  const closeDelimiter = `\r\n--${boundary}--`;

  const multipartRequestBody =
    delimiter +
    'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
    JSON.stringify(metadata) +
    delimiter +
    `Content-Type: ${mimeType}; charset=UTF-8\r\n\r\n` +
    content +
    closeDelimiter;

  const uploadRes = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,mimeType,size,createdTime,modifiedTime,webViewLink', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': `multipart/related; boundary=${boundary}`
    },
    body: multipartRequestBody
  });

  if (!uploadRes.ok) {
    const errorData = await uploadRes.json();
    throw new Error(errorData.error?.message || 'গুগল ড্রাইভে ফাইল আপলোড করতে ব্যর্থ হয়েছে');
  }

  return await uploadRes.json();
};

// Delete Backup File from Drive (Caller MUST prompt user confirmation first!)
export const deleteFileFromGoogleDrive = async (fileId: string): Promise<boolean> => {
  const token = getDriveAccessToken();
  if (!token) throw new Error('গুগল ড্রাইভ কানেক্ট করা নেই');

  const res = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` }
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error?.message || 'ফাইল মুছতে ব্যর্থ হয়েছে');
  }

  return true;
};
