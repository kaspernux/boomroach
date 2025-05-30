"use client";

import {
  AnimatePresence,
  motion,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";
import { useInView } from "framer-motion";
import React from "react";

// Stagger container for list animations
export const StaggerContainer = ({
  children,
  className = "",
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) => {
  return (
    <motion.div
      className={className}
      initial="hidden"
      animate="visible"
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            delayChildren: delay,
            staggerChildren: 0.1,
          },
        },
      }}
    >
      {children}
    </motion.div>
  );
};

// Item animation for stagger lists
export const StaggerItem = ({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <motion.div
      className={className}
      variants={{
        hidden: { y: 20, opacity: 0 },
        visible: {
          y: 0,
          opacity: 1,
          transition: {
            type: "spring",
            damping: 25,
            stiffness: 200,
          },
        },
      }}
    >
      {children}
    </motion.div>
  );
};

// Slide up animation for mobile-like reveals
export const SlideUp = ({
  children,
  className = "",
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) => {
  const ref = React.useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ y: 50, opacity: 0 }}
      animate={isInView ? { y: 0, opacity: 1 } : { y: 50, opacity: 0 }}
      transition={{
        type: "spring",
        damping: 20,
        stiffness: 100,
        delay,
      }}
    >
      {children}
    </motion.div>
  );
};

// Scale animation for cards
export const ScaleOnHover = ({
  children,
  className = "",
  scale = 1.02,
}: {
  children: React.ReactNode;
  className?: string;
  scale?: number;
}) => {
  return (
    <motion.div
      className={className}
      whileHover={{
        scale,
        transition: { type: "spring", damping: 20, stiffness: 300 },
      }}
      whileTap={{ scale: 0.98 }}
    >
      {children}
    </motion.div>
  );
};

// Pulse animation for important elements
export const PulseGlow = ({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <motion.div
      className={className}
      animate={{
        boxShadow: [
          "0 0 20px rgba(255, 165, 0, 0.4)",
          "0 0 40px rgba(255, 165, 0, 0.8)",
          "0 0 20px rgba(255, 165, 0, 0.4)",
        ],
      }}
      transition={{
        duration: 2,
        repeat: Number.POSITIVE_INFINITY,
        ease: "easeInOut",
      }}
    >
      {children}
    </motion.div>
  );
};

// Floating animation
export const FloatingElement = ({
  children,
  className = "",
  amplitude = 10,
}: {
  children: React.ReactNode;
  className?: string;
  amplitude?: number;
}) => {
  return (
    <motion.div
      className={className}
      animate={{
        y: [-amplitude, amplitude, -amplitude],
      }}
      transition={{
        duration: 3,
        repeat: Number.POSITIVE_INFINITY,
        ease: "easeInOut",
      }}
    >
      {children}
    </motion.div>
  );
};

// Parallax scrolling effect
export const ParallaxElement = ({
  children,
  offset = 50,
  className = "",
}: {
  children: React.ReactNode;
  offset?: number;
  className?: string;
}) => {
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 1000], [0, offset]);
  const smoothY = useSpring(y, { damping: 50, stiffness: 100 });

  return (
    <motion.div className={className} style={{ y: smoothY }}>
      {children}
    </motion.div>
  );
};

// Typewriter effect
export const TypewriterText = ({
  text,
  className = "",
  speed = 50,
}: {
  text: string;
  className?: string;
  speed?: number;
}) => {
  const [displayText, setDisplayText] = React.useState("");
  const [currentIndex, setCurrentIndex] = React.useState(0);

  React.useEffect(() => {
    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setDisplayText((prev) => prev + text[currentIndex]);
        setCurrentIndex((prev) => prev + 1);
      }, speed);

      return () => clearTimeout(timeout);
    }
  }, [currentIndex, text, speed]);

  return (
    <motion.span
      className={className}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {displayText}
      <motion.span
        animate={{ opacity: [0, 1, 0] }}
        transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY }}
        className="inline-block w-0.5 h-1em bg-current ml-1"
      />
    </motion.span>
  );
};

