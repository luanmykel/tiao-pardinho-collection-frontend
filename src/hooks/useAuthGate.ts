import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getToken, onAuthChange } from "@/api";

export function useAuthGate(
  mode: "require" | "redirectIfAuthed" | "track" = "track",
) {
  const navigate = useNavigate();
  const [authed, setAuthed] = useState<boolean>(!!getToken());

  useEffect(() => {
    if (mode === "require" && !getToken()) {
      navigate("/login", { replace: true });
    } else if (mode === "redirectIfAuthed" && getToken()) {
      navigate("/admin", { replace: true });
    }

    const off = onAuthChange((t) => {
      const isAuthed = !!t;
      setAuthed(isAuthed);
      if (mode === "require" && !isAuthed) {
        navigate("/login", { replace: true });
      } else if (mode === "redirectIfAuthed" && isAuthed) {
        navigate("/admin", { replace: true });
      }
    });

    return () => {
      off?.();
    };
  }, [mode, navigate]);

  return authed;
}
