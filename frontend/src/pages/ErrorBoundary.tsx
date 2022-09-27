import { Refresh } from "@mui/icons-material";
import { Component, ErrorInfo, ReactNode } from "react";

interface Props {
  children?: ReactNode;
}

interface State {
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State;

  constructor(props: Props) {
    super(props);
    this.state = { error: null, errorInfo: null };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Catch errors in any components below and re-render with error message
    this.setState({ error, errorInfo });
  }

  render() {
    return (
      <div>
        {this.state.error ? (
          <div style={{ width: "90vw", height: "90vh" }}>
            <h2 className="container text-light mt-5">
              Oops! Something Went Wrong 😅
            </h2>
            <h4 className="container text-warning">
              {this.state.error.toString()}
            </h4>
            <h6 className="container text-info my-3">
              {this.state?.errorInfo?.componentStack}
            </h6>
            <button
              className="btn btn-outline-secondary text-light px-3 rounded-pill"
              onClick={() => window.location.reload()}
            >
              <Refresh /> Try Again
            </button>
          </div>
        ) : (
          <>{this.props?.children}</>
        )}
      </div>
    );
  }
}

export default ErrorBoundary;
