import React from 'react';
import { ListView } from '../components/ListView';

interface EventsPageProps {
  onNavigate: (p: string, id?: string) => void;
}

export const EventsPage = ({ onNavigate }: EventsPageProps) => (
  <ListView title="Events" type="events" onNavigate={onNavigate} />
);
