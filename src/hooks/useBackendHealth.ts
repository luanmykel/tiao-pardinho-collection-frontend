import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useRef, useState } from "react";
import { setProgressSuspended, fetchBackendHealth } from "@/api";
import type { HealtOpts, HealthData, HealthResponse } from "@/types";

export function useBackendHealth({
  okThreshold = 1,
  failThreshold = 2,
  intervalDownMs = 3000,
  intervalUpMs = 60000,
  sustainedDownMs = 10000,
  sustainedUpMs = 5000,
  downBackoffFactor = 1.6,
  downBackoffMaxMs = 60000,
  jitterPct = 0.15,
  offlineGraceMs = 10000,
  focusRefetch = false,
}: HealtOpts = {}) {
  const [down, setDown] = useState(false);
  const [netOffline, setNetOffline] = useState<boolean>(
    typeof navigator !== "undefined" ? !navigator.onLine : false,
  );

  const fails = useRef(0);
  const oks = useRef(0);

  const failSince = useRef<number | null>(null);
  const okSince = useRef<number | null>(null);
  const lastFlipAt = useRef<number>(Date.now());

  const downIntervalRef = useRef<number>(intervalDownMs);
  const offlineSince = useRef<number | null>(null);

  useEffect(() => {
    function onOnline() {
      setNetOffline(false);
      offlineSince.current = null;

      downIntervalRef.current = intervalDownMs;
    }

    function onOffline() {
      setNetOffline(true);
      offlineSince.current = Date.now();
    }

    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);
    return () => {
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
    };
  }, [intervalDownMs]);

  const q = useQuery<HealthData>({
    queryKey: ["health"],
    queryFn: async (): Promise<HealthData> => {
      try {
        const res: HealthResponse = await fetchBackendHealth();
        const okVal = (res as any)?.ok;
        const okTruthy = okVal === true || okVal === 1 || okVal === "true";
        return { ok: Boolean(okTruthy) };
      } catch {
        return { ok: false, _netErr: true };
      }
    },

    refetchInterval: (query) => {
      const data = query.state.data as HealthData | undefined;
      const isBad = down || !data?.ok || data?._netErr || netOffline;

      let base = isBad ? downIntervalRef.current : intervalUpMs;

      if (jitterPct > 0) {
        const r = Math.random() * 2 - 1;
        base = Math.max(250, Math.round(base * (1 + r * jitterPct)));
      }
      return base;
    },
    retry: false,
    refetchOnWindowFocus: focusRefetch ? "always" : false,
    refetchOnMount: true,
    refetchOnReconnect: true,
  });

  const isUnhealthy = useMemo(() => {
    if (q.isLoading || q.isFetching) return false;
    if (netOffline) return true;
    if (q.data?._netErr) return true;
    return q.data?.ok === false;
  }, [q.isLoading, q.isFetching, q.data, netOffline]);

  useEffect(() => {
    if (q.isLoading) return;

    const lastOk = q.data?.ok === true;
    const now = Date.now();

    const offlineBlocking =
      netOffline &&
      (offlineSince.current == null ||
        now - offlineSince.current < offlineGraceMs);

    if (lastOk && !netOffline) {
      oks.current += 1;
      fails.current = 0;
      if (okSince.current == null) okSince.current = now;
      failSince.current = null;

      downIntervalRef.current = intervalDownMs;

      if (
        down &&
        oks.current >= okThreshold &&
        okSince.current != null &&
        now - okSince.current >= sustainedUpMs
      ) {
        setDown(false);
        lastFlipAt.current = now;
      }
    } else {
      oks.current = 0;
      fails.current += 1;
      if (failSince.current == null) failSince.current = now;
      okSince.current = null;

      downIntervalRef.current = Math.min(
        Math.round(downIntervalRef.current * downBackoffFactor),
        downBackoffMaxMs,
      );

      const sustainedFail =
        failSince.current != null && now - failSince.current >= sustainedDownMs;
      if (
        !down &&
        !offlineBlocking &&
        fails.current >= failThreshold &&
        sustainedFail
      ) {
        setDown(true);
        lastFlipAt.current = now;
      }
    }
  }, [
    q.data,
    q.isError,
    q.isLoading,
    q.fetchStatus,
    down,
    failThreshold,
    okThreshold,
    sustainedDownMs,
    sustainedUpMs,
    netOffline,
    offlineGraceMs,
  ]);

  useEffect(() => {
    setProgressSuspended(down || netOffline);
  }, [down, netOffline]);

  return {
    isDown: down,
    isUnhealthy,
    isFetching: q.isFetching,
    refetch: q.refetch,
  };
}
