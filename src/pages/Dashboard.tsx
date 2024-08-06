import React from "react";

// import components
import ChartSection from "../components/ChartSection";

const Dashboard: React.FC = () => {
    return (
        <div className="min-h-screen p-4">
            <div className="container mx-auto px-4 py-4">
                <div className="flex justify-between items-start">
                    {/* Left Section: Chart and Trade History */}
                    <ChartSection />
                    {/* Right Section: Controls and Strategy Info */}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
