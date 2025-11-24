import React from 'react';

export interface FriendActivityCardProps {
    id: string;
    name: string;
    subtitle: string;
    avatarSrc: string;
    meta: string;
    profileHref?: string;
    className?: string;
}

/**
 * FriendActivityCard Molecule
 * Card component for displaying friend activity with status
 */
export const FriendActivityCard: React.FC<FriendActivityCardProps> = ({
    name,
    subtitle,
    avatarSrc,
    meta,
    profileHref = '#',
    className = ''
}) => {
    return (
        <div className={`_feed_right_inner_area_card_ppl ${className}`.trim()}>
            <div className="_feed_right_inner_area_card_ppl_box">
                <div className="_feed_right_inner_area_card_ppl_image">
                    <a href={profileHref}>
                        <img
                            src={avatarSrc}
                            alt={name}
                            className="_box_ppl_img"
                        />
                    </a>
                </div>
                <div className="_feed_right_inner_area_card_ppl_txt">
                    <a href={profileHref}>
                        <h4 className="_feed_right_inner_area_card_ppl_title">
                            {name}
                        </h4>
                    </a>
                    <p className="_feed_right_inner_area_card_ppl_para">
                        {subtitle}
                    </p>
                </div>
            </div>
            <div className="_feed_right_inner_area_card_ppl_side">
                <span>{meta}</span>
            </div>
        </div>
    );
};
