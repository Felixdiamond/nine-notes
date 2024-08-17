import { currentUser } from "@clerk/nextjs";
import NavBar from "./NavBar";

export default async function Layout({ children }: { children: React.ReactNode }) {
  const user = await currentUser();
  let infopassed: string = "Guest";
  
  if (user) {
    if (user.firstName) {
      infopassed = `${user.firstName} ${user.lastName || ''}`.trim();
    } else if (user.emailAddresses && user.emailAddresses.length > 0) {
      infopassed = user.emailAddresses[0].emailAddress;
    }
  }

  return (
    <>
      <NavBar user={infopassed} />
      <main className="m-auto max-w-7xl p-4">{children}</main>
    </>
  );
}