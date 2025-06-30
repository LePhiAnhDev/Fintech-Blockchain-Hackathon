import React, { useState } from "react";
import { motion } from "framer-motion";
import LoadingScreen from "./index";
import LoadingSpinner from "./LoadingSpinner";
import LoadingCard from "./LoadingCard";
import { Button } from "../index";

/**
 * Component demo để hiển thị tất cả các loại loading
 *
 * @component
 */
const LoadingDemo = () => {
  const [showFullScreen, setShowFullScreen] = useState(false);

  if (showFullScreen) {
    return <LoadingScreen />;
  }

  return (
    <div className="min-h-screen bg-slate-900 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">
          Loading Components Demo
        </h1>

        {/* Full Screen Loading */}
        <section className="mb-12">
          <h2 className="text-xl font-semibold text-white mb-4">
            Full Screen Loading
          </h2>
          <Button onClick={() => setShowFullScreen(true)} className="mb-4">
            Show Full Screen Loading
          </Button>
          <p className="text-slate-400">
            Click để xem full screen loading (nhấn ESC để thoát)
          </p>
        </section>

        {/* Loading Spinners */}
        <section className="mb-12">
          <h2 className="text-xl font-semibold text-white mb-6">
            Loading Spinners
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Sizes */}
            <div className="bg-slate-800 p-6 rounded-lg">
              <h3 className="text-white font-medium mb-4">Sizes</h3>
              <div className="space-y-4">
                <LoadingSpinner size="sm" text="Small" />
                <LoadingSpinner size="md" text="Medium" />
                <LoadingSpinner size="lg" text="Large" />
                <LoadingSpinner size="xl" text="Extra Large" />
              </div>
            </div>

            {/* Colors */}
            <div className="bg-slate-800 p-6 rounded-lg">
              <h3 className="text-white font-medium mb-4">Colors</h3>
              <div className="space-y-4">
                <LoadingSpinner variant="primary" text="Primary" />
                <LoadingSpinner variant="white" text="White" />
                <LoadingSpinner variant="success" text="Success" />
                <LoadingSpinner variant="warning" text="Warning" />
                <LoadingSpinner variant="error" text="Error" />
              </div>
            </div>

            {/* Without Text */}
            <div className="bg-slate-800 p-6 rounded-lg">
              <h3 className="text-white font-medium mb-4">Without Text</h3>
              <div className="space-y-4">
                <LoadingSpinner showText={false} />
                <LoadingSpinner size="lg" showText={false} variant="success" />
                <LoadingSpinner size="xl" showText={false} variant="warning" />
              </div>
            </div>
          </div>
        </section>

        {/* Loading Cards */}
        <section className="mb-12">
          <h2 className="text-xl font-semibold text-white mb-6">
            Loading Cards (Skeleton)
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <h3 className="text-white font-medium mb-4">Default</h3>
              <LoadingCard variant="default" />
            </div>
            <div>
              <h3 className="text-white font-medium mb-4">Tall</h3>
              <LoadingCard variant="tall" />
            </div>
            <div>
              <h3 className="text-white font-medium mb-4">Short</h3>
              <LoadingCard variant="short" />
            </div>
          </div>
        </section>

        {/* Usage Examples */}
        <section className="mb-12">
          <h2 className="text-xl font-semibold text-white mb-6">
            Usage Examples
          </h2>
          <div className="bg-slate-800 p-6 rounded-lg">
            <pre className="text-green-400 text-sm overflow-x-auto">
              {`// Full Screen Loading
import { LoadingScreen } from '@/components/common';
<LoadingScreen />

// Loading Spinner
import { LoadingSpinner } from '@/components/common';
<LoadingSpinner size="lg" variant="primary" text="Loading data..." />

// Loading Card (Skeleton)
import { LoadingCard } from '@/components/common';
<LoadingCard variant="tall" className="mb-4" />

// Multiple Loading Cards
{Array.from({ length: 3 }).map((_, i) => (
    <LoadingCard key={i} variant="default" className="mb-4" />
))}`}
            </pre>
          </div>
        </section>
      </div>

      {/* ESC to close full screen */}
      {showFullScreen && (
        <div
          className="fixed inset-0 z-50"
          onClick={() => setShowFullScreen(false)}
          onKeyDown={(e) => {
            if (e.key === "Escape") {
              setShowFullScreen(false);
            }
          }}
          tabIndex={0}
        />
      )}
    </div>
  );
};

export default LoadingDemo;
