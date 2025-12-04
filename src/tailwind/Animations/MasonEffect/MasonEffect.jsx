import { useRef, useEffect, forwardRef, useImperativeHandle } from 'react';

// Debounce utility
function debounce(func, wait) {
  let timeout = null;
  return function executedFunction(...args) {
    const later = () => {
      timeout = null;
      func.apply(this, args);
    };
    if (timeout !== null) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(later, wait);
  };
}

const MasonEffect = forwardRef(
  (
    {
      className = '',
      text = 'masoneffect',
      particleColor = '#ffffff',
      maxParticles = 3200,
      pointSize = 0.5,
      densityStep = 2,
      ease = 0.05,
      repelRadius = 150,
      repelStrength = 1,
      fontFamily = 'Inter, system-ui, Arial',
      fontSize = null,
      backgroundColor = 'transparent',
      debounceDelay = 150,
      onReady,
      onUpdate
    },
    ref
  ) => {
    const containerRef = useRef(null);
    const canvasRef = useRef(null);
    const offCanvasRef = useRef(null);
    const particlesRef = useRef([]);
    const mouseRef = useRef({ x: 0, y: 0, down: false });
    const animationRef = useRef(null);
    const isRunningRef = useRef(false);
    const isVisibleRef = useRef(false);
    const observerRef = useRef(null);
    const configRef = useRef({
      text,
      particleColor,
      maxParticles,
      pointSize,
      densityStep,
      ease,
      repelRadius,
      repelStrength,
      fontFamily,
      fontSize
    });

    // Measure text fit helper
    const measureTextFit = (ctx, fontSize, text, maxWidth, maxHeight) => {
      ctx.font = `400 ${fontSize}px ${configRef.current.fontFamily}`;
      const lines = text.split('\n');
      const lineHeight = fontSize;
      const lineSpacing = fontSize * 0.1;
      const spacing = fontSize * 0.05;

      let maxLineWidth = 0;
      for (const line of lines) {
        if (line.length === 0) continue;
        const textWidth = ctx.measureText(line).width;
        const totalWidth = textWidth + spacing * (line.length > 0 ? line.length - 1 : 0);
        maxLineWidth = Math.max(maxLineWidth, totalWidth);
      }

      const totalHeight =
        lines.length > 0 ? lineHeight * lines.length + lineSpacing * (lines.length - 1) : lineHeight;

      return {
        width: maxLineWidth,
        height: totalHeight,
        fits: maxLineWidth <= maxWidth && totalHeight <= maxHeight
      };
    };

    // Binary search for optimal font size
    const findOptimalFontSize = (ctx, text, maxWidth, maxHeight, initialFontSize) => {
      const minFontSize = 12;
      const initialMeasure = measureTextFit(ctx, initialFontSize, text, maxWidth, maxHeight);
      if (initialMeasure.fits) return initialFontSize;
      if (initialFontSize <= minFontSize) return minFontSize;

      let low = minFontSize;
      let high = initialFontSize;
      let bestSize = minFontSize;

      while (low <= high) {
        const mid = Math.floor((low + high) / 2);
        const measure = measureTextFit(ctx, mid, text, maxWidth, maxHeight);

        if (measure.fits) {
          bestSize = mid;
          low = mid + 1;
        } else {
          high = mid - 1;
        }
      }

      return bestSize;
    };

    const buildTargets = () => {
      const canvas = canvasRef.current;
      const offCanvas = offCanvasRef.current;
      if (!canvas || !offCanvas) return;

      const W = canvas.width;
      const H = canvas.height;
      if (W <= 0 || H <= 0) return;

      const offCtx = offCanvas.getContext('2d', { willReadFrequently: true });
      offCanvas.width = W;
      offCanvas.height = H;
      offCtx.clearRect(0, 0, W, H);

      const base = Math.min(W, H);
      const initialFontSize = configRef.current.fontSize || Math.max(80, Math.floor(base * 0.18));
      const padding = 40;
      const maxWidth = W - padding * 2;
      const maxHeight = H - padding * 2;

      const fontSize = findOptimalFontSize(
        offCtx,
        configRef.current.text,
        maxWidth,
        maxHeight,
        initialFontSize
      );

      offCtx.fillStyle = '#ffffff';
      offCtx.textAlign = 'center';
      offCtx.textBaseline = 'middle';
      offCtx.font = `400 ${fontSize}px ${configRef.current.fontFamily}`;

      const lines = configRef.current.text.split('\n');
      const lineHeight = fontSize;
      const lineSpacing = fontSize * 0.1;
      const spacing = fontSize * 0.05;

      const totalTextHeight =
        lines.length > 0 ? lineHeight * lines.length + lineSpacing * (lines.length - 1) : lineHeight;
      let startY = H / 2 - totalTextHeight / 2 + lineHeight / 2;

      for (const line of lines) {
        if (line.length === 0) {
          startY += lineHeight + lineSpacing;
          continue;
        }

        const chars = line.split('');
        const totalWidth = offCtx.measureText(line).width + spacing * (chars.length - 1);
        let x = W / 2 - totalWidth / 2;

        for (const ch of chars) {
          offCtx.fillText(ch, x + offCtx.measureText(ch).width / 2, startY);
          x += offCtx.measureText(ch).width + spacing;
        }

        startY += lineHeight + lineSpacing;
      }

      const step = Math.max(2, configRef.current.densityStep);
      const img = offCtx.getImageData(0, 0, W, H).data;
      const targets = [];

      for (let y = 0; y < H; y += step) {
        for (let x = 0; x < W; x += step) {
          const i = (y * W + x) * 4;
          if (img[i] + img[i + 1] + img[i + 2] > 600) {
            targets.push({ x, y });
          }
        }
      }

      while (targets.length > configRef.current.maxParticles) {
        targets.splice(Math.floor(Math.random() * targets.length), 1);
      }

      const particles = particlesRef.current;
      if (particles.length < targets.length) {
        const need = targets.length - particles.length;
        for (let i = 0; i < need; i++) {
          const sx = Math.random() * W;
          const sy = Math.random() * H;
          particles.push({
            x: sx,
            y: sy,
            vx: 0,
            vy: 0,
            tx: sx,
            ty: sy,
            initialX: sx,
            initialY: sy,
            j: Math.random() * Math.PI * 2
          });
        }
      } else if (particles.length > targets.length) {
        particles.length = targets.length;
      }

      for (let i = 0; i < particles.length; i++) {
        particles[i].tx = targets[i].x;
        particles[i].ty = targets[i].y;
      }
    };

    const resize = () => {
      const container = containerRef.current;
      const canvas = canvasRef.current;
      if (!container || !canvas) return;

      const dpr = Math.min(window.devicePixelRatio || 1, 1.8);
      const width = container.clientWidth || window.innerWidth;
      const height = container.clientHeight || window.innerHeight * 0.7;

      if (width <= 0 || height <= 0) return;

      let W = Math.floor(width * dpr);
      let H = Math.floor(height * dpr);

      const MAX_CANVAS_SIZE = 4096;
      if (W > MAX_CANVAS_SIZE || H > MAX_CANVAS_SIZE) {
        const scale = Math.min(MAX_CANVAS_SIZE / W, MAX_CANVAS_SIZE / H);
        W = Math.floor(W * scale);
        H = Math.floor(H * scale);
      }

      canvas.width = W;
      canvas.height = H;
      canvas.style.width = width + 'px';
      canvas.style.height = height + 'px';

      if (W > 0 && H > 0) {
        buildTargets();
      }
    };

    const debouncedResize = useRef(null);

    const update = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      const W = canvas.width;
      const H = canvas.height;
      const dpr = Math.min(window.devicePixelRatio || 1, 1.8);

      ctx.clearRect(0, 0, W, H);

      if (backgroundColor !== 'transparent') {
        ctx.fillStyle = backgroundColor;
        ctx.fillRect(0, 0, W, H);
      }

      const particles = particlesRef.current;
      const mouse = mouseRef.current;
      const config = configRef.current;

      for (const p of particles) {
        let ax = (p.tx - p.x) * config.ease;
        let ay = (p.ty - p.y) * config.ease;

        if (mouse.x || mouse.y) {
          const dx = p.x - mouse.x;
          const dy = p.y - mouse.y;
          const d2 = dx * dx + dy * dy;
          const r = config.repelRadius * dpr;
          if (d2 < r * r) {
            const d = Math.sqrt(d2) + 0.0001;
            const f = (mouse.down ? -1 : 1) * config.repelStrength * (1 - d / r);
            ax += (dx / d) * f * 6.0;
            ay += (dy / d) * f * 6.0;
          }
        }

        p.j += 2;
        ax += Math.cos(p.j) * 0.05;
        ay += Math.sin(p.j * 1.3) * 0.05;

        p.vx = (p.vx + ax) * Math.random();
        p.vy = (p.vy + ay) * Math.random();
        p.x += p.vx;
        p.y += p.vy;
      }

      ctx.fillStyle = config.particleColor;
      const r = config.pointSize * dpr;
      for (const p of particles) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
        ctx.fill();
      }

      if (onUpdate) onUpdate({ particles, canvas });
    };

    const animate = () => {
      if (!isRunningRef.current) return;
      update();
      animationRef.current = requestAnimationFrame(animate);
    };

    const start = () => {
      if (isRunningRef.current) return;
      isRunningRef.current = true;
      animate();
    };

    const stop = () => {
      isRunningRef.current = false;
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
    };

    useImperativeHandle(ref, () => ({
      morph: textOrOptions => {
        if (typeof textOrOptions === 'string') {
          configRef.current.text = textOrOptions;
        } else if (textOrOptions && typeof textOrOptions === 'object') {
          Object.assign(configRef.current, textOrOptions);
        }
        buildTargets();
      },
      scatter: () => {
        particlesRef.current.forEach(p => {
          if (p.initialX !== undefined && p.initialY !== undefined) {
            p.tx = p.initialX;
            p.ty = p.initialY;
          }
        });
      },
      updateConfig: newConfig => {
        Object.assign(configRef.current, newConfig);
        if (newConfig.text) buildTargets();
      },
      getInstance: () => ({
        particles: particlesRef.current,
        canvas: canvasRef.current
      })
    }));

    useEffect(() => {
      const canvas = canvasRef.current;
      const container = containerRef.current;
      if (!canvas || !container) return;

      offCanvasRef.current = document.createElement('canvas');

      debouncedResize.current = debounce(resize, debounceDelay);

      const handleMouseMove = e => {
        const rect = canvas.getBoundingClientRect();
        const dpr = Math.min(window.devicePixelRatio || 1, 1.8);
        mouseRef.current.x = (e.clientX - rect.left) * dpr;
        mouseRef.current.y = (e.clientY - rect.top) * dpr;
      };

      const handleMouseLeave = () => {
        mouseRef.current.x = mouseRef.current.y = 0;
      };

      const handleMouseDown = () => {
        mouseRef.current.down = true;
      };

      const handleMouseUp = () => {
        mouseRef.current.down = false;
      };

      // IntersectionObserver
      if (typeof IntersectionObserver !== 'undefined') {
        observerRef.current = new IntersectionObserver(
          entries => {
            for (const entry of entries) {
              if (entry.target !== container) continue;
              if (entry.isIntersecting) {
                isVisibleRef.current = true;
                start();
              } else {
                isVisibleRef.current = false;
                stop();
              }
            }
          },
          { threshold: 0.1 }
        );
        observerRef.current.observe(container);
      } else {
        isVisibleRef.current = true;
        start();
      }

      window.addEventListener('resize', debouncedResize.current);
      canvas.addEventListener('mousemove', handleMouseMove);
      canvas.addEventListener('mouseleave', handleMouseLeave);
      canvas.addEventListener('mousedown', handleMouseDown);
      window.addEventListener('mouseup', handleMouseUp);

      resize();

      if (onReady) {
        onReady({ particles: particlesRef.current, canvas });
      }

      return () => {
        stop();
        if (observerRef.current) {
          observerRef.current.disconnect();
        }
        window.removeEventListener('resize', debouncedResize.current);
        canvas.removeEventListener('mousemove', handleMouseMove);
        canvas.removeEventListener('mouseleave', handleMouseLeave);
        canvas.removeEventListener('mousedown', handleMouseDown);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }, []);

    // Props 변경 감지
    useEffect(() => {
      configRef.current = {
        text,
        particleColor,
        maxParticles,
        pointSize,
        densityStep,
        ease,
        repelRadius,
        repelStrength,
        fontFamily,
        fontSize
      };
      buildTargets();
    }, [text, particleColor, maxParticles, pointSize, densityStep, ease, repelRadius, repelStrength, fontFamily, fontSize]);

    return (
      <div ref={containerRef} className={`relative w-full h-full overflow-hidden ${className}`}>
        <canvas ref={canvasRef} className="absolute top-0 left-0 w-full h-full" />
      </div>
    );
  }
);

MasonEffect.displayName = 'MasonEffect';

export default MasonEffect;
