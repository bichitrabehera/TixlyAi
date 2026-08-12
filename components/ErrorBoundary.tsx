"use client";

import React from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

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
          <Card className="w-full max-w-md rounded-2xl p-8 text-center shadow-sm">
            {/* Icon */}
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[var(--card-2)]">
              <AlertTriangle className="h-5 w-5 text-[var(--muted)]" />
            </div>

            {/* Title */}
            <h2 className="text-lg font-semibold text-[var(--text)]">
              Something went wrong
            </h2>

            {/* Description */}
            <p className="mt-2 text-sm text-[var(--muted)]">
              An unexpected error occurred. You can try refreshing the page or
              contact support.
            </p>

            {/* Email */}
            <a
              href="mailto:bichitrabehera.345@gmail.com?subject=Error%20Report"
              className="mt-2 inline-block text-sm text-[var(--primary)] hover:underline"
            >
              bichitrabehera.345@gmail.com
            </a>

            {/* Actions */}
            <div className="mt-6 flex gap-3">
              <Button onClick={this.handleReload} className="flex-1">
                Refresh
              </Button>

              <Button onClick={this.handleRetry} variant="secondary" className="flex-1">
                Try again
              </Button>
            </div>
          </Card>
        </div>
      );
    }

    return this.props.children as React.ReactElement;
  }
}
