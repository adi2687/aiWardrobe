import React from 'react';
import { useState, useEffect } from 'react';
import { getGeminiSuggestion } from '../../utils/gemini';
import context from './context.json'
import { useNavigate } from 'react-router-dom';
const Nav = () => {
    const [loading, setLoading] = useState(false);
    const [response, setResponse] = useState('');
    const [error, setError] = useState('');
    const [question, setQuestion] = useState('');

    const navigate= useNavigate()
    const aicall = async (prompt, options = {}) => {
        try {
            setLoading(true);
            setError('');
            setResponse('');
            prompt+=JSON.stringify(context) 
            prompt+="\n this is the route and the question of the user give me a path from above routes and context"
            // Call Gemini API
            const result = await getGeminiSuggestion(prompt, options);
            console.log("result is ",result)
            navigate(result);
            setResponse(result);
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

    /**
     * Example: Get weekly outfit suggestions
     */
    



    // Example usage on component mount (optional)
    useEffect(() => {
        // You can call the function here if needed
        // aicall("What should I wear today?");
    }, []);

    return (
        <div>
            <h1>Nav</h1>
            <input type="text" placeholder='Enter your question' onChange={(e) => setQuestion(e.target.value)} />
            {/* Example UI for testing */}
            {question}
            <div style={{ marginTop: '20px' }}>
                <button
                    onClick={()=>aicall(question)}
                    disabled={loading}
                    style={{ marginLeft: '10px' }}
                >
                    {loading ? 'Loading...' : 'Lets go'}
                </button>
            </div>
            {response && (
                <div style={{ marginTop: '20px' }}>
                    <p>{response}</p>
                </div>
            )}
            {error && (
                <div style={{ color: 'red', marginTop: '10px' }}>
                    Error: {error}
                </div>
            )}


        </div>
    );
};

export default Nav;