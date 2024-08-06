import React from "react";
import { Link as RouterLink } from "react-router-dom";
import Logo from "../assets/images/logo.png";

interface StrategyCardProps {
    title: string;
    description: string;
    buttonLabel: string;
}

const StrategyCard: React.FC<StrategyCardProps> = ({ title, description, buttonLabel }) => {
    return (
        <div className="bg-white rounded-md shadow-md p-4">
            <figure>
                <img src={Logo} alt="Logo" className="w-full h-auto rounded-full" />
            </figure>
            <div className="card-body  p-4">
                <div className="flex flex-col items-center">
                    <h2 className="card-title text-center">
                        {title}
                    <div className="badge badge-secondary">NEW</div>
                    </h2>
                </div>
                <p>{description}</p>
                <div className="card-actions justify-center mt-4">
                    <RouterLink to="/onboarding-portfolio">
                        <button className="btn btn-primary">{buttonLabel}</button>
                    </RouterLink>
                </div>
            </div>
        </div>
    );
};

export default StrategyCard;