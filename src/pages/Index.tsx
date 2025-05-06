
import { useEffect, useRef, useState } from 'react';
import { Battery, BatteryCharging, Smartphone } from 'lucide-react';
import { Card } from '@/components/ui/card';
import BatteryIndicator from '@/components/BatteryIndicator';
import WebcamView from '@/components/WebcamView';

const Index = () => {
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const [isWebcamActive, setIsWebcamActive] = useState(false);
  const [phonePercentage, setPhonePercentage] = useState(0);
  const [chargerPercentage, setChargerPercentage] = useState(0);
  const [prediction, setPrediction] = useState<string | null>(null);
  const modelRef = useRef<any>(null);
  const webcamRef = useRef<any>(null);
  
  // Load TensorFlow.js and Teachable Machine scripts
  useEffect(() => {
    const loadScripts = async () => {
      try {
        // Load TensorFlow.js
        const tfScript = document.createElement('script');
        tfScript.src = "https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@latest/dist/tf.min.js";
        tfScript.async = true;
        
        // Load Teachable Machine Image library
        const tmScript = document.createElement('script');
        tmScript.src = "https://cdn.jsdelivr.net/npm/@teachablemachine/image@latest/dist/teachablemachine-image.min.js";
        tmScript.async = true;
        
        document.body.appendChild(tfScript);
        document.body.appendChild(tmScript);
        
        tfScript.onload = () => {
          console.log("TensorFlow.js loaded");
        };
        
        tmScript.onload = () => {
          console.log("Teachable Machine library loaded");
          setIsModelLoaded(true);
        };
      } catch (error) {
        console.error("Error loading scripts:", error);
      }
    };
    
    loadScripts();
    
    // Clean up scripts on unmount
    return () => {
      const scripts = document.querySelectorAll('script[src*="tensorflow"], script[src*="teachablemachine"]');
      scripts.forEach(script => script.remove());
    };
  }, []);

  const init = async () => {
    if (!window.tmImage) {
      console.error("Teachable Machine library not loaded yet");
      return;
    }
    
    try {
      setIsWebcamActive(true);
      const URL = "https://teachablemachine.withgoogle.com/models/wgs__TzOK/";
      const modelURL = URL + "model.json";
      const metadataURL = URL + "metadata.json";
      
      // Load the model
      modelRef.current = await window.tmImage.load(modelURL, metadataURL);
      
      // Setup webcam
      const flip = true;
      webcamRef.current = new window.tmImage.Webcam(400, 400, flip);
      await webcamRef.current.setup();
      await webcamRef.current.play();
      
      // Append webcam canvas to the container
      const webcamContainer = document.getElementById('webcam-container');
      if (webcamContainer) {
        webcamContainer.innerHTML = '';
        webcamContainer.appendChild(webcamRef.current.canvas);
      }
      
      // Start the prediction loop
      window.requestAnimationFrame(loop);
    } catch (error) {
      console.error("Error initializing model:", error);
    }
  };

  const loop = async () => {
    if (webcamRef.current && modelRef.current) {
      webcamRef.current.update();
      await predict();
      window.requestAnimationFrame(loop);
    }
  };

  const predict = async () => {
    if (webcamRef.current && modelRef.current) {
      try {
        const predictions = await modelRef.current.predict(webcamRef.current.canvas);
        
        let highestPrediction = { className: "", probability: 0 };
        
        predictions.forEach((prediction: any) => {
          if (prediction.probability > highestPrediction.probability) {
            highestPrediction = prediction;
          }
          
          if (prediction.className === "Phone") {
            setPhonePercentage(Math.round(prediction.probability * 100));
          } else if (prediction.className === "Charger") {
            setChargerPercentage(Math.round(prediction.probability * 100));
          }
        });
        
        setPrediction(highestPrediction.className);
      } catch (error) {
        console.error("Error during prediction:", error);
      }
    }
  };

  // Stop webcam
  const stopWebcam = () => {
    if (webcamRef.current) {
      webcamRef.current.stop();
      setIsWebcamActive(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-10 px-4">
      <div className="max-w-4xl mx-auto">
        <header className="text-center mb-10">
          <h1 className="text-4xl font-bold text-indigo-900 mb-2">Phone Charger Detection</h1>
          <p className="text-lg text-indigo-700">Using machine learning to detect phones and chargers</p>
        </header>
        
        <div className="grid md:grid-cols-2 gap-8">
          <Card className="p-6 shadow-lg bg-white/90 backdrop-blur">
            <div className="mb-4">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Camera View</h2>
              {isModelLoaded ? (
                <>
                  <div id="webcam-container" className="rounded-lg overflow-hidden bg-black mb-4 h-[400px] flex items-center justify-center">
                    {!isWebcamActive && <p className="text-white">Click Start to activate camera</p>}
                  </div>
                  <div className="flex gap-4">
                    {!isWebcamActive ? (
                      <button 
                        onClick={init}
                        className="w-full py-2 px-4 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
                      >
                        Start Detection
                      </button>
                    ) : (
                      <button 
                        onClick={stopWebcam}
                        className="w-full py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                      >
                        Stop Camera
                      </button>
                    )}
                  </div>
                </>
              ) : (
                <WebcamView isLoading={true} />
              )}
            </div>
          </Card>
          
          <Card className="p-6 shadow-lg bg-white/90 backdrop-blur">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">Detection Results</h2>
            
            <div className="space-y-6">
              {prediction && (
                <div className="text-center mb-6">
                  <div className="text-lg font-medium mb-2">Currently Detecting:</div>
                  <div className="text-2xl font-bold text-indigo-600">{prediction}</div>
                </div>
              )}
              
              <div className="space-y-8">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Smartphone className="text-indigo-600" />
                      <span className="font-medium">Phone Detection</span>
                    </div>
                    <span className="font-bold">{phonePercentage}%</span>
                  </div>
                  <BatteryIndicator percentage={phonePercentage} color="indigo" />
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <BatteryCharging className="text-emerald-600" />
                      <span className="font-medium">Charger Detection</span>
                    </div>
                    <span className="font-bold">{chargerPercentage}%</span>
                  </div>
                  <BatteryIndicator percentage={chargerPercentage} color="emerald" />
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

// Add TypeScript interface for the window object to include tmImage
declare global {
  interface Window {
    tmImage: any;
  }
}

export default Index;
