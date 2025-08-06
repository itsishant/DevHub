import axios from 'axios';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export const Signup = () => {
    // State to manage which step of the form we are on
    const [step, setStep] = useState(1);

    // A single state object to hold all form data, structured like the schema
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        Bio: {
            firstname: '',
            lastname: '',
            email: '',
            phone: '',
            skills: [], // Skills will be an array of strings
        },
        Avatar: '',
    });

    const navigate = useNavigate();  
    
    // State for the temporary skill input
    const [skillInput, setSkillInput] = useState('');
    const [focusedField, setFocusedField] = useState('');

    // General handler for top-level fields (username, password, Avatar)
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value,
        }));
    };
    
    // Specific handler for nested Bio fields
    const handleBioChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            Bio: {
                ...prev.Bio,
                [name]: value,
            },
        }));
    };

    const handleAddSkill = (e) => {
        // Prevent form submission if user presses Enter
        e.preventDefault();
        const newSkill = skillInput.trim();
        // Add skill if it's not empty and not already in the list
        if (newSkill && !formData.Bio.skills.includes(newSkill)) {
            setFormData(prev => ({
                ...prev,
                Bio: {
                    ...prev.Bio,
                    skills: [...prev.Bio.skills, newSkill],
                },
            }));
            setSkillInput(''); // Clear the input field
        }
    };

    const handleRemoveSkill = (skillToRemove) => {
        setFormData(prev => ({
            ...prev,
            Bio: {
                ...prev.Bio,
                skills: prev.Bio.skills.filter(skill => skill !== skillToRemove),
            },
        }));
    };

    const handleNext = () => {
        // Here you could add validation for the current step's fields
        setStep(prev => prev + 1);
    };

    const handleBack = () => {
        setStep(prev => prev - 1);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Before submitting, we structure the data to perfectly match the Mongoose schema.
        // The schema expects Bio to be an array of objects.
        const finalData = {
            username: formData.username,
            password: formData.password,
            Bio: [{
                firstname: formData.Bio.firstname,
                lastname: formData.Bio.lastname,
                email: formData.Bio.email,
                // Ensure phone is sent as a number if the input is not empty
                phone: formData.Bio.phone ? Number(formData.Bio.phone) : null,
                skills: formData.Bio.skills,
            }],
            Avatar: formData.Avatar
        };

        console.log('Final form data ready for API:', finalData);
        const response = await axios.post("http://localhost:3000/api/v1/signup", finalData);
        console.log("Response from signup API:", response.data);
        // Here you would typically make an API call to your backend, e.g.,
        // axios.post('/api/users/signup', finalData)
        //  .then(response => console.log('Success:', response))
        //  .catch(error => console.error('Error:', error));
    };

    // Helper to render input fields consistently
    const renderInput = (name, type, placeholder, value, onChange, isBio = false) => (
        
        <div className="relative">
            <input 
                type={type}
                name={name}
                value={value}
                onChange={isBio ? handleBioChange : handleInputChange}
                onFocus={() => setFocusedField(name)}
                onBlur={() => setFocusedField('')}
                className={`w-full px-4 py-3 bg-gray-800/50 border rounded-xl text-white placeholder-gray-500 transition-all duration-300 focus:outline-none ${
                    focusedField === name 
                        ? 'border-blue-500 shadow-lg shadow-blue-500/20 bg-gray-750' 
                        : 'border-gray-700 hover:border-gray-600'
                }`}
                placeholder={placeholder}
                required
            />
        </div>
    );
    
    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-950 relative overflow-hidden">
            {/* Animated Background Elements */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-40 -left-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
                <div className="absolute -bottom-40 left-20 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
            </div>

            {/* Signup Form */}
            <div className="relative z-10 bg-black/40 border border-gray-800 p-8 rounded-2xl shadow-2xl w-[26rem] backdrop-blur-lg animate-slideUp">
                <div className="text-center mb-6">
                    <h2 className="text-3xl font-light text-white mb-2 animate-fadeIn">Join Dev Hub</h2>
                    <p className="text-gray-400 text-sm animate-fadeIn animation-delay-500">Connect with developers worldwide</p>
                </div>

                {/* Progress Bar */}
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
                    {/* Step 1: Credentials */}
                    {step === 1 && (
                        <div className="space-y-6 animate-fadeIn">
                            <div>
                                <label className="block text-gray-300 mb-2 text-sm font-medium">Username</label>
                                {renderInput('username', 'text', 'Enter your username', formData.username, handleInputChange)}
                            </div>
                            <div>
                                <label className="block text-gray-300 mb-2 text-sm font-medium">Password</label>
                                {renderInput('password', 'password', 'Create a strong password', formData.password, handleInputChange)}
                            </div>
                        </div>
                    )}

                    {/* Step 2: Personal Info */}
                    {step === 2 && (
                        <div className="space-y-6 animate-fadeIn">
                            <div>
                                <label className="block text-gray-300 mb-2 text-sm font-medium">First Name</label>
                                {renderInput('firstname', 'text', 'Jane', formData.Bio.firstname, handleBioChange, true)}
                            </div>
                             <div>
                                <label className="block text-gray-300 mb-2 text-sm font-medium">Last Name</label>
                                {renderInput('lastname', 'text', 'Doe', formData.Bio.lastname, handleBioChange, true)}
                            </div>
                            <div>
                                <label className="block text-gray-300 mb-2 text-sm font-medium">Email</label>
                                {renderInput('email', 'email', 'your@email.com', formData.Bio.email, handleBioChange, true)}
                            </div>
                             <div>
                                <label className="block text-gray-300 mb-2 text-sm font-medium">Phone</label>
                                {renderInput('phone', 'tel', '1234567890', formData.Bio.phone, handleBioChange, true)}
                            </div>
                        </div>
                    )}

                    {/* Step 3: Profile Details */}
                    {step === 3 && (
                        <div className="space-y-6 animate-fadeIn">
                            <div>
                                <label className="block text-gray-300 mb-2 text-sm font-medium">Avatar URL</label>
                                {renderInput('Avatar', 'text', 'https://...', formData.Avatar, handleInputChange)}
                            </div>
                             <div>
                                <label className="block text-gray-300 mb-2 text-sm font-medium">Skills</label>
                                <div className="flex items-center gap-2">
                                     <input 
                                        type="text"
                                        value={skillInput}
                                        onChange={(e) => setSkillInput(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleAddSkill(e)}
                                        className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                                        placeholder="e.g., React, Node.js, CSS"
                                    />
                                    <button onClick={handleAddSkill} type="button" className="bg-blue-600 text-white px-4 py-3 rounded-xl hover:bg-blue-700 transition-colors">Add</button>
                                </div>
                                <div className="flex flex-wrap gap-2 mt-3">
                                    {formData.Bio.skills.map((skill, index) => (
                                        <div key={index} className="bg-gray-700 text-gray-200 text-sm px-3 py-1 rounded-full flex items-center gap-2">
                                            {skill}
                                            <button onClick={() => handleRemoveSkill(skill)} type="button" className="text-gray-400 hover:text-white">&times;</button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Navigation Buttons */}
                    <div className="flex gap-4 pt-4">
                        {step > 1 && (
                            <button 
                                type="button" 
                                onClick={handleBack}
                                className="w-full bg-gray-700 text-white px-6 py-3 rounded-xl hover:bg-gray-600 transition-all duration-300 font-medium"
                            >
                                Back
                            </button>
                        )}
                        {step < 3 ? (
                            <button 
                                type="button" 
                                onClick={handleNext}
                                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105"
                            >
                                Next
                            </button>
                        ) : (
                            <button 
                            onClick={handleSubmit}                            
                                type="submit" 
                                className="w-full bg-gradient-to-r from-green-500 to-teal-500 text-white px-6 py-3 rounded-xl hover:from-green-600 hover:to-teal-600 transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-green-500/25 font-medium"
                            >
                                Create Account
                            </button>
                        )}
                    </div>
                </form>

                <div className="mt-6 text-center animate-fadeIn animation-delay-1500">
                    <p className="text-gray-400 text-sm">
                        Already have an account? 
                        <button onClick={() => {
                            navigate('/signin');
                        }} className="text-blue-400 hover:text-blue-300 ml-1 transition-colors duration-300 font-medium">
                            Sign In
                        </button>
                    </p>
                </div>
            </div>

            <style jsx>{`
                /* Your existing keyframes and animation classes are great, no changes needed here */
                @keyframes blob {
                    0% { transform: translate(0px, 0px) scale(1); }
                    33% { transform: translate(30px, -50px) scale(1.1); }
                    66% { transform: translate(-20px, 20px) scale(0.9); }
                    100% { transform: translate(0px, 0px) scale(1); }
                }
                
                @keyframes slideUp {
                    from { opacity: 0; transform: translateY(30px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }

                .animate-blob { animation: blob 7s infinite; }
                .animate-slideUp { animation: slideUp 0.8s ease-out; }
                .animate-fadeIn { animation: fadeIn 0.5s ease-out forwards; opacity: 0; }
                .animation-delay-500 { animation-delay: 0.5s; }
                .animation-delay-2000 { animation-delay: 2s; }
                .animation-delay-4000 { animation-delay: 4s; }
            `}</style>
        </div>
    );
};