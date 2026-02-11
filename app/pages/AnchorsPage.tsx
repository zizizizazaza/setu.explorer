import React from 'react';
import { ListView } from '../components/ListView';

interface AnchorsPageProps {
  onNavigate: (p: string, id?: string) => void;
}

export const AnchorsPage = ({ onNavigate }: AnchorsPageProps) => (
  <ListView title="Anchors" type="anchors" onNavigate={onNavigate} />
);
