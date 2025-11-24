import React from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    error?: boolean;
    inputClassName?: string;
}

/**
 * Input Atom
 * Basic text input with error state styling
 */
export const Input: React.FC<InputProps> = ({
    error = false,
    inputClassName = 'form-control _social_login_input',
    className = '',
    ...props
}) => {
    const classes = [
        inputClassName,
        error ? 'is-invalid' : '',
        className
    ].filter(Boolean).join(' ');

    return (
        <input
            className={classes}
            {...props}
        />
    );
};
