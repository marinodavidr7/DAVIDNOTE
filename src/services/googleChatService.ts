import { initializeApp, getApps } from 'firebase/app';
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, User } from 'firebase/auth';

const firebaseConfig = {
  projectId: "river-pipe-m6tvw",
  appId: "1:103296721510:web:3c4a5cf9ca344e8485c3a7",
  apiKey: "AIzaSyDKZakPPo5rVbjz5OUblwqTx-hlzgGa2ug",
  authDomain: "river-pipe-m6tvw.firebaseapp.com",
  storageBucket: "river-pipe-m6tvw.firebasestorage.app",
  messagingSenderId: "103296721510",
  measurementId: ""
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const auth = getAuth(app);

const provider = new GoogleAuthProvider();
provider.addScope('https://www.googleapis.com/auth/chat.messages');
provider.addScope('https://www.googleapis.com/auth/chat.messages.create');
provider.addScope('https://www.googleapis.com/auth/chat.spaces');
provider.addScope('https://www.googleapis.com/auth/chat.spaces.readonly');

let isSigningIn = false;
let cachedAccessToken: string | null = null;

export const initChatAuth = (
  onAuthSuccess?: (user: User, token: string) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user) {
      if (cachedAccessToken) {
        if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
      } else if (!isSigningIn) {
        cachedAccessToken = null;
        if (onAuthFailure) onAuthFailure();
      }
    } else {
      cachedAccessToken = null;
      if (onAuthFailure) onAuthFailure();
    }
  });
};

export const chatGoogleSignIn = async (): Promise<{ user: User; accessToken: string } | null> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error('Failed to get access token from Firebase Auth');
    }
    cachedAccessToken = credential.accessToken;
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error: any) {
    console.error('Chat sign in error:', error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

export const getChatAccessToken = async (): Promise<string | null> => {
  return cachedAccessToken;
};

export const chatLogout = async () => {
  await auth.signOut();
  cachedAccessToken = null;
};

export interface ChatSpace {
  name: string;
  displayName?: string;
  type?: string;
  singleUserBotDm?: boolean;
}

export interface FetchSpacesResult {
  spaces: ChatSpace[];
  chatDisabled?: boolean;
  errorMessage?: string;
}

export const fetchChatSpaces = async (token: string): Promise<FetchSpacesResult> => {
  try {
    const res = await fetch('https://chat.googleapis.com/v1/spaces', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    if (!res.ok) {
      const errText = await res.text();
      let isChatOff = false;
      try {
        const parsed = JSON.parse(errText);
        const msg = String(parsed?.error?.message || '').toLowerCase();
        if (msg.includes('google chat is turned off') || parsed?.error?.status === 'FAILED_PRECONDITION') {
          isChatOff = true;
        }
      } catch {}

      if (isChatOff) {
        console.warn('Google Chat está desactivado en la cuenta de Google utilizada.');
        return {
          spaces: [],
          chatDisabled: true,
          errorMessage: 'Google Chat está desactivado en tu cuenta de Google. Puedes usar un Webhook para enviar mensajes.'
        };
      }

      return {
        spaces: [],
        errorMessage: `No se pudieron cargar los espacios (Código ${res.status})`
      };
    }
    const data = await res.json();
    return {
      spaces: data.spaces || [],
      chatDisabled: false
    };
  } catch (err: any) {
    console.warn('Advertencia en fetchChatSpaces:', err?.message || err);
    return {
      spaces: [],
      errorMessage: err?.message || 'Error de conexión con Google Chat'
    };
  }
};

export const sendChatMessage = async (token: string, spaceName: string, text: string): Promise<any> => {
  try {
    const res = await fetch(`https://chat.googleapis.com/v1/spaces/${spaceName}/messages`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ text })
    });
    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Error sending message: ${errText}`);
    }
    return await res.json();
  } catch (err) {
    console.warn('sendChatMessage warning:', err);
    throw err;
  }
};

export const sendChatWebhookMessage = async (webhookUrl: string, text: string): Promise<any> => {
  const cleanUrl = webhookUrl.trim();
  if (!cleanUrl.startsWith('http')) {
    throw new Error('La URL del Webhook debe comenzar con https://');
  }
  const res = await fetch(cleanUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ text })
  });
  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Error en el Webhook de Google Chat: ${errText || res.statusText}`);
  }
  return await res.json();
};
