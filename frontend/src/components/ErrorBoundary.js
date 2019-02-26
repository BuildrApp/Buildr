import React, {Component} from 'react';

class ErrorBoundary extends Component {
    static getDerivedStateFromError(error) {
        return {
            hasError: true
        };
    }

    constructor(props) {
        super(props);

        this.state = {
            hasError: false
        };
    }

    componentDidCatch(error, info) {
        console.error(error, info);
    }

    render() {
        if (this.state.hasError) {
            return <h3>Something went wrong.</h3>;
        }

        return this.props.children;
    }
}

export default ErrorBoundary;