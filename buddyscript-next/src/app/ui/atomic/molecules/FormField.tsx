import React, { ChangeEvent } from 'react';
import { Label } from '../atoms/Label';
import { Input } from '../atoms/Input';
import { ErrorMessage } from '../atoms/ErrorMessage';

export interface FormFieldProps {
    label: string;
    name: string;
    type?: 'text' | 'email' | 'password' | 'number' | 'date' | 'tel' | 'url';
    value: string;
    onChange: (event: ChangeEvent<HTMLInputElement>) => void;
    error?: string;
    required?: boolean;
    placeholder?: string;
    autoComplete?: string;
    disabled?: boolean;
    containerClassName?: string;
    labelClassName?: string;
    inputClassName?: string;
    errorClassName?: string;
}

/**
 * FormField Molecule
 * Complete form field with Label + Input + ErrorMessage
 * Handles all the boilerplate for a standard form input
 */
export const FormField: React.FC<FormFieldProps> = ({
    label,
    name,
    type = 'text',
    value,
    onChange,
    error,
    required = false,
    placeholder,
    autoComplete,
    disabled = false,
    containerClassName = '_social_login_form_input _mar_b14',
    labelClassName,
    inputClassName,
    errorClassName
}) => {
    const inputId = `form-field-${name}`;
    const errorId = error ? `${inputId}-error` : undefined;

    return (
        <div className={containerClassName}>
            <Label
                htmlFor={inputId}
                required={required}
                labelClassName={labelClassName}
            >
                {label}
            </Label>
            <Input
                id={inputId}
                name={name}
                type={type}
                value={value}
                onChange={onChange}
                error={Boolean(error)}
                placeholder={placeholder}
                autoComplete={autoComplete}
                disabled={disabled}
                required={required}
                aria-invalid={Boolean(error)}
                aria-describedby={errorId}
                inputClassName={inputClassName}
            />
            <ErrorMessage
                id={errorId}
                message={error}
                className={errorClassName}
            />
        </div>
    );
};
