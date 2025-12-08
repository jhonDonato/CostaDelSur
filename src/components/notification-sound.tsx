"use client";

import { useEffect, useRef } from 'react';
import * as Tone from 'tone';

const NotificationSound = ({ play }: { play: boolean }) => {
  const synth = useRef<Tone.Synth | null>(null);

  useEffect(() => {
    synth.current = new Tone.Synth().toDestination();
  }, []);

  useEffect(() => {
    if (play) {
      Tone.start().then(() => {
        synth.current?.triggerAttackRelease("C5", "8n");
      });
    }
  }, [play]);

  return null;
};

export default NotificationSound;
