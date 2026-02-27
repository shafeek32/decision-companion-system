import React from 'react';

const Step1Initial = ({ register, errors, onNext }) => {
    return (
        <div className="animate-fade-in space-y-6">
            <h2 className="text-2xl font-semibold mb-6">Let's find your perfect trip</h2>

            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-textMuted mb-2">Starting Location</label>
                    <input
                        type="text"
                        {...register("startLocation", { required: "Location is required" })}
                        placeholder="e.g. Kochi"
                        className="w-full bg-surface border border-slate-700 rounded-lg p-3 text-text focus:outline-none focus:ring-2 focus:ring-primary transition"
                    />
                    {errors.startLocation && <p className="text-red-400 text-sm mt-1">{errors.startLocation.message}</p>}
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
                        className="w-full bg-surface border border-slate-700 rounded-lg p-3 text-text focus:outline-none focus:ring-2 focus:ring-primary transition"
                    />
                    {errors.budget && <p className="text-red-400 text-sm mt-1">{errors.budget.message}</p>}
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
                        className="w-full bg-surface border border-slate-700 rounded-lg p-3 text-text focus:outline-none focus:ring-2 focus:ring-primary transition"
                    />
                    {errors.days && <p className="text-red-400 text-sm mt-1">{errors.days.message}</p>}
                </div>
            </div>

            <button
                type="button"
                onClick={onNext}
                className="w-full bg-primary hover:bg-primaryHover text-white font-medium py-3 rounded-lg mt-8 transition duration-200"
            >
                Next Step
            </button>
        </div>
    );
};

export default Step1Initial;
