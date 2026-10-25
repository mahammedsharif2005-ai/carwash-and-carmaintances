import React, { useState } from 'react';
import { CheckCircle, Gauge, ArrowRight } from 'lucide-react';

export const MaintenanceSchedule = ({ onBookService }) => {
  const [mileage, setMileage] = useState(20000);
  const [selectedTasks, setSelectedTasks] = useState([1, 2, 3]);

  const tasks = [
    { id: 1, name: 'Castrol / Motul 100% Synthetic Engine Oil & OEM Filter', interval: 'Every 10,000 km', price: 2450, status: 'recommended' },
    { id: 2, name: 'Brembo / Bosch Brake Fluid Moisture Test & Bleed', interval: 'Every 20,000 km', price: 1200, status: 'recommended' },
    { id: 3, name: 'Ceramic Booster & Monsoon Road Grime Decontamination', interval: 'Every 6 Months', price: 1450, status: 'recommended' },
    { id: 4, name: 'Cabin HEPA Pollen Air Filter & Disinfection Foam Flush', interval: 'Every 15,000 km', price: 850, status: 'optional' },
    { id: 5, name: '3D Laser 4-Wheel Alignment & Road-Force Balancing', interval: 'Every 10,000 km', price: 1100, status: 'optional' },
    { id: 6, name: 'Automatic / Manual Transmission & Differential Fluid Flush', interval: 'Every 40,000 km', price: 3200, status: 'upcoming' },
  ];

  const toggleTask = (id) => {
    if (selectedTasks.includes(id)) {
      setSelectedTasks(selectedTasks.filter((t) => t !== id));
    } else {
      setSelectedTasks([...selectedTasks, id]);
    }
  };

  const totalEstimate = selectedTasks.reduce((acc, id) => {
    const item = tasks.find((t) => t.id === id);
    return acc + (item ? item.price : 0);
  }, 0);

  return (
    <section className="maintenance-section" id="maintenance">
      <div className="section-head-center">
        <div className="section-mini-tag">
          <Gauge size={13} /> Preventative Engineering
        </div>
        <h2 className="section-heading-lg">Precision Maintenance & Diagnostics</h2>
        <p className="section-subtext">
          Keep your vehicle running with optimum fuel efficiency and peak reliability tailored for Indian road and climate conditions.
        </p>
      </div>

      <div className="maintenance-interactive-card">
        {/* Mileage Selector */}
        <div className="mileage-controller">
          <div className="mileage-info">
            <span className="mileage-label">Current Vehicle Odometer:</span>
            <span className="mileage-display">{Number(mileage).toLocaleString('en-IN')} KM</span>
          </div>
          <input
            type="range"
            min="5000"
            max="100000"
            step="5000"
            value={mileage}
            onChange={(e) => setMileage(e.target.value)}
            className="mileage-range-slider"
            aria-label="Vehicle Mileage Slider"
          />
          <div className="mileage-markers">
            <span>5k km</span>
            <span>20k km (Major A)</span>
            <span>40k km (Major B)</span>
            <span>60k km (Comprehensive)</span>
            <span>100k km (Milestone)</span>
          </div>
        </div>

        {/* Task Checklist */}
        <div className="tasks-grid">
          {tasks.map((task) => {
            const isChecked = selectedTasks.includes(task.id);
            return (
              <div
                key={task.id}
                className={`task-row ${isChecked ? 'task-selected' : ''}`}
                onClick={() => toggleTask(task.id)}
              >
                <div className="task-checkbox">
                  {isChecked ? <CheckCircle size={18} color="#000" /> : <div className="empty-box" />}
                </div>
                <div className="task-details">
                  <div className="task-title-wrap">
                    <span className="task-name">{task.name}</span>
                    <span className="task-interval">{task.interval}</span>
                  </div>
                </div>
                <div className="task-price-col">
                  <span className="task-price">₹{task.price.toLocaleString('en-IN')}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Action Bar */}
        <div className="maintenance-action-footer">
          <div className="estimate-block">
            <span className="estimate-label">Total Selected Services ({selectedTasks.length} items):</span>
            <span className="estimate-amount">₹{totalEstimate.toLocaleString('en-IN')}</span>
          </div>
          <button
            className="primary-pill-btn"
            onClick={() => onBookService()}
          >
            Schedule Service Bay <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </section>
  );
};
