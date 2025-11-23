"use client";

import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";

import { useAuthStore } from "@/stores/auth-store";

type FeedPost = {
  id: string;
  authorName: string;
  authorHandle: string;
  content: string;
  createdAt: string;
};

const MOCK_POSTS: FeedPost[] = [
  {
    id: "post-01",
    authorName: "Amelia Watts",
    authorHandle: "amelia",
    content:
      "Landed a first client for my studio. Documenting every step so others can replicate it!",
    createdAt: "2025-11-23T08:40:00.000Z",
  },
  {
    id: "post-02",
    authorName: "Noah Patel",
    authorHandle: "noah.codes",
    content:
      "Migrated our cron jobs to a single queue worker. Latency dropped 45% overnight.",
    createdAt: "2025-11-22T19:10:00.000Z",
  },
  {
    id: "post-03",
    authorName: "Lena Cho",
    authorHandle: "lenacho",
    content:
      "Does anyone have a solid checklist for accessibility regression testing? Sharing mine soon.",
    createdAt: "2025-11-23T11:05:00.000Z",
  },
  {
    id: "post-04",
    authorName: "Marco Esquivel",
    authorHandle: "maker-marco",
    content:
      "Sunday build log: shipping keyboard shortcuts across the dashboard. Beta testers welcome!",
    createdAt: "2025-11-21T16:00:00.000Z",
  },
  {
    id: "post-05",
    authorName: "Priya Narayanan",
    authorHandle: "priya.designs",
    content:
      "Put together a Figma kit with real-world data states. DM if you want the preview link.",
    createdAt: "2025-11-22T05:55:00.000Z",
  },
];

const dateFormatter = new Intl.DateTimeFormat("en", {
  dateStyle: "medium",
  timeStyle: "short",
});

const formatTimestamp = (isoString: string) =>
  dateFormatter.format(new Date(isoString));

export default function FeedsPage() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const hasHydrated = useAuthStore((state) => state.hasHydrated);

  useEffect(() => {
    if (hasHydrated && !user) {
      router.replace("/login");
    }
  }, [hasHydrated, router, user]);

  const orderedPosts = useMemo<FeedPost[]>(() => {
    return [...MOCK_POSTS].sort(
      (postA, postB) =>
        new Date(postB.createdAt).getTime() -
        new Date(postA.createdAt).getTime(),
    );
  }, []);

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

  return (
    <main className="feed-page">
      <header className="feed-card feed-header">
        <div>
          <p className="feed-user-label">Signed in as</p>
          <p className="feed-user-email">{user.email}</p>
        </div>
        <p className="feed-description">
          Everyone can read every update. Posts are ordered from newest to oldest.
        </p>
      </header>

      <section className="feed-list" aria-live="polite">
        {orderedPosts.map((post) => (
          <article key={post.id} className="feed-card">
            <div className="feed-card-meta">
              <div>
                <p className="feed-card-author">{post.authorName}</p>
                <span className="feed-card-handle">@{post.authorHandle}</span>
              </div>
              <time dateTime={post.createdAt}>{formatTimestamp(post.createdAt)}</time>
            </div>
            <p>{post.content}</p>
          </article>
        ))}
      </section>
    </main>
  );
}

