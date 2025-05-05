import { useRef, useMemo, Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Points, PointMaterial, Preload } from "@react-three/drei";
import { inSphere } from "maath/random";

const Stars = (props) => {
  const ref = useRef();

  // ✅ Generate sphere points only once
  const sphere = useMemo(() => {
    const array = new Float32Array(1500); // Reduce to 1500 to avoid GPU overload
    inSphere(array, { radius: 1.2 });
    return array;
  }, []);

  // ✅ Animate stars slowly
  useFrame((_, delta) => {
    if (ref.current) {
      ref.current.rotation.x -= delta / 20;
      ref.current.rotation.y -= delta / 30;
    }
  });

  return (
    <group rotation={[0, 0, Math.PI / 4]}>
      <Points
        ref={ref}
        positions={sphere}
        stride={3}
        frustumCulled
        {...props}
      >
        <PointMaterial
          transparent
          color="#f272c8"
          size={0.004}
          sizeAttenuation
          depthWrite={false}
        />
      </Points>
    </group>
  );
};

const StarsCanvas = () => (
  <div className="w-full h-auto absolute inset-0 z-[-1]">
    <Canvas camera={{ position: [0, 0, 1] }}>
      <Suspense fallback={null}>
        <Stars />
      </Suspense>
      <Preload all />
    </Canvas>
  </div>
);

export default StarsCanvas;
