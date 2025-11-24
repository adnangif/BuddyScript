"use client";

import {
  ChangeEvent,
  FormEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import Navbar from "@/components/Navbar";
import { useCreatePost } from "@/hooks/useCreatePost";
import { FeedPost } from "@/hooks/types";
import { usePosts } from "@/hooks/usePosts";
import { useAuthStore } from "@/stores/auth-store";
import { uploadImage } from "@/lib/upload-image";
import { useIntersectionObserver } from "@/hooks/useIntersectionObserver";
import {
  Button,
  Textarea,
  PostCard,
  SuggestedPersonCard,
  FriendActivityCard,
  SidebarSection,
  LoadingSpinner,
} from "@/app/ui/atomic";

const dateFormatter = new Intl.DateTimeFormat("en", {
  dateStyle: "medium",
  timeStyle: "short",
});

const formatTimestamp = (isoString: string) =>
  dateFormatter.format(new Date(isoString));

const exploreLinks = [
  { label: "Learning", href: "#0", badge: "New" },
  { label: "Insights", href: "#0" },
  { label: "Find friends", href: "find-friends.html" },
  { label: "Bookmarks", href: "#0" },
  { label: "Group", href: "group.html" },
  { label: "Gaming", href: "#0", badge: "New" },
  { label: "Settings", href: "#0" },
  { label: "Save post", href: "#0" },
];

const suggestedPeople = [
  {
    id: "steve",
    name: "Steve Jobs",
    subtitle: "CEO of Apple",
    avatar: "/icons/people1.png",
  },
  {
    id: "ryan",
    name: "Ryan Roslansky",
    subtitle: "CEO of Linkedin",
    avatar: "/icons/people2.png",
  },
  {
    id: "dylan",
    name: "Dylan Field",
    subtitle: "CEO of Figma",
    avatar: "/icons/people3.png",
  },
];

const friendActivity = [
  {
    id: "friend-1",
    name: "Steve Jobs",
    subtitle: "CEO of Apple",
    avatar: "/icons/people1.png",
    meta: "5 minutes ago",
  },
  {
    id: "friend-2",
    name: "Ryan Roslansky",
    subtitle: "CEO of Linkedin",
    avatar: "/icons/people2.png",
    meta: "Online",
  },
  {
    id: "friend-3",
    name: "Dylan Field",
    subtitle: "CEO of Figma",
    avatar: "/icons/people3.png",
    meta: "Online",
  },
];

export default function FeedsPage() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const hasHydrated = useAuthStore((state) => state.hasHydrated);
  const [content, setContent] = useState("");
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isPublic, setIsPublic] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const {
    data,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
  } = usePosts(10);
  const { mutateAsync: createPost, isPending: isPublishing } = useCreatePost();

  useEffect(() => {
    if (hasHydrated && !user) {
      router.replace("/login");
    }
  }, [hasHydrated, router, user]);

  // Flatten all pages into a single array of posts
  const orderedPosts = useMemo<FeedPost[]>(() => {
    if (!data?.pages) {
      return [];
    }
    // Flatten all pages and extract posts
    return data.pages.flatMap((page) => page.posts);
  }, [data?.pages]);

  // Setup intersection observer for infinite scroll
  const loadMoreRef = useIntersectionObserver(
    () => {
      if (hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    },
    {
      enabled: hasNextPage && !isFetchingNextPage,
      rootMargin: "100px", // Start loading 100px before the element is visible
    }
  );

  if (!hasHydrated) {
    return (
      <main className="feed-page">
        <section className="feed-card">
          <h1>Global Feed</h1>
          <p>Loading your session…</p>
        </section>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="feed-page">
        <section className="feed-card">
          <h1>Global Feed</h1>
          <p>Checking your session and redirecting to login…</p>
        </section>
      </main>
    );
  }

  const handleContentChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    setContent(event.target.value);
  };

  const handleImageSelect = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    // Validate file size (max 32MB)
    const maxSize = 32 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error("Image size must be less than 32MB");
      return;
    }

    setSelectedImage(file);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = content.trim();

    if (!trimmed) {
      toast.error("Share something with your network first.");
      return;
    }

    try {
      let imageUrl: string | null = null;

      // Upload image first if selected
      if (selectedImage) {
        setIsUploadingImage(true);
        try {
          imageUrl = await uploadImage(selectedImage);
        } catch (error) {
          toast.error(
            error instanceof Error ? error.message : "Failed to upload image",
          );
          setIsUploadingImage(false);
          return;
        }
        setIsUploadingImage(false);
      }

      await createPost({ content: trimmed, imageUrl, isPublic });
      setContent("");
      setIsPublic(true);
      handleRemoveImage();
      toast.success("Post published!");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Unable to publish post.",
      );
    }
  };

  return (
    <main className="_layout _layout_main_wrapper">
      <div className="_layout_mode_swithing_btn">
        <button
          type="button"
          className="_layout_swithing_btn_link"
          aria-label="Toggle layout mode"
        >
          <div className="_layout_swithing_btn">
            <div className="_layout_swithing_btn_round" />
          </div>
          <div className="_layout_change_btn_ic1">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="11"
              height="16"
              fill="none"
              viewBox="0 0 11 16"
            >
              <path
                fill="#fff"
                d="M2.727 14.977l.04-.498-.04.498zm-1.72-.49l.489-.11-.489.11zM3.232 1.212L3.514.8l-.282.413zM9.792 8a6.5 6.5 0 00-6.5-6.5v-1a7.5 7.5 0 017.5 7.5h-1zm-6.5 6.5a6.5 6.5 0 006.5-6.5h1a7.5 7.5 0 01-7.5 7.5v-1zm-.525-.02c.173.013.348.02.525.02v1c-.204 0-.405-.008-.605-.024l.08-.997zm-.261-1.83A6.498 6.498 0 005.792 7h1a7.498 7.498 0 01-3.791 6.52l-.495-.87zM5.792 7a6.493 6.493 0 00-2.841-5.374L3.514.8A7.493 7.493 0 016.792 7h-1zm-3.105 8.476c-.528-.042-.985-.077-1.314-.155-.316-.075-.746-.242-.854-.726l.977-.217c-.028-.124-.145-.09.106-.03.237.056.6.086 1.165.131l-.08.997zm.314-1.956c-.622.354-1.045.596-1.31.792a.967.967 0 00-.204.185c-.01.013.027-.038.009-.12l-.977.218a.836.836 0 01.144-.666c.112-.162.27-.3.433-.42.324-.24.814-.519 1.41-.858L3 13.52zM3.292 1.5a.391.391 0 00.374-.285A.382.382 0 003.514.8l-.563.826A.618.618 0 012.702.95a.609.609 0 01.59-.45v1z"
              />
            </svg>
          </div>
          <div className="_layout_change_btn_ic2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle cx="12" cy="12" r="4.389" stroke="#fff" transform="rotate(-90 12 12)" />
              <path
                stroke="#fff"
                strokeLinecap="round"
                d="M3.444 12H1M23 12h-2.444M5.95 5.95L4.222 4.22M19.778 19.779L18.05 18.05M12 3.444V1M12 23v-2.445M18.05 5.95l1.728-1.729M4.222 19.779L5.95 18.05"
              />
            </svg>
          </div>
        </button>
      </div>
      <div className="_main_layout">
        <Navbar />

        <div className="container _custom_container">
          <div className="_layout_inner_wrap">
            <div className="row">
              <div className="col-xl-3 col-lg-3 col-md-12 col-sm-12">
                <aside className="_layout_left_sidebar_wrap">
                  <div className="_layout_left_sidebar_inner">
                    <div className="_left_inner_area_explore _padd_t24 _padd_b6 _padd_r24 _padd_l24 _b_radious6 _feed_inner_area">
                      <h4 className="_left_inner_area_explore_title _title5 _mar_b24">
                        Explore
                      </h4>
                      <ul className="_left_inner_area_explore_list">
                        {exploreLinks.map((link) => (
                          <li
                            key={link.label}
                            className="_left_inner_area_explore_item _explore_item"
                          >
                            <a href={link.href} className="_left_inner_area_explore_link">
                              {link.label}
                            </a>
                            {link.badge ? (
                              <span className="_left_inner_area_explore_link_txt">
                                {link.badge}
                              </span>
                            ) : null}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <SidebarSection
                    title="Suggested People"
                    actionLabel="See All"
                    actionHref="#0"
                  >
                    {suggestedPeople.map((person) => (
                      <SuggestedPersonCard
                        key={person.id}
                        id={person.id}
                        name={person.name}
                        subtitle={person.subtitle}
                        avatarSrc={person.avatar}
                        profileHref="profile.html"
                        onConnect={() => {
                          toast.success(`Connected with ${person.name}`);
                        }}
                      />
                    ))}
                  </SidebarSection>
                </aside>
              </div>

              <div className="col-xl-6 col-lg-6 col-md-12 col-sm-12">
                <section className="_layout_middle_wrap">
                  <div className="_feed_inner_text_area _b_radious6 _padd_b24 _padd_t24 _padd_r24 _padd_l24 _mar_b16">
                    <div className="_feed_inner_text_area_box">
                      <div className="_feed_inner_text_area_box_image">
                        <img src="/icons/txt_img.png" alt="Profile" className="_txt_img" />
                      </div>
                      <form
                        className="form-floating _feed_inner_text_area_box_form"
                        onSubmit={handleSubmit}
                      >
                        <Textarea
                          className="_textarea"
                          placeholder=" "
                          id="feed-post-textarea"
                          value={content}
                          onChange={handleContentChange}
                          maxLength={500}
                          disabled={isPublishing || isUploadingImage}
                        />
                        {content.trim() === "" && <label className="_feed_textarea_label" htmlFor="feed-post-textarea">
                          Write something ...
                        </label>
                        }

                        {/* Image Preview */}
                        {imagePreview && (
                          <div style={{ marginTop: "12px", position: "relative" }}>
                            <img
                              src={imagePreview}
                              alt="Preview"
                              style={{
                                maxWidth: "100%",
                                maxHeight: "300px",
                                borderRadius: "8px",
                                objectFit: "contain",
                              }}
                            />
                            <button
                              type="button"
                              onClick={handleRemoveImage}
                              disabled={isPublishing || isUploadingImage}
                              style={{
                                position: "absolute",
                                top: "8px",
                                right: "8px",
                                background: "rgba(0, 0, 0, 0.6)",
                                color: "white",
                                border: "none",
                                borderRadius: "50%",
                                width: "32px",
                                height: "32px",
                                cursor: "pointer",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: "20px",
                              }}
                            >
                              ×
                            </button>
                          </div>
                        )}

                        <div className="_feed_inner_text_area_btn" style={{ display: "flex", gap: "8px", alignItems: "center", justifyContent: "space-between" }}>
                          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                            {/* Image Upload Button */}
                            <input
                              ref={fileInputRef}
                              type="file"
                              accept="image/*"
                              onChange={handleImageSelect}
                              disabled={isPublishing || isUploadingImage}
                              style={{ display: "none" }}
                              id="image-upload-input"
                            />
                            <label
                              htmlFor="image-upload-input"
                              style={{
                                cursor: isPublishing || isUploadingImage ? "not-allowed" : "pointer",
                                opacity: isPublishing || isUploadingImage ? 0.5 : 1,
                                display: "flex",
                                alignItems: "center",
                                gap: "4px",
                                padding: "8px 12px",
                                background: "#f0f0f0",
                                borderRadius: "6px",
                                fontSize: "14px",
                              }}
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="16"
                                height="16"
                                fill="currentColor"
                                viewBox="0 0 16 16"
                              >
                                <path d="M6.002 5.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0z" />
                                <path d="M2.002 1a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V3a2 2 0 0 0-2-2h-12zm12 1a1 1 0 0 1 1 1v6.5l-3.777-1.947a.5.5 0 0 0-.577.093l-3.71 3.71-2.66-1.772a.5.5 0 0 0-.63.062L1.002 12V3a1 1 0 0 1 1-1h12z" />
                              </svg>
                              {selectedImage ? "Change" : "Image"}
                            </label>

                            {/* Privacy Toggle */}
                            <button
                              type="button"
                              onClick={() => setIsPublic(!isPublic)}
                              disabled={isPublishing || isUploadingImage}
                              style={{
                                cursor: isPublishing || isUploadingImage ? "not-allowed" : "pointer",
                                opacity: isPublishing || isUploadingImage ? 0.5 : 1,
                                display: "flex",
                                alignItems: "center",
                                gap: "4px",
                                padding: "8px 12px",
                                background: isPublic ? "#e8f5e9" : "#fff3e0",
                                border: "none",
                                borderRadius: "6px",
                                fontSize: "14px",
                                color: isPublic ? "#2e7d32" : "#e65100",
                                fontWeight: "500",
                              }}
                            >
                              <span style={{ fontSize: "16px" }}>
                                {isPublic ? "🌍" : "🔒"}
                              </span>
                              {isPublic ? "Public" : "Private"}
                            </button>
                          </div>

                          <Button
                            type="submit"
                            variant="primary"
                            disabled={isPublishing || isUploadingImage}
                            className="_feed_inner_text_area_btn_link"
                          >
                            <svg
                              className="_mar_img"
                              xmlns="http://www.w3.org/2000/svg"
                              width="14"
                              height="13"
                              fill="none"
                              viewBox="0 0 14 13"
                            >
                              <path
                                fill="#fff"
                                fillRule="evenodd"
                                d="M6.37 7.879l2.438 3.955a.335.335 0 00.34.162c.068-.01.23-.05.289-.247l3.049-10.297a.348.348 0 00-.09-.35.341.341 0 00-.34-.088L1.75 4.03a.34.34 0 00-.247.289.343.343 0 00.16.347L5.666 7.17 9.2 3.597a.5.5 0 01.712.703L6.37 7.88zM9.097 13c-.464 0-.89-.236-1.14-.641L5.372 8.165l-4.237-2.65a1.336 1.336 0 01-.622-1.331c.074-.536.441-.96.957-1.112L11.774.054a1.347 1.347 0 011.67 1.682l-3.05 10.296A1.332 1.332 0 019.098 13z"
                                clipRule="evenodd"
                              />
                            </svg>
                            <span>
                              {isUploadingImage
                                ? "Uploading..."
                                : isPublishing
                                  ? "Posting..."
                                  : "Post"}
                            </span>
                          </Button>
                        </div>
                      </form>
                    </div>
                  </div>

                  <div aria-live="polite">
                    {isLoading ? (
                      <article className="_feed_inner_timeline_post_area _b_radious6 _padd_b24 _padd_t24 _mar_b16">
                        <div className="_feed_inner_timeline_content _padd_r24 _padd_l24">
                          <p className="_feed_inner_timeline_post_title">Loading posts…</p>
                          <p className="_feed_inner_timeline_post_box_para">
                            Fetching the latest updates from your network.
                          </p>
                        </div>
                      </article>
                    ) : null}

                    {!isLoading && orderedPosts.length === 0 ? (
                      <article className="_feed_inner_timeline_post_area _b_radious6 _padd_b24 _padd_t24 _mar_b16">
                        <div className="_feed_inner_timeline_content _padd_r24 _padd_l24">
                          <p className="_feed_inner_timeline_post_title">
                            No updates yet
                          </p>
                          <p className="_feed_inner_timeline_post_box_para">
                            Break the ice with your first post!
                          </p>
                          <button
                            type="button"
                            className="_info_link"
                            onClick={() => refetch()}
                          >
                            Refresh feed
                          </button>
                        </div>
                      </article>
                    ) : null}

                    {orderedPosts.map((post) => (
                      <PostCard key={post.id} post={post} />
                    ))}

                    {/* Infinite scroll trigger */}
                    {hasNextPage && (
                      <div ref={loadMoreRef} style={{ minHeight: "20px" }}>
                        {isFetchingNextPage && <LoadingSpinner />}
                      </div>
                    )}

                    {/* End of feed indicator */}
                    {!hasNextPage && orderedPosts.length > 0 && (
                      <div className="_feed_inner_timeline_content _padd_r24 _padd_l24 _padd_t12 _padd_b12">
                        <p style={{ textAlign: "center", color: "#888", fontSize: "14px" }}>
                          You&apos;re all caught up! 🎉
                        </p>
                      </div>
                    )}
                  </div>
                </section>
              </div>

              <div className="col-xl-3 col-lg-3 col-md-12 col-sm-12">
                <aside className="_layout_right_sidebar_wrap">
                  <div className="_layout_right_sidebar_inner">
                    <div className="_right_inner_area_info _padd_t24 _padd_b24 _padd_r24 _padd_l24 _b_radious6 _feed_inner_area">
                      <div className="_right_inner_area_info_content _mar_b24">
                        <h4 className="_right_inner_area_info_content_title _title5">
                          You Might Like
                        </h4>
                        <span className="_right_inner_area_info_content_txt">
                          <a
                            className="_right_inner_area_info_content_txt_link"
                            href="#0"
                          >
                            See All
                          </a>
                        </span>
                      </div>
                      <hr className="_underline" />
                      {friendActivity.map((friend) => (
                        <FriendActivityCard
                          key={friend.id}
                          id={friend.id}
                          name={friend.name}
                          subtitle={friend.subtitle}
                          avatarSrc={friend.avatar}
                          meta={friend.meta}
                          profileHref="profile.html"
                        />
                      ))}
                    </div>
                  </div>
                </aside>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

