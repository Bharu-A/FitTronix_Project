import { useRef, useCallback } from 'react';

export const useCamera = (videoRef, streamRef) => {
  const startCamera = useCallback(async () => {
    if (!videoRef.current) {
      throw new Error('Video element not found!');
    }

    try {
      console.log('📷 Starting camera...');
      
      // Stop existing stream if any
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }

      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user',
          frameRate: { ideal: 30 }
        } 
      });
      
      streamRef.current = stream;
      videoRef.current.srcObject = stream;
      
      return new Promise((resolve, reject) => {
        videoRef.current.onloadedmetadata = () => {
          console.log('✅ Camera started successfully');
          videoRef.current.play().then(() => {
            console.log('🎥 Video playback started');
            resolve(stream);
          }).catch(error => {
            console.error('❌ Video play failed:', error);
            reject(error);
          });
        };
        
        videoRef.current.onerror = () => {
          reject(new Error('Video element error'));
        };

        // Fallback timeout
        setTimeout(() => {
          if (videoRef.current?.readyState >= 2) {
            resolve(stream);
          } else {
            reject(new Error('Camera timeout'));
          }
        }, 3000);
      });
    } catch (error) {
      console.error('❌ Error accessing camera:', error.name, error.message);
      let errorMsg = `Camera error: ${error.message}`;
      if (error.name === 'NotAllowedError') {
        errorMsg = 'Camera permission denied. Please allow camera access and try again.';
      } else if (error.name === 'NotFoundError') {
        errorMsg = 'No camera found on this device.';
      } else if (error.name === 'NotSupportedError') {
        errorMsg = 'Camera not supported in this browser.';
      }
      throw new Error(errorMsg);
    }
  }, [videoRef, streamRef]);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      console.log('🛑 Stopping camera...');
      streamRef.current.getTracks().forEach(track => {
        track.stop();
      });
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, [videoRef, streamRef]);

  const switchCamera = useCallback(async () => {
    if (!streamRef.current) return;

    const currentTrack = streamRef.current.getVideoTracks()[0];
    const currentConstraints = currentTrack.getSettings();
    const newFacingMode = currentConstraints.facingMode === 'user' ? 'environment' : 'user';

    try {
      await stopCamera();
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: newFacingMode,
          frameRate: { ideal: 30 }
        }
      });
      
      streamRef.current = stream;
      videoRef.current.srcObject = stream;
      
      console.log(`🔄 Switched to ${newFacingMode} camera`);
    } catch (error) {
      console.error('❌ Error switching camera:', error);
      throw error;
    }
  }, [videoRef, streamRef, stopCamera]);

  const checkCameraPermission = useCallback(async () => {
    try {
      const permission = await navigator.permissions.query({ name: 'camera' });
      return permission.state;
    } catch (error) {
      console.log('Camera permission API not supported');
      return 'prompt';
    }
  }, []);

  return {
    startCamera,
    stopCamera,
    switchCamera,
    checkCameraPermission
  };
};