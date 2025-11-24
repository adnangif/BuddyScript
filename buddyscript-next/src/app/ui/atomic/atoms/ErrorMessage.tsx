import React from 'react';

export interface ErrorMessageProps {
    id?: string;
    message?: string;
    className?: string;
}

/**
 * ErrorMessage Atom
 * Displays form field error messages
 */
export const ErrorMessage: React.FC<ErrorMessageProps> = ({
    id,
    message,
    className = '_social_login_error'
}) => {
    if (!message) {
        return null;
    }

    return (
        <p
            id={id}
            className={className}
            role="alert"
        >
            {message}
        </p>
    );
};
