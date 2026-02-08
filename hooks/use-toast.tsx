// hooks/use-toast.tsx
'use client';
import * as React from 'react';
// Import ToastAction along with ToastActionElement and ToastProps
import { ToastAction, ToastActionElement, ToastProps } from '@/components/ui/toast'; // Make sure this path is correct

const TOAST_LIMIT = 1; // Limit to 1 toast at a time, common for notifications
// Use a very long delay if you want toasts to persist until dismissed manually
const TOAST_REMOVE_DELAY = 1000000; // You can adjust this duration (in milliseconds) as needed

// Define a type for the simpler action object that the `toast` helper will accept
type ToastActionInput = {
  label: string;
  onClick: (event: React.MouseEvent<HTMLButtonElement>) => void;
  // You can add more props here if you want to pass them to ToastAction (e.g., variant)
};

// Update ToasterToast to allow both ToastActionElement (for internal use)
// and ToastActionInput (for the public `toast` helper)
type ToasterToast = ToastProps & {
  id: string;
  title?: React.ReactNode;
  description?: React.ReactNode;
  // Make action accept ToastActionElement or ToastActionInput
  action?: ToastActionElement | ToastActionInput; // Updated type for action
  variant?: ToastProps['variant']; // Added variant prop to ToasterToast
};

const actionTypes = {
  ADD_TOAST: 'ADD_TOAST',
  UPDATE_TOAST: 'UPDATE_TOAST',
  DISMISS_TOAST: 'DISMISS_TOAST',
  REMOVE_TOAST: 'REMOVE_TOAST',
} as const;

let count = 0;

function genId() {
  count = (count + 1) % Number.MAX_SAFE_INTEGER;
  return count.toString();
}

type Action =
  | {
      type: typeof actionTypes.ADD_TOAST;
      toast: ToasterToast;
    }
  | {
      type: typeof actionTypes.UPDATE_TOAST;
      toast: Partial<ToasterToast>;
    }
  | {
      type: typeof actionTypes.DISMISS_TOAST;
      toastId?: ToasterToast['id'];
    }
  | {
      type: typeof actionTypes.REMOVE_TOAST;
      toastId?: ToasterToast['id'];
    };

interface State {
  toasts: ToasterToast[];
}

const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case actionTypes.ADD_TOAST:
      return {
        ...state,
        toasts: [action.toast, ...state.toasts].slice(0, TOAST_LIMIT),
      };

    case actionTypes.UPDATE_TOAST:
      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === action.toast.id ? { ...t, ...action.toast } : t
        ),
      };

    case actionTypes.DISMISS_TOAST:
      const { toastId } = action;

      return {
        ...state,
        toasts: state.toasts.map((toast) =>
          toast.id === toastId || toastId === undefined
            ? {
                ...toast,
                open: false,
              }
            : toast
        ),
      };

    case actionTypes.REMOVE_TOAST:
      if (action.toastId === undefined) {
        return {
          ...state,
          toasts: [],
        };
      }
      return {
        ...state,
        toasts: state.toasts.filter((t) => t.id !== action.toastId),
      };
  }
};

const listeners: ((state: State) => void)[] = [];

let memoryState: State = { toasts: [] };

function dispatch(action: Action) {
  memoryState = reducer(memoryState, action);
  listeners.forEach((listener) => listener(memoryState));
}

// THIS IS THE EXPORTED TOAST FUNCTION that ClientLayout will use
export function toast({ action, ...props }: Omit<ToasterToast, 'id'>) {
  const id = genId();

  let processedAction: ToastActionElement | undefined;
  if (action) {
    if (typeof action === 'object' && 'label' in action && 'onClick' in action) {
      // Convert ToastActionInput to ToastActionElement
      processedAction = (
        <ToastAction
          altText={action.label}
          onClick={action.onClick}
        >
          {action.label}
        </ToastAction>
      ) as ToastActionElement; // Cast to ToastActionElement to satisfy the type
    } else {
      // Assume it's already a ToastActionElement if it's not our input object
      processedAction = action as ToastActionElement;
    }
  }

  const update = (props: ToasterToast) =>
    dispatch({
      type: actionTypes.UPDATE_TOAST,
      toast: { ...props, id },
    });

  const dismiss = () => dispatch({ type: actionTypes.DISMISS_TOAST, toastId: id });

  dispatch({
    type: actionTypes.ADD_TOAST,
    toast: {
      ...props,
      id,
      open: true,
      onOpenChange: (open) => { // 'open' parameter is implicitly boolean due to ToastProps
        if (!open) dismiss();
      },
      action: processedAction, // Use the processed action here
    },
  });

  return {
    id: id,
    dismiss,
    update,
  };
}

// This hook is used by Toaster.tsx
export function useToast() {
  const [state, setState] = React.useState<State>(memoryState);

  React.useEffect(() => {
    listeners.push(setState);
    return () => {
      const index = listeners.indexOf(setState);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    };
  }, []); // Empty dependency array to run effect once and correctly manage listeners

  return {
    ...state,
    toast, // This refers to the *exported* function above
    dismiss: React.useCallback(
      (toastId?: string) => dispatch({ type: actionTypes.DISMISS_TOAST, toastId }),
      []
    ),
  };
}
