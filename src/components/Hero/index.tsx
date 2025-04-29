"use client";
import React, { ReactNode } from "react";
import { motion } from "framer-motion";
import Button from "../Button";

interface HeroProps {
  title: string | ReactNode;
  subtitle: string | ReactNode;
  backgroundImage?: string;
  ctaText?: string;
  onCtaClick?: () => void;
  height?: string;
  className?: string;
}

const Hero: React.FC<HeroProps> = ({
  title,
  subtitle,
  backgroundImage = "/images/mystery-box-bg.jpg",
  ctaText,
  onCtaClick,
  height = "h-96",
  className = "",
}) => {
  return (
    <section className={`mb-16 relative overflow-hidden ${className}`}>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
        className={`relative rounded-2xl overflow-hidden ${height}`}
      >
        <div 
          className="absolute inset-0 bg-cover bg-center z-0"
          style={{ backgroundImage: `url(${backgroundImage})` }}
        ></div>
        
        <div className="absolute inset-0 flex items-center z-20">
          <div className="container mx-auto px-4">
            <div className="max-w-2xl">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="mb-4"
              >
                {typeof title === 'string' ? (
                  <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-rose-500 to-purple-600">
                    {title}
                  </h1>
                ) : (
                  title
                )}
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.5 }}
                className="mb-6"
              >
                {typeof subtitle === 'string' ? (
                  <p className="text-xl text-cyan-300">{subtitle}</p>
                ) : (
                  subtitle
                )}
              </motion.div>
              
              {ctaText && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.7 }}
                >
                  <Button variant="secondary" size="lg" onClick={onCtaClick}>
                    {ctaText}
                  </Button>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
};

export default Hero; 