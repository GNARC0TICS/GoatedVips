import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cn } from "@/utils/cn";

const Dialog = DialogPrimitive.Root;

const DialogTrigger = DialogPrimitive.Trigger;

const DialogPortal = DialogPrimitive.Portal;

const DialogClose = DialogPrimitive.Close;

const DialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      "fixed inset-0 z-50 bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className
    )}
    {...props}
  />
));
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName;

const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, children, ...props }, forwardedRef) => {
  const contentRef = React.useRef<HTMLDivElement | null>(null);
  const closeButtonRef = React.useRef<HTMLButtonElement>(null);
  const [touchStartY, setTouchStartY] = React.useState<number | null>(null);
  const [currentTranslateY, setCurrentTranslateY] = React.useState(0);
  const [isDragging, setIsDragging] = React.useState(false);

  const SWIPE_CLOSE_THRESHOLD = 75; // pixels

  // Combine forwardedRef and internal contentRef
  const combinedRef = React.useCallback(
    (node: HTMLDivElement) => {
      if (typeof forwardedRef === 'function') {
        forwardedRef(node);
      } else if (forwardedRef) {
        forwardedRef.current = node;
      }
      contentRef.current = node;
    },
    [forwardedRef]
  );

  const handleTouchStart = (event: React.TouchEvent<HTMLDivElement>) => {
    if (event.touches.length !== 1) return; // Allow only single touch gestures

    // Prevent swipe if interacting with scrollable content that is already scrolled,
    // or if the target is an input/interactive element.
    const targetElement = event.target as HTMLElement;
    if (
      (contentRef.current && contentRef.current.scrollTop > 0) ||
      targetElement.closest('input, textarea, button, select, a[href], [contenteditable="true"]')
    ) {
      return;
    }
    
    setTouchStartY(event.touches[0].clientY);
    setIsDragging(true);
    // No transition during drag for immediate feedback
    if (contentRef.current) {
      contentRef.current.style.transition = 'none';
    }
  };

  const handleTouchMove = (event: React.TouchEvent<HTMLDivElement>) => {
    if (!isDragging || touchStartY === null || event.touches.length !== 1) return;

    const currentTouchY = event.touches[0].clientY;
    let deltaY = currentTouchY - touchStartY;

    // Only allow dragging downwards or a little bit upwards
    if (deltaY < -20) deltaY = -20; // Resist upward swipe a bit
    
    // Prevent page scroll when swiping dialog down
    if (deltaY > 0 && event.cancelable) {
      event.preventDefault();
    }
    
    setCurrentTranslateY(deltaY);
  };

  const handleTouchEnd = () => {
    if (!isDragging) return;

    setIsDragging(false);
    setTouchStartY(null);

    // Re-enable transition for snap-back or close animation
    if (contentRef.current) {
      contentRef.current.style.transition = 'transform 0.2s ease-out';
    }

    if (currentTranslateY > SWIPE_CLOSE_THRESHOLD) {
      if (closeButtonRef.current) {
        closeButtonRef.current.click();
      }
    } else {
      // Snap back to original position
      setCurrentTranslateY(0);
    }
  };
  
  // Reset transform if dialog is closed by other means (e.g. X button, Escape key)
  React.useEffect(() => {
    const node = contentRef.current;
    if (!node) return;

    // Set initial transition style once the component mounts and ref is available
    node.style.transition = 'transform 0.2s ease-out';

    const observer = new MutationObserver((mutationsList) => {
      for (const mutation of mutationsList) {
        if (
          mutation.type === 'attributes' &&
          mutation.attributeName === 'data-state' &&
          node.getAttribute('data-state') === 'closed'
        ) {
          // Ensure transition is active for the reset
          node.style.transition = 'transform 0.2s ease-out';
          setCurrentTranslateY(0);
        }
      }
    });

    observer.observe(node, { attributes: true });

    return () => {
      observer.disconnect();
    };
  }, []); // Empty dependency array means this runs once on mount and cleans up on unmount


  return (
    <DialogPortal>
      <DialogOverlay />
      <DialogPrimitive.Content
        ref={combinedRef}
        className={cn(
          "fixed z-50 grid w-full gap-4 border bg-background p-6 shadow-lg data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 sm:rounded-lg",
          "max-h-[85vh] overflow-y-auto", // Added max-height and overflow for mobile
          // Desktop positioning
          "sm:left-[50%] sm:top-[50%] sm:max-w-lg sm:translate-x-[-50%] sm:translate-y-[-50%] sm:data-[state=closed]:slide-out-to-left-1/2 sm:data-[state=closed]:slide-out-to-top-[48%] sm:data-[state=open]:slide-in-from-left-1/2 sm:data-[state=open]:slide-in-from-top-[48%]",
          // Mobile positioning - full width with margins
          "left-4 right-4 top-[50%] translate-y-[-50%] sm:left-[50%] sm:right-auto",
          className
        )}
        {...props}
        style={{
          ...props.style,
          transform: `translateY(${currentTranslateY}px)`,
          willChange: 'transform', // Hint browser for transform optimization
          // transition is handled dynamically in touch handlers and useEffect
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onPointerDownCapture={(e) => { // Prevent Radix focusing logic from interfering with touch start
          if (e.pointerType === 'touch') {
            e.stopPropagation();
          }
        }}
      >
        {children}
        <DialogPrimitive.Close className="absolute right-4 top-4 rounded-sm p-2 opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
          <X className="h-6 w-6" />
          <span className="sr-only">Close</span>
        </DialogPrimitive.Close>
        {/* Invisible button to trigger close programmatically via swipe */}
        <DialogPrimitive.Close ref={closeButtonRef} style={{ display: 'none' }} aria-hidden="true" />
      </DialogPrimitive.Content>
    </DialogPortal>
  );
});
DialogContent.displayName = DialogPrimitive.Content.displayName;

const DialogHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col space-y-1.5 text-center sm:text-left",
      className
    )}
    {...props}
  />
);
DialogHeader.displayName = "DialogHeader";

const DialogFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",
      className
    )}
    {...props}
  />
);
DialogFooter.displayName = "DialogFooter";

const DialogTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn(
      "text-lg font-semibold leading-none tracking-tight",
      className
    )}
    {...props}
  />
));
DialogTitle.displayName = DialogPrimitive.Title.displayName;

const DialogDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
));
DialogDescription.displayName = DialogPrimitive.Description.displayName;

export {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogClose,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
};
