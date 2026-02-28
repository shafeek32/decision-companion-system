import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { Send, MapPin, Navigation, PlusCircle, Trash2 } from 'lucide-react';
import ChatMessage from './ChatMessage';
import Results from './Results';

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
    { key: 'budget', label: 'Budget (₹)', placeholder: 'e.g. 12000', type: 'number', min: 1 },
    { key: 'travelTimeHours', label: 'Travel Time (hrs)', placeholder: 'e.g. 5', type: 'number', min: 0.1 },
    { key: 'distanceKm', label: 'Distance (km)', placeholder: 'e.g. 130', type: 'number', min: 1 },
    { key: 'safetyRating', label: 'Safety (1-10)', placeholder: 'e.g. 8', type: 'number', min: 1, max: 10 },
    { key: 'weatherSuitability', label: 'Weather (1-10)', placeholder: 'e.g. 9', type: 'number', min: 1, max: 10 },
    { key: 'userRating', label: 'User Rating (1-10)', placeholder: 'e.g. 7.5', type: 'number', min: 1, max: 10 },
    { key: 'imageUrl', label: 'Image URL', placeholder: 'https://...', type: 'text', required: false }
];

const DestinationMiniForm = ({ index, onAdd, onRemove, isRemovable }) => {
    const [dest, setDest] = useState(emptyDestination());
    const [error, setError] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!dest.name.trim()) { setError('Name is required.'); return; }
        const numericFields = ['budget', 'travelTimeHours', 'distanceKm', 'safetyRating', 'weatherSuitability', 'userRating'];
        for (const f of numericFields) {
            if (dest[f] === '' || isNaN(Number(dest[f]))) {
                setError(`"${f}" must be a valid number.`);
                return;
            }
        }
        setError('');
        onAdd(dest);
    };

    return (
        <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm max-w-2xl mt-4">
            <div className="flex justify-between items-center mb-4">
                <h4 className="font-semibold text-gray-800 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-primary" /> Destination #{index + 1} Details
                </h4>
                {isRemovable && (
                    <button type="button" onClick={onRemove} className="text-red-500 hover:text-red-600 text-sm flex items-center gap-1">
                        <Trash2 className="w-4 h-4" /> Remove
                    </button>
                )}
            </div>
            <div className="space-y-4">
                <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Destination Name</label>
                    <input
                        type="text"
                        value={dest.name}
                        onChange={e => setDest({ ...dest, name: e.target.value })}
                        className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                        placeholder="e.g. Munnar"
                    />
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {FIELD_META.map(meta => (
                        <div key={meta.key}>
                            <label className="block text-xs font-medium text-gray-500 mb-1 truncate" title={meta.label}>
                                {meta.label} {meta.required === false && '(Opt)'}
                            </label>
                            <input
                                type={meta.type}
                                value={dest[meta.key]}
                                onChange={e => setDest({ ...dest, [meta.key]: e.target.value })}
                                placeholder={meta.placeholder}
                                min={meta.min}
                                max={meta.max}
                                step={meta.key === 'userRating' || meta.key === 'travelTimeHours' ? '0.1' : '1'}
                                className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                            />
                        </div>
                    ))}
                </div>
                {error && <p className="text-red-500 text-xs">{error}</p>}
                <div className="pt-2 text-right">
                    <button type="submit" className="bg-primary hover:bg-primaryHover text-white px-5 py-2 rounded-lg text-sm font-medium transition-colors">
                        Confirm Destination
                    </button>
                </div>
            </div>
        </form>
    );
};


