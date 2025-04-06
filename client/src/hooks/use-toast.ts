import { useState } from "react";

export type ToastType = "success" | "error" | "info" | "warning";

export interface Toast {
  id: string;
  title: string;
  description?: string;
  type: ToastType;
  duration?: number;
}

interface ToastOptions {
  title: string;
  description?: string;
  type?: ToastType;
  duration?: number;
}

/**
 * Custom hook for managing toast notifications
 * Provides functions to display and dismiss toast notifications
 * 
 * @returns Toast state and utility functions
 */
export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);
  
  /**
   * Display a new toast notification
   * @param options - Toast options
   */
  const toast = (options: ToastOptions) => {
    const id = Math.random().toString(36).substring(2, 9);
    const newToast: Toast = {
      id,
      title: options.title,
      description: options.description,
      type: options.type || "info",
      duration: options.duration || 5000,
    };
    
    setToasts((prevToasts) => [...prevToasts, newToast]);
    
    // Auto-dismiss toast after duration
    if (newToast.duration !== Infinity) {
      setTimeout(() => {
        dismiss(id);
      }, newToast.duration);
    }
    
    return id;
  };
  
  /**
   * Display a success toast notification
   * @param options - Toast options
   */
  const success = (options: Omit<ToastOptions, "type">) => {
    return toast({ ...options, type: "success" });
  };
  
  /**
   * Display an error toast notification
   * @param options - Toast options
   */
  const error = (options: Omit<ToastOptions, "type">) => {
    return toast({ ...options, type: "error" });
  };
  
  /**
   * Display an info toast notification
   * @param options - Toast options
   */
  const info = (options: Omit<ToastOptions, "type">) => {
    return toast({ ...options, type: "info" });
  };
  
  /**
   * Display a warning toast notification
   * @param options - Toast options
   */
  const warning = (options: Omit<ToastOptions, "type">) => {
    return toast({ ...options, type: "warning" });
  };
  
  /**
   * Dismiss a toast notification by ID
   * @param id - Toast ID to dismiss
   */
  const dismiss = (id: string) => {
    setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
  };
  
  /**
   * Dismiss all toast notifications
   */
  const dismissAll = () => {
    setToasts([]);
  };
  
  return {
    toasts,
    toast,
    success,
    error,
    info,
    warning,
    dismiss,
    dismissAll,
  };
}