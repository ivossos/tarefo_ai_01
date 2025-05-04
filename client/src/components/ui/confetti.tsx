import React from "react";

interface ConfettiProps {
  active?: boolean;
  duration?: number;
}

// Simplificando o componente para evitar problemas com tsparticles
export function Confetti({ active = false, duration = 3000 }: ConfettiProps) {
  // Por enquanto, retornamos um componente vazio enquanto resolvemos o problema com a biblioteca
  return null;
}