const ChatLayout = () => {
    const [messages, setMessages] = useState([
        {
            id: 1,
            role: 'system',
            content: "Welcome to the Smart Destination Decision System! Where are you starting your journey from?",
            type: 'ASK_LOCATION'
        }
    ]);
    const [inputValue, setInputValue] = useState('');
    const [tripData, setTripData] = useState({
        startLocation: '',
        modeOfTravel: '',
        destinations: []
    });
    const [loading, setLoading] = useState(false);

    // Auto-scroll ref
    const messagesEndRef = useRef(null);
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };
    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const addMessage = (msg) => {
        setMessages(prev => [...prev, { ...msg, id: Date.now() + Math.random() }]);
    };

    const handleInputSubmit = (e) => {
        e.preventDefault();
        const text = inputValue.trim();
        if (!text) return;

        // determine current state based on last system message type
        const lastSystemMsg = [...messages].reverse().find(m => m.role === 'system');

        if (lastSystemMsg?.type === 'ASK_LOCATION') {
            addMessage({ role: 'user', content: text });
            setTripData(prev => ({ ...prev, startLocation: text }));
            setInputValue('');

            setTimeout(() => {
                addMessage({
                    role: 'system',
                    content: `Great, starting from ${text}. How are you planning to travel?`,
                    type: 'ASK_MODE'
                });
            }, 600);
        } else {
            // Default if input isn't expected right now or arbitrary chat
            addMessage({ role: 'user', content: text });
            setInputValue('');
            setTimeout(() => {
                addMessage({ role: 'system', content: "Please use the provided options to continue." });
            }, 500);
        }
    };

    const handleModeSelect = (mode) => {
        addMessage({ role: 'user', content: mode });
        setTripData(prev => ({ ...prev, modeOfTravel: mode }));

        setTimeout(() => {
            addMessage({
                role: 'system',
                content: `Awesome. You are traveling by ${mode}. Now, please enter the details for your first destination.`,
                type: 'ASK_DESTINATION'
            });
        }, 600);
    };

    const handleDestinationAdd = (dest) => {
        const updatedDestinations = [...tripData.destinations, dest];
        setTripData(prev => ({ ...prev, destinations: updatedDestinations }));

        addMessage({
            role: 'user',
            content: `Added destination: ${dest.name}\nBudget: ₹${dest.budget} | Time: ${dest.travelTimeHours}h | Dist: ${dest.distanceKm}km | Safety: ${dest.safetyRating} | Weather: ${dest.weatherSuitability} | User Rating: ${dest.userRating}`
        });

        setTimeout(() => {
            if (updatedDestinations.length >= 2) {
                addMessage({
                    role: 'system',
                    content: `You have added ${updatedDestinations.length} destinations. You can add another one or rank the current destinations.`,
                    type: 'ASK_NEXT_ACTION'
                });
            } else {
                addMessage({
                    role: 'system',
                    content: `Please enter the details for destination #${updatedDestinations.length + 1}. You need at least 2 to compare.`,
                    type: 'ASK_DESTINATION'
                });
            }
        }, 600);
    };

    const initiateRanking = async () => {
        addMessage({ role: 'user', content: "Rank my destinations" });
        setLoading(true);
        addMessage({ role: 'system', content: "Analyzing factors and ranking your destinations...", type: 'LOADING' });

        try {
            const payload = {
                startLocation: tripData.startLocation,
                modeOfTravel: tripData.modeOfTravel,
                destinations: tripData.destinations.map(d => ({
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

            // Remove loading message
            setMessages(prev => prev.filter(m => m.type !== 'LOADING'));

            addMessage({
                role: 'system',
                content: "Here are your optimized travel recommendations:",
                type: 'RESULTS',
                resultsData: data
            });

        } catch (err) {
            setMessages(prev => prev.filter(m => m.type !== 'LOADING'));
            addMessage({
                role: 'system',
                content: "Sorry, there was an error analyzing the destinations. Please try again.",
                type: 'ERROR'
            });
        } finally {
            setLoading(false);
        }
    };

    const resetFlow = () => {
        setTripData({ startLocation: '', modeOfTravel: '', destinations: [] });
        setMessages([
            {
                id: Date.now(),
                role: 'system',
                content: "Let's start over! Where are you starting your journey from?",
                type: 'ASK_LOCATION'
            }
        ]);
    };

    // Determine current expectation for input
    const lastSystemMsg = [...messages].reverse().find(m => m.role === 'system');
    const inputDisabled = loading || ['ASK_MODE', 'ASK_DESTINATION', 'ASK_NEXT_ACTION', 'RESULTS'].includes(lastSystemMsg?.type);

    return (
        <div className="flex flex-col h-screen w-full bg-white">
            {/* Header */}
            <header className="flex-shrink-0 h-16 border-b border-gray-100 flex items-center justify-between px-6 sticky top-0 bg-white/80 backdrop-blur z-10">
                <h1 className="text-xl font-bold text-gray-800 tracking-tight flex items-center gap-2">
                    <Navigation className="w-6 h-6 text-primary" />
                    Decision Companion
                </h1>
                {tripData.destinations.length > 0 && (
                    <button onClick={resetFlow} className="text-sm font-medium text-gray-500 hover:text-gray-800 transition">
                        Reset Conversation
                    </button>
                )}
            </header>

            {/* Chat Messages Area */}
            <div className="flex-1 overflow-y-auto w-full pb-32">
                <div className="w-full">
                    {messages.map((msg) => (
                        <ChatMessage key={msg.id} role={msg.role} content={msg.content}>
                            {/* Interactive Widgets inside System Messages */}
                            {msg.type === 'ASK_MODE' && (
                                <div className="flex flex-wrap gap-2 mt-4">
                                    {TRAVEL_MODES.map(mode => (
                                        <button
                                            key={mode}
                                            onClick={() => handleModeSelect(mode)}
                                            className="px-4 py-2 bg-white border border-gray-200 hover:border-primary hover:text-primary rounded-full text-sm font-medium transition-colors shadow-sm"
                                        >
                                            {mode}
                                        </button>
                                    ))}
                                </div>
                            )}

                            {msg.type === 'ASK_DESTINATION' && (
                                <DestinationMiniForm
                                    index={tripData.destinations.length}
                                    onAdd={handleDestinationAdd}
                                    isRemovable={false}
                                />
                            )}

                            {msg.type === 'ASK_NEXT_ACTION' && (
                                <div className="flex flex-wrap gap-3 mt-4">
                                    <button
                                        onClick={() => {
                                            const activeDestCount = tripData.destinations.length;
                                            addMessage({ role: 'user', content: 'Add another destination' });
                                            setTimeout(() => {
                                                addMessage({
                                                    role: 'system',
                                                    content: `Please enter the details for destination #${activeDestCount + 1}.`,
                                                    type: 'ASK_DESTINATION'
                                                });
                                            }, 400);
                                        }}
                                        className="flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-200 hover:bg-gray-50 rounded-xl text-sm font-medium transition-colors shadow-sm text-gray-700"
                                    >
                                        <PlusCircle className="w-4 h-4" /> Add Destination
                                    </button>
                                    <button
                                        onClick={initiateRanking}
                                        className="flex items-center gap-2 px-6 py-2.5 bg-primary hover:bg-primaryHover text-white rounded-xl text-sm font-semibold transition-colors shadow-sm"
                                    >
                                        Rank Now
                                    </button>
                                </div>
                            )}

                            {msg.type === 'RESULTS' && msg.resultsData && (
                                <div className="mt-6 border border-gray-200 rounded-2xl overflow-hidden shadow-sm bg-white">
                                    <Results data={msg.resultsData} onReset={resetFlow} embedded={true} />
                                </div>
                            )}
                        </ChatMessage>
                    ))}
                    {loading && (
                        <ChatMessage role="system">
                            <div className="flex items-center gap-2 text-gray-500">
                                <span className="w-2 h-2 rounded-full bg-primary animate-bounce"></span>
                                <span className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                                <span className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0.4s' }}></span>
                            </div>
                        </ChatMessage>
                    )}
                    <div ref={messagesEndRef} />
                </div>
            </div>

            {/* Input Area */}
            <div className="fixed bottom-0 left-0 w-full bg-white border-t border-gray-100 p-4 pb-6 sm:pb-8 flex justify-center backdrop-blur-md bg-white/90">
                <form onSubmit={handleInputSubmit} className="w-full max-w-4xl relative flex items-center shadow-lg rounded-2xl overflow-hidden border border-gray-200 bg-white">
                    <input
                        type="text"
                        value={inputValue}
                        onChange={e => setInputValue(e.target.value)}
                        placeholder={inputDisabled ? "Please use the provided options above..." : "Message Companion..."}
                        disabled={inputDisabled}
                        className="w-full pl-6 pr-14 py-4 text-gray-800 bg-transparent outline-none disabled:bg-gray-50 disabled:text-gray-400 placeholder-gray-400"
                    />
                    <button
                        type="submit"
                        disabled={!inputValue.trim() || inputDisabled}
                        className="absolute right-2 p-2 rounded-xl bg-primary text-white hover:bg-primaryHover disabled:bg-gray-200 disabled:text-gray-400 transition-colors"
                    >
                        <Send className="w-5 h-5" />
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ChatLayout;
