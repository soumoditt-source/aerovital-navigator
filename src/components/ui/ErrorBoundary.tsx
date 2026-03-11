'use client'

import React from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'

interface Props {
    children: React.ReactNode
    fallbackLabel?: string
}

interface State {
    hasError: boolean
    errorMessage: string
}

/**
 * AEROVITAL v5.0 — React Error Boundary
 * Wraps critical panels (WardIntelligencePanel, CameraScan) so that
 * a crash in a sub-feature never takes down the whole app.
 */
export default class ErrorBoundary extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props)
        this.state = { hasError: false, errorMessage: '' }
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, errorMessage: error.message }
    }

    override componentDidCatch(error: Error, info: React.ErrorInfo) {
        console.error('[AeroVital ErrorBoundary]', error, info)
    }

    override render() {
        if (this.state.hasError) {
            return (
                <div className="flex flex-col items-center justify-center gap-4 py-20 text-white/40">
                    <AlertTriangle size={36} className="text-red-400" />
                    <p className="font-bold text-sm text-white/60">
                        {this.props.fallbackLabel ?? 'A module encountered an error'}
                    </p>
                    <p className="text-xs max-w-sm text-center opacity-60">
                        {this.state.errorMessage}
                    </p>
                    <button
                        onClick={() => this.setState({ hasError: false, errorMessage: '' })}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-full text-sm font-bold hover:bg-blue-500 transition-all"
                    >
                        <RefreshCw size={14} /> Retry
                    </button>
                </div>
            )
        }

        return this.props.children
    }
}
