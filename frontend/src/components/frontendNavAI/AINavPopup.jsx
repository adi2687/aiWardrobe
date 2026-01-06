import React, { useState } from 'react';
import { getGeminiSuggestion } from '../../utils/gemini';
import context from './context.json';
import { useNavigate } from 'react-router-dom';
import { FaRobot, FaPaperPlane, FaTimes, FaSpinner } from 'react-icons/fa';
import './AINavPopup.css';

const AINavPopup = ({ isOpen, onClose }) => {
    const [loading, setLoading] = useState(false);
    const [response, setResponse] = useState('');
    const [error, setError] = useState('');
    const [question, setQuestion] = useState('');
    const navigate = useNavigate();

    // Close on Escape key
    React.useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape' && isOpen) {
                onClose();
            }
        };
        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, [isOpen, onClose]);

    // Reset state when modal closes
    React.useEffect(() => {
        if (!isOpen) {
            setQuestion('');
            setResponse('');
            setError('');
        }
    }, [isOpen]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!question.trim()) {
            setError('Please enter a question');
            return;
        }
        await aicall(question);
    };

    const aicall = async (prompt, options = {}) => {
        try {
            setLoading(true);
            setError('');
            setResponse('');
            
            // Build natural language prompt with route mappings
            const routeMappings = Object.entries(context.routes || {})
                .map(([path, keywords]) => `Path: ${path} - Keywords: ${keywords.join(', ')}`)
                .join('\n');
            
            const enhancedPrompt = `You are a navigation assistant. The user said: "${prompt}"

Available routes and their keywords:
${routeMappings}

Based on the user's request, return ONLY the matching path (e.g., "/wardrobe"). If no match, return "/".`;
            
            // Call Gemini API
            const result = await getGeminiSuggestion(enhancedPrompt, options);
            console.log("AI Navigation result:", result);
            
            // Extract path from response (clean it up)
            let cleanPath = result.trim()
                .replace(/['"]/g, '')
                .split('\n')[0]
                .trim()
                .split(' ')[0]; // Take first word/path
            
            // Remove any markdown or extra text
            cleanPath = cleanPath.replace(/[^\w\/\-:]/g, '');
            
            // If path doesn't start with /, try to find it in context
            if (!cleanPath.startsWith('/')) {
                // Try to find matching route by keyword
                for (const [path, keywords] of Object.entries(context.routes || {})) {
                    const lowerPrompt = prompt.toLowerCase();
                    if (keywords.some(keyword => lowerPrompt.includes(keyword.toLowerCase()))) {
                        cleanPath = path;
                        break;
                    }
                }
            }
            
            // Validate path exists in context
            const allRoutes = Object.keys(context.routes || {});
            
            const isValidPath = allRoutes.includes(cleanPath) || 
                               allRoutes.some(route => cleanPath.startsWith(route.split(':')[0]));
            
            if (isValidPath) {
                setResponse(`Navigating to: ${cleanPath}`);
                setTimeout(() => {
                    navigate(cleanPath);
                    onClose(); // Close modal after navigation
                }, 1000);
            } else {
                setError(`Invalid path: ${cleanPath}. Please try rephrasing your question.`);
            }
            
            return result;
        } catch (err) {
            const errorMessage = err.message || 'Failed to get AI response';
            setError(errorMessage);
            console.error('Gemini API error:', err);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    // Handle Enter key press
    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !loading) {
            handleSubmit(e);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="ai-nav-popup-overlay" onClick={onClose}>
            <div className="ai-nav-popup-content" onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div className="ai-nav-popup-header">
                    <div className="ai-nav-popup-title">
                        <FaRobot className="ai-nav-popup-icon" />
                        <h2>AI Navigation Assistant</h2>
                    </div>
                    <button 
                        className="ai-nav-popup-close" 
                        onClick={onClose}
                        aria-label="Close"
                    >
                        <FaTimes />
                    </button>
                </div>

                {/* Body */}
                <div className="ai-nav-popup-body">
                    <p className="ai-nav-popup-description">
                        Ask me where you want to go, and I'll take you there!
                    </p>

                    <form onSubmit={handleSubmit} className="ai-nav-popup-form">
                        <input
                            type="text"
                            className="ai-nav-popup-input"
                            placeholder="e.g., 'Take me to my wardrobe' or 'Show me the shop'"
                            value={question}
                            onChange={(e) => {
                                setQuestion(e.target.value);
                                setError('');
                            }}
                            onKeyPress={handleKeyPress}
                            disabled={loading}
                            autoFocus
                        />

                        <button
                            type="submit"
                            className="ai-nav-popup-button"
                            disabled={loading || !question.trim()}
                        >
                            {loading ? (
                                <>
                                    <FaSpinner className="ai-nav-spinner" />
                                    <span>Navigating...</span>
                                </>
                            ) : (
                                <>
                                    <FaPaperPlane />
                                    <span>Let's Go!</span>
                                </>
                            )}
                        </button>
                    </form>

                    {error && (
                        <div className="ai-nav-popup-error">
                            <strong>Error:</strong> {error}
                        </div>
                    )}

                    {response && !error && (
                        <div className="ai-nav-popup-response">
                            <p>{response}</p>
                        </div>
                    )}
                </div>

                {/* Footer with quick suggestions */}
                <div className="ai-nav-popup-footer">
                    <p className="ai-nav-quick-suggestions-label">Quick suggestions:</p>
                    <div className="ai-nav-quick-suggestions">
                        {['Wardrobe', 'Shop', 'Profile', 'Recommendations'].map((suggestion) => (
                            <button
                                key={suggestion}
                                className="ai-nav-quick-btn"
                                onClick={() => {
                                    setQuestion(`Take me to ${suggestion.toLowerCase()}`);
                                }}
                                disabled={loading}
                            >
                                {suggestion}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AINavPopup;

