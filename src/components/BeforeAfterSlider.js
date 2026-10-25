import React, { useState } from 'react';
import { Sparkles, ShieldCheck, Droplets, ArrowLeftRight } from 'lucide-react';

export const BeforeAfterSlider = () => {
  const [sliderPos, setSliderPos] = useState(50);

  const handleSliderChange = (e) => {
    setSliderPos(e.target.value);
  };

  return (
    <div className="before-after-section">
      <div className="section-head-center">
        <div className="section-mini-tag">
          <Sparkles size={13} /> The Unique Standard
        </div>
        <h2 className="section-heading-lg">Artisanal Decontamination & Gloss Restoration</h2>
        <p className="section-subtext">
          Drag the slider to observe our 3-stage chemical decontamination and 9H ceramic coating in real-time.
        </p>
      </div>

      <div className="comparison-container">
        <div className="comparison-frame">
          {/* After Image (Full background) */}
          <img
            src="/images/foam_wash.jpg"
            alt="After High Gloss Detailing"
            className="comparison-img after-img"
          />
          <div className="image-badge badge-after">
            <Sparkles size={13} /> STAGE 3: Ceramic Hydrophobic Coat
          </div>

          {/* Before Image (Clipped) */}
          <div
            className="comparison-clip"
            style={{ width: `${sliderPos}%` }}
          >
            <img
              src="/images/mahindra_thar.jpg"
              alt="Before Treatment"
              className="comparison-img before-img"
            />
            <div className="image-badge badge-before">
              BEFORE: Factory Finish
            </div>
          </div>

          {/* Divider line and handle */}
          <div
            className="slider-divider-line"
            style={{ left: `${sliderPos}%` }}
          >
            <div className="slider-handle-circle">
              <ArrowLeftRight size={16} />
            </div>
          </div>

          <input
            type="range"
            min="0"
            max="100"
            value={sliderPos}
            onChange={handleSliderChange}
            className="slider-native-input"
            aria-label="Before and after comparison slider"
          />
        </div>

        <div className="comparison-stats-row">
          <div className="stat-card">
            <div className="stat-icon"><Droplets size={20} /></div>
            <div className="stat-value">110°+</div>
            <div className="stat-label">Water Contact Angle (Maximum Beading)</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon"><ShieldCheck size={20} /></div>
            <div className="stat-value">9H Hardness</div>
            <div className="stat-label">Scratch & Swirl Mark Resistance</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon"><Sparkles size={20} /></div>
            <div className="stat-value">+35%</div>
            <div className="stat-label">Optical Depth & Mirror Gloss Reflection</div>
          </div>
        </div>
      </div>
    </div>
  );
};
