"use client";

import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

function isInternalNavigationLink(anchor: HTMLAnchorElement, pathname: string) {
  const href = anchor.getAttribute("href");
  if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) {
    return false;
  }

  if (href.startsWith("http")) {
    try {
      const url = new URL(href);
      return url.origin === window.location.origin && url.pathname !== pathname;
    } catch {
      return false;
    }
  }

  return href.startsWith("/") && href !== pathname;
}

export default function PageLoadingBar() {
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const previousPathname = useRef(pathname);

  const startLoading = useCallback(() => {
    setIsLoading(true);
    setProgress(20);
  }, []);

  const finishLoading = useCallback(() => {
    setProgress(100);
    window.setTimeout(() => {
      setIsLoading(false);
      setProgress(0);
    }, 200);
  }, []);

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      const anchor = (event.target as HTMLElement).closest("a");
      if (!anchor || !isInternalNavigationLink(anchor, pathname)) {
        return;
      }
      startLoading();
    };

    document.addEventListener("click", handleClick, true);
    return () => document.removeEventListener("click", handleClick, true);
  }, [pathname, startLoading]);

  useEffect(() => {
    const handlePopState = () => startLoading();
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [startLoading]);

  useEffect(() => {
    if (previousPathname.current === pathname) {
      return;
    }

    previousPathname.current = pathname;

    if (isLoading) {
      finishLoading();
    }
  }, [pathname, isLoading, finishLoading]);

  useEffect(() => {
    if (!isLoading || progress >= 90) {
      return;
    }

    const interval = window.setInterval(() => {
      setProgress((current) => Math.min(current + 8, 90));
    }, 100);

    return () => window.clearInterval(interval);
  }, [isLoading, progress]);

  useEffect(() => {
    if (!isLoading) {
      return;
    }

    const timeout = window.setTimeout(() => {
      finishLoading();
    }, 5000);

    return () => window.clearTimeout(timeout);
  }, [isLoading, finishLoading]);

  if (!isLoading && progress === 0) {
    return null;
  }

  return (
    <div
      className="pointer-events-none fixed left-0 right-0 top-0 z-[102] h-0.5 bg-steel-dark/20"
      role="progressbar"
      aria-valuenow={progress}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label="Cargando página"
    >
      <div
        className="h-full bg-orange transition-[width] duration-150 ease-out"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}
