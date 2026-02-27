import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import Step1Initial from './Step1Initial';
import Step2Preferences from './Step2Preferences';
import axios from 'axios';

const Wizard = ({ onResults }) => {
    const [step, setStep] = useState(1);
    const [isLoading, setIsLoading] = useState(false);

    const { register, handleSubmit, formState: { errors }, watch, trigger } = useForm({
        defaultValues: {
            preferredType: 'No preference',
            preferredWeather: 'No preference',
            modeOfTravel: 'Train'
        }
    });

    const handleNext = async () => {
        const isValid = await trigger(['startLocation', 'budget', 'days', 'searchMode', 'manualDestinationsText']);
        if (isValid) setStep(2);
    };

    const handleBack = () => setStep(1);

    const submitForm = async (data) => {
        setIsLoading(true);
        try {
            // Process manual destinations if in manual mode
            const payload = { ...data };
            if (data.searchMode === 'manual' && data.manualDestinationsText) {
                payload.manualDestinations = data.manualDestinationsText
                    .split(',')
                    .map(name => name.trim())
                    .filter(name => name !== '');
            }

            // Replace with actual backend API if deployed, proxy is set in dev
            const response = await axios.post('/api/evaluate', payload);
            onResults(response.data.results);
        } catch (error) {
            console.error('API Error:', error);
            alert('Failed to evaluate destinations. Please ensure the backend is running.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="w-full max-w-xl mx-auto bg-surface/80 backdrop-blur-lg shadow-[0_8px_32px_rgba(0,0,0,0.5)] rounded-2xl p-8 border border-cyan-800">
            {/* Progress indicator */}
            <div className="flex items-center space-x-2 mb-8">
                <div className={`h-2 flex-1 rounded-full ${step >= 1 ? 'bg-primary' : 'bg-cyan-900/50'}`}></div>
                <div className={`h-2 flex-1 rounded-full ${step >= 2 ? 'bg-primary' : 'bg-cyan-900/50'}`}></div>
            </div>

            <form>
                {step === 1 && (
                    <Step1Initial
                        register={register}
                        errors={errors}
                        onNext={handleNext}
                        watch={watch}
                    />
                )}

                {step === 2 && (
                    <Step2Preferences
                        register={register}
                        watch={watch}
                        onBack={handleBack}
                        onSubmit={handleSubmit(submitForm)}
                        isLoading={isLoading}
                    />
                )}
            </form>
        </div>
    );
};

export default Wizard;
