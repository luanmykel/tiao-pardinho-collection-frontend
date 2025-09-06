import React, { useEffect, useState } from "react";
import NProgress from "nprogress";

import "@mantine/core/styles.css";
import "@mantine/notifications/styles.css";
import "@mantine/carousel/styles.css";
import "nprogress/nprogress.css";
import "./index.css";

import { MantineProvider } from "@mantine/core";
import { Notifications } from "@mantine/notifications";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
} from "react-router-dom";

import {
  Home,
  Login,
  AdminLayout,
  AdminSongs,
  AdminUsers,
  AdminProfile,
} from "@/pages";
import {
  YoutubeViewerProvider,
  BackendHealthOverlay,
  ThemeToggle,
} from "@/components";
import { useBackendHealth } from "@/hooks";
import { getToken, onAuthChange } from "@/api";

NProgress.configure({ showSpinner: true });

const showOverlay = () => {
  if (!document.getElementById("nprogress-overlay")) {
    const el = document.createElement("div");
    el.id = "nprogress-overlay";
    document.body.appendChild(el);
  }
};
const hideOverlay = () => {
  const el = document.getElementById("nprogress-overlay");
  if (el) el.remove();
};
let npDepth = 0;
const _start = NProgress.start.bind(NProgress);
const _done = NProgress.done.bind(NProgress);

NProgress.start = () => {
  if (++npDepth === 1) {
    showOverlay();
    _start();
  }
  return NProgress;
};
NProgress.done = () => {
  npDepth = Math.max(0, npDepth - 1);
  if (npDepth === 0) {
    hideOverlay();
    _done(true);
  }
  return NProgress;
};

const queryClient = new QueryClient();

function RequireAuth({ children }: { children: React.ReactNode }) {
  const [authed, setAuthed] = useState<boolean | null>(null);

  useEffect(() => {
    setAuthed(!!getToken());
    const off = onAuthChange((t) => {
      setAuthed(!!t);
    });
    return () => {
      off();
    };
  }, []);

  if (authed === null) return null;
  return authed ? <>{children}</> : <Navigate to="/login" replace />;
}

const router = createBrowserRouter([
  { path: "/", element: <Home /> },
  { path: "/login", element: <Login /> },
  {
    path: "/admin",
    element: (
      <RequireAuth>
        <AdminLayout />
      </RequireAuth>
    ),
    children: [
      { index: true, element: <AdminSongs /> },
      { path: "users", element: <AdminUsers /> },
      { path: "profile", element: <AdminProfile /> },
    ],
  },
  { path: "*", element: <Home /> },
]);

function RootWithHealthGate() {
  const health = useBackendHealth({
    okThreshold: 1,
    failThreshold: 2,
    intervalDownMs: 3000,
    intervalUpMs: 60000,
  });

  const [firstCheckDone, setFirstCheckDone] = useState(false);
  useEffect(() => {
    if (!health.isFetching) setFirstCheckDone(true);
  }, [health.isFetching]);

  const showMaintenance = firstCheckDone && health.isDown;

  return (
    <>
      <RouterProvider router={router} />
      <BackendHealthOverlay
        forceOpen={false}
        isDown={showMaintenance}
        isFetching={health.isFetching}
        refetch={health.refetch}
      />
      <ThemeToggle />
    </>
  );
}

export default function App() {
  const initialScheme =
    (localStorage.getItem("color-scheme") as "light" | "dark") ?? "light";

  return (
    <MantineProvider
      defaultColorScheme={initialScheme}
      theme={{
        fontFamily:
          "Inter, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif",
        headings: { fontWeight: "800" },
        defaultRadius: "lg",
      }}
    >
      <Notifications position="top-right" zIndex={11000} />
      <QueryClientProvider client={queryClient}>
        <YoutubeViewerProvider>
          <RootWithHealthGate />
        </YoutubeViewerProvider>
      </QueryClientProvider>
    </MantineProvider>
  );
}
