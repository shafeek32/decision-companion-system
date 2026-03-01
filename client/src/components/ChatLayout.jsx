import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { Send, MapPin, Navigation, PlusCircle, Trash2, Undo2 } from 'lucide-react';
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
    { key: 'budget', label: 'Total Trip Budget (₹)', placeholder: 'e.g. 12000', type: 'number', min: 1 },
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
                        className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-gray-900 text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
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
                                className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-gray-900 text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
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
        companions: '',
        memberCount: 1,
        tripDays: 3,
        totalBudget: '',
        hasDestinations: null,
        numDestinationsToCompare: 0,
        destinations: [],
        landType: '',
        isOutsideIndia: null
    });
    const [history, setHistory] = useState([]); // Store previous tripData states
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

    const handleModeSelect = (mode) => {
        setHistory(prev => [...prev, { ...tripData }]);
        addMessage({ role: 'user', content: mode });
        setTripData(prev => ({ ...prev, modeOfTravel: mode }));

        setTimeout(() => {
            addMessage({
                role: 'system',
                content: `Awesome. You are traveling by ${mode}. Are you traveling alone or with family/friends?`,
                type: 'ASK_COMPANIONS'
            });
        }, 600);
    };

    const handleCompanionsSelect = (companionsType) => {
        setHistory(prev => [...prev, { ...tripData }]);
        addMessage({ role: 'user', content: companionsType });
        setTripData(prev => ({ ...prev, companions: companionsType }));

        setTimeout(() => {
            if (companionsType === 'Alone') {
                addMessage({
                    role: 'system',
                    content: "Got it, a solo trip! How many days is the trip?",
                    type: 'ASK_TRIP_DAYS'
                });
            } else {
                addMessage({
                    role: 'system',
                    content: "Sounds fun! How many members are traveling in total?",
                    type: 'ASK_MEMBER_COUNT'
                });
            }
        }, 600);
    };

    const handleInputSubmit = (e) => {
        e.preventDefault();
        const text = inputValue.trim();
        if (!text) return;

        const lastSystemMsg = [...messages].reverse().find(m => m.role === 'system');

        if (lastSystemMsg?.type === 'ASK_LOCATION') {
            setHistory(prev => [...prev, { ...tripData }]);
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
        } else if (lastSystemMsg?.type === 'ASK_MEMBER_COUNT') {
            const count = parseInt(text);
            if (isNaN(count) || count < 1) {
                addMessage({ role: 'system', content: "Please enter a valid number of members.", type: 'ASK_MEMBER_COUNT' });
                return;
            }
            setHistory(prev => [...prev, { ...tripData }]);
            addMessage({ role: 'user', content: text });
            setTripData(prev => ({ ...prev, memberCount: count }));
            setInputValue('');
            setTimeout(() => {
                addMessage({
                    role: 'system',
                    content: `Got it, ${count} members. How many days is the trip?`,
                    type: 'ASK_TRIP_DAYS'
                });
            }, 600);
        } else if (lastSystemMsg?.type === 'ASK_TRIP_DAYS') {
            const days = parseInt(text);
            if (isNaN(days) || days < 1) {
                addMessage({ role: 'system', content: "Please enter a valid number of days.", type: 'ASK_TRIP_DAYS' });
                return;
            }
            setHistory(prev => [...prev, { ...tripData }]);
            addMessage({ role: 'user', content: `${days} Days` });
            setTripData(prev => ({ ...prev, tripDays: days }));
            setInputValue('');
            setTimeout(() => {
                addMessage({
                    role: 'system',
                    content: `A ${days}-day trip. What is your total overall budget for this trip (in ₹)?`,
                    type: 'ASK_BUDGET'
                });
            }, 600);
        } else if (lastSystemMsg?.type === 'ASK_BUDGET') {
            const budget = parseInt(text);
            if (isNaN(budget) || budget <= 0) {
                addMessage({ role: 'system', content: "Please enter a valid budget amount.", type: 'ASK_BUDGET' });
                return;
            }
            setHistory(prev => [...prev, { ...tripData }]);
            addMessage({ role: 'user', content: `₹${budget}` });
            setTripData(prev => ({ ...prev, totalBudget: budget }));
            setInputValue('');
            setTimeout(() => {
                addMessage({
                    role: 'system',
                    content: `Your total budget is ₹${budget}. Do you have any destinations in mind already?`,
                    type: 'ASK_HAVE_DESTINATIONS'
                });
            }, 600);
        } else if (lastSystemMsg?.type === 'ASK_HOW_MANY_DESTINATIONS') {
            const num = parseInt(text);
            if (isNaN(num) || num < 2) {
                addMessage({ role: 'system', content: "Please enter a valid number (at least 2 to compare).", type: 'ASK_HOW_MANY_DESTINATIONS' });
                return;
            }
            setHistory(prev => [...prev, { ...tripData }]);
            addMessage({ role: 'user', content: text });
            setTripData(prev => ({ ...prev, numDestinationsToCompare: num }));
            setInputValue('');
            setTimeout(() => {
                addMessage({
                    role: 'system',
                    content: `Alright, please enter the details for destination #1.`,
                    type: 'ASK_DESTINATION'
                });
            }, 600);
        } else {
            addMessage({ role: 'user', content: text });
            setInputValue('');
            setTimeout(() => {
                addMessage({ role: 'system', content: "Please use the provided options or forms to continue." });
            }, 500);
        }
    };

    const handleHaveDestinationsSelect = (hasDestinations) => {
        setHistory(prev => [...prev, { ...tripData }]);
        addMessage({ role: 'user', content: hasDestinations ? 'Yes' : 'No' });
        setTripData(prev => ({ ...prev, hasDestinations }));

        setTimeout(() => {
            addMessage({
                role: 'system',
                content: "Are you planning to travel outside India?",
                type: 'ASK_OUTSIDE_INDIA'
            });
        }, 600);
    };

    const handleOutsideIndiaSelect = (isOutside) => {
        setHistory(prev => [...prev, { ...tripData }]);
        addMessage({ role: 'user', content: isOutside ? 'Yes (Outside India)' : 'No (Inside India)' });
        setTripData(prev => ({ ...prev, isOutsideIndia: isOutside }));

        setTimeout(() => {
            if (tripData.hasDestinations) {
                addMessage({
                    role: 'system',
                    content: "How many destinations do you want to compare?",
                    type: 'ASK_HOW_MANY_DESTINATIONS'
                });
            } else {
                addMessage({
                    role: 'system',
                    content: "What kind of experience are you looking for?",
                    type: 'ASK_LAND_TYPE'
                });
            }
        }, 600);
    };

    const handleLandTypeSelect = (type) => {
        setHistory(prev => [...prev, { ...tripData }]);
        addMessage({ role: 'user', content: type });
        setTripData(prev => ({ ...prev, landType: type }));

        setTimeout(() => {
            initiateSuggestion(type);
        }, 600);
    };

    const handleDestinationAdd = (dest) => {
        setHistory(prev => [...prev, { ...tripData }]);
        const updatedDestinations = [...tripData.destinations, dest];
        setTripData(prev => ({ ...prev, destinations: updatedDestinations }));

        addMessage({
            role: 'user',
            content: `Added: ${dest.name} (Budget: ₹${dest.budget})`
        });

        setTimeout(() => {
            if (updatedDestinations.length < tripData.numDestinationsToCompare) {
                addMessage({
                    role: 'system',
                    content: `Please enter the details for destination #${updatedDestinations.length + 1}.`,
                    type: 'ASK_DESTINATION'
                });
            } else {
                initiateRanking(updatedDestinations);
            }
        }, 600);
    };

    const initiateSuggestion = async (selectedLandType = null) => {
        setLoading(true);
        addMessage({ role: 'system', content: "Finding the best destinations based on your constraints...", type: 'LOADING' });

        try {
            const payload = {
                startLocation: tripData.startLocation,
                modeOfTravel: tripData.modeOfTravel,
                totalBudget: tripData.totalBudget,
                memberCount: tripData.memberCount,
                tripDays: tripData.tripDays,
                landType: selectedLandType || tripData.landType,
                isOutsideIndia: tripData.isOutsideIndia
            };

            const { data } = await axios.post('/api/destinations/suggest', payload);

            setMessages(prev => prev.filter(m => m.type !== 'LOADING'));

            if (!data.success || data.rankedResults.length === 0) {
                addMessage({
                    role: 'system',
                    content: "I couldn't find any destinations matching your exact constraints in the database. Try adjusting your budget or travel mode.",
                    type: 'ERROR'
                });
            } else {
                addMessage({
                    role: 'system',
                    content: `I found ${data.count} great options for you! Here are the recommended destinations ranked by suitability:`,
                    type: 'RESULTS',
                    resultsData: data
                });
            }

        } catch (err) {
            setMessages(prev => prev.filter(m => m.type !== 'LOADING'));
            addMessage({
                role: 'system',
                content: "Sorry, there was an error suggesting destinations. Please try again.",
                type: 'ERROR'
            });
        } finally {
            setLoading(false);
        }
    };

    const initiateRanking = async (finalDestinations) => {
        addMessage({ role: 'user', content: "Ready to rank my destinations" });
        setLoading(true);
        addMessage({ role: 'system', content: "Analyzing factors and ranking your destinations...", type: 'LOADING' });

        try {
            const payload = {
                startLocation: tripData.startLocation,
                modeOfTravel: tripData.modeOfTravel,
                destinations: finalDestinations.map(d => ({
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
        setTripData({
            startLocation: '', modeOfTravel: '', companions: '', memberCount: 1, tripDays: 3, totalBudget: '', hasDestinations: null, numDestinationsToCompare: 0, destinations: [], landType: '', isOutsideIndia: null
        });
        setHistory([]);
        setMessages([
            {
                id: Date.now(),
                role: 'system',
                content: "Let's start over! Where are you starting your journey from?",
                type: 'ASK_LOCATION'
            }
        ]);
    };

    const handleGoBack = () => {
        if (messages.length <= 1 || history.length === 0 || loading) return;

        // Restore previous data state
        const previousTripData = history[history.length - 1];
        setTripData(previousTripData);
        setHistory(prev => prev.slice(0, -1));

        // Pop last user message and the system message that followed it
        setMessages(prev => {
            const newMsgs = [...prev];
            // Remove messages until we hit the last system prompt that asked for input
            while (newMsgs.length > 1) {
                const popped = newMsgs.pop();
                // Usually it's [..., System_Question, User_Answer, System_Next_Question]
                if (popped.role === 'user') {
                    break;
                }
            }
            return newMsgs;
        });
    };

    const lastSystemMsgForInput = [...messages].reverse().find(m => m.role === 'system');
    const inputDisabled = loading || ['ASK_MODE', 'ASK_COMPANIONS', 'ASK_HAVE_DESTINATIONS', 'ASK_OUTSIDE_INDIA', 'ASK_LAND_TYPE', 'ASK_DESTINATION', 'RESULTS', 'ERROR'].includes(lastSystemMsgForInput?.type);

    return (
        <div className="flex flex-col h-screen w-full bg-white">
            {/* Header */}
            <header className="flex-shrink-0 h-16 border-b border-gray-100 flex items-center justify-between px-6 sticky top-0 bg-white/80 backdrop-blur z-10">
                <h1 className="text-xl font-bold text-gray-800 tracking-tight flex items-center gap-2">
                    <Navigation className="w-6 h-6 text-primary" />
                    Decision Companion
                </h1>
                <div className="flex items-center gap-2">
                    {messages.length > 2 && !loading && (
                        <button
                            onClick={handleGoBack}
                            className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-600 bg-white border border-gray-200 hover:border-gray-300 hover:bg-gray-50 hover:text-gray-900 rounded-lg transition-colors shadow-sm"
                            title="Go Back One Step"
                        >
                            <Undo2 className="w-4 h-4" />
                            <span className="hidden sm:inline">Back</span>
                        </button>
                    )}
                    {messages.length > 1 && (
                        <button
                            onClick={resetFlow}
                            className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 hover:text-gray-900 rounded-lg transition-colors"
                            title="Start New Conversation"
                        >
                            <PlusCircle className="w-4 h-4" />
                            <span className="hidden sm:inline">New Chat</span>
                        </button>
                    )}
                </div>
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
                                            className="px-4 py-2 bg-white border border-gray-200 hover:border-primary hover:text-primary text-gray-800 rounded-full text-sm font-medium transition-colors shadow-sm"
                                        >
                                            {mode}
                                        </button>
                                    ))}
                                </div>
                            )}

                            {msg.type === 'ASK_COMPANIONS' && (
                                <div className="flex flex-wrap gap-2 mt-4">
                                    {['Alone', 'With Family/Friends'].map(comp => (
                                        <button
                                            key={comp}
                                            onClick={() => handleCompanionsSelect(comp)}
                                            className="px-4 py-2 bg-white border border-gray-200 hover:border-primary hover:text-primary text-gray-800 rounded-full text-sm font-medium transition-colors shadow-sm"
                                        >
                                            {comp}
                                        </button>
                                    ))}
                                </div>
                            )}

                            {msg.type === 'ASK_HAVE_DESTINATIONS' && (
                                <div className="flex flex-wrap gap-2 mt-4">
                                    <button
                                        onClick={() => handleHaveDestinationsSelect(true)}
                                        className="px-4 py-2 bg-white border border-gray-200 hover:border-primary hover:text-primary text-gray-800 rounded-full text-sm font-medium transition-colors shadow-sm"
                                    >
                                        Yes
                                    </button>
                                    <button
                                        onClick={() => handleHaveDestinationsSelect(false)}
                                        className="px-4 py-2 bg-white border border-gray-200 hover:border-primary hover:text-primary text-gray-800 rounded-full text-sm font-medium transition-colors shadow-sm"
                                    >
                                        No
                                    </button>
                                </div>
                            )}

                            {msg.type === 'ASK_OUTSIDE_INDIA' && (
                                <div className="flex flex-wrap gap-2 mt-4">
                                    <button
                                        onClick={() => handleOutsideIndiaSelect(true)}
                                        className="px-4 py-2 bg-white border border-gray-200 hover:border-primary hover:text-primary text-gray-800 rounded-full text-sm font-medium transition-colors shadow-sm"
                                    >
                                        Yes
                                    </button>
                                    <button
                                        onClick={() => handleOutsideIndiaSelect(false)}
                                        className="px-4 py-2 bg-white border border-gray-200 hover:border-primary hover:text-primary text-gray-800 rounded-full text-sm font-medium transition-colors shadow-sm"
                                    >
                                        No
                                    </button>
                                </div>
                            )}

                            {msg.type === 'ASK_LAND_TYPE' && (
                                <div className="flex flex-wrap gap-2 mt-4">
                                    {['Hill station', 'Beach', 'City', 'Forest', 'Any'].map(type => (
                                        <button
                                            key={type}
                                            onClick={() => handleLandTypeSelect(type)}
                                            className="px-4 py-2 bg-white border border-gray-200 hover:border-primary hover:text-primary text-gray-800 rounded-full text-sm font-medium transition-colors shadow-sm"
                                        >
                                            {type}
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
