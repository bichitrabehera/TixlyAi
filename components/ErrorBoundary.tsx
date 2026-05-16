"use client";

import React from "react";

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
      // Log dev-only details
      // eslint-disable-next-line no-console
      console.error("Unhandled React error:", error, info);
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-6">
          <h2 className="text-lg font-bold text-(--text)">Something went wrong.</h2>
          <p className="text-sm text-(--text)/60">Please refresh the page or contact support if the problem persists.</p>
        </div>
      );
    }

    return this.props.children as React.ReactElement;
  }
}
