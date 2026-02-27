import React from 'react';

const Step1Initial = ({ register, errors, onNext, watch }) => {
    const searchMode = watch("searchMode") || "auto";

    return (
        <div className="animate-fade-in space-y-6">
            <h2 className="text-2xl font-semibold mb-6">Let's find your perfect trip</h2>

            {/* Search Mode Toggle */}
            <div className="flex p-1 bg-black/40 border border-cyan-800 rounded-xl shadow-inner">
                <label className={`flex-1 flex items-center justify-center py-2.5 rounded-lg cursor-pointer transition-all duration-200 ${searchMode === 'auto' ? 'bg-primary text-white shadow-lg' : 'text-textMuted hover:text-text'}`}>
                    <input type="radio" value="auto" {...register("searchMode")} className="hidden" />
                    <span className="text-sm font-medium">Find for me</span>
                </label>
                <label className={`flex-1 flex items-center justify-center py-2.5 rounded-lg cursor-pointer transition-all duration-200 ${searchMode === 'manual' ? 'bg-primary text-white shadow-lg' : 'text-textMuted hover:text-text'}`}>
                    <input type="radio" value="manual" {...register("searchMode")} className="hidden" />
                    <span className="text-sm font-medium">Compare my options</span>
                </label>
            </div>

            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-textMuted mb-2">Starting Location</label>
                    <input
                        type="text"
                        {...register("startLocation", { required: "Location is required" })}
                        placeholder="e.g. Kochi"
                        className="w-full bg-black/20 border border-cyan-800 rounded-lg p-3 text-text focus:outline-none focus:ring-2 focus:ring-primary transition backdrop-blur-sm placeholder-cyan-700/70 shadow-inner"
                    />
                    {errors.startLocation && <p className="text-rose-400 text-sm mt-1">{errors.startLocation.message}</p>}
                </div>

                <div>
                    <label className="block text-sm font-medium text-textMuted mb-2">Total Budget (₹)</label>
                    <input
                        type="number"
                        {...register("budget", {
                            required: "Budget is required",
                            min: { value: 500, message: "Budget must be at least ₹500" }
                        })}
                        placeholder="e.g. 15000"
                        className="w-full bg-black/20 border border-cyan-800 rounded-lg p-3 text-text focus:outline-none focus:ring-2 focus:ring-primary transition backdrop-blur-sm placeholder-cyan-700/70 shadow-inner"
                    />
                    {errors.budget && <p className="text-rose-400 text-sm mt-1">{errors.budget.message}</p>}
                </div>

                <div>
                    <label className="block text-sm font-medium text-textMuted mb-2">Number of Travel Days</label>
                    <input
                        type="number"
                        {...register("days", {
                            required: "Days are required",
                            min: { value: 1, message: "Must be at least 1 day" }
                        })}
                        placeholder="e.g. 3"
                        className="w-full bg-black/20 border border-cyan-800 rounded-lg p-3 text-text focus:outline-none focus:ring-2 focus:ring-primary transition backdrop-blur-sm placeholder-cyan-700/70 shadow-inner"
                    />
                    {errors.days && <p className="text-rose-400 text-sm mt-1">{errors.days.message}</p>}
                </div>

                {searchMode === 'manual' && (
                    <div className="animate-fade-in">
                        <label className="block text-sm font-medium text-textMuted mb-2">Destinations to Compare</label>
                        <textarea
                            {...register("manualDestinationsText", {
                                required: searchMode === 'manual' ? "Please enter at least one destination" : false
                            })}
                            placeholder="Munnar, Goa, Delhi (comma separated)"
                            rows="2"
                            className="w-full bg-black/20 border border-cyan-800 rounded-lg p-3 text-text focus:outline-none focus:ring-2 focus:ring-primary transition backdrop-blur-sm placeholder-cyan-700/70 shadow-inner resize-none"
                        ></textarea>
                        {errors.manualDestinationsText && <p className="text-rose-400 text-sm mt-1">{errors.manualDestinationsText.message}</p>}
                    </div>
                )}
            </div>

            <button
                type="button"
                onClick={onNext}
                className="w-full bg-primary hover:bg-primaryHover text-white font-medium py-3 rounded-lg mt-8 transition duration-200 shadow-[0_0_15px_rgba(20,184,166,0.4)]"
            >
                Next Step →
            </button>
        </div>
    );
};

export default Step1Initial;
