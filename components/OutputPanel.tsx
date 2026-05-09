interface OutputPanelProps {
  ticket: string;
  onCopy: () => void;
  onReset: () => void;
  onSendToSlack: () => Promise<void>;
  slackLoading: boolean;
  slackSent: boolean;
}

export function OutputPanel({
  ticket,
  onCopy,
  onReset,
  onSendToSlack,
  slackLoading,
  slackSent,
}: OutputPanelProps) {
  return (
    <section className="rounded-lg border border-slate-300 p-6">
      <div className="mb-6">
        <h2 className="mb-1 text-lg font-semibold">Generated ticket</h2>
        <p className="text-sm text-slate-600">Copy-ready bug report</p>
      </div>

      {ticket ? (
        <>
          <div className="mb-6 max-h-96 overflow-auto rounded-lg border border-slate-200 p-4">
            <pre className="whitespace-pre-wrap font-mono text-sm leading-6 text-slate-800">
              {ticket}
            </pre>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              onClick={onCopy}
              className="flex-1 rounded-lg bg-teal-700 px-4 py-3 font-medium text-white transition hover:bg-teal-600"
            >
              Copy ticket
            </button>
            <button
              onClick={onSendToSlack}
              disabled={slackLoading || slackSent}
              className="flex-1 rounded-lg bg-slate-900 px-4 py-3 font-medium text-white transition hover:bg-slate-800 disabled:opacity-50"
            >
              {slackLoading
                ? "Sending..."
                : slackSent
                  ? "Sent to Slack ✅"
                  : "Send to Slack"}
            </button>
            <button
              onClick={onReset}
              className="rounded-lg border border-slate-200 px-4 py-3 font-medium text-slate-700 transition hover:bg-slate-50"
            >
              Reset
            </button>
          </div>
        </>
      ) : (
        <div className="rounded-lg border border-dashed border-slate-300 p-8 text-center">
          <p className="text-slate-600">
            Paste a screenshot to generate a ticket.
          </p>
        </div>
      )}
    </section>
  );
}