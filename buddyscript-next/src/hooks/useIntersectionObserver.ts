"use client";

import { useEffect, useRef } from "react";

interface UseIntersectionObserverOptions {
    threshold?: number;
    root?: Element | null;
    rootMargin?: string;
    enabled?: boolean;
}

/**
 * Hook that triggers a callback when the target element intersects with the viewport
 * Useful for implementing infinite scroll and lazy loading
 */
export function useIntersectionObserver(
    onIntersect: () => void,
    options: UseIntersectionObserverOptions = {}
) {
    const {
        threshold = 0,
        root = null,
        rootMargin = "0px",
        enabled = true,
    } = options;

    const targetRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!enabled) return;

        const target = targetRef.current;
        if (!target) return;

        const observer = new IntersectionObserver(
            (entries) => {
                const [entry] = entries;
                if (entry.isIntersecting) {
                    onIntersect();
                }
            },
            {
                threshold,
                root,
                rootMargin,
            }
        );

        observer.observe(target);

        return () => {
            if (target) {
                observer.unobserve(target);
            }
        };
    }, [enabled, onIntersect, root, rootMargin, threshold]);

    return targetRef;
}
