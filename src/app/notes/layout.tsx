"use client";
import NavBar from "./NavBar";
import { Suspense, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";

// Inline SVG loader component
function Loader({ isDark = false }: { isDark?: boolean }) {
  const color = isDark ? "#616161" : "#9CA3AF";
  return (
    <svg
      version="1.1"
      id="L9"
      xmlns="http://www.w3.org/2000/svg"
      xmlnsXlink="http://www.w3.org/1999/xlink"
      x="0px"
      y="0px"
      viewBox="0 0 100 100"
      enableBackground="new 0 0 0 0"
      xmlSpace="preserve"
    >
      <rect x="20" y="50" width="4" height="10" fill={color}>
        <animateTransform
          attributeType="xml"
          attributeName="transform"
          type="translate"
          values="0 0; 0 20; 0 0"
          begin="0"
          dur="0.6s"
          repeatCount="indefinite"
        />
      </rect>
      <rect x="30" y="50" width="4" height="10" fill={color}>
        <animateTransform
          attributeType="xml"
          attributeName="transform"
          type="translate"
          values="0 0; 0 20; 0 0"
          begin="0.2s"
          dur="0.6s"
          repeatCount="indefinite"
        />
      </rect>
      <rect x="40" y="50" width="4" height="10" fill={color}>
        <animateTransform
          attributeType="xml"
          attributeName="transform"
          type="translate"
          values="0 0; 0 20; 0 0"
          begin="0.4s"
          dur="0.6s"
          repeatCount="indefinite"
        />
      </rect>
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
