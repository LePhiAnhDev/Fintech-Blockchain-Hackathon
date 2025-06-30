import React from "react";
import { motion } from "framer-motion";
import { Wallet, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";
import PropTypes from "prop-types";
import Button from "../../../components/common/Button";
import Hyperspeed from "../../../components/common/Hyperspeed";

/**
 * Component màn hình kết nối ví
 *
 * @component
 */
const ConnectWallet = ({ onConnect, isConnecting }) => {
  // Maximum coverage preset for even larger background
  const maxCoveragePreset = {
    onSpeedUp: () => {},
    onSlowDown: () => {},
    distortion: "turbulentDistortion",
    length: 600,
    roadWidth: 40, // Massive roads for ultimate coverage
    islandWidth: 8,
    lanesPerRoad: 8, // Maximum lanes for full coverage
    fov: 130, // Ultra-wide field of view
    fovSpeedUp: 150,
    speedUp: 2.8, // Keep intensity balanced
    carLightsFade: 0.3, // Keep intensity balanced
    totalSideLightSticks: 48, // Keep intensity balanced
    lightPairsPerRoadWay: 64, // Keep intensity balanced
    shoulderLinesWidthPercentage: 0.06,
    brokenLinesWidthPercentage: 0.1,
    brokenLinesLengthPercentage: 0.5,
    lightStickWidth: [0.12, 0.6],
    lightStickHeight: [1.3, 1.8],
    movingAwaySpeed: [65, 95],
    movingCloserSpeed: [-120, -160],
    carLightsLength: [600 * 0.06, 600 * 0.2], // Adjust for new length
    carLightsRadius: [0.06, 0.15],
    carWidthPercentage: [0.3, 0.6],
    carShiftX: [-0.8, 0.8],
    carFloorSeparation: [0.1, 1.5],
    colors: {
      roadColor: 0x0a0a0a,
      islandColor: 0x0c0c0c,
      background: 0x000000,
      shoulderLines: 0x1a1a1a,
      brokenLines: 0x1a1a1a,
      leftCars: [0xff1493, 0xd856bf, 0x9932cc], // Keep vibrant colors
      rightCars: [0x00ffff, 0x03b3c3, 0x22c55e], // Keep bright colors
      sticks: 0x00bfff, // Keep bright cyan sticks
    },
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4 relative overflow-hidden">
      <Hyperspeed effectOptions={maxCoveragePreset} />
      <TopNavigation />
      <MainContent onConnect={onConnect} isConnecting={isConnecting} />
    </div>
  );
};

/**
 * Component thanh điều hướng phía trên
 */
const TopNavigation = () => (
  <div className="absolute top-6 left-6 right-6 z-30 flex justify-between items-center">
    {/* Logo */}
    <div className="flex items-center gap-4">
      <img
        src="/logo.svg"
        alt="CashDig9 Logo"
        className="w-10 h-10 drop-shadow-lg"
      />
      <span className="text-white text-xl font-bold bg-gradient-to-r from-purple-300 via-pink-300 to-green-300 bg-clip-text text-transparent drop-shadow-2xl tracking-wide">
        CashDig9
      </span>
    </div>
  </div>
);

/**
 * Component nội dung chính
 */
const MainContent = ({ onConnect, isConnecting }) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.8 }}
    className="relative z-20 text-center flex flex-col items-center justify-center"
  >
    {/* Main Title */}
    <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
      From learning to creating with
      <br />
      <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-green-400 bg-clip-text text-transparent">
        AI powered collections
      </span>
    </h1>

    {/* Action Buttons */}
    <div className="flex flex-col sm:flex-row gap-5 justify-center items-center mt-10">
      <Link to="/explore">
        <Button
          variant="ghost"
          size="lg"
          className="bg-white/10 !text-white hover:bg-white/20 hover:!text-white !border-2 !border-white/40 hover:!border-white/60 px-8 py-4 !rounded-full text-lg font-semibold min-w-[200px] backdrop-blur-sm transition-all duration-300 transform hover:scale-105 hover:shadow-2xl"
        >
          Explore CashDig9
        </Button>
      </Link>

      {window.ethereum ? (
        <Button
          onClick={onConnect}
          disabled={isConnecting}
          isLoading={isConnecting}
          variant="ghost"
          size="lg"
          className="bg-white/95 !text-black hover:bg-white hover:!text-black hover:shadow-2xl px-8 py-4 !rounded-full text-lg font-semibold min-w-[200px] !border-2 !border-white/30 hover:!border-white/50 transition-all duration-300 transform hover:scale-105"
        >
          {isConnecting ? "Connecting..." : "Connect Wallet"}
        </Button>
      ) : (
        <Button
          onClick={() => {
            window.open("https://metamask.io/download/", "_blank");
          }}
          variant="ghost"
          size="lg"
          className="bg-white/95 !text-black hover:bg-white hover:!text-black hover:shadow-2xl px-8 py-4 !rounded-full text-lg font-semibold min-w-[200px] !border-2 !border-white/30 hover:!border-white/50 transition-all duration-300 transform hover:scale-105"
        >
          Install MetaMask
        </Button>
      )}
    </div>
  </motion.div>
);

ConnectWallet.propTypes = {
  /** Hàm callback kết nối ví */
  onConnect: PropTypes.func.isRequired,
  /** Trạng thái đang kết nối */
  isConnecting: PropTypes.bool,
};

export default ConnectWallet;
