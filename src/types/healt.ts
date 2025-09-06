export type HealtOpts = {
  okThreshold?: number;
  failThreshold?: number;
  intervalDownMs?: number;
  intervalUpMs?: number;
  timeoutMs?: number;
  silent?: boolean;
  sustainedDownMs?: number;
  sustainedUpMs?: number;
  downBackoffFactor?: number;
  downBackoffMaxMs?: number;
  jitterPct?: number;
  offlineGraceMs?: number;
  focusRefetch?: boolean;
};

export type HealthData = { ok: boolean; _netErr?: boolean };

export type HealthResponse = { ok: boolean; timestamp: string };

export type HealtProps = {
  forceOpen?: boolean;
  isDown: boolean;
  isFetching: boolean;
  refetch: () => void;
};
