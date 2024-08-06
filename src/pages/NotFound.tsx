import React from "react";
import { useNavigate } from "react-router-dom";

const NotFound: React.FC = () => {
    const navigate = useNavigate();

    const handleGoBack = () => {
        navigate("/");
    }

    return (
        <div className="min-h-screen flex flex-col justify-center items-center">
            <h1 className="text-4xl font-bold mb-6">Page Not Found</h1>
            <p className="text-lg mb-6">
                Sorry, the page you are looking for does not exist.
            </p>
            <button className="btn btn-primary" onClick={handleGoBack}>
                Go back to the home page
            </button>
        </div>
    );
};

export default NotFound;
