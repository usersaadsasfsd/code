'use client';

import { useToast } from '@/hooks/use-toast';
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
  ToastAction,
} from '@/components/ui/toast';

export function Toaster() {
  const { toasts } = useToast();

  return (
    <ToastProvider>
      {toasts.map(({ id, title, description, action, ...props }) => {
        // If action is an object with label and onClick, render ToastAction
        const renderAction =
          action && typeof action === 'object' && 'label' in action && 'onClick' in action ? (
            <ToastAction altText={action.label} onClick={action.onClick}>
              {action.label}
            </ToastAction>
          ) : (
            // Otherwise, assume action is already a React node or undefined
            action
          );

        return (
          <Toast key={id} {...props}>
            <div className="grid gap-1">
              {title && <ToastTitle>{title}</ToastTitle>}
              {description && <ToastDescription>{description}</ToastDescription>}
            </div>
            {renderAction}
            <ToastClose />
          </Toast>
        );
      })}
      <ToastViewport />
    </ToastProvider>
  );
}
