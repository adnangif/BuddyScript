import Link from "next/link";

export default function Home() {
  return (
    <main className="placeholder-page">
      <div className="placeholder-page__card">
        <h1 className="placeholder-page__title">BuddyScript</h1>
        <p className="placeholder-page__body">
          The new BuddyScript experience is under construction. Start by
          creating an account with our refreshed registration flow.
        </p>
        <div className="placeholder-page__actions">
          <Link className="register-form__submit" href="/register">
            Create account
          </Link>
          <Link className="register-form__link" href="/login">
            Go to login
          </Link>
        </div>
      </div>
    </main>
  );
}
