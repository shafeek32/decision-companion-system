import React from 'react';
import { MapPin, Wallet, Calendar, CloudSun, Leaf, Navigation } from 'lucide-react';

const Results = ({ results, onReset }) => {
    if (!results || results.length === 0) {
        return (
            <div className="text-center animate-fade-in space-y-6 bg-surface/80 backdrop-blur-lg shadow-[0_8px_32px_rgba(0,0,0,0.5)] rounded-2xl p-8 border border-cyan-800">
                <div className="text-6xl mb-4">🏜️</div>
                <h2 className="text-2xl font-bold text-text">No Destinations Found</h2>
                <p className="text-textMuted max-w-sm mx-auto">
                    Unfortunately, your constraints are too tight. Try increasing your budget or reducing the number of days.
                </p>
                <button
                    onClick={onReset}
                    className="bg-primary hover:bg-primaryHover text-white font-medium py-3 px-8 rounded-lg transition duration-200 mt-4 shadow-[0_0_15px_rgba(20,184,166,0.3)]"
                >
                    Start Over
                </button>
            </div>
        );
    }

    return (
        <div className="w-full max-w-4xl mx-auto animate-fade-in space-y-8">
            <div className="flex justify-between items-center bg-surface/80 backdrop-blur-lg shadow-[0_8px_32px_rgba(0,0,0,0.5)] rounded-2xl p-6 border border-cyan-800">
                <div>
                    <h2 className="text-2xl font-bold text-text drop-shadow-sm">Top Recommendations</h2>
                    <p className="text-teal-100/70">Sorted by best match for your constraints</p>
                </div>
                <button
                    onClick={onReset}
                    className="text-primary hover:text-teal-300 font-medium underline underline-offset-4 decoration-2 transition"
                >
                    Modify Search
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {results.map((item, index) => {
                    const { destination, score, estimatedCost, explanation, scoreDetails } = item;
                    const isTop = index === 0;

                    return (
                        <div
                            key={destination.name}
                            className={`relative bg-surface/90 backdrop-blur-md rounded-2xl overflow-hidden shadow-lg border transition-all duration-300 hover:shadow-[0_10px_40px_rgba(0,0,0,0.6)] hover:-translate-y-1 ${isTop ? 'border-primary ring-2 ring-primary/40' : 'border-cyan-900/60'}`}
                        >
                            {isTop && (
                                <div className="absolute top-4 right-4 bg-gradient-to-r from-teal-500 to-cyan-400 text-white text-xs font-bold px-3 py-1 rounded-full z-10 shadow-[0_0_15px_rgba(20,184,166,0.5)]">
                                    #1 MATCH
                                </div>
                            )}

                            <div className="h-48 overflow-hidden relative">
                                <img
                                    src={destination.imageUrl}
                                    alt={destination.name}
                                    className="w-full h-full object-cover transition-transform duration-700 hover:scale-110"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent"></div>
                                <h3 className="absolute bottom-4 left-4 text-3xl font-bold text-white tracking-tight flex items-center drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                                    {destination.name}
                                </h3>
                            </div>

                            <div className="p-6 space-y-5">
                                {/* Key Stats */}
                                <div className="flex justify-between items-center pb-4 border-b border-cyan-900/40">
                                    <div className="flex flex-col">
                                        <span className="text-xs text-textMuted uppercase tracking-wider font-semibold">Total Cost</span>
                                        <span className={`text-xl font-bold drop-shadow-sm flex items-center ${scoreDetails.budgetFit > 0.5 ? 'text-teal-400' : 'text-amber-400'}`}>
                                            ₹{estimatedCost}
                                        </span>
                                    </div>
                                    <div className="flex flex-col items-end">
                                        <span className="text-xs text-textMuted uppercase tracking-wider font-semibold">Match Score</span>
                                        <span className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-cyan-300 drop-shadow-sm">
                                            {(score * 100).toFixed(0)}%
                                        </span>
                                    </div>
                                </div>

                                {/* Traits Badges */}
                                <div className="flex flex-wrap gap-2">
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-black/40 text-teal-200 border border-teal-800/50 backdrop-blur-sm">
                                        <MapPin className="w-3 h-3 mr-1 opacity-80" /> {destination.scope}
                                    </span>
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-black/40 text-teal-200 border border-teal-800/50 backdrop-blur-sm">
                                        <Leaf className="w-3 h-3 mr-1 opacity-80" /> {destination.landType}
                                    </span>
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-black/40 text-teal-200 border border-teal-800/50 backdrop-blur-sm">
                                        <CloudSun className="w-3 h-3 mr-1 opacity-80" /> {destination.weather}
                                    </span>
                                </div>

                                {/* Rule-based explanation */}
                                <div className="bg-black/20 p-4 rounded-xl border border-cyan-900/30 shadow-inner">
                                    <p className="text-sm text-teal-50/80 leading-relaxed italic">
                                        "{explanation}"
                                    </p>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default Results;
