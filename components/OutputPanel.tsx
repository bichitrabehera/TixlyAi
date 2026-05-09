interface OutputPanelProps {
  ticket: string;
  onCopy: () => void;
  onReset: () => void;
  onSendToSlack: () => Promise<void>;
  slackLoading: boolean;
  slackSent: boolean;
  slackConnected: boolean;
  disabled: boolean;
}

export function OutputPanel({
  ticket,
  onCopy,
  onReset,
  onSendToSlack,
  slackLoading,
  slackSent,
  slackConnected,
  disabled,
}: OutputPanelProps) {
  return (
    <section className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-neutral-900">Generated Ticket</h2>
        <p className="text-sm text-neutral-500 mt-1">Ready to copy or send</p>
      </div>

      {ticket ? (
        <>
          <div className="mb-6 max-h-80 overflow-auto rounded-lg border border-neutral-200 bg-neutral-50 p-4">
            <pre className="whitespace-pre-wrap font-mono text-sm leading-relaxed text-neutral-800">
              {ticket}
            </pre>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              onClick={onCopy}
              disabled={disabled}
              className="flex-1 rounded-lg bg-teal-600 px-4 py-3 font-medium text-white transition hover:bg-teal-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Copy to clipboard
            </button>

            {slackConnected && (
              <button
                onClick={onSendToSlack}
                disabled={disabled || slackLoading || slackSent}
                className="flex-1 rounded-lg bg-[#4A154B] px-4 py-3 font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {slackLoading
                  ? "Sending..."
                  : slackSent
                    ? "Sent ✓"
                    : "Send to Slack"}
              </button>
            )}

            <button
              onClick={onReset}
              disabled={disabled}
              className="rounded-lg border border-neutral-200 px-4 py-3 font-medium text-neutral-600 transition hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              New ticket
            </button>
          </div>
        </>
      ) : (
        <div className="rounded-lg border border-dashed border-neutral-300 p-8 text-center">
          <p className="text-neutral-500">
            {disabled ? "Generate a ticket to see output" : "Ticket will appear here"}
          </p>
        </div>
      )}
    </section>
  );
}