// SimulationPage removed — redirects to Network Dashboard
import React from 'react';
import { Navigate } from 'react-router-dom';

export const SimulationPage: React.FC = () => <Navigate to="/admin/overview" replace />;
