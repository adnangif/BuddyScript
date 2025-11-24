import React from 'react';

export interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
    required?: boolean;
    labelClassName?: string;
}

/**
 * Label Atom
 * Form label with optional required indicator
 */
export const Label: React.FC<LabelProps> = ({
    required = false,
    children,
    labelClassName = '_social_login_label _mar_b8',
    className = '',
    ...props
}) => {
    return (
        <label className={`${labelClassName} ${className}`} {...props}>
            {children}
            {required && <span className="text-danger ms-1">*</span>}
        </label>
    );
};
