import Image from "next/image";
import Link from "next/link";

import { RegisterForm } from "@/components/auth/RegisterForm";

export default function RegisterPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#050B1D] text-white">
      <div
        className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(33,53,109,0.8),#040717_68%)]"
        aria-hidden
      />
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="absolute -left-20 top-16 hidden lg:block">
          <div className="relative h-72 w-72">
            <Image
              src="/icons/shape1.svg"
              alt=""
              fill
              sizes="288px"
              className="opacity-90"
              priority
            />
          </div>
        </div>
        <div className="absolute right-[-40px] top-10 hidden lg:block">
          <div className="relative h-64 w-64">
            <Image
              src="/icons/shape2.svg"
              alt=""
              fill
              sizes="256px"
              className="opacity-70"
              priority
            />
          </div>
        </div>
        <div className="absolute bottom-[-40px] right-0 hidden lg:block">
          <div className="relative h-72 w-72">
            <Image
              src="/icons/shape3.svg"
              alt=""
              fill
              sizes="288px"
              className="opacity-70"
              priority
            />
          </div>
        </div>
        <div className="absolute inset-0 opacity-60 blur-[180px]">
          <div className="absolute left-10 top-32 h-48 w-48 rounded-full bg-[#FF7A45]/40" />
          <div className="absolute right-16 top-64 h-56 w-56 rounded-full bg-[#9747FF]/30" />
          <div className="absolute bottom-10 left-1/3 h-40 w-40 rounded-full bg-[#34D399]/20" />
        </div>
      </div>
      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-12 px-4 py-12 lg:flex-row lg:items-center lg:px-8 xl:gap-16">
        <section className="flex-1 space-y-8">
          <Link
            href="/"
            className="inline-flex items-center gap-3 rounded-full border border-white/15 bg-white/5 px-5 py-2 text-xs font-semibold uppercase tracking-[0.4em] text-white/70 transition hover:border-white/40"
          >
            <Image
              src="/icons/logo.svg"
              alt="BuddyScript"
              width={120}
              height={32}
              priority
            />
            Home
          </Link>
          <div className="space-y-4">
            <p className="text-sm font-semibold uppercase tracking-[0.6em] text-[#FFC680]">
              Get started now
            </p>
            <h1 className="text-4xl font-bold leading-tight text-white md:text-5xl">
              Create your BuddyScript account and join the conversation.
            </h1>
            <p className="text-base text-white/70 md:text-lg">
              Inspired by our design system, this experience blends glowing
              gradients, floating shapes, and a focused form so you can start
              sharing with your favorite people right away.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-[0_20px_60px_rgba(8,15,40,0.45)]">
              <p className="text-xs uppercase tracking-[0.4em] text-white/60">
                Privacy-first
              </p>
              <p className="mt-3 text-2xl font-semibold text-white">Secure</p>
              <p className="text-sm text-white/60">
                Verification, encrypted sessions, and gentle onboarding.
              </p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-[0_20px_60px_rgba(8,15,40,0.45)]">
              <p className="text-xs uppercase tracking-[0.4em] text-white/60">
                Community vibes
              </p>
              <p className="mt-3 text-2xl font-semibold text-white">Connected</p>
              <p className="text-sm text-white/60">
                Stay close to friends, react in real time, and relive memories.
              </p>
            </div>
          </div>
          <div className="relative mt-2">
            <div className="absolute inset-0 rounded-[36px] bg-gradient-to-r from-[#FF8A4F]/40 via-[#FF5F6D]/30 to-[#7C3AED]/30 blur-3xl" />
            <div className="relative rounded-[36px] border border-white/10 bg-white/5 p-6 shadow-[0_40px_120px_rgba(5,10,30,0.75)] backdrop-blur-xl">
              <div className="relative aspect-[4/3] w-full">
                <Image
                  src="/icons/registration.png"
                  alt="Community preview"
                  fill
                  sizes="(min-width: 1024px) 520px, 100vw"
                  className="object-contain drop-shadow-[0_25px_70px_rgba(4,8,20,0.8)]"
                  priority
                />
              </div>
            </div>
          </div>
        </section>
        <section className="w-full max-w-xl">
          <RegisterForm />
        </section>
      </div>
    </main>
  );
}

