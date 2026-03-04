export function createProgressSender(sendFn, waitMs = 5000) {
  let timeoutId = null;
  let latestPayload = null;

  return {
    push(payload) {
      latestPayload = payload;
      if (timeoutId) return;
      timeoutId = setTimeout(async () => {
        const pending = latestPayload;
        latestPayload = null;
        timeoutId = null;
        try {
          await sendFn(pending);
        } catch (_error) {
        }
      }, waitMs);
    },
    async flush() {
      if (!latestPayload) return;
      const pending = latestPayload;
      latestPayload = null;
      if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }
      await sendFn(pending);
    }
  };
}