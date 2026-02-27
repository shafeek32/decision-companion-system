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
        const isValid = await trigger(['startLocation', 'budget', 'days']);
        if (isValid) setStep(2);
    };

    const handleBack = () => setStep(1);

    const submitForm = async (data) => {
        setIsLoading(true);
        try {
            // Replace with actual backend API if deployed, proxy is set in dev
            const response = await axios.post('/api/evaluate', data);
            onResults(response.data.results);
        } catch (error) {
            console.error('API Error:', error);
            alert('Failed to evaluate destinations. Please ensure the backend is running.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="w-full max-w-xl mx-auto bg-surface/50 backdrop-blur-md shadow-2xl rounded-2xl p-8 border border-slate-800">
            {/* Progress indicator */}
            <div className="flex items-center space-x-2 mb-8">
                <div className={`h-2 flex-1 rounded-full ${step >= 1 ? 'bg-primary' : 'bg-slate-700'}`}></div>
                <div className={`h-2 flex-1 rounded-full ${step >= 2 ? 'bg-primary' : 'bg-slate-700'}`}></div>
            </div>

            <form>
                {step === 1 && (
                    <Step1Initial
                        register={register}
                        errors={errors}
                        onNext={handleNext}
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
