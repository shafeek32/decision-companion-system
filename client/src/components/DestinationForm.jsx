import React, { useState } from 'react';
import axios from 'axios';
import { PlusCircle, Trash2, Send, MapPin, Navigation } from 'lucide-react';

const TRAVEL_MODES = ['Car', 'Train', 'Flight', 'Bus', 'Bike'];

const emptyDestination = () => ({
    name: '',
    budget: '',
    travelTimeHours: '',
    distanceKm: '',
    safetyRating: '',
    weatherSuitability: '',
    userRating: '',
    imageUrl: ''
});

const FIELD_META = [
    { key: 'budget', label: 'Total Budget (₹)', placeholder: 'e.g. 12000', type: 'number', min: 1 },
    { key: 'travelTimeHours', label: 'Travel Time (hours)', placeholder: 'e.g. 5', type: 'number', min: 0.1 },
    { key: 'distanceKm', label: 'Distance (km)', placeholder: 'e.g. 130', type: 'number', min: 1 },
    { key: 'safetyRating', label: 'Safety Rating (1-10)', placeholder: 'e.g. 8', type: 'number', min: 1, max: 10 },
    { key: 'weatherSuitability', label: 'Weather Suitability (1-10)', placeholder: 'e.g. 9', type: 'number', min: 1, max: 10 },
    { key: 'userRating', label: 'User Rating (1-10)', placeholder: 'e.g. 7.5', type: 'number', min: 1, max: 10 },
    { key: 'imageUrl', label: 'Image URL (optional)', placeholder: 'https://...', type: 'text', required: false }
];

