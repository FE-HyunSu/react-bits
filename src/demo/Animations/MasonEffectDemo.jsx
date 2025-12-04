import { useState, useRef } from 'react';
import { CodeTab, PreviewTab, TabsLayout } from '../../components/common/TabsLayout';
import { Box, Flex, Input, Text, Button } from '@chakra-ui/react';

import CodeExample from '../../components/code/CodeExample';
import PropTable from '../../components/common/Preview/PropTable';
import Customize from '../../components/common/Preview/Customize';
import PreviewSlider from '../../components/common/Preview/PreviewSlider';

import { masonEffect } from '../../constants/code/Animations/masonEffectCode';
import MasonEffect from '../../content/Animations/MasonEffect/MasonEffect';

const MasonEffectDemo = () => {
  const effectRef = useRef(null);
  const [text, setText] = useState('mason effect');
  const [particleColor, setParticleColor] = useState('#ffffff');
  const [maxParticles, setMaxParticles] = useState(3200);
  const [pointSize, setPointSize] = useState(0.5);
  const [densityStep, setDensityStep] = useState(2);
  const [ease, setEase] = useState(0.05);
  const [repelRadius, setRepelRadius] = useState(150);
  const [repelStrength, setRepelStrength] = useState(1);

  const handleMorph = () => {
    effectRef.current?.morph({
      text: text,
      particleColor: particleColor,
      maxParticles: maxParticles,
      pointSize: pointSize
    });
  };

  const handleScatter = () => {
    effectRef.current?.scatter();
  };

  const handleRandomText = () => {
    const texts = ['react', 'mason effect', 'PARTICLES', 'MORPH', 'reactbits'];
    const randomText = texts[Math.floor(Math.random() * texts.length)];
    setText(randomText);
    effectRef.current?.morph({ text: randomText });
  };

  const propData = [
    {
      name: 'text',
      type: 'string',
      default: 'mason effect',
      description: 'The text to display as particles. Supports \\n for line breaks.'
    },
    {
      name: 'particleColor',
      type: 'string',
      default: '#ffffff',
      description: 'The color of the particles (hex format).'
    },
    {
      name: 'maxParticles',
      type: 'number',
      default: '3200',
      description: 'Maximum number of particles to render.'
    },
    {
      name: 'pointSize',
      type: 'number',
      default: '0.5',
      description: 'Size of each particle point.'
    },
    {
      name: 'densityStep',
      type: 'number',
      default: '2',
      description: 'Sampling step for particle density. Lower = more particles.'
    },
    {
      name: 'ease',
      type: 'number',
      default: '0.05',
      description: 'Easing factor for particle movement. Higher = faster response.'
    },
    {
      name: 'repelRadius',
      type: 'number',
      default: '150',
      description: 'Radius of mouse interaction effect.'
    },
    {
      name: 'repelStrength',
      type: 'number',
      default: '1',
      description: 'Strength of mouse interaction. Positive repels, negative attracts on click.'
    },
    {
      name: 'fontFamily',
      type: 'string',
      default: 'Inter, system-ui, Arial',
      description: 'Font family for text rendering.'
    },
    {
      name: 'fontSize',
      type: 'number | null',
      default: 'null',
      description: 'Font size in pixels. Auto-calculated if null.'
    },
    {
      name: 'backgroundColor',
      type: 'string',
      default: 'transparent',
      description: 'Background color of the canvas.'
    },
    {
      name: 'debounceDelay',
      type: 'number',
      default: '150',
      description: 'Debounce delay for resize and morph operations (ms).'
    },
    {
      name: 'onReady',
      type: 'function',
      default: 'undefined',
      description: 'Callback when the effect is ready.'
    },
    {
      name: 'onUpdate',
      type: 'function',
      default: 'undefined',
      description: 'Callback on each animation frame.'
    }
  ];

  return (
    <TabsLayout>
      <PreviewTab>
        <Box position="relative" className="demo-container" h={400} p={0} overflow="hidden" bg="black">
          <MasonEffect
            ref={effectRef}
            text={text}
            particleColor={particleColor}
            maxParticles={maxParticles}
            pointSize={pointSize}
            densityStep={densityStep}
            ease={ease}
            repelRadius={repelRadius}
            repelStrength={repelStrength}
            onReady={instance => {
              console.log('MasonEffect ready!', instance);
            }}
          />
        </Box>

        <Customize className="preview-options">
          <Flex gap={4} align="center" mt={4} wrap="wrap">
            <Flex gap={2} align="center">
              <Text fontSize="sm">Text</Text>
              <Input type="text" value={text} onChange={e => setText(e.target.value)} width="120px" size="sm" />
            </Flex>

            <Button size="sm" onClick={handleMorph} colorScheme="blue">
              Morph Text
            </Button>

            <Button size="sm" onClick={handleScatter} colorScheme="purple">
              Scatter
            </Button>

            <Button size="sm" onClick={handleRandomText} colorScheme="green">
              Random Text
            </Button>
          </Flex>

          <Flex gap={4} align="center" mt={4}>
            <Text fontSize="sm">Particle Color</Text>
            <Input type="color" value={particleColor} onChange={e => setParticleColor(e.target.value)} width="50px" />
          </Flex>

          <PreviewSlider
            title="Max Particles"
            min={500}
            max={5000}
            step={100}
            value={maxParticles}
            onChange={val => setMaxParticles(val)}
            width={150}
          />

          <PreviewSlider
            title="Point Size"
            min={0.3}
            max={2.0}
            step={0.1}
            value={pointSize}
            onChange={val => setPointSize(val)}
            width={150}
          />

          <PreviewSlider
            title="Density Step"
            min={1}
            max={5}
            step={1}
            value={densityStep}
            onChange={val => setDensityStep(val)}
            width={150}
          />

          <PreviewSlider
            title="Ease"
            min={0.01}
            max={0.2}
            step={0.01}
            value={ease}
            onChange={val => setEase(val)}
            width={150}
          />

          <PreviewSlider
            title="Repel Radius"
            min={50}
            max={300}
            step={10}
            value={repelRadius}
            onChange={val => setRepelRadius(val)}
            width={150}
          />

          <PreviewSlider
            title="Repel Strength"
            min={0.1}
            max={5}
            step={0.1}
            value={repelStrength}
            onChange={val => setRepelStrength(val)}
            width={150}
          />
        </Customize>

        <PropTable data={propData} />
      </PreviewTab>

      <CodeTab>
        <CodeExample codeObject={masonEffect} />
      </CodeTab>
    </TabsLayout>
  );
};

export default MasonEffectDemo;
