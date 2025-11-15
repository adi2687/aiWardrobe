import InfiniteMenu from './menu'
import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUser } from 'react-icons/fa';
import { getAuthHeaders } from '../../utils/auth';
import './export.css'; 

const Export = ({
    
}) => {
    const navigate = useNavigate();
    const [items,setItems] = useState([]);
    const [loading,setLoading] = useState(true);
    const [isUserAuthenticated, setIsUserAuthenticated] = useState(null); // null = checking, true/false = result
    const [error, setError] = useState(null);
    const apiurl = import.meta.env.VITE_BACKEND_URL;

    // Check authentication status
    useEffect(() => {
        const checkAuth = async () => {
            try {
                const response = await fetch(`${apiurl}/user/profile`, {
                    method: "GET",
                    headers: getAuthHeaders(),
                    credentials: "include",
                });
                const data = await response.json();
                if (response.ok && (data.message === "Success" || data.user)) {
                    setIsUserAuthenticated(true);
                } else {
                    setIsUserAuthenticated(false);
                }
            } catch (error) {
                console.error("Error checking authentication:", error);
                setIsUserAuthenticated(false);
            }
        };
        checkAuth();
    }, [apiurl]);

    const getfromapi = useCallback(async ()=>{
        try {
            const response = await fetch(`${apiurl}/menuimages`, { 
                method: 'GET',
                headers: getAuthHeaders(),
                credentials: 'include',
            });
            
            if (!response.ok) {
                if (response.status === 401) {
                    setIsUserAuthenticated(false);
                    setError("Authentication required");
                    return;
                }
                throw new Error("Failed to fetch menu images");
            }
            
            const data = await response.json();
            console.log(data.randoms)
            const setimages=data.randoms.map((item)=>{
                return {
                    image: item.image || item.generatedurl,
                    link: item.generatedurl || item.image,
                    // title: 'Menu Image',
                    // description: 'This is a menu image'
                }
            })
            setItems(setimages);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching menu images:", error);
            setError(error.message || "Failed to load menu images");
            setLoading(false);
        }
    }, [apiurl]);
    
    useEffect(()=>{
        // Only fetch menu images if user is authenticated
        if (isUserAuthenticated === true) {
            getfromapi();
        } else if (isUserAuthenticated === false) {
            setLoading(false);
        }
    }, [isUserAuthenticated, getfromapi]); 

    // const itemstemp = [
    //     {
    //       image: 'https://res.cloudinary.com/dvxvgmhyg/image/upload/v1749127379/images/fu0imlsdm5sum455funh.webp',
    //       link: 'https://google.com/',
    //       title: 'Item 1',
    //       description: 'This is pretty cool, right?'
    //     }
        
    //   ];
    // Show loading state while checking authentication
    if (isUserAuthenticated === null || loading) {
        return (
            <div className="export-container"> 
                <div className="export-loading">
                    <div className="export-loading-text">
                        <div className="export-loading-spinner"></div>
                        Loading...
                    </div>
                </div>
            </div>
        );
    }

    // Show login prompt if not authenticated
    if (isUserAuthenticated === false) {
        return (
            <div className="export-container">
                <div className="export-auth-required">
                    <FaUser className="export-auth-icon" />
                    <h2>Authentication Required</h2>
                    <p>You need to be logged in to view your looks.</p>
                    <div className="export-auth-buttons">
                        <button 
                            className="export-auth-btn primary" 
                            onClick={() => navigate('/auth')}
                        >
                            Log In
                        </button>
                        <button 
                            className="export-auth-btn secondary" 
                            onClick={() => {
                                navigate('/auth');
                                localStorage.setItem('showSignup', 'true');
                            }}
                        >
                            Sign Up
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Show error state if there was an error fetching images
    if (error) {
        return (
            <div className="export-container">
                <div className="export-error">
                    <h2>Error Loading Images</h2>
                    <p>{error}</p>
                    <button 
                        className="export-retry-btn" 
                        onClick={() => {
                            setError(null);
                            setLoading(true);
                            getfromapi();
                        }}
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="export-container"> 
            <div className="export-content">
                <InfiniteMenu items={items} />
            </div>
        </div>
    )
}
export default Export;