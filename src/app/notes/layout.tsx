import { currentUser } from "@clerk/nextjs";
import NavBar from "./NavBar";
import { Suspense } from "react";

// Inline SVG loader component
function Loader({ isDark = false }: { isDark?: boolean }) {
  const color = isDark ? "#616161" : "#9CA3AF";
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid">
      <g>
        <circle fill={color} r="4" cy="50">
          <animate attributeName="cx" repeatCount="indefinite" dur="1s" keyTimes="0;1" values="95;35" begin="-0.67s"/>
          <animate attributeName="fill-opacity" repeatCount="indefinite" dur="1s" keyTimes="0;0.2;1" values="0;1;1" begin="-0.67s"/>
        </circle>
        <circle fill={color} r="4" cy="50">
          <animate attributeName="cx" repeatCount="indefinite" dur="1s" keyTimes="0;1" values="95;35" begin="-0.33s"/>
          <animate attributeName="fill-opacity" repeatCount="indefinite" dur="1s" keyTimes="0;0.2;1" values="0;1;1" begin="-0.33s"/>
        </circle>
        <circle fill={color} r="4" cy="50">
          <animate attributeName="cx" repeatCount="indefinite" dur="1s" keyTimes="0;1" values="95;35" begin="0s"/>
          <animate attributeName="fill-opacity" repeatCount="indefinite" dur="1s" keyTimes="0;0.2;1" values="0;1;1" begin="0s"/>
        </circle>
      </g>
      <g transform="translate(-15 0)">
        <path transform="rotate(90 50 50)" fill={color} d="M50 50L20 50A30 30 0 0 0 80 50Z"/>
        <path fill={color} d="M50 50L20 50A30 30 0 0 0 80 50Z">
          <animateTransform attributeName="transform" type="rotate" repeatCount="indefinite" dur="1s" keyTimes="0;0.5;1" values="0 50 50;45 50 50;0 50 50"/>
        </path>
        <path fill={color} d="M50 50L20 50A30 30 0 0 1 80 50Z">
          <animateTransform attributeName="transform" type="rotate" repeatCount="indefinite" dur="1s" keyTimes="0;0.5;1" values="0 50 50;-45 50 50;0 50 50"/>
        </path>
      </g>
    </svg>
  );
}

// Loading component
function Loading() {
  return (
    <div className="flex items-center justify-center">
      <Loader />
    </div>
  );
}

// Async component to fetch user data
async function UserData() {
  let infopassed: string = "Guest";
  try {
    const user = await currentUser();
    if (user) {
      if (user.firstName) {
        infopassed = `${user.firstName} ${user.lastName || ""}`.trim();
      } else if (user.emailAddresses && user.emailAddresses.length > 0) {
        infopassed = user.emailAddresses[0].emailAddress;
      }
    }
  } catch (error) {
    console.error("Error fetching user:", error);
  }
  return <NavBar user={infopassed} />;
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Suspense fallback={<Loading />}>
        <UserData />
      </Suspense>
      <main className="m-auto max-w-7xl p-4">{children}</main>
    </>
  );
}