import React, { useState } from 'react';
import Wizard from './components/Wizard';
import Results from './components/Results';

function App() {
    const [results, setResults] = useState(null);

    const handleReset = () => setResults(null);

    return (
        <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 flex flex-col items-center">
            <div className="text-center mb-12 animate-slide-up">
                <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-cyan-300 mb-4 tracking-tight drop-shadow-md">
                    Travel Decision Companion
                </h1>
                <p className="text-lg text-teal-100/80 max-w-2xl mx-auto font-light drop-shadow-sm">
                    A transparent, deterministic engine that analyzes your constraints and preferences to find your perfect destination.
                </p>
            </div>

            <main className="w-full flex-1 flex flex-col items-center animate-slide-up" style={{ animationDelay: '0.1s' }}>
                {results === null ? (
                    <Wizard onResults={setResults} />
                ) : (
                    <Results results={results} onReset={handleReset} />
                )}
            </main>
        </div>
    );
}

export default App;
