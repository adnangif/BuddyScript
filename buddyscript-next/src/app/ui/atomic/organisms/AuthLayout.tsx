import React from 'react';
import Link from 'next/link';

export interface AuthLayoutProps {
    children: React.ReactNode;
    title: string;
    subtitle: string;
    imageUrl: string;
    imageDarkUrl?: string;
    imageAlt: string;
    logoUrl?: string;
    showGoogleSignIn?: boolean;
    onGoogleSignIn?: () => void;
    isGoogleLoading?: boolean;
    wrapperClassName?: string;
    imagePosition?: 'left' | 'right';
}

/**
 * AuthLayout Organism
 * Provides consistent layout for authentication pages (login, register, etc.)
 * Includes decorative shapes, branding, and optional Google sign-in
 */
export const AuthLayout: React.FC<AuthLayoutProps> = ({
    children,
    title,
    subtitle,
    imageUrl,
    imageDarkUrl,
    imageAlt,
    logoUrl = '/icons/logo.svg',
    showGoogleSignIn = true,
    onGoogleSignIn,
    isGoogleLoading = false,
    wrapperClassName = '_social_login_wrapper',
    imagePosition = 'left'
}) => {
    const imageColumn = (
        <div className="col-xl-8 col-lg-8 col-md-12 col-sm-12">
            <div className={imagePosition === 'left' ? '_social_login_left' : '_social_registration_right'}>
                <div className={imagePosition === 'left' ? '_social_login_left_image' : '_social_registration_right_image'}>
                    <img
                        src={imageUrl}
                        alt={imageAlt}
                        className={imagePosition === 'left' ? '_left_img' : ''}
                    />
                </div>
                {imageDarkUrl && (
                    <div className="_social_registration_right_image_dark">
                        <img src={imageDarkUrl} alt={imageAlt} />
                    </div>
                )}
            </div>
        </div>
    );

    const contentColumn = (
        <div className="col-xl-4 col-lg-4 col-md-12 col-sm-12">
            <div className={imagePosition === 'left' ? '_social_login_content' : '_social_registration_content'}>
                <div className={imagePosition === 'left' ? '_social_login_left_logo _mar_b28' : '_social_registration_right_logo _mar_b28'}>
                    <img
                        src={logoUrl}
                        alt="BuddyScript"
                        className={imagePosition === 'left' ? '_left_logo' : '_right_logo'}
                    />
                </div>
                <p className={imagePosition === 'left' ? '_social_login_content_para _mar_b8' : '_social_registration_content_para _mar_b8'}>
                    {subtitle}
                </p>
                <h4 className={imagePosition === 'left' ? '_social_login_content_title _titl4 _mar_b50' : '_social_registration_content_title _titl4 _mar_b50'}>
                    {title}
                </h4>

                {showGoogleSignIn && (
                    <>
                        <button
                            type="button"
                            className={imagePosition === 'left' ? '_social_login_content_btn _mar_b40' : '_social_registration_content_btn _mar_b40'}
                            onClick={onGoogleSignIn}
                            disabled={isGoogleLoading}
                        >
                            <img
                                src="/icons/google.svg"
                                alt="Google"
                                className="_google_img"
                            />
                            <span>{imagePosition === 'left' ? 'Or sign-in with google' : 'Register with google'}</span>
                        </button>
                        <div className={imagePosition === 'left' ? '_social_login_content_bottom_txt _mar_b40' : '_social_registration_content_bottom_txt _mar_b40'}>
                            <span>Or</span>
                        </div>
                    </>
                )}

                {children}
            </div>
        </div>
    );

    return (
        <main className={`${wrapperClassName} _layout_main_wrapper`}>
            {/* Decorative shapes */}
            <div className="_shape_one" aria-hidden="true">
                <img src="/icons/shape1.svg" alt="" className="_shape_img" />
                <img src="/icons/dark_shape.svg" alt="" className="_dark_shape" />
            </div>
            <div className="_shape_two" aria-hidden="true">
                <img src="/icons/shape2.svg" alt="" className="_shape_img" />
                <img
                    src="/icons/dark_shape1.svg"
                    alt=""
                    className="_dark_shape _dark_shape_opacity"
                />
            </div>
            <div className="_shape_three" aria-hidden="true">
                <img src="/icons/shape3.svg" alt="" className="_shape_img" />
                <img
                    src="/icons/dark_shape2.svg"
                    alt=""
                    className="_dark_shape _dark_shape_opacity"
                />
            </div>

            <section className={imagePosition === 'left' ? '_social_login_wrap' : '_social_registration_wrap'}>
                <div className="container">
                    <div className="row align-items-center">
                        {imagePosition === 'left' ? (
                            <>
                                {imageColumn}
                                {contentColumn}
                            </>
                        ) : (
                            <>
                                {imageColumn}
                                {contentColumn}
                            </>
                        )}
                    </div>
                </div>
            </section>
        </main>
    );
};
