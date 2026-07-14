import { useEffect, useRef, useState } from 'react';

/**
 * useReveal - attaches an IntersectionObserver-based reveal animation to an element.
 * Returns { ref, isVisible } - apply ref to the element you want to animate.
 * Use with the .reveal / .revealed CSS classes for a fade-in-up transition.
 */
export function useReveal(threshold = 0.15) {
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          io.unobserve(el);
        }
      },
      { threshold }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [threshold]);

  return { ref, isVisible };
}

/**
 * Reveal - drop-in wrapper that reveals its children on scroll.
 */
export const Reveal = ({ children, delay = 0, className = '', as: Tag = 'div', ...props }) => {
  const { ref, isVisible } = useReveal();
  return (
    <Tag
      ref={ref}
      className={`reveal ${isVisible ? 'revealed' : ''} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
      {...props}
    >
      {children}
    </Tag>
  );
};
