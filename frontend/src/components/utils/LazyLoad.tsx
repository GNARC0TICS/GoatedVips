import React, { Suspense, lazy, useEffect, useMemo, useRef, useState } from "react";

interface LazyLoadProps<P = any> {
  /**
   * A dynamic import function returning a module whose default export is a React component.
   * Example: () => import("@/components/home/HeroVideo")
   */
  importer: () => Promise<{ default: React.ComponentType<P> }>;
  /** An element to display while the component has not yet entered the viewport */
  placeholder?: React.ReactNode;
  /** Optional rootMargin passed to the IntersectionObserver, defaults to "200px" */
  rootMargin?: string;
  /** Props forwarded to the dynamically imported component */
  componentProps?: P;
}

/**
 * LazyLoad delays importing and rendering heavy components until their placeholder
 * scrolls into the viewport. This drastically cuts initial JS payload on very large pages.
 *
 * It works in three steps:
 * 1. Render a <div> placeholder that is observed with an IntersectionObserver.
 * 2. Once the placeholder is visible, create a React.lazy component from the provided importer.
 * 3. Render the real component inside <Suspense> so it streams in while the user scrolls.
 */
export const LazyLoad = <P,>({ importer, placeholder = null, rootMargin = "200px", componentProps }: LazyLoadProps<P>) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  // Observe viewport visibility
  useEffect(() => {
    const node = containerRef.current;
    if (!node || isVisible) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      {
        root: null,
        rootMargin,
        threshold: 0.01,
      },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [isVisible, rootMargin]);

  // Build the lazy component only when needed to prevent premature network fetches
  const LazyComponent = useMemo(() => (isVisible ? lazy(importer) : null), [isVisible, importer]);

  return (
    <div ref={containerRef}>
      {isVisible && LazyComponent ? (
        <Suspense fallback={placeholder}>{<LazyComponent {...(componentProps as P)} />}</Suspense>
      ) : (
        placeholder
      )}
    </div>
  );
}; 