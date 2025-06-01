import React, { useEffect, useRef, useState } from 'react';
import * as poseDetection from '@tensorflow-models/pose-detection';
import '@tensorflow/tfjs-backend-webgl';
import * as tf from '@tensorflow/tfjs';
import { FaUpload, FaTshirt, FaMagic, FaSave, FaUndo, FaExchangeAlt } from 'react-icons/fa';

const ClothingMapper = () => {
  // State for the first image (person)
  const [personImage, setPersonImage] = useState(null);
  const [personKeypoints, setPersonKeypoints] = useState([]);
  
  // State for the second image (clothing)
  const [clothingImage, setClothingImage] = useState(null);
  const [clothingKeypoints, setClothingKeypoints] = useState([]);
  
  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [activeImage, setActiveImage] = useState('person'); // 'person' or 'clothing'
  const [showMapping, setShowMapping] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  
  // Refs
  const personCanvasRef = useRef(null);
  const clothingCanvasRef = useRef(null);
  const mappingCanvasRef = useRef(null);
  const personInputRef = useRef(null);
  const clothingInputRef = useRef(null);
  
  const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

  // Check authentication status
  useEffect(() => {
    fetch(`${backendUrl}/user/profile`, {
      method: 'GET',
      credentials: 'include',
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.message === 'Success') {
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
        }
      })
      .catch(() => setIsAuthenticated(false));
  }, [backendUrl]);

  const handleImageUpload = (e, imageType) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const img = new Image();
        img.onload = () => {
          const imageData = {
            src: img.src,
            width: img.width,
            height: img.height
          };
          
          if (imageType === 'person') {
            setPersonImage(imageData);
            setPersonKeypoints([]);
          } else {
            setClothingImage(imageData);
            setClothingKeypoints([]);
          }
          
          setShowMapping(false);
          setMessage(`${imageType === 'person' ? 'Person' : 'Clothing'} image uploaded successfully!`);
        };
        img.src = reader.result;
      };
      reader.readAsDataURL(file);
    }
  };

  const detectPose = async (imageType) => {
    const image = imageType === 'person' ? personImage : clothingImage;
    
    if (!image) {
      setMessage(`Please upload a ${imageType} image first`);
      return;
    }
    
    setIsLoading(true);
    setMessage(`Detecting pose on ${imageType} image...`);
    
    try {
      // Ensure TensorFlow.js is ready
      await tf.ready();
      
      // Set backend to 'webgl' explicitly
      await tf.setBackend('webgl');
      
      // Load MoveNet
      const detector = await poseDetection.createDetector(
        poseDetection.SupportedModels.MoveNet,
        { modelType: poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING } // Use the faster lightning model
      );
      
      // Create a temporary image element for detection
      const img = new Image();
      img.src = image.src;
      
      // Ensure image is loaded
      await new Promise((resolve) => {
        if (img.complete) resolve();
        else img.onload = () => resolve();
      });
      
      // Estimate poses
      const poses = await detector.estimatePoses(img);
      console.log(`Detected poses for ${imageType}:`, poses);
      
      if (poses.length > 0) {
        if (imageType === 'person') {
          setPersonKeypoints(poses[0].keypoints);
        } else {
          setClothingKeypoints(poses[0].keypoints);
        }
        
        setMessage(`Pose detected successfully on ${imageType} image!`);
        
        // Draw keypoints on canvas
        drawCanvas(imageType, poses[0].keypoints);
      } else {
        setMessage(`No pose detected on ${imageType} image. Try another image.`);
      }
    } catch (error) {
      console.error(`Error detecting pose on ${imageType} image:`, error);
      setMessage(`Error detecting pose: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleToggleActiveImage = () => {
    setActiveImage(activeImage === 'person' ? 'clothing' : 'person');
  };
  
  const drawCanvas = (imageType, points) => {
    const canvasRef = imageType === 'person' ? personCanvasRef : clothingCanvasRef;
    const image = imageType === 'person' ? personImage : clothingImage;
    
    if (!canvasRef.current || !image) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Set canvas dimensions to match image
    canvas.width = image.width;
    canvas.height = image.height;
    
    // Draw the image
    const img = new Image();
    img.onload = () => {
      // Draw image
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      
      // Draw keypoints
      points.forEach(point => {
        if (point.score > 0.3) { // Only draw high-confidence points
          ctx.beginPath();
          ctx.arc(point.x, point.y, 5, 0, 2 * Math.PI);
          ctx.fillStyle = getColorForKeypoint(point.name);
          ctx.fill();
          
          // Add keypoint name
          ctx.fillStyle = 'white';
          ctx.font = '10px Arial';
          ctx.fillText(point.name, point.x + 8, point.y);
        }
      });
      
      // Draw skeleton
      drawBodySkeleton(ctx, points);
    };
    img.src = image.src;
  };
  
  const getColorForKeypoint = (name) => {
    const colors = {
      nose: 'red',
      left_eye: 'orange',
      right_eye: 'orange',
      left_ear: 'yellow',
      right_ear: 'yellow',
      left_shoulder: 'green',
      right_shoulder: 'green',
      left_elbow: 'blue',
      right_elbow: 'blue',
      left_wrist: 'purple',
      right_wrist: 'purple',
      left_hip: 'cyan',
      right_hip: 'cyan',
      left_knee: 'magenta',
      right_knee: 'magenta',
      left_ankle: 'lime',
      right_ankle: 'lime'
    };
    
    return colors[name] || 'white';
  };
  
  const drawBodySkeleton = (ctx, points) => {
    // Define connections between keypoints
    const connections = [
      ['nose', 'left_eye'],
      ['nose', 'right_eye'],
      ['left_eye', 'left_ear']
      ['right_eye', 'right_ear'],
      ['nose', 'left_shoulder'],
      ['nose', 'right_shoulder'],
      ['left_shoulder', 'right_shoulder'],
      ['left_shoulder', 'left_elbow'],
      ['right_shoulder', 'right_elbow'],
      ['left_elbow', 'left_wrist'],
      ['right_elbow', 'right_wrist'],
      ['left_shoulder', 'left_hip'],
      ['right_shoulder', 'right_hip'],
      ['left_hip', 'right_hip'],
      ['left_hip', 'left_knee'],
      ['right_hip', 'right_knee'],
      ['left_knee', 'left_ankle'],
      ['right_knee', 'right_ankle']
    ];
    
    // Draw connections
    connections.forEach(([p1Name, p2Name]) => {
      const p1 = points.find(p => p.name === p1Name);
      const p2 = points.find(p => p.name === p2Name);
      
      if (p1 && p2 && p1.score > 0.3 && p2.score > 0.3) {
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.lineWidth = 2;
        ctx.stroke();
      }
    });
  };
  
  // Function to draw the mapping between the two images
  const drawMapping = () => {
    if (!mappingCanvasRef.current || !personImage || !clothingImage || 
        personKeypoints.length === 0 || clothingKeypoints.length === 0) {
      setMessage('Both images need to have pose detection completed before mapping');
      return;
    }
    
    const canvas = mappingCanvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // Set canvas size to fit both images side by side
    const maxHeight = Math.max(personImage.height, clothingImage.height);
    canvas.width = personImage.width + clothingImage.width + 50; // Add some padding
    canvas.height = maxHeight;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw person image on the left
    const personImg = new Image();
    personImg.onload = () => {
      ctx.drawImage(personImg, 0, 0, personImage.width, personImage.height);
      
      // Draw clothing image on the right
      const clothingImg = new Image();
      clothingImg.onload = () => {
        const clothingX = personImage.width + 50; // Add padding
        ctx.drawImage(clothingImg, clothingX, 0, clothingImage.width, clothingImage.height);
        
        // Draw keypoints on both images
        drawKeypointsOnMapping(ctx, personKeypoints, 0, 0);
        drawKeypointsOnMapping(ctx, clothingKeypoints, clothingX, 0);
        
        // Draw connections between matching keypoints
        drawKeypointConnections(ctx, personKeypoints, clothingKeypoints, clothingX);
        
        setMessage('Mapping between images displayed successfully!');
        setShowMapping(true);
      };
      clothingImg.src = clothingImage.src;
    };
    personImg.src = personImage.src;
  };
  
  // Helper function to draw keypoints on the mapping canvas
  const drawKeypointsOnMapping = (ctx, points, offsetX, offsetY) => {
    points.forEach(point => {
      if (point.score > 0.3) {
        ctx.beginPath();
        ctx.arc(point.x + offsetX, point.y + offsetY, 5, 0, 2 * Math.PI);
        ctx.fillStyle = getColorForKeypoint(point.name);
        ctx.fill();
        
        // Add keypoint name
        ctx.fillStyle = 'white';
        ctx.font = '10px Arial';
        ctx.fillText(point.name, point.x + offsetX + 8, point.y + offsetY);
      }
    });
  };
  
  // Helper function to draw connections between matching keypoints
  const drawKeypointConnections = (ctx, personPoints, clothingPoints, clothingOffsetX) => {
    // Define which keypoints to connect (focus on upper body for clothing)
    const keypointsToConnect = [
      'left_shoulder',
      'right_shoulder',
      'left_elbow',
      'right_elbow',
      'left_wrist',
      'right_wrist',
      'nose'
    ];
    
    keypointsToConnect.forEach(keypointName => {
      const personPoint = personPoints.find(p => p.name === keypointName);
      const clothingPoint = clothingPoints.find(p => p.name === keypointName);
      
      if (personPoint && clothingPoint && personPoint.score > 0.3 && clothingPoint.score > 0.3) {
        ctx.beginPath();
        ctx.moveTo(personPoint.x, personPoint.y);
        ctx.lineTo(clothingPoint.x + clothingOffsetX, clothingPoint.y);
        ctx.strokeStyle = 'rgba(255, 255, 0, 0.7)'; // Yellow lines for connections
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]); // Dashed line
        ctx.stroke();
        ctx.setLineDash([]); // Reset to solid line
      }
    });
  };
  
  const overlayClothing = (ctx, points) => {
    // Find shoulder keypoints and neck keypoint
    const leftShoulder = points.find(p => p.name === 'left_shoulder');
    const rightShoulder = points.find(p => p.name === 'right_shoulder');
    
    if (!leftShoulder || !rightShoulder || leftShoulder.score < 0.3 || rightShoulder.score < 0.3) {
      setMessage('Cannot detect shoulders clearly. Try another image.');
      return;
    }
    
    if (!clothingImage || !clothingImage.src) {
      setMessage('Please upload a clothing item first');
      return;
    }
    
    // Calculate position & rotation
    const dx = rightShoulder.x - leftShoulder.x;
    const dy = rightShoulder.y - leftShoulder.y;
    const angle = Math.atan2(dy, dx);
    const shoulderWidth = Math.sqrt(dx * dx + dy * dy);
    const centerX = (leftShoulder.x + rightShoulder.x) / 2;
    const centerY = (leftShoulder.y + rightShoulder.y) / 2;
    
    // Draw the clothing with proper alignment
    const clothingImg = new Image();
    clothingImg.crossOrigin = 'Anonymous'; // Handle CORS issues
    
    clothingImg.onload = () => {
      console.log('Clothing image loaded, dimensions:', clothingImg.width, 'x', clothingImg.height);
      
      // Calculate scaling to fit the shoulders
      const scale = shoulderWidth * 1.5 / clothingImg.width;
      const jacketWidth = clothingImg.width * scale;
      const jacketHeight = clothingImg.height * scale;
      
      console.log('Drawing clothing with:', {
        centerX, centerY, angle, scale, jacketWidth, jacketHeight
      });
      
      // Draw the clothing with rotation
      ctx.save();
      ctx.translate(centerX, centerY - jacketHeight * 0.2); // Adjust vertical position
      ctx.rotate(angle);
      ctx.drawImage(clothingImg, -jacketWidth/2, -jacketHeight/3, jacketWidth, jacketHeight);
      ctx.restore();
      
      setMessage('Clothing overlay applied successfully!');
    };
    
    clothingImg.onerror = (err) => {
      console.error('Error loading clothing image:', err);
      setMessage('Error loading clothing image. Please try another image.');
    };
    
    console.log('Loading clothing image from:', clothingImage.src);
    clothingImg.src = clothingImage.src;
  };
  
  // Keep the advanced method commented out for future refinement
  /*
  const applyAffineTransformation = (ctx, leftShoulder, rightShoulder, nose) => {
    // Draw the clothing with advanced affine transformation
    const clothingImg = new Image();
    clothingImg.onload = () => {
      try {
        // Define source points on the clothing image (assume standard positions)
        // We'll use normalized coordinates for the clothing image
        // These represent where the shoulders and neck would be on a standard clothing item
        const clothingLeftShoulderX = clothingImg.width * 0.25;
        const clothingRightShoulderX = clothingImg.width * 0.75;
        const clothingShoulderY = clothingImg.height * 0.2;
        const clothingNeckX = clothingImg.width * 0.5;
        const clothingNeckY = clothingImg.height * 0.1;
        
        // Set up the matrix for affine transformation
        // We need at least 3 point correspondences to solve for the 6 parameters
        const M = [
          [clothingLeftShoulderX, clothingShoulderY, 1, 0, 0, 0],
          [0, 0, 0, clothingLeftShoulderX, clothingShoulderY, 1],
          [clothingRightShoulderX, clothingShoulderY, 1, 0, 0, 0],
          [0, 0, 0, clothingRightShoulderX, clothingShoulderY, 1],
          [clothingNeckX, clothingNeckY, 1, 0, 0, 0],
          [0, 0, 0, clothingNeckX, clothingNeckY, 1]
        ];
        
        // Target points from the detected pose
        const neckX = (leftShoulder.x + rightShoulder.x) / 2;
        const neckY = nose ? Math.min(leftShoulder.y, rightShoulder.y) - 20 : Math.min(leftShoulder.y, rightShoulder.y) - 20;
        
        // Target coordinates vector [x1', y1', x2', y2', x3', y3']
        const B = [
          leftShoulder.x, leftShoulder.y,
          rightShoulder.x, rightShoulder.y,
          neckX, neckY
        ];
        
        // Calculate transformation parameters using normal equations
        // (M^T * M) * X = M^T * B
        const MT = math.transpose(M);
        const MTM = math.multiply(MT, M);
        const MTB = math.multiply(MT, B);
        const X = math.lusolve(MTM, MTB);
        
        // Extract the transformation parameters
        const a = X[0][0]; // scale and rotation for x
        const b = X[1][0];
        const c = X[2][0]; // translation for x
        const d = X[3][0]; // scale and rotation for y
        const e = X[4][0];
        const f = X[5][0]; // translation for y
        
        // Log the transformation matrix for debugging
        console.log('Affine transformation matrix:');
        console.log(`[${a}, ${b}, ${c}]`);
        console.log(`[${d}, ${e}, ${f}]`);
        console.log(`[0, 0, 1]`);
        
        // Apply the transformation to draw the clothing
        ctx.save();
        
        // Apply the affine transformation directly
        ctx.transform(a, d, b, e, c, f);
        
        // Draw the clothing image at the origin (the transformation will place it correctly)
        ctx.drawImage(clothingImg, 0, 0, clothingImg.width, clothingImg.height);
        
        ctx.restore();
        
        setMessage('Clothing mapped with affine transformation!');
      } catch (error) {
        console.error('Error applying affine transformation:', error);
        setMessage(`Error mapping clothing: ${error.message}`);
      }
    };
    clothingImg.src = clothingImage.src;
  };
  */
  
  // Fallback method using simpler rotation and scaling
  const fallbackOverlayClothing = (ctx, leftShoulder, rightShoulder) => {
    // Calculate position & rotation
    const dx = rightShoulder.x - leftShoulder.x;
    const dy = rightShoulder.y - leftShoulder.y;
    const angle = Math.atan2(dy, dx);
    const shoulderWidth = Math.sqrt(dx * dx + dy * dy);
    const centerX = (leftShoulder.x + rightShoulder.x) / 2;
    const centerY = (leftShoulder.y + rightShoulder.y) / 2;
    
    // Draw the clothing with proper alignment
    const clothingImg = new Image();
    clothingImg.onload = () => {
      // Calculate scaling to fit the shoulders
      const scale = shoulderWidth * 1.5 / clothingImg.width;
      const jacketWidth = clothingImg.width * scale;
      const jacketHeight = clothingImg.height * scale;
      
      // Draw the clothing with rotation
      ctx.save();
      ctx.translate(centerX, centerY - jacketHeight * 0.2); // Adjust vertical position
      ctx.rotate(angle);
      ctx.drawImage(clothingImg, -jacketWidth/2, -jacketHeight/3, jacketWidth, jacketHeight);
      ctx.restore();
      
      setMessage('Clothing mapped with fallback method.');
    };
    clothingImg.src = clothingImage.src;
  };
  
  const handleTryOn = () => {
    if (!keypoints || keypoints.length === 0) {
      setMessage('Please detect pose first');
      return;
    }
    
    if (!clothingImage) {
      setMessage('Please upload a clothing item first');
      return;
    }
    
    setShowOverlay(true);
    drawCanvas(keypoints, true);
    setMessage('Clothing overlay applied!');
  };
  
  const handleReset = () => {
    setPersonImage(null);
    setPersonKeypoints([]);
    setClothingImage(null);
    setClothingKeypoints([]);
    setShowMapping(false);
    setActiveImage('person');
    setMessage('Reset successful. Upload new images to start over.');
    
    // Clear the canvases
    if (personCanvasRef.current) {
      const ctx = personCanvasRef.current.getContext('2d');
      ctx.clearRect(0, 0, personCanvasRef.current.width, personCanvasRef.current.height);
    }
    
    if (clothingCanvasRef.current) {
      const ctx = clothingCanvasRef.current.getContext('2d');
      ctx.clearRect(0, 0, clothingCanvasRef.current.width, clothingCanvasRef.current.height);
    }
    
    if (mappingCanvasRef.current) {
      const ctx = mappingCanvasRef.current.getContext('2d');
      ctx.clearRect(0, 0, mappingCanvasRef.current.width, mappingCanvasRef.current.height);
    }
  };
  
  const handleSaveMapping = () => {
    if (!mappingCanvasRef.current || !showMapping) {
      setMessage('No mapping result to save');
      return;
    }
    
    try {
      const dataUrl = mappingCanvasRef.current.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = 'virtual-try-on-mapping.png';
      link.href = dataUrl;
      link.click();
      setMessage('Mapping result saved successfully!');
    } catch (error) {
      console.error('Error saving mapping result:', error);
      setMessage('Failed to save mapping result. Please try again.');
    }
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '20px' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>Virtual Try-On</h2>
      
      {/* Status message */}
      {message && (
        <div style={{ 
          padding: '10px', 
          marginBottom: '15px', 
          backgroundColor: message.includes('Error') ? '#ffeded' : '#edfff5',
          borderRadius: '5px',
          textAlign: 'center'
        }}>
          {message}
        </div>
      )}
      
      {/* Loading indicator */}
      {isLoading && (
        <div style={{ textAlign: 'center', marginBottom: '15px' }}>
          <div style={{ 
            display: 'inline-block',
            width: '30px',
            height: '30px',
            border: '3px solid rgba(255, 255, 255, 0.3)',
            borderRadius: '50%',
            borderTopColor: '#3182ce',
            animation: 'spin 1s ease-in-out infinite'
          }}></div>
          <style>{`
            @keyframes spin {
              to { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      )}
      
      {/* Authentication check */}
      {isAuthenticated === false && (
        <div style={{
          padding: '20px',
          marginTop: '20px',
          backgroundColor: '#2d3748',
          borderRadius: '5px',
          textAlign: 'center',
          color: 'white'
        }}>
          <h3>Authentication Required</h3>
          <p>You need to be logged in to use the Virtual Try-On feature.</p>
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginTop: '15px' }}>
            <a href="/auth" style={{
              padding: '8px 16px',
              background: 'linear-gradient(to right, #4299e1, #805ad5)',
              borderRadius: '5px',
              color: 'white',
              textDecoration: 'none',
              fontWeight: 'bold'
            }}>Log In</a>
            <a href="/auth?signup=true" style={{
              padding: '8px 16px',
              background: 'linear-gradient(to right, #48bb78, #38b2ac)',
              borderRadius: '5px',
              color: 'white',
              textDecoration: 'none',
              fontWeight: 'bold'
            }}>Sign Up</a>
          </div>
        </div>
      )}
      
      {isAuthenticated && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
          {/* Left side - Canvas and image upload */}
          <div style={{ flex: '1', minWidth: '300px' }}>
            {/* Canvas for visualization */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div>
                <h3>Person Image</h3>
                <canvas
                  ref={personCanvasRef}
                  style={{
                    maxWidth: '100%',
                    height: 'auto',
                    display: 'block',
                    marginBottom: '10px',
                    border: '1px solid #ddd',
                    borderRadius: '5px',
                    backgroundColor: '#f8f8f8'
                  }}
                />
              </div>
              
              <div>
                <h3>Clothing Image</h3>
                <canvas
                  ref={clothingCanvasRef}
                  style={{
                    maxWidth: '100%',
                    height: 'auto',
                    display: 'block',
                    marginBottom: '10px',
                    border: '1px solid #ddd',
                    borderRadius: '5px',
                    backgroundColor: '#f8f8f8'
                  }}
                />
              </div>
              
              {showMapping && (
                <div>
                  <h3>Mapping Between Images</h3>
                  <canvas
                    ref={mappingCanvasRef}
                    style={{
                      maxWidth: '100%',
                      height: 'auto',
                      display: 'block',
                      marginBottom: '10px',
                      border: '1px solid #ddd',
                      borderRadius: '5px',
                      backgroundColor: '#f8f8f8'
                    }}
                  />
                </div>
              )}
            </div>
            
            {/* Upload controls */}
            <div style={{ marginBottom: '20px' }}>
              <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                <label style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  padding: '8px 15px',
                  backgroundColor: '#4a5568',
                  color: 'white',
                  borderRadius: '5px',
                  cursor: 'pointer'
                }}>
                  <FaUpload /> Upload Person Image
                  <input
                    ref={personInputRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e, 'person')}
                    style={{ display: 'none' }}
                  />
                </label>
                
                <label style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  padding: '8px 15px',
                  backgroundColor: '#4a5568',
                  color: 'white',
                  borderRadius: '5px',
                  cursor: 'pointer'
                }}>
                  <FaTshirt /> Upload Clothing
                  <input
                    ref={clothingInputRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e, 'clothing')}
                    style={{ display: 'none' }}
                  />
                </label>
              </div>
            </div>
            
            {/* Action buttons */}
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <button
                onClick={() => detectPose(activeImage)}
                disabled={!(activeImage === 'person' ? personImage : clothingImage) || isLoading}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  padding: '8px 15px',
                  backgroundColor: !(activeImage === 'person' ? personImage : clothingImage) || isLoading ? '#718096' : '#3182ce',
                  color: 'white',
                  borderRadius: '5px',
                  border: 'none',
                  cursor: !(activeImage === 'person' ? personImage : clothingImage) || isLoading ? 'not-allowed' : 'pointer'
                }}
              >
                <FaMagic /> Detect Pose on {activeImage === 'person' ? 'Person' : 'Clothing'}
              </button>
              
              <button
                onClick={handleToggleActiveImage}
                disabled={isLoading}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  padding: '8px 15px',
                  backgroundColor: '#805ad5',
                  color: 'white',
                  borderRadius: '5px',
                  border: 'none',
                  cursor: isLoading ? 'not-allowed' : 'pointer'
                }}
              >
                <FaExchangeAlt /> Toggle {activeImage === 'person' ? 'to Clothing' : 'to Person'}
              </button>
              
              <button
                onClick={drawMapping}
                disabled={personKeypoints.length === 0 || clothingKeypoints.length === 0 || isLoading}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  padding: '8px 15px',
                  backgroundColor: personKeypoints.length === 0 || clothingKeypoints.length === 0 || isLoading ? '#718096' : '#48bb78',
                  color: 'white',
                  borderRadius: '5px',
                  border: 'none',
                  cursor: personKeypoints.length === 0 || clothingKeypoints.length === 0 || isLoading ? 'not-allowed' : 'pointer'
                }}
              >
                <FaTshirt /> Show Mapping
              </button>
              
              <button
                onClick={handleSaveMapping}
                disabled={!showMapping || isLoading}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  padding: '8px 15px',
                  backgroundColor: !showMapping || isLoading ? '#718096' : '#805ad5',
                  color: 'white',
                  borderRadius: '5px',
                  border: 'none',
                  cursor: !showMapping || isLoading ? 'not-allowed' : 'pointer'
                }}
              >
                <FaSave /> Save Mapping
              </button>
              
              <button
                onClick={handleReset}
                disabled={isLoading}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  padding: '8px 15px',
                  backgroundColor: isLoading ? '#718096' : '#e53e3e',
                  color: 'white',
                  borderRadius: '5px',
                  border: 'none',
                  cursor: isLoading ? 'not-allowed' : 'pointer'
                }}
              >
                <FaUndo /> Reset
              </button>
            </div>
          </div>
          
          {/* Right side - Keypoints and info */}
          <div style={{ flex: '1', minWidth: '300px' }}>
            <h3>Current Mode: {activeImage === 'person' ? 'Person Image' : 'Clothing Image'}</h3>
            
            {/* Show keypoints for active image */}
            {((activeImage === 'person' ? personKeypoints : clothingKeypoints).length > 0) && (
              <div>
                <h3>Keypoint Analysis:</h3>
                {(() => {
                  const keypoints = activeImage === 'person' ? personKeypoints : clothingKeypoints;
                  const leftShoulder = keypoints.find(p => p.name === 'left_shoulder');
                  const rightShoulder = keypoints.find(p => p.name === 'right_shoulder');
                  
                  if (leftShoulder && rightShoulder && leftShoulder.score > 0.3 && rightShoulder.score > 0.3) {
                    const dx = rightShoulder.x - leftShoulder.x;
                    const dy = rightShoulder.y - leftShoulder.y;
                    const angle = Math.atan2(dy, dx) * (180 / Math.PI);
                    const shoulderWidth = Math.sqrt(dx * dx + dy * dy);
                    const centerX = (leftShoulder.x + rightShoulder.x) / 2;
                    const centerY = (leftShoulder.y + rightShoulder.y) / 2;
                    
                    return (
                      <div style={{ textAlign: 'left' }}>
                        <p><strong>Shoulder Width:</strong> {shoulderWidth.toFixed(1)}px</p>
                        <p><strong>Shoulder Angle:</strong> {angle.toFixed(2)}° from horizontal</p>
                        <p><strong>Shoulder Center:</strong> ({Math.round(centerX)}, {Math.round(centerY)})</p>
                        <p><strong>Left Shoulder:</strong> ({Math.round(leftShoulder.x)}, {Math.round(leftShoulder.y)}) - Confidence: {(leftShoulder.score * 100).toFixed(1)}%</p>
                        <p><strong>Right Shoulder:</strong> ({Math.round(rightShoulder.x)}, {Math.round(rightShoulder.y)}) - Confidence: {(rightShoulder.score * 100).toFixed(1)}%</p>
                      </div>
                    );
                  }
                  
                  return <p>Could not analyze shoulders - keypoints not detected with sufficient confidence.</p>;
                })()}
                
                <h3 style={{ marginTop: '20px' }}>Detected Keypoints:</h3>
                <div style={{ 
                  maxHeight: '300px', 
                  overflowY: 'auto', 
                  backgroundColor: '#1a202c', 
                  color: '#e2e8f0',
                  padding: '10px',
                  borderRadius: '5px',
                  fontFamily: 'monospace',
                  fontSize: '12px'
                }}>
                  <pre>{JSON.stringify(activeImage === 'person' ? personKeypoints : clothingKeypoints, null, 2)}</pre>
                </div>
              </div>
            )}
            
            {/* Show mapping status if available */}
            {showMapping && personKeypoints.length > 0 && clothingKeypoints.length > 0 && (
              <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#2d3748', color: 'white', borderRadius: '5px' }}>
                <h3>Mapping Status</h3>
                <p>Mapping between person and clothing images is displayed.</p>
                <p>Yellow dashed lines connect corresponding keypoints.</p>
              </div>
            )}
            
            {/* Show instructions if no keypoints */}
            {((activeImage === 'person' ? personKeypoints : clothingKeypoints).length === 0) && 
             (activeImage === 'person' ? personImage : clothingImage) && (
              <div style={{ textAlign: 'center', padding: '20px', backgroundColor: '#f8f9fa', borderRadius: '5px' }}>
                <p>Click "Detect Pose" to see keypoints for the {activeImage} image</p>
              </div>
            )}
            
            {!(activeImage === 'person' ? personImage : clothingImage) && (
              <div style={{ textAlign: 'center', padding: '20px', backgroundColor: '#f8f9fa', borderRadius: '5px' }}>
                <p>Upload a {activeImage} image to get started</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ClothingMapper;
