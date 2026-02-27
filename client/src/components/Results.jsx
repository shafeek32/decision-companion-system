import React from 'react';
import { MapPin, Wallet, Calendar, CloudSun, Leaf, Navigation } from 'lucide-react';

const Results = ({ results, onReset }) => {
    if (!results || results.length === 0) {
        return (
            <div className="text-center animate-fade-in space-y-6 bg-surface/50 backdrop-blur-md shadow-2xl rounded-2xl p-8 border border-slate-800">
                <div className="text-6xl mb-4">🏜️</div>
                <h2 className="text-2xl font-bold">No Destinations Found</h2>
                <p className="text-textMuted max-w-sm mx-auto">
                    Unfortunately, your constraints are too tight. Try increasing your budget or reducing the number of days.
                </p>
                <button
                    onClick={onReset}
                    className="bg-primary hover:bg-primaryHover text-white font-medium py-3 px-8 rounded-lg transition duration-200 mt-4"
                >
                    Start Over
                </button>
            </div>
        );
    }

    return (
        <div className="w-full max-w-4xl mx-auto animate-fade-in space-y-8">
            <div className="flex justify-between items-center bg-surface/50 backdrop-blur-md shadow-lg rounded-2xl p-6 border border-slate-800">
                <div>
                    <h2 className="text-2xl font-bold text-white">Top Recommendations</h2>
                    <p className="text-textMuted">Sorted by best match for your constraints</p>
                </div>
                <button
                    onClick={onReset}
                    className="text-primary hover:text-primaryHover font-medium underline underline-offset-4 decoration-2"
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
                            className={`relative bg-surface rounded-2xl overflow-hidden shadow-xl border transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 ${isTop ? 'border-primary ring-1 ring-primary/50' : 'border-slate-800'}`}
                        >
                            {isTop && (
                                <div className="absolute top-4 right-4 bg-primary text-white text-xs font-bold px-3 py-1 rounded-full z-10 shadow-lg">
                                    #1 MATCH
                                </div>
                            )}

                            <div className="h-48 overflow-hidden relative">
                                <img
                                    src={destination.imageUrl}
                                    alt={destination.name}
                                    className="w-full h-full object-cover transition-transform duration-700 hover:scale-110"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-surface to-transparent"></div>
                                <h3 className="absolute bottom-4 left-4 text-3xl font-bold text-white tracking-tight flex items-center">
                                    {destination.name}
                                </h3>
                            </div>

                            <div className="p-6 space-y-5">
                                {/* Key Stats */}
                                <div className="flex justify-between items-center pb-4 border-b border-slate-700">
                                    <div className="flex flex-col">
                                        <span className="text-xs text-textMuted uppercase tracking-wider font-semibold">Total Cost</span>
                                        <span className={`text-xl font-bold ${scoreDetails.budgetFit > 0.5 ? 'text-emerald-400' : 'text-yellow-400'}`}>
                                            ₹{estimatedCost}
                                        </span>
                                    </div>
                                    <div className="flex flex-col items-end">
                                        <span className="text-xs text-textMuted uppercase tracking-wider font-semibold">Match Score</span>
                                        <span className="text-xl font-bold text-primary">
                                            {(score * 100).toFixed(0)}%
                                        </span>
                                    </div>
                                </div>

                                {/* Traits Badges */}
                                <div className="flex flex-wrap gap-2">
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-800 text-slate-300 border border-slate-700">
                                        <MapPin className="w-3 h-3 mr-1" /> {destination.scope}
                                    </span>
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-800 text-slate-300 border border-slate-700">
                                        <Leaf className="w-3 h-3 mr-1" /> {destination.landType}
                                    </span>
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-800 text-slate-300 border border-slate-700">
                                        <CloudSun className="w-3 h-3 mr-1" /> {destination.weather}
                                    </span>
                                </div>

                                {/* Rule-based explanation */}
                                <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50">
                                    <p className="text-sm text-slate-300 leading-relaxed italic">
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
