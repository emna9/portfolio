import { Component } from 'react';

/**
 * Keeps a failing 3D scene or a missing asset from unmounting the whole page.
 * Without a boundary React removes the entire tree, which is why the portfolio
 * could go completely blank on browsers where one resource failed.
 */
export default class ErrorBoundary extends Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error('[ErrorBoundary]', error, info?.componentStack);
    this.props.onError?.(error);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback ?? null;
    }

    return this.props.children;
  }
}
