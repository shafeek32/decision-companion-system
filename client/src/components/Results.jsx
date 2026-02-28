import React, { useState } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell
} from 'recharts';
import { Trophy, RotateCcw, Info, ChevronDown, ChevronUp } from 'lucide-react';

const FACTOR_LABELS = {
    budget: 'Budget',
    travelTimeHours: 'Travel Time',
    distanceKm: 'Distance',
    safetyRating: 'Safety',
    weatherSuitability: 'Weather',
    userRating: 'User Rating'
};

const FACTOR_ICONS = {
    budget: '💰',
    travelTimeHours: '⏱️',
    distanceKm: '📍',
    safetyRating: '🛡️',
    weatherSuitability: '🌤️',
    userRating: '⭐'
};

const COLORS = ['#3b82f6', '#60a5fa', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6'];

// Score color based on normalized 0-1 value
const scoreColor = (val) => {
    if (val >= 0.7) return 'text-green-600';
    if (val >= 0.4) return 'text-yellow-600';
    return 'text-red-500';
};

const bgScoreColor = (val) => {
    if (val >= 0.7) return 'bg-green-50 border-green-200';
    if (val >= 0.4) return 'bg-yellow-50 border-yellow-200';
    return 'bg-red-50 border-red-200';
};

const formatRaw = (key, value) => {
    if (key === 'budget') return `₹${Number(value).toLocaleString()}`;
    if (key === 'travelTimeHours') return `${value}h`;
    if (key === 'distanceKm') return `${value} km`;
    return `${value}/10`;
};

const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
        const { name, score } = payload[0].payload;
        return (
            <div className="bg-white border border-gray-200 rounded-lg shadow-lg px-4 py-3">
                <p className="font-semibold text-gray-800">{name}</p>
                <p className="text-gray-600 text-sm">Score: <span className="font-bold text-primary">{(score * 100).toFixed(1)}%</span></p>
            </div>
        );
    }
    return null;
};

