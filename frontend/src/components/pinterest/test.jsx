    import React from 'react'; 
    import axios from 'axios';
    import { getAuthHeaders } from '../../utils/auth';
    import { useState, useEffect } from 'react';
    const Test = () => {
        const [image1, setImage1] = useState(null);
        const [image2, setImage2] = useState(null);
        const [loading, setLoading] = useState(false);
        const [error, setError] = useState(null);
        const apiUrl = import.meta.env.VITE_BACKEND_URL;
        const testImage = async () => {
            setLoading(true);
            const formData = new FormData();
            formData.append('image1', image1);
            formData.append('image2', image2);
            try {
                const response = await axios.post(`${apiUrl}/pinterestgenerate/apply`, formData, {
                    // headers: getAuthHeaders()
                    credentials: 'include',
                });
                const data = await response.data;
                console.log(data);
            } catch (error) {
                setError(error);
            } finally {
                setLoading(false);
            }
        }
        useEffect(() => {
            testImage();
        }, []);
        useEffect(() => {
            setImage1('https://i.pinimg.com/736x/03/1a/cc/031acc2b5c77bd10dd6bd80621580d03.jpg')
            setImage2('https://res.cloudinary.com/dvxvgmhyg/image/upload/v1763003811/images/mcmj09ezsfskbqbctuhe.jpg')
        }, []);
        
        
        return (
            <div>
                <h1>Test Image</h1>
                {loading && <p>Loading...</p>}
                {error && <p>Error: {error.message}</p>}
                {image1 && <img src={image1} alt="Image 1" />}
                {image2 && <img src={image2} alt="Image 2" />}
            </div>
        )
    };

    export default Test;