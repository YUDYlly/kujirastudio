"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { useGLTF, Environment } from "@react-three/drei";
import { useRef, Suspense } from "react";
import * as THREE from "three";

interface WhaleModelProps {
    index: number;
}

function WhaleModel({ index }: WhaleModelProps) {
    // Load the glTF model. Ensure the file exists at /public/models/whale-lowpoly.glb
    const { scene } = useGLTF("/models/whale-lowpoly.glb");
    const whaleRef = useRef<THREE.Group>(null);
    const targetPosition = useRef(new THREE.Vector3(0, 0, 0));
    const currentPosition = useRef(new THREE.Vector3(0, 0, 0));
    const previousPosition = useRef(new THREE.Vector3(0, 0, 0));
    const velocity = useRef(new THREE.Vector3(0, 0, 0));
    
    // Track frame count for optimization
    const frameCount = useRef(0);

    // Each whale has unique parameters with more randomness (memoized)
    const offset = useRef(index * (Math.PI * 2 / 3)).current; // 120 degrees apart
    const speedMultiplier = useRef(0.8 + (index * 0.3)).current; // More varied speeds (0.8, 1.1, 1.4)
    const scale = useRef(2.5 - (index * 0.3)).current; // Different sizes
    
    // Random movement patterns for each whale (memoized)
    const pattern = useRef([
        { x: 4, y: 2, z: 3, xSpeed: 0.15, ySpeed: 0.2, zSpeed: 0.15 }, // Whale 0
        { x: 5, y: 1.5, z: 4, xSpeed: 0.18, ySpeed: 0.15, zSpeed: 0.12 }, // Whale 1
        { x: 3.5, y: 2.5, z: 2.5, xSpeed: 0.12, ySpeed: 0.22, zSpeed: 0.18 }, // Whale 2
    ][index]).current;
    
    // Random rotation patterns for each whale (memoized)
    const rotation = useRef([
        { rollSpeed: 0.25, rollAmp: 0.35 },
        { rollSpeed: 0.3, rollAmp: 0.4 },
        { rollSpeed: 0.2, rollAmp: 0.3 },
    ][index]).current;

    useFrame((state) => {
        if (!whaleRef.current) return;
        
        frameCount.current++;
        const time = state.clock.elapsedTime * speedMultiplier;

        // Free swimming pattern with unique paths for each whale
        targetPosition.current.x = Math.sin(time * pattern.xSpeed + offset) * pattern.x;
        targetPosition.current.y = Math.sin(time * pattern.ySpeed + offset) * pattern.y;
        targetPosition.current.z = Math.cos(time * pattern.zSpeed + offset) * pattern.z;

        // Store previous position before updating
        previousPosition.current.copy(currentPosition.current);

        // Smooth interpolation for natural movement
        currentPosition.current.lerp(targetPosition.current, 0.02);
        whaleRef.current.position.copy(currentPosition.current);

        // Calculate velocity (direction of movement)
        velocity.current.subVectors(currentPosition.current, previousPosition.current);

        // Update rotation only every 2 frames to reduce calculations
        if (frameCount.current % 2 === 0) {
            // Only update rotation if whale is actually moving
            if (velocity.current.length() > 0.001) {
                // Calculate target rotation based on velocity direction
                const targetYaw = Math.atan2(velocity.current.x, velocity.current.z);
                const targetPitch = Math.atan2(velocity.current.y, 
                    Math.sqrt(velocity.current.x ** 2 + velocity.current.z ** 2));

                // Handle the angle wrapping issue (shortest path rotation)
                const currentYaw = whaleRef.current.rotation.y;
                let yawDiff = targetYaw - currentYaw;
                
                // Normalize angle difference to [-PI, PI]
                while (yawDiff > Math.PI) yawDiff -= Math.PI * 2;
                while (yawDiff < -Math.PI) yawDiff += Math.PI * 2;
                
                // Apply the smallest rotation
                const newYaw = currentYaw + yawDiff * 0.02; // Very slow rotation (2%)

                // Smoothly rotate whale to face direction of movement
                whaleRef.current.rotation.y = newYaw;

                // Pitch - tilt up/down based on vertical movement (very gentle)
                whaleRef.current.rotation.x = THREE.MathUtils.lerp(
                    whaleRef.current.rotation.x,
                    -targetPitch * 0.3, // Reduced from 0.5 to 0.3
                    0.02 // Very slow (2%)
                );
            }

            // Roll (Z axis) - side to side tilt based on turning (very gentle)
            const turningSpeed = velocity.current.x;
            whaleRef.current.rotation.z = THREE.MathUtils.lerp(
                whaleRef.current.rotation.z,
                Math.sin(time * rotation.rollSpeed + offset) * rotation.rollAmp + turningSpeed * 0.3,
                0.05
            );
        }
    });

    return (
        <group ref={whaleRef} dispose={null}>
            <primitive object={scene.clone()} scale={[scale, scale, scale]} />
        </group>
    );
}

export default function SceneKujira() {
    return (
        <div className="absolute inset-0 -z-10 h-full w-full" style={{ backgroundColor: '#001A33' }}>
            <Canvas 
                camera={{ position: [0, 0, 12], fov: 50 }}
                dpr={[1, 1.5]}
                performance={{ min: 0.5 }}
                gl={{ 
                    antialias: false,
                    alpha: false,
                    stencil: false,
                    depth: true,
                    powerPreference: "high-performance"
                }}
            >
                <color attach="background" args={["#001A33"]} />
                <fog attach="fog" args={["#001A33", 8, 25]} />
                <ambientLight intensity={0.6} color="#004080" />
                <directionalLight 
                    position={[5, 5, 5]} 
                    intensity={0.8} 
                    color="#5a9fd4"
                />
                <Suspense fallback={null}>
                    <WhaleModel index={0} />
                    <WhaleModel index={1} />
                    <WhaleModel index={2} />
                    {/* Environment for subtle reflections */}
                    <Environment preset="night" />
                </Suspense>
            </Canvas>
        </div>
    );
}

// Preload the model
useGLTF.preload("/models/whale-lowpoly.glb");
