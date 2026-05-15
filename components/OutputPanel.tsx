"use client";

import { useState } from "react";

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
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await onCopy();
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Parse ticket into structured sections
  const parseTicket = (text: string) => {
    const sections: Record<string, string> = {};
    const lines = text.split("\n");
    let currentSection = "";
    let currentContent: string[] = [];

    lines.forEach((line) => {
      const sectionMatch = line.match(/^🐛|^📊|^📝|^🔄|^✅|^❌|^🌍|^🏷️|^📌/);
      if (sectionMatch) {
        if (currentSection) {
          sections[currentSection] = currentContent.join("\n").trim();
        }
        currentSection = sectionMatch[0];
        currentContent = [line.replace(sectionMatch[0], "").trim()];
      } else if (currentSection) {
        currentContent.push(line);
      }
    });

    if (currentSection) {
      sections[currentSection] = currentContent.join("\n").trim();
    }

    return sections;
  };

  const parsed = ticket ? parseTicket(ticket) : {};

  return (
    <div className="flex flex-col h-full rounded-2xl bg-[var(--card)] border border-[var(--border)] overflow-hidden">
      {/* Header */}
      <div className="px-6 pt-6 pb-4 border-b border-[var(--border)]/50 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-[var(--text)]">Output</h2>
          <p className="text-sm text-[var(--text)]/50 mt-0.5">
            {ticket ? "Generated ticket ready to use" : "Your ticket will appear here"}
          </p>
        </div>
        {ticket && (
          <div className="flex gap-2">
            <button
              onClick={handleCopy}
              disabled={disabled}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--primary)]/10 text-[var(--primary)] text-sm font-medium hover:bg-[var(--primary)]/20 transition-colors"
            >
              {copied ? (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Copied
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  Copy
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6">
        {ticket ? (
          <div className="space-y-4">
            {/* Ticket Card */}
            <div className="relative rounded-xl border border-[var(--primary)]/20 bg-gradient-to-br from-[var(--bg)] to-[var(--primary)]/5 p-5 shadow-lg shadow-[var(--primary)]/5">
              {/* Title */}
              {parsed["🐛"] && (
                <div className="mb-4">
                  <h3 className="text-lg font-bold text-[var(--text)]">
                    {parsed["🐛"]}
                  </h3>
                </div>
              )}

              {/* Priority Badge */}
              {parsed["📊"] && (
                <div className="mb-4">
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${
                    parsed["📊"].toLowerCase().includes("high")
                      ? "bg-red-500/20 text-red-400"
                      : parsed["📊"].toLowerCase().includes("medium")
                      ? "bg-amber-500/20 text-amber-400"
                      : "bg-green-500/20 text-green-400"
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${
                      parsed["📊"].toLowerCase().includes("high")
                        ? "bg-red-500"
                        : parsed["📊"].toLowerCase().includes("medium")
                        ? "bg-amber-500"
                        : "bg-green-500"
                    }`} />
                    {parsed["📊"]}
                  </span>
                </div>
              )}

              {/* Description */}
              {parsed["📝"] && (
                <div className="mb-4">
                  <p className="text-xs font-medium text-[var(--text)]/50 uppercase tracking-wide mb-1.5">Description</p>
                  <p className="text-sm text-[var(--text)]/80">{parsed["📝"]}</p>
                </div>
              )}

              {/* Steps to Reproduce */}
              {parsed["🔄"] && (
                <div className="mb-4">
                  <p className="text-xs font-medium text-[var(--text)]/50 uppercase tracking-wide mb-1.5">Steps to Reproduce</p>
                  <div className="text-sm text-[var(--text)]/80 space-y-1">
                    {parsed["🔄"].split("\n").filter(Boolean).map((step, i) => (
                      <p key={i} className="flex gap-2">
                        <span className="text-[var(--primary)] font-medium">{i + 1}.</span>
                        {step.replace(/^\d+\.\s*/, "")}
                      </p>
                    ))}
                  </div>
                </div>
              )}

              {/* Expected vs Actual */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                {parsed["✅"] && (
                  <div>
                    <p className="text-xs font-medium text-green-500/70 uppercase tracking-wide mb-1">Expected</p>
                    <p className="text-sm text-[var(--text)]/80">{parsed["✅"]}</p>
                  </div>
                )}
                {parsed["❌"] && (
                  <div>
                    <p className="text-xs font-medium text-red-500/70 uppercase tracking-wide mb-1">Actual</p>
                    <p className="text-sm text-[var(--text)]/80">{parsed["❌"]}</p>
                  </div>
                )}
              </div>

              {/* Environment & Tags */}
              {(parsed["🌍"] || parsed["🏷️"]) && (
                <div className="flex flex-wrap gap-2 pt-2 border-t border-[var(--border)]/50">
                  {parsed["🌍"] && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-[var(--text)]/5 text-xs text-[var(--text)]/60">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064" />
                      </svg>
                      {parsed["🌍"]}
                    </span>
                  )}
                  {parsed["🏷️"] && parsed["🏷️"].split(",").map((tag, i) => (
                    <span key={i} className="inline-flex items-center px-2 py-1 rounded-md bg-[var(--primary)]/10 text-xs text-[var(--primary)]">
                      {tag.trim()}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Raw Output (Collapsible) */}
            <details className="group">
              <summary className="flex items-center gap-2 text-sm text-[var(--text)]/50 cursor-pointer hover:text-[var(--text)]/70 transition-colors">
                <svg className="w-4 h-4 transition-transform group-open:rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
                View raw output
              </summary>
              <pre className="mt-3 p-4 rounded-lg bg-[var(--bg)] border border-[var(--border)] text-xs text-[var(--text)]/70 font-mono whitespace-pre-wrap">
                {ticket}
              </pre>
            </details>
          </div>
        ) : (
          /* Empty State */
          <div className="flex flex-col items-center justify-center h-full text-center py-12">
            <div className="relative mb-6">
              <div className="w-20 h-20 rounded-2xl bg-[var(--primary)]/10 flex items-center justify-center">
                <svg className="w-10 h-10 text-[var(--primary)]/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-lg bg-[var(--bg)] border border-[var(--border)] flex items-center justify-center">
                <svg className="w-4 h-4 text-[var(--primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
            </div>
            <h3 className="text-lg font-medium text-[var(--text)] mb-2">
              {disabled ? "Ready to generate" : "No ticket yet"}
            </h3>
            <p className="text-sm text-[var(--text)]/40 max-w-xs">
              {disabled
                ? "Upload a screenshot and add context to generate your ticket"
                : "Your structured ticket will appear here after generation"}
            </p>
          </div>
        )}
      </div>

      {/* Footer Actions */}
      {ticket && (
        <div className="p-6 pt-0 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            {slackConnected && (
              <button
                onClick={onSendToSlack}
                disabled={disabled || slackLoading || slackSent}
                className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#4A154B] text-white text-sm font-medium hover:bg-[#4A154B]/90 transition-colors disabled:opacity-50"
              >
                {slackLoading ? (
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                ) : slackSent ? (
                  <>
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Sent
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M5.042 15.165a2.528 2.528 0 01-2.52 2.523A2.528 2.528 0 010 15.165a2.527 2.527 0 012.522-2.52h2.52v2.52zM6.313 15.165a2.527 2.527 0 012.521-2.52 2.527 2.527 0 012.521 2.52v6.313A2.528 2.528 0 018.834 24a2.528 2.528 0 01-2.521-2.522v-6.313zM8.834 5.042a2.528 2.528 0 01-2.521-2.52A2.528 2.528 0 018.834 0a2.528 2.528 0 012.521 2.522v2.52H8.834zM8.834 6.313a2.528 2.528 0 012.521 2.521 2.528 2.528 0 01-2.521 2.521H2.522A2.528 2.528 0 010 8.834a2.528 2.528 0 012.522-2.521h6.312z" />
                    </svg>
                    Slack
                  </>
                )}
              </button>
            )}
            
            <button
              onClick={onReset}
              disabled={disabled}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-[var(--border)] text-[var(--text)]/60 text-sm font-medium hover:bg-[var(--border)]/50 transition-colors disabled:opacity-50"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              New
            </button>
          </div>
        </div>
      )}
    </div>
  );
}