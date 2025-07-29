import React from 'react';
import StatsCards from './admin-dashboard/StatsCards';
import DoctorForm from './DoctorForm';

function Main({ doctors, onAddDoctor }) {
  return (
    <div>
      <StatsCards doctors={doctors} />
      <DoctorForm onAddDoctor={onAddDoctor} />
    </div>
  );
}

export default Main;

