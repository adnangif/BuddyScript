import React, { ReactNode } from 'react';
import { ProfileMenuItem, ProfileMenuItemProps } from '../molecules/ProfileMenuItem';

export interface ProfileDropdownProps {
    isOpen: boolean;
    onToggle: () => void;
    firstName: string;
    lastName: string;
    avatarSrc: string;
    profileHref?: string;
    menuItems: ProfileMenuItemProps[];
    className?: string;
}

/**
 * ProfileDropdown Organism
 * Complete profile dropdown with user info and menu items
 */
export const ProfileDropdown: React.FC<ProfileDropdownProps> = ({
    isOpen,
    onToggle,
    firstName,
    lastName,
    avatarSrc,
    profileHref = '/profile',
    menuItems,
    className = ''
}) => {
    const fullName = `${firstName} ${lastName}`;

    return (
        <div className={`_header_nav_profile ${className}`.trim()}>
            <div className="_header_nav_profile_image">
                <img
                    src={avatarSrc}
                    alt="Profile"
                    className="_nav_profile_img"
                />
            </div>
            <div className="_header_nav_dropdown">
                <button
                    id="_profile_drop_show_btn"
                    className="_header_nav_dropdown_btn _dropdown_toggle"
                    type="button"
                    aria-haspopup="true"
                    aria-expanded={isOpen}
                    onClick={onToggle}
                >
                    <span className="_header_nav_para">
                        {fullName}
                    </span>
                </button>
            </div>
            <div
                id="_prfoile_drop"
                className={`_nav_profile_dropdown _profile_dropdown ${isOpen ? 'show' : ''}`}
                role="menu"
                aria-label="Profile options"
            >
                <div className="_nav_profile_dropdown_info">
                    <div className="_nav_profile_dropdown_image">
                        <img
                            src={avatarSrc}
                            alt={fullName}
                            className="_nav_drop_img"
                        />
                    </div>
                    <div className="_nav_profile_dropdown_info_txt">
                        <h4 className="_nav_dropdown_title">
                            {fullName}
                        </h4>
                        <a href={profileHref} className="_nav_drop_profile">
                            View Profile
                        </a>
                    </div>
                </div>
                <hr />
                <ul className="_nav_dropdown_list">
                    {menuItems.map((item, index) => (
                        <ProfileMenuItem key={index} {...item} />
                    ))}
                </ul>
            </div>
        </div>
    );
};
