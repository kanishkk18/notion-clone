"use client";

import { signIn, useSession } from 'next-auth/react'
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/mode-toggle";
import { Spinner } from "@/components/spinner";
import { useScrollTop } from "@/hooks/use-scroll-top";
import { cn } from "@/lib/utils";

import { Logo } from "./logo";

export const Navbar = () => {
  const { data: session, status } = useSession()
  const scrolled = useScrollTop();

  return (
    <div
      className={cn(
        "z-50 bg-background dark:bg-[#1F1F1F] fixed top-0 flex items-center w-full p-6",
        scrolled && "border-b shadow-sm"
      )}
    >
      <Logo />

      <div className="md:ml-auto md:justify-end justify-between w-full flex items-center gap-x-2">
        {status === 'loading' && <Spinner />}

        {!session && status !== 'loading' && (
          <>
            <Button variant="ghost" size="sm" onClick={() => signIn()}>
              Log in
            </Button>

            <Button size="sm" onClick={() => signIn()}>
              Get Jotion free
            </Button>
          </>
        )}

        {session && status !== 'loading' && (
          <>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/documents">Enter Jotion</Link>
            </Button>

            <Button variant="ghost" size="sm" onClick={() => signIn()}>
              {session.user?.name}
            </Button>
          </>
        )}

        <ModeToggle />
      </div>
    </div>
  );
};