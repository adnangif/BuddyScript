import React, { ReactNode } from 'react';

export interface ProfileMenuItemProps {
    href: string;
    icon: ReactNode;
    label: string;
    onClick?: () => void;
    className?: string;
}

/**
 * ProfileMenuItem Molecule
 * Menu item in profile dropdown with icon and label
 */
export const ProfileMenuItem: React.FC<ProfileMenuItemProps> = ({
    href,
    icon,
    label,
    onClick,
    className = ''
}) => {
    return (
        <li className={`_nav_dropdown_list_item ${className}`.trim()}>
            <a 
                href={href} 
                className="_nav_dropdown_link"
                onClick={onClick}
            >
                <div className="_nav_drop_info">
                    <span>{icon}</span>
                    {label}
                </div>
                <button type="button" className="_nav_drop_btn_link">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="6"
                        height="10"
                        fill="none"
                        viewBox="0 0 6 10"
                    >
                        <path
                            fill="#112032"
                            d="M5 5l.354.354L5.707 5l-.353-.354L5 5zM1.354 9.354l4-4-.708-.708-4 4 .708.708zm4-4.708l-4-4-.708.708 4 4 .708-.708z"
                            opacity=".5"
                        />
                    </svg>
                </button>
            </a>
        </li>
    );
};