const DestinationForm = ({ onResults }) => {
    const [startLocation, setStartLocation] = useState('');
    const [modeOfTravel, setModeOfTravel] = useState('Car');
    const [destinations, setDestinations] = useState([emptyDestination(), emptyDestination()]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const addDestination = () => {
        setDestinations(prev => [...prev, emptyDestination()]);
    };

    const removeDestination = (index) => {
        if (destinations.length <= 2) return;
        setDestinations(prev => prev.filter((_, i) => i !== index));
    };

    const updateField = (index, field, value) => {
        setDestinations(prev =>
            prev.map((d, i) => i === index ? { ...d, [field]: value } : d)
        );
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!startLocation.trim()) {
            setError('Please enter a starting location.');
            return;
        }

        // Validate all required numeric fields
        for (let i = 0; i < destinations.length; i++) {
            const d = destinations[i];
            if (!d.name.trim()) { setError(`Destination #${i + 1}: Name is required.`); return; }
            const numericFields = ['budget', 'travelTimeHours', 'distanceKm', 'safetyRating', 'weatherSuitability', 'userRating'];
            for (const f of numericFields) {
                if (d[f] === '' || isNaN(Number(d[f]))) {
                    setError(`Destination #${i + 1}: "${f}" must be a valid number.`);
                    return;
                }
            }
        }

        setLoading(true);
        try {
            const payload = {
                startLocation: startLocation.trim(),
                modeOfTravel,
                destinations: destinations.map(d => ({
                    ...d,
                    budget: Number(d.budget),
                    travelTimeHours: Number(d.travelTimeHours),
                    distanceKm: Number(d.distanceKm),
                    safetyRating: Number(d.safetyRating),
                    weatherSuitability: Number(d.weatherSuitability),
                    userRating: Number(d.userRating)
                }))
            };

            const { data } = await axios.post('/api/evaluate', payload);
            onResults(data);
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to connect to the server. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="w-full max-w-5xl space-y-8">
            {/* Trip Details */}
            <div className="bg-surface/80 backdrop-blur-lg rounded-2xl p-6 border border-cyan-800 shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
                <h2 className="text-xl font-bold text-text mb-5 flex items-center gap-2">
                    <Navigation className="w-5 h-5 text-teal-400" /> Trip Details
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-textMuted mb-1">Starting Location</label>
                        <input
                            type="text"
                            value={startLocation}
                            onChange={e => setStartLocation(e.target.value)}
                            placeholder="e.g. Kochi"
                            className="w-full bg-black/30 border border-cyan-900/60 rounded-lg px-4 py-2.5 text-text placeholder-textMuted/50 focus:outline-none focus:ring-2 focus:ring-teal-500 transition"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-textMuted mb-1">Mode of Travel</label>
                        <select
                            value={modeOfTravel}
                            onChange={e => setModeOfTravel(e.target.value)}
                            className="w-full bg-black/30 border border-cyan-900/60 rounded-lg px-4 py-2.5 text-text focus:outline-none focus:ring-2 focus:ring-teal-500 transition"
                        >
                            {TRAVEL_MODES.map(m => <option key={m} value={m}>{m}</option>)}
                        </select>
                    </div>
                </div>
            </div>

            {/* Destination Cards */}
            <div className="space-y-6">
                {destinations.map((dest, index) => (
                    <div
                        key={index}
                        className="bg-surface/80 backdrop-blur-lg rounded-2xl p-6 border border-cyan-800/70 shadow-[0_8px_32px_rgba(0,0,0,0.4)] transition-all duration-300"
                    >
                        <div className="flex justify-between items-center mb-5">
                            <h3 className="text-lg font-bold text-teal-300 flex items-center gap-2">
                                <MapPin className="w-4 h-4" />
                                Destination #{index + 1}
                            </h3>
                            {destinations.length > 2 && (
                                <button
                                    type="button"
                                    onClick={() => removeDestination(index)}
                                    className="text-red-400 hover:text-red-300 transition flex items-center gap-1 text-sm"
                                >
                                    <Trash2 className="w-4 h-4" /> Remove
                                </button>
                            )}
                        </div>

                        {/* Name */}
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-textMuted mb-1">Destination Name</label>
                            <input
                                type="text"
                                value={dest.name}
                                onChange={e => updateField(index, 'name', e.target.value)}
                                placeholder="e.g. Munnar"
                                className="w-full bg-black/30 border border-cyan-900/60 rounded-lg px-4 py-2.5 text-text placeholder-textMuted/50 focus:outline-none focus:ring-2 focus:ring-teal-500 transition"
                                required
                            />
                        </div>

                        {/* Constraint Inputs */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {FIELD_META.map(meta => (
                                <div key={meta.key}>
                                    <label className="block text-sm font-medium text-textMuted mb-1">
                                        {meta.label}
                                        {meta.required === false && (
                                            <span className="text-textMuted/50 text-xs ml-1">(optional)</span>
                                        )}
                                    </label>
                                    <input
                                        type={meta.type}
                                        value={dest[meta.key]}
                                        onChange={e => updateField(index, meta.key, e.target.value)}
                                        placeholder={meta.placeholder}
                                        min={meta.min}
                                        max={meta.max}
                                        step={meta.key === 'userRating' || meta.key === 'travelTimeHours' ? '0.1' : '1'}
                                        className="w-full bg-black/30 border border-cyan-900/60 rounded-lg px-4 py-2.5 text-text placeholder-textMuted/50 focus:outline-none focus:ring-2 focus:ring-teal-500 transition"
                                        required={meta.required !== false}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4 items-center">
                <button
                    type="button"
                    onClick={addDestination}
                    className="flex items-center gap-2 border border-teal-700 text-teal-300 hover:bg-teal-900/30 font-medium py-3 px-6 rounded-xl transition duration-200"
                >
                    <PlusCircle className="w-5 h-5" />
                    Add Another Destination
                </button>

                <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-white font-bold py-3 px-10 rounded-xl transition duration-200 shadow-[0_0_20px_rgba(20,184,166,0.4)] disabled:opacity-60 disabled:cursor-not-allowed"
                >
                    {loading ? (
                        <><span className="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full"></span> Ranking...</>
                    ) : (
                        <><Send className="w-5 h-5" /> Rank Destinations</>
                    )}
                </button>
            </div>

            {error && (
                <div className="bg-red-900/30 border border-red-700/50 rounded-xl px-5 py-4 text-red-300 text-sm">
                    ⚠️ {error}
                </div>
            )}
        </form>
    );
};

export default DestinationForm;
