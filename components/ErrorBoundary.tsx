"use client";

import React from "react";
import { AlertTriangle } from "lucide-react";

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
}

export default class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: unknown, info: unknown) {
    if (process.env.NODE_ENV !== "production") {
      console.error("Unhandled React error:", error, info);
    }
  }

  handleReload = () => {
    window.location.reload();
  };

  handleRetry = () => {
    this.setState({ hasError: false });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-[60vh] items-center justify-center px-6">
          <div className="w-full max-w-md rounded-2xl border border-[(--border)] bg-[(--card)] p-8 text-center shadow-sm">
            {/* Icon */}
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[(--card-2)]">
              <AlertTriangle className="h-5 w-5 text-[(--muted)]" />
            </div>

            {/* Title */}
            <h2 className="text-lg font-semibold text-[(--text)]">
              Something went wrong
            </h2>

            {/* Description */}
            <p className="mt-2 text-sm text-[(--muted)]">
              An unexpected error occurred. You can try refreshing the page or
              contact support.
            </p>

            {/* Email */}
            <a
              href="mailto:bichitrabehera.345@gmail.com?subject=Error%20Report"
              className="mt-2 inline-block text-sm text-[(--primary)] hover:underline"
            >
              bichitrabehera.345@gmail.com
            </a>

            {/* Actions */}
            <div className="mt-6 flex gap-3">
              <button
                onClick={this.handleReload}
                className="flex-1 rounded-xl bg-[(--text)] px-4 py-2 text-sm font-medium text-[(--card)] transition hover:opacity-90"
              >
                Refresh
              </button>

              <button
                onClick={this.handleRetry}
                className="flex-1 rounded-xl border border-[(--border)] bg-[(--card-2)] px-4 py-2 text-sm font-medium text-[(--text)] transition hover:bg-[(--border)]"
              >
                Try again
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children as React.ReactElement;
  }
}
