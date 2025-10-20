export interface Account {
  username: string;
  password: string;
}

export interface BrowserConfig {
  headless: boolean;
  useRealChrome: boolean;
  userDataDir?: string;
  viewport?: {
    width: number;
    height: number;
    deviceScaleFactor?: number;
    hasTouch?: boolean;
    isLandscape?: boolean;
    isMobile?: boolean;
  };
}

export interface LoginResult {
  success: boolean;
  error?: string;
  account?: Account;
}

export interface ProfileInfo {
  username: string;
  title?: string;
  exists: boolean;
  error?: string;
}

export interface CaptchaInfo {
  isPresent: boolean;
  type: 'slider' | 'click' | 'text' | 'unknown';
  selectors: string[];
  timestamp: string;
  url: string;
}

export interface CaptchaNotification {
  id: string;
  timestamp: string;
  status: 'waiting' | 'resolved' | 'timeout';
  captchaInfo: CaptchaInfo;
  screenshot: string;
  instructions: string[];
  currentUrl: string;
  pageTitle: string;
}

export interface AutomationTask {
  id: string;
  name: string;
  task: () => Promise<void>;
  completed: boolean;
  error?: string;
}

export interface AutomationState {
  isPaused: boolean;
  currentTaskIndex: number;
  tasks: AutomationTask[];
  currentNotificationId?: string;
  timestamp: string;
  url: string;
}