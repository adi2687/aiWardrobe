import React, { useRef, useState, useEffect } from 'react';
import * as tf from '@tensorflow/tfjs';
import * as poseDetection from '@tensorflow-models/pose-detection';
import * as bodySegmentation from '@tensorflow-models/body-segmentation';
// fabric.js is now available globally via CDN
const { fabric } = window;
import { FaUpload, FaTshirt, FaUser, FaMagic, FaUndo } from 'react-icons/fa';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './VirtualTryOn.css';

const VirtualTryOnEnhanced = () => {
  // Refs for canvas elements
  const userCanvasRef = useRef(null);
  const clothingCanvasRef = useRef(null);
  const resultCanvasRef = useRef(null);
  const fileInputRef = useRef(null);
  const clothingInputRef = useRef(null);
  
  // State management
  const [userImage, setUserImage] = useState(null);
  const [clothingImage, setClothingImage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState('upload');
  const [fabricCanvas, setFabricCanvas] = useState(null);
  const [processingStep, setProcessingStep] = useState('');
  const [clothingItems, setClothingItems] = useState([]);
  const [activeClothingIndex, setActiveClothingIndex] = useState(-1);
  
  // Initialize TensorFlow.js and models
  useEffect(() => {
    const init = async () => {
      try {
        await tf.ready();
        await tf.setBackend('webgl');
        console.log('TensorFlow.js is ready');
      } catch (error) {
        console.error('Error initializing TensorFlow.js:', error);
        toast.error('Error initializing TensorFlow.js. Please try again.');
      }
    };
    
    init();
    
    return () => {
      // Cleanup
      if (fabricCanvas) {
        fabricCanvas.dispose();
      }
    };
  }, []);
  
  // Initialize Fabric.js canvas when result canvas is mounted
  useEffect(() => {
    if (resultCanvasRef.current && !fabricCanvas) {
      const canvas = new fabric.Canvas(resultCanvasRef.current, {
        width: 500,
        height: 700,
        backgroundColor: '#f0f0f0',
      });
      setFabricCanvas(canvas);
      
      return () => {
        canvas.dispose();
      };
    }
  }, [resultCanvasRef.current]);
  
  // Handle image upload with validation
  const handleImageUpload = (e, imageType) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Validate file type
    if (!file.type.match('image.*')) {
      toast.error('Please upload a valid image file');
      return;
    }
    
    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB');
      return;
    }
    
    setIsProcessing(true);
    setProcessingStep(`Uploading ${imageType} image...`);
    
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        // Create a canvas to resize the image if needed
        const maxDimension = 1500; // Max width/height
        let width = img.width;
        let height = img.height;
        
        // Resize if image is too large
        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = (height * maxDimension) / width;
            width = maxDimension;
          } else {
            width = (width * maxDimension) / height;
            height = maxDimension;
          }
          
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          
          // Update image source with resized version
          img.src = canvas.toDataURL('image/jpeg', 0.9);
        }
        
        if (imageType === 'user') {
          setUserImage(img);
          drawImageToCanvas(img, userCanvasRef.current);
          toast.success('User image uploaded successfully');
        } else {
          setClothingImage(img);
          drawImageToCanvas(img, clothingCanvasRef.current);
          toast.success('Clothing item uploaded successfully');
        }
        
        setIsProcessing(false);
        setProcessingStep('');
      };
      img.onerror = () => {
        toast.error('Error loading image');
        setIsProcessing(false);
        setProcessingStep('');
      };
      img.src = event.target.result;
    };
    reader.onerror = () => {
      toast.error('Error reading file');
      setIsProcessing(false);
      setProcessingStep('');
    };
    reader.readAsDataURL(file);
  };
  
  // Draw image to canvas
  const drawImageToCanvas = (img, canvas) => {
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    canvas.width = img.width;
    canvas.height = img.height;
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  };
  
  // Process image with background removal
  const removeBackground = async () => {
    if (!userImage) {
      toast.warning('Please upload a user image first');
      return;
    }
    
    setIsLoading(true);
    setIsProcessing(true);
    setProcessingStep('Initializing background removal...');
    toast.info('Removing background...');
    
    try {
      // Load the body segmentation model
      setProcessingStep('Loading segmentation model...');
      const model = bodySegmentation.SupportedModels.MediaPipeSelfieSegmentation;
      const segmenterConfig = {
        runtime: 'mediapipe',
        solutionPath: 'https://cdn.jsdelivr.net/npm/@mediapipe/selfie_segmentation',
      };
      
      const segmenter = await bodySegmentation.createSegmenter(model, segmenterConfig);
      setProcessingStep('Detecting body in the image...');
      
      // Create a temporary canvas to process the image
      const tempCanvas = document.createElement('canvas');
      const tempCtx = tempCanvas.getContext('2d');
      tempCanvas.width = userImage.width;
      tempCanvas.height = userImage.height;
      tempCtx.drawImage(userImage, 0, 0);
      
      // Get image data
      const imageData = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
      
      // Create a tensor from the image data
      const input = tf.browser.fromPixels(imageData);
      
      // Segment the image
      const segmentation = await segmenter.segmentPeople(input);
      
      // Create a mask for the person
      const mask = await bodySegmentation.toBinaryMask(
        segmentation,
        {
          r: 0, g: 0, b: 0, a: 0
        },
        {
          r: 0, g: 0, b: 0, a: 255
        },
        0.7
      );
      
      // Convert mask to a 3D tensor with shape [height, width, 1]
      const maskTensor = tf.tidy(() => {
        const maskData = new Uint8Array(mask.width * mask.height);
        for (let i = 0; i < maskData.length; i++) {
          const alpha = mask.data[i * 4 + 3];
          maskData[i] = alpha > 0 ? 255 : 0;
        }
        return tf.tensor3d(maskData, [mask.height, mask.width, 1], 'int32');
      });
      
      // Ensure input has 3 channels (RGB)
      let processedInput = input;
      if (input.shape[2] === 4) {
        // If RGBA, extract just the RGB channels
        processedInput = input.slice([0, 0, 0], [-1, -1, 3]);
      }
      
      // Create a transparent background (RGBA)
      const background = tf.tidy(() => {
        return tf.zeros([mask.height, mask.width, 4], 'int32');
      });
      
      // Apply the mask to the original image
      const processed = tf.tidy(() => {
        // Convert mask to float and normalize to [0, 1]
        const maskFloat = maskTensor.toFloat().div(255);
        
        // Apply mask to each RGB channel
        const maskedRgb = processedInput.mul(maskFloat);
        
        // Create alpha channel from mask
        const alphaChannel = maskFloat.mul(255).toInt();
        
        // Combine RGB with alpha channel
        const rgba = tf.stack([
          maskedRgb.slice([0, 0, 0], [-1, -1, 1]), // R
          maskedRgb.slice([0, 0, 1], [-1, -1, 1]), // G
          maskedRgb.slice([0, 0, 2], [-1, -1, 1]), // B
          alphaChannel                              // A
        ], 2).squeeze([3]);
        
        return rgba;
      });
      
      // Draw the result to the canvas
      await tf.browser.toPixels(processed, userCanvasRef.current);
      
      // Cleanup
      input.dispose();
      maskTensor.dispose();
      if (processedInput !== input) {
        processedInput.dispose();
      }
      background.dispose();
      processed.dispose();
      
      toast.success('Background removed successfully');
    } catch (error) {
      console.error('Error removing background:', error);
      toast.error('Error removing background. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Try on the clothing with enhanced alignment and scaling
  const tryOnClothing = async () => {
    if (!userImage) {
      toast.warning('Please upload a user image first');
      return;
    }
    
    if (!clothingImage) {
      toast.warning('Please upload a clothing item to try on');
      return;
    }
    
    setIsLoading(true);
    setIsProcessing(true);
    setProcessingStep('Initializing virtual try-on...');
    
    try {
      // Load the pose detection model with error handling
      setProcessingStep('Loading pose detection model...');
      let detector;
      try {
        const model = poseDetection.SupportedModels.MoveNet;
        detector = await poseDetection.createDetector(model, {
          modelType: poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING
        });
      } catch (modelError) {
        console.error('Error loading pose detection model:', modelError);
        toast.error('Failed to load pose detection model. Please try again.');
        setIsLoading(false);
        setIsProcessing(false);
        return;
      }
      
      // Detect pose in the user image with error handling
      setProcessingStep('Detecting body pose...');
      let poses;
      try {
        poses = await detector.estimatePoses(userImage);
      } catch (poseError) {
        console.error('Error detecting pose:', poseError);
        toast.error('Failed to detect body pose. Please try a different image.');
        setIsLoading(false);
        setIsProcessing(false);
        return;
      }
      
      if (poses.length === 0 || !poses[0].keypoints) {
        toast.warning('Could not detect a person in the image. Please ensure the person is clearly visible.');
        setIsLoading(false);
        setIsProcessing(false);
        return;
      }
      
      const pose = poses[0];
      
      // Get keypoints for body parts with confidence scores
      const getKeypoint = (name) => {
        const kp = pose.keypoints.find(kp => kp.name === name);
        if (!kp || kp.score < 0.3) { // Minimum confidence threshold
          return null;
        }
        return kp;
      };
      
      const leftShoulder = getKeypoint('left_shoulder');
      const rightShoulder = getKeypoint('right_shoulder');
      const leftHip = getKeypoint('left_hip');
      const rightHip = getKeypoint('right_hip');
      const leftElbow = getKeypoint('left_elbow');
      const rightElbow = getKeypoint('right_elbow');
      const leftWrist = getKeypoint('left_wrist');
      const rightWrist = getKeypoint('right_wrist');
      
      // Check if we have enough keypoints to proceed
      const requiredKeypoints = [leftShoulder, rightShoulder, leftHip, rightHip];
      const detectedKeypoints = requiredKeypoints.filter(kp => kp !== null);
      
      if (detectedKeypoints.length < 3) {
        toast.warning('Could not detect enough body parts. Please ensure shoulders and hips are visible.');
        setIsLoading(false);
        setIsProcessing(false);
        return;
      }
      
      // Estimate missing keypoints if possible
      const estimateMissingKeypoint = (kp1, kp2, ratio = 0.5) => {
        if (!kp1 || !kp2) return null;
        return {
          x: kp1.x + (kp2.x - kp1.x) * ratio,
          y: kp1.y + (kp2.y - kp1.y) * ratio,
          score: Math.min(kp1.score, kp2.score) * 0.8
        };
      };
      
      // If one shoulder is missing, estimate it based on the other shoulder and hips
      if (!leftShoulder && rightShoulder && rightHip && leftHip) {
        leftShoulder = estimateMissingKeypoint(
          { x: rightShoulder.x - 200, y: rightShoulder.y }, // Rough estimate
          rightShoulder
        );
      } else if (!rightShoulder && leftShoulder && leftHip && rightHip) {
        rightShoulder = estimateMissingKeypoint(
          leftShoulder,
          { x: leftShoulder.x + 200, y: leftShoulder.y } // Rough estimate
        );
      }
      
      // Calculate body measurements
      const shoulderWidth = Math.abs(rightShoulder.x - leftShoulder.x);
      const shoulderCenter = {
        x: (leftShoulder.x + rightShoulder.x) / 2,
        y: (leftShoulder.y + rightShoulder.y) / 2
      };
      
      const hipCenter = {
        x: (leftHip.x + rightHip.x) / 2,
        y: (leftHip.y + rightHip.y) / 2
      };
      
      // Calculate torso height and angle
      const torsoHeight = Math.sqrt(
        Math.pow(hipCenter.x - shoulderCenter.x, 2) + 
        Math.pow(hipCenter.y - shoulderCenter.y, 2)
      );
      
      const torsoAngle = Math.atan2(
        hipCenter.y - shoulderCenter.y,
        hipCenter.x - shoulderCenter.x
      ) * (180 / Math.PI);
      
      // Calculate the aspect ratio of the clothing
      const clothingAspectRatio = clothingImage.width / clothingImage.height;
      
      // Calculate scale factors based on body measurements
      let scaleX = shoulderWidth * 1.2 / clothingImage.width; // Add 20% padding
      let scaleY = torsoHeight * 1.8 / clothingImage.height; // Add 80% extra length
      
      // Maintain aspect ratio of the clothing
      if (clothingAspectRatio > 1) {
        // Wider than tall - scale based on width
        scaleY = scaleX / clothingAspectRatio;
      } else {
        // Taller than wide - scale based on height
        scaleX = scaleY * clothingAspectRatio;
      }
      
      // Position the clothing - center it between the shoulders
      const posX = shoulderCenter.x - (clothingImage.width * scaleX) / 2;
      const posY = shoulderCenter.y - (clothingImage.height * scaleY * 0.3); // Slightly above shoulders
      
      // Calculate rotation based on shoulder angle if available
      const shoulderAngle = rightShoulder && leftShoulder ? 
        Math.atan2(
          rightShoulder.y - leftShoulder.y,
          rightShoulder.x - leftShoulder.x
        ) * (180 / Math.PI) : 0;
      
      // Clear the fabric canvas
      fabricCanvas.clear();
      
      // Add the user image as background
      fabric.Image.fromURL(userImage.src, (img) => {
        img.selectable = false;
        img.evented = false;
        fabricCanvas.add(img);
        fabricCanvas.renderAll();
      });
      
      // Add the clothing image with enhanced positioning and rotation
      setProcessingStep('Positioning clothing item...');
      
      // Create a unique ID for this clothing item
      const clothingId = `clothing-${Date.now()}`;
      
      fabric.Image.fromURL(clothingImage.src, (img) => {
        // Calculate the center point for rotation
        const centerX = posX + (img.width * scaleX) / 2;
        const centerY = posY + (img.height * scaleY) / 2;
        
        // Create a unique ID for this clothing item
        img.set('data-id', clothingId);
        
        // Apply transformations
        img.set({
          left: posX,
          top: posY,
          scaleX: scaleX,
          scaleY: scaleY,
          angle: shoulderAngle, // Apply the calculated shoulder angle
          originX: 'center',
          originY: 'center',
          centeredRotation: true,
          selectable: true,
          hasControls: true,
          lockRotation: false, // Allow user to adjust rotation if needed
          lockScalingFlip: true,
          cornerStyle: 'circle',
          borderColor: '#4285f4',
          cornerColor: '#4285f4',
          cornerSize: 10,
          transparentCorners: false,
          padding: 10,
          cornerStrokeColor: '#ffffff',
          borderScaleFactor: 1.5,
          // Add a subtle shadow for better depth
          shadow: new fabric.Shadow({
            color: 'rgba(0,0,0,0.5)',
            blur: 10,
            offsetX: 5,
            offsetY: 5,
            affectStroke: true
          })
        });
        
        // Add a semi-transparent background for better visibility
        const background = new fabric.Rect({
          width: img.width * scaleX * 1.1, // Slightly larger than the image
          height: img.height * scaleY * 1.1,
          fill: 'rgba(0, 0, 0, 0.2)',
          rx: 10, // Rounded corners
          ry: 10,
          selectable: false,
          evented: false,
          originX: 'center',
          originY: 'center',
          left: centerX,
          top: centerY,
          stroke: 'rgba(255, 255, 255, 0.5)',
          strokeWidth: 1
        });
        
        // Add the background first, then the image
        const group = new fabric.Group([background, img], {
          selectable: true,
          hasControls: true,
          lockRotation: false,
          lockScalingFlip: true,
          cornerStyle: 'circle',
          cornerColor: '#4285f4',
          cornerSize: 10,
          transparentCorners: false,
          padding: 10,
          cornerStrokeColor: '#ffffff',
          borderScaleFactor: 1.5,
          data: { type: 'clothing', id: clothingId }
        });
        
        fabricCanvas.add(group);
        group.bringToFront();
        
        // Set the active object and render
        fabricCanvas.setActiveObject(group);
        fabricCanvas.renderAll();
        
        // Add to clothing items list
        setClothingItems(prevItems => [...prevItems, {
          id: clothingId,
          image: clothingImage.src,
          position: { x: posX, y: posY },
          scale: { x: scaleX, y: scaleY },
          angle: shoulderAngle,
          timestamp: Date.now()
        }]);
        
        // Set as active clothing item
        setActiveClothingIndex(0); // Most recent item is active
        
        // Calculate the zoom level to fit the canvas
        const zoomLevel = Math.min(
          (fabricCanvas.width * 0.8) / (img.width * scaleX * 1.2),
          (fabricCanvas.height * 0.8) / (img.height * scaleY * 1.2),
          1.0 // Don't zoom in more than 100%
        );
        
        // Center the view on the clothing
        fabricCanvas.zoomToPoint(
          { x: fabricCanvas.width / 2, y: fabricCanvas.height / 2 },
          zoomLevel
        );
        
        // Center the content
        fabricCanvas.absolutePan(new fabric.Point(
          (fabricCanvas.width - (img.width * scaleX * zoomLevel)) / 2 - posX * zoomLevel,
          (fabricCanvas.height - (img.height * scaleY * zoomLevel)) / 2 - posY * zoomLevel
        ));
      });
      
      toast.success('Clothing added successfully!');
      setActiveTab('result');
      
    } catch (error) {
      console.error('Error trying on clothing:', error);
      toast.error('Error trying on clothing. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle saving the final result
  const saveResult = () => {
    if (!fabricCanvas) return;
    
    setIsProcessing(true);
    setProcessingStep('Saving your try-on result...');
    
    try {
      // Create a temporary canvas to render the final result
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = fabricCanvas.width;
      tempCanvas.height = fabricCanvas.height;
      const tempCtx = tempCanvas.getContext('2d');
      
      // Draw the user image (if available)
      if (userImage) {
        tempCtx.drawImage(userImage, 0, 0, tempCanvas.width, tempCanvas.height);
      }
      
      // Draw all clothing items
      const clothingObjects = fabricCanvas.getObjects().filter(obj => obj.data?.type === 'clothing');
      clothingObjects.forEach(obj => {
        const group = obj;
        const originalRender = group._render;
        group._render = function(ctx) {
          ctx.save();
          ctx.globalCompositeOperation = 'source-over';
          originalRender.call(this, ctx);
          ctx.restore();
        };
        fabricCanvas.renderAll();
      });
      
      // Draw the fabric canvas onto our temporary canvas
      tempCtx.drawImage(fabricCanvas.getElement(), 0, 0);
      
      // Convert to data URL and create download link
      const dataURL = tempCanvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `outfit-ai-tryon-${new Date().toISOString().slice(0, 10)}.png`;
      link.href = dataURL;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success('Image saved successfully!');
    } catch (error) {
      console.error('Error saving result:', error);
      toast.error('Failed to save the result. Please try again.');
    } finally {
      setIsProcessing(false);
      setProcessingStep('');
    }
  };

  // Reset the canvas and state
  const resetCanvas = () => {
    if (fabricCanvas) {
      // Store the current zoom and pan to restore later
      const zoom = fabricCanvas.getZoom();
      const viewportTransform = fabricCanvas.viewportTransform;
      
      // Clear the canvas
      fabricCanvas.clear();
      
      // Add a subtle grid background
      const gridSize = 20;
      const gridColor = 'rgba(255, 255, 255, 0.05)';
      
      // Create a grid pattern
      for (let i = 0; i < fabricCanvas.width / gridSize; i++) {
        fabricCanvas.add(new fabric.Line(
          [i * gridSize, 0, i * gridSize, fabricCanvas.height], 
          { stroke: gridColor, selectable: false, evented: false }
        ));
        fabricCanvas.add(new fabric.Line(
          [0, i * gridSize, fabricCanvas.width, i * gridSize], 
          { stroke: gridColor, selectable: false, evented: false }
        ));
      }
      
      // Restore zoom and pan
      fabricCanvas.setViewportTransform(viewportTransform);
      fabricCanvas.setZoom(zoom);
      fabricCanvas.renderAll();
    }
    
    // Clear the canvases
    [userCanvasRef, clothingCanvasRef].forEach(canvasRef => {
      if (canvasRef.current) {
        const ctx = canvasRef.current.getContext('2d');
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      }
    });
    
    // Reset state
    setUserImage(null);
    setClothingImage(null);
    setActiveTab('upload');
    setProcessingStep('');
    setClothingItems([]);
    setActiveClothingIndex(-1);
    
    // Reset file inputs
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (clothingInputRef.current) clothingInputRef.current.value = '';
    
    toast.info('Canvas has been reset');
  };

  // Calculate upload progress (for demonstration)
  const uploadProgress = 0; // You can implement actual progress tracking if needed

  return (
    <div className="virtual-try-on-container">
      <ToastContainer 
        position="top-right" 
        autoClose={5000}
        closeOnClick
        pauseOnHover
        theme="dark"
      />

      <div className="tabs">
        <button 
          className={`tab ${activeTab === 'upload' ? 'active' : ''}`}
          onClick={() => setActiveTab('upload')}
          disabled={isLoading || isProcessing}
        >
          {isProcessing && processingStep.includes('Uploading') ? (
            <span className="tab-loading">Uploading...</span>
          ) : (
            'Upload Images'
          )}
        </button>
        <button 
          className={`tab ${activeTab === 'result' ? 'active' : ''}`}
          onClick={() => setActiveTab('result')}
          disabled={!userImage || !clothingImage || isLoading || isProcessing}
        >
          {isProcessing && !processingStep.includes('Uploading') ? (
            <span className="tab-loading">Processing...</span>
          ) : (
            'Try On Result'
          )}
        </button>
      </div>

      {/* Processing overlay */}
      {(isLoading || isProcessing) && (
        <div className="processing-overlay">
          <div className="processing-content">
            <div className="spinner"></div>
            <p>{processingStep || 'Processing...'}</p>
            {uploadProgress > 0 && (
              <div className="progress-bar">
                <div 
                  className="progress" 
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'upload' ? (
        <div className="upload-section">
          <div className="upload-container">
            <h3>Upload Your Photo</h3>
            <div className="canvas-container">
              <canvas ref={userCanvasRef} className="try-on-canvas" />
              {!userImage && (
                <div className="upload-prompt">
                  <FaUser size={48} />
                  <p>Upload your photo</p>
                  <input
                    type="file"
                    accept="image/*"
                    ref={fileInputRef}
                    onChange={(e) => handleImageUpload(e, 'user')}
                    style={{ display: 'none' }}
                  />
                  <button 
                    className="btn"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isLoading || isProcessing}
                  >
                    <FaUpload /> Choose Photo
                  </button>
                </div>
              )}
            </div>
            {userImage && (
              <div className="action-buttons">
                <button 
                  className="btn btn-secondary"
                  onClick={removeBackground}
                  disabled={isLoading || isProcessing}
                >
                  <FaMagic /> Remove Background
                </button>
                <button 
                  className="btn btn-danger"
                  onClick={() => {
                    setUserImage(null);
                    if (userCanvasRef.current) {
                      const ctx = userCanvasRef.current.getContext('2d');
                      ctx.clearRect(0, 0, userCanvasRef.current.width, userCanvasRef.current.height);
                    }
                  }}
                  disabled={isLoading || isProcessing}
                >
                  <FaUndo /> Clear
                </button>
              </div>
            )}
          </div>

          <div className="upload-container">
            <h3>Upload Clothing Item</h3>
            <div className="canvas-container">
              <canvas ref={clothingCanvasRef} className="try-on-canvas" />
              {!clothingImage && (
                <div className="upload-prompt">
                  <FaTshirt size={48} />
                  <p>Upload clothing item</p>
                  <input
                    type="file"
                    accept="image/*"
                    ref={clothingInputRef}
                    onChange={(e) => handleImageUpload(e, 'clothing')}
                    style={{ display: 'none' }}
                  />
                  <button 
                    className="btn"
                    onClick={() => clothingInputRef.current?.click()}
                    disabled={isLoading || isProcessing}
                  >
                    <FaUpload /> Choose Clothing
                  </button>
                </div>
              )}
            </div>
            {clothingImage && (
              <div className="action-buttons">
                <button 
                  className="btn btn-primary"
                  onClick={tryOnClothing}
                  disabled={isLoading || isProcessing}
                >
                  <FaTshirt /> Try On
                </button>
                <button 
                  className="btn btn-danger"
                  onClick={() => {
                    setClothingImage(null);
                    if (clothingCanvasRef.current) {
                      const ctx = clothingCanvasRef.current.getContext('2d');
                      ctx.clearRect(0, 0, clothingCanvasRef.current.width, clothingCanvasRef.current.height);
                    }
                  }}
                  disabled={isLoading || isProcessing}
                >
                  <FaUndo /> Clear
                </button>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="result-section">
          <div className="result-canvas-container">
            <canvas ref={resultCanvasRef} className="result-canvas" />
          </div>
          <div className="result-actions">
            <button 
              className="btn btn-primary"
              onClick={saveResult}
              disabled={isLoading || isProcessing}
            >
              Save Result
            </button>
            <button 
              className="btn btn-secondary"
              onClick={() => setActiveTab('upload')}
              disabled={isLoading || isProcessing}
            >
              Back to Upload
            </button>
            <button 
              className="btn btn-danger"
              onClick={resetCanvas}
              disabled={isLoading || isProcessing}
            >
              Reset All
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default VirtualTryOnEnhanced;
