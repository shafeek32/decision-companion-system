import React from 'react';

const Step2Preferences = ({ register, watch, onBack, onSubmit, isLoading }) => {
    const budget = watch("budget");
    const days = watch("days");

    // Dynamic Options Logic
    const isBudgetLow = budget && Number(budget) < 8000;
    const isDaysShort = days && Number(days) <= 2;

    return (
        <div className="animate-fade-in space-y-6">
            <h2 className="text-2xl font-semibold mb-6">Tell us your preferences</h2>

            <div className="space-y-5">
                {/* Scope Selection */}
                <div>
                    <label className="block text-sm font-medium text-textMuted mb-2">Travel Scope</label>
                    <select
                        {...register("scope")}
                        className="w-full bg-surface border border-slate-700 rounded-lg p-3 text-text focus:outline-none focus:ring-2 focus:ring-primary transition"
                    >
                        <option value="">Anywhere</option>
                        <option value="Inside Kerala">Inside Kerala</option>
                        {(!isBudgetLow && !isDaysShort) && (
                            <option value="Outside Kerala (India)">Outside Kerala (India)</option>
                        )}
                        {(!isBudgetLow && (!days || Number(days) >= 5)) && (
                            <option value="Outside India">Outside India</option>
                        )}
                    </select>
                    {(isBudgetLow || isDaysShort) && (
                        <p className="text-xs text-yellow-500 mt-2">
                            Some distant scopes are hidden as they exceed your budget/time constraints.
                        </p>
                    )}
                </div>

                {/* Destination Type Selection */}
                <div>
                    <label className="block text-sm font-medium text-textMuted mb-2">Preferred Destination Type</label>
                    <div className="grid grid-cols-2 gap-3">
                        {['Hill station', 'Beach', 'City', 'Forest', 'No preference'].map(type => (
                            <label key={type} className="flex items-center space-x-2 bg-surface border border-slate-700 p-3 rounded-lg cursor-pointer hover:border-primary transition">
                                <input
                                    type="radio"
                                    value={type}
                                    {...register("preferredType")}
                                    className="text-primary focus:ring-primary h-4 w-4"
                                />
                                <span className="text-sm">{type}</span>
                            </label>
                        ))}
                    </div>
                </div>

                {/* Weather Preference Selection */}
                <div>
                    <label className="block text-sm font-medium text-textMuted mb-2">Preferred Weather</label>
                    <select
                        {...register("preferredWeather")}
                        className="w-full bg-surface border border-slate-700 rounded-lg p-3 text-text focus:outline-none focus:ring-2 focus:ring-primary transition"
                    >
                        <option value="No preference">No preference</option>
                        <option value="Cool">Cool</option>
                        <option value="Warm">Warm</option>
                        <option value="Moderate">Moderate</option>
                    </select>
                </div>

                {/* Mode of Travel */}
                <div>
                    <label className="block text-sm font-medium text-textMuted mb-2">Mode of Travel</label>
                    <div className="grid grid-cols-3 gap-3">
                        {['Car', 'Train', 'Flight'].map(mode => (
                            <label key={mode} className="flex flex-col items-center justify-center space-y-2 bg-surface border border-slate-700 p-3 rounded-lg cursor-pointer hover:border-primary transition">
                                <input
                                    type="radio"
                                    value={mode}
                                    {...register("modeOfTravel", { required: true })}
                                    className="text-primary focus:ring-primary h-4 w-4"
                                />
                                <span className="text-sm">{mode}</span>
                            </label>
                        ))}
                    </div>
                </div>
            </div>

            <div className="flex space-x-4 mt-8">
                <button
                    type="button"
                    onClick={onBack}
                    className="w-1/3 bg-transparent border border-slate-600 hover:bg-surface text-text font-medium py-3 rounded-lg transition duration-200"
                >
                    Back
                </button>
                <button
                    type="button"
                    onClick={onSubmit}
                    disabled={isLoading}
                    className={`w-2/3 text-white font-medium py-3 rounded-lg transition duration-200 ${isLoading ? 'bg-primaryHover opacity-70 cursor-not-allowed' : 'bg-primary hover:bg-primaryHover'}`}
                >
                    {isLoading ? 'Evaluating...' : 'Find Destinations'}
                </button>
            </div>
        </div>
    );
};

export default Step2Preferences;
