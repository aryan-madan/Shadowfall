
import React, { useState, useEffect } from 'react';

interface ObjectiveNotificationProps {
    objective: string;
    onClose: () => void;
}

const ObjectiveNotification: React.FC<ObjectiveNotificationProps> = ({ objective, onClose }) => {
    const [isVisible, setIsVisible] = useState(false);
    
    useEffect(() => {
        setIsVisible(true);
    }, [objective]);

    const handleClose = () => {
        setIsVisible(false);
        setTimeout(onClose, 300);
    }

    const formatObjectiveText = (text: string) => {
        const parts = text.split(/\*\*(.*?)\*\*/g);
        return parts.map((part, index) => {
            if (index % 2 === 1) {
                return <strong key={index} className="text-cyan-300">{part}</strong>;
            }
            return part;
        });
    };

    if (!isVisible) return null;

    return (
        <div 
            className="fixed top-28 right-4 bg-slate-900/90 backdrop-blur-md border border-red-500/80 p-4 rounded-lg z-[10000] max-w-sm text-gray-200 shadow-2xl shadow-red-500/30 animate-slide-in"
        >
            <div className="flex justify-between items-center border-b border-red-500/50 pb-2 mb-3">
                <div>
                    <p className="text-red-500 font-bold tracking-wider">INCOMING MESSAGE</p>
                    <p className="text-lg text-gray-400">From: VOID</p>
                </div>
                <button onClick={handleClose} className="text-gray-500 hover:text-white transition-colors text-2xl">&times;</button>
            </div>
            <p className="text-2xl leading-tight font-medium">
                {formatObjectiveText(objective)}
            </p>
            <div className="absolute bottom-0 left-0 w-full h-1 bg-red-500 animate-progress"></div>
            <style>
                {`
                    @keyframes slide-in {
                        from { transform: translateX(100%); opacity: 0; }
                        to { transform: translateX(0); opacity: 1; }
                    }
                    .animate-slide-in {
                        animation: slide-in 0.5s cubic-bezier(0.250, 0.460, 0.450, 0.940) both;
                    }
                    @keyframes progress-bar {
                        from { width: 100%; }
                        to { width: 0%; }
                    }
                    .animate-progress {
                        animation: progress-bar 15s linear forwards;
                    }
                `}
            </style>
        </div>
    )
};

export default ObjectiveNotification;
