"use client";
import NavBar from "./NavBar";
import { Suspense, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";

// Inline SVG loader component
function Loader({ isDark = false }: { isDark?: boolean }) {
  const color = isDark ? "#616161" : "#9CA3AF";
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" className="w-6 h-6">
      <circle
        fill={color}
        stroke={color}
        stroke-width="15"
        r="15"
        cx="40"
        cy="65"
      >
        <animate
          attributeName="cy"
          calcMode="spline"
          dur="2"
          values="65;135;65;"
          keySplines=".5 0 .5 1;.5 0 .5 1"
          repeatCount="indefinite"
          begin="-.4"
        ></animate>
      </circle>
      <circle
        fill={color}
        stroke={color}
        stroke-width="15"
        r="15"
        cx="100"
        cy="65"
      >
        <animate
          attributeName="cy"
          calcMode="spline"
          dur="2"
          values="65;135;65;"
          keySplines=".5 0 .5 1;.5 0 .5 1"
          repeatCount="indefinite"
          begin="-.2"
        ></animate>
      </circle>
      <circle
        fill={color}
        stroke={color}
        stroke-width="15"
        r="15"
        cx="160"
        cy="65"
      >
        <animate
          attributeName="cy"
          calcMode="spline"
          dur="2"
          values="65;135;65;"
          keySplines=".5 0 .5 1;.5 0 .5 1"
          repeatCount="indefinite"
          begin="0"
        ></animate>
      </circle>
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
  const { user, isLoading } = useAuth();
  return <NavBar user={user} />;
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