const Results = ({ data, onReset }) => {
    const { winner, rankedResults, weightsUsed } = data;
    const [showWeights, setShowWeights] = useState(false);

    if (!rankedResults || rankedResults.length === 0) {
        return (
            <div className="text-center space-y-6 bg-white rounded-2xl p-8 border border-gray-200">
                <div className="text-6xl">🏜️</div>
                <h2 className="text-2xl font-bold text-gray-800">No Results Returned</h2>
                <button onClick={onReset} className="bg-primary hover:bg-primaryHover text-white font-medium py-3 px-8 rounded-lg transition">
                    Try Again
                </button>
            </div>
        );
    }

    const chartData = rankedResults.map(r => ({ name: r.name, score: r.score }));

    return (
        <div className="w-full space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex justify-between items-center bg-white p-6 border-b border-gray-200">
                <div>
                    <h2 className="text-xl font-bold text-gray-800">Ranking Results</h2>
                    <p className="text-gray-500 text-sm mt-1">Scored using Weighted Sum Model · {rankedResults.length} destinations evaluated</p>
                </div>
            </div>

            {/* Winner Hero Card */}
            <div className="relative bg-blue-50/50 overflow-hidden border-b border-gray-200">
                {winner.input.imageUrl && (
                    <div className="h-48 overflow-hidden relative">
                        <img
                            src={winner.input.imageUrl}
                            alt={winner.name}
                            className="w-full h-full object-cover"
                            onError={e => { e.target.style.display = 'none'; }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                        <h3 className="absolute bottom-4 left-6 text-3xl font-bold text-white tracking-tight drop-shadow-md">{winner.name}</h3>
                    </div>
                )}

                <div className="p-6 space-y-5">
                    {!winner.input.imageUrl && (
                        <div className="flex items-start justify-between flex-wrap gap-3">
                            <div>
                                <span className="inline-flex items-center gap-1 text-xs font-bold bg-primary text-white px-3 py-1 rounded-full mb-2 shadow-sm">
                                    <Trophy className="w-3 h-3" /> #1 BEST MATCH
                                </span>
                                <h3 className="text-3xl font-extrabold text-gray-900 tracking-tight">{winner.name}</h3>
                            </div>
                        </div>
                    )}

                    {winner.input.imageUrl && (
                        <div className="flex items-center gap-2">
                            <span className="inline-flex items-center gap-1 text-xs font-bold bg-primary text-white px-3 py-1 rounded-full shadow-sm">
                                <Trophy className="w-3 h-3" /> #1 BEST MATCH
                            </span>
                        </div>
                    )}

                    <div className="flex justify-between items-center p-4 bg-white rounded-xl border border-gray-100 shadow-sm">
                        <span className="text-sm text-gray-500 font-semibold uppercase tracking-wider">Final Score</span>
                        <span className="text-3xl font-extrabold text-primary">{(winner.score * 100).toFixed(1)}%</span>
                    </div>

                    {/* Winner Key Stats */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {Object.keys(FACTOR_LABELS).map(key => (
                            <div key={key} className={`rounded-xl px-4 py-3 border ${bgScoreColor(winner.scoreBreakdown[key]?.normalized ?? 0)}`}>
                                <p className="text-xs text-gray-500 font-semibold mb-0.5">
                                    {FACTOR_ICONS[key]} {FACTOR_LABELS[key]}
                                </p>
                                <p className="font-bold text-gray-900 text-base">{formatRaw(key, winner.input[key])}</p>
                                <p className={`text-xs font-semibold mt-1 ${scoreColor(winner.scoreBreakdown[key]?.normalized ?? 0)}`}>
                                    Score: {((winner.scoreBreakdown[key]?.normalized ?? 0) * 100).toFixed(0)}%
                                </p>
                            </div>
                        ))}
                    </div>

                    {/* Explanation */}
                    {winner.explanationPoints && winner.explanationPoints.length > 0 && (
                        <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm space-y-3">
                            <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold flex items-center gap-1">
                                <Info className="w-4 h-4 text-primary" /> Why {winner.name} won
                            </p>
                            <ul className="space-y-2">
                                {winner.explanationPoints.map((point, i) => (
                                    <li key={i} className="text-sm text-gray-700 leading-relaxed flex items-start gap-2">
                                        <span className="text-primary mt-0.5">•</span>
                                        <span dangerouslySetInnerHTML={{ __html: point.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            </div>

            {/* Bar Chart */}
            <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-bold text-gray-800 mb-5">Score Comparison</h3>
                <ResponsiveContainer width="100%" height={260}>
                    <BarChart data={chartData} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                        <XAxis dataKey="name" tick={{ fill: '#6b7280', fontSize: 12 }} axisLine={false} tickLine={false} />
                        <YAxis domain={[0, 1]} tickFormatter={v => `${(v * 100).toFixed(0)}%`} tick={{ fill: '#6b7280', fontSize: 12 }} axisLine={false} tickLine={false} />
                        <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f3f4f6' }} />
                        <Bar dataKey="score" radius={[6, 6, 0, 0]} maxBarSize={60}>
                            {chartData.map((entry, index) => (
                                <Cell key={entry.name} fill={index === 0 ? '#3b82f6' : '#93c5fd'} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>

            {/* Full Comparison Table */}
            <div className="p-6 overflow-x-auto">
                <h3 className="text-lg font-bold text-gray-800 mb-5">Full Comparison Table</h3>
                <table className="w-full text-sm min-w-[600px]">
                    <thead>
                        <tr className="border-b border-gray-200">
                            <th className="text-left py-3 pr-4 text-gray-500 font-semibold uppercase tracking-wider text-xs">Rank</th>
                            <th className="text-left py-3 pr-4 text-gray-500 font-semibold uppercase tracking-wider text-xs">Destination</th>
                            {Object.keys(FACTOR_LABELS).map(key => (
                                <th key={key} className="text-center py-3 px-2 text-gray-500 font-semibold uppercase tracking-wider text-xs whitespace-nowrap">
                                    {FACTOR_ICONS[key]} {FACTOR_LABELS[key]}
                                    <br />
                                    <span className="text-gray-400 normal-case tracking-normal font-normal">w={weightsUsed[key]}</span>
                                </th>
                            ))}
                            <th className="text-center py-3 pl-4 text-gray-500 font-semibold uppercase tracking-wider text-xs">Score</th>
                        </tr>
                    </thead>
                    <tbody>
                        {rankedResults.map((r, i) => (
                            <tr key={r.name} className={`border-b border-gray-100 hover:bg-gray-50 transition ${i === 0 ? 'bg-blue-50/30' : ''}`}>
                                <td className="py-4 pr-4">
                                    <span className={`text-lg font-bold ${i === 0 ? 'text-primary' : 'text-gray-400'}`}>
                                        #{r.rank}
                                    </span>
                                </td>
                                <td className="py-4 pr-4 font-semibold text-gray-800 whitespace-nowrap flex items-center gap-2">
                                    {i === 0 && <span className="text-yellow-500">🏆</span>}{r.name}
                                </td>
                                {Object.keys(FACTOR_LABELS).map(key => {
                                    const b = r.scoreBreakdown[key];
                                    return (
                                        <td key={key} className="py-4 px-2 text-center">
                                            <div className="flex flex-col items-center gap-1">
                                                <span className="text-gray-700 font-medium">{formatRaw(key, r.input[key])}</span>
                                                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${bgScoreColor(b?.normalized ?? 0)} ${scoreColor(b?.normalized ?? 0)}`}>
                                                    {((b?.normalized ?? 0) * 100).toFixed(0)}%
                                                </span>
                                            </div>
                                        </td>
                                    );
                                })}
                                <td className="py-4 pl-4 text-center">
                                    <span className={`font-extrabold text-base ${i === 0 ? 'text-primary' : 'text-gray-600'}`}>
                                        {(r.score * 100).toFixed(1)}%
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Weight Transparency Panel */}
            <div className="border-t border-gray-200 overflow-hidden bg-gray-50">
                <button
                    onClick={() => setShowWeights(!showWeights)}
                    className="w-full flex justify-between items-center p-6 text-left hover:bg-gray-100 transition"
                >
                    <span className="font-semibold text-gray-700 flex items-center gap-2">
                        <Info className="w-5 h-5 text-gray-400" /> System Weight Disclosure
                    </span>
                    {showWeights ? <ChevronUp className="w-5 h-5 text-gray-500" /> : <ChevronDown className="w-5 h-5 text-gray-500" />}
                </button>
                {showWeights && (
                    <div className="px-6 pb-6">
                        <p className="text-sm text-gray-500 mb-5">
                            The system automatically assigns these fixed weights. Budget has the highest priority.
                            Weights sum to 1.00.
                        </p>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                            {Object.entries(weightsUsed).map(([key, w]) => (
                                <div key={key} className="bg-white rounded-xl border border-gray-200 px-4 py-3 shadow-sm">
                                    <p className="text-xs text-gray-500 font-medium mb-2">{FACTOR_ICONS[key]} {FACTOR_LABELS[key]}</p>
                                    <div className="flex items-center gap-3">
                                        <div className="flex-1 bg-gray-100 rounded-full h-2">
                                            <div
                                                className="h-2 rounded-full bg-primary"
                                                style={{ width: `${w * 100}%` }}
                                            />
                                        </div>
                                        <span className="text-sm font-bold text-gray-700">{(w * 100).toFixed(0)}%</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Results;
