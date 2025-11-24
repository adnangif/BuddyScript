import React from 'react';

export interface SearchInputProps {
    placeholder?: string;
    value?: string;
    onChange?: (value: string) => void;
    onSubmit?: (value: string) => void;
    className?: string;
}

/**
 * SearchInput Atom
 * Search input field with icon
 */
export const SearchInput: React.FC<SearchInputProps> = ({
    placeholder = 'input search text',
    value,
    onChange,
    onSubmit,
    className = ''
}) => {
    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (onSubmit && value) {
            onSubmit(value);
        }
    };

    return (
        <form 
            className={`_header_form_grp ${className}`.trim()} 
            role="search"
            onSubmit={handleSubmit}
        >
            <svg
                className="_header_form_svg"
                xmlns="http://www.w3.org/2000/svg"
                width="17"
                height="17"
                fill="none"
                viewBox="0 0 17 17"
            >
                <circle cx="7" cy="7" r="6" stroke="#666" />
                <path stroke="#666" strokeLinecap="round" d="M16 16l-3-3" />
            </svg>
            <input
                className="form-control me-2 _inpt1"
                type="search"
                placeholder={placeholder}
                aria-label="Search"
                value={value}
                onChange={(e) => onChange?.(e.target.value)}
            />
        </form>
    );
};
