
interface LoadingSpinnerProps {
    size?: "small" | "medium" | "large";
    className?: string;
}

export function LoadingSpinner({ size = "medium", className = "" }: LoadingSpinnerProps) {
    const sizeClasses = {
        small: "w-4 h-4 border-2",
        medium: "w-8 h-8 border-3",
        large: "w-12 h-12 border-4",
    };

    return (
        <div className={`flex justify-center items-center py-4 ${className}`}>
            <div
                className={`${sizeClasses[size]} border-gray-300 border-t-blue-600 rounded-full animate-spin`}
                role="status"
                aria-label="Loading"
            >
                <span className="sr-only">Loading...</span>
            </div>
        </div>
    );
}
