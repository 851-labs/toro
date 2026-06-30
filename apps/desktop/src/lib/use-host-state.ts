import { useQuery } from "@tanstack/react-query";
import { applyHostEvent, emptyToroState, type HostEvent, type ToroState } from "@toro/domain";
import { useEffect, useMemo, useState } from "react";
import { hostClient } from "./host-client";

export function useHostState() {
  const [state, setState] = useState<ToroState>(emptyToroState);
  const [streamStatus, setStreamStatus] = useState<"connecting" | "connected" | "disconnected">(
    "connecting",
  );

  const query = useQuery({
    queryFn: () => hostClient.getState(),
    queryKey: ["host-state"],
    retry: 1,
  });

  useEffect(() => {
    if (query.data) {
      setState(query.data);
    }
  }, [query.data]);

  useEffect(() => {
    const source = hostClient.events(
      (event: HostEvent) => {
        setStreamStatus("connected");
        setState((current) => applyHostEvent(current, event));
      },
      () => setStreamStatus("disconnected"),
    );
    source.onopen = () => setStreamStatus("connected");
    return () => source.close();
  }, []);

  useEffect(() => {
    if (streamStatus !== "disconnected") {
      return;
    }
    const interval = window.setInterval(() => {
      void query.refetch();
    }, 750);
    return () => window.clearInterval(interval);
  }, [query, streamStatus]);

  return useMemo(
    () => ({
      error: query.error instanceof Error ? query.error.message : null,
      isLoading: query.isLoading,
      state,
      streamStatus,
    }),
    [query.error, query.isLoading, state, streamStatus],
  );
}
