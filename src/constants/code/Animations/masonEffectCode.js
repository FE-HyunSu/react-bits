import code from '@content/Animations/MasonEffect/MasonEffect.jsx?raw';
import css from '@content/Animations/MasonEffect/MasonEffect.css?raw';
import tailwind from '@tailwind/Animations/MasonEffect/MasonEffect.jsx?raw';
import tsCode from '@ts-default/Animations/MasonEffect/MasonEffect.tsx?raw';
import tsTailwind from '@ts-tailwind/Animations/MasonEffect/MasonEffect.tsx?raw';

export const masonEffect = {
  usage: `import MasonEffect from './MasonEffect';
import { useRef } from 'react';

function App() {
  const effectRef = useRef(null);

  const handleMorph = () => {
    effectRef.current?.morph({ text: 'New Text!' });
  };

  const handleScatter = () => {
    effectRef.current?.scatter();
  };

  return (
    <>
      <MasonEffect
        ref={effectRef}
        text="MASON"
        particleColor="#ffffff"
        maxParticles={3200}
        pointSize={0.5}
        densityStep={2}
        ease={0.05}
        repelRadius={150}
        repelStrength={1}
        fontFamily="Inter, system-ui, Arial"
        fontSize={null}
        backgroundColor="transparent"
        debounceDelay={150}
        onReady={(instance) => {
          console.log('Ready!', instance);
        }}
        onUpdate={(instance) => {
          // Called on each frame
        }}
      />
      <button onClick={handleMorph}>Morph</button>
      <button onClick={handleScatter}>Scatter</button>
    </>
  );
}`,
  code,
  css,
  tailwind,
  tsCode,
  tsTailwind
};

