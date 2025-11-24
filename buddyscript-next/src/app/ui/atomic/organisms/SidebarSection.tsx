import React, { ReactNode } from 'react';

export interface SidebarSectionProps {
    title: string;
    actionLabel?: string;
    actionHref?: string;
    onAction?: () => void;
    showDivider?: boolean;
    children: ReactNode;
    className?: string;
}

/**
 * SidebarSection Organism
 * Reusable sidebar section with title, optional action link, and content
 */
export const SidebarSection: React.FC<SidebarSectionProps> = ({
    title,
    actionLabel,
    actionHref = '#0',
    onAction,
    showDivider = false,
    children,
    className = ''
}) => {
    return (
        <div className={`_layout_left_sidebar_inner ${className}`.trim()}>
            <div className="_left_inner_area_suggest _padd_t24 _padd_b6 _padd_r24 _padd_l24 _b_radious6 _feed_inner_area">
                <div className="_left_inner_area_suggest_content _mar_b24">
                    <h4 className="_left_inner_area_suggest_content_title _title5">
                        {title}
                    </h4>
                    {actionLabel && (
                        <span className="_left_inner_area_suggest_content_txt">
                            <a
                                className="_left_inner_area_suggest_content_txt_link"
                                href={actionHref}
                                onClick={(e) => {
                                    if (onAction) {
                                        e.preventDefault();
                                        onAction();
                                    }
                                }}
                            >
                                {actionLabel}
                            </a>
                        </span>
                    )}
                </div>
                {showDivider && <hr className="_underline" />}
                {children}
            </div>
        </div>
    );
};
