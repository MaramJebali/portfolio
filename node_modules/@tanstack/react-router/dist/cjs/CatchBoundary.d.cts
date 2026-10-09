import { ErrorRouteComponent } from './route.cjs';
import { ErrorInfo } from 'react';
import * as React from 'react';
export declare class CatchBoundary extends React.Component<{
    getResetKey: () => unknown;
    children: React.ReactNode;
    errorComponent?: ErrorRouteComponent;
    onCatch?: (error: unknown, errorInfo: ErrorInfo) => void;
}> {
    state: {
        error: [unknown] | 0;
        resetKey?: unknown;
    };
    static getDerivedStateFromProps(props: {
        getResetKey: () => unknown;
    }, state: {
        resetKey?: unknown;
        error: [unknown] | 0;
    }): {
        resetKey: unknown;
        error: number;
    } | {
        resetKey: unknown;
        error?: undefined;
    };
    static getDerivedStateFromError(error: unknown): {
        error: unknown[];
    };
    reset: () => void;
    componentDidCatch(error: unknown, errorInfo: ErrorInfo): void;
    render(): string | number | bigint | boolean | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | Promise<string | number | bigint | boolean | React.ReactPortal | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | null | undefined> | React.FunctionComponentElement<import('@tanstack/router-core').ErrorComponentProps> | null | undefined;
}
export declare function ErrorComponent({ error }: {
    error: unknown;
}): import("react/jsx-runtime").JSX.Element;