// Card flip animation
export const FlipCard = ({
  frontContent,
  backContent,
  className = "",
}: {
  frontContent: React.ReactNode;
  backContent: React.ReactNode;
  className?: string;
}) => {
  const [isFlipped, setIsFlipped] = React.useState(false);

  return (
    <motion.div
      className={`relative ${className}`}
      style={{ perspective: 1000 }}
      onHoverStart={() => setIsFlipped(true)}
      onHoverEnd={() => setIsFlipped(false)}
    >
      <motion.div
        className="relative w-full h-full"
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ type: "spring", damping: 20, stiffness: 200 }}
        style={{ transformStyle: "preserve-3d" }}
      >
        {/* Front */}
        <div
          className="absolute inset-0 w-full h-full"
          style={{ backfaceVisibility: "hidden" }}
        >
          {frontContent}
        </div>

        {/* Back */}
        <div
          className="absolute inset-0 w-full h-full"
          style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
        >
          {backContent}
        </div>
      </motion.div>
    </motion.div>
  );
};

// Magnetic button effect
export const MagneticButton = ({
  children,
  className = "",
  strength = 0.3,
}: {
  children: React.ReactNode;
  className?: string;
  strength?: number;
}) => {
  const [mousePosition, setMousePosition] = React.useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = React.useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    setMousePosition({
      x: (e.clientX - centerX) * strength,
      y: (e.clientY - centerY) * strength,
    });
  };

  return (
    <motion.div
      className={className}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => {
        setIsHovering(false);
        setMousePosition({ x: 0, y: 0 });
      }}
      animate={{
        x: isHovering ? mousePosition.x : 0,
        y: isHovering ? mousePosition.y : 0,
      }}
      transition={{ type: "spring", damping: 20, stiffness: 300 }}
    >
      {children}
    </motion.div>
  );
};

// Loading shimmer effect
export const ShimmerLoader = ({ className = "" }: { className?: string }) => {
  return (
    <motion.div
      className={`bg-gradient-to-r from-transparent via-white/10 to-transparent ${className}`}
      animate={{
        x: ["-100%", "100%"],
      }}
      transition={{
        duration: 1.5,
        repeat: Number.POSITIVE_INFINITY,
        ease: "linear",
      }}
    />
  );
};

// Number counter animation
export const AnimatedCounter = ({
  from,
  to,
  duration = 2,
  className = "",
  prefix = "",
  suffix = "",
}: {
  from: number;
  to: number;
  duration?: number;
  className?: string;
  prefix?: string;
  suffix?: string;
}) => {
  const ref = React.useRef(null);
  const isInView = useInView(ref, { once: true });
  const [count, setCount] = React.useState(from);

  React.useEffect(() => {
    if (isInView) {
      const controls = {
        duration: duration * 1000,
        ease: "easeOut",
      };

      let startTime: number;
      let animationId: number;

      const animate = (currentTime: number) => {
        if (!startTime) startTime = currentTime;

        const progress = Math.min(
          (currentTime - startTime) / controls.duration,
          1,
        );
        const easedProgress = 1 - (1 - progress) ** 3; // ease-out cubic

        const currentCount = from + (to - from) * easedProgress;
        setCount(Math.floor(currentCount));

        if (progress < 1) {
          animationId = requestAnimationFrame(animate);
        }
      };

      animationId = requestAnimationFrame(animate);

      return () => cancelAnimationFrame(animationId);
    }
  }, [isInView, from, to, duration]);

  return (
    <span ref={ref} className={className}>
      {prefix}
      {count.toLocaleString()}
      {suffix}
    </span>
  );
};

// Reveal on scroll with different directions
export const RevealOnScroll = ({
  children,
  direction = "up",
  className = "",
  delay = 0,
}: {
  children: React.ReactNode;
  direction?: "up" | "down" | "left" | "right";
  className?: string;
  delay?: number;
}) => {
  const ref = React.useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  const variants = {
    hidden: {
      opacity: 0,
      y: direction === "up" ? 50 : direction === "down" ? -50 : 0,
      x: direction === "left" ? 50 : direction === "right" ? -50 : 0,
    },
    visible: {
      opacity: 1,
      y: 0,
      x: 0,
      transition: {
        type: "spring",
        damping: 20,
        stiffness: 100,
        delay,
      },
    },
  };

  return (
    <motion.div
      ref={ref}
      className={className}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={variants}
    >
      {children}
    </motion.div>
  );
};
