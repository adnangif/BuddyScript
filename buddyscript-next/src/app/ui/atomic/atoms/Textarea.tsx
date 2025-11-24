import React from 'react';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    error?: boolean;
    textareaClassName?: string;
}

/**
 * Textarea Atom
 * Multi-line text input with error state styling
 */
export const Textarea: React.FC<TextareaProps> = ({
    error = false,
    textareaClassName = 'form-control _textarea',
    className = '',
    ...props
}) => {
    const classes = [
        textareaClassName,
        error ? 'is-invalid' : '',
        className
    ].filter(Boolean).join(' ');

    return (
        <textarea
            className={classes}
            {...props}
        />
    );
};
