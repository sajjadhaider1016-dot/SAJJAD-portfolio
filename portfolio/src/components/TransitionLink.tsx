import type { AnchorHTMLAttributes, MouseEvent } from 'react';
import { flushSync } from 'react-dom';
import { useHref, useNavigate } from 'react-router-dom';

export function useTransitionNavigate() {
  const navigate = useNavigate();
  return (to: string) => {
    const go = () => navigate(to);
    const samePage = to.split('#')[0] === location.pathname;
    if (!samePage && document.startViewTransition) document.startViewTransition(() => flushSync(go));
    else go();
  };
}

export function TLink({ to, onClick, ...rest }: AnchorHTMLAttributes<HTMLAnchorElement> & { to: string }) {
  const go = useTransitionNavigate(), href = useHref(to);
  return <a href={href} {...rest} onClick={(e: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(e);
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey) return;
    e.preventDefault(); go(to);
  }} />;
}
