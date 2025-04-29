
import * as React from 'react';

import {cn} from '@/lib/utils';

/**
 * @fileOverview Provides a UI component for creating textarea input fields.
 *
 * @module Textarea
 *
 * @description This module exports the Textarea component, which is a styled textarea element.
 */

const Textarea = React.forwardRef<HTMLTextAreaElement, React.ComponentProps<'textarea'>>(
  ({className, ...props}, ref) => {
    return (
      <textarea
        className={cn(
          'flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
          className
        )}
        ref={ref}
        // Add aria-label if a visible <Label> is not always associated
        // aria-label={props['aria-label'] || props.placeholder || "Text area"}
        {...props}
      />
    );
  }
);
Textarea.displayName = 'Textarea';

export {Textarea};

    