
import React from 'react';
import { Loader2 } from 'lucide-react';

interface WebcamViewProps {
  isLoading?: boolean;
}

const WebcamView = ({ isLoading = false }: WebcamViewProps) => {
  return (
    <div className="rounded-lg overflow-hidden bg-gray-900 h-[400px] flex items-center justify-center flex-col">
      {isLoading ? (
        <>
          <Loader2 className="h-10 w-10 text-indigo-500 animate-spin mb-4" />
          <p className="text-white text-sm">Loading machine learning model...</p>
        </>
      ) : (
        <p className="text-white">Camera not available</p>
      )}
    </div>
  );
};

export default WebcamView;
