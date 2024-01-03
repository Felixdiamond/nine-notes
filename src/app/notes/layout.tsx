import { currentUser } from "@clerk/nextjs";
import NavBar from "./NavBar";

export default async function Layout({ children }: { children: React.ReactNode }) {
  const user = await currentUser();
  let infopassed: string = " ";
  if (user!.firstName == null) {
    infopassed = user?.emailAddresses[0].emailAddress!;
  } else {
    infopassed = user!.firstName! + " " + user!.lastName!;
  }
  return (
    <>
      <NavBar user={infopassed} />
      <main className="m-auto max-w-7xl p-4">{children}</main>
    </>
  );
}
