import Image from "next/image";
import logo from "@/assets/logo.png";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRightIcon } from "lucide-react";
import { auth } from "@clerk/nextjs";
import { redirect } from "next/navigation";

export default function Home() {
  const { userId } = auth();

  if (userId) redirect("/notes");

  return (
    <main className="flex h-screen flex-col items-center justify-center gap-5">
      <div className="flex items-center gap-4">
        <Image src={logo} alt="9ine notes logo" width={100} height={100} />
        <span className="text-4xl font-extrabold tracking-tight lg:text-5xl">
          9ine notes
        </span>
      </div>
      <p className="max-w-prose text-center">
        Nine Notes is an AI-powered note-taking app that enhances productivity.
        It allows you to easily create and organize notes, with AI powered
        features.
      </p>
      <Button asChild>
        <Link href={"/notes"}>
          Get Started&nbsp;
          <ArrowRightIcon />
        </Link>
      </Button>
    </main>
  );
}
