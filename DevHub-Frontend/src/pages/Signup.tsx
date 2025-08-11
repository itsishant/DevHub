import axios from 'axios';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export const Signup = () => {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        Bio: {
            firstname: '',
            lastname: '',
            email: '',
            skills: [],
        },
        Avatar: '',
    });
    
    const [emailVerification, setEmailVerification] = useState({
        status: 'idle', 
        message: ''
    });

    const [error, setError] = useState('');
    // --- CHANGE 1: Add password to validation errors state ---
    const [validationErrors, setValidationErrors] = useState({ username: '', email: '', password: '' });
    const [isChecking, setIsChecking] = useState(false);
    
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [skillInput, setSkillInput] = useState('');
    const [focusedField, setFocusedField] = useState('');

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        // Clear validation error when user types again
        if (name === 'username' && validationErrors.username) {
            setValidationErrors(prev => ({ ...prev, username: '' }));
        }
        // --- CHANGE 4: Clear password error on input ---
        if (name === 'password' && validationErrors.password) {
            setValidationErrors(prev => ({ ...prev, password: '' }));
        }
        setFormData(prev => ({ ...prev, [name]: value }));
    };
    
    const handleBioChange = (e) => {
        const { name, value } = e.target;
        if (name === 'email') {
            setEmailVerification({ status: 'idle', message: '' });
            if (validationErrors.email) {
                setValidationErrors(prev => ({ ...prev, email: '' }));
            }
        }
        setFormData(prev => ({
            ...prev,
            Bio: { ...prev.Bio, [name]: value },
        }));
    };

    const verifyEmail = async () => {
        // ... (this function is unchanged)
        if (!/\S+@\S+\.\S+/.test(formData.Bio.email)) {
            setEmailVerification({ status: 'error', message: 'Please enter a valid email format.' });
            return;
        }
        setEmailVerification({ status: 'verifying', message: '' });
        try {
            const response = await axios.post('http://localhost:3000/api/v1/verify-email', { email: formData.Bio.email });
            setEmailVerification({ status: 'verified', message: response.data.message });
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Could not verify email. Please try again.';
            setEmailVerification({ status: 'error', message: errorMessage });
        }
    };

    const handleNext = async () => {
        // --- CHANGE 2: Add password check before API call ---
        if (step === 1) {
            if (!formData.password.trim()) {
                setValidationErrors(prev => ({ ...prev, password: 'Password is required.' }));
                return; // Stop the function here
            }
            if (!formData.username.trim()) {
                setValidationErrors(prev => ({ ...prev, username: 'Username is required.' }));
                return; // Stop the function here
            }
        }
        
        setIsChecking(true);
        try {
            if (step === 1) {
                await axios.post('http://localhost:3000/api/v1/check-username', { username: formData.username });
                setStep(2);
            } else if (step === 2) {
                if (emailVerification.status !== 'verified') {
                    setValidationErrors(prev => ({ ...prev, email: 'Please verify your email address first.' }));
                    return;
                }
                await axios.post('http://localhost:3000/api/v1/check-email', { email: formData.Bio.email });
                setStep(3);
            }
        } catch (err) {
            const message = err.response?.data?.message || 'An error occurred.';
            if (step === 1) {
                setValidationErrors(prev => ({ ...prev, username: message }));
            } else if (step === 2) {
                setValidationErrors(prev => ({ ...prev, email: message }));
            }
        } finally {
            setIsChecking(false);
        }
    };

    // ... (other functions are unchanged)
    const handleBack = () => setStep(prev => prev - 1);
    const handleSubmit = async (e) => { e.preventDefault(); setError(''); setIsLoading(true); const finalData = { username: formData.username, password: formData.password, Bio: [{ firstname: formData.Bio.firstname, lastname: formData.Bio.lastname, email: formData.Bio.email, skills: formData.Bio.skills, }], Avatar: formData.Avatar }; try { const response = await axios.post("http://localhost:3000/api/v1/signup", finalData); localStorage.setItem("token", response.data.token); navigate("/dashboard"); } catch (err) { if (err.response && err.response.data && err.response.data.message) { setError(err.response.data.message); } else { setError("An unexpected error occurred during signup."); } } finally { setIsLoading(false); }};
    const handleAddSkill = (e) => { e.preventDefault(); const newSkill = skillInput.trim(); if (newSkill && !formData.Bio.skills.includes(newSkill)) { setFormData(prev => ({...prev, Bio: { ...prev.Bio, skills: [...prev.Bio.skills, newSkill] } })); setSkillInput(''); }};
    const handleRemoveSkill = (skillToRemove) => { setFormData(prev => ({ ...prev, Bio: { ...prev.Bio, skills: prev.Bio.skills.filter(skill => skill !== skillToRemove) } })); };
    const renderInput = (name, type, placeholder, value, onChange, isBio = false) => ( <div className="relative"> <input type={type} name={name} value={value} onChange={isBio ? handleBioChange : handleInputChange} onFocus={() => setFocusedField(name)} onBlur={() => setFocusedField('')} className={`w-full px-4 py-3 bg-gray-800/50 border rounded-xl text-white placeholder-gray-500 transition-all duration-300 focus:outline-none ${ focusedField === name ? 'border-blue-500 shadow-lg shadow-blue-500/20 bg-gray-750' : 'border-gray-700 hover:border-gray-600' }`} placeholder={placeholder} required /> </div> );

    return (
        <div className="flex items-center justify-center min-h-screen bg-black relative overflow-hidden">
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-40 -left-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
                <div className="absolute -bottom-40 left-20 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
            </div>

            <div className="relative z-10 bg-black/40 border border-gray-800 p-8 rounded-2xl shadow-2xl w-[26rem] backdrop-blur-lg animate-slideUp">
                <div className="text-center mb-6">
                    <h2 className="text-3xl font-light text-white mb-2 animate-fadeIn">Join Dev Hub</h2>
                    <p className="text-gray-400 text-sm animate-fadeIn animation-delay-500">Connect with developers worldwide</p>
                </div>
                <div className="flex justify-center items-center space-x-4 mb-8">
                    {[1, 2, 3].map(s => (
                        <div key={s} className="flex items-center">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold transition-all duration-300 ${step >= s ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-400'}`}>
                                {s}
                            </div>
                            {s < 3 && <div className={`w-12 h-1 transition-colors duration-300 ${step > s ? 'bg-blue-600' : 'bg-gray-700'}`}></div>}
                        </div>
                    ))}
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {step === 1 && (
                        <div className="space-y-6 animate-fadeIn">
                            <div>
                                {renderInput('username', 'text', 'Enter your username', formData.username, handleInputChange)}
                                {validationErrors.username && (
                                    <p className="text-xs mt-2 pl-1 text-red-400">{validationErrors.username}</p>
                                )}
                            </div>
                            {/* --- CHANGE 3: Add div and error message for password --- */}
                            <div>
                                {renderInput('password', 'password', 'Create a strong password', formData.password, handleInputChange)}
                                {validationErrors.password && (
                                    <p className="text-xs mt-2 pl-1 text-red-400">{validationErrors.password}</p>
                                )}
                            </div>
                        </div>
                    )}
                    
                    {/* ... (The rest of the component JSX is unchanged) ... */}
                    {step === 2 && ( <div className="space-y-6 animate-fadeIn"> {renderInput('firstname', 'text', 'First Name', formData.Bio.firstname, handleBioChange, true)} {renderInput('lastname', 'text', 'Last Name', formData.Bio.lastname, handleBioChange, true)} <div> <div className="relative"> <input type="email" name="email" value={formData.Bio.email} onChange={handleBioChange} onFocus={() => setFocusedField('email')} onBlur={() => { setFocusedField(''); if (formData.Bio.email) verifyEmail(); }} className={`w-full px-4 py-3 bg-gray-800/50 border rounded-xl text-white placeholder-gray-500 transition-all duration-300 focus:outline-none ${ focusedField === 'email' ? 'border-blue-500 shadow-lg shadow-blue-500/20 bg-gray-750' : 'border-gray-700 hover:border-gray-600' }`} placeholder="your@email.com" required /> {emailVerification.status === 'verifying' && <div className="absolute right-3 top-1/2 -translate-y-1/2"><div className="w-5 h-5 border-2 border-t-transparent border-blue-400 rounded-full animate-spin"></div></div>} {emailVerification.status === 'verified' && <div className="absolute right-3 top-1/2 -translate-y-1/2 text-green-400"><svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg></div>} {emailVerification.status === 'error' && <div className="absolute right-3 top-1/2 -translate-y-1/2 text-red-400"><svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg></div>} </div> {emailVerification.message && <p className={`text-xs mt-2 pl-1 ${emailVerification.status === 'error' ? 'text-red-400' : 'text-green-400'}`}>{emailVerification.message}</p>} {validationErrors.email && ( <p className="text-xs mt-2 pl-1 text-red-400">{validationErrors.email}</p> )} </div> </div> )}
                    {step === 3 && ( <div className="space-y-6 animate-fadeIn"> {renderInput('Avatar', 'text', 'Avatar URL (e.g., https://...)', formData.Avatar, handleInputChange)} <div> <label className="block text-gray-300 mb-2 text-sm font-medium">Skills</label> <div className="flex items-center gap-2"> <input type="text" value={skillInput} onChange={(e) => setSkillInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleAddSkill(e)} className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500" placeholder="React, Node.js, Rust, etc" /> <button onClick={handleAddSkill} type="button" className="bg-blue-600 text-white px-4 py-3 rounded-xl hover:bg-blue-700 transition-colors">Add</button> </div> <div className="flex flex-wrap gap-2 mt-3"> {formData.Bio.skills.map((skill, index) => ( <div key={index} className="bg-gray-700 text-gray-200 text-sm px-3 py-1 rounded-full flex items-center gap-2"> {skill} <button onClick={() => handleRemoveSkill(skill)} type="button" className="text-gray-400 hover:text-white">&times;</button> </div> ))} </div> </div> </div> )}
                    {error && ( <div className="text-center text-sm text-red-400 bg-red-500/10 p-3 mt-4 rounded-lg border border-red-500/30"> {error} </div> )}
                    <div className="flex gap-4 pt-4"> {step > 1 && <button type="button" onClick={handleBack} className="w-full bg-gray-700 text-white px-6 py-3 rounded-xl hover:bg-gray-600 transition-all duration-300 font-medium">Back</button>} {step < 3 ? ( <button type="button" onClick={handleNext} disabled={isChecking || (step === 2 && emailVerification.status !== 'verified')} className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100" > {isChecking ? 'Checking...' : 'Next'} </button> ) : ( <button type="submit" disabled={isLoading} className="w-full bg-gradient-to-r from-green-500 to-teal-500 text-white px-6 py-3 rounded-xl hover:from-green-600 hover:to-teal-600 transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-green-500/25 font-medium disabled:opacity-50 disabled:cursor-not-allowed"> {isLoading ? 'Creating Account...' : 'Create Account'} </button> )} </div>
                </form>

                <div className="mt-6 text-center animate-fadeIn animation-delay-1500">
                    <p className="text-gray-400 text-sm">
                        Already have an account? 
                        <button onClick={() => navigate('/signin')} className="text-blue-400 hover:text-blue-300 ml-1 transition-colors duration-300 font-medium">
                            Sign In
                        </button>
                    </p>
                </div>
            </div>
            
            <style jsx>{`
                @keyframes blob { 0% { transform: translate(0px, 0px) scale(1); } 33% { transform: ..(30px, -50px) scale(1.1); } 66% { transform: translate(-20px, 20px) scale(0.9); } 100% { transform: translate(0px, 0px) scale(1); } }
                @keyframes slideUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
                @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
                .animate-blob { animation: blob 7s infinite; }
                .animate-slideUp { animation: slideUp 0.8s ease-out; }
                .animate-fadeIn { animation: fadeIn 0.5s ease-out forwards; opacity: 0; }
                .animation-delay-500 { animation-delay: 0.5s; }
                .animation-delay-1500 { animation-delay: 1.5s; }
                .animation-delay-2000 { animation-delay: 2s; }
                .animation-delay-4000 { animation-delay: 4s; }
            `}</style>
        </div>
    );
};