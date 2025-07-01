import { useEffect, useState } from "react";

type Metrics = {
  total: number;
  success: number;
  failed: number;
};

export default function useWebSocket(url: string) {
  const [metrics, setMetrics] = useState<Metrics>({
    total: 0,
    success: 0,
    failed: 0,
  });

  useEffect(() => {
    const socket = new WebSocket(url);

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setMetrics(data);
    };

    return () => {
      socket.close();
    };
  }, [url]);

  return metrics;
}
