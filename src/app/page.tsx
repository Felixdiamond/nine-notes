import Image from "next/image";
import logo from "@/assets/logo.png";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRightIcon } from "lucide-react";
import { redirect } from "next/navigation";

export default function Home() {
  return (
    <main className="flex h-screen flex-col items-center justify-center gap-5">
      <div className="flex items-center gap-4">
        <Image src={logo} alt="9ine notes logo" width={100} height={100} />
        <span className="text-4xl font-extrabold tracking-tight lg:text-5xl">
          9ine notes
        </span>
      </div>
      <p className="max-w-prose p-3 text-center">
        9ine notes is an AI-powered note-taking app that enhances productivity.
        It allows you to easily create and organize notes, with AI powered
        features.
      </p>
      <Button asChild>
        <Link href={"/auth/sign-in"} prefetch>
          Get Started&nbsp;
          <ArrowRightIcon />
        </Link>
      </Button>
      <div className="absolute bottom-2 flex h-auto w-full justify-center text-center text-xs">
        <span>
          Built with 💖 by{" "}
          <Link
            href="https://www.linkedin.com/in/felix-dawodu-ba2b08211"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500"
          >
            Felix
          </Link>
        </span>
      </div>
    </main>
  );
}