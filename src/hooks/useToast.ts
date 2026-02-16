// Toast hook for showing temporary notifications (Issue #22)

import { useCallback, useState } from 'react';

interface ToastState {
  visible: boolean;
  message: string;
  emoji?: string;
}

export function useToast() {
  const [state, setState] = useState<ToastState>({
    visible: false,
    message: '',
  });

  const showToast = useCallback((message: string, emoji?: string) => {
    setState({ visible: true, message, emoji });
  }, []);

  const hideToast = useCallback(() => {
    setState((prev) => ({ ...prev, visible: false }));
  }, []);

  return {
    ...state,
    showToast,
    hideToast,
  };
}
