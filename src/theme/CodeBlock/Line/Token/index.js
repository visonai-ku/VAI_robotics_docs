import React from 'react';
import clsx from 'clsx';

// Code blocks mark user-filled values as `xxx` (e.g. 192.168.6.xxx).
// Highlight each `xxx` and the trailing comment on that line that explains it.
const PLACEHOLDER = 'xxx';

export default function CodeBlockLineToken({line, token, className, children, ...props}) {
  const lineHasPlaceholder = line.some((t) => t.content.includes(PLACEHOLDER));
  if (!lineHasPlaceholder) {
    return <span className={className} {...props}>{children}</span>;
  }
  if (token.types.includes('comment')) {
    return <span className={clsx(className, 'code-placeholder-note')} {...props}>{children}</span>;
  }
  if (typeof children !== 'string' || !children.includes(PLACEHOLDER)) {
    return <span className={className} {...props}>{children}</span>;
  }
  const parts = children.split(PLACEHOLDER);
  return (
    <span className={className} {...props}>
      {parts.map((part, i) => (
        <React.Fragment key={i}>
          {part}
          {i < parts.length - 1 && <span className="code-placeholder">{PLACEHOLDER}</span>}
        </React.Fragment>
      ))}
    </span>
  );
}
