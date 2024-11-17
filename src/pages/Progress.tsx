import React, { useState, useRef, useEffect } from 'react';
import { Camera, Upload, X } from 'lucide-react';
import ProgressGallery from '../components/ProgressGallery';
import { useProgressStore } from '../store/progressStore';
import { useAuth } from '../hooks/useAuth';

function Progress() {
  const { user } = useAuth();
  const { addProgress, loading } = useProgressStore();
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Cleanup function for camera stream
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type.startsWith('image/')) {
        setSelectedImage(file);
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreview(reader.result as string);
        };
        reader.readAsDataURL(file);
      } else {
        setError('Please select an image file.');
      }
    }
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'user' }
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      streamRef.current = stream;
      setError(null);
    } catch (err) {
      setError('Unable to access camera. Please check your permissions.');
      console.error('Camera error:', err);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  const capturePhoto = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0);
        canvas.toBlob((blob) => {
          if (blob) {
            const file = new File([blob], 'progress-photo.jpg', { type: 'image/jpeg' });
            setSelectedImage(file);
            setPreview(canvas.toDataURL('image/jpeg'));
          }
        }, 'image/jpeg', 0.8);
      }
      stopCamera();
      setError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !selectedImage) {
      setError('Please select an image first.');
      return;
    }

    try {
      setError(null);
      await addProgress(user.id, selectedImage, notes);
      setSelectedImage(null);
      setPreview(null);
      setNotes('');
    } catch (err) {
      setError('Failed to save progress. Please try again.');
      console.error('Upload error:', err);
    }
  };

  const clearSelection = () => {
    setSelectedImage(null);
    setPreview(null);
    setError(null);
    stopCamera();
  };

  return (
    <div className="space-y-8">
      <header className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Track Your Progress</h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Document your face yoga journey with photos and see your transformation over time.
        </p>
      </header>

      <div className="bg-white rounded-xl shadow-sm p-8">
        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-lg flex items-center">
            <X className="w-5 h-5 mr-2 flex-shrink-0" />
            <p>{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {!preview ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-gray-300 rounded-lg hover:border-mint-500 transition-colors"
                >
                  <Upload className="w-8 h-8 text-gray-400 mb-2" />
                  <span className="text-sm text-gray-600">Upload Photo</span>
                </button>

                <button
                  type="button"
                  onClick={startCamera}
                  className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-gray-300 rounded-lg hover:border-mint-500 transition-colors"
                >
                  <Camera className="w-8 h-8 text-gray-400 mb-2" />
                  <span className="text-sm text-gray-600">Take Photo</span>
                </button>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />

              {streamRef.current && (
                <div className="relative">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    className="w-full rounded-lg"
                  />
                  <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-4">
                    <button
                      type="button"
                      onClick={capturePhoto}
                      className="px-4 py-2 bg-mint-500 text-white rounded-lg hover:bg-mint-600 transition-colors"
                    >
                      Capture
                    </button>
                    <button
                      type="button"
                      onClick={stopCamera}
                      className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="relative">
              <img
                src={preview}
                alt="Preview"
                className="w-full rounded-lg"
              />
              <button
                type="button"
                onClick={clearSelection}
                className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          )}

          {preview && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-mint-500"
                  rows={3}
                  placeholder="Add any notes about your progress..."
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full px-4 py-2 bg-mint-500 text-white rounded-lg hover:bg-mint-600 transition-colors disabled:opacity-50 flex items-center justify-center"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Saving...
                  </>
                ) : 'Save Progress'}
              </button>
            </>
          )}
        </form>
      </div>

      <ProgressGallery />
    </div>
  );
}

export default Progress;