import type { ElementType } from 'react';

/** A heading whose words resolve through the dither. `soft` is the quieter second half. */
export function Kinetic({ as: Tag = 'h2', text, soft = '', className = '' }: { as?: ElementType; text: string; soft?: string; className?: string }) {
  const words = (s: string, from: number) => s.split(' ').filter(Boolean).map((w, i) => (
    <span key={from + i}><span className="w" style={{ ['--i' as string]: from + i }}>{w}</span>{' '}</span>
  ));
  const n = text.split(' ').filter(Boolean).length;
  return (
    <Tag className={className} data-kin="" data-dim="">
      {words(text, 0)}{soft && <em>{words(soft, n)}</em>}
    </Tag>
  );
}
