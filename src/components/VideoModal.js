import React, { useState } from 'react';
import { X, Sparkles, CheckCircle2, ShieldCheck, Droplets } from 'lucide-react';
import { publicAsset } from '../utils/publicAsset';

export const VideoModal = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState('foam');

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="video-modal-box" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose} aria-label="Close modal">
          <X size={20} />
        </button>

        <div className="video-modal-header">
          <div className="modal-badge"><Sparkles size={14} /> 4K Ultra-HD Detailing Experience</div>
          <h3 className="video-modal-title">Watch The Artisanal Wash & Ceramic Application</h3>
          <p className="video-modal-sub">
            Witness how we treat exotic finishes with zero abrasives, touchless active foam, and certified 9H ceramic matrix coatings.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="video-tabs">
          <button
            className={`video-tab-btn ${activeTab === 'foam' ? 'active' : ''}`}
            onClick={() => setActiveTab('foam')}
          >
            <Droplets size={14} /> Active Snow Foam Wash
          </button>
          <button
            className={`video-tab-btn ${activeTab === 'interior' ? 'active' : ''}`}
            onClick={() => setActiveTab('interior')}
          >
            <Sparkles size={14} /> Cockpit Detailing
          </button>
          <button
            className={`video-tab-btn ${activeTab === 'finish' ? 'active' : ''}`}
            onClick={() => setActiveTab('finish')}
          >
            <ShieldCheck size={14} /> Ceramic Inspection
          </button>
        </div>

        {/* Media Preview Box */}
        <div className="video-media-stage">
          {activeTab === 'foam' && (
            <div className="media-stage-content">
              <img src={publicAsset('/images/foam_wash.jpg')} alt="Active Foam Wash" className="stage-image" />
              <div className="media-overlay-badge">
                <span className="live-dot"></span> 4K Studio Wash Bay #1
              </div>
              <div className="media-caption">
                <h4>pH-Neutral Cherry Snow Foam Bath</h4>
                <p>High-density foam encapsulates road grit, lifting it away without swirl marks.</p>
              </div>
            </div>
          )}

          {activeTab === 'interior' && (
            <div className="media-stage-content">
              <img src={publicAsset('/images/interior_detail.jpg')} alt="Interior Detailing" className="stage-image" />
              <div className="media-overlay-badge">
                <span className="live-dot"></span> Swissvax Leather Treatment
              </div>
              <div className="media-caption">
                <h4>Dry Vapor Steam & Nappa Leather Revival</h4>
                <p>Antibacterial deep extraction, carbon fiber UV shield, and matte natural finish.</p>
              </div>
            </div>
          )}

          {activeTab === 'finish' && (
            <div className="media-stage-content">
              <img src={publicAsset('/images/mahindra_thar.jpg')} alt="Finished Ceramic Coat" className="stage-image" />
              <div className="media-overlay-badge">
                <span className="live-dot"></span> Final Inspection Complete
              </div>
              <div className="media-caption">
                <h4>Mirror Optical Depth & Hydrophobic Barrier</h4>
                <p>3-Year Graphene Ceramic matrix with extreme water and dust repellency.</p>
              </div>
            </div>
          )}
        </div>

        <div className="video-modal-footer">
          <div className="feature-badges-row">
            <span><CheckCircle2 size={14} /> Touchless High-Pressure Deionized Water</span>
            <span><CheckCircle2 size={14} /> Swirl-Free Guarantee</span>
            <span><CheckCircle2 size={14} /> Air-Filtered Blow Dry</span>
          </div>
        </div>
      </div>
    </div>
  );
};